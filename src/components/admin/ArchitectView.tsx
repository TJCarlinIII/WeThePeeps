// src/components/admin/ArchitectView.tsx
"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TABLE_SCHEMAS, type SchemaField } from '@/lib/schemas';
import { Edit3, Trash2, RefreshCw, Shield, Scale, Gavel, Building2, HeartPulse, AlertTriangle, Users } from 'lucide-react';
import { saveRecord, deleteRecord, getRecords } from '@/app/admin/actions';

interface ArchitectProps {
  table: 'incidents' | 'rebuttals' | 'cases' | 'media';
  title: string;
}

type RecordType = {
  id: number;
  title?: string;
  name?: string;
  full_name?: string;
  status?: string;
  [key: string]: any;
};

// ✅ NEW: Searchable Combobox Component with proper typing
interface ComboboxOption {
  id: number;
  label: string;
  dependsOnVal?: any;
}

function SearchableCombobox({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Search...", 
  required = false, 
  disabled = false 
}: {
  label: string;
  options: ComboboxOption[];
  value: number;
  onChange: (id: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query.toLowerCase())
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
    if (isOpen) {
      // Small delay to ensure input is rendered
      setTimeout(() => {
        const input = containerRef.current?.querySelector('input');
        input?.focus();
      }, 0);
    }
  }, [isOpen]);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Input/Display Area */}
      <div 
        className={`w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none cursor-text ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {isOpen ? (
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none placeholder:text-slate-600"
            onClick={(e) => e.stopPropagation()}
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
                onClick={() => { 
                  onChange(opt.id); 
                  setIsOpen(false); 
                  setQuery(''); 
                }}
                className="p-3 text-sm cursor-pointer hover:bg-[#4A90E2]/20 hover:text-[#4A90E2] border-b border-slate-900 transition-colors"
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ArchitectView({ table, title }: ArchitectProps) {
  const schema = TABLE_SCHEMAS[table];
  const [records, setRecords] = useState<RecordType[]>([]);
  const [relations, setRelations] = useState<Record<string, { id: number; [key: string]: any }[]>>({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter] = useState('ALL'); // ✅ NEW: Natural Law filter state

  // ✅ Enhanced Natural Law / Ethical Anchors (v2.2)
  const naturalLawFilters = [
    { 
      label: "Sanctity of Life", 
      value: "not-kill", 
      commandment: "Thou Shalt Not Kill",
      description: "Medical negligence, terminal protocol failures, and deprivation of care."
    },
    { 
      label: "Moral Integrity", 
      value: "false-witness", 
      commandment: "Thou Shalt Not Bear False Witness",
      description: "Falsified medical records, deceptive testimony, and fraudulent reporting."
    },
    { 
      label: "Financial Justice", 
      value: "not-steal", 
      commandment: "Thou Shalt Not Steal",
      description: "Predatory billing, insurance fraud, and deprivation of patient finances."
    },
    { 
      label: "Institutional Motive", 
      value: "not-covet", 
      commandment: "Thou Shalt Not Covet",
      description: "Profit-over-patient motives and aggressive corporate expansion at the cost of safety."
    },
    { 
      label: "Vulnerable Care", 
      value: "honor-parents", 
      commandment: "Honor Thy Father and Mother",
      description: "Elder abuse, nursing home neglect, and interference with family advocacy."
    }
  ];

  // ✅ Load records + related table data for comboboxes
  const loadData = async () => {
    setLoading(true);
    try {
      // Load main records
      const result = await getRecords(table);
      if (result.success && Array.isArray(result.data)) {
        setRecords(result.data as RecordType[]);
      } else {
        setRecords([]);
      }

      // Auto-fetch related table data for comboboxes
      const relationTables = Array.from(
        new Set(
          schema
            .filter((f: SchemaField) => f.type === 'relation')
            .map((f: SchemaField) => f.table!)
        )
      );

      for (const relTable of relationTables) {
        try {
          const res = await fetch(`/api/${relTable}`);
          if (res.ok) {
            // ✅ FIX: Add type assertion for res.json()
            const data = await res.json() as { results?: { id: number; [key: string]: any }[] };
            setRelations(prev => ({ 
              ...prev, 
              [relTable]: data.results || [] 
            }));
          }
        } catch (err) {
          console.error(`Failed to load ${relTable}:`, err);
        }
      }
    } catch (err) {
      console.error(`LOAD_ERROR [${table}]:`, err);
      setMessage({ type: 'error', text: 'Failed to load records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [table]);

  // ✅ Handle form input changes
  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Edit record - populate form
  const handleEdit = (record: RecordType) => {
    setFormData(record);
    // Scroll to form
    document.getElementById('architect-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append('table_name', table);
      if (formData.id) fd.append('id', String(formData.id));
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          fd.append(key, String(value));
        }
      });

      const result = await saveRecord(fd);
      
      if (result.success) {
        setMessage({ type: 'success', text: formData.id ? 'Record updated' : 'Record created' });
        setFormData({}); // Reset form
        await loadData(); // Refresh list
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save' });
      }
    } catch (err) {
      console.error(`SUBMIT_ERROR [${table}]:`, err);
      setMessage({ type: 'error', text: 'Failed to save record' });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete record
  const handleDelete = async (id: number) => {
    if (!confirm(`Delete record #${id}? This cannot be undone.`)) return;

    try {
      const result = await deleteRecord(table, id);
      if (result.success) {
        setMessage({ type: 'success', text: 'Record deleted' });
        await loadData();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete' });
      }
    } catch (err) {
      console.error(`DELETE_ERROR [${table}]:`, err);
      setMessage({ type: 'error', text: 'Failed to delete record' });
    }
  };

  // ✅ Render field based on schema type
  const renderField = (field: SchemaField) => {
    const value = formData[field.name] ?? '';

    if (field.type === 'relation') {
      let options = (relations[field.table!] || []).map(opt => ({
        id: opt.id,
        label: opt.name || opt.full_name || opt.title || opt.citation || `ID: ${opt.id}`,
        // ✅ Ensure the dependsOn field name matches the schema exactly
        dependsOnVal: field.dependsOn ? opt[field.dependsOn] : null
      }));

      // Apply dependency filtering
      if (field.dependsOn && formData[field.dependsOn]) {
        options = options.filter(opt => 
          // ✅ Use Number() for consistent comparison
          Number(opt.dependsOnVal) === Number(formData[field.dependsOn!])
        );
      }

      // ✅ Ensure disabled prop is strictly boolean
      const isDisabled = Boolean(field.dependsOn && !formData[field.dependsOn]);

      return (
        <SearchableCombobox
          label={field.label}
          options={options}
          value={Number(value) || 0}
          onChange={(id: number) => setFormData(prev => ({ ...prev, [field.name]: id }))}
          placeholder={`-- Select ${field.label} --`}
          required={field.required}
          disabled={Boolean(field.dependsOn && !formData[field.dependsOn])}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={String(value)}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-[#4A90E2] outline-none"
          required={field.required}
        >
          <option value="">-- Select --</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={String(value)}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-[#4A90E2] outline-none min-h-[100px]"
          required={field.required}
        />
      );
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          value={String(value)}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-[#4A90E2] outline-none"
          required={field.required}
        />
      );
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          value={Number(value) || ''}
          onChange={(e) => handleInputChange(field.name, Number(e.target.value) || null)}
          className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-[#4A90E2] outline-none"
          required={field.required}
        />
      );
    }

    // Default: text input
    return (
      <input
        type="text"
        value={String(value)}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:border-[#4A90E2] outline-none"
        required={field.required}
      />
    );
  };

  // ✅ Filter records based on Natural Law filter
  const filteredRecords = useMemo(() => {
    if (filter === 'ALL') return records;
    
    // Simple keyword matching for demonstration
    // In production, you'd map records to natural law categories via metadata/tags
    const keywords: Record<string, string[]> = {
      'not-kill': ['medical', 'negligence', 'death', 'deprivation', 'care', 'health', 'life'],
      'false-witness': ['falsified', 'false', 'deceptive', 'fraud', 'lie', 'misrepresent', 'perjury'],
      'not-steal': ['billing', 'financial', 'insurance', 'fraud', 'predatory', 'deprivation', 'theft', 'covet'],
      'not-covet': ['profit', 'expansion', 'corporate', 'motive', 'greed', 'covet', 'acquisition'],
      'honor-parents': ['elder', 'nursing', 'family', 'advocacy', 'parent', 'vulnerable', 'care', 'honor']
    };
    
    const filterKeywords = keywords[filter] || [];
    return records.filter(record => {
      const recordText = JSON.stringify(record).toLowerCase();
      return filterKeywords.some(keyword => recordText.includes(keyword));
    });
  }, [records, filter]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black text-white font-mono">
      {/* LEFT PANE: FORM / DATA INGRESS */}
      <div className="w-full lg:w-1/3 border-r border-slate-900 p-6 bg-slate-950/20">
        <header className="mb-6 flex justify-between items-center">
          <h2 className="text-[#4A90E2] text-sm font-black tracking-widest uppercase">
            {formData.id ? `EDIT_${table.toUpperCase()}` : `NEW_${table.toUpperCase()}`}
          </h2>
          {formData.id && (
            <button
              type="button"
              onClick={() => setFormData({})}
              className="text-[9px] text-slate-500 hover:text-white uppercase"
            >
              [ Cancel Edit ]
            </button>
          )}
        </header>

        <form id="architect-form" onSubmit={handleSubmit} className="space-y-4">
          {schema.map((field) => (
            <div key={field.name} className="space-y-1">
              {/* Only show label for non-relation fields (combobox has its own label) */}
              {field.type !== 'relation' && (
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
              )}
              {renderField(field)}
            </div>
          ))}

          {/* Message display */}
          {message && (
            <div className={`text-xs p-2 ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              submitting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-[#4A90E2] hover:bg-[#357ABD] text-black'
            }`}
          >
            {submitting ? 'PROCESSING...' : formData.id ? 'UPDATE_RECORD' : 'CREATE_RECORD'}
          </button>
        </form>
      </div>

      {/* RIGHT PANE: LIVE MANIFEST WITH ENHANCED NATURAL LAW FILTERS */}
      <div className="flex-1 p-6 bg-black">
        <div className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white uppercase">{title}</h1>
            <p className="text-[9px] text-emerald-500 uppercase mt-1 font-bold tracking-[0.2em]">
              {filteredRecords.length}_RECORDS_LOADED // Active_Filter: {filter}
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 text-[9px] text-slate-500 hover:text-[#4A90E2] uppercase"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Enhanced Natural Law Filter Sidebar */}
        <aside className="mb-8 p-4 border border-slate-900 bg-slate-950/30">
          <h3 className="text-[10px] uppercase text-red-900 mb-3 border-l-2 border-red-900 pl-2">
            Natural_Law_Anchors_v2.2
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {naturalLawFilters.map((law) => (
              <button
                key={law.value}
                onClick={() => setFilter(law.value)}
                className={`group flex flex-col text-left space-y-1 p-3 border transition-all ${
                  filter === law.value 
                    ? 'border-red-900 bg-red-950/20 text-red-500' 
                    : 'border-slate-800 hover:border-red-900/50 hover:bg-slate-900/30'
                }`}
              >
                <span className="text-[11px] font-bold uppercase flex items-center gap-2">
                  {law.value === 'not-kill' && <HeartPulse size={14} />}
                  {law.value === 'false-witness' && <Scale size={14} />}
                  {law.value === 'not-steal' && <AlertTriangle size={14} />}
                  {law.value === 'not-covet' && <Building2 size={14} />}
                  {law.value === 'honor-parents' && <Users size={14} />}
                  {law.commandment}
                </span>
                <span className="text-[9px] text-slate-600 leading-tight">
                  {law.description}
                </span>
              </button>
            ))}
            <button
              onClick={() => setFilter('ALL')}
              className={`group flex flex-col text-left space-y-1 p-3 border transition-all ${
                filter === 'ALL' 
                  ? 'border-[#4A90E2] bg-[#4A90E2]/10 text-[#4A90E2]' 
                  : 'border-slate-800 hover:border-[#4A90E2]/50 hover:bg-slate-900/30'
              }`}
            >
              <span className="text-[11px] font-bold uppercase flex items-center gap-2">
                <Shield size={14} /> [ALL_RECORDS]
              </span>
              <span className="text-[9px] text-slate-600 leading-tight">
                Show all records without filtering
              </span>
            </button>
          </div>
        </aside>

        {loading ? (
          <p className="text-slate-700 animate-pulse text-xs uppercase">Loading_records...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="text-slate-600 text-xs uppercase">No records found for filter: {filter}</p>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="group border border-slate-900 bg-slate-950/40 p-4 flex justify-between items-center hover:border-[#4A90E2]/40 transition-all"
              >
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-tight">
                    {record.title || record.name || record.full_name || `Record #${record.id}`}
                  </h3>
                  {record.status && (
                    <p className="text-[9px] text-slate-500 uppercase mt-1">{record.status}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 border border-slate-800 hover:bg-[#4A90E2]/10 hover:border-[#4A90E2] transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={14} className="text-[#4A90E2]" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 border border-slate-800 hover:bg-red-500/10 hover:border-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}