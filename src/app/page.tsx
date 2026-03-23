// src/app/page.tsx
import Logo from '@/components/ui/logo';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-300 font-mono flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <main className="relative z-10 max-w-5xl w-full text-center flex flex-col items-center">
        
        {/* TOP HOOK */}
        <div className="mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight">
            &ldquo;It began with a medical emergency.&rdquo;
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-red-600 uppercase tracking-widest">
            Ended in extreme violence.
          </h2>
        </div>

        {/* LOGO & CONSTITUTIONAL BADGE */}
        <div className="flex flex-col items-center my-10 space-y-6">
          <Logo size="text-6xl md:text-9xl" />
          <div className="border-y border-red-900 py-2 px-8">
            <span className="text-white text-xs md:text-sm font-black tracking-[0.6em] uppercase">
              Shall Not Be Infringed
            </span>
          </div>
        </div>

        {/* THE AR-15 STATEMENT */}
        <p className="max-w-2xl text-slate-400 text-sm md:text-lg uppercase tracking-tight leading-relaxed mb-16">
          How begging for emergency medical help can lead to an 
          <span className="text-white font-black underline decoration-red-600 mx-1">AR-15 in your face</span> 
          in Michigan.
        </p>

        {/* SEO ENTITY GRID: 9-Button Layout (3x3) */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 mb-20">
          {[
            { name: "Irvin Gastman", slug: "gastman" },
            { name: "Corewell Health", slug: "corewell" },
            { name: "Henry Ford", slug: "henry-ford" },
            { name: "Priority Health", slug: "priority-health" },
            { name: "Tandem 365", slug: "tandem" },
            { name: "Redford Township", slug: "redford-township" },
            { name: "Dana Nessel", slug: "nessel" },
            { name: "LARA", slug: "lara" },
            { name: "MDHHS / APS", slug: "mdhhs-aps" }
          ].map((entity) => (
            <Link 
              key={entity.slug}
              href={`/manifest#${entity.slug}`}
              className="bg-slate-950/60 border border-slate-800 py-6 px-4 hover:border-[#C4A77D] hover:bg-[#C4A77D]/10 transition-all group flex items-center justify-center"
            >
              <span className="text-xs md:text-sm text-[#C4A77D] font-black tracking-[0.2em] uppercase group-hover:text-white transition-colors text-center">
                {entity.name}
              </span>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="w-full pt-8 border-t border-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] text-slate-700 tracking-[0.4em] uppercase">
            Digital Chain of Custody // Case: 2022-11-22-GASTMAN-IRVIN
          </p>
          <Link href="/manifest" className="text-red-900 hover:text-red-500 text-[10px] font-black tracking-widest uppercase transition-colors">
            Initialize Access &rarr;
          </Link>
        </footer>
      </main>
    </div>
  );
}