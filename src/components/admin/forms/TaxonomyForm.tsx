"use client";
import React, { useState, useEffect } from 'react';
import { saveTaxonomyTerm } from "@/app/admin/actions";

export interface Taxonomy {
  id?: number;
  name: string;
  type: 'category' | 'tag';
  slug?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface FormProps {
  initialData?: Taxonomy | null;
  onSave: () => void;
}

// Simple slugify function (can be moved to a shared utility if needed)
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, '')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .split('-')
    .filter(word => !['and', 'or', 'the', 'of', 'in', 'with'].includes(word))
    .join('-');
}

export default function TaxonomyForm({ initialData, onSave }: FormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [slugValue, setSlugValue] = useState(initialData?.slug || "");

  // Update slug when editing a different term
  useEffect(() => {
    setSlugValue(initialData?.slug || "");
  }, [initialData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Only auto‑generate slug if we are NOT editing an existing term
    if (!initialData) {
      setSlugValue(slugify(name));
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    try {
      const result = await saveTaxonomyTerm(formData);
      if (result.success) {
        onSave(); // Refresh the parent registry
      } else {
        setError(result.error || "UNKNOWN_CORE_ERROR");
      }
    } catch (err) {
      setError("CRITICAL_SYSTEM_FAULT: Communication failed.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden ID for updates */}
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      {/* Error display */}
      {error && (
        <div className="bg-red-950/20 border border-red-900 p-3 mb-6 animate-pulse">
          <p className="text-[10px] text-red-500 font-black uppercase tracking-tighter">
            [!] Error_Detected: {error}
          </p>
        </div>
      )}

      {/* System status indicator */}
      <div className="space-y-1">
        <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">System_Status</label>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500 animate-ping' : 'bg-emerald-500'}`} />
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">
            {isPending ? 'Processing_Request...' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Term name */}
        <div>
          <label className="block text-[9px] text-slate-500 uppercase font-black mb-1">Term_Name</label>
          <input
            name="name"
            defaultValue={initialData?.name || ""}
            onChange={handleNameChange}
            required
            className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Constitutional Law"
          />
        </div>

        {/* Type and slug row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-black mb-1">Type_Classification</label>
            <select
              name="type"
              defaultValue={initialData?.type || "tag"}
              className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 outline-none uppercase font-bold"
            >
              <option value="category">CATEGORY (Structural)</option>
              <option value="tag">TAG (Descriptive)</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-black mb-1">URL_Slug</label>
            <input
              name="slug"
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-slate-400 focus:border-blue-500 outline-none font-mono"
              placeholder="auto-generated"
            />
          </div>
        </div>

        {/* SEO description */}
        <div>
          <label className="block text-[9px] text-slate-500 uppercase font-black mb-1">Node_Definition (SEO)</label>
          <textarea
            name="seo_description"
            defaultValue={initialData?.seo_description || ""}
            rows={3}
            className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 outline-none font-sans italic"
          />
        </div>

        {/* SEO keywords */}
        <div>
          <label className="block text-[9px] text-slate-500 uppercase font-black mb-1">SEO_Keywords</label>
          <input
            name="seo_keywords"
            defaultValue={initialData?.seo_keywords || ""}
            className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-emerald-600 focus:border-emerald-500 outline-none font-mono"
            placeholder="comma, separated, values"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all border ${
          isPending
            ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            : 'bg-blue-600 text-white border-blue-400 hover:bg-blue-500 active:scale-[0.98]'
        }`}
      >
        {initialData ? '[ Execute_Update ]' : '[ Commit_to_Registry ]'}
      </button>
    </form>
  );
}