export const dynamic = "force-dynamic";
import { getCloudflareContext } from "@opennextjs/cloudflare";
// Import the type directly from the package instead of using triple-slash
import type { D1Database } from "@cloudflare/workers-types";

interface EntityRecord {
  id: number;
  name: string;
  slug: string;
}

export default async function TestDBPage() {
  let entities: EntityRecord[] = [];
  let error: string | null = null;

  try {
    const context = await getCloudflareContext({ async: true });
    // We cast to the imported D1Database type here
    const env = (context.env as unknown) as { DB: D1Database };
    
    if (!env.DB) {
      throw new Error("DB_BINDING_NOT_FOUND: Check wrangler.toml");
    }

    const { results } = await env.DB.prepare(
      "SELECT id, name, slug FROM entities"
    ).all();
    
    entities = (results as unknown) as EntityRecord[];
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="p-8 font-mono bg-black text-green-400">
      <h1 className="text-2xl border-b mb-4 tracking-tighter uppercase italic">D1_Direct_Query_Test</h1>
      
      {error && (
        <div className="bg-red-900 text-white p-4 mb-4 border border-red-500">
          <strong>CRITICAL_ERROR:</strong> {error}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-xs text-green-700">QUERY_STATUS: {entities.length > 0 ? 'SUCCESS' : 'NO_DATA'}</p>
        <p>Found **{entities.length}** records in &apos;entities&apos; table.</p>
        <ul className="list-disc pl-6 space-y-1">
          {entities.map((ent) => (
            <li key={ent.id} className="hover:bg-green-900/30 p-1">
              ID: {ent.id} | NAME: {ent.name} | SLUG: {ent.slug}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-12 pt-4 border-t border-green-900 text-[10px] text-green-800">
        SYSTEM_TIMESTAMP: {new Date().toISOString()}
      </div>
    </main>
  );
}