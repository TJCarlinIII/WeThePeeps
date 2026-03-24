"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import GlobalSearch from "@/components/GlobalSearch";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isNavOpen, setNavOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col font-mono">
      
      <header className="h-16 border-b border-slate-900 flex items-center px-6 justify-between z-30 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setNavOpen(!isNavOpen)}
            className="p-2 hover:bg-[#4A90E2]/10 text-[#4A90E2] border border-slate-800"
          >
            {isNavOpen ? "[ CLOSE ]" : "[ MENU ]"}
          </button>
          <h1 className="text-xl font-black text-white italic tracking-tighter hidden md:block">
            WE THE PEEPS
          </h1>
        </div>
        <div className="flex-grow max-w-xl px-8">
          <GlobalSearch />
        </div>
        <div className="text-[10px] text-slate-600 font-bold uppercase hidden lg:block">
          System_v1.0.4_Stable
        </div>
      </header>

      <div className="flex-grow flex relative overflow-hidden">
        
        <aside 
          className={`absolute inset-y-0 left-0 w-72 bg-slate-950 border-r border-[#4A90E2]/30 z-40 transform transition-transform duration-300 ease-in-out shadow-[20px_0_50px_rgba(0,0,0,0.8)] ${
            isNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-8 space-y-8">
            <section>
              <h3 className="text-[10px] text-slate-500 mb-4 tracking-widest uppercase">Directories</h3>
              <nav className="space-y-2">
                <Link onClick={() => setNavOpen(false)} href="/codex" className="block text-sm text-white hover:text-[#4A90E2]">/root/codex</Link>
                <Link onClick={() => setNavOpen(false)} href="/actors" className="block text-sm text-white hover:text-[#4A90E2]">/root/actors</Link>
                <Link onClick={() => setNavOpen(false)} href="/entities" className="block text-sm text-white hover:text-[#4A90E2]">/root/entities</Link>
                <Link onClick={() => setNavOpen(false)} href="/sectors" className="block text-sm text-white hover:text-[#4A90E2]">/root/sectors</Link>
                <Link onClick={() => setNavOpen(false)} href="/evidence" className="block text-sm text-white hover:text-[#4A90E2]">/root/manifest</Link>
              </nav>
            </section>
          </div>
        </aside>

        <main className="flex-grow overflow-y-auto p-6 md:p-12 pb-32 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>

        <aside className="w-80 border-l border-slate-900 hidden xl:block p-6 overflow-y-auto bg-black/20">
          <h3 className="text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.3em] mb-6">Live_Telemetry</h3>
          <div className="border border-slate-900 p-4 bg-slate-950/40 text-[10px] text-slate-500 italic">
            Waiting for sector-specific data...
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 w-full z-50">
        <div 
          className={`bg-slate-950 border-t border-[#4A90E2]/30 transition-all duration-300 overflow-hidden ${
            activeDrawer ? "h-64" : "h-0"
          }`}
        >
          <div className="p-6 h-full overflow-y-auto text-xs text-slate-400">
            {activeDrawer === "stats" && <div>[ SYSTEM STATS: 314 Nodes Active | Latency: 12ms ]</div>}
            {activeDrawer === "logs" && <div>[ RECENT LOGS: Pulling latest D1 entries... ]</div>}
          </div>
        </div>

        <div className="h-10 bg-black border-t border-slate-900 flex items-center px-4 gap-4">
          <button 
            onClick={() => setActiveDrawer(activeDrawer === "stats" ? null : "stats")}
            className={`text-[9px] font-black uppercase px-3 py-1 border transition-all ${activeDrawer === "stats" ? 'bg-[#4A90E2] text-black' : 'border-slate-800 text-slate-600'}`}
          >
            Terminal_Stats
          </button>
          <button 
            onClick={() => setActiveDrawer(activeDrawer === "logs" ? null : "logs")}
            className={`text-[9px] font-black uppercase px-3 py-1 border transition-all ${activeDrawer === "logs" ? 'bg-[#4A90E2] text-black' : 'border-slate-800 text-slate-600'}`}
          >
            Event_Logs
          </button>
          <div className="ml-auto text-[9px] text-slate-800 italic hidden sm:block">
            SECURE_CONNECTION_ESTABLISHED
          </div>
        </div>
      </footer>

      {isNavOpen && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30" 
          onClick={() => setNavOpen(false)}
        />
      )}
    </div>
  );
}