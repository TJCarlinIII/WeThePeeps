import { ShieldCheck, Scale, AlertTriangle, Eye, Gavel } from "lucide-react";

export default function LegalNoticePage() {
  return (
    <main className="min-h-screen bg-[#050A18] text-slate-300 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <header className="border-b border-red-900/50 pb-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-serif text-white uppercase tracking-tighter">
              Legal Notice & <span className="text-red-600">Rights Declaration</span>
            </h1>
          </div>
          <p className="font-mono text-xs text-slate-500 uppercase tracking-[0.2em]">
            Protocol: Project Archimedes // Subject: Institutional Transparency & First Amendment Protections
          </p>
        </header>

        <div className="grid gap-12 font-serif text-lg leading-relaxed">
          
          {/* Section 1: Non-Removal Policy */}
          <section className="bg-slate-900/40 border border-slate-800 p-8">
            <h2 className="text-[#D4AF37] font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Policy: Record Integrity
            </h2>
            <p className="text-white mb-4">
              We The Peeps operates as a **Public Repository of Record**. This platform does not honor requests for the removal of factual documentation. 
            </p>
            <p className="text-slate-400 text-sm">
              If an entity or actor is listed with a status of <span className="text-red-500">ACCESS_DENIED</span> or <span className="text-amber-500">STATUTORY_DELAYER</span>, it is a reflection of documented failure to comply with FOIA (MCL 15.231) or Medical Record (MCLA 333.16213) mandates. The only remedy for a status change is the full delivery of the requested records.
            </p>
          </section>

          {/* Section 2: Freedom of the Press */}
          <section>
            <h2 className="text-[#4A90E2] font-mono text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Constitutional Protections
            </h2>
            <div className="space-y-6">
              <div className="border-l-2 border-[#4A90E2] pl-6">
                <h3 className="text-white text-xl mb-2">Freedom of the Press & Speech</h3>
                <p className="text-slate-400">
                  This platform constitutes a journalistic exercise. Reporting on the clinical accuracy of medical records and the administrative conduct of public officials is a protected activity under the First Amendment of the U.S. Constitution and the Michigan Constitution of 1963.
                </p>
              </div>
              
              <div className="border-l-2 border-red-800 pl-6">
                <h3 className="text-white text-xl mb-2">Anti-Retaliation Protocol</h3>
                <p className="text-slate-400">
                  Any attempt by state agents or healthcare entities to intimidate, falsely arrest, or harass the administrators of this site will be documented as a new **Civil Rights Violation**. Under 42 U.S.C. § 1983, officials acting under "Color of Law" to suppress speech are subject to personal liability.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Fair Use Notice */}
          <section className="border-t border-slate-800 pt-10">
            <h2 className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-4">Fair Use Declaration</h2>
            <p className="text-sm text-slate-500 italic">
              This site may contain copyrighted material (logos, document headers) the use of which has not always been specifically authorized by the copyright owner. We are making such material available in our efforts to advance understanding of institutional accountability. We believe this constitutes a &apos;fair use&apos; of any such copyrighted material as provided for in section 107 of the US Copyright Law.
            </p>
          </section>

          {/* Section 4: The "Emergency" Footer */}
          <footer className="mt-12 p-6 border-2 border-red-600 bg-red-950/10 rounded-sm">
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h4 className="text-red-500 font-mono text-sm font-bold uppercase mb-2">Live Incident Monitoring</h4>
                <p className="text-xs text-red-200/70 font-mono leading-relaxed">
                  NOTE TO COUNSEL: All correspondence sent to this platform is considered ON THE RECORD and will be published in the &quot;Legal Interference&quot; section of the relevant entity dossier. Silence is advised unless accompanied by the missing records.
                </p>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </main>
  );
}