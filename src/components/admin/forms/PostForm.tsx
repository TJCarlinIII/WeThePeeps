"use client";
import React, { useState } from 'react';

// Exported for the Manager Page
export interface Post {
  id?: number;
  title: string;
  content: string;
  is_critical: number;
  is_featured: number;
  author_id?: number;
  entity_ids?: number[]; 
}

interface Entity {
  id: number;
  name: string;
}

interface PostFormProps {
  initialData?: Post | null;
  entities: Entity[];
  onSave: (data: Post) => void;
}

export default function PostForm({ initialData, entities, onSave }: PostFormProps) {
  const [formData, setFormData] = useState<Post>({
    title: '',
    content: '',
    is_critical: 0,
    is_featured: 0,
    entity_ids: [],
    ...initialData
  });

  const commonStyles = "bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white font-mono uppercase";

  const toggleEntity = (id: number) => {
    const currentIds = formData.entity_ids || [];
    const newIds = currentIds.includes(id)
      ? currentIds.filter(i => i !== id)
      : [...currentIds, id];
    setFormData({ ...formData, entity_ids: newIds });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Post Title</label>
        <input 
          className={commonStyles}
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-slate-900/50 p-3 border border-slate-800">
          <input 
            type="checkbox"
            checked={formData.is_critical === 1}
            onChange={(e) => setFormData({...formData, is_critical: e.target.checked ? 1 : 0})}
            className="w-4 h-4 accent-[#4A90E2]"
          />
          <label className="text-[10px] text-white font-bold tracking-widest uppercase">Mark as Critical</label>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 p-3 border border-slate-800">
          <input 
            type="checkbox"
            checked={formData.is_featured === 1}
            onChange={(e) => setFormData({...formData, is_featured: e.target.checked ? 1 : 0})}
            className="w-4 h-4 accent-[#4A90E2]"
          />
          <label className="text-[10px] text-white font-bold tracking-widest uppercase">Mark as Featured</label>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Associated Entities</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-slate-700 p-3 bg-black">
          {entities.map(entity => (
            <label key={entity.id} className="flex items-center gap-2 text-[10px] text-slate-400 cursor-pointer hover:text-white">
              <input 
                type="checkbox"
                checked={formData.entity_ids?.includes(entity.id)}
                onChange={() => toggleEntity(entity.id)}
                className="accent-[#4A90E2]"
              />
              {entity.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Content (Markdown/Text)</label>
        <textarea 
          className={`${commonStyles} h-64 normal-case`}
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
        />
      </div>

      <button 
        type="button"
        onClick={() => onSave(formData)}
        className="bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black transition-all text-xs tracking-[0.3em]"
      >
        {initialData?.id ? "UPDATE_POST" : "COMMIT_POST"}
      </button>
    </div>
  );
}