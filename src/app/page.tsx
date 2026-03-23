// src/app/page.tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-300 font-mono flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <main className="relative z-10 max-w-4xl w-full text-center">
        <header className="mb-16 flex flex-col items-center">
        <div className="inline-block border border-[#4A90E2] px-3 py-1 text-[10px] font-bold text-[#4A90E2] tracking-[0.3em] uppercase mb-4 animate-pulse">
          System Status: Operational
        </div>

        {/* THE MASKED TITLE */}
        <h1 
          className="text-5xl md:text-8xl font-black tracking-tighter uppercase bg-cover bg-center bg-no-repeat leading-none"
          style={{ 
            backgroundImage: 'url(/american-flag.jpg)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          We The Peeps
        </h1>

        {/* THE SUBTITLE */}
        <p className="italic mt-2 text-[20px] md:text-[20px] font-bold tracking-[0.4em] text-[#C4A77D] uppercase border-b border-slate-800 pb-4 mb-6 leading-none">
          Shall not be infringed...
        </p>

        <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
          A decentralized ledger of official accountability. 
          <br />Transparency is the only prerequisite for trust.
        </p>
      </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Public Search Entry (Removed underscores) */}
          <Link href="/evidence" className="group relative p-8 border border-slate-800 bg-slate-900/20 hover:border-[#4A90E2] transition-all overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[8px] text-slate-700 group-hover:text-[#4A90E2]">SECTOR_01</div>
            <h2 className="text-xl font-bold text-white uppercase group-hover:text-[#4A90E2] transition-colors">Archive Access</h2>
            <p className="text-[10px] mt-2 text-slate-500 uppercase tracking-tighter">Search public records and FOIA data.</p>
          </Link>

          {/* Admin/Ingress Entry (Removed underscores) */}
          <Link href="/admin/add-evidence" className="group relative p-8 border border-slate-800 bg-slate-900/20 hover:border-red-900/50 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[8px] text-slate-700 group-hover:text-red-500">AUTH_REQ</div>
            <h2 className="text-xl font-bold text-white uppercase group-hover:text-red-500 transition-colors">Evidence Submission</h2>
            <p className="text-[10px] mt-2 text-slate-500 uppercase tracking-tighter">Official document ingress (Requires Auth).</p>
          </Link>
        </div>

        <footer className="mt-20 text-[9px] text-slate-700 tracking-[0.5em] uppercase">
          Detroit Region // Redford MI // Est 2026
        </footer>
      </main>
    </div>
  );
}