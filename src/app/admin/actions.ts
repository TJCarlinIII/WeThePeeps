"use server";

import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
  ADMIN_PASSPHRASE: string;
}

export async function authenticateAdmin(passphrase: string) {
  const correctPassphrase = process.env.ADMIN_PASSPHRASE;

  if (passphrase === correctPassphrase) {
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

/**
 * DASHBOARD STATS: Powers the AdminDashboardHeader cards
 */
export async function getIncidentStats() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const stats = await db.prepare(`
      SELECT 
        SUM(CASE WHEN is_critical = 1 THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        COUNT(*) as total
      FROM incidents
    `).first();

    return {
      critical: Number(stats?.critical) || 0,
      pending: Number(stats?.pending) || 0,
      total: Number(stats?.total) || 0
    };
  } catch (err) {
    console.error("STATS_FETCH_ERROR:", err);
    return { critical: 0, pending: 0, total: 0 };
  }
}

/**
 * FETCH RECORDS: Used for the Evidence management table
 */
export async function getEvidenceRecords() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB; 

  try {
    const { results } = await db
      .prepare("SELECT * FROM incidents ORDER BY event_date DESC")
      .all();
    return { success: true, data: results };
  } catch (error) {
    console.error("D1_FETCH_ERROR:", error);
    return { success: false, error: "Failed to retrieve records" };
  }
}

/**
 * DELETE RECORD: Purge an incident from D1
 */
export async function deleteEvidenceRecord(id: number) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    await db.prepare("DELETE FROM incidents WHERE id = ?").bind(id).run();
    return { success: true };
  } catch (error) {
    console.error("D1_DELETE_ERROR:", error);
    return { success: false, error: "Failed to purge record from database" };
  }
}