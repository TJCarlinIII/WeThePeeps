"use client";
import React, { useState } from 'react';

interface PostActor {
  post_id: string | number;
  actor_id: string | number;
}

interface PostActorProps {
  initialData?: PostActor | null;
  posts: { id: number; title: string }[];
  actors: { id: number; full_name: string }[];
  onSave: (data: PostActor) => void;
}

export default function PostActorForm({ initialData, posts, actors, onSave }: PostActorProps) {
  const [formData, setFormData] = useState<PostActor>({
    post_id: '',
    actor_id: '',
    ...initialData
  });

  const commonStyles = "bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white font-mono uppercase";

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Target Post</label>
        <select 
          className={commonStyles}
          value={formData.post_id}
          onChange={(e) => setFormData({...formData, post_id: e.target.value})}
        >
          <option value="">-- SELECT_POST --</option>
          {posts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Target Actor</label>
        <select 
          className={commonStyles}
          value={formData.actor_id}
          onChange={(e) => setFormData({...formData, actor_id: e.target.value})}
        >
          <option value="">-- SELECT_ACTOR --</option>
          {actors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
        </select>
      </div>

      <button 
        type="button"
        onClick={() => onSave(formData)}
        className="bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black transition-all text-xs tracking-[0.3em]"
      >
        ASSOCIATE_ACTOR_TO_POST
      </button>
    </div>
  );
}