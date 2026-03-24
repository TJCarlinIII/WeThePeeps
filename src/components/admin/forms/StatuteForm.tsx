"use client";
import React, { useState } from 'react';

// Exported for the Manager Page
export interface Statute {
  id?: number;
  citation: string;
  title: string;
  summary: string;
  full_text: string;
  jurisdiction: string;
}

interface StatuteFormProps {
  initialData?: Statute | null;
  onSave: (data: Statute) => void;
}

export default function StatuteForm({ initialData, onSave }: StatuteFormProps) {
  const [formData, setFormData] = useState<Statute>({
    citation: '',
    title: '',
    summary: '',
    full_text: '',
    jurisdiction: 'FEDERAL',
    ...initialData
  });

  const commonStyles = "bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white font-mono uppercase";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Citation (e.g. 18 U.S.C. § 241)</label>
        <input 
          className={commonStyles}
          value={formData.citation}
          onChange={(e) => setFormData({...formData, citation: e.target.value})}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Jurisdiction</label>
        <select 
          className={commonStyles}
          value={formData.jurisdiction}
          onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
        >
          <option value="FEDERAL">FEDERAL</option>
          <option value="STATE">STATE</option>
          <option value="INTERNATIONAL">INTERNATIONAL</option>
        </select>
      </div>

      <div className="flex flex-col md:col-span-2">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Statute Title</label>
        <input 
          className={commonStyles}
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>

      <div className="flex flex-col md:col-span-2">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Summary</label>
        <textarea 
          className={`${commonStyles} h-24 normal-case`}
          value={formData.summary}
          onChange={(e) => setFormData({...formData, summary: e.target.value})}
        />
      </div>

      <button 
        type="button"
        onClick={() => onSave(formData)}
        className="md:col-span-2 bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black transition-all text-xs tracking-[0.3em]"
      >
        {initialData?.id ? "UPDATE_STATUTE_RECORD" : "COMMIT_NEW_STATUTE"}
      </button>
    </div>
  );
}