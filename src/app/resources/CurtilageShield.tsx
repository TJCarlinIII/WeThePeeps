import { ShieldAlert, FileText, Gavel, Scale } from "lucide-react";

export default function CurtilageShield() {
  return (
    <section className="bg-slate-950 border border-slate-800 rounded-sm overflow-hidden shadow-2xl">
      {/* Header: Tactical Alert Style */}
      <div className="bg-red-950/20 border-b border-red-900/50 p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-600/10 border border-red-600/50 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(220,38,38,0.2)]">
          <ShieldAlert className="text-red-500 w-6 h-6" />
        </div>
        <div>
          <h3 className="font-libre text-lg font-bold text-white uppercase tracking-tighter italic">
            4th Amendment Curtilage Protection
          </h3>
          <p className="font-mono text-[10px] text-red-500 uppercase tracking-widest">
            Protocol: Revocation of Implied License (Florida v. Jardines)
          </p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: The "Why" (Legal Context) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <h4 className="font-mono text-[11px] font-black text-slate-400 uppercase flex items-center gap-2">
              <Gavel className="w-3 h-3 text-[#4A90E2]" /> The Legal Basis
            </h4>
            <p className="font-serif text-sm text-slate-500 leading-relaxed italic">
              "The front porch is the classic exemplar of an area adjacent to the home and 
              to which the activity of home life extends." — Justice Scalia
            </p>
          </div>

          <div className="bg-slate-900/50 p-4 border-l-2 border-[#4A90E2]">
            <p className="font-mono text-[10px] text-slate-400 leading-relaxed uppercase">
              By default, police have an "implied license" to walk to your door like a 
              mailman. You have the right to <span className="text-white">revoke</span> that license 
              permanently for specific agencies.
            </p>
          </div>
          
          <ul className="space-y-3">
            {[
              "Stops 'Knock and Talks'",
              "Prevents Warrantless Wellness Checks",
              "Creates Criminal Trespass Liability",
              "Establishes 42 U.S.C. § 1983 Grounds"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                <div className="w-1 h-1 bg-[#4A90E2]" /> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: The Template Box */}
        <div className="lg:col-span-8 bg-black/40 border border-slate-800 p-6 rounded-sm relative group">
          <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <button className="flex items-center gap-2 font-mono text-[9px] text-[#4A90E2] uppercase border border-[#4A90E2]/30 px-3 py-1 rounded-sm hover:bg-[#4A90E2] hover:text-white transition-all">
              <FileText className="w-3 h-3" /> Copy Template
            </button>
          </div>
          
          <div className="font-serif text-sm text-slate-400 leading-relaxed space-y-4 pr-12">
            <p className="font-mono text-[10px] text-[#D4AF37] mb-6 border-b border-slate-800 pb-2 uppercase tracking-widest">
              Formal Notice Template: 18294 Kinloch Protocol
            </p>
            <p><strong>TO:</strong> [Township Supervisor / Police Chief]</p>
            <p><strong>DATE:</strong> March 16, 2026</p>
            <p><strong>RE:</strong> Revocation of Implied License / 4th Amendment Protections</p>
            
            <p className="italic bg-slate-900/30 p-3 border-l border-red-900">
              "I am hereby revoking any and all implied license for any employee, agent, or officer of 
              [Agency Name] to enter upon the property located at [Your Address]. Any entry 
              without a valid search warrant will be considered a criminal trespass."
            </p>
            
            <p className="text-[11px] font-mono uppercase text-slate-600 mt-4">
              Referencing: Florida v. Jardines, 569 U.S. 1 (2013)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}