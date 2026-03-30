import Link from "next/link";
import { Scale, HeartPulse, ShieldAlert, Building2, Users, FileText } from "lucide-react";
import { IntelligenceIncident, MoralViolationType } from "@/lib/database-types";

export default function IntelligenceFeed({ incidents }: { incidents: IntelligenceIncident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="border border-dashed border-slate-800 p-12 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
        No incidents documented for this specific node.
      </div>
    );
  }

  // Helper for Natural Law Icons & Labels
  const getMoralBadge = (type: MoralViolationType) => {
    switch(type) {
      case 'not-kill': return { icon: <HeartPulse size={10} />, label: "Sanctity of Life", color: "text-red-500 border-red-900/50 bg-red-950/20" };
      case 'false-witness': return { icon: <Scale size={10} />, label: "False Witness", color: "text-[#D4AF37] border-[#D4AF37]/50 bg-[#D4AF37]/10" };
      case 'not-steal': return { icon: <ShieldAlert size={10} />, label: "Financial Exploitation", color: "text-orange-500 border-orange-900/50 bg-orange-950/20" };
      case 'not-covet': return { icon: <Building2 size={10} />, label: "Institutional Motive", color: "text-purple-500 border-purple-900/50 bg-purple-950/20" };
      case 'honor-parents': return { icon: <Users size={10} />, label: "Vulnerable Care", color: "text-emerald-500 border-emerald-900/50 bg-emerald-950/20" };
      default: return null;
    }
  };

  return (
    <div className="columns-1 md:columns-2 gap-6 space-y-6">
      {incidents.map((incident) => {
        const moralBadge = getMoralBadge(incident.moral_violation_type);

        return (
          <div 
            key={incident.id} 
            className="break-inside-avoid border border-slate-800 bg-[#0B1021] p-6 hover:bg-slate-900/50 transition-colors relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.4)]"
          >
            {/* Verified Evidence Watermark */}
            {incident.has_verified_evidence === 1 && (
              <div className="absolute -bottom-2 -right-4 opacity-5 pointer-events-none select-none group-hover:opacity-10 transition-opacity">
                <span className="font-black text-6xl text-[#D4AF37] uppercase italic tracking-tighter">VERIFIED</span>
              </div>
            )}

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <time className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                  {new Date(incident.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </time>
                
                <div className="flex gap-2 flex-wrap justify-end">
                  {moralBadge && (
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 border font-mono text-[8px] uppercase tracking-widest font-black ${moralBadge.color}`}>
                      {moralBadge.icon} {moralBadge.label}
                    </span>
                  )}
                  {incident.is_critical === 1 && (
                    <span className="px-2 py-0.5 bg-red-950/50 border border-red-900/50 text-red-500 font-mono text-[8px] uppercase tracking-widest font-black">
                      Critical
                    </span>
                  )}
                </div>
              </div>
              
              <h4 className="font-serif-formal text-xl text-white mb-3 group-hover:text-[#4A90E2] transition-colors leading-snug">
                <Link href={`/evidence/${incident.slug}`}>{incident.title}</Link>
              </h4>
              
              <p className="font-serif-formal text-sm text-slate-400 mb-6 leading-relaxed">
                {incident.description}
              </p>
              
              <div className="border-t border-slate-800/50 pt-4 flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-slate-600 uppercase tracking-widest">
                  <FileText size={10} /> WTP-INC-{incident.id.toString().padStart(4, '0')}
                </span>
                <Link href={`/jurisdiction/${incident.entity_slug}`} className="font-mono text-[9px] text-[#4A90E2] hover:underline uppercase tracking-widest">
                  ↳ {incident.entity_name}
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}