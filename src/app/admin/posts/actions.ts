// File: src/app/admin/posts/actions.ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

interface Env { DB: D1Database; }

export async function getBlogPosts() {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as Env;
    
    // Ordered by ID DESC because Posts table does not have created_at
    const { results } = await env.DB.prepare(
      "SELECT * FROM posts ORDER BY id DESC"
    ).all();
    return { success: true, data: results as Record<string, unknown>[] };
  } catch (error) {
    console.error("GET_POSTS_ERROR:", error);
    return { success: false, error: "Failed to retrieve post manifest." };
  }
}

export async function deleteBlogPost(id: number) {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as Env;
    await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("DELETE_POST_ERROR:", error);
    return { success: false, error: "Failed to purge record from D1." };
  }
}

export async function savePost(formData: FormData) {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as Env;

    const id = formData.get("id") ? Number(formData.get("id")) : null;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const is_featured = formData.get("is_featured") === "1" ? 1 : 0;
    const seo_description = formData.get("seo_description") as string;
    const seo_keywords = formData.get("seo_keywords") as string;

    if (id) {
       await env.DB.prepare(`
        UPDATE posts SET title=?, slug=?, category=?, summary=?, content=?, is_featured=?, seo_description=?, seo_keywords=? WHERE id=?
       `).bind(title, slug, category, summary, content, is_featured, seo_description || null, seo_keywords || null, id).run();
    } else {
       await env.DB.prepare(`
        INSERT INTO posts (title, slug, category, summary, content, is_featured, seo_description, seo_keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       `).bind(title, slug, category, summary, content, is_featured, seo_description || null, seo_keywords || null).run();
    }

    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("SAVE_POST_ERROR:", error);
    return { success: false, error: "Failed to save entry." };
  }
}