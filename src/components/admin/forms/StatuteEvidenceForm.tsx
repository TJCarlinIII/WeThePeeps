"use client";
import React, { useState } from 'react';

interface StatuteEvidence {
  post_id: string | number;
  statute_id: string | number;
  relevance_score: number;
}

interface StatuteEvidenceFormProps {
  initialData?: StatuteEvidence | null;
  posts: { id: number; title: string }[];
  statutes: { id: number; citation: string }[];
  onSave: (data: StatuteEvidence) => void;
}

export default function StatuteEvidenceForm({ initialData, posts, statutes, onSave }: StatuteEvidenceFormProps) {
  const [formData, setFormData] = useState<StatuteEvidence>({
    post_id: '',
    statute_id: '',
    relevance_score: 50,
    ...initialData
  });

  const commonStyles = "bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white font-mono uppercase";

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Select Post</label>
        <select 
          className={commonStyles}
          value={formData.post_id}
          onChange={(e) => setFormData({...formData, post_id: e.target.value})}
        >
          <option value="">-- SELECT_POST --</option>
          {posts.map(p => <option key={p.id} value={p.id}>{p.title.substring(0, 50)}...</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Select Statute</label>
        <select 
          className={commonStyles}
          value={formData.statute_id}
          onChange={(e) => setFormData({...formData, statute_id: e.target.value})}
        >
          <option value="">-- SELECT_STATUTE --</option>
          {statutes.map(s => <option key={s.id} value={s.id}>{s.citation}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">
          Relevance Score: {formData.relevance_score}%
        </label>
        <input 
          type="range"
          min="0"
          max="100"
          value={formData.relevance_score}
          onChange={(e) => setFormData({...formData, relevance_score: parseInt(e.target.value)})}
          className="w-full accent-[#4A90E2] bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <button 
        type="button"
        onClick={() => onSave(formData)}
        className="bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black transition-all text-xs tracking-[0.3em]"
      >
        LINK_EVIDENCE
      </button>
    </div>
  );
}