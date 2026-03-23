"use client";
import React from 'react';
import Link from 'next/link'; // This was the missing line causing your errors

const tables = ['entities', 'actors', 'incidents', 'content', 'statutes', 'media'];

export default function AdminHub() {
  return (
    <div className="min-h-screen bg-black p-8 font-mono">
      <h1 className="text-[#4A90E2] text-2xl font-bold mb-8 uppercase tracking-tighter">
        System_Registry_Control
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tables.map(table => (
          <Link 
            href={`/admin/db/${table}`} 
            key={table} 
            className="border border-slate-800 p-6 hover:border-[#4A90E2] transition-all bg-slate-900/20 group"
          >
            <h2 className="text-white uppercase font-bold group-hover:text-[#4A90E2]">
              {table}
            </h2>
            <p className="text-[10px] text-slate-500 mt-2">
              ACCESS_SECTOR_{table.toUpperCase()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}