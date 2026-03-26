"use client";

import React, { useState, useMemo } from "react";
import { slugify } from "@/lib/stringutils";

export interface Actor {
  id?: number;
  full_name: string;
  entity_id: number;
  job_title: string;
  status: 'active' | 'under_review' | 'former';
  slug: string;
  bio?: string;
  seo_description?: string;
  seo_keywords?: string;
  entity_name?: string;
}

interface Entity {
  id: number;
  name: string;
  sector_id: number;
}

interface Sector {
  id: number;
  name: string;
}

interface ActorFormProps {
  initialData?: Actor | null;
  entities: Entity[];
  sectors: Sector[];
  onSave: (data: Actor) => void;
}

export default function ActorForm({ initialData, entities, sectors, onSave }: ActorFormProps) {
  // 1. Define the base/empty state
  const emptyState: Actor = {
    full_name: "",
    entity_id: 0,
    job_title: "",
    status: "active",
    slug: "",
    bio: "",
    seo_description: "",
    seo_keywords: ""
  };

  // 2. Initialize state directly (Fixes ESLint react-hooks/set-state-in-effect)
  const [formData, setFormData] = useState<Actor>(initialData || emptyState);
  
  // Initialize Sector ID based on the initial entity if editing
  const [selectedSectorId, setSelectedSectorId] = useState<number>(() => {
    if (initialData?.entity_id) {
      const entity = entities.find(e => e.id === initialData.entity_id);
      return entity ? entity.sector_id : 0;
    }
    return 0;
  });

  // 3. Bulletproof Filtering Logic
  const filteredEntities = useMemo(() => {
    // FAIL-SAFE: If no sector is selected, show all entities instead of an empty list
    if (selectedSectorId === 0) return entities;

    // Filter by sector, using Number() to ensure type safety (string vs number comparison)
    return entities.filter(e => Number(e.sector_id) === Number(selectedSectorId));
  }, [entities, selectedSectorId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = slugify(name);
    setFormData(prev => ({ ...prev, full_name: name, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none font-mono";
  const labelClass = "block text-[9px] text-slate-500 uppercase mb-1 font-bold tracking-widest";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* STEP 1: SECTOR FILTER */}
      <div>
        <label className={labelClass}>Step_1: Filter_by_Sector</label>
        <select
          value={selectedSectorId}
          onChange={(e) => setSelectedSectorId(Number(e.target.value))}
          className={inputClass}
        >
          <option value="0">-- SHOW ALL SECTORS --</option>
          {sectors.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* STEP 2: AFFILIATED ENTITY */}
      <div>
        <label className={labelClass}>Step_2: Affiliated_Entity</label>
        <select
          value={formData.entity_id}
          onChange={(e) => setFormData({ ...formData, entity_id: Number(e.target.value) })}
          className={inputClass}
          required
        >
          <option value="0">-- Select_Organization --</option>
          {filteredEntities.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        {filteredEntities.length === 0 && (
          <p className="text-[8px] text-red-500 mt-1 uppercase font-bold animate-pulse">
            Critical_Error: No_Entities_Found_In_This_Sector
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>Full_Name</label>
        <input
          type="text"
          value={formData.full_name}
          onChange={handleNameChange}
          className={inputClass}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Current_Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Actor['status'] })}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="under_review">Under Review</option>
            <option value="former">Former</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Official_Title</label>
          <input
            type="text"
            value={formData.job_title}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>URL_Slug</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className={`${inputClass} text-blue-400 border-dashed`}
        />
      </div>

      <div>
        <label className={labelClass}>Biography</label>
        <textarea
          value={formData.bio || ""}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className={`${inputClass} h-20 resize-none`}
        />
      </div>

      <div className="pt-4 border-t border-slate-900">
        <label className={`${labelClass} text-emerald-500`}>SEO_Description</label>
        <textarea
          value={formData.seo_description || ""}
          onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
          className={`${inputClass} h-16 resize-none`}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 text-[10px] uppercase tracking-[0.3em]"
      >
        Commit_Actor_Record
      </button>
    </form>
  );
}