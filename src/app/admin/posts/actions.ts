"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

interface Env { DB: D1Database; }

/**
 * Utility to get the D1 Database instance from Cloudflare Context
 */
async function getDB() {
  const context = await getCloudflareContext({ async: true });
  return (context.env as unknown as Env).DB;
}

export async function getBlogPosts() {
  try {
    const db = await getDB();
    // Only select the columns needed for the list view to save on egress/memory
    const { results } = await db.prepare(
      "SELECT id, title, slug, category, summary, is_featured FROM posts ORDER BY id DESC"
    ).all();
    
    return { success: true, data: results };
  } catch (error) {
    console.error("GET_POSTS_ERROR:", error);
    return { success: false, error: "Failed to retrieve post manifest." };
  }
}

export async function deleteBlogPost(id: number) {
  try {
    const db = await getDB();
    await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    
    // Batch revalidation
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error) {
    console.error("DELETE_POST_ERROR:", error);
    return { success: false, error: "Failed to purge record." };
  }
}

export async function savePost(formData: FormData) {
  try {
    const db = await getDB();

    const id = formData.get("id") ? Number(formData.get("id")) : null;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const is_featured = formData.get("is_featured") === "1" ? 1 : 0;
    const seo_description = (formData.get("seo_description") as string) || null;
    const seo_keywords = (formData.get("seo_keywords") as string) || null;

    if (id) {
      await db.prepare(`
        UPDATE posts SET 
          title=?, slug=?, category=?, summary=?, content=?, 
          is_featured=?, seo_description=?, seo_keywords=? 
        WHERE id=?
      `).bind(
        title, slug, category, summary, content, 
        is_featured, seo_description, seo_keywords, id
      ).run();
    } else {
      await db.prepare(`
        INSERT INTO posts (title, slug, category, summary, content, is_featured, seo_description, seo_keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        title, slug, category, summary, content, 
        is_featured, seo_description, seo_keywords
      ).run();
    }

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error) {
    console.error("SAVE_POST_ERROR:", error);
    return { success: false, error: "Critical_Failure: Database rejection." };
  }
}