"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

interface Env { DB: D1Database; }

/**
 * AUTHENTICATION: Admin Verification
 * Used by AuthContext to verify the session.
 */
export async function authenticateAdmin() {
  try {
    const context = await getCloudflareContext({ async: true });
    // Add your specific logic here (checking cookies, JWT, etc.)
    return { success: true, user: { role: 'admin' } };
  } catch (error) {
    console.error("AUTH_ERROR:", error);
    return { success: false };
  }
}

/**
 * Utility to get the D1 Database instance from Cloudflare Context
 */
async function getDB() {
  const context = await getCloudflareContext({ async: true });
  return (context.env as unknown as Env).DB;
}

/**
 * ARCHITECT_VIEW: Dynamic Handlers
 * These allow ArchitectView to handle multiple tables dynamically by passing the table name.
 */
export async function getRecords(table: string) {
  try {
    const db = await getDB();
    
    // Safety check: ensure we only query allowed tables
    const allowedTables = ['incidents', 'rebuttals', 'cases', 'media'];
    if (!allowedTables.includes(table)) throw new Error("UNAUTHORIZED_TABLE_ACCESS");

    const { results } = await db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
    
    return { 
      success: true, 
      data: results as Record<string, unknown>[] 
    };
  } catch (error) {
    console.error("GET_RECORDS_ERROR:", error);
    return { success: false, error: "Failed to retrieve manifest.", data: [] };
  }
}

export async function deleteRecord(table: string, id: number) {
  try {
    const db = await getDB();
    await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
    
    revalidatePath(`/admin/${table}`);
    // If we're deleting media, we also need to clear the posts/evidence toggle view
    if (table === 'media') {
      revalidatePath("/admin/posts");
      revalidatePath("/evidence");
    }
    
    return { success: true };
  } catch (error) {
    console.error("DELETE_RECORD_ERROR:", error);
    return { success: false, error: "Purge_Request_Rejected" };
  }
}

export async function saveRecord(formData: FormData) {
  try {
    const db = await getDB();
    const table = formData.get("table_name") as string;
    const id = formData.get("id") ? Number(formData.get("id")) : null;

    // Table-specific logic for the Evidence/Media Vault
    if (table === 'media') {
      const title = formData.get("title") as string;
      const summary = formData.get("summary") as string;
      const category = formData.get("category") as string;

      if (id) {
        await db.prepare("UPDATE media SET title=?, summary=?, category=? WHERE id=?")
          .bind(title, summary, category, id).run();
      } else {
        await db.prepare("INSERT INTO media (title, summary, category) VALUES (?, ?, ?)")
          .bind(title, summary, category).run();
      }
    } 
    // Add additional table logic (incidents, cases, etc.) here as needed
    
    revalidatePath(`/admin/${table}`);
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error) {
    console.error("SAVE_RECORD_ERROR:", error);
    return { success: false, error: "Database_Rejection" };
  }
}

/**
 * TAXONOMY: Management
 */
export async function saveTaxonomyTerm(formData: FormData) {
  try {
    const db = await getDB();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string;

    await db.prepare(
      "INSERT INTO taxonomy (name, slug, type) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name"
    ).bind(name, slug, type).run();

    revalidatePath("/admin/taxonomy");
    return { success: true };
  } catch (error) {
    console.error("SAVE_TAXONOMY_ERROR:", error);
    return { success: false };
  }
}

export async function deleteTaxonomyTerm(id: number) {
  try {
    const db = await getDB();
    await db.prepare("DELETE FROM taxonomy WHERE id = ?").bind(id).run();
    revalidatePath("/admin/taxonomy");
    return { success: true };
  } catch (error) {
    console.error("DELETE_TAXONOMY_ERROR:", error);
    return { success: false };
  }
}

/**
 * NOTE: Blog Post actions (getBlogPosts, savePost, deleteBlogPost) 
 * have been migrated to src/app/admin/posts/actions.ts 
 * to maintain a single source of truth for Intelligence_Dispatch.
 */