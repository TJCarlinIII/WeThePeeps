export const dynamic = "force-dynamic";

import React from 'react';
import Link from 'next/link';
import { getDB } from "@/lib/db";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import RevalidateButton from "@/components/admin/RevalidateButton";
import { 
  ShieldAlert, Users, Building, Gavel, 
  FileText, FolderTree, LayoutGrid, RefreshCw, 
  Database, Wrench, Briefcase, HardDrive, Eye,
  MessageSquareQuote, Zap // ✅ NEW: Lightning icon for v2 modules
} from "lucide-react";

export default async function AdminPage() {
  const db = await getDB();

  const stats = await db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM taxonomy_definitions) as taxonomy,
      (SELECT COUNT(*) FROM entities) as entities,
      (SELECT COUNT(*) FROM actors) as actors,
      (SELECT COUNT(*) FROM incidents) as incidents,
      (SELECT COUNT(*) FROM statutes) as statutes,
      (SELECT COUNT(*) FROM posts) as posts,
      (SELECT COUNT(*) FROM sectors) as sectors,
      (SELECT COUNT(*) FROM rebuttals) as rebuttals,
      (SELECT COUNT(*) FROM cases) as cases,
      (SELECT COUNT(*) FROM media) as media
  `).first<{
    taxonomy: number; entities: number; actors: number; incidents: number; 
    statutes: number; posts: number; sectors: number; rebuttals: number; 
    cases: number; media: number;
  }>();

  const DATA_TABLES = [
    { id: 'hub', label: 'Intelligence Hub', Icon: Eye, path: '/admin/gallery', count: (stats?.media ?? 0) + (stats?.posts ?? 0) },
    { id: 'taxonomy', label: 'Taxonomy Architect', Icon: FolderTree, path: '/admin/taxonomy', count: stats?.taxonomy },
    { id: 'entities', label: 'Organizations', Icon: Building, path: '/admin/entities', count: stats?.entities },
    { id: 'actors', label: 'Individuals/Officials', Icon: Users, path: '/admin/actors', count: stats?.actors },
    
    // ── LEGACY INCIDENTS (Read-Only During Migration) ──
    { 
      id: 'incidents', 
      label: 'Timeline Events [Legacy]', 
      Icon: ShieldAlert, 
      path: '/admin/incidents', 
      count: stats?.incidents,
      isLegacy: true // ✅ Flag for visual styling
    },
    
    // ── NEW REFACTORED INCIDENTS v2 (Write-Enabled) ──
    { 
      id: 'incidents-v2', 
      label: 'Timeline Events v2', 
      Icon: Zap, // ✅ Lightning icon for new architecture
      path: '/admin/modules/incidents', 
      count: null, // Count would require separate query to wethepeeps-v2
      isNew: true // ✅ Flag for visual styling
    },
    
    { id: 'rebuttals', label: 'Rebuttal Registry', Icon: MessageSquareQuote, path: '/admin/rebuttals', count: stats?.rebuttals }, 
    { id: 'cases', label: 'Legal/Police Cases', Icon: Briefcase, path: '/admin/cases', count: stats?.cases },
    { id: 'media', label: 'Evidence Vault', Icon: HardDrive, path: '/admin/media', count: stats?.media },
    { id: 'statutes', label: 'Legal Statutes', Icon: Gavel, path: '/admin/statutes', count: stats?.statutes },
    { id: 'posts', label: 'Articles', Icon: FileText, path: '/admin/posts', count: stats?.posts },
    { id: 'sectors', label: 'Sectors', Icon: LayoutGrid, path: '/admin/sectors', count: stats?.sectors },
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            <header className="mb-10 border-b border-slate-900 pb-6">
              <h1 className="text-2xl font-bold tracking-tighter text-[#4A90E2] uppercase italic">
                WTP_DASHBOARD // REDFORD_NODE
              </h1>
              <p className="text-[10px] text-slate-500 uppercase mt-1 font-bold tracking-[0.2em]">
                System Health: <span className="text-emerald-500">Active</span>
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DATA_TABLES.map((table) => {
                const isLegacy = (table as any).isLegacy;
                const isNew = (table as any).isNew;
                
                return (
                  <Link
                    key={table.id}
                    href={table.path}
                    className={`group relative flex flex-col p-6 border transition-all duration-300 overflow-hidden ${
                      isNew 
                        ? 'border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-400' 
                        : isLegacy
                          ? 'border-slate-900 bg-slate-950/40 hover:border-[#4A90E2]/50 hover:bg-[#4A90E2]/5'
                          : 'border-slate-900 bg-slate-950/40 hover:border-[#4A90E2]/50 hover:bg-[#4A90E2]/5'
                    }`}
                  >
                    {/* Version badge */}
                    {isNew && (
                      <span className="absolute top-2 right-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/30 px-1.5 py-0.5">
                        NEW
                      </span>
                    )}
                    {isLegacy && (
                      <span className="absolute top-2 right-2 text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-700/30 px-1.5 py-0.5">
                        LEGACY
                      </span>
                    )}
                    
                    <div className="absolute top-0 left-0 w-1 h-0 bg-current group-hover:h-full transition-all duration-300" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className={`transition-all duration-300 group-hover:scale-110 ${
                        isNew ? 'text-emerald-500/60 group-hover:text-emerald-400' : 'text-[#4A90E2]/60 group-hover:text-[#4A90E2]'
                      }`}>
                        <table.Icon size={24} strokeWidth={1.5} />
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white tracking-tighter">
                          {table.count ?? (isNew ? '∞' : 0)}
                        </span>
                        <p className="text-[7px] text-slate-600 uppercase font-bold tracking-widest">Records</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <h2 className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                        isNew ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-slate-400 group-hover:text-white'
                      }`}>
                        {table.label}
                      </h2>
                      {isNew && (
                        <p className="text-[8px] text-emerald-600/70 mt-1 uppercase tracking-tight">
                          Join-Table Architecture
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-16 mb-8 flex items-center gap-4">
              <div className="h-[1px] flex-grow bg-slate-900" />
              <div className="flex items-center gap-2 text-slate-600">
                <Wrench size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">System_Tools</span>
              </div>
              <div className="h-[1px] flex-grow bg-slate-900" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative flex flex-col p-6 border border-slate-900 bg-slate-950/40 hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 bg-emerald-500 group-hover:h-full transition-all duration-300" />
                <div className="flex justify-between items-start mb-6">
                  <div className="text-emerald-500/60 transition-all duration-300 group-hover:text-emerald-500 group-hover:rotate-180">
                    <RefreshCw size={24} strokeWidth={1.5} />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-emerald-500 tracking-widest uppercase">System_Sync</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <h2 className="text-[11px] font-black group-hover:text-white text-slate-300 uppercase tracking-widest mb-3">
                    Global Cache Revalidation
                  </h2>
                  <RevalidateButton />
                </div>
              </div>

              <Link 
                href="/admin/database"
                className="group relative flex flex-col p-6 border border-slate-900 bg-slate-950/40 hover:bg-purple-500/5 hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-purple-500 group-hover:h-full transition-all duration-300" />
                <div className="flex justify-between items-start mb-6">
                  <div className="text-purple-500/60 transition-all duration-300 group-hover:text-purple-500">
                    <Database size={24} strokeWidth={1.5} />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-purple-500 tracking-widest uppercase">Raw_Data_Access</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <h2 className="text-[11px] font-black group-hover:text-white text-slate-300 uppercase tracking-widest mb-1">
                    Database_Explorer
                  </h2>
                  <p className="text-[8px] text-slate-600 uppercase font-bold tracking-tighter">View Table Structures & Raw Rows</p>
                </div>
              </Link>
            </div>

            {/* Migration Notice */}
            <div className="mt-12 p-4 border border-emerald-900/30 bg-emerald-950/10 rounded">
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-2">
                Migration Notice
              </p>
              <p className="text-[9px] text-emerald-600/80 leading-relaxed">
                The <span className="text-emerald-300 font-bold">Timeline Events v2</span> module uses the new join-table architecture. 
                Legacy incidents remain accessible via <span className="text-slate-400">Timeline Events [Legacy]</span>. 
                New incidents should be created in v2.
              </p>
            </div>

            <footer className="mt-16 pt-6 border-t border-slate-900/50 flex justify-between items-center">
               <p className="text-[9px] text-slate-700 tracking-[0.3em] uppercase">
                 WETHEPEEPS // DATA_INTEGRITY_PROTOCOL
               </p>
               <p className="text-[8px] text-slate-800 font-mono uppercase">
                 Redford_Node_Deployment
               </p>
            </footer>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}