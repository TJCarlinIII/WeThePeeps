"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Interfaces to satisfy ESLint and maintain type safety
interface Actor {
  id: number;
  full_name: string;
}

interface Incident {
  id: number;
  title: string;
}

interface Evidence {
  id: number;
  title: string;
}

interface RebuttalFormProps {
  actors: Actor[];
  incidents: Incident[];
  evidenceList?: Evidence[]; // Added for cross-referencing existing media
}

export default function RebuttalForm({ actors, incidents, evidenceList = [] }: RebuttalFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Pre-fill from URL parameters (e.g., from the "Rebut_Actor" button)
  const initialActor = searchParams.get('actor_id') || "";
  const initialIncident = searchParams.get('incident_id') || "";

  // Local State
  const [selectedActor, setSelectedActor] = useState(initialActor);
  const [selectedIncident, setSelectedIncident] = useState(initialIncident);
  const [selectedEvidence, setSelectedEvidence] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/rebuttals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.refresh();
        (e.target as HTMLFormElement).reset();
        // Reset local state
        setSelectedActor("");
        setSelectedIncident("");
        setSelectedEvidence("");
      }
    } catch (err) {
      console.error("INGRESS_FAILURE", err);
    } finally {
      setLoading(false);
    }
  };

  // UI Styling Constants
  const inputClass = "w-full bg-black border p-3 text-xs text-white focus:border-[#4A90E2] outline-none font-mono transition-all";
  const labelClass = "block text-[9px] text-slate-500 uppercase mb-1 font-bold tracking-[0.2em]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* 1. Target Actor - Highlighting if pre-filled via URL */}
      <div>
        <label className={labelClass}>Target Official (Actor)</label>
        <select
          name="actor_id"
          className={`${inputClass} ${selectedActor ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-800'}`}
          value={selectedActor}
          onChange={(e) => setSelectedActor(e.target.value)}
          required
        >
          <option value="">-- SELECT_INDIVIDUAL --</option>
          {actors.map((a) => (
            <option key={a.id} value={a.id}>{a.full_name}</option>
          ))}
        </select>
      </div>

      {/* 2. Associated Incident */}
      <div>
        <label className={labelClass}>Associated Incident (Context)</label>
        <select
          name="incident_id"
          className={`${inputClass} ${selectedIncident ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-800'}`}
          value={selectedIncident}
          onChange={(e) => setSelectedIncident(e.target.value)}
        >
          <option value="">-- SELECT_INCIDENT_CONTEXT --</option>
          {incidents.map((i) => (
            <option key={i.id} value={i.id}>{i.title}</option>
          ))}
        </select>
      </div>

      {/* 3. Evidence Linker (Single Source of Truth Bridge) */}
      <div className="pt-2 border-t border-slate-900">
        <label className={`${labelClass} text-[#4A90E2]`}>Master Evidence Link (FOIA / Lab / Video)</label>
        <select
          name="evidence_id"
          className={`${inputClass} border-[#4A90E2]/30 bg-slate-950/50`}
          value={selectedEvidence}
          onChange={(e) => setSelectedEvidence(e.target.value)}
        >
          <option value="">-- LINK_EXISTING_VAULT_RECORD --</option>
          {evidenceList.map((e) => (
            <option key={e.id} value={e.id}>[{e.id}] {e.title}</option>
          ))}
        </select>
        <p className="text-[8px] text-slate-600 mt-1 italic tracking-tight">
          Linking here avoids duplicate data entry across Actor profiles.
        </p>
      </div>

      {/* 4. The Rebuttal Content */}
      <div className="grid grid-cols-1 gap-4 pt-2">
        <div>
          <label className={labelClass}>Falsified Claim (The Lie)</label>
          <textarea
            name="falsified_claim"
            className={`${inputClass} h-24 border-red-900/30 focus:border-red-500`}
            required
            placeholder="e.g. 'Subject shows no evidence of bilateral hearing loss...'"
          />
        </div>

        <div>
          <label className={labelClass}>Clinical Fact (The Truth / Lab Data)</label>
          <textarea
            name="clinical_fact"
            className={`${inputClass} h-24 border-emerald-900/30 focus:border-emerald-500`}
            required
            placeholder="e.g. 'U of M Audiology confirmed 60% bilateral sensorineural loss...'"
          />
        </div>
      </div>

      {/* 5. Legacy Evidence URL (Fallback) */}
      <div>
        <label className={labelClass}>External Asset Link (Fallback URL)</label>
        <input
          name="evidence_url"
          type="text"
          className={`${inputClass} border-slate-900`}
          placeholder="https://raw.githubusercontent.com/..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-4 text-[10px] uppercase tracking-[0.4em] mt-4 disabled:opacity-50 transition-all shadow-xl"
      >
        {loading ? "COMMITTING_TO_D1_LEDGER..." : "COMMIT_REBUTTAL_TO_LEDGER"}
      </button>
    </form>
  );
}