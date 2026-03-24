"use client";
import React, { useState } from 'react';

// Exported for the Manager Page
export interface ActorType {
  id?: number;
  name: string;
}

interface ActorTypeFormProps {
  initialData?: ActorType | null;
  onSave: (data: ActorType) => void;
}

export default function ActorTypeForm({ initialData, onSave }: ActorTypeFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const commonStyles = "bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white font-mono uppercase";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-[10px] text-slate-500 font-bold mb-2 tracking-widest uppercase">Classification Name</label>
        <input 
          className={commonStyles}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. BUREAUCRAT or LOBBYIST"
        />
      </div>
      <button 
        type="button"
        onClick={() => onSave({ ...initialData, name })}
        className="bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black text-xs tracking-[0.3em] transition-all"
      >
        {initialData?.id ? "UPDATE_CLASSIFICATION" : "COMMIT_NEW_TYPE"}
      </button>
    </div>
  );
}