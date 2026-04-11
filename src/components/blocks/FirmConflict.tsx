import { ExternalLink, Eye, AlertCircle } from "lucide-react";

export default function ConflictAuditCard() {
  return (
    <div className="bg-[#0B1021] border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header with Conflict Status */}
      <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-amber-500 w-4 h-4" />
          <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest">
            Conflict of Interest Audit: Michael Bosnick
          </span>
        </div>
        <div className="px-3 py-0.5 bg-red-950/30 border border-red-900/50 rounded-full">
          <span className="font-mono text-[9px] text-red-500 uppercase tracking-tighter">
            Disclosure Status: Ignored
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 divide-x divide-slate-800">
        {/* Left Side: The Demand Screenshot */}
        <div className="p-6 space-y-4">
          <h4 className="font-mono text-[10px] text-slate-500 uppercase">Exhibit A: Formal Demand</h4>
          <div className="relative aspect-[3/4] bg-white rounded-sm overflow-hidden border border-slate-700 group cursor-zoom-in">
            {/* Replace with your actual screenshot path */}
            <img 
              src="/evidence/demand-letter-screenshot.jpg" 
              alt="Formal Demand for Disclosure" 
              className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-[#050A18]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="font-mono text-[10px] text-white bg-[#4A90E2] px-4 py-2 uppercase">View Full Record</span>
            </div>
          </div>
          <p className="font-serif text-[12px] text-slate-400 italic">
            Certified delivery of demand for conflict disclosure regarding private firm affiliation.
          </p>
        </div>

        {/* Right Side: The Firm Website Screenshot */}
        <div className="p-6 space-y-4 bg-slate-900/20">
          <h4 className="font-mono text-[10px] text-slate-500 uppercase">Exhibit B: Firm Affiliation</h4>
          <div className="relative aspect-[3/4] bg-slate-800 rounded-sm overflow-hidden border border-slate-700 group">
             {/* Replace with firm website screenshot */}
            <img 
              src="/evidence/firm-website-screenshot.jpg" 
              alt="Firm Practice Areas" 
              className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <a 
              href="https://[FIRM_WEBSITE_URL]" 
              target="_blank" 
              className="absolute bottom-4 right-4 bg-black/80 border border-[#4A90E2]/50 p-2 text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white transition-all"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-amber-500 uppercase font-bold">Documented Practice Area:</span>
            <p className="font-mono text-[11px] text-slate-300 uppercase leading-tight">
              Medical Malpractice Defense / Insurance Carrier Representation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}