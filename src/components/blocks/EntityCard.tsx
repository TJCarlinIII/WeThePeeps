import Link from "next/link";
import { Building2, ShieldAlert, Users, FileText } from "lucide-react";

interface EntityCardProps {
  entity: {
    id: number;
    name: string;
    slug: string;
    actor_count: number;
    incident_count: number;
    stonewall_status: string; // "ACCESS_DENIED", etc.
  };
}

export default function EntityCard({ entity }: EntityCardProps) {
  return (
    <div className="min-w-[300px] bg-slate-900/40 border border-slate-800 p-5 group hover:border-[#4A90E2]/50 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-slate-950 p-3 border border-slate-800 group-hover:border-[#4A90E2]/30">
          <Building2 className="w-6 h-6 text-slate-500 group-hover:text-[#4A90E2]" />
        </div>
        <div className="text-[10px] font-mono px-2 py-1 bg-red-950/20 border border-red-900/50 text-red-500 uppercase tracking-tighter">
          {entity.stonewall_status || "ACTIVE_MONITORING"}
        </div>
      </div>

      <h3 className="font-serif text-lg text-white mb-1 group-hover:text-[#4A90E2] transition-colors line-clamp-1">
        {entity.name}
      </h3>
      
      <div className="grid grid-cols-3 gap-2 mt-6 border-t border-slate-800/50 pt-4 font-mono text-[10px]">
        <div>
          <div className="text-slate-500 uppercase mb-1">Actors</div>
          <div className="text-white flex items-center gap-1"><Users className="w-3 h-3 text-[#D4AF37]"/> {entity.actor_count}</div>
        </div>
        <div>
          <div className="text-slate-500 uppercase mb-1">Reports</div>
          <div className="text-white flex items-center gap-1"><FileText className="w-3 h-3 text-[#4A90E2]"/> {entity.incident_count}</div>
        </div>
      </div>

      <Link 
        href={`/jurisdiction/${entity.slug}`}
        className="block mt-6 text-center py-2 bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest hover:bg-[#4A90E2] hover:text-white transition-all"
      >
        View Full Dossier →
      </Link>
    </div>
  );
}