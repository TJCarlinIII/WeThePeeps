import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Interface to match your Cloudflare Environment
 */
interface Env {
  DB: D1Database;
}

/**
 * Universal getter for the D1 Database instance.
 * This works in both Route Handlers and Server Actions.
 */
export async function getDB(): Promise<D1Database> {
  try {
    const context = await getCloudflareContext({ async: true });
    const db = (context.env as unknown as Env).DB;

    if (!db) {
      throw new Error("D1_BINDING_MISSING: Ensure 'DB' is bound in wrangler.toml");
    }

    return db;
  } catch (error) {
    console.error("DATABASE_CONTEXT_ERROR:", error);
    throw new Error("Could not connect to the database context.");
  }
}