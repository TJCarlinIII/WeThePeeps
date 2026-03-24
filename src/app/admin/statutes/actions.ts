"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

export async function saveStatute(formData: FormData) {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  const citation = formData.get("citation") as string;
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;

  try {
    await env.DB.prepare(`
      INSERT INTO statutes (citation, title, category, description)
      VALUES (?, ?, ?, ?)
    `).bind(citation, title, category, description).run();

    revalidatePath("/codex");
    return { success: true };
  } catch (error) {
    console.error("D1_STATUTE_ERROR:", error);
    return { success: false, error: "Failed to log statute." };
  }
}

export async function getIncidentStats() {
  const context = await getCloudflareContext();
  const env = context.env as unknown as { DB: D1Database };

  const stats = await env.DB.prepare(`
    SELECT 
      SUM(CASE WHEN is_critical = 1 THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      COUNT(*) as total
    FROM incidents
  `).first();

  return {
    critical: (stats?.critical as number) || 0,
    pending: (stats?.pending as number) || 0,
    total: (stats?.total as number) || 0
  };
}