import { getEvidenceRecords } from '../admin/actions';
import { EvidenceRecord } from '@/types';
import PublicSearchClient from './search-client';

export const dynamic = 'force-dynamic'; 

export const metadata = {
  title: 'Public Evidence Archive | We The Peeps',
  description: 'Searchable database of public records regarding community accountability.',
};

export default async function EvidenceDirectoryPage() {
  const result = await getEvidenceRecords();
  
  // Cleaned up the casting to satisfy the build warnings
  const records: EvidenceRecord[] = result.success 
    ? (result.data as unknown as EvidenceRecord[]) 
    : [];

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-[#4A90E2]/30 pb-8">
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
            The_Manifest
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <span className="bg-[#4A90E2] text-black text-[9px] font-black px-2 py-1 uppercase tracking-widest">
              Public_Access
            </span>
            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">
              Records_Loaded: {records.length.toString().padStart(3, '0')}
            </p>
          </div>
        </header>

        <PublicSearchClient initialRecords={records} />
      </div>
    </div>
  );
}