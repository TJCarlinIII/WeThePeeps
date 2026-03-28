"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

export async function saveActor(formData: FormData) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  const entity_id = formData.get("entity_id") as string;
  const status = formData.get("status") as string;
  const slug = formData.get("slug") as string;
  const bio = formData.get("bio") as string;
  const seo_description = formData.get("seo_description") as string;
  const seo_keywords = formData.get("seo_keywords") as string;

  try {
    if (id && id !== "") {
      await db.prepare(`
        UPDATE actors 
        SET full_name = ?, job_title = ?, entity_id = ?, status = ?, slug = ?, 
            bio = ?, seo_description = ?, seo_keywords = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(name, title, entity_id, status, slug, bio, seo_description, seo_keywords, id).run();
    } else {
      await db.prepare(`
        INSERT INTO actors (full_name, job_title, entity_id, status, slug, bio, seo_description, seo_keywords) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(name, title, entity_id, status, slug, bio, seo_description, seo_keywords).run();
    }

    revalidatePath("/admin/actors");
    revalidatePath(`/actors/${slug}`);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to save actor record.");
  }
}

export async function deleteActor(id: string) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  try {
    await db.prepare("DELETE FROM actors WHERE id = ?").bind(id).run();
    revalidatePath("/admin/actors");
  } catch (error) {
    console.error("Delete Error:", error);
    throw new Error("Failed to delete actor.");
  }
}