// src/app/evidence/[id]/page.tsx
import { Metadata } from 'next';
import { getPublicEvidence } from '../../admin/actions';
import { EvidenceRecord } from '@/types';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const record = await getPublicEvidence(id);

  if (!record) return { title: 'Record Not Found | We The Peeps' };

  // SEO Text updated to remove underscores
  const seoTitle = `Evidence Entry: ${record.official} | ${record.title}`;
  const seoDesc = `Decentralized accountability archive concerning ${record.official}. Review the documentation on wethepeeps.net.`;

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
    }
  };
}

export default async function PublicEvidencePage({ params }: Props) {
  const { id } = await params;
  const record = await getPublicEvidence(id);

  if (!record) notFound();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono flex flex-col items-center">
      <article className="max-w-4xl w-full border border-slate-800 p-8 rounded-lg bg-slate-900/10">
        <header className="mb-8 border-b border-[#4A90E2]/30 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[#4A90E2] font-bold text-[10px] tracking-[0.3em] uppercase">Archive Entry: {record.id.toString().padStart(4, '0')}</span>
              {/* Cleaned 'official' name with spaces */}
              <h1 className="text-4xl font-black mt-2 tracking-tighter uppercase">{record.official}</h1>
              <p className="text-xl text-slate-400 mt-1">{record.title}</p>
            </div>
            {record.isCritical === 1 && (
              <div className="bg-red-600 text-white px-4 py-2 font-black text-xs animate-pulse uppercase shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                CRITICAL FINDING
              </div>
            )}
          </div>
          <div className="mt-6 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>Statute: <span className="text-white">{record.statute}</span></span>
          </div>
        </header>

        <div className="prose prose-invert max-w-none font-sans text-lg leading-relaxed whitespace-pre-wrap text-slate-300">
          {record.content}
        </div>

        <footer className="mt-12 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest">
          <span>Source: wethepeeps.net</span>
          <span>Verified: {new Date(record.created_at).toLocaleDateString()}</span>
        </footer>
      </article>
    </div>
  );
}