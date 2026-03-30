export const dynamic = "force-dynamic";

import { ALL_KEYWORDS } from "@/lib/seo-keywords";
import LogoMain from '@/components/ui/logo-main';
import Link from 'next/link';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// UI Components
import ChapterArticle from '@/components/ui/chapter-article';
import SidebarWidget from '@/components/ui/sidebar-widget'; 
import AuthorBio from '@/components/ui/author-bio';
import { NeglectCounter, SSAStatus } from '@/components/ui/status-widgets';

interface EntityNode {
  name: string;
  slug: string;
  sector: string;
}

export const metadata = {
  title: "WeThePeeps | Whistleblower Evidence & Michigan True Crime Archive",
  description: "Primary source database documenting medical neglect, systemic abuse of power, and government accountability failures in Redford Township and Michigan.",
  keywords: ALL_KEYWORDS,
};

export default async function LandingPage() {
  let randomEntities: EntityNode[] = [];
  
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as { DB: D1Database };
    
    if (env?.DB) {
      const { results } = await env.DB.prepare(
        "SELECT name, slug, sector FROM entities ORDER BY RANDOM() LIMIT 9"
      ).all();
      randomEntities = (results as unknown as EntityNode[]) || [];
    }
  } catch (e) { 
    console.error("Database Connection Failed:", e); 
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-mono flex flex-col items-center p-4 md:p-8 lg:p-12 overflow-x-hidden relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:clamp(40px,5vw,80px)_clamp(40px,5vw,80px)] pointer-events-none" />

      <main className="relative z-10 w-full max-w-[90vw] lg:max-w-[1600px] flex flex-col mx-auto">
        
        {/* MASTHEAD */}
        <header className="flex flex-col items-center pt-4 text-center">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <LogoMain className="scale-90 md:scale-110 lg:scale-125 origin-center" />
          </Link>
          
          <div className="w-full mt-10 space-y-1">
            <div className="h-[2px] bg-red-900/40 w-full" />
            <div className="flex flex-col md:flex-row justify-between items-center py-2 px-2 text-[10px] lg:text-[clamp(10px,0.8vw,14px)] uppercase tracking-[0.2em] text-slate-500 font-mono gap-2">
               <span className="text-red-700 font-black">● 8th & 15th AMENDMENT VIOLATIONS ACTIVE</span>
               <span className="hidden md:block text-slate-600">Detroit Metro Archive: Case #2022-11-22</span>
               <span className="text-[#4A90E2] font-semibold">Baseline: IT MASTER (1997-2022)</span>
            </div>
            <div className="h-[1px] bg-red-900/20 w-full" />
          </div>
        </header>

        {/* Separator */}
        <div className="w-full mx-auto my-12 px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent mb-1" />
          <div className="h-[2px] bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-6 lg:gap-12">
          
          {/* LEFT: STORY ARCHIVE (MAIN CONTENT) */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-16 lg:space-y-24">
            
            <ChapterArticle 
              label="Chapter I: The Medical Assault"
              title="From IT Master to Clinical Collapse: The 20-Minute Window"
              description="On Nov 22, 2022, a 25-year career in systems architecture was dismantled. Trace the immediate onset of 'Buzzing Teeth' and amnesia that Irvin Gastman re-labeled as 'Anger' to justify clinical abandonment."
              borderColor="border-red-900"
              labelColor="text-red-600"
              isTextured={true}
              linkHref="/stories/gastman-origin"
              linkText="View Evidence Log"
            />

            <ChapterArticle 
              label="Chapter II: Regulatory Perjury"
              title="The Paper Wall: How LARA Aided a Cover-Up"
              description="Gastman lied to the board about appointment history while life-critical records (Ischemia/Obstruction) were withheld for months. Explore the documentation that LARA ignored."
              borderColor="border-slate-800"
              labelColor="text-slate-500"
              linkHref="/stories/lara-coverup"
              linkText="Examine Correspondence"
            />

            <ChapterArticle 
              label="Resource: Legal Sovereignty"
              title="How to Execute a No-Cost FOIA Request"
              description="Your right to know. Step-by-step template for requesting public records from Redford Township, MDHHS, and LARA — with legal citations and sample language."
              borderColor="border-[#4A90E2]"
              labelColor="text-[#4A90E2]"
              linkHref="/resources/foia-template"
              linkText="Download Template"
            />

            {/* AUTHOR BIO MOVED HERE: Bottom of main content, better for SEO and accessibility */}
            <div className="pt-12 border-t border-slate-900/50">
               <AuthorBio />
            </div>

          </div>

          {/* RIGHT: SIDEBAR — CLEAN & URGENT */}
          <aside className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-8">
            
            {/* Massive visibility widgets first */}
            <NeglectCounter />
            
            <SSAStatus />

            <SidebarWidget 
              title="Cognitive Baseline Analysis" 
              variant="default"
              label="Functional Alert"
            >
               <div className="space-y-6">
                 <div>
                   <span className="text-slate-500 text-sm uppercase block mb-2 tracking-wide">1997 - 2022 Capability</span>
                   <p className="text-white font-bold text-lg uppercase">IT Master / Systems Infrastructure</p>
                 </div>
                 <div className="h-px bg-slate-800" />
                 <div>
                   <span className="text-red-600 text-sm uppercase block mb-2 tracking-wide">Post-Injury Status (Current)</span>
                   <p className="text-slate-400 text-xs italic leading-relaxed">
                    {' "6 weeks to complete standard Windows 11 installation." '}
                   </p>
                 </div>
               </div>
            </SidebarWidget>

            <SidebarWidget title="⚡ Quick Action" variant="action">
              <p className="text-slate-200 text-base leading-relaxed mb-4 font-semibold">
                Need records now? Use our pre-filled FOIA generator.
              </p>
              <Link 
                href="/tools/foia-generator" 
                className="block w-full text-center bg-[#4A90E2] hover:bg-[#3a7fc2] text-black font-bold text-base uppercase py-4 transition-all"
              >
                Generate Request
              </Link>
            </SidebarWidget>

          </aside>
        </div>

        {/* FOOTER */}
        <footer className="mt-24 lg:mt-32 pt-8 border-t border-slate-900/50">
           {/* ... Entity Grid remains as is ... */}
        </footer>

        {/* JSON-LD remains at bottom */}
      </main>
    </div>
  );
}