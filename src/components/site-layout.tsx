import ArchiveSidebar from './archive-sidebar';
import Logo from './ui/logo';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-slate-300 font-mono">
      {/* Left Sidebar - Now using the imported ArchiveSidebar */}
      <aside className="hidden lg:flex w-80 h-screen sticky top-0 border-r border-slate-900 bg-black flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-900">
           <Logo />
        </div>
        <ArchiveSidebar />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center py-12 px-6 md:px-12 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}