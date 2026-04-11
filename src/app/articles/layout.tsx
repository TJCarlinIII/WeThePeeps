import SidebarWidget from "@/components/SidebarWidget";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export default async function ArticleLayout({ children }: { children: React.ReactNode }) {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // Fetch sidebar data: Latest 5 other articles
  const { results: recent } = await env.DB.prepare(
    "SELECT title, blogslug FROM posts ORDER BY created_at DESC LIMIT 5"
  ).all<{ title: string; blogslug: string }>();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <main className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full gap-12 p-6 md:p-12">
        
        {/* Main Content Area */}
        <section className="lg:w-2/3">
          {children}
        </section>

        {/* Intelligence Sidebar */}
        <aside className="lg:w-1/3 space-y-12 border-l border-slate-900 pl-8 hidden lg:block">
          <SidebarWidget 
            title="Related_Briefings"
            accentColor="#4A90E2"
            items={recent.map(r => ({
              label: r.title,
              href: `/articles/${r.blogslug}`,
              timestamp: "RECENT"
            }))}
          />

          <SidebarWidget 
            title="Chain_Of_Custody"
            accentColor="#ef4444" // Red for high importance
            items={[
              { label: "Verified Origin: D1_DB", href: "#" },
              { label: "Encryption: AES-256", href: "#" },
              { label: "Status: Public_Release", href: "#" }
            ]}
          />
        </aside>
      </main>
    </div>
  );
}