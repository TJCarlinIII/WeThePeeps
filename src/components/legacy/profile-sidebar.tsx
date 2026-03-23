"use client";

import * as React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupLabel 
} from "@/components/ui/sidebar";
import { User, Fingerprint, Terminal } from "lucide-react";

interface ProfileSidebarProps {
  activeOrgId?: string;
}

const personnel = [
  { name: "J. W. Carlin", title: "Public Liaison", organization: "Community Advocacy" },
  { name: "T. J. Carlin III", title: "Systems Admin", organization: "IT Infrastructure" },
];

export function ProfileSidebar({ activeOrgId }: ProfileSidebarProps) {
  return (
    <Sidebar 
      side="right" 
      className="border-l border-slate-900 bg-black w-72"
    >
      <SidebarHeader className="p-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="bg-[#4A90E2]/10 p-2 border border-[#4A90E2]/20">
            <Fingerprint className="w-5 h-5 text-[#4A90E2]" />
          </div>
          <div>
            <h3 className="font-brand text-sm font-black uppercase tracking-widest text-white">
              Verification
            </h3>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-tighter">
              REGISTRY // {activeOrgId ? `ORG_${activeOrgId}` : 'ACTIVE_SESSION'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4 text-[#4A90E2] font-black">
            Authorized Personnel
          </SidebarGroupLabel>
          
          <div className="space-y-3">
            {personnel.map((person) => (
              <div 
                key={person.name} 
                className="group p-4 border border-slate-900 bg-slate-950/50 hover:bg-slate-900 transition-all rounded-none"
              >
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-slate-600 group-hover:text-[#4A90E2]" />
                  <div className="flex flex-col">
                    <span className="font-brand text-sm font-bold uppercase tracking-wide text-white italic">
                      {person.name}
                    </span>
                    <div className="mt-2 pl-2 border-l border-[#4A90E2]/40 space-y-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider leading-none">
                        {person.title}
                      </span>
                      <span className="block text-[9px] font-mono font-bold text-[#4A90E2] uppercase leading-none">
                        {person.organization}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SidebarGroup>

        <div className="mt-auto px-2">
          <div className="p-4 border border-[#4A90E2]/20 bg-[#4A90E2]/5 rounded-none">
            <div className="flex items-center justify-between mb-3 text-[#4A90E2]">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                <span className="font-mono text-[9px] font-black uppercase tracking-tighter">
                  System_Status
                </span>
              </div>
              <span className="font-mono text-[9px]">75%</span>
            </div>
            <div className="h-1 w-full bg-slate-900 overflow-hidden">
              <div className="h-full bg-[#4A90E2] w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}