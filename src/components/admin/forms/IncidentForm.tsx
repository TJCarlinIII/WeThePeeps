"use client";

import React, { useState, useMemo } from "react";
import { slugify } from "@/lib/stringutils";

export interface Incident {
  id?: number;
  title: string;
  slug: string;
  description: string;
  sector_id: number;
  entity_id: number;
  actor_id: number;
  statute_id: number;
  status: 'pending' | 'verified' | 'archived';
  is_critical: number; // 0 or 1 for D1/SQLite compatibility
  event_date: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface IncidentFormProps {
  initialData?: Incident | null;
  sectors: { id: number; name: string }[];
  entities: { id: number; name: string; sector_id: number }[];
  actors: { id: number; full_name: string; entity_id: number }[];
  statutes: { id: number; title: string }[];
  onSave: (data: Incident) => void;
}

export default function IncidentForm({ 
  initialData, 
  sectors, 
  entities, 
  actors, 
  statutes, 
  onSave 
}: IncidentFormProps) {
  
  const emptyState: Incident = {
    title: "",
    slug: "",
    description: "",
    sector_id: 0,
    entity_id: 0,
    actor_id: 0,
    statute_id: 0,
    status: "pending",
    is_critical: 0,
    event_date: new Date().toISOString().split('T')[0], // Default to today
    seo_description: "",
    seo_keywords: ""
  };

  const [formData, setFormData] = useState<Incident>(initialData || emptyState);

  // --- HIERARCHICAL FILTERING ---

  // Filter entities based on selected sector
  const filteredEntities = useMemo(() => {
    if (Number(formData.sector_id) === 0) return entities;
    return entities.filter(e => Number(e.sector_id) === Number(formData.sector_id));
  }, [entities, formData.sector_id]);

  // Filter actors based on selected entity
  const filteredActors = useMemo(() => {
    if (Number(formData.entity_id) === 0) return actors;
    return actors.filter(a => Number(a.entity_id) === Number(formData.entity_id));
  }, [actors, formData.entity_id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = slugify(title);
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none font-mono";
  const labelClass = "block text-[9px] text-slate-500 uppercase mb-1 font-bold tracking-widest";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. CLASSIFICATION HIERARCHY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 border border-slate-900">
        <div>
          <label className={labelClass}>Sector</label>
          <select
            value={formData.sector_id}
            onChange={(e) => setFormData({ ...formData, sector_id: Number(e.target.value), entity_id: 0, actor_id: 0 })}
            className={inputClass}
            required
          >
            <option value="0">-- Select_Sector --</option>
            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Entity</label>
          <select
            value={formData.entity_id}
            onChange={(e) => setFormData({ ...formData, entity_id: Number(e.target.value), actor_id: 0 })}
            className={inputClass}
            required
          >
            <option value="0">-- Select_Entity --</option>
            {filteredEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Primary_Actor</label>
          <select
            value={formData.actor_id}
            onChange={(e) => setFormData({ ...formData, actor_id: Number(e.target.value) })}
            className={inputClass}
          >
            <option value="0">-- Select_Official --</option>
            {filteredActors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>
        </div>
      </div>

      {/* 2. INCIDENT DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Incident_Title</label>
          <input type="text" value={formData.title} onChange={handleTitleChange} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Event_Date</label>
          <input 
            type="date" 
            value={formData.event_date} 
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} 
            className={inputClass} 
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Applicable_Statute</label>
          <select
            value={formData.statute_id}
            onChange={(e) => setFormData({ ...formData, statute_id: Number(e.target.value) })}
            className={inputClass}
          >
            <option value="0">-- Select_Statute --</option>
            {statutes.map(st => <option key={st.id} value={st.id}>{st.title}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Verification_Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Incident['status'] })}
            className={inputClass}
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Critical_Alert</label>
          <select
            value={formData.is_critical}
            onChange={(e) => setFormData({ ...formData, is_critical: Number(e.target.value) })}
            className={`${inputClass} ${formData.is_critical === 1 ? 'text-red-500 border-red-900' : ''}`}
          >
            <option value={0}>Standard Priority</option>
            <option value={1}>CRITICAL_VIOLATION</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Case_Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`${inputClass} h-32 resize-none`}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#4A90E2] hover:bg-blue-500 text-white font-black py-4 text-[10px] uppercase tracking-[0.4em] mt-4 shadow-lg shadow-blue-900/20"
      >
        Commit_Incident_To_Manifest
      </button>
    </form>
  );
}