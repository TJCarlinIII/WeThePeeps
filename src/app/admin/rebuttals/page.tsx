import { getCloudflareContext } from "@opennextjs/cloudflare";
import RebuttalForm from "@/components/admin/forms/RebuttalForm";
import { IncidentTable } from "@/components/admin/incident-table";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ActorResult { id: number; full_name: string; }
interface IncidentResult { id: number; title: string; }
interface EvidenceResult { id: number; title: string; } // Added for Evidence Linking
interface Env { DB: D1Database; }

export default async function RebuttalsAdmin() {
  const ctx = await getCloudflareContext();
  const env = ctx.env as unknown as Env;
  const db = env.DB;

  // Added media fetch to the parallel data load
  const [actors, incidents, evidence] = await Promise.all([
    db.prepare("SELECT id, full_name FROM actors ORDER BY full_name ASC").all<ActorResult>(),
    db.prepare("SELECT id, title FROM incidents ORDER BY title ASC").all<IncidentResult>(),
    db.prepare("SELECT id, title FROM media ORDER BY title ASC").all<EvidenceResult>(),
  ]);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12 border-b border-slate-900 pb-6">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#4A90E2]">
                Rebuttal_Log
              </h1>
              <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">
                SECURE_NODE // LIES_VS_LABS_V1
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <section className="lg:col-span-5 bg-slate-950/30 p-6 border border-slate-900 shadow-2xl">
                <header className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">
                    &gt; Initializing_New_Rebuttal
                  </h2>
                  <span className="text-[8px] text-slate-700 font-bold uppercase border border-slate-900 px-2 py-0.5">
                    Mode: Ingress
                  </span>
                </header>
                
                <RebuttalForm
                  actors={actors.results || []}
                  incidents={incidents.results || []}
                  evidenceList={evidence.results || []} // Passing the master evidence list here
                />
              </section>

              <section className="lg:col-span-7">
                <h2 className="text-[10px] font-black mb-6 text-slate-500 uppercase tracking-[0.3em]">
                  &gt; Active_Rebuttal_Registry
                </h2>
                <IncidentTable tableName="rebuttals" />
              </section>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}