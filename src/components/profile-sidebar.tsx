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
  // (Removed open and onOpenChange lines)
}

const personnel = [
  { name: "J. W. Carlin", title: "Public Liaison", organization: "Community Advocacy" },
  { name: "T. J. Carlin III", title: "Systems Admin", organization: "IT Infrastructure" },
];

export function ProfileSidebar({ activeOrgId }: ProfileSidebarProps) {
  return (
    <Sidebar 
      side="right" 
      className="border-l border-white/5 bg-[#0B0E14] w-72"
    >
      <SidebarHeader className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-[#4A90E2]/10 p-2 rounded">
            <Fingerprint className="w-5 h-5 text-[#4A90E2]" />
          </div>
          <div>
            <h3 className="font-brand text-sm font-bold uppercase tracking-wider text-white">
              Verification
            </h3>
            <p className="font-mono text-[9px] text-slate-400 uppercase tracking-tight">
              Registry // {activeOrgId ? `Org_${activeOrgId}` : 'Active_Session'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4 text-[#4A90E2]">
            Authorized Personnel
          </SidebarGroupLabel>
          
          <div className="space-y-4">
            {personnel.map((person) => (
              <div 
                key={person.name} 
                className="group p-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-slate-500 group-hover:text-[#4A90E2]" />
                  <div className="flex flex-col">
                    <span className="font-brand text-sm font-bold uppercase tracking-wide text-white">
                      {person.name}
                    </span>
                    <div className="mt-2 pl-2 border-l border-[#4A90E2]/40 space-y-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none">
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

        <SidebarGroup className="mt-auto">
          <div className="p-4 rounded border border-[#4A90E2]/20 bg-[#4A90E2]/5">
            <div className="flex items-center gap-2 mb-2 text-[#4A90E2]">
              <Terminal className="w-3 h-3" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-tighter">
                System_Status
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 overflow-hidden">
              <div className="h-full bg-[#4A90E2] w-3/4 animate-pulse" />
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}