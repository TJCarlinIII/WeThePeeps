"use server";

import { EvidenceRecord } from "@/types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface Env {
  DB: D1Database;
  ADMIN_PASSPHRASE: string;
}

// ============================================================================
// SHARED INTERFACES
// ============================================================================
export interface TaxonomyTerm {
  id?: number;
  name: string;
  slug: string;
  type: 'category' | 'tag';
  seo_description: string;
  seo_keywords: string | null;
}

export interface Sector {
  id?: number;
  name: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================
export async function authenticateAdmin(passphrase: string) {
  const correctPassphrase = process.env.ADMIN_PASSPHRASE;

  if (passphrase === correctPassphrase) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return { success: true };
  }

  return { success: false, error: "Invalid Credentials" };
}

// ============================================================================
// INCIDENT MANAGEMENT
// ============================================================================
export async function saveIncident(formData: FormData) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  // Extract form values
  const title = formData.get('title');
  const slug = formData.get('slug'); // Added slug as it's required in your schema
  const actor_id = formData.get('actor_id');
  const entity_id = formData.get('entity_id');
  const statute_id = formData.get('statute_id');
  const description = formData.get('description');
  const tags = formData.get('tags') as string; 
  const is_critical = formData.get('is_critical') === 'on' || formData.get('is_critical') === '1' ? 1 : 0;
  const event_date = formData.get('event_date');

  try {
    // 1. Insert into main incidents table
    const result = await db.prepare(`
      INSERT INTO incidents (title, slug, actor_id, entity_id, statute_id, description, is_critical, event_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `).bind(title, slug, actor_id, entity_id, statute_id, description, is_critical, event_date).first<{ id: number }>();

    if (!result?.id) throw new Error("Failed to retrieve new Incident ID");

    const incidentId = result.id;

    // 2. Link the Primary Statute in record_taxonomy if it exists
    if (statute_id) {
      await db.prepare(`
        INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value)
        VALUES (?, 'incident', 'statute', ?)
      `).bind(incidentId, statute_id).run();
    }

    // 3. Process Tags (Split comma-separated string and link)
    if (tags) {
      const tagArray = tags.split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t !== "");

      for (const tag of tagArray) {
        // We use taxonomy_value to store the tag slug
        await db.prepare(`
          INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value)
          VALUES (?, 'incident', 'tag', ?)
        `).bind(incidentId, tag).run();
      }
    }

    // 4. Update Cache
    revalidatePath('/evidence');
    revalidatePath('/admin/incidents');
    revalidatePath(`/evidence/${incidentId}`);

    return { success: true, id: incidentId };
  } catch (error) {
    console.error("D1_SAVE_ERROR:", error);
    return { success: false, error: "Failed to save record to the database." };
  }
}

export async function toggleEvidenceCritical(id: number, currentStatus: number) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  const newStatus = currentStatus === 1 ? 0 : 1;

  try {
    await db
      .prepare("UPDATE incidents SET is_critical = ? WHERE id = ?")
      .bind(newStatus, id)
      .run();
    
    revalidatePath('/evidence');
    return { success: true, newStatus };
  } catch (error) {
    console.error("D1_UPDATE_ERROR:", error);
    return { success: false, error: "Failed to update record priority" };
  }
}

// ============================================================================
// INCIDENT MANAGEMENT - DELETE LOGIC
// ============================================================================

/**
 * Purges an incident and all its associated metadata (taxonomy links, media refs).
 */
export async function deleteIncident(id: number) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    // Single trip to D1 to wipe all related records
    await db.batch([
      db.prepare("DELETE FROM incidents WHERE id = ?").bind(id),
      db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'incident'").bind(id),
      db.prepare("DELETE FROM media WHERE incident_id = ?").bind(id)
    ]);

    revalidatePath('/evidence');
    revalidatePath('/admin/incidents');
    revalidatePath(`/evidence/${id}`);

    return { success: true };
  } catch (error) {
    console.error("D1_DELETE_ERROR:", error);
    return { success: false, error: "Failed to purge record and associated metadata" };
  }
}

// ============================================================================
// INCIDENT MANAGEMENT - GET INCIDENT LOGIC
// ============================================================================
/**
 * Fetches all taxonomy terms (categories, tags, statutes) linked to a specific incident.
 * This joins record_taxonomy with taxonomy_definitions to get the actual names/slugs.
 */
export async function getIncidentTaxonomy(incidentId: number) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db
      .prepare(`
        SELECT 
          td.id,
          td.name,
          td.slug,
          td.type,
          rt.taxonomy_type as link_type
        FROM record_taxonomy rt
        JOIN taxonomy_definitions td ON rt.taxonomy_value = CAST(td.id AS TEXT) 
           OR rt.taxonomy_value = td.slug
        WHERE rt.parent_id = ? AND rt.parent_type = 'incident'
      `)
      .bind(incidentId)
      .all<{ id: number; name: string; slug: string; type: string; link_type: string }>();

    return results || [];
  } catch (error) {
    console.error("D1_TAXONOMY_FETCH_ERROR:", error);
    return [];
  }
}

// ALIAS EXPORT: Resolves the build warning for missing deleteEvidenceRecord
export { deleteIncident as deleteEvidenceRecord };

export async function getEvidenceRecords() {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB; 

  try {
    const { results } = await db
      .prepare("SELECT * FROM incidents ORDER BY event_date DESC")
      .all();
    return { success: true, data: results };
  } catch (error) {
    console.error("D1_FETCH_ERROR:", error);
    return { success: false, error: "Failed to retrieve records" };
  }
}

export async function getPublicEvidence(id: string) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    // We join the related tables to get Names and Titles instead of just IDs
    const result = await db
      .prepare(`
        SELECT 
          i.*,
          a.full_name as actor_name,
          e.name as entity_name,
          s.title as statute_title,
          s.citation as statute_citation
        FROM incidents i
        LEFT JOIN actors a ON i.actor_id = a.id
        LEFT JOIN entities e ON i.entity_id = e.id
        LEFT JOIN statutes s ON i.statute_id = s.id
        WHERE i.id = ? OR i.slug = ?
      `)
      .bind(id, id) // Supports looking up by numeric ID or URL Slug
      .first<EvidenceRecord & { 
        actor_name?: string; 
        entity_name?: string; 
        statute_title?: string; 
        statute_citation?: string; 
      }>();

    return result || null;
  } catch (error) {
    console.error("D1_PUBLIC_FETCH_ERROR:", error);
    return null;
  }
}

export async function getHierarchy() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as Env).DB;

    const { results } = await db.prepare(
      "SELECT name, branch, department FROM official_profiles ORDER BY branch DESC, rank_order ASC"
    ).all();
    
    return results;
  } catch (error) {
    console.error("D1_HIERARCHY_ERROR:", error);
    return [];
  }
}

// ============================================================================
// TAXONOMY MANAGEMENT
// ============================================================================
export async function getTaxonomyTerms(): Promise<TaxonomyTerm[]> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db.prepare(
      "SELECT * FROM taxonomy_definitions ORDER BY type DESC, name ASC"
    ).all<TaxonomyTerm>();
    return results;
  } catch (error) {
    console.error("D1_TAXONOMY_FETCH_ERROR:", error);
    return [];
  }
}

export async function saveTaxonomyTerm(formData: FormData) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const env = ctx.env as unknown as Env;
  const db = env.DB;

  const id = formData.get('id');
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const type = formData.get('type') as 'category' | 'tag';
  const seo_description = formData.get('seo_description') || null;
  const seo_keywords = formData.get('seo_keywords') || null;

  try {
    if (id) {
      await db.prepare(`
        UPDATE taxonomy_definitions 
        SET name = ?, slug = ?, type = ?, seo_description = ?, seo_keywords = ? 
        WHERE id = ?
      `).bind(name, slug, type, seo_description, seo_keywords, id).run();
    } else {
      await db.prepare(`
        INSERT INTO taxonomy_definitions (name, slug, type, seo_description, seo_keywords) 
        VALUES (?, ?, ?, ?, ?)
      `).bind(name, slug, type, seo_description, seo_keywords).run();
    }

    revalidatePath('/admin/taxonomy');
    return { success: true };
  } catch (error) {
    console.error("D1_TAXONOMY_SAVE_ERROR:", error);
    const errorMessage = error instanceof Error && error.message.includes("UNIQUE") 
      ? "Unique constraint violation: This slug or name may already exist." 
      : "Failed to save taxonomy term to the registry.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteTaxonomyTerm(id: number) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    await db.prepare("DELETE FROM taxonomy_definitions WHERE id = ?").bind(id).run();
    revalidatePath('/admin/taxonomy');
    return { success: true };
  } catch (error) {
    console.error("D1_TAXONOMY_DELETE_ERROR:", error);
    return { success: false, error: "Failed to delete taxonomy term" };
  }
}

// ============================================================================
// SECTOR MANAGEMENT
// ============================================================================
export async function getSectors(): Promise<Sector[]> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db
      .prepare("SELECT * FROM sectors ORDER BY name ASC")
      .all<Sector>();
    return results;
  } catch (error) {
    console.error("D1_SECTOR_FETCH_ERROR:", error);
    return [];
  }
}

export async function saveSector(data: Sector) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    if (data.id) {
      await db.prepare(`
        UPDATE sectors 
        SET name = ?, slug = ?, seo_description = ?, seo_keywords = ? 
        WHERE id = ?
      `).bind(data.name, data.slug, data.seo_description, data.seo_keywords, data.id).run();
    } else {
      await db.prepare(`
        INSERT INTO sectors (name, slug, seo_description, seo_keywords) 
        VALUES (?, ?, ?, ?)
      `).bind(data.name, data.slug, data.seo_description, data.seo_keywords).run();
    }

    revalidatePath('/admin/sectors');
    return { success: true };
  } catch (error) {
    console.error("D1_SECTOR_SAVE_ERROR:", error);
    const errorMessage = error instanceof Error && error.message.includes("UNIQUE")
      ? "Unique constraint violation: A sector with this name or slug already exists."
      : "Failed to save sector.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteSector(id: number) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    await db.prepare("DELETE FROM sectors WHERE id = ?").bind(id).run();
    revalidatePath('/admin/sectors');
    return { success: true };
  } catch (error) {
    console.error("D1_SECTOR_DELETE_ERROR:", error);
    return { success: false, error: "Failed to delete sector" };
  }
}/**
 * Forces a site-wide revalidation. 
 * Use this after major database migrations or schema changes.
 */
export async function revalidateAll() {
  try {
    // This tells Next.js to mark the root and all children as stale
    revalidatePath('/', 'layout');
    
    console.log("SUCCESS: Site-wide revalidation triggered.");
    return { success: true, message: "All routes marked for revalidation." };
  } catch (error) {
    console.error("REVALIDATE_ERROR:", error);
    return { success: false, error: "Failed to trigger global revalidation." };
  }
}