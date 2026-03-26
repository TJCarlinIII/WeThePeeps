"use client";

import React, { useState } from "react";
import { slugify } from "@/lib/stringutils";

export interface Statute {
  id?: number;
  title: string;
  citation: string;
  slug: string;
  summary: string;
  legal_text: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface StatuteFormProps {
  initialData?: Statute | null;
  onSave: (data: Statute) => void;
}

export default function StatuteForm({ initialData, onSave }: StatuteFormProps) {
  // 1. Define the base/empty state
  const emptyState: Statute = {
    title: "",
    citation: "",
    slug: "",
    summary: "",
    legal_text: "",
    seo_description: "",
    seo_keywords: ""
  };

  // 2. Initialize state directly (Eliminates cascading render error)
  const [formData, setFormData] = useState<Statute>(initialData || emptyState);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = slugify(title);
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none transition-all font-mono";
  const labelClass = "block text-[9px] text-slate-500 uppercase mb-1 font-bold tracking-widest";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Statute_Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={handleTitleChange}
          className={inputClass}
          required
          placeholder="e.g. Freedom of Information Act"
        />
      </div>

      <div>
        <label className={labelClass}>Legal_Citation</label>
        <input
          type="text"
          value={formData.citation}
          onChange={(e) => setFormData({ ...formData, citation: e.target.value })}
          className={inputClass}
          required
          placeholder="e.g. MCL 15.231"
        />
      </div>

      <div>
        <label className={labelClass}>URL_Slug (Auto-Generated)</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className={`${inputClass} text-blue-400 border-dashed`}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Executive_Summary</label>
        <textarea
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          className={`${inputClass} h-20 resize-none`}
          placeholder="Brief overview of what this law mandates..."
        />
      </div>

      <div>
        <label className={labelClass}>Full_Legal_Text</label>
        <textarea
          value={formData.legal_text}
          onChange={(e) => setFormData({ ...formData, legal_text: e.target.value })}
          className={`${inputClass} h-48 resize-none text-[10px] leading-relaxed`}
          placeholder="Paste the verbatim statute text here..."
        />
      </div>

      <div className="border-t border-slate-900 pt-4">
        <label className={`${labelClass} text-emerald-500`}>SEO_Description</label>
        <textarea
          value={formData.seo_description || ""}
          onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
          className={`${inputClass} h-16 resize-none`}
        />
      </div>

      <div>
        <label className={`${labelClass} text-emerald-500`}>SEO_Keywords</label>
        <input
          type="text"
          value={formData.seo_keywords || ""}
          onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
          className={inputClass}
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 text-[10px] uppercase tracking-[0.3em]"
      >
        Commit_Statute_To_Record
      </button>
    </form>
  );
}