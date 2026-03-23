// src/components/site-layout.tsx
import ArchiveSidebar from './archive-sidebar';
import Logo from './ui/logo';
import Link from 'next/link';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-slate-300 font-mono">
      {/* Left Sidebar */}
      <aside className="w-80 h-screen sticky top-0 border-r border-slate-900 bg-black flex flex-col">
         {/* ... sidebar logo and content ... */}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center py-12 px-6 md:px-12 overflow-y-auto no-scrollbar">
        {/* Adding 'overflow-y-auto' and 'no-scrollbar' here ensures the 
            dossier scrolls smoothly without the white bars appearing.
        */}
        <div className="w-full max-w-4xl lg:mr-32">
          {children}
        </div>
      </main>
    </div>
  );
}