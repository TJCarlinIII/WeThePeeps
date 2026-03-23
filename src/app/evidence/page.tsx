import { getEvidenceRecords } from '../admin/actions';
import { EvidenceRecord } from '@/types';
import PublicSearchClient from '@/app/evidence/search-client';

export const metadata = {
  title: 'Public Evidence Archive | We The Peeps',
  description: 'Searchable database of public records regarding community accountability.',
};

export default async function EvidenceDirectoryPage() {
  const result = await getEvidenceRecords();
  
  // FIXED: Double-cast to bypass the 'overlap' error
  const records = result.success 
    ? (result.data as unknown as EvidenceRecord[]) 
    : [];

  return (
    <div className="min-h-screen bg-black text-slate-300 p-6 md:p-12 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-l-4 border-[#4A90E2] pl-6 py-2">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            The_Manifest
          </h1>
          <p className="text-[10px] text-[#4A90E2] font-bold tracking-[0.2em] mt-2 italic">
            STATUS: PUBLIC_ACCESS // RECORDS_LOADED: {records.length}
          </p>
        </header>

        {/* Ensure search-client.tsx exists in this same folder */}
        <PublicSearchClient initialRecords={records} />
      </div>
    </div>
  );
}