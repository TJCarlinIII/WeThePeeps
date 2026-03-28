// File: src/components/admin/forms/ActorForm.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { deleteActor } from "@/app/admin/actors/actions";
import { Trash2, RotateCcw } from "lucide-react";
import { slugify } from "@/lib/stringutils";

export interface Actor {
  id?: number;
  full_name: string;
  entity_id: number | string;
  sector_id?: number | string;
  job_title: string;
  status: 'active' | 'under_review' | 'former';
  slug: string;
  bio?: string;
  seo_description?: string;
  seo_keywords?: string;
  official_website_url?: string;
  categories?: string[];
  tags?: string[];
}

interface Entity { id: number; name: string; sector_id: number | string; }
interface Sector { id: number; name: string; }
interface Taxonomy { id: number; name: string; type: 'category' | 'tag'; slug: string; }

// Updated interface to include the action prop
interface ActorFormProps {
  initialData?: Actor | null;
  entities: Entity[];
  sectors: Sector[];
  taxonomies: Taxonomy[];
  action: (formData: FormData) => Promise<void>; 
}

export default function ActorForm({ 
  initialData, 
  entities, 
  sectors, 
  taxonomies, 
  action 
}: ActorFormProps) {
  const emptyState: Actor = useMemo(() => ({
    full_name: "",
    entity_id: "",
    job_title: "",
    status: "active",
    slug: "",
    bio: "",
    seo_description: "",
    seo_keywords: "",
    official_website_url: "",
    categories: [""],
    tags: [""],
  }), []);

  const [formData, setFormData] = useState<Actor>(() => {
    if (!initialData) return emptyState;
    return {
      ...emptyState,
      ...initialData,
      categories: initialData.categories?.length ? initialData.categories : [""],
      tags: initialData.tags?.length ? initialData.tags : [""],
    };
  });

  const [isPending, setIsPending] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<number | string>(() => {
    if (initialData?.entity_id) {
      const ent = entities.find(e => e.id === Number(initialData.entity_id));
      if (ent) return ent.sector_id;
    }
    return "";
  });

  useEffect(() => {
    if (formData.entity_id) {
      const entity = entities.find(e => e.id === Number(formData.entity_id));
      if (entity) setSelectedSectorId(entity.sector_id);
    }
  }, [formData.entity_id, entities]);

  const filteredEntities = !selectedSectorId || Number(selectedSectorId) === 0
    ? entities
    : entities.filter(e => Number(e.sector_id) === Number(selectedSectorId));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!formData.id) {
      setFormData(prev => ({ ...prev, full_name: name, slug: slugify(name) }));
    } else {
      setFormData(prev => ({ ...prev, full_name: name }));
    }
  };

  const handleReset = useCallback(() => {
    setFormData(emptyState);
    setSelectedSectorId("");
  }, [emptyState]);

  const handleDelete = async () => {
    if (!formData.id) return;
    if (confirm(`Delete ${formData.full_name}? This cannot be undone.`)) {
      await deleteActor(formData.id.toString());
      handleReset();
    }
  };

  // The wrapper to prepare the native FormData for the Server Action
  const handleFormAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entity_id || Number(formData.entity_id) === 0) {
      alert("CRITICAL_ERROR: Affiliated_Entity_Required");
      return;
    }

    setIsPending(true);
    try {
      const fd = new FormData();
      if (formData.id) fd.append("id", formData.id.toString());
      fd.append("name", formData.full_name);
      fd.append("title", formData.job_title);
      fd.append("entity_id", formData.entity_id.toString());
      fd.append("status", formData.status);
      fd.append("slug", formData.slug);
      fd.append("bio", formData.bio || "");
      fd.append("seo_description", formData.seo_description || "");
      fd.append("seo_keywords", formData.seo_keywords || "");
      fd.append("official_website_url", formData.official_website_url || "");
      fd.append("categories", JSON.stringify(formData.categories?.filter(c => c) || []));
      fd.append("tags", JSON.stringify(formData.tags?.filter(t => t) || []));

      await action(fd); // Executing the passed action prop
      
      if (!formData.id) handleReset();
      alert("Protocol: Record_Synchronized");
    } catch (error) {
      console.error(error);
      alert("Critical_Failure: Sync_Error");
    } finally {
      setIsPending(false);
    }
  };

  const inputClass = "w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-[9px] text-slate-500 uppercase font-black mb-1";

  return (
    <form onSubmit={handleFormAction} className="space-y-4">
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
        <label className={labelClass}>Subject_Full_Name</label>
        <input type="text" value={formData.full_name} onChange={handleNameChange} className={inputClass} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Filter_By_Sector</label>
          <select value={selectedSectorId} onChange={(e) => setSelectedSectorId(e.target.value)} className={inputClass}>
            <option value="">-- SHOW ALL SECTORS --</option>
            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Affiliated_Entity</label>
          <select value={formData.entity_id} onChange={(e) => setFormData({ ...formData, entity_id: Number(e.target.value) })} className={inputClass} required>
            <option value="">-- SELECT ENTITY --</option>
            {filteredEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Official_Title</label>
          <input type="text" value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Current_Status</label>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Actor['status'] })} className={`${inputClass} uppercase font-bold`}>
            <option value="active">ACTIVE</option>
            <option value="under_review">UNDER_REVIEW</option>
            <option value="former">FORMER</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>URL_Slug</label>
        <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className={`${inputClass} text-blue-400 font-mono`} required />
      </div>

      <div>
        <label className={labelClass}>Subject_Biography</label>
        <textarea value={formData.bio || ""} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className={`${inputClass} h-24 resize-none`} />
      </div>

      <div className="border-t border-slate-900 pt-6 mt-6 space-y-6">
        <h4 className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Taxonomy & Links</h4>
        
        <div>
          <label className={labelClass}>Categories</label>
          {formData.categories?.map((c, i) => (
            <div key={`cat-${i}`} className="flex gap-2 mb-2">
              <select value={c} onChange={e => {
                  const newCats = [...(formData.categories || [])];
                  newCats[i] = e.target.value;
                  setFormData({ ...formData, categories: newCats });
                }} className={`${inputClass} uppercase font-bold`}>
                <option value="">-- SELECT CATEGORY --</option>
                {taxonomies.filter(t => t.type === 'category').map(t => (
                  <option key={t.id} value={String(t.slug)}>{t.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setFormData({ ...formData, categories: formData.categories?.filter((_, idx) => idx !== i) })} className="px-4 bg-red-950/40 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white font-bold transition-all">[X]</button>
            </div>
          ))}
          <button type="button" onClick={() => setFormData({ ...formData, categories: [...(formData.categories || []), ""] })} className="text-[9px] text-blue-400 font-bold uppercase hover:underline">+ Add Additional Category</button>
        </div>

        <div>
          <label className={labelClass}>Tags</label>
          {formData.tags?.map((t, i) => (
            <div key={`tag-${i}`} className="flex gap-2 mb-2">
              <select value={t} onChange={e => {
                  const newTags = [...(formData.tags || [])];
                  newTags[i] = e.target.value;
                  setFormData({ ...formData, tags: newTags });
                }} className={`${inputClass} uppercase font-bold`}>
                <option value="">-- SELECT TAG --</option>
                {taxonomies.filter(t => t.type === 'tag').map(tax => (
                  <option key={tax.id} value={String(tax.slug)}>{tax.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags?.filter((_, idx) => idx !== i) })} className="px-4 bg-red-950/40 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white font-bold transition-all">[X]</button>
            </div>
          ))}
          <button type="button" onClick={() => setFormData({ ...formData, tags: [...(formData.tags || []), ""] })} className="text-[9px] text-blue-400 font-bold uppercase hover:underline">+ Add Additional Tag</button>
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

      <div className="flex gap-4 mt-6">
        <button type="submit" disabled={isPending} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all border ${isPending ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-blue-600 text-white border-blue-400 hover:bg-blue-500'}`}>
          {formData.id ? '[ Execute_Update ]' : '[ Commit_to_Registry ]'}
        </button>

        {formData.id && (
          <>
            <button type="button" onClick={handleDelete} disabled={isPending} className="px-6 py-4 bg-red-950/40 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white font-bold transition-all"><Trash2 size={16} /></button>
            <button type="button" onClick={handleReset} disabled={isPending} className="px-6 py-4 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white font-bold transition-all"><RotateCcw size={16} /></button>
          </>
        )}
      </div>
    </form>
  );
}