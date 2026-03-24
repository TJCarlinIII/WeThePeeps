"use server";

import { EvidenceRecord } from "@/types";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

interface Env {
  DB: D1Database;
  ADMIN_PASSPHRASE: string;
}

interface ActionResponse {
  success: boolean;
  data?: Record<string, unknown>[];
  error?: string;
  newStatus?: number;
}

export async function authenticateAdmin(passphrase: string) {
  const correctPassphrase = process.env.ADMIN_PASSPHRASE;
  if (passphrase === correctPassphrase) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });
    return { success: true };
  }
  return { success: false, error: "Invalid Credentials" };
}

export async function getEvidenceRecords(): Promise<ActionResponse> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as Env).DB;
    const { results } = await db
      .prepare("SELECT * FROM evidence ORDER BY created_at DESC")
      .all();
    return { success: true, data: results };
  } catch (error) {
    console.error("D1_FETCH_ERROR:", error);
    return { success: false, error: "Failed to retrieve records" };
  }
}

export async function toggleEvidenceCritical(
  id: number,
  currentStatus: number
): Promise<ActionResponse> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as Env).DB;
    const newStatus = currentStatus === 1 ? 0 : 1;
    await db
      .prepare("UPDATE evidence SET isCritical = ? WHERE id = ?")
      .bind(newStatus, id)
      .run();
    return { success: true, newStatus };
  } catch (error) {
    console.error("D1_UPDATE_ERROR:", error);
    return { success: false, error: "Failed to update record priority" };
  }
}

export async function deleteEvidenceRecord(id: number): Promise<ActionResponse> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as Env).DB;
    await db.prepare("DELETE FROM evidence WHERE id = ?").bind(id).run();
    return { success: true };
  } catch (error) {
    console.error("D1_DELETE_ERROR:", error);
    return { success: false, error: "Failed to purge record from database" };
  }
}

export async function getPublicEvidence(id: string): Promise<EvidenceRecord | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as Env).DB;
    const result = await db
      .prepare("SELECT * FROM evidence WHERE id = ?")
      .bind(id)
      .first<EvidenceRecord>();
    return result;
  } catch (error) {
    console.error("D1_PUBLIC_FETCH_ERROR:", error);
    return null;
  }
}

export async function getHierarchy() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as Env).DB;
    const { results } = await db
      .prepare(
        "SELECT name, branch, department FROM official_profiles ORDER BY branch DESC, rank_order ASC"
      )
      .all();
    return results;
  } catch (error) {
    console.error("D1_HIERARCHY_ERROR:", error);
    return [];
  }
}

export async function getBlogPosts(): Promise<ActionResponse> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as { DB: D1Database };

    const { results } = await env.DB.prepare(
      "SELECT * FROM posts ORDER BY created_at DESC"
    ).all();

    return { success: true, data: results as Record<string, unknown>[] };
  } catch (error) {
    console.error("D1_FETCH_ERROR:", error);
    return { success: false, error: "Failed to retrieve post manifest." };
  }
}

export async function deleteBlogPost(id: number): Promise<ActionResponse> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as { DB: D1Database };

    await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();

    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("D1_PURGE_ERROR:", error);
    return { success: false, error: "Failed to purge record from D1." };
  }
}

export async function savePost(formData: FormData): Promise<ActionResponse> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as { DB: D1Database };

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const is_featured = formData.get("is_featured") === "1" ? 1 : 0;

    await env.DB.prepare(`
      INSERT INTO posts (title, slug, category, summary, content, is_featured, published_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(title, slug, category, summary, content, is_featured).run();

    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("DB Error:", error);
    return { success: false, error: "Failed to save entry." };
  }
}