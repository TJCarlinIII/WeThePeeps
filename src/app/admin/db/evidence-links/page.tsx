"use client";

import React, { useState, useEffect } from 'react';

interface EvidenceItem {
  id: number;
  description: string;
}

interface ApiResponse {
  results?: EvidenceItem[];
}

export default function EvidenceLinker() {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');

  useEffect(() => {
    const getEvidence = async () => {
      try {
        const res = await fetch('/api/evidence');
        // We cast the result of res.json() immediately
        const data = (await res.json()) as ApiResponse | EvidenceItem[];
        
        const results = Array.isArray(data) ? data : data.results || [];
        setEvidence(results);
      } catch (err) {
        console.error("FETCH_EVIDENCE_ERROR:", err);
      }
    };

    getEvidence();
  }, []);

  const handleLink = async () => {
    if (!sourceId || !targetId) return alert("SELECT_BOTH_RECORDS");
    
    const res = await fetch('/api/admin/evidence-relations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: sourceId, target_id: targetId, type: 'REFUTES' })
    });

    if (res.ok) {
      alert("RELATIONSHIP_ESTABLISHED");
      setSourceId('');
      setTargetId('');
    }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="border-l-4 border-[#4A90E2] pl-4">
        <h2 className="text-[#4A90E2] text-xs font-black tracking-widest uppercase">
          Evidence_Refutation_Linker
        </h2>
        <p className="text-slate-500 text-[10px] mt-1 uppercase">
          Map Medical Truths (Rebuttals) to Falsified Claims
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/10 p-6 border border-slate-800">
        <div className="space-y-4">
          <label className="text-[10px] text-red-500 uppercase block font-bold tracking-tighter">
            Target_Claim (APS/Gov Records)
          </label>
          <select 
            className="w-full bg-black border border-slate-700 p-3 text-xs text-white uppercase outline-none focus:border-red-500"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
          >
            <option value="">-- SELECT_CLAIM --</option>
            {evidence.map(e => (
              <option key={e.id} value={e.id}>
                ID_{e.id}: {e.description.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] text-green-500 uppercase block font-bold tracking-tighter">
            Verification_Evidence (UofM/Doctor)
          </label>
          <select 
            className="w-full bg-black border border-slate-700 p-3 text-xs text-white uppercase outline-none focus:border-green-500"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">-- SELECT_REBUTTAL --</option>
            {evidence.map(e => (
              <option key={e.id} value={e.id}>
                ID_{e.id}: {e.description.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      <button 
        onClick={handleLink}
        className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black text-xs tracking-[0.4em] transition-all shadow-[0_0_15px_rgba(74,144,226,0.2)]"
      >
        COMMIT_RELATIONSHIP_TO_D1_LEDGER
      </button>
    </div>
  );
}