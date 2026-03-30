import Link from "next/link";
import { OfficialDossier } from "@/lib/database-types";

// Helper for status badges
const getStatusStyles = (status: string) => {
  switch(status) {
    case 'under_review': return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/50';
    case 'former': return 'text-red-500 bg-red-500/10 border-red-500/50';
    case 'active': return 'text-white bg-slate-800 border-slate-600';
    default: return 'text-[#4A90E2] bg-[#4A90E2]/10 border-[#4A90E2]/50';
  }
};

export default function DossierCard({ dossier }: { dossier: OfficialDossier }) {
  const statusStyles = getStatusStyles(dossier.status);

  return (
    <div className="border border-slate-800 bg-[#0B1021] flex flex-col p-5 relative group hover:border-[#4A90E2]/50 transition-colors h-full">
      
      {/* ⚠️ Warning Badge for Falsification History */}
      {dossier.history_of_falsification === 1 && (
         <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-950 border border-red-500 text-red-500 text-[8px] px-2 py-0.5 uppercase tracking-widest font-black whitespace-nowrap z-10 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
           ⚠️ Falsification History
         </div>
      )}

      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-[#4A90E2] transition-colors">
          {dossier.uid}
        </span>
        <span className={`font-mono text-[8px] uppercase font-black px-2 py-0.5 border flex items-center gap-1.5 tracking-widest ${statusStyles}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
          {dossier.status.replace('_', ' ')}
        </span>
      </div>

      {/* Profile Section */}
      <div className="flex gap-4 mb-6 flex-grow">
        {/* WTP-ID Styled Silhouette */}
        <div className="w-16 h-16 shrink-0 border border-slate-800 flex flex-col items-center justify-center bg-[#050A18] relative overflow-hidden group-hover:border-[#4A90E2]/30 transition-colors">
          <div className="absolute inset-1 border border-slate-800/30" />
          <span className="text-[6px] text-slate-700 font-mono tracking-tighter opacity-50 uppercase">Subject ID</span>
          <span className="text-[10px] text-slate-600 font-mono font-black mt-1">WTP</span>
          <span className="text-[8px] text-slate-600 font-mono font-black">{dossier.id.toString().padStart(3, '0')}</span>
          
          {/* Faux corner brackets */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-600" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-600" />
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="font-serif-formal text-xl font-bold text-white leading-tight mb-1">
            {dossier.full_name}
          </h3>
          <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-widest mb-2 leading-relaxed">
            {dossier.job_title}
          </p>
          <Link href={`/jurisdiction/${dossier.agency_slug}`} className="font-mono text-[9px] text-slate-400 hover:text-[#4A90E2] transition-colors flex items-center gap-1">
            ↳ {dossier.agency_name}
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-4 mt-auto">
        <div className="text-center">
          <div className="text-xl font-bold text-white font-mono">{dossier.incident_count}</div>
          <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Incidents</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-white font-mono">{dossier.statute_count}</div>
          <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Statutes</div>
        </div>
      </div>

      <Link 
        href={`/accountability/${dossier.slug}`}
        className="mt-6 border-t border-slate-800/50 pt-4 text-center font-mono text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-[#4A90E2] transition-colors flex justify-center items-center gap-2"
      >
        View Full Dossier ↗
      </Link>
    </div>
  );
}