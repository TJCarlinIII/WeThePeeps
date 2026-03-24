import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

interface SystemStats {
  evidenceCount: number;
  criticalCount: number;
  entityCount: number;
  actorCount: number;
  statuteCount: number;
}

interface CloudflareEnv {
  DB: D1Database;
}

export default async function SystemStatus() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;

  const stats = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) as count FROM evidence"),
    env.DB.prepare("SELECT COUNT(*) as count FROM evidence WHERE isCritical = 1"),
    env.DB.prepare("SELECT COUNT(*) as count FROM entities"),
    env.DB.prepare("SELECT COUNT(*) as count FROM actors"),
    env.DB.prepare("SELECT COUNT(*) as count FROM statutes"),
  ]);

  const data: SystemStats = {
    evidenceCount: (stats[0].results[0] as { count: number }).count,
    criticalCount: (stats[1].results[0] as { count: number }).count,
    entityCount: (stats[2].results[0] as { count: number }).count,
    actorCount: (stats[3].results[0] as { count: number }).count,
    statuteCount: (stats[4].results[0] as { count: number }).count,
  };

  const statCards = [
    { label: "Manifest_Records", value: data.evidenceCount, color: "text-white" },
    { label: "Critical_Priority", value: data.criticalCount, color: "text-red-600 animate-pulse" },
    { label: "Identified_Entities", value: data.entityCount, color: "text-[#4A90E2]" },
    { label: "Tracked_Personnel", value: data.actorCount, color: "text-[#4A90E2]" },
    { label: "Legal_Codex", value: data.statuteCount, color: "text-slate-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16 border-y border-slate-900 py-10 bg-slate-950/20 px-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center justify-center border-r border-slate-900 last:border-r-0">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2 text-center leading-tight">
            {stat.label}
          </span>
          <span className={`text-3xl font-black italic tracking-tighter ${stat.color}`}>
            {stat.value.toString().padStart(2, '0')}
          </span>
        </div>
      ))}
    </div>
  );
}