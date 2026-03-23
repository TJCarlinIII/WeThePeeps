"use server";

import { cookies } from "next/headers";

// EXPORT THIS so other files can see it
export interface EvidenceRecord {
  id: number;
  title: string;
  official: string;
  statute: string;
  content: string;
  isCritical: number;
  created_at: string;
}

interface Env {
  DB: D1Database;
  ADMIN_PASSPHRASE: string;
}

export async function authenticateAdmin(passphrase: string) {
  // This stays on the server and is never sent to the browser
  const correctPassphrase = process.env.ADMIN_PASSPHRASE;

  if (passphrase === correctPassphrase) {
    // Set a simple encrypted-style session cookie
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

export async function getEvidenceRecords() {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext();
  
  // Cast 'env' to our custom 'Env' interface
  const db = (ctx.env as Env).DB; 

  try {
    const { results } = await db
      .prepare("SELECT * FROM evidence ORDER BY created_at DESC")
      .all();
    return { success: true, data: results };
  } catch (error) {
    console.error("D1_FETCH_ERROR:", error);
    return { success: false, error: "Failed to retrieve records" };
  }
}

export async function toggleEvidenceCritical(id: number, currentStatus: number) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext();
  const db = (ctx.env as Env).DB;

  const newStatus = currentStatus === 1 ? 0 : 1;

  try {
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

export async function deleteEvidenceRecord(id: number) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext();
  const db = (ctx.env as Env).DB;

  try {
    await db.prepare("DELETE FROM evidence WHERE id = ?").bind(id).run();
    return { success: true };
  } catch (error) {
    console.error("D1_DELETE_ERROR:", error);
    return { success: false, error: "Failed to purge record from database" };
  }
}

export async function getPublicEvidence(id: string) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = await getCloudflareContext();
  const db = (ctx.env as Env).DB;

  try {
    const result = await db
      .prepare("SELECT * FROM evidence WHERE id = ?")
      .bind(id)
      .first<EvidenceRecord>(); // Now this will recognize EvidenceRecord
    return result;
  } catch (error) {
    console.error("D1_PUBLIC_FETCH_ERROR:", error);
    return null;
  }
}