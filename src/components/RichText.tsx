import { getCloudflareContext } from "@opennextjs/cloudflare";
import { linkifyEntities } from "@/lib/utils";

export default async function RichText({ content }: { content: string | null | undefined }) {
  if (!content) return null;

  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // Fetch actor names dynamically so we don't have to hardcode them ever again
  const { results } = await env.DB.prepare("SELECT full_name as name, slug FROM actors").all();
  const actors = results as { name: string, slug: string }[];

  const linkedHtml = linkifyEntities(content, actors);

  return (
    <div 
      className="prose prose-invert max-w-none" 
      dangerouslySetInnerHTML={{ __html: linkedHtml }} 
    />
  );
}