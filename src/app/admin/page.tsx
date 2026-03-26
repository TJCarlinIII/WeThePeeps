import React from 'react';
import Link from 'next/link';
import { getDB } from "@/lib/db";
import AdminGuard from "@/components/admin/AdminGuard";
import RevalidateButton from "@/components/admin/RevalidateButton";

export default async function AdminPage() {
  // Use our new helper - cleaner than manual context casting
  const db = await getDB();

  // Fetch the counts for our tiles
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
    { id: 'taxonomy', label: 'Taxonomy Architect', icon: '🧬', path: '/admin/taxonomy', count: stats?.taxonomy },
    { id: 'entities', label: 'Organizations', icon: '🏢', path: '/admin/entities', count: stats?.entities },
    { id: 'actors', label: 'Individuals/Officials', icon: '👤', path: '/admin/actors', count: stats?.actors },
    { id: 'incidents', label: 'Timeline Events', icon: '📅', path: '/admin/incidents', count: stats?.incidents },
    { id: 'statutes', label: 'Legal Statutes', icon: '⚖️', path: '/admin/statutes', count: stats?.statutes },
    { id: 'posts', label: 'Articles', icon: '📝', path: '/admin/posts', count: stats?.posts },
    { id: 'sectors', label: 'Sectors', icon: '📂', path: '/admin/sectors', count: stats?.sectors },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white p-8 font-mono">
        <div className="max-w-5xl mx-auto">
          
          <header className="mb-10 border-b border-[#4A90E2]/20 pb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-[#4A90E2] uppercase">
                Master_DB_Utilities
              </h1>
              <p className="text-[10px] text-slate-500 uppercase mt-2 font-bold tracking-widest">
                System Health: Active // Data Ingress Control
              </p>
            </div>
            
            {/* Added the Global Cache Control Button here */}
            <div className="pb-1">
              <RevalidateButton />
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TABLES.map((table) => (
              <Link
                key={table.id}
                href={table.path}
                className="group border border-slate-800 p-6 rounded-lg hover:border-[#4A90E2] transition-all bg-slate-900/20 hover:bg-slate-900/40"
              >
                <div className="flex justify-between items-start">
                  <div className="text-3xl mb-4 transition-transform group-hover:scale-110">
                    {table.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">
                      {table.count ?? 0}
                    </span>
                    <p className="text-[8px] text-slate-500 uppercase">Records</p>
                  </div>
                </div>
                <h2 className="text-lg font-bold group-hover:text-[#4A90E2] uppercase">
                  {table.label}
                </h2>
                <p className="text-[10px] text-slate-600 mt-2 font-bold">
                  ACCESS_REGISTRY_{table.id.toUpperCase()}
                </p>
              </Link>
            ))}
          </div>

          <footer className="mt-12 pt-6 border-t border-slate-900 text-center">
             <p className="text-[9px] text-slate-700 tracking-[0.2em] uppercase">
               WETHEPEEPS // DATA_INTEGRITY_PROTOCOL_V3
             </p>
          </footer>
        </div>
      </div>
    </AdminGuard>
  );
}