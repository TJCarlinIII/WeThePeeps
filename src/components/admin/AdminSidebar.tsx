"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { id: 'entities', label: 'ENTITIES', icon: '🏢' },
  { id: 'sectors', label: 'SECTORS', icon: '📂' },
  { id: 'posts', label: 'POSTS', icon: '📝' },
  { id: 'actors', label: 'ACTORS', icon: '👤' },
  { id: 'statutes', label: 'STATUTES', icon: '⚖️' },
  // Changed id from 'media' to 'evidence' to match your folder structure
  { id: 'evidence', label: 'EVIDENCE', icon: '📎' }, 
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 border-r border-slate-900 bg-black flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-900">
        <h2 className="text-[#4A90E2] font-black tracking-tighter text-lg uppercase">
          WTP_CORE
        </h2>
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          AUTH_LEVEL_01
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link 
          href="/admin"
          className={`flex items-center gap-3 px-4 py-3 border transition-all text-[11px] font-bold ${
            pathname === '/admin' 
            ? 'border-[#4A90E2] bg-[#4A90E2]/10 text-[#4A90E2]' 
            : 'border-transparent text-slate-500 hover:border-slate-800 hover:text-slate-300'
          }`}
        >
          <span>📊</span> DASHBOARD
        </Link>

        <div className="h-px bg-slate-900 my-4 mx-2" />

        {NAV_ITEMS.map((item) => {
          const href = `/admin/db/${item.id}`;
          const isActive = pathname === href;

          return (
            <Link
              key={item.id}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 border transition-all text-[11px] font-bold uppercase tracking-tight ${
                isActive 
                ? 'border-[#4A90E2] bg-[#4A90E2]/5 text-[#4A90E2]' 
                : 'border-slate-900/0 text-slate-500 hover:border-slate-800 hover:text-slate-300 hover:bg-slate-900/20'
              }`}
            >
              <span className="text-sm opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-900">
        <button
          onClick={logout}
          className="w-full border border-red-900/30 py-3 text-[10px] font-black text-red-700 hover:bg-red-900/10 hover:border-red-600 transition-all uppercase tracking-widest"
        >
          TERMINATE_SESSION
        </button>
      </div>
    </aside>
  );
}