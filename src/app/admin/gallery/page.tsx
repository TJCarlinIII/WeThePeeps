"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  getEvidenceRecords, 
  toggleEvidenceCritical, 
  deleteEvidenceRecord 
} from '../actions';
import { EvidenceRecord } from '@/types';

export default function EvidenceGallery() {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoized data loader for the RESCAN button
  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getEvidenceRecords();
    if (result.success) {
      setRecords(result.data as unknown as EvidenceRecord[]);
    }
    setLoading(false);
  }, []);

  // Initial mount synchronization
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

  const handleToggle = async (id: number, currentStatus: number) => {
    const result = await toggleEvidenceCritical(id, currentStatus);
    if (result.success) {
      setRecords(prev => prev.map(r => 
        r.id === id ? { ...r, isCritical: result.newStatus! } : r
      ));
    }
  };

  const handleDelete = async (id: number, title: string) => {
    const confirmed = window.confirm(
      `CRITICAL_WARNING: Are you sure you want to PERMANENTLY PURGE "${title}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      const result = await deleteEvidenceRecord(id);
      if (result.success) {
        setRecords(prev => prev.filter(r => r.id !== id));
      } else {
        alert("ERROR: Database rejected the purge request.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-[#4A90E2]/20 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-[#4A90E2] uppercase text-glow">Evidence_Archive</h1>
            <p className="text-[10px] text-slate-500 uppercase mt-2 tracking-widest">
              Database: wethepeeps_D1 | Status: Online
            </p>
          </div>
          <button 
            onClick={loadData} 
            className="text-[10px] border border-slate-700 px-4 py-2 hover:bg-[#4A90E2] hover:text-black transition-all font-bold uppercase tracking-widest"
          >
            Rescan_DB
          </button>
        </header>

        {loading ? (
          <div className="animate-pulse text-[#4A90E2] tracking-[0.3em]">INITIALIZING_SCAN...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {records.map((item) => (
              <div 
                key={item.id} 
                className={`border ${item.isCritical ? 'border-red-900/50 bg-red-900/5 shadow-[0_0_20px_rgba(255,0,0,0.05)]' : 'border-slate-800 bg-slate-900/10'} p-6 rounded-lg transition-all hover:border-[#4A90E2]/40`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{item.title}</h2>
                    <p className="text-[10px] text-[#4A90E2] font-bold mt-1 tracking-widest">{item.official} | {item.statute}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggle(item.id, item.isCritical)}
                      className={`text-[9px] font-bold px-3 py-1 border transition-all uppercase ${
                        item.isCritical 
                        ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black' 
                        : 'border-slate-700 text-slate-500 hover:border-[#4A90E2] hover:text-[#4A90E2]'
                      }`}
                    >
                      {item.isCritical ? 'Downgrade' : 'Elevate'}
                    </button>

                    <button 
                      onClick={() => handleDelete(item.id, item.title)}
                      className="text-[9px] font-bold px-3 py-1 border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all uppercase"
                    >
                      Purge
                    </button>

                    {item.isCritical === 1 && (
                      <span className="text-[10px] bg-red-600 text-white px-2 py-1 font-black animate-pulse">CRITICAL</span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-slate-400 font-sans border-t border-slate-800 pt-4 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>

                <div className="mt-4 text-[9px] text-slate-600 flex justify-between uppercase border-t border-slate-900 pt-4">
                  <span>Record_ID: {item.id}</span>
                  <span>Timestamp: {new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            
            {records.length === 0 && (
              <div className="text-center py-20 border border-dashed border-slate-800 text-slate-600 uppercase text-xs tracking-widest">
                No local records found in the current D1 sector.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}