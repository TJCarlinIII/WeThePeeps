// src/lib/wtp-db.ts
// ============================================================================
// WETHEPEEPS-V2: EXPLICIT DATABASE CLIENT
// Purpose: Clean, isolated access to the new join-table schema
// ============================================================================

import { getCloudflareContext } from "@opennextjs/cloudflare";

interface WtpEnv {
  NEW_DB: D1Database; // Only the new database binding
}

/**
 * Explicit getter for the NEW_DB instance.
 * No auto-routing, no legacy fallback—just the new schema.
 */
export async function getWtpDB(): Promise<D1Database> {
  console.log("--- ATTEMPTING CONNECTION TO NEW_DB (V2) ---");
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as WtpEnv;

    if (!env.NEW_DB) {
      throw new Error(
        "NEW_DB_BINDING_MISSING: Check wrangler.toml and ensure 'wethepeeps-v2' is deployed"
      );
    }

    return env.NEW_DB;
  } catch (error) {
    console.error("WTP_DB_CONNECTION_ERROR:", error);
    // Throw the actual error so you can see the real issue in logs
    throw error;
  }
}

/**
 * Helper: Execute a query against the new database
 */
export async function queryWtp<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<{ results: T[] }> {
  const db = await getWtpDB();
  return await db.prepare(sql).bind(...params).all<T>();
}

/**
 * Helper: Batch execute statements against the new database
 */
export async function batchWtp(statements: D1PreparedStatement[]) {
  const db = await getWtpDB();
  return await db.batch(statements);
}