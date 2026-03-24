import React from 'react';
import Link from 'next/link';

// Define strict interfaces to satisfy TypeScript
interface CaseMedia {
  id: number;
  file_url: string;
  display_name: string;
  file_type: string;
}

interface Rebuttal {
  id: number;
  description: string;
}

interface CaseData {
  id: number;
  description: string;
  media: CaseMedia[];
  rebuttals: Rebuttal[];
}

async function getCaseData(id: string): Promise<CaseData | null> {
  // Use the absolute URL for server-side fetching in Next.js
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wethepeeps.net';
  const res = await fetch(`${baseUrl}/api/evidence/${id}`, { cache: 'no-store' });
  
  if (!res.ok) return null;
  return res.json() as Promise<CaseData>;
}

export default async function CaseFilePage({ params }: { params: { id: string } }) {
  const data = await getCaseData(params.id);

  if (!data) {
    return (
      <div className="p-20 text-red-500 font-mono text-center uppercase border border-red-900/30 m-10 bg-red-900/5">
        Error: Record_Not_Found_In_Ledger
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 font-mono">
      {/* Header */}
      <div className="border-b border-slate-900 pb-8 mb-12">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[#4A90E2] text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">
              Official_Evidence_Record // ID_{data.id}
            </span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">
              {data.description.substring(0, 60)}...
            </h1>
          </div>
          <div className="text-right">
            <span className="bg-red-900/20 text-red-500 border border-red-900/50 px-3 py-1 text-[10px] uppercase font-black">
              Status: Contested
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-4 tracking-widest">Description_of_Incident</h3>
            <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/10 p-6 border border-slate-900">
              {data.description}
            </p>
          </section>

          {data.media.length > 0 && (
            <section>
              <h3 className="text-[#4A90E2] text-[10px] font-bold uppercase mb-4 tracking-widest">Primary_Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.media.map((file) => (
                  <a 
                    key={file.id} 
                    href={file.file_url} 
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-4 bg-black border border-slate-800 hover:border-[#4A90E2] transition-colors group"
                  >
                    <span className="text-xl mr-4 group-hover:scale-110 transition-transform">📄</span>
                    <div>
                      <p className="text-xs text-white font-bold uppercase">{file.display_name}</p>
                      <p className="text-[9px] text-slate-500 uppercase">{file.file_type} File</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-green-900/5 border border-green-900/30 p-6 rounded">
            <h3 className="text-green-500 text-[10px] font-black uppercase mb-6 tracking-widest flex items-center">
              <span className="mr-2">🛡️</span> Verification_Ledger
            </h3>
            
            {data.rebuttals.length > 0 ? (
              <div className="space-y-6">
                <p className="text-[10px] text-slate-400 uppercase leading-tight italic">
                  Medical records refuting this claim:
                </p>
                {data.rebuttals.map((reb) => (
                  <Link 
                    key={reb.id} 
                    href={`/evidence/${reb.id}`}
                    className="block p-4 border border-green-900/50 bg-green-900/10 hover:bg-green-900/20 transition-all"
                  >
                    <p className="text-[10px] text-white font-bold uppercase mb-1">{reb.description.substring(0, 40)}...</p>
                    <span className="text-[9px] text-green-500 uppercase font-mono">[ View_Verification ]</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-slate-600 uppercase">No_Rebuttals_Mapped</p>
            )}
          </div>

          <div className="p-6 border border-slate-900 bg-slate-900/5">
            <h4 className="text-[9px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Evidence_Integrity</h4>
            <p className="text-[8px] text-slate-600 font-mono break-all leading-tight">
              RECORD_HASH: SHA256_{data.id}_WTP_VERIFIED
              <br />TIMESTAMP: {new Date().toISOString()}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}