"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Landmark,
  Building2,
  HeartPulse,
  Users,
  ShieldAlert,
  Scale,
  Gavel,
  Star,
  ChevronRight,
  Shield,
} from "lucide-react";
import { organizations, type Organization } from "@/data/organizations";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Landmark,
  Building2,
  HeartPulse,
  Users,
  ShieldAlert,
  Scale,
  Gavel,
  Star,
  Shield,
};

interface AppSidebarProps {
  activeOrgId: string;
  onOrgSelect: (id: string) => void;
  // (Removed open and onOpenChange lines)
}

function groupByCategory(orgs: Organization[]) {
  return orgs.reduce<Record<string, Organization[]>>((acc, org) => {
    if (!acc[org.category]) acc[org.category] = [];
    acc[org.category].push(org);
    return acc;
  }, {});
}

export function AppSidebar({ activeOrgId, onOrgSelect }: AppSidebarProps) {
  const grouped = React.useMemo(() => groupByCategory(organizations), []);

  return (
    <Sidebar
      side="left"
      collapsible="offcanvas"
      className="border-r border-white/5 bg-[#0B0E14]"
    >
     <SidebarHeader className="p-4 border-b border-white/5">
      <div className="flex items-center justify-between w-full">
        {/* NEW LOGO SECTION */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-auto overflow-hidden rounded-sm">
            <img 
              src="/WTPLogo.jpg" 
              alt="We The Peeps Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
          {/* Optional: Add a subtle 'Active' tag next to your logo */}
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-[#4A90E2] uppercase tracking-[0.2em] leading-none mb-1">
              Terminal
            </span>
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-tighter leading-none">
              v1.0.2
            </span>
          </div>
        </div>
        
        <SidebarTrigger className="text-slate-500 hover:text-white" />
      </div>
    </SidebarHeader>

      <SidebarContent className="p-3 pt-4 overflow-y-auto">
        {Object.entries(grouped).map(([category, orgs]) => (
          <SidebarGroup key={category} className="mb-4">
            <SidebarGroupLabel className="font-mono text-[9px] uppercase tracking-[0.25em] mb-2 text-slate-500 px-1">
              {category}
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-0.5">
              {orgs.map((org) => {
                const Icon = iconMap[org.icon] ?? Landmark;
                const isActive = activeOrgId === org.id;
                return (
                  <SidebarMenuItem key={org.id}>
                    <SidebarMenuButton
                      onClick={() => onOrgSelect(org.id)}
                      className={cn(
                        "group relative p-3 h-auto w-full border transition-all duration-150 rounded-sm cursor-pointer text-left",
                        isActive
                          ? "border-[#4A90E2]/40 bg-[#4A90E2]/10 text-white"
                          : "border-transparent hover:border-white/5 hover:bg-white/[0.025] text-slate-400 hover:text-white"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 inset-y-0 w-0.5 bg-[#4A90E2] rounded-r" />
                      )}
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                            isActive ? "text-[#4A90E2]" : "text-slate-500 group-hover:text-[#4A90E2]"
                          )}
                        />
                        <span className="font-heading text-xs font-bold uppercase tracking-wide leading-tight flex-1">
                          {org.name}
                        </span>
                        <ChevronRight
                          className={cn(
                            "w-3 h-3 flex-shrink-0 transition-all",
                            isActive ? "text-[#4A90E2] opacity-100" : "text-slate-600 opacity-0 group-hover:opacity-100"
                          )}
                        />
                      </div>
                      {org.subjects.length > 0 && (
                        <div className="mt-1.5 ml-6">
                          <span
                            className={cn(
                              "font-mono text-[8px] uppercase tracking-wider",
                              isActive ? "text-[#4A90E2]/80" : "text-slate-600"
                            )}
                          >
                            {org.subjects.length} subject{org.subjects.length !== 1 ? "s" : ""} documented
                          </span>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}