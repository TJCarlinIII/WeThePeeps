"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/db', icon: '⫷' },
  { name: 'Entities', path: '/admin/db/entities', icon: '◈' },
  { name: 'Sectors', path: '/admin/db/sectors', icon: '▤' },
  { name: 'Posts', path: '/admin/db/posts', icon: '▣' },
  { name: 'Actors', path: '/admin/db/actors', icon: '▲' },
  { name: 'Actor Types', path: '/admin/db/actor-types', icon: '△' },
  { name: 'Statutes', path: '/admin/db/statutes', icon: '⚖' },
  { name: 'Evidence', path: '/admin/db/evidence', icon: '🔗' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 border-r border-slate-800 bg-black flex flex-col h-screen sticky top-0 font-mono">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-white font-black text-sm tracking-[0.2em]">WTP_CORE</h1>
        <p className="text-[#4A90E2] text-[8px] mt-1 uppercase tracking-widest">Auth_Level_01</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={`px-6 py-3 flex items-center gap-3 text-[10px] uppercase tracking-widest transition-all group ${
                isActive ? 'text-[#4A90E2] bg-slate-900/40 border-r-2 border-[#4A90E2]' : 'text-slate-500 hover:text-white hover:bg-slate-900/20'
              }`}>
                <span className="text-xs opacity-50 group-hover:opacity-100">{item.icon}</span>
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-900">
        <button 
          onClick={logout}
          className="w-full text-red-500 text-[9px] border border-red-900/30 py-2 hover:bg-red-900/10 transition-all uppercase font-bold"
        >
          Terminate_Session
        </button>
      </div>
    </aside>
  );
}