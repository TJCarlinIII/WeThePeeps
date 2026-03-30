export const dynamic = "force-dynamic";

import LogoMain from '@/components/ui/logo-main';
import Link from 'next/link';
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface EntityNode {
  name: string;
  slug: string;
  sector: string;
}

export const metadata = {
  title: "WeThePeeps | Whistleblower Evidence & Michigan True Crime Archive",
  description: "Primary source database documenting medical neglect, systemic abuse of power, and government accountability failures in Redford Township and Michigan.",
  keywords: [
    // --- CORE BRAND & LOCATION ---
    "WeThePeeps Transparency Project",
    "Redford Township Whistleblower",
    "Michigan Government Accountability",
    "Evidence-Backed Investigations",

    // --- EXECUTIVE & STATE-LEVEL ACCOUNTABILITY ---
    "Governor Gretchen Whitmer healthcare oversight",
    "Dana Nessel Attorney General vulnerable adult protection",
    "Elizabeth Hertel MDHHS Director accountability",
    "Michigan LARA doctor licensing protection",
    "MSP Michigan State Police evidence suppression",
    "MDHHS policy-driven medical neglect",
    "Michigan Executive Branch systemic failure",
    "Dana Nessel LGBTQ+ advocacy vs medical battery",
    "Elizabeth Hertel concealment of institutional abuse",

    // --- BOARD & LEADERSHIP CONNECTIONS ---
    "Pat McRae Western Wayne Board",
    "Wayne County Transit Authority Board of Directors",
    "Corewell Health Farmington Hills Community Advisory Board",
    "Pat McRae Corewell Health leadership",
    "Western Wayne County leadership accountability",
    "Conflict of interest Michigan public officials",
    "Interlocking directorates Michigan healthcare and government",
    
    // --- MANSFIELD PRIVATE & NON-PROFIT LINKS ---
    "Jennifer Mansfield Coeus Creative Group Partner",
    "Coeus Creative Group Redford Police connection",
    "SOAP Redford Save Our Adolescents from Prostitution",
    "Jennifer Mansfield Human Trafficking trainer",
    "Behavioral Intelligence training police misconduct",
    "Jennifer Mansfield Livonia MI business address",

    // --- PROSECUTION & DEFENSE INTERLOCKS ---
    "Michael Bosnic Redford Township Prosecutor",
    "Garan Lucow Miller PC insurance defense",
    "Michael Bosnic Garan Lucow Miller shareholder",
    "Conflict of interest contracted prosecutors Michigan",
    "Insurance defense and healthcare law nexus",
    "Michael Bosnic legal malpractice defense",
    "Redford Township outsourced legal services",
    "Garan Lucow Miller healthcare liability protection",

    // --- KEY FIGURES & CASES ---
    "Traci Kornak abuse neglect case", 
    "Jennifer Mansfield Redford Police Chief", 
    "Karla Sanders Redford Clerk FOIA",
    "Dana Nessel Vulnerable Adult Protection review",
    "Charlie LeDuff Michigan investigations",
    "Irvin Gastman DO medical charges",
    "Mark Buisson Redford Police",
    
    // --- SYSTEMIC ISSUES (Searchable Phrases) ---
    "Michigan Medicaid Fraud investigation",
    "Medical Battery Michigan hospitals",
    "Adult Protective Services failures Michigan",
    "Tandem365 predatory practices",
    "Corewell Health medical neglect reports",
    "Henry Ford Health System accountability",
    "Michigan LARA doctor complaints",
    "Weaponized mental health healthcare system",
    "Vulnerable adult rights Michigan",
    "FOIA falsification government transparency",
    "LGBTQ+ healthcare discrimination Michigan",

    // --- REGULATORY & OVERSIGHT FAILURES ---
    "Michigan LARA doctor complaint archive",
    "LARA Bureau of Community and Health Systems accountability",
    "Michigan Adult Protective Services medical neglect",
    "APS Michigan vulnerable adult gaslighting",
    "MDHHS APS and hospital collusion",
    "Michigan Licensing and Regulatory Affairs transparency",
    "How to sue LARA for failure to regulate",
    "LARA BPL medical practitioner oversight",
    "Michigan APS emergency medical deprivation",

    // --- TACTICAL KEYWORDS ---
    "Medical Gaslighting Michigan",
    "Institutional Gaslighting",
    "Psychological weaponization in healthcare",
    "Falsified medical records for liability protection",
    "Clinical dismissal of emergency symptoms",
  ],
};

export default async function LandingPage() {
  let randomEntities: EntityNode[] = [];
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as { DB: D1Database };
    const { results } = await env.DB.prepare(
      "SELECT name, slug, sector FROM entities ORDER BY RANDOM() LIMIT 9"
    ).all();
    randomEntities = (results as unknown as EntityNode[]) || [];
  } catch (e) { console.error(e); }

  return (
    <div className="min-h-screen bg-black text-slate-300 font-mono flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <main className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center">
        
        {/* The Hook */}
        <div className="mb-12 space-y-3">
          <h1 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
            How Michigan&apos;s policies can turn a <br className="hidden md:block" />
            medical emergency into extreme violence.
          </h1>
          <div className="h-px w-24 bg-red-600/50 mx-auto" />
        </div>

        {/* CLICKABLE LOGO-MAIN GATEWAY */}
        <Link 
          href="/entities" 
          className="group transition-all duration-500 hover:scale-[1.02] active:scale-95 mb-12 block w-full"
        >
          <LogoMain />
        </Link>

        {/* Narrative Context */}
        <p className="max-w-xl text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.2em] leading-relaxed mb-12">
          An archive of public records documenting the 
          <span className="text-white font-black mx-1 italic">escalation of force</span> 
          against those seeking emergency assistance.
        </p>

        {/* Dynamic Database Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {randomEntities.length > 0 ? (
            randomEntities.map((entity) => (
              <Link 
                key={entity.slug}
                href={`/entities/${entity.slug}`}
                className="bg-slate-950/40 border border-slate-900 py-5 px-4 hover:border-[#4A90E2]/50 hover:bg-[#4A90E2]/5 transition-all group flex flex-col items-center justify-center gap-1"
              >
                <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Sector: {entity.sector}</span>
                <span className="text-[10px] text-slate-300 font-black tracking-tighter uppercase group-hover:text-[#4A90E2] transition-colors text-center">
                  {entity.name}
                </span>
              </Link>
            ))
          ) : (
            [...Array(9)].map((_, i) => (
              <div key={i} className="border border-slate-900/30 py-8 opacity-10 animate-pulse bg-slate-900/20" />
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="w-full pt-6 border-t border-slate-900/50 flex justify-between items-center">
          <p className="text-[8px] text-slate-700 tracking-[0.3em] uppercase">
            Relational_Randomizer: ACTIVE
          </p>
          <Link href="/entities" className="text-[#4A90E2] hover:text-white text-[9px] font-black tracking-widest uppercase flex items-center gap-2 group">
            Access Archive <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}