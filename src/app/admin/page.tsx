"use client";

export const dynamic = "force-dynamic";

import React from 'react';
import Link from 'next/link';
import AdminGuard from "@/components/admin/AdminGuard";

const TABLES = [
  { id: 'entities', label: 'Organizations', icon: '🏢' },
  { id: 'actors', label: 'Individuals/Officials', icon: '👤' },
  { id: 'incidents', label: 'Timeline Events (Evidence)', icon: '📅' },
  { id: 'evidence', label: 'Evidence/Media', icon: '📎' },
  { id: 'statutes', label: 'Legal Statutes (MCL)', icon: '⚖️' },
  { id: 'posts', label: 'Long-form Articles', icon: '📝' },
  { id: 'sectors', label: 'Sectors', icon: '📂' },
];

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white p-8 font-mono">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 border-b border-[#4A90E2]/20 pb-6">
            <h1 className="text-2xl font-bold tracking-tighter text-[#4A90E2] uppercase">
              Master_DB_Utilities
            </h1>
            <p className="text-[10px] text-slate-500 uppercase mt-2 font-bold tracking-widest">
              Select Sector for Data Ingress // We The Peeps
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TABLES.map((table) => (
              <Link
                key={table.id}
                href={`/admin/db/${table.id}`}
                className="group border border-slate-800 p-6 rounded-lg hover:border-[#4A90E2] transition-all bg-slate-900/20 hover:bg-slate-900/40"
              >
                <div className="text-3xl mb-4">{table.icon}</div>
                <h2 className="text-lg font-bold group-hover:text-[#4A90E2] uppercase">
                  {table.label}
                </h2>
                <p className="text-[10px] text-slate-600 mt-2 font-bold">
                  ACCESS_REGISTRY_{table.id.toUpperCase()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}