import Link from "next/link";
import { Fingerprint, Globe, Gavel, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-slate-900 pt-16 pb-8 px-6 mt-20 bg-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Adjusted Grid for better balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16 items-start">
          
          {/* Brand & Mission */}
          <div className="flex flex-col items-start space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[#4A90E2]/50 bg-[#4A90E2]/10 flex items-center justify-center rounded-sm">
                <Fingerprint className="text-[#4A90E2] w-6 h-6" />
              </div>
              <span className="font-libre text-2xl font-bold tracking-tighter text-white uppercase">
                WE THE <span className="text-[#D4AF37]">PEEPS</span>
              </span>
            </div>
            <p className="text-slate-500 font-serif text-sm leading-relaxed max-w-md">
              A decentralized institutional accountability database dedicated to the 
              transparency of public records, clinical accuracy, and the 
              protection of civil liberties in the State of Michigan.
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-950/10 border border-red-900/40 rounded-sm">
              <ShieldCheck className="w-3 h-3 text-red-600" />
              <span className="font-mono text-[9px] text-red-500 uppercase tracking-[0.2em]">
                Anti-Retaliation Protocol: ACTIVE
              </span>
            </div>
          </div>

          {/* Legal Clearance Block */}
          <div className="bg-slate-950/40 backdrop-blur-sm border border-slate-800/80 p-8 rounded-sm relative">
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-red-900/50" />
            
            <div className="flex items-center gap-2 mb-4 text-red-500">
              <Gavel className="w-4 h-4" />
              <h4 className="font-mono text-[10px] font-black uppercase tracking-[0.3em]">
                Legal_Clearance_&_Rights
              </h4>
            </div>
            <p className="font-mono text-[11px] text-slate-400 leading-relaxed mb-6 uppercase">
              Notice: All documentation on this platform is derived from primary source records. 
              Factual data is not subject to removal. Any attempt to suppress this publication 
              via intimidation or legal overreach is documented in real-time.
            </p>
            <Link 
              href="/legal-notice" 
              className="inline-block w-full py-3 border border-red-900/50 bg-red-900/5 text-center font-mono text-[10px] text-red-500 uppercase tracking-widest hover:bg-red-900 hover:text-white transition-all"
            >
              Access Non-Removal & Fair Use Policy
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 font-mono text-[9px] text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2] opacity-50" />
              © {currentYear} Project Archimedes
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> Michigan_Transparency_Network
            </span>
          </div>
          
          <div className="flex gap-8 font-mono text-[9px] text-slate-600 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-[#4A90E2] transition-colors">Privacy_Encryption</Link>
            <Link href="/terms" className="hover:text-[#4A90E2] transition-colors">Terms_of_Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}