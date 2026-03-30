// src/components/admin/forms/IncidentForm.tsx
"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { slugify } from "@/lib/stringutils";

export interface Incident {
  id?: number;
  title: string;
  slug: string;
  description: string;
  sector_id: number;
  entity_id: number;
  actor_id: number;
  statute_id: number;
  status: 'pending' | 'verified' | 'archived';
  is_critical: number;
  event_date: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface IncidentFormProps {
  initialData?: Incident | null;
  sectors: { id: number; name: string }[];
  entities: { id: number; name: string; sector_id: number }[];
  actors: { id: number; full_name: string; entity_id: number }[];
  statutes: { id: number; title: string; citation: string }[];
  onSave: (data: Incident) => void;
}

// ✅ Searchable Combobox Component (reusable)
interface ComboboxProps {
  label: string;
  options: { id: number; label: string; subtitle?: string }[];
  value: number;
  onChange: (id: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

function SearchableCombobox({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Search...", 
  required = false,
  disabled = false 
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(q) || 
      opt.subtitle?.toLowerCase().includes(q)
    );
  }, [options, query]);

  // Get selected option label for display
  const selectedOption = options.find(opt => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (id: number) => {
    onChange(id);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Input/Display Area */}
      <div 
        className={`w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none font-mono cursor-text ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none placeholder:text-slate-600"
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
          />
        ) : (
          <span className={selectedOption ? 'text-white' : 'text-slate-600'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-black border border-slate-700 shadow-2xl max-h-48 overflow-y-auto rounded-sm">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-[10px] text-slate-500 italic">No matches found</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`p-2 text-xs cursor-pointer hover:bg-[#4A90E2]/10 hover:text-[#4A90E2] transition-colors ${
                  value === opt.id ? 'bg-[#4A90E2]/20 text-[#4A90E2] font-bold' : 'text-slate-300'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                {opt.subtitle && (
                  <div className="text-[9px] text-slate-500 mt-0.5">{opt.subtitle}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function IncidentForm({
  initialData,
  sectors,
  entities,
  actors,
  statutes,
  onSave
}: IncidentFormProps) {
  const emptyState: Incident = {
    title: "",
    slug: "",
    description: "",
    sector_id: 0,
    entity_id: 0,
    actor_id: 0,
    statute_id: 0,
    status: "pending",
    is_critical: 0,
    event_date: new Date().toISOString().split('T')[0],
    seo_description: "",
    seo_keywords: ""
  };

  const [formData, setFormData] = useState<Incident>(initialData || emptyState);

  // --- HIERARCHICAL FILTERING ---
  const filteredEntities = useMemo(() => {
    if (Number(formData.sector_id) === 0) return entities;
    return entities.filter(e => Number(e.sector_id) === Number(formData.sector_id));
  }, [entities, formData.sector_id]);

  const filteredActors = useMemo(() => {
    if (Number(formData.entity_id) === 0) return actors;
    return actors.filter(a => Number(a.entity_id) === Number(formData.entity_id));
  }, [actors, formData.entity_id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = slugify(title);
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Format options for comboboxes
  const sectorOptions = sectors.map(s => ({ id: s.id, label: s.name }));
  const entityOptions = filteredEntities.map(e => ({ 
    id: e.id, 
    label: e.name,
    subtitle: `Sector ID: ${e.sector_id}`
  }));
  const actorOptions = filteredActors.map(a => ({ 
    id: a.id, 
    label: a.full_name,
    subtitle: `Entity ID: ${a.entity_id}`
  }));
  const statuteOptions = statutes.map(st => ({ 
    id: st.id, 
    label: st.title,
    subtitle: st.citation
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. CLASSIFICATION HIERARCHY - Now with Searchable Comboboxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 border border-slate-900">
        <SearchableCombobox
          label="Sector"
          options={sectorOptions}
          value={formData.sector_id}
          onChange={(id) => setFormData(prev => ({ 
            ...prev, 
            sector_id: id, 
            entity_id: 0, 
            actor_id: 0 
          }))}
          placeholder="-- Select Sector --"
          required
        />
        
        <SearchableCombobox
          label="Entity"
          options={entityOptions}
          value={formData.entity_id}
          onChange={(id) => setFormData(prev => ({ 
            ...prev, 
            entity_id: id, 
            actor_id: 0 
          }))}
          placeholder="-- Select Entity --"
          required
          disabled={Number(formData.sector_id) === 0}
        />
        
        <SearchableCombobox
          label="Primary Actor"
          options={actorOptions}
          value={formData.actor_id}
          onChange={(id) => setFormData(prev => ({ ...prev, actor_id: id }))}
          placeholder="-- Select Official --"
          disabled={Number(formData.entity_id) === 0}
        />
      </div>

      {/* 2. INCIDENT DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
            Incident Title <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={handleTitleChange} 
            className="w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none font-mono" 
            required 
          />
        </div>
        <div>
          <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
            Event Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            className="w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none font-mono"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableCombobox
          label="Applicable Statute"
          options={statuteOptions}
          value={formData.statute_id}
          onChange={(id) => setFormData(prev => ({ ...prev, statute_id: id }))}
          placeholder="-- Select Statute --"
        />
        
        <div>
          <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
            Verification Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Incident['status'] })}
            className="w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none font-mono"
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        
        <div>
          <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
            Critical Alert
          </label>
          <select
            value={formData.is_critical}
            onChange={(e) => setFormData({ ...formData, is_critical: Number(e.target.value) })}
            className={`w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none font-mono ${formData.is_critical === 1 ? 'text-red-500 border-red-900' : ''}`}
          >
            <option value={0}>Standard Priority</option>
            <option value={1}>CRITICAL_VIOLATION</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
          Case Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none font-mono h-32 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#4A90E2] hover:bg-blue-500 text-white font-black py-4 text-[10px] uppercase tracking-[0.4em] mt-4 shadow-lg shadow-blue-900/20 transition-all"
      >
        Commit_Incident_To_Manifest
      </button>
    </form>
  );
}