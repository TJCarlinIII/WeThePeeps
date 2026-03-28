"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback } from 'react';
import { getRecords, deleteRecord } from '../actions';
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Interfaces for strict type safety
interface BaseRecord {
  id: number;
  title: string;
  content: string;
  created_at: string;
  isCritical?: number;
}

interface EvidenceRecord extends BaseRecord {
  statute: string;
  official: string;
}

interface PostRecord extends BaseRecord {
  slug: string;
  category: string;
}

type HubRecord = EvidenceRecord | PostRecord;
type ViewMode = 'media' | 'posts';

export default function IntelligenceHub() {
  const [viewMode, setViewMode] = useState<ViewMode>('media');
  const [records, setRecords] = useState<HubRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isEvidence = (item: HubRecord): item is EvidenceRecord => 'statute' in item;

  // Memoize loadData so it doesn't trigger unnecessary useEffect runs
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRecords(viewMode); 
      if (result.success && Array.isArray(result.data)) {
        setRecords(result.data as unknown as HubRecord[]);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("SCAN_ERROR:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  // The effect now has a stable dependency on loadData
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePurge = async (id: number) => {
    if (confirm(`INITIATE_PURGE for Record_${id}?`)) {
      const result = await deleteRecord(viewMode, id);
      if (result.success) {
        // Re-run the memoized load function
        loadData();
      } else {
        alert("PURGE_REJECTED: Check terminal for Node_Errors.");
      }
    }
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-slate-300 font-mono">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12 border-b border-[#4A90E2]/20 pb-6">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-black tracking-tighter text-[#4A90E2] uppercase italic">
                    Intelligence_Hub
                  </h1>
                  <p className="text-[10px] text-slate-500 uppercase mt-2 tracking-[0.3em]">
                    Node: wethepeeps_D1 // Sector: {viewMode.toUpperCase()}
                  </p>
                </div>
                <button 
                  onClick={() => loadData()} 
                  className="text-[10px] border border-slate-700 px-4 py-2 hover:bg-[#4A90E2] hover:text-black transition-all font-bold uppercase tracking-widest"
                >
                  Rescan_Sector
                </button>
              </div>

              <div className="flex gap-4">
                {(['media', 'posts'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 border transition-all ${
                      viewMode === mode 
                      ? 'bg-[#4A90E2] text-black border-[#4A90E2]' 
                      : 'border-slate-800 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {mode === 'media' ? 'EVIDENCE' : 'POSTS'}_MANIFEST
                  </button>
                ))}
              </div>
            </header>

            {loading ? (
              <div className="animate-pulse text-[#4A90E2] tracking-[0.3em] py-20 text-center uppercase text-xs">
                Initializing_Sector_Scan...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {records.length === 0 && (
                  <p className="text-center text-slate-700 uppercase text-[10px] py-10">
                    No_Records_Found_In_Sector
                  </p>
                )}
                {records.map((item) => (
                  <div 
                    key={item.id} 
                    className={`border ${item.isCritical ? 'border-red-900/50 bg-red-900/5' : 'border-slate-800 bg-slate-900/10'} p-6 transition-all hover:border-[#4A90E2]/40 group`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] font-bold text-[#4A90E2] uppercase tracking-[0.2em] mb-1 block">
                          {isEvidence(item) ? `Statute: ${item.statute || 'N/A'}` : `Slug: /blog/${(item as PostRecord).slug}`}
                        </span>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight">
                          {item.title}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase">
                          {isEvidence(item) ? `Official: ${item.official || 'Unknown'}` : `Category: ${(item as PostRecord).category}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handlePurge(item.id)}
                          className="text-[9px] font-black px-3 py-1 border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all uppercase"
                        >
                          Purge
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-sans border-t border-slate-900 pt-4 line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                      {item.content || "No_Content_Decoded"}
                    </div>

                    <div className="mt-4 text-[9px] text-slate-700 flex justify-between uppercase border-t border-slate-900 pt-4 font-bold tracking-widest">
                      <span>Record_ID: {item.id}</span>
                      <span>Logged: {item.created_at ? new Date(item.created_at).toLocaleString() : 'Timestamp_Missing'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}