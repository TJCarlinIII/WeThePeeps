// src/components/foia/RecordCategorySelector.tsx
'use client';
import React from 'react';
import { RECORD_CATEGORIES, type RecordCategory } from '@/lib/foia/templates';
interface RecordCategorySelectorProps {
  selectedCategories: string[];
  onToggle: (id: string) => void;
}

export default function RecordCategorySelector({ 
  selectedCategories, 
  onToggle 
}: RecordCategorySelectorProps) {
  
  const getColorClasses = (color?: string, isSelected: boolean = false) => {
    const base = "border-2 px-3 py-2 rounded text-[10px] font-bold uppercase transition-all cursor-pointer select-none flex items-center gap-2";
    const colors: Record<string, string> = {
      blue: "border-blue-900/40 text-blue-400 hover:bg-blue-950/30",
      red: "border-red-900/40 text-red-400 hover:bg-red-950/30",
      emerald: "border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/30",
      orange: "border-orange-900/40 text-orange-400 hover:bg-orange-950/30",
      yellow: "border-yellow-900/40 text-yellow-400 hover:bg-yellow-950/30"
    };
    const selected = "bg-slate-800 border-[#4A90E2] text-white shadow-[0_0_10px_rgba(74,144,226,0.3)]";
    return `${base} ${color ? colors[color] : ''} ${isSelected ? selected : ''}`;
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] uppercase font-black text-slate-500 block mb-2">
        Select Record Categories to Request:
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {RECORD_CATEGORIES.map(cat => {
          const isSelected = selectedCategories.includes(cat.id);
          return (
            <label 
              key={cat.id}
              className={getColorClasses(cat.color, isSelected)}
              title={cat.description}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(cat.id)}
                className="sr-only"
                aria-label={`Toggle ${cat.label}`}
              />
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#4A90E2]' : 'bg-slate-700'}`} aria-hidden="true" />
              {cat.label}
            </label>
          );
        })}
      </div>
      <p className="text-[9px] text-slate-600 italic">
        Tip: Select multiple categories for comprehensive requests. Uncheck to remove.
      </p>
    </div>
  );
}