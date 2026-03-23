"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { getEvidenceRecords, toggleEvidenceCritical, deleteEvidenceRecord, type EvidenceRecord } from '../../admin/actions';

export default function EvidenceGallery() {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getEvidenceRecords();
    if (result.success) {
      setRecords(result.data as unknown as EvidenceRecord[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const result = await getEvidenceRecords();
      if (isMounted && result.success) {
        setRecords(result.data as unknown as EvidenceRecord[]);
        setLoading(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  // Filter logic for the Search Bar
  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.official.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.statute.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [records, searchQuery]);

  const handleToggle = async (id: number, currentStatus: number) => {
    const result = await toggleEvidenceCritical(id, currentStatus);
    if (result.success) {
      setRecords(prev => prev.map(r => 
        r.id === id ? { ...r, isCritical: result.newStatus! } : r
      ));
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`PURGE_CONFIRMATION: Delete "${title}" permanently?`)) {
      const result = await deleteEvidenceRecord(id);
      if (result.success) {
        setRecords(prev => prev.filter(r => r.id !== id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-[#4A90E2]/20 pb-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter text-[#4A90E2] uppercase">Evidence_Archive</h1>
              <p className="text-[10px] text-slate-500 uppercase mt-2 tracking-widest">Database: wethepeeps_D1 | Status: Online</p>
            </div>
            <button onClick={loadData} className="text-[10px] border border-slate-700 px-4 py-2 hover:bg-[#4A90E2] hover:text-black transition-all font-bold uppercase tracking-widest">Rescan_DB</button>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-[#4A90E2]/20 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <input 
              type="text"
              placeholder="SEARCH_BY_NAME_OR_STATUTE..."
              className="relative w-full bg-black border border-slate-800 p-4 text-xs tracking-[0.2em] outline-none focus:border-[#4A90E2] transition-colors uppercase"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="animate-pulse text-[#4A90E2] tracking-[0.3em]">SCANNING_SECTORS...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRecords.map((item) => (
              <div key={item.id} className={`border ${item.isCritical ? 'border-red-900/50 bg-red-900/5 shadow-[0_0_20px_rgba(255,0,0,0.05)]' : 'border-slate-800 bg-slate-900/10'} p-6 rounded-lg transition-all hover:border-[#4A90E2]/40 group`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{item.title}</h2>
                    <p className="text-[10px] text-[#4A90E2] font-bold mt-1 tracking-widest">{item.official} | {item.statute}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* View Public Page Link */}
                    <Link 
                      href={`/evidence/${item.id}`}
                      target="_blank"
                      className="text-[9px] font-bold px-3 py-1 border border-[#4A90E2]/30 text-[#4A90E2]/60 hover:text-[#4A90E2] hover:border-[#4A90E2] transition-all uppercase"
                    >
                      View_Live
                    </Link>

                    <button 
                      onClick={() => handleToggle(item.id, item.isCritical)}
                      className={`text-[9px] font-bold px-3 py-1 border transition-all uppercase ${item.isCritical ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black' : 'border-slate-700 text-slate-500 hover:border-[#4A90E2] hover:text-[#4A90E2]'}`}
                    >
                      {item.isCritical ? 'Downgrade' : 'Elevate'}
                    </button>

                    <button 
                      onClick={() => handleDelete(item.id, item.title)}
                      className="text-[9px] font-bold px-3 py-1 border border-red-900/40 text-red-900/60 hover:bg-red-900 hover:text-white transition-all uppercase"
                    >
                      Purge
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-400 font-sans border-t border-slate-800 pt-4 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>

                <div className="mt-4 text-[9px] text-slate-600 flex justify-between uppercase border-t border-slate-900 pt-4">
                  <span>Record_ID: {item.id}</span>
                  <span>Verified: {new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-20 border border-dashed border-slate-800 text-slate-600 uppercase text-xs tracking-widest">
                No matching records found in this sector.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}