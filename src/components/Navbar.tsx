"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Manifest', path: '/evidence' },
    { name: 'Sectors', path: '/sectors' },
    { name: 'Codex', path: '/statutes' },    
    { name: 'Entities', path: '/entities' },
    { name: 'Personnel', path: '/actors' },  
  ];

  return (
    <nav className="w-full bg-black border-b border-[#4A90E2]/20 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-black/80">
      <div className="flex items-center gap-10">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-2 h-2 bg-[#4A90E2] rotate-45 group-hover:scale-125 transition-transform" />
          <span className="text-white font-black tracking-tighter text-xl italic group-hover:text-[#4A90E2] transition-colors">
            WE THE PEEPS
          </span>
        </Link>

        <div className="hidden lg:flex gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || pathname?.startsWith(`${link.path}/`);
            return (
              <Link 
                key={link.path}
                href={link.path}
                className={`group relative text-[9px] font-black uppercase tracking-[0.3em] transition-all ${
                  isActive ? 'text-[#4A90E2]' : 'text-slate-500 hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#4A90E2] rounded-full shadow-[0_0_8px_#4A90E2]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="lg:hidden text-[8px] font-mono text-slate-700 uppercase px-2 border border-slate-900 py-1">
          Node_Active
        </div>
        
        <Link 
          href="/admin/add-evidence" 
          className="text-[9px] border border-slate-800 px-4 py-2 text-slate-500 hover:border-[#4A90E2] hover:text-[#4A90E2] hover:bg-[#4A90E2]/5 transition-all font-mono uppercase tracking-widest"
        >
          Terminal_Auth
        </Link>
      </div>
    </nav>
  );
}