import React from 'react';
import Navbar from './Navbar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="border-t border-slate-900 p-8 text-center text-[9px] text-slate-600 font-mono uppercase tracking-[0.5em]">
        We The Peeps // Redford, MI // {new Date().getFullYear()}
      </footer>
    </div>
  );
}