"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  BookOpen,
  Scale,
  Flag,
  FileText,
  X,
  ExternalLink,
  ChevronUp,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LawReference {
  id: string;
  citation: string;
  title: string;
  description: string;
  category: "constitutional" | "federal" | "state" | "regulation";
  penalty?: string;
}

type DrawerType = "constitutional" | "federal" | "state" | "regulation" | null;

interface LegalDrawerBarProps {
  laws: LawReference[];
}

function LawCard({ law }: { law: LawReference }) {
  return (
    <div className="p-4 border border-slate-800 bg-black hover:bg-slate-900 transition-all rounded-none group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="font-mono text-[10px] text-[#4A90E2] uppercase tracking-widest font-bold">
            {law.citation}
          </span>
        </div>
        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-0.5 cursor-pointer" />
      </div>
      <h4 className="font-heading text-sm font-bold text-white mb-2 leading-snug">
        {law.title}
      </h4>
      <p className="font-sans text-xs text-slate-400 leading-relaxed">
        {law.description}
      </p>
    </div>
  );
}

export function LegalDrawerBar({ laws }: LegalDrawerBarProps) {
  const [openDrawer, setOpenDrawer] = React.useState<DrawerType>(null);
  
  const activeLaws = React.useMemo(() => 
    laws.filter(law => law.category === openDrawer), 
    [laws, openDrawer]
  );

  const drawerButtons: { id: DrawerType; label: string; icon: React.ElementType; color: string }[] = [
    { id: "constitutional", label: "Constitutional", icon: Flag, color: "text-blue-400 border-blue-400/30 bg-blue-400/10 hover:bg-blue-400/20" },
    { id: "federal", label: "Federal Law", icon: Scale, color: "text-purple-400 border-purple-400/30 bg-purple-400/10 hover:bg-purple-400/20" },
    { id: "state", label: "State Law", icon: BookOpen, color: "text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/20" },
    { id: "regulation", label: "Regulations", icon: FileText, color: "text-amber-400 border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20" },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-slate-800">
        <div className="max-w-full px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {drawerButtons.map((btn) => {
            const Icon = btn.icon;
            const count = laws.filter(l => l.category === btn.id).length;
            return (
              <button
                key={btn.id}
                onClick={() => setOpenDrawer(btn.id)}
                className={cn("flex items-center gap-2 px-3 py-1.5 border rounded-none transition-all cursor-pointer flex-shrink-0", btn.color)}
              >
                <Icon className="w-3 h-3" />
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold whitespace-nowrap">{btn.label}</span>
                <span className="font-mono text-[8px] opacity-60">({count})</span>
                <ChevronUp className="w-2.5 h-2.5 opacity-60" />
              </button>
            );
          })}
        </div>
      </div>

      <Drawer open={openDrawer !== null} onOpenChange={(open) => !open && setOpenDrawer(null)}>
        <DrawerContent className="bg-[#0B0E14] border-t border-slate-800 max-h-[75vh] rounded-none">
          <DrawerHeader className="px-6 py-4 border-b border-slate-900 flex flex-row items-start justify-between">
            <DrawerTitle className="font-heading text-base font-bold text-white uppercase tracking-tight">
              {openDrawer} Violations
            </DrawerTitle>
            <DrawerClose asChild>
              <button className="p-1.5 border border-slate-800 text-slate-500 hover:text-white transition-all"><X className="w-3.5 h-3.5" /></button>
            </DrawerClose>
          </DrawerHeader>
          <div className="overflow-y-auto px-6 py-6 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLaws.map((law) => <LawCard key={law.id} law={law} />)}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}