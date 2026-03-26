import React from 'react';
import Link from 'next/link';
import { getDB } from "@/lib/db";
import AdminGuard from "@/components/admin/AdminGuard";
import RevalidateButton from "@/components/admin/RevalidateButton";
import { Database, ShieldAlert, Users, Building, Gavel, FileText, FolderTree, LayoutGrid, RefreshCw } from "lucide-react";

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
      (SELECT COUNT(*) FROM sectors) as sectors
  `).first<{
    taxonomy: number;
    entities: number;
    actors: number;
    incidents: number;
    statutes: number;
    posts: number;
    sectors: number;
  }>();

  const TABLES = [
    { id: 'taxonomy', label: 'Taxonomy Architect', Icon: FolderTree, path: '/admin/taxonomy', count: stats?.taxonomy },
    { id: 'entities', label: 'Organizations', Icon: Building, path: '/admin/entities', count: stats?.entities },
    { id: 'actors', label: 'Individuals/Officials', Icon: Users, path: '/admin/actors', count: stats?.actors },
    { id: 'incidents', label: 'Timeline Events', Icon: ShieldAlert, path: '/admin/incidents', count: stats?.incidents },
    { id: 'statutes', label: 'Legal Statutes', Icon: Gavel, path: '/admin/statutes', count: stats?.statutes },
    { id: 'posts', label: 'Articles', Icon: FileText, path: '/admin/posts', count: stats?.posts },
    { id: 'sectors', label: 'Sectors', Icon: LayoutGrid, path: '/admin/sectors', count: stats?.sectors },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white p-8 font-mono">
        <div className="max-w-6xl mx-auto">
          
          <header className="mb-10 border-b border-slate-900 pb-6">
            <h1 className="text-2xl font-bold tracking-tighter text-[#4A90E2] uppercase">
              WTP_DASHBOARD
            </h1>
            <p className="text-[10px] text-slate-500 uppercase mt-1 font-bold tracking-[0.2em]">
              System Health: Active // Data Ingress Control
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* REGULAR TABLE TILES */}
            {TABLES.map((table) => (
              <Link
                key={table.id}
                href={table.path}
                className="group relative flex flex-col p-6 border border-slate-900 bg-slate-950/40 hover:bg-[#4A90E2]/5 hover:border-[#4A90E2]/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-[#4A90E2] group-hover:h-full transition-all duration-300" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="text-[#4A90E2]/60 transition-all duration-300 group-hover:text-[#4A90E2] group-hover:scale-110">
                    <table.Icon size={32} strokeWidth={1.5} />
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white tracking-tighter">
                      {table.count ?? 0}
                    </span>
                    <p className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Records</p>
                  </div>
                </div>

                <div className="mt-auto">
                  <h2 className="text-sm font-black group-hover:text-white text-slate-300 uppercase tracking-widest transition-colors">
                    {table.label}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-[1px] w-4 bg-slate-800 group-hover:w-8 group-hover:bg-[#4A90E2] transition-all" />
                    <p className="text-[9px] text-slate-600 font-bold group-hover:text-slate-400 uppercase">
                      ACCESS_REGISTRY_{table.id.toUpperCase()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {/* CONVERTED CACHE BUTTON TILE */}
            <div className="group relative flex flex-col p-6 border border-slate-900 bg-slate-950/40 hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-1 h-0 bg-emerald-500 group-hover:h-full transition-all duration-300" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="text-emerald-500/60 transition-all duration-300 group-hover:text-emerald-500 group-hover:rotate-180">
                  <RefreshCw size={32} strokeWidth={1.5} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">
                    System_Sync
                  </span>
                  <p className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Global</p>
                </div>
              </div>

              <div className="mt-auto">
                <h2 className="text-sm font-black group-hover:text-white text-slate-300 uppercase tracking-widest mb-2">
                  Cache Control
                </h2>
                {/* Wrapping your existing component logic here */}
                <RevalidateButton />
              </div>
            </div>
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
      </div>
    </AdminGuard>
  );
}