"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

export async function saveStatute(formData: FormData) {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // Pulling all fields required by the Statute Codex
  const citation = formData.get("citation") as string;
  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const official_website_url = formData.get("official_website_url") as string;
  const slug = formData.get("slug") as string;

  try {
    await env.DB.prepare(`
      INSERT INTO statutes (citation, title, summary, official_website_url, slug)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(citation) DO UPDATE SET
        title=excluded.title,
        summary=excluded.summary,
        official_website_url=excluded.official_website_url,
        slug=excluded.slug
    `).bind(citation, title, summary, official_website_url, slug).run();

    revalidatePath("/codex");
    return { success: true };
  } catch (error) {
    console.error("D1_STATUTE_ERROR:", error);
    return { success: false, error: "Failed to log statute." };
  }
}