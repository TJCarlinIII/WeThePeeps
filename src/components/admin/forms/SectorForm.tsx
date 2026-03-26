"use client";
import React, { useState, useEffect } from 'react';
import { TABLE_SCHEMAS, SchemaField } from '@/lib/constants';

export interface Sector {
  id?: number;
  name: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface SectorFormProps {
  initialData?: Sector | null;
  onSave: (data: Sector) => Promise<void> | void; // Updated to handle async
}

export default function SectorForm({ initialData, onSave }: SectorFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Record<string, string | number | undefined>>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    seo_description: initialData?.seo_description || '',
    seo_keywords: initialData?.seo_keywords || '',
  });

  // Sync state if initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        slug: initialData.slug,
        seo_description: initialData.seo_description || '',
        seo_keywords: initialData.seo_keywords || '',
      });
    }
  }, [initialData]);

  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ 
      ...prev, 
      name: val, 
      slug: initialData?.id ? prev.slug : slug 
    }));
  };

  const handleCommit = async () => {
    setIsPending(true);
    try {
      // 1. Await the database write
      await onSave(formData as unknown as Sector);
      
      // 2. Trigger success notification
      setShowSuccess(true);
      
      // 3. Reset form if not in Edit mode
      if (!initialData?.id) {
        setFormData({
          name: '',
          slug: '',
          seo_description: '',
          seo_keywords: '',
        });
      }

      // 4. Clear success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("INGRESS_FAILURE:", error);
    } finally {
      setIsPending(false);
    }
  };

  const inputClass = "bg-black border border-slate-800 p-3 text-sm w-full focus:border-blue-500 outline-none text-white font-mono uppercase mb-4";
  const labelClass = "text-[9px] text-slate-500 font-bold mb-1 block tracking-widest";

  return (
    <div className="flex flex-col relative">
      {/* SUCCESS NOTIFICATION OVERLAY */}
      {showSuccess && (
        <div className="absolute top-[-40px] left-0 right-0 bg-emerald-500/10 border border-emerald-500 p-2 text-center animate-pulse">
          <span className="text-emerald-500 text-[10px] font-black tracking-[0.2em]">
            RECORD_INITIALIZED_SUCCESSFULLY
          </span>
        </div>
      )}

      {TABLE_SCHEMAS.sectors.map((field: SchemaField) => (
        <div key={field.name}>
          <label className={labelClass}>{field.label.toUpperCase()}</label>
          {field.type === 'textarea' ? (
            <textarea
              className={`${inputClass} normal-case h-24`}
              value={String(formData[field.name] || '')}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              placeholder={field.placeholder}
            />
          ) : (
            <input
              className={inputClass}
              type="text"
              value={String(formData[field.name] || '')}
              onChange={(e) => {
                if (field.name === 'name') handleNameChange(e.target.value);
                else setFormData({ ...formData, [field.name]: e.target.value });
              }}
              placeholder={field.placeholder}
              required={field.required}
            />
          )}
        </div>
      ))}

      <button
        type="button"
        disabled={isPending}
        onClick={handleCommit}
        className={`py-4 font-black text-xs tracking-[0.3em] transition-all mt-4 border ${
          isPending 
            ? "bg-slate-900 border-slate-700 text-slate-500 cursor-wait" 
            : showSuccess
            ? "bg-emerald-600 border-emerald-400 text-white"
            : "bg-[#4A90E2] border-blue-400 hover:bg-blue-500 text-black"
        }`}
      >
        {isPending 
          ? "COMMITTING_TO_DATABASE..." 
          : showSuccess 
          ? "RECORD_SAVED" 
          : initialData?.id 
          ? "CONFIRM_DATABASE_OVERRIDE" 
          : "INITIALIZE_NEW_RECORD"}
      </button>
    </div>
  );
}