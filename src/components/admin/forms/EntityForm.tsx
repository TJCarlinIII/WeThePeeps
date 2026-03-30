"use client";

import React, { useState } from "react";
import { slugify } from "@/lib/stringutils";

export interface Entity {
  id?: number;
  name: string;
  sector_id: number | string;
  // ✅ REMOVED: description: string; // Entity_Summary field removed
  slug: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  // ✅ REMOVED: entity_type?: string; // Entity_Type field removed
  parent_entity_id?: number | string;
  seo_description?: string;
  seo_keywords?: string;
  official_website_url?: string;
  categories?: string[];
  tags?: string[];
  is_foia_target?: boolean;
  is_medical_target?: boolean;
  history_of_falsification?: boolean;
  history_of_withholding?: boolean;
  statutory_delayer?: boolean;
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
  allEntities?: { id: number; name: string }[]; 
  taxonomies: Taxonomy[];
  onSave: (data: Entity) => Promise<void>;
}

export default function EntityForm({ initialData, sectors, allEntities = [], taxonomies, onSave }: EntityFormProps) {
  const emptyState: Entity = {
    name: "", sector_id: "", slug: "",
    address: "", city: "", state: "MI", zip_code: "", phone: "",
    parent_entity_id: "",
    seo_description: "", seo_keywords: "", official_website_url: "",
    categories: [""], tags: [""],
    is_foia_target: false,
    is_medical_target: false,
    history_of_falsification: false,
    history_of_withholding: false,
    statutory_delayer: false
  };

  const [formData, setFormData] = useState<Entity>(() => {
    if (!initialData) return emptyState;
    return {
      ...emptyState,
      ...initialData,
      categories: initialData.categories?.length ? initialData.categories : [""],
      tags: initialData.tags?.length ? initialData.tags : [""],
      is_foia_target: initialData.is_foia_target ?? false,
      is_medical_target: initialData.is_medical_target ?? false,
      history_of_falsification: initialData.history_of_falsification ?? false,
      history_of_withholding: initialData.history_of_withholding ?? false,
      statutory_delayer: initialData.statutory_delayer ?? false,
    };
  });

  const [isPending, setIsPending] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!initialData?.id) {
      setFormData((prev: Entity) => ({ ...prev, name, slug: slugify(name) }));
    } else {
      setFormData((prev: Entity) => ({ ...prev, name }));
    }
  };

  const toggleFlag = (key: keyof Entity) => {
    setFormData((prev: Entity) => ({ 
      ...prev, 
      [key]: !(prev[key as keyof Entity]) 
    }));
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
  const checkboxWrapper = "flex items-start gap-3 p-3 border border-slate-900 bg-slate-950/50 hover:border-slate-700 transition-colors cursor-pointer group";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1 mb-4">
        <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">System_Status</label>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-emerald-500'}`} aria-hidden="true" />
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">
            {isPending ? 'Processing_Request...' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="border-2 border-red-900/30 p-6 bg-red-950/5 mb-8">
        <h4 className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full" aria-hidden="true" />
          Behavioral_Registry_Flags
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <label className={checkboxWrapper}>
            <input type="checkbox" checked={!!formData.is_foia_target} onChange={() => toggleFlag('is_foia_target')} className="w-4 h-4 mt-1 accent-blue-500 cursor-pointer" />
            <div>
              <span className="block text-[10px] font-bold text-white uppercase italic">FOIA_Generator</span>
              <span className="text-[8px] text-slate-500 uppercase">Enable in request tool</span>
            </div>
          </label>
          <label className={checkboxWrapper}>
            <input type="checkbox" checked={!!formData.is_medical_target} onChange={() => toggleFlag('is_medical_target')} className="w-4 h-4 mt-1 accent-emerald-500 cursor-pointer" />
            <div>
              <span className="block text-[10px] font-bold text-white uppercase italic">Medical_Records</span>
              <span className="text-[8px] text-slate-500 uppercase">Enable HIPAA generator</span>
            </div>
          </label>
          <label className={checkboxWrapper}>
            <input type="checkbox" checked={!!formData.history_of_falsification} onChange={() => toggleFlag('history_of_falsification')} className="w-4 h-4 mt-1 accent-red-600 cursor-pointer" />
            <div>
              <span className="block text-[10px] font-bold text-red-500 uppercase italic underline decoration-red-900">Falsification_History</span>
              <span className="text-[8px] text-slate-500 uppercase">Injects &quot;Liar Clause&quot;</span>
            </div>
          </label>
          <label className={checkboxWrapper}>
            <input type="checkbox" checked={!!formData.history_of_withholding} onChange={() => toggleFlag('history_of_withholding')} className="w-4 h-4 mt-1 accent-orange-600 cursor-pointer" />
            <div>
              <span className="block text-[10px] font-bold text-orange-500 uppercase italic">Withholding_Record</span>
              <span className="text-[8px] text-slate-500 uppercase">Injects &quot;Haunting Clause&quot;</span>
            </div>
          </label>
          <label className={checkboxWrapper}>
            <input type="checkbox" checked={!!formData.statutory_delayer} onChange={() => toggleFlag('statutory_delayer')} className="w-4 h-4 mt-1 accent-yellow-600 cursor-pointer" />
            <div>
              <span className="block text-[10px] font-bold text-yellow-500 uppercase italic">Statutory_Delayer</span>
              <span className="text-[8px] text-slate-500 uppercase">Injects 5-Day Warning</span>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Organization_Name</label>
          <input type="text" value={formData.name} onChange={handleNameChange} className={inputClass} required aria-required="true" />
        </div>
        <div>
          <label className={labelClass}>Sector_Assignment</label>
          <select value={formData.sector_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData((prev: Entity) => ({ ...prev, sector_id: Number(e.target.value) }))} className={inputClass} required aria-required="true">
            <option value="">-- SELECT_SECTOR --</option>
            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>URL_Slug</label>
          <input type="text" value={formData.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: Entity) => ({ ...prev, slug: e.target.value }))} className={`${inputClass} text-blue-400 font-mono`} required aria-required="true" />
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
        <h4 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Physical_Location_Data</h4>
        <div>
          <label className={labelClass}>Street_Address</label>
          <input type="text" value={formData.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: Entity) => ({ ...prev, address: e.target.value }))} className={inputClass} placeholder="e.g. 15111 Beech Daly Rd" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input type="text" value={formData.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: Entity) => ({ ...prev, city: e.target.value }))} className={inputClass} placeholder="Redford" />
          </div>
          <div>
            <label className={labelClass}>Zip</label>
            <input type="text" value={formData.zip_code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: Entity) => ({ ...prev, zip_code: e.target.value }))} className={inputClass} placeholder="48239" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" value={formData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: Entity) => ({ ...prev, phone: e.target.value }))} className={inputClass} placeholder="313-XXX-XXXX" />
          </div>
        </div>
        {/* ✅ UPDATED: Parent_Organization now spans full width since Entity_Type is removed */}
        <div className="mt-4">
          <label className={labelClass}>Parent_Organization</label>
          <select value={formData.parent_entity_id?.toString() || ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData((prev: Entity) => ({ ...prev, parent_entity_id: e.target.value ? Number(e.target.value) : "" }))} className={inputClass}>
            <option value="">-- NO_PARENT (Top Level) --</option>
            {allEntities.filter(e => e.id !== formData.id).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {/* ✅ REMOVED: Entity_Summary field */}

      <div className="border-t border-slate-900 pt-6 mt-6 space-y-6">
        <h4 className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Taxonomy & Links</h4>
        <div>
          <label className={labelClass}>Categories</label>
          {formData.categories?.map((c, i) => (
            <div key={`cat-${i}`} className="flex gap-2 mb-2">
              <select value={c} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const newCats = [...(formData.categories || [])];
                  newCats[i] = e.target.value;
                  setFormData((prev: Entity) => ({ ...prev, categories: newCats }));
                }} className={`${inputClass} uppercase font-bold`}>
                <option value="">-- SELECT CATEGORY --</option>
                {taxonomies.filter(t => t.type === 'category').map(t => <option key={t.id} value={String(t.slug)}>{t.name}</option>)}
              </select>
              <button type="button" onClick={() => setFormData((prev: Entity) => ({ ...prev, categories: prev.categories?.filter((_, idx) => idx !== i) }))} className="px-4 bg-red-950/40 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white font-bold transition-all">[X]</button>
            </div>
          ))}
          <button type="button" onClick={() => setFormData((prev: Entity) => ({ ...prev, categories: [...(prev.categories || []), ""] }))} className="text-[9px] text-[#4A90E2] font-bold uppercase hover:underline">+ Add Category</button>
        </div>

        <div>
          <label className={labelClass}>Official Website URL</label>
          <input type="url" value={formData.official_website_url || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: Entity) => ({ ...prev, official_website_url: e.target.value }))} className={`${inputClass} text-blue-400 font-mono`} placeholder="https://..." />
        </div>

        <div>
          <label className={labelClass}>SEO_Description</label>
          <textarea value={formData.seo_description || ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev: Entity) => ({ ...prev, seo_description: e.target.value }))} className={`${inputClass} h-16 resize-none`} />
        </div>

        <div>
          <label className={labelClass}>SEO_Keywords</label>
          <input type="text" value={formData.seo_keywords || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: Entity) => ({ ...prev, seo_keywords: e.target.value }))} className={inputClass} />
        </div>
      </div>

      <button type="submit" disabled={isPending} className={`w-full mt-6 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all border ${isPending ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-600 text-white border-blue-400 hover:bg-blue-500 active:scale-[0.98]'}`}>
        {initialData?.id ? '[ Execute_Update ]' : '[ Commit_to_Registry ]'}
      </button>
    </form>
  );
}