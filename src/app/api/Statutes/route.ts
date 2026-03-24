import { getCloudflareContext } from "@opennextjs/cloudflare";

// Define the interface to tell TS that DB exists on env
interface Env {
  DB: D1Database;
}

export async function GET() {
  try {
    const context = await getCloudflareContext();
    // Explicitly cast env to our Env interface
    const env = context.env as unknown as Env;
    
    const { results } = await env.DB.prepare(
      "SELECT id, citation, title FROM statutes ORDER BY citation ASC"
    ).all();
    
    return Response.json(results);
  } catch {
    // Removed the (error) variable to fix ESLint no-unused-vars
    return Response.json({ error: "Failed to fetch statutes" }, { status: 500 });
  }
}