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