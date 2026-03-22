"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { LegalDrawerBar } from "@/components/legal-drawer";
import { EvidenceCard, type EvidenceRecord } from "@/components/evidence-card";
import { ShieldCheck, Database, Fingerprint, Clock } from "lucide-react";

interface SiteLayoutProps {
  evidenceData: EvidenceRecord[];
}

export function SiteLayout({ evidenceData }: SiteLayoutProps) {
  const [activeOrgId, setActiveOrgId] = React.useState("redford-township");
  const [rightOpen, setRightOpen] = React.useState(true);
  const [time, setTime] = React.useState("");

  // Real-time timestamp for the high-tech feel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0B0E14]">
      {/* ── LEFT SYSTEM (Independent) ── */}
      <SidebarProvider defaultOpen={true}>
        <AppSidebar activeOrgId={activeOrgId} onOrgSelect={setActiveOrgId} />
        
        <SidebarInset className="bg-[#0B0E14] flex flex-col overflow-hidden">
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0B0E14]/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
               {/* Recording Indicator */}
               <div className="flex items-center gap-2 px-3 py-1 bg-red-500/5 border border-red-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="font-mono text-[9px] font-bold text-red-500 uppercase tracking-[0.2em]">
                    Live Archive Recording
                  </span>
               </div>
               
               {/* Live Clock */}
               <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="font-mono text-[9px] font-bold text-slate-300 tabular-nums">
                    {time || "00:00:00"}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-500 font-mono text-[9px] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2]" />
                Archive: <span className="text-white ml-1 font-bold">Online</span>
              </div>
              
              {/* TRIGGER FOR RIGHT SIDEBAR ONLY */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setRightOpen(!rightOpen);
                }}
                className="p-2 hover:bg-white/5 rounded-sm text-slate-400 hover:text-[#4A90E2] transition-all"
              >
                <Fingerprint className="w-5 h-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto pb-24">
             {/* ... Your Archive Header & Content Grid ... */}
             <div className="max-w-4xl mx-auto">
               <div className="mb-12 border-l-4 border-[#4A90E2] pl-8 py-4">
                 <h1 className="font-heading text-4xl font-bold text-white uppercase">Evidence</h1>
                 <h2 className="font-heading text-4xl font-bold text-[#4A90E2] uppercase">Archive</h2>
               </div>
               
               <div className="grid gap-5">
                 {evidenceData.map((item) => (
                   <EvidenceCard key={item.id} record={item} />
                 ))}
               </div>
             </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* ── RIGHT SYSTEM (Strictly Controlled) ── */}
      <SidebarProvider open={rightOpen} onOpenChange={setRightOpen}>
        <ProfileSidebar activeOrgId={activeOrgId} />
      </SidebarProvider>

      <LegalDrawerBar />
    </div>
  );
}