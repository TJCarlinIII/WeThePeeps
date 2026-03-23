"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
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
import { laws, getLawsByCategory, type LawReference } from "@/data/organizations";
import { cn } from "@/lib/utils";

type DrawerType = "constitutional" | "federal" | "state" | "regulation" | null;

const drawerButtons: {
  id: DrawerType;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
  count: number;
}[] = [
  {
    id: "constitutional",
    label: "Constitutional Rights",
    sublabel: "U.S. Constitution",
    icon: Flag,
    color: "text-blue-400 border-blue-400/30 bg-blue-400/10 hover:bg-blue-400/20",
    count: getLawsByCategory("constitutional").length,
  },
  {
    id: "federal",
    label: "Federal Law",
    sublabel: "U.S. Code",
    icon: Scale,
    color: "text-purple-400 border-purple-400/30 bg-purple-400/10 hover:bg-purple-400/20",
    count: getLawsByCategory("federal").length,
  },
  {
    id: "state",
    label: "Michigan State Law",
    sublabel: "MCL Statutes",
    icon: BookOpen,
    color: "text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/20",
    count: getLawsByCategory("state").length,
  },
  {
    id: "regulation",
    label: "Regulations & Codes",
    sublabel: "Admin Rules",
    icon: FileText,
    color: "text-amber-400 border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20",
    count: getLawsByCategory("regulation").length,
  },
];

const categoryTitles: Record<NonNullable<DrawerType>, string> = {
  constitutional: "Constitutional Rights Being Violated",
  federal: "Federal Statutes Being Violated",
  state: "Michigan State Laws Being Violated",
  regulation: "Regulations & Codes Being Violated",
};

function LawCard({ law }: { law: LawReference }) {
  return (
    <div className="p-4 border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-sm group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
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
      {law.penalty && (
        <div className="mt-3 px-3 py-2 bg-red-500/5 border border-red-500/15 rounded-sm">
          <p className="font-mono text-[9px] text-red-400 uppercase tracking-wider font-bold mb-0.5">
            Penalty / Enforcement
          </p>
          <p className="font-sans text-[10px] text-slate-400 leading-snug">
            {law.penalty}
          </p>
        </div>
      )}
    </div>
  );
}

export function LegalDrawerBar() {
  const [openDrawer, setOpenDrawer] = React.useState<DrawerType>(null);

  const activeLaws = openDrawer ? getLawsByCategory(openDrawer) : [];

  return (
    <>
      {/* ── Fixed Bottom Toolbar ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#080B10]/95 backdrop-blur-sm border-t border-white/8">
        <div className="max-w-full px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {/* Label */}
          <div className="flex items-center gap-2 pr-4 border-r border-white/8 flex-shrink-0">
            <Scale className="w-3.5 h-3.5 text-[#4A90E2]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              Legal Index
            </span>
          </div>

          {/* Drawer trigger buttons */}
          {drawerButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => setOpenDrawer(btn.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all cursor-pointer flex-shrink-0",
                  btn.color
                )}
              >
                <Icon className="w-3 h-3" />
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold whitespace-nowrap">
                  {btn.label}
                </span>
                <span className="font-mono text-[8px] opacity-60">
                  ({btn.count})
                </span>
                <ChevronUp className="w-2.5 h-2.5 opacity-60" />
              </button>
            );
          })}

          {/* Total count badge */}
          <div className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-slate-600">
            <span className="font-mono text-[9px] uppercase tracking-widest">
              {laws.length} total citations
            </span>
          </div>
        </div>
      </div>

      {/* ── Law Drawers ──────────────────────────────────────── */}
      <Drawer
        open={openDrawer !== null}
        onOpenChange={(open) => !open && setOpenDrawer(null)}
        direction="bottom"
      >
        <DrawerContent className="bg-[#0B0E14] border-t border-white/10 max-h-[70vh]">
          {/* Drag handle */}
          <div className="mx-auto mt-3 w-12 h-1 rounded-full bg-white/10 flex-shrink-0" />

          <DrawerHeader className="px-6 py-4 border-b border-white/8 flex flex-row items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4A90E2]/10 border border-[#4A90E2]/20 rounded-sm">
                <Scale className="w-4 h-4 text-[#4A90E2]" />
              </div>
              <div>
                <DrawerTitle className="font-heading text-base font-bold text-white">
                  {openDrawer ? categoryTitles[openDrawer] : ""}
                </DrawerTitle>
                <DrawerDescription className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 mt-0.5">
                  {activeLaws.length} citation{activeLaws.length !== 1 ? "s" : ""} on record // Public Interest Archive
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <button className="p-1.5 border border-white/10 rounded-sm text-slate-500 hover:text-white hover:border-white/20 transition-all ml-4 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </DrawerClose>
          </DrawerHeader>

          {/* Scrollable law cards */}
          <div className="overflow-y-auto px-6 py-4 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl">
              {activeLaws.map((law) => (
                <LawCard key={law.id} law={law} />
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 border border-white/5 bg-white/[0.015] rounded-sm">
              <p className="font-sans text-[10px] text-slate-600 leading-relaxed italic">
                <strong className="text-slate-500 not-italic font-heading">Legal Notice:</strong>{" "}
                The legal citations listed above are provided for public interest and
                accountability journalism purposes. This archive does not constitute legal
                advice. Consult a licensed attorney regarding your specific circumstances.
                All allegations are based on documented evidence and public record.
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
