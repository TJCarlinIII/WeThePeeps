"use client";
import React, { useState } from 'react';

export interface Actor {
  id?: number;
  full_name: string;
  entity_id: string | number;
  bio: string;
  status: string;
  job_title: string;
  slug: string;
}

interface Entity {
  id: number;
  name: string;
}

interface ActorFormProps {
  initialData?: Actor | null;
  entities: Entity[];
  onSave: (data: Actor) => Promise<void> | void; // Allow async onSave
}

export default function ActorForm({ initialData, entities, onSave }: ActorFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Actor>({
    full_name: '',
    entity_id: '',
    bio: '',
    status: 'under_review',
    job_title: '',
    slug: '',
    ...initialData
  });

  const commonStyles = "bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white font-mono uppercase";

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, full_name: val, slug });
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error("FORM_SAVE_ERROR:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Full Name</label>
        <input className={commonStyles} value={formData.full_name} onChange={(e) => handleNameChange(e.target.value)} />
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Associated Entity</label>
        <select className={commonStyles} value={formData.entity_id} onChange={(e) => setFormData({...formData, entity_id: e.target.value})}>
          <option value="">-- SELECT_ENTITY --</option>
          {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Job Title</label>
        <input className={commonStyles} value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} />
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Current Status</label>
        <select className={commonStyles} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
          <option value="active">Active</option>
          <option value="under_review">Under Review</option>
          <option value="former">Former</option>
        </select>
      </div>

      <div className="flex flex-col md:col-span-2">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Biography / Intel</label>
        <textarea className={`${commonStyles} h-32 normal-case`} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
      </div>

      <button 
        type="button" 
        disabled={isSaving}
        onClick={handleSaveClick} 
        className={`md:col-span-2 ${isSaving ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#4A90E2] hover:bg-white text-black'} py-4 font-black transition-all text-xs tracking-[0.3em] uppercase`}
      >
        {isSaving ? "SYNCING_DOSSIER..." : (initialData?.id ? "UPDATE_ACTOR_DOSSIER" : "COMMIT_NEW_ACTOR")}
      </button>
    </div>
  );
}