// File: src/components/admin/forms/EntityForm.tsx
"use client";

import React, { useState } from "react";
import { slugify } from "@/lib/stringutils";

export interface Entity {
  id?: number;
  name: string;
  sector_id: number | string;
  description: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
  official_website_url?: string;
  categories?: string[];
  tags?: string[];
}

interface Taxonomy {
  id: number;
  name: string;
  type: 'category' | 'tag';
  slug: string;
}

interface EntityFormProps {
  initialData?: Entity | null;
  sectors: { id: number; name: string }[];
  taxonomies: Taxonomy[];
  onSave: (data: Entity) => Promise<void>;
}

export default function EntityForm({ initialData, sectors, taxonomies, onSave }: EntityFormProps) {
  const emptyState: Entity = {
    name: "", sector_id: "", description: "", slug: "", seo_description: "", seo_keywords: "", official_website_url: "", categories: [""], tags: [""]
  };

  const [formData, setFormData] = useState<Entity>(() => {
    if (!initialData) return emptyState;
    return {
      ...emptyState,
      ...initialData,
      categories: initialData.categories?.length ? initialData.categories : [""],
      tags: initialData.tags?.length ? initialData.tags : [""],
    };
  });
  
  const [isPending, setIsPending] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!initialData?.id) {
      setFormData(prev => ({ ...prev, name, slug: slugify(name) }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.sector_id) === 0 || formData.sector_id === "") {
      alert("CRITICAL_ERROR: Sector_Assignment_Required");
      return;
    }
    setIsPending(true);
    await onSave(formData);
    setIsPending(false);
  };

  const inputClass = "w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-[9px] text-slate-500 uppercase font-black mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* System status indicator */}
      <div className="space-y-1 mb-4">
        <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">System_Status</label>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500 animate-ping' : 'bg-emerald-500'}`} />
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">
            {isPending ? 'Processing_Request...' : 'Ready'}
          </span>
        </div>
      </div>

      <div>
        <label className={labelClass}>Organization_Name</label>
        <input type="text" value={formData.name} onChange={handleNameChange} className={inputClass} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Sector_Assignment</label>
          <select value={formData.sector_id} onChange={(e) => setFormData({ ...formData, sector_id: Number(e.target.value) })} className={inputClass} required>
            <option value="">-- SELECT_SECTOR --</option>
            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>URL_Slug</label>
          <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className={`${inputClass} text-blue-400 font-mono`} required />
        </div>
      </div>

      <div>
        <label className={labelClass}>Entity_Summary</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} h-24 resize-none`} />
      </div>

      {/* Taxonomy Section */}
      <div className="border-t border-slate-900 pt-6 mt-6 space-y-6">
        <h4 className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Taxonomy & Links</h4>
        
        <div>
          <label className={labelClass}>Categories</label>
          {formData.categories?.map((c, i) => (
            <div key={`cat-${i}`} className="flex gap-2 mb-2">
              <select value={c} onChange={e => {
                const newCats = [...(formData.categories || [])];
                newCats[i] = e.target.value;
                setFormData({...formData, categories: newCats});
              }} className={`${inputClass} uppercase font-bold`}>
                <option value="">-- SELECT CATEGORY --</option>
                {taxonomies.filter(t => t.type === 'category').map(t => (
                  <option key={t.id} value={String(t.slug)}>{t.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setFormData({...formData, categories: formData.categories?.filter((_, idx) => idx !== i)})} className="px-4 bg-red-950/40 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white font-bold transition-all">[X]</button>
            </div>
          ))}
          <button type="button" onClick={() => setFormData({...formData, categories: [...(formData.categories || []), ""]})} className="text-[9px] text-[#4A90E2] font-bold uppercase hover:underline">+ Add Additional Category</button>
        </div>

        <div>
          <label className={labelClass}>Tags</label>
          {formData.tags?.map((t, i) => (
            <div key={`tag-${i}`} className="flex gap-2 mb-2">
              <select value={t} onChange={e => {
                const newTags = [...(formData.tags || [])];
                newTags[i] = e.target.value;
                setFormData({...formData, tags: newTags});
              }} className={`${inputClass} uppercase font-bold`}>
                <option value="">-- SELECT TAG --</option>
                {taxonomies.filter(t => t.type === 'tag').map(tax => (
                  <option key={tax.id} value={String(tax.slug)}>{tax.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setFormData({...formData, tags: formData.tags?.filter((_, idx) => idx !== i)})} className="px-4 bg-red-950/40 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white font-bold transition-all">[X]</button>
            </div>
          ))}
          <button type="button" onClick={() => setFormData({...formData, tags: [...(formData.tags || []), ""]})} className="text-[9px] text-[#4A90E2] font-bold uppercase hover:underline">+ Add Additional Tag</button>
        </div>

        <div>
          <label className={labelClass}>Official Website URL</label>
          <input type="url" value={formData.official_website_url || ""} onChange={(e) => setFormData({ ...formData, official_website_url: e.target.value })} className={`${inputClass} text-blue-400 font-mono`} placeholder="https://..." />
        </div>
        
        <div>
          <label className={labelClass}>SEO_Description</label>
          <textarea value={formData.seo_description || ""} onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })} className={`${inputClass} h-16 resize-none`} />
        </div>

        <div>
          <label className={labelClass}>SEO_Keywords</label>
          <input type="text" value={formData.seo_keywords || ""} onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })} className={inputClass} />
        </div>
      </div>

      <button type="submit" disabled={isPending} className={`w-full mt-6 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all border ${isPending ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-600 text-white border-blue-400 hover:bg-blue-500 active:scale-[0.98]'}`}>
        {initialData?.id ? '[ Execute_Update ]' : '[ Commit_to_Registry ]'}
      </button>
    </form>
  );
}