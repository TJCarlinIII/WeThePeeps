import { Metadata } from 'next';
import { getPublicEvidence } from '../../admin/actions';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const record = await getPublicEvidence(id);
  if (!record) return { title: 'Record Not Found | We The Peeps' };

  const seoTitle = `Evidence Entry: ${record.official} | ${record.title}`;
  const seoDesc = `Decentralized accountability archive concerning ${record.official}.`;

  return {
    title: seoTitle,
    description: seoDesc,
  };
}

export default async function PublicEvidencePage({ params }: Props) {
  const { id } = await params;
  const record = await getPublicEvidence(id);

  if (!record) notFound();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono flex flex-col items-center">
      <article className="max-w-4xl w-full border border-slate-900 bg-slate-900/5 p-10 relative">
        {/* Aesthetic Branding */}
        <div className="absolute top-4 right-6 text-[8px] text-slate-800 font-black tracking-[0.5em] uppercase">
          WTP_INTERNAL_ARCHIVE
        </div>

        <header className="mb-10 border-b border-slate-900 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-[#4A90E2] font-black text-[10px] tracking-[0.4em] uppercase">
                ENTRY_ID: {record.id.toString().padStart(4, '0')}
              </span>
              {/* FIXED: Removed duplicate 'italic' class here */}
              <h1 className="text-5xl font-black mt-4 tracking-tighter uppercase italic">
                {record.official}
              </h1>
              <p className="text-xl text-slate-500 mt-2 font-sans italic">{record.title}</p>
            </div>
            {record.isCritical === 1 && (
              <div className="bg-red-950/20 border border-red-600 text-red-500 px-6 py-3 font-black text-xs animate-pulse uppercase tracking-[0.2em]">
                CRITICAL_FINDING
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="font-sans text-lg leading-relaxed whitespace-pre-wrap text-slate-300 border-l border-slate-900 pl-8 py-4">
          {record.content}
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-900 grid grid-cols-2 gap-4 text-[9px] text-slate-600 uppercase tracking-widest font-black">
          <div className="flex flex-col gap-1">
            <span className="text-slate-800">Source_Node:</span>
            <span>wethepeeps.net</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-slate-800">Verification_Date:</span>
            <span>{new Date(record.created_at).toLocaleDateString()}</span>
          </div>
        </footer>
      </article>
    </div>
  );
}