// src/app/entities/[slug]/page.tsx
export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";
import DossierCard from "@/components/blocks/DossierCard";
import IntelligenceFeed from "@/components/blocks/IntelligenceFeed";
import type { D1Database } from "@cloudflare/workers-types";
import type { SubjectStatus } from "@/lib/database-types"; // ✅ Import the canonical status type

interface EntityProfile {
  id: number;
  name: string;
  sector: string;
  description: string;
  slug: string;
  sector_id: number;
  has_falsified?: number;
}

interface AssociatedActor {
  id: number;
  full_name: string;
  job_title: string;
  status: string; // ✅ Keep as string for raw DB fetch — cast later
  slug: string;
  uid?: string;
}

interface SectorEvidence {
  id: number;
  title: string;
  description: string; // ✅ Added to fix missing field error
  official: string;
  created_at: string;
  isCritical: number;
}

export default async function EntityProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // 1. Fetch Entity with Falsification flag
  const entity = await env.DB.prepare(`
    SELECT e.*, s.name as sector, COALESCE(e.history_of_falsification, 0) as has_falsified
    FROM entities e 
    LEFT JOIN sectors s ON e.sector_id = s.id 
    WHERE e.slug = ? OR e.name = ?
  `).bind(decodedSlug, decodedSlug).first<EntityProfile>();

  if (!entity) return notFound();

  // 2. Parallel Fetch for Dossiers and Incidents
  const [actorsRes, evidenceRes] = await Promise.all([
    env.DB.prepare(`
      SELECT a.*, 'WTP-' || substr('00000' || a.id, -5, 5) AS uid
      FROM actors a 
      WHERE a.entity_id = ? 
      ORDER BY a.full_name ASC
    `).bind(entity.id).all<AssociatedActor>(),
    env.DB.prepare(`
      SELECT i.id, i.title, i.description, a.full_name as official, i.event_date as created_at, i.is_critical as isCritical 
      FROM incidents i
      LEFT JOIN actors a ON i.actor_id = a.id
      WHERE i.entity_id = ?
      ORDER BY i.event_date DESC LIMIT 16
    `).bind(entity.id).all<SectorEvidence>()
  ]);

  const actors = actorsRes.results || [];
  const incidents = evidenceRes.results || [];

  // --- SCHEMA GENERATION ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: entity.name,
    description: entity.description || `Whistleblower evidence and personnel registry for ${entity.name}.`,
    url: `https://wethepeeps.net/entities/${entity.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Redford',
      addressRegion: 'MI',
    },
    subjectOf: incidents.map(log => ({
      '@type': 'Report',
      headline: log.title,
      datePublished: log.created_at,
      author: {
        '@type': 'Person',
        name: log.official
      }
    }))
  };

  return (
    <main className="min-h-screen bg-black text-slate-300 font-mono">
      {/* SEO STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Header with Falsification Warning */}
      <header className="border-b border-[#4A90E2]/20 bg-slate-900/10 p-10 md:p-20 relative overflow-hidden">
        {entity.has_falsified === 1 && (
          <div className="absolute top-4 right-4 border border-red-900 bg-red-950/30 text-red-500 font-mono text-[10px] px-3 py-1 font-bold uppercase tracking-widest animate-pulse z-10">
            ⚠️ Institutional Falsification Warning
          </div>
        )}
        
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/entities" className="text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.3em] mb-8 block hover:text-white transition-colors">
            {`\u2190 Return_To_Entities`}
          </Link>
          
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">
            {entity.name}
          </h1>
          
          <p className="text-lg leading-relaxed text-slate-400 border-l-2 border-[#D4AF37] pl-6 max-w-3xl">
            {entity.description || "Institutional node under active monitoring."}
          </p>
        </div>
      </header>

      {/* 2. Personnel Section (Dossier Cards) */}
      <div className="max-w-7xl mx-auto p-10">
        {actors.length > 0 && (
          <section className="mb-20">
            <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-slate-900 pb-2">
              ▶ Documented Personnel ({actors.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {actors.map((actor: AssociatedActor) => (
                <DossierCard 
                  key={actor.id} 
                  dossier={{
                    id: actor.id,
                    uid: actor.uid || `WTP-${String(actor.id).padStart(5, '0')}`,
                    full_name: actor.full_name,
                    job_title: actor.job_title,
                    agency_name: entity.name,
                    agency_slug: entity.slug,
                    // ✅ Cast to canonical SubjectStatus type — matches DossierCard expectations
                    status: actor.status as SubjectStatus,
                    incident_count: 0,
                    statute_count: 0,
                    slug: actor.slug,
                    history_of_falsification: 0
                  }} 
                />
              ))}
            </div>
          </section>
        )}

        {/* 3. Evidence Feed */}
        <section>
          <h2 className="text-[#4A90E2] font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-slate-900 pb-2">
            ▶ Evidence Manifest ({incidents.length})
          </h2>
          <IntelligenceFeed incidents={incidents.map(i => ({
            id: i.id,
            title: i.title,
            event_date: i.created_at,
            description: i.description || '', // ✅ Now populated from DB
            entity_id: entity.id,
            entity_name: entity.name,
            entity_slug: entity.slug,
            is_critical: i.isCritical,
            slug: '',
            has_verified_evidence: 0,
            moral_violation_type: null
          }))} />
        </section>

        {/* Empty state if no data */}
        {actors.length === 0 && incidents.length === 0 && (
          <div className="border border-dashed border-slate-800 p-20 text-center text-slate-600 text-xs uppercase font-mono">
            No personnel or incidents documented for this entity yet.
          </div>
        )}
      </div>
    </main>
  );
}