export const dynamic = "force-dynamic";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// 1. Define a specific interface instead of using 'any'
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
    const env = (context.env as unknown) as { DB: D1Database };
    
    const { results } = await env.DB.prepare(
      "SELECT id, name, slug FROM entities"
    ).all();
    
    // 2. Cast the results to our interface
    entities = (results as unknown) as EntityRecord[];
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="p-8 font-mono bg-black text-green-400">
      <h1 className="text-2xl border-b mb-4">D1_DIRECT_QUERY_TEST</h1>
      
      {error && (
        <div className="bg-red-900 text-white p-4 mb-4">
          <strong>QUERY_FAILED:</strong> {error}
        </div>
      )}

      <div className="space-y-2">
        {/* 3. Escaped single quotes using &apos; for ESLint */}
        <p>Found **{entities.length}** records in &apos;entities&apos; table.</p>
        <ul className="list-disc pl-6">
          {entities.map((ent) => (
            <li key={ent.id}>
              ID: {ent.id} | NAME: {ent.name} | SLUG: {ent.slug}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-8 text-xs text-gray-500">
        Timestamp: {new Date().toISOString()}
      </div>
    </main>
  );
}