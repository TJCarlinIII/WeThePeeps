/**
 * THE DATABASE TRAFFIC COP
 * Purpose: Maps every table in the "We The Peeps" ecosystem to its specific D1 Database.
 * Benefit: You only need one "Save" function; this script handles the routing.
 */

const TABLE_MAP: Record<string, string> = {
  // 1. AUTH DATABASE
  users: "DB_AUTH",
  audit_logs: "DB_AUTH",
  
  // 2. CODEX DATABASE (World Building)
  sectors: "DB_CODEX",
  entities: "DB_CODEX",
  actors: "DB_CODEX",
  
  // 3. VAULT DATABASE (Evidence Storage)
  evidence: "DB_VAULT",
  rebuttals: "DB_VAULT",
  evidence_actors: "DB_VAULT",   // Join table for direct evidence-to-actor links
  evidence_entities: "DB_VAULT", // Join table for direct evidence-to-org links
  
  // 4. RECORDS DATABASE (Events & Bridges)
  incidents: "DB_RECORDS",
  demands: "DB_RECORDS",
  incident_participants: "DB_RECORDS",
  incident_evidence: "DB_RECORDS",
  
  // 5. CONTENT DATABASE (Output & Posts)
  posts: "DB_CONTENT",
  taxonomy: "DB_CONTENT",
  post_taxonomy: "DB_CONTENT"
};

/**
 * Automatically returns the correct D1 instance based on the table name provided.
 * @param tableName - The name of the SQL table you are targeting
 * @param env - The Cloudflare Environment object containing D1 bindings
 */
export function getDbForTable(tableName: string, env: any) {
  const bindingName = TABLE_MAP[tableName];
  
  if (!bindingName) {
    throw new Error(`[Traffic Cop Error]: Table "${tableName}" is not mapped to a database.`);
  }

  const db = env[bindingName];

  if (!db) {
    throw new Error(`[Traffic Cop Error]: Database binding "${bindingName}" not found in environment. Check wrangler.toml.`);
  }

  return db;
}