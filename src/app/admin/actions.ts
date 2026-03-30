// src/app/admin/actions.ts
"use server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { TABLE_SCHEMAS } from "@/lib/schemas";

interface Env {
  DB: D1Database;
}

// ✅ Typed return interfaces for all server actions
export interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface GetRecordsResult extends ActionResult {
  data?: Record<string, unknown>[];
}

/**
 * AUTHENTICATION: Admin Verification
 * Used by AuthContext to verify the session.
 */
export async function authenticateAdmin(): Promise<{ success: boolean; user?: { role: string } }> {
  try {
    await getCloudflareContext({ async: true });
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
async function getDB(): Promise<D1Database> {
  const context = await getCloudflareContext({ async: true });
  return (context.env as unknown as Env).DB;
}

/**
 * ARCHITECT_VIEW: Dynamic Handlers
 * These allow ArchitectView to handle multiple tables dynamically by passing the table name.
 */

// ✅ Properly typed GET: returns { success, data: Record[] }
export async function getRecords(table: string): Promise<GetRecordsResult> {
  try {
    const db = await getDB();
    
    // Safety check: ensure we only query allowed tables
    const allowedTables = ['incidents', 'rebuttals', 'cases', 'media', 'entities', 'actors', 'sectors', 'statutes'];
    if (!allowedTables.includes(table)) {
      throw new Error("UNAUTHORIZED_TABLE_ACCESS");
    }
    
    const { results } = await db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
    
    return {
      success: true,
      data: results as Record<string, unknown>[]
    };
  } catch (error) {
    console.error("GET_RECORDS_ERROR:", error);
    return { 
      success: false, 
      error: "Failed to retrieve manifest.", 
      data: [] 
    };
  }
}

// ✅ Properly typed DELETE: returns { success, error? }
export async function deleteRecord(table: string, id: number): Promise<ActionResult> {
  try {
    const db = await getDB();
    
    // Safety check
    const allowedTables = ['incidents', 'rebuttals', 'cases', 'media', 'entities', 'actors', 'sectors', 'statutes'];
    if (!allowedTables.includes(table)) {
      throw new Error("UNAUTHORIZED_TABLE_ACCESS");
    }
    
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

// ✅ Dynamic SAVE: Uses TABLE_SCHEMAS to build queries automatically
export async function saveRecord(formData: FormData): Promise<ActionResult> {
  try {
    const db = await getDB();
    const table = formData.get("table_name") as string;
    const id = formData.get("id") ? Number(formData.get("id")) : null;
    
    // Safety check: ensure table is allowed
    const allowedTables = ['incidents', 'rebuttals', 'cases', 'media', 'entities', 'actors', 'sectors', 'statutes'];
    if (!allowedTables.includes(table)) {
      throw new Error("UNAUTHORIZED_TABLE_ACCESS");
    }
    
    // Get schema for this table
    const schema = TABLE_SCHEMAS[table];
    if (!schema) {
      throw new Error(`SCHEMA_NOT_FOUND: ${table}`);
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const updatePlaceholders: string[] = [];

    // Dynamically build the SQL query based on your schema definitions
    schema.forEach(field => {
      let val: string | number | null = formData.get(field.name) as string;
      
      // Handle empty values as NULL
      if (val === undefined || val === null || val === '') {
        val = null;
      } 
      // Convert numbers and relations to numbers
      else if (field.type === 'number' || field.type === 'relation') {
        val = Number(val);
      } 
      // Convert booleans to 1/0 for SQLite/D1 compatibility
      else if (field.type === 'boolean') {
        val = (val === 'true' || val === '1') ? 1 : 0;
      }
      // Keep text/textarea/select as strings

      fields.push(field.name);
      values.push(val);
      updatePlaceholders.push(`${field.name} = ?`);
    });

    if (id) {
      // UPDATE existing record
      await db.prepare(`UPDATE ${table} SET ${updatePlaceholders.join(', ')} WHERE id = ?`)
        .bind(...values, id).run();
    } else {
      // INSERT new record
      const insertPlaceholders = fields.map(() => '?').join(', ');
      await db.prepare(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${insertPlaceholders})`)
        .bind(...values).run();
    }
    
    revalidatePath(`/admin/${table}`);
    
    // Special revalidation for media table
    if (table === 'media') {
      revalidatePath("/admin/posts");
      revalidatePath("/evidence");
    }
    
    return { success: true };
  } catch (error) {
    console.error(`SAVE_RECORD_ERROR [${formData.get("table_name")}]:`, error);
    return { success: false, error: "Database_Rejection" };
  }
}

/**
 * TAXONOMY: Management
 */
export async function saveTaxonomyTerm(formData: FormData): Promise<ActionResult> {
  try {
    const db = await getDB();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string;
    
    await db.prepare(
      "INSERT INTO taxonomy_definitions (name, slug, type) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name"
    ).bind(name, slug, type).run();
    
    revalidatePath("/admin/taxonomy");
    return { success: true };
  } catch (error) {
    console.error("SAVE_TAXONOMY_ERROR:", error);
    return { success: false };
  }
}

export async function deleteTaxonomyTerm(id: number): Promise<ActionResult> {
  try {
    const db = await getDB();
    await db.prepare("DELETE FROM taxonomy_definitions WHERE id = ?").bind(id).run();
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