// src/lib/db.ts
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Interface to match your Cloudflare Environment with dual D1 bindings
 */
interface Env {
  DB: D1Database;      // Legacy: wethepeeps (read-only during migration)
  NEW_DB: D1Database;  // New: wethepeeps-v2 (write-enabled, join-table schema)
}

/**
 * Database routing strategy enum
 */
export enum DBTarget {
  LEGACY = "legacy",   // Read from old schema (wethepeeps)
  NEW = "new",         // Read/write new schema (wethepeeps-v2)
  AUTO = "auto",       // Auto-route based on table/feature flags
}

/**
 * Configuration for which tables live in which database during migration
 * Update this map as you migrate tables one-by-one
 */
const TABLE_ROUTING: Record<string, DBTarget> = {
  // ── Tables already migrated to NEW_DB (wethepeeps-v2) ──
  incident_participants: DBTarget.NEW,
  incident_evidence: DBTarget.NEW,
  incident_statutes: DBTarget.NEW,
  records_requests: DBTarget.NEW,
  
  // ── Tables still in LEGACY DB (wethepeeps) ──
  incidents: DBTarget.LEGACY,
  actors: DBTarget.LEGACY,
  entities: DBTarget.LEGACY,
  statutes: DBTarget.LEGACY,
  sectors: DBTarget.LEGACY,
  evidence: DBTarget.LEGACY,
  media: DBTarget.LEGACY,
  posts: DBTarget.LEGACY,
  rebuttals: DBTarget.LEGACY,
  connections: DBTarget.LEGACY,
  record_taxonomy: DBTarget.LEGACY,
  taxonomy_definitions: DBTarget.LEGACY,
  
  // ── Add new tables here as you create them ──
};

/**
 * Universal getter for the D1 Database instance.
 * Supports dual-database routing during migration.
 * 
 * @param target - Which database to use (defaults to AUTO routing)
 * @param tableName - Optional table name for AUTO routing logic
 */
export async function getDB(
  target: DBTarget = DBTarget.AUTO,
  tableName?: string
): Promise<D1Database> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Env;

    // Validate bindings exist
    if (!env.DB) {
      throw new Error("D1_BINDING_MISSING: Legacy 'DB' not bound in wrangler.toml");
    }
    if (!env.NEW_DB) {
      throw new Error("D1_BINDING_MISSING: New 'NEW_DB' not bound in wrangler.toml");
    }

    // If explicit target requested, return it
    if (target !== DBTarget.AUTO) {
      return target === DBTarget.NEW ? env.NEW_DB : env.DB;
    }

    // AUTO routing: decide based on table name
    if (tableName && TABLE_ROUTING[tableName]) {
      return TABLE_ROUTING[tableName] === DBTarget.NEW ? env.NEW_DB : env.DB;
    }

    // Default fallback: legacy DB for backward compatibility
    return env.DB;
  } catch (error) {
    console.error("DATABASE_CONTEXT_ERROR:", error);
    throw new Error("Could not connect to the database context.");
  }
}

/**
 * Helper: Execute a query against a specific database by name
 * Useful for migration scripts or admin tools that need explicit control
 */
export async function queryDB<T = unknown>(
  sql: string,
  params: unknown[] = [],
  target: DBTarget = DBTarget.LEGACY
): Promise<{ results: T[] }> {
  const db = await getDB(target);
  return await db.prepare(sql).bind(...params).all<T>();
}

/**
 * Helper: Batch execute statements against a specific database
 */
export async function batchDB(
  statements: D1PreparedStatement[],
  target: DBTarget = DBTarget.LEGACY
) {
  const db = await getDB(target);
  return await db.batch(statements);
}