"use client";
import React, { useState } from 'react';

interface Entity {
  id?: number;
  name: string;
  sector_id: string | number;
  description: string;
  slug: string;
}

interface EntityFormProps {
  initialData?: Entity | null;
  onSave: (data: Entity) => void;
  sectors: { id: number; name: string }[];
}

export default function EntityForm({ initialData, onSave, sectors }: EntityFormProps) {
  const [formData, setFormData] = useState<Entity>({
    name: '',
    sector_id: '',
    description: '',
    slug: '',
    ...initialData
  });

  const commonStyles = "bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white font-mono uppercase";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Entity Name</label>
        <input 
          className={commonStyles}
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Sector</label>
        <select 
          className={commonStyles}
          value={formData.sector_id}
          onChange={(e) => setFormData({...formData, sector_id: e.target.value})}
        >
          <option value="">-- SELECT_SECTOR --</option>
          {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col md:col-span-2">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Slug (URL_Friendly)</label>
        <input 
          className={commonStyles}
          value={formData.slug}
          placeholder="e.g. acme-corp"
          onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
        />
      </div>

      <div className="flex flex-col md:col-span-2">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Description</label>
        <textarea 
          className={`${commonStyles} h-32 normal-case`}
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <button 
        type="button"
        onClick={() => onSave(formData)}
        className="md:col-span-2 bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black transition-all text-xs tracking-[0.3em]"
      >
        {initialData?.id ? "UPDATE_ENTITY_RECORD" : "COMMIT_NEW_ENTITY"}
      </button>
    </div>
  );
}