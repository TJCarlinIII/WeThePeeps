// src/app/admin/modules/incidents/IncidentManager.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { WTP_TABLE_SCHEMAS, type SchemaField } from "@/lib/wtp-schema";
import { slugify } from "@/lib/stringutils";
import type {
  Incident,
  IncidentParticipant,
  IncidentEvidence,
  IncidentStatute,
  RecordsRequest,
  Actor,
  Entity,
  Statute,
  Evidence
} from "@/lib/wtp-data-types";

// ── API Response Interfaces ────────────────────────────────────────────────
interface ApiListResponse<T> {
  results?: T[];
}
interface ApiSingleResponse<T> {
  data?: T;
  success?: boolean;
  id?: number;
  error?: string;
}

// ── SAFE FETCH WRAPPER: Silences 404s for unimplemented endpoints ─────────
async function safeFetchJoinData<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url);
    if (res.status === 404) {
      console.debug(`[LazyLoad] Endpoint not ready: ${url}`);
      return [];
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { results?: T[] };
    return data.results || [];
  } catch (err) {
    console.debug(`[LazyLoad] Fetch failed for ${url}:`, err);
    return [];
  }
}

// Searchable combobox for relations (reusable)
function SearchableRelationSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Search...",
  required = false,
  disabled = false
}: {
  label: string;
  options: { id: number; label: string; subtitle?: string }[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.id === value);
  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase()) ||
    o.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-1 relative">
      <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full bg-black border border-slate-800 p-2 text-xs text-white cursor-text ${disabled ? 'opacity-50' : ''}`}
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
          <span className={selected ? 'text-white' : 'text-slate-600'}>
            {selected?.label || placeholder}
          </span>
        )}
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-black border border-slate-700 shadow-2xl max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-[10px] text-slate-500 italic">No matches</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                  setQuery("");
                }}
                className="p-2 text-xs cursor-pointer hover:bg-[#4A90E2]/10 hover:text-[#4A90E2] transition-colors"
              >
                <div className="font-medium">{opt.label}</div>
                {opt.subtitle && <div className="text-[9px] text-slate-500">{opt.subtitle}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function IncidentManager() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [participants, setParticipants] = useState<Record<number, IncidentParticipant[]>>({});
  const [evidence, setEvidence] = useState<Record<number, IncidentEvidence[]>>({});
  const [statutes, setStatutes] = useState<Record<number, IncidentStatute[]>>({});
  const [requests, setRequests] = useState<Record<number, RecordsRequest[]>>({});
  const [actors, setActors] = useState<Actor[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [statuteList, setStatuteList] = useState<Statute[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Incident>>({});
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'core' | 'participants' | 'evidence' | 'statutes' | 'requests'>('core');

  // ── LOAD CORE DATA ONLY (incidents + reference tables) ───────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch incidents from API with type assertion
      const incidentsRes = await fetch('/api/modules/incidents');
      const incidentsData = await incidentsRes.json() as ApiListResponse<Incident>;
      setIncidents(incidentsData.results || []);

      // Fetch reference data from their respective API endpoints with type assertions
      const [actorsRes, entitiesRes, statutesRes, evidenceRes] = await Promise.all([
        fetch('/api/actors'),
        fetch('/api/entities'),
        fetch('/api/statutes'),
        fetch('/api/evidence'),
      ]);
      const [actorsData, entitiesData, statutesData, evidenceData] = await Promise.all([
        actorsRes.json() as Promise<ApiListResponse<Actor>>,
        entitiesRes.json() as Promise<ApiListResponse<Entity>>,
        statutesRes.json() as Promise<ApiListResponse<Statute>>,
        evidenceRes.json() as Promise<ApiListResponse<Evidence>>,
      ]);
      setActors(actorsData.results || []);
      setEntities(entitiesData.results || []);
      setStatuteList(statutesData.results || []);
      setEvidenceList(evidenceData.results || []);

      // ❌ REMOVED: The loop that fetched join-table data for all incidents
      // That logic moves to tab-specific useEffects below

    } catch (err) {
      console.error("LOAD_ERROR [incidents-v2]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── TAB-SPECIFIC FETCH FUNCTIONS (Lazy Loading) ──────────────────────────
  const loadParticipantsForIncident = useCallback(async (incidentId: number) => {
    const results = await safeFetchJoinData<IncidentParticipant>(
      `/api/modules/incidents/${incidentId}/participants`
    );
    setParticipants(prev => ({ ...prev, [incidentId]: results }));
  }, []);

  const loadEvidenceForIncident = useCallback(async (incidentId: number) => {
    const results = await safeFetchJoinData<IncidentEvidence>(
      `/api/modules/incidents/${incidentId}/evidence`
    );
    setEvidence(prev => ({ ...prev, [incidentId]: results }));
  }, []);

  const loadStatutesForIncident = useCallback(async (incidentId: number) => {
    const results = await safeFetchJoinData<IncidentStatute>(
      `/api/modules/incidents/${incidentId}/statutes`
    );
    setStatutes(prev => ({ ...prev, [incidentId]: results }));
  }, []);

  const loadRequestsForIncident = useCallback(async (incidentId: number) => {
    const results = await safeFetchJoinData<RecordsRequest>(
      `/api/modules/incidents/${incidentId}/requests`
    );
    setRequests(prev => ({ ...prev, [incidentId]: results }));
  }, []);

  // ── TAB-SPECIFIC EFFECTS: Only fetch when tab is active + incident selected ─
  useEffect(() => {
    if (activeTab === 'participants' && selectedIncidentId) {
      loadParticipantsForIncident(selectedIncidentId);
    }
  }, [activeTab, selectedIncidentId, loadParticipantsForIncident]);

  useEffect(() => {
    if (activeTab === 'evidence' && selectedIncidentId) {
      loadEvidenceForIncident(selectedIncidentId);
    }
  }, [activeTab, selectedIncidentId, loadEvidenceForIncident]);

  useEffect(() => {
    if (activeTab === 'statutes' && selectedIncidentId) {
      loadStatutesForIncident(selectedIncidentId);
    }
  }, [activeTab, selectedIncidentId, loadStatutesForIncident]);

  useEffect(() => {
    if (activeTab === 'requests' && selectedIncidentId) {
      loadRequestsForIncident(selectedIncidentId);
    }
  }, [activeTab, selectedIncidentId, loadRequestsForIncident]);

  // ✅ FIX: Auto-generate slug from title using slugify utility
  const handleTitleChange = (value: string) => {
    setFormData(prev => {
      // Only auto-generate slug for NEW records (no id yet)
      if (!prev.id && (!prev.slug || prev.slug === slugify(prev.title || ''))) {
        return { ...prev, title: value, slug: slugify(value) };
      }
      return { ...prev, title: value };
    });
  };

  // Handle core incident form submission via API
  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ VALIDATION: Ensure required fields are present
    if (!formData.title?.trim()) {
      alert("Title is required");
      return;
    }
    if (!formData.slug?.trim()) {
      alert("Slug is required - it should auto-generate from title");
      return;
    }
    if (!formData.event_date) {
      alert("Event date is required");
      return;
    }
    if (!formData.description?.trim()) {
      alert("Description is required");
      return;
    }
    try {
      // ✅ Use fetch to call the API route (NOT direct DB access)
      const method = formData.id ? 'PATCH' : 'POST';
      const url = formData.id ? `/api/modules/incidents?id=${formData.id}` : '/api/modules/incidents';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: slugify(formData.slug || formData.title || ''),
        }),
      });
      const result = await response.json() as ApiSingleResponse<Incident>;
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save incident');
      }
      if (!formData.id && result.id) {
        setSelectedIncidentId(result.id);
      }
      await loadData();
      setFormData({});
    } catch (err: any) {
      console.error("SAVE_ERROR [incidents-v2]:", err);
      alert(`Failed to save incident: ${err.message || 'Unknown error'}`);
    }
  };

  // Add participant to incident via API
  const handleAddParticipant = async (participant: Omit<IncidentParticipant, 'id'>) => {
    try {
      const response = await fetch('/api/modules/incidents/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant),
      });
      const result = await response.json() as ApiSingleResponse<IncidentParticipant>;
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add participant');
      }
      await loadData();
    } catch (err) {
      console.error("ADD_PARTICIPANT_ERROR:", err);
    }
  };

  // Add evidence link to incident via API
  const handleAddEvidence = async (link: Omit<IncidentEvidence, 'id'>) => {
    try {
      const response = await fetch('/api/modules/incidents/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link),
      });
      const result = await response.json() as ApiSingleResponse<IncidentEvidence>;
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add evidence');
      }
      await loadData();
    } catch (err) {
      console.error("ADD_EVIDENCE_ERROR:", err);
    }
  };

  // Add statute link to incident via API
  const handleAddStatute = async (link: Omit<IncidentStatute, 'id'>) => {
    try {
      const response = await fetch('/api/modules/incidents/statutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link),
      });
      const result = await response.json() as ApiSingleResponse<IncidentStatute>;
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add statute');
      }
      await loadData();
    } catch (err) {
      console.error("ADD_STATUTE_ERROR:", err);
    }
  };

  // Add records request to incident via API
  const handleAddRequest = async (request: Omit<RecordsRequest, 'id'>) => {
    try {
      const response = await fetch('/api/modules/incidents/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const result = await response.json() as ApiSingleResponse<RecordsRequest>;
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add request');
      }
      await loadData();
    } catch (err) {
      console.error("ADD_REQUEST_ERROR:", err);
    }
  };

  // Render form fields based on schema (same as before)
  const renderCoreForm = () => {
    const schema = WTP_TABLE_SCHEMAS.incidents;
    return (
      <form onSubmit={handleSaveIncident} className="space-y-4">
        {schema.map((field: SchemaField) => {
          if (field.type === 'relation') {
            const options = (field.table === 'actors' ? actors :
              field.table === 'entities' ? entities :
                field.table === 'statutes' ? statuteList : []).map(o => ({
                  id: o.id,
                  label: (o as any).full_name || (o as any).name || (o as any).citation || `ID: ${o.id}`,
                  subtitle: (o as any).job_title || (o as any).sector_id || (o as any).jurisdiction
                }));
            const fieldValue = formData[field.name as keyof Incident] as number | null | undefined;
            const safeValue = fieldValue ?? null;
            return (
              <SearchableRelationSelect
                key={field.name}
                label={field.label}
                options={options}
                value={safeValue}
                onChange={(id) => setFormData(prev => ({ ...prev, [field.name]: id }))}
                placeholder={`-- Select ${field.label} --`}
                required={field.required}
              />
            );
          }
          if (field.type === 'select') {
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                  {field.label}
                </label>
                <select
                  value={formData[field.name as keyof Incident] as string || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                >
                  <option value="">-- Select --</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          }
          if (field.type === 'textarea') {
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                  {field.label}
                </label>
                <textarea
                  value={formData[field.name as keyof Incident] as string || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[80px]"
                />
              </div>
            );
          }
          if (field.name === 'title') {
            // ✅ SPECIAL HANDLING FOR TITLE: Auto-slug on change
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                  required
                />
                {formData.slug && !formData.id && (
                  <p className="text-[9px] text-slate-500 mt-1">
                    Auto-slug: <span className="text-[#4A90E2] font-mono">{formData.slug}</span>
                  </p>
                )}
              </div>
            );
          }
          if (field.name === 'slug') {
            // ✅ SLUG FIELD: Allow manual override but show auto-generated hint
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-[#4A90E2] font-mono"
                  required
                  placeholder="auto-generated-from-title"
                />
                <p className="text-[9px] text-slate-500 mt-1">
                  Must be unique. Use lowercase, hyphens, no spaces.
                </p>
              </div>
            );
          }
          if (field.type === 'date') {
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData[field.name as keyof Incident] as string || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                  required
                />
              </div>
            );
          }
          // ✅ FIX: Default: text input (RESTORED - not the incident list!)
          return (
            <div key={field.name} className="space-y-1">
              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData[field.name as keyof Incident] as string || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                required={field.required}
              />
            </div>
          );
        })}
        <button
          type="submit"
          className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-black font-black py-3 text-[10px] uppercase tracking-[0.3em] mt-4"
        >
          {formData.id ? 'UPDATE_INCIDENT' : 'CREATE_INCIDENT'}
        </button>
      </form>
    );
  };

  // Render participants management tab (join table UI)
  const renderParticipantsTab = () => {
    if (!selectedIncidentId) return <p className="text-slate-500 text-xs">Select an incident first</p>;
    const [mode, setMode] = useState<'select' | 'create'>('select');
    const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
    const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
    const [newActorData, setNewActorData] = useState({
      full_name: '',
      entity_id: '',
      job_title: '',
      slug: '',
      bio: ''
    });
    const [roleDescription, setRoleDescription] = useState('');
    const [forensicNote, setForensicNote] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);

    const handleAddParticipant = async () => {
      if (!roleDescription.trim()) {
        alert("Role description is required");
        return;
      }
      try {
        const payload: any = {
          incident_id: selectedIncidentId,
          role_description: roleDescription,
          forensic_note: forensicNote || undefined,
          is_primary: isPrimary ? 1 : 0
        };
        if (mode === 'select') {
          if (!selectedActorId && !selectedEntityId) {
            alert("Please select an actor or entity");
            return;
          }
          payload.actor_id = selectedActorId ?? null;
          payload.entity_id = selectedEntityId ?? null;
        } else {
          // Creating new actor inline
          if (!newActorData.full_name.trim() || !newActorData.slug.trim()) {
            alert("New actor requires name and slug");
            return;
          }
          payload.create_new_actor = true;
          payload.new_actor_data = {
            ...newActorData,
            entity_id: newActorData.entity_id ? Number(newActorData.entity_id) : null
          };
        }
        const res = await fetch('/api/modules/incidents/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json() as ApiSingleResponse<IncidentParticipant>;
        if (res.ok) {
          // Reset form
          setRoleDescription('');
          setForensicNote('');
          setIsPrimary(false);
          setSelectedActorId(null);
          setSelectedEntityId(null);
          setNewActorData({ full_name: '', entity_id: '', job_title: '', slug: '', bio: '' });
          // Refresh the participants list
          loadParticipantsForIncident(selectedIncidentId);
        } else {
          alert(result.error || "Failed to add participant");
        }
      } catch (err) {
        console.error("ADD_PARTICIPANT_ERROR:", err);
        alert("Error adding participant");
      }
    };

    // Load participants for this incident
    const loadParticipantsForIncident = async (incidentId: number) => {
      try {
        const res = await fetch(`/api/modules/incidents/participants?incident_id=${incidentId}`);
        const data = await res.json() as ApiListResponse<IncidentParticipant>;
        setParticipants(prev => ({ ...prev, [incidentId]: data.results || [] }));
      } catch (err) {
        console.error("LOAD_PARTICIPANTS_ERROR:", err);
      }
    };

    // Auto-generate slug for new actor
    const handleNewActorNameChange = (value: string) => {
      setNewActorData(prev => ({
        ...prev,
        full_name: value,
        slug: slugify(value)
      }));
    };

    return (
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-4 border-b border-slate-900 pb-4">
          <button
            onClick={() => setMode('select')}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${mode === 'select'
              ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
          >
            SELECT_EXISTING
          </button>
          <button
            onClick={() => setMode('create')}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${mode === 'create'
              ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
          >
            CREATE_NEW
          </button>
        </div>

        {/* Select Existing Mode */}
        {mode === 'select' && (
          <div className="space-y-4">
            <SearchableRelationSelect
              label="Select Actor (Optional)"
              options={actors.map(a => ({
                id: a.id,
                label: a.full_name,
                subtitle: a.job_title || a.entity_id?.toString()
              }))}
              value={selectedActorId}
              onChange={setSelectedActorId}
              placeholder="-- Search actors --"
            />
            <SearchableRelationSelect
              label="Select Entity (Optional)"
              options={entities.map(e => ({
                id: e.id,
                label: e.name,
                subtitle: e.sector_id?.toString()
              }))}
              value={selectedEntityId}
              onChange={setSelectedEntityId}
              placeholder="-- Search entities --"
            />
            <p className="text-[9px] text-slate-500 italic">
              Select at least one: an Actor, an Entity, or both.
            </p>
          </div>
        )}

        {/* Create New Actor Mode */}
        {mode === 'create' && (
          <div className="space-y-4 border border-slate-800 p-4 bg-slate-950/30">
            <h4 className="text-[10px] text-[#4A90E2] uppercase font-bold mb-4">New Actor Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newActorData.full_name}
                  onChange={(e) => handleNewActorNameChange(e.target.value)}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                  placeholder="e.g. Sarah Jelsomeno"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newActorData.slug}
                  onChange={(e) => setNewActorData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-[#4A90E2] font-mono"
                  placeholder="auto-generated"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Affiliated Entity
                </label>
                <select
                  value={newActorData.entity_id}
                  onChange={(e) => setNewActorData(prev => ({ ...prev, entity_id: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                >
                  <option value="">-- Select Entity --</option>
                  {entities.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={newActorData.job_title}
                  onChange={(e) => setNewActorData(prev => ({ ...prev, job_title: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                  placeholder="e.g. APS Case Worker"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                Biography (Optional)
              </label>
              <textarea
                value={newActorData.bio}
                onChange={(e) => setNewActorData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[60px]"
                placeholder="Brief background on this actor..."
              />
            </div>
          </div>
        )}

        {/* Common Fields for Both Modes */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
              Role in This Incident <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
              placeholder="e.g. 'Denied FOIA fee waiver', 'Closed APS case', 'Falsified medical record'"
            />
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
              Forensic Note (Optional)
            </label>
            <textarea
              value={forensicNote}
              onChange={(e) => setForensicNote(e.target.value)}
              className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[60px]"
              placeholder="Why is this person significant? e.g. '24h after PD was put on notice of vulnerable adult status'"
            />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
            <span className="text-slate-400">Mark as Primary Participant</span>
          </label>
        </div>

        <button
          onClick={handleAddParticipant}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-3 text-[10px] uppercase tracking-[0.3em] mt-4"
        >
          ADD_PARTICIPANT
        </button>

        {/* List Existing Participants for this Incident */}
        <div className="pt-6 border-t border-slate-900">
          <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-4">Current Participants</h4>
          {participants[selectedIncidentId]?.map((p: any) => (
            <div key={p.id} className="border border-slate-800 p-3 bg-black mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-white font-bold">
                    {p.actor_name || p.entity_name || 'Unknown'}
                  </p>
                  <p className="text-[9px] text-slate-400">{p.role_description}</p>
                  {p.forensic_note && (
                    <p className="text-[9px] text-slate-600 italic mt-1">{p.forensic_note}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {p.is_primary === 1 && (
                    <span className="text-[8px] text-[#4A90E2] uppercase font-bold border border-[#4A90E2]/30 px-2 py-0.5">
                      PRIMARY
                    </span>
                  )}
                  <button
                    onClick={async () => {
                      if (confirm("Remove this participant link?")) {
                        const res = await fetch(`/api/modules/incidents/participants?id=${p.id}`, {
                          method: 'DELETE',
                        });
                        if (res.ok) {
                          loadParticipantsForIncident(selectedIncidentId);
                        }
                      }
                    }}
                    className="text-[8px] text-red-500 hover:text-red-400 uppercase font-bold"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render evidence management tab (join table UI with rebuttal support)
  const renderEvidenceTab = () => {
    if (!selectedIncidentId) return <p className="text-slate-500 text-xs">Select an incident first</p>;
    const [mode, setMode] = useState<'select' | 'create'>('select');
    const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null);
    const [newEvidenceData, setNewEvidenceData] = useState({
      title: '',
      description: '',
      category: '',
      file_url: '',
      file_type: '',
      is_critical: false
    });
    const [isRebuttal, setIsRebuttal] = useState(false);
    const [rebuttalTargetActorId, setRebuttalTargetActorId] = useState<number | null>(null);
    const [rebuttalText, setRebuttalText] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);

    const handleLinkEvidence = async () => {
      if (mode === 'select' && !selectedEvidenceId) {
        alert("Please select an evidence record");
        return;
      }
      if (mode === 'create' && (!newEvidenceData.title || !newEvidenceData.file_url)) {
        alert("New evidence requires title and file URL");
        return;
      }
      if (isRebuttal && (!rebuttalTargetActorId || !rebuttalText.trim())) {
        alert("Rebuttal requires target actor and explanation");
        return;
      }
      try {
        const payload: any = {
          incident_id: selectedIncidentId,
          is_rebuttal: isRebuttal ? 1 : 0,
          rebuttal_target_actor_id: rebuttalTargetActorId ?? null,
          rebuttal_text: rebuttalText || undefined,
          display_order: displayOrder
        };
        if (mode === 'select') {
          payload.evidence_id = selectedEvidenceId;
        } else {
          // Creating new evidence inline
          payload.create_new_evidence = true;
          payload.new_evidence_data = {
            ...newEvidenceData,
            is_critical: newEvidenceData.is_critical ? 1 : 0
          };
        }
        const res = await fetch('/api/modules/incidents/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json() as ApiSingleResponse<IncidentEvidence>;
        if (res.ok) {
          // Reset form
          setSelectedEvidenceId(null);
          setNewEvidenceData({ title: '', description: '', category: '', file_url: '', file_type: '', is_critical: false });
          setIsRebuttal(false);
          setRebuttalTargetActorId(null);
          setRebuttalText('');
          setDisplayOrder(0);
          // Refresh the evidence list
          loadEvidenceForIncident(selectedIncidentId);
        } else {
          alert(result.error || "Failed to link evidence");
        }
      } catch (err) {
        console.error("LINK_EVIDENCE_ERROR:", err);
        alert("Error linking evidence");
      }
    };

    // Load evidence links for this incident
    const loadEvidenceForIncident = async (incidentId: number) => {
      try {
        const res = await fetch(`/api/modules/incidents/evidence?incident_id=${incidentId}`);
        const data = await res.json() as ApiListResponse<IncidentEvidence>;
        setEvidence(prev => ({ ...prev, [incidentId]: data.results || [] }));
      } catch (err) {
        console.error("LOAD_EVIDENCE_ERROR:", err);
      }
    };

    return (
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-4 border-b border-slate-900 pb-4">
          <button
            onClick={() => setMode('select')}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${mode === 'select'
              ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
          >
            SELECT_EXISTING
          </button>
          <button
            onClick={() => setMode('create')}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${mode === 'create'
              ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
          >
            UPLOAD_NEW
          </button>
        </div>

        {/* Select Existing Mode */}
        {mode === 'select' && (
          <div className="space-y-4">
            <SearchableRelationSelect
              label="Select Evidence Record"
              options={evidenceList.map(e => ({
                id: e.id,
                label: e.title,
                subtitle: e.category
              }))}
              value={selectedEvidenceId}
              onChange={setSelectedEvidenceId}
              placeholder="-- Search evidence --"
              required
            />
          </div>
        )}

        {/* Create New Evidence Mode */}
        {mode === 'create' && (
          <div className="space-y-4 border border-slate-800 p-4 bg-slate-950/30">
            <h4 className="text-[10px] text-[#4A90E2] uppercase font-bold mb-4">New Evidence Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Evidence Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEvidenceData.title}
                  onChange={(e) => setNewEvidenceData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                  placeholder="e.g. U of M BiPAP Certification"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Category
                </label>
                <select
                  value={newEvidenceData.category}
                  onChange={(e) => setNewEvidenceData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                >
                  <option value="">-- Select Category --</option>
                  <option value="FOIA">FOIA Request</option>
                  <option value="Medical">Medical Record</option>
                  <option value="Email">Email Correspondence</option>
                  <option value="Video">Video/Audio</option>
                  <option value="Document">Official Document</option>
                  <option value="Photo">Photograph</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                File URL / R2 Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newEvidenceData.file_url}
                onChange={(e) => setNewEvidenceData(prev => ({ ...prev, file_url: e.target.value }))}
                className="w-full bg-black border border-slate-800 p-2 text-xs text-[#4A90E2] font-mono"
                placeholder="https://... or r2://..."
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newEvidenceData.description}
                onChange={(e) => setNewEvidenceData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[60px]"
                placeholder="Brief description of this evidence..."
              />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={newEvidenceData.is_critical}
                onChange={(e) => setNewEvidenceData(prev => ({ ...prev, is_critical: e.target.checked }))}
              />
              <span className="text-slate-400">Mark as Critical Evidence</span>
            </label>
          </div>
        )}

        {/* Rebuttal Options (for both modes) */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isRebuttal}
              onChange={(e) => setIsRebuttal(e.target.checked)}
            />
            <span className="text-slate-400">This evidence refutes a claim made in this incident</span>
          </label>
          {isRebuttal && (
            <div className="space-y-4 pl-4 border-l-2 border-emerald-900/30">
              <SearchableRelationSelect
                label="Target Actor (Who made the false claim)"
                options={actors.map(a => ({ id: a.id, label: a.full_name }))}
                value={rebuttalTargetActorId}
                onChange={setRebuttalTargetActorId}
                placeholder="-- Select Actor --"
                required
              />
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Rebuttal Explanation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rebuttalText}
                  onChange={(e) => setRebuttalText(e.target.value)}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[60px]"
                  placeholder="e.g. 'U of M records prove clinical diagnosis, not self-diagnosis as claimed by Regina Harris'"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
              Display Order (for sequencing evidence)
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
              placeholder="0 = first, 1 = second, etc."
            />
          </div>
        </div>

        <button
          onClick={handleLinkEvidence}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-3 text-[10px] uppercase tracking-[0.3em] mt-4"
        >
          LINK_EVIDENCE
        </button>

        {/* List Linked Evidence for this Incident */}
        <div className="pt-6 border-t border-slate-900">
          <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-4">Linked Evidence</h4>
          {evidence[selectedIncidentId]?.map((link: any) => {
            const ev = evidenceList.find(e => e.id === link.evidence_id);
            return (
              <div key={link.id} className="border border-slate-800 p-3 bg-black mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white font-bold">{ev?.title || `Evidence #${link.evidence_id}`}</p>
                    {ev?.category && <p className="text-[9px] text-slate-400">{ev.category}</p>}
                    {link.is_rebuttal === 1 && (
                      <p className="text-[9px] text-emerald-500 mt-1">
                        ⚖️ Rebuttal: {link.rebuttal_text || 'No explanation provided'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {link.is_rebuttal === 1 && (
                      <span className="text-[8px] text-emerald-500 uppercase font-bold border border-emerald-900/30 px-2 py-0.5">
                        REBUTTAL
                      </span>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm("Remove this evidence link?")) {
                          const res = await fetch(`/api/modules/incidents/evidence?id=${link.id}`, {
                            method: 'DELETE',
                          });
                          if (res.ok) {
                            loadEvidenceForIncident(selectedIncidentId);
                          }
                        }
                      }}
                      className="text-[8px] text-red-500 hover:text-red-400 uppercase font-bold"
                    >
                      UNLINK
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render statutes management tab (join table UI) - FIXED jurisdiction type error
  const renderStatutesTab = () => {
    if (!selectedIncidentId) return <p className="text-slate-500 text-xs">Select an incident first</p>;
    const [mode, setMode] = useState<'select' | 'create'>('select');
    const [selectedStatuteId, setSelectedStatuteId] = useState<number | null>(null);
    // ✅ FIX: Use proper type for jurisdiction field
    const [newStatuteData, setNewStatuteData] = useState({
      citation: '',
      title: '',
      slug: '',
      summary: '',
      legal_text: '',
      jurisdiction: 'State' as 'Federal' | 'State' | 'Local',
      jurisdiction_body: '',
      status: 'active' as 'active' | 'repealed' | 'amended',
      effective_date: '',
      official_url: '',
      seo_description: '',
      seo_keywords: ''
    });
    const [violationContext, setViolationContext] = useState('');

    const handleLinkStatute = async () => {
      if (mode === 'select' && !selectedStatuteId) {
        alert("Please select a statute");
        return;
      }
      if (mode === 'create' && (!newStatuteData.citation || !newStatuteData.title || !newStatuteData.slug)) {
        alert("New statute requires citation, title, and slug");
        return;
      }
      if (!violationContext.trim()) {
        alert("Violation context is required");
        return;
      }
      try {
        const payload: any = {
          incident_id: selectedIncidentId,
          violation_context: violationContext
        };
        if (mode === 'select') {
          payload.statute_id = selectedStatuteId;
        } else {
          // Creating new statute inline
          payload.create_new_statute = true;
          payload.new_statute_data = {
            ...newStatuteData,
            jurisdiction: newStatuteData.jurisdiction,
            status: newStatuteData.status
          };
        }
        const res = await fetch('/api/modules/incidents/statutes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json() as ApiSingleResponse<IncidentStatute>;
        if (res.ok) {
          // Reset form
          setSelectedStatuteId(null);
          setNewStatuteData({
            citation: '', title: '', slug: '', summary: '', legal_text: '',
            jurisdiction: 'State', jurisdiction_body: '', status: 'active',
            effective_date: '', official_url: '', seo_description: '', seo_keywords: ''
          });
          setViolationContext('');
          // Refresh the statutes list
          loadStatutesForIncident(selectedIncidentId);
        } else {
          alert(result.error || "Failed to link statute");
        }
      } catch (err) {
        console.error("LINK_STATUTE_ERROR:", err);
        alert("Error linking statute");
      }
    };

    // Load statute links for this incident
    const loadStatutesForIncident = async (incidentId: number) => {
      try {
        const res = await fetch(`/api/modules/incidents/statutes?incident_id=${incidentId}`);
        const data = await res.json() as ApiListResponse<IncidentStatute>;
        setStatutes(prev => ({ ...prev, [incidentId]: data.results || [] }));
      } catch (err) {
        console.error("LOAD_STATUTES_ERROR:", err);
      }
    };

    // Auto-generate slug for new statute
    const handleStatuteTitleChange = (value: string) => {
      setNewStatuteData(prev => ({
        ...prev,
        title: value,
        slug: slugify(value)
      }));
    };

    return (
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-4 border-b border-slate-900 pb-4">
          <button
            onClick={() => setMode('select')}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${mode === 'select'
              ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
          >
            SELECT_EXISTING
          </button>
          <button
            onClick={() => setMode('create')}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${mode === 'create'
              ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
          >
            CREATE_NEW
          </button>
        </div>

        {/* Select Existing Mode */}
        {mode === 'select' && (
          <div className="space-y-4">
            <SearchableRelationSelect
              label="Select Statute"
              options={statuteList.map(s => ({
                id: s.id,
                label: s.title,
                subtitle: s.citation
              }))}
              value={selectedStatuteId}
              onChange={setSelectedStatuteId}
              placeholder="-- Search statutes --"
              required
            />
          </div>
        )}

        {/* Create New Statute Mode */}
        {mode === 'create' && (
          <div className="space-y-4 border border-slate-800 p-4 bg-slate-950/30">
            <h4 className="text-[10px] text-[#4A90E2] uppercase font-bold mb-4">New Statute Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Citation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStatuteData.citation}
                  onChange={(e) => setNewStatuteData(prev => ({ ...prev, citation: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                  placeholder="e.g. MCL 15.231"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStatuteData.title}
                  onChange={(e) => handleStatuteTitleChange(e.target.value)}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                  placeholder="e.g. Freedom of Information Act"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStatuteData.slug}
                  onChange={(e) => setNewStatuteData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-[#4A90E2] font-mono"
                  placeholder="auto-generated"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Jurisdiction
                </label>
                <select
                  value={newStatuteData.jurisdiction}
                  onChange={(e) => setNewStatuteData(prev => ({ ...prev, jurisdiction: e.target.value as 'Federal' | 'State' | 'Local' }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                >
                  <option value="Federal">Federal</option>
                  <option value="State">State</option>
                  <option value="Local">Local</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                Governing Body (Optional)
              </label>
              <input
                type="text"
                value={newStatuteData.jurisdiction_body}
                onChange={(e) => setNewStatuteData(prev => ({ ...prev, jurisdiction_body: e.target.value }))}
                className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                placeholder="e.g. Michigan Legislature"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                Executive Summary (Optional)
              </label>
              <textarea
                value={newStatuteData.summary}
                onChange={(e) => setNewStatuteData(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[60px]"
                placeholder="Brief overview of this statute..."
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                Full Legal Text (Optional)
              </label>
              <textarea
                value={newStatuteData.legal_text}
                onChange={(e) => setNewStatuteData(prev => ({ ...prev, legal_text: e.target.value }))}
                className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[120px] font-mono text-[10px]"
                placeholder="Paste the full statutory text here..."
              />
            </div>
          </div>
        )}

        {/* Violation Context (Required for both modes) */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
              How Was This Statute Violated? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={violationContext}
              onChange={(e) => setViolationContext(e.target.value)}
              className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[80px]"
              placeholder="e.g. 'FOIA fee waiver denied to indigent vulnerable adult despite MCL 15.234(2)(a) mandate'"
            />
          </div>
        </div>

        <button
          onClick={handleLinkStatute}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-3 text-[10px] uppercase tracking-[0.3em] mt-4"
        >
          LINK_STATUTE
        </button>

        {/* List Linked Statutes for this Incident */}
        <div className="pt-6 border-t border-slate-900">
          <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-4">Linked Statutes</h4>
          {statutes[selectedIncidentId]?.map((link: any) => {
            const st = statuteList.find(s => s.id === link.statute_id);
            return (
              <div key={link.id} className="border border-slate-800 p-3 bg-black mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white font-bold">
                      {st?.citation || `Statute #${link.statute_id}`}
                    </p>
                    {st?.title && <p className="text-[9px] text-slate-400">{st.title}</p>}
                    <p className="text-[9px] text-slate-600 italic mt-1">{link.violation_context}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (confirm("Remove this statute link?")) {
                          const res = await fetch(`/api/modules/incidents/statutes?id=${link.id}`, {
                            method: 'DELETE',
                          });
                          if (res.ok) {
                            loadStatutesForIncident(selectedIncidentId);
                          }
                        }
                      }}
                      className="text-[8px] text-red-500 hover:text-red-400 uppercase font-bold"
                    >
                      UNLINK
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render records requests tab - NEW: Dual-mode selector
  const renderRequestsTab = () => {
    if (!selectedIncidentId) return <p className="text-slate-500 text-xs">Select an incident first</p>;
    const [mode, setMode] = useState<'select' | 'create'>('select');
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [newRequestData, setNewRequestData] = useState({
      actor_id: '',
      entity_id: '',
      request_type: 'FOIA' as RecordsRequest['request_type'],
      request_date: '',
      compliance_deadline: '',
      status: 'pending' as RecordsRequest['status'],
      fee_quoted: '',
      fee_waiver_requested: false,
      days_overdue: '',
      description: ''
    });

    const handleAddRequest = async () => {
      if (mode === 'select' && !selectedRequestId) {
        alert("Please select a records request");
        return;
      }
      if (mode === 'create' && (!newRequestData.request_type || !newRequestData.request_date)) {
        alert("New request requires type and date");
        return;
      }
      try {
        const payload: any = {
          incident_id: selectedIncidentId
        };
        if (mode === 'select') {
          payload.request_id = selectedRequestId;
        } else {
          // Creating new request inline
          payload.create_new_request = true;
          payload.new_request_data = {
            ...newRequestData,
            actor_id: newRequestData.actor_id ? Number(newRequestData.actor_id) : null,
            entity_id: newRequestData.entity_id ? Number(newRequestData.entity_id) : null,
            fee_quoted: newRequestData.fee_quoted ? Number(newRequestData.fee_quoted) : null,
            days_overdue: newRequestData.days_overdue ? Number(newRequestData.days_overdue) : null,
            fee_waiver_requested: newRequestData.fee_waiver_requested ? 1 : 0
          };
        }
        const res = await fetch('/api/modules/incidents/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json() as ApiSingleResponse<RecordsRequest>;
        if (res.ok) {
          // Reset form
          setSelectedRequestId(null);
          setNewRequestData({
            actor_id: '', entity_id: '', request_type: 'FOIA', request_date: '',
            compliance_deadline: '', status: 'pending', fee_quoted: '',
            fee_waiver_requested: false, days_overdue: '', description: ''
          });
          // Refresh the requests list
          loadRequestsForIncident(selectedIncidentId);
        } else {
          alert(result.error || "Failed to add request");
        }
      } catch (err) {
        console.error("ADD_REQUEST_ERROR:", err);
        alert("Error adding request");
      }
    };

    // Load requests for this incident
    const loadRequestsForIncident = async (incidentId: number) => {
      try {
        const res = await fetch(`/api/modules/incidents/requests?incident_id=${incidentId}`);
        const data = await res.json() as ApiListResponse<RecordsRequest>;
        setRequests(prev => ({ ...prev, [incidentId]: data.results || [] }));
      } catch (err) {
        console.error("LOAD_REQUESTS_ERROR:", err);
      }
    };

    return (
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-4 border-b border-slate-900 pb-4">
          <button
            onClick={() => setMode('select')}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${mode === 'select'
              ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
          >
            SELECT_EXISTING
          </button>
          <button
            onClick={() => setMode('create')}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all ${mode === 'create'
              ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
          >
            CREATE_NEW
          </button>
        </div>

        {/* Select Existing Mode */}
        {mode === 'select' && (
          <div className="space-y-4">
            <SearchableRelationSelect
              label="Select Records Request"
              options={evidenceList // Reusing evidenceList as placeholder - replace with actual requests list
                .map(e => ({ id: e.id, label: e.title, subtitle: e.category }))}
              value={selectedRequestId}
              onChange={setSelectedRequestId}
              placeholder="-- Search requests --"
            />
            <p className="text-[9px] text-slate-500 italic">
              Note: Full request management coming soon. For now, select from available evidence.
            </p>
          </div>
        )}

        {/* Create New Request Mode */}
        {mode === 'create' && (
          <div className="space-y-4 border border-slate-800 p-4 bg-slate-950/30">
            <h4 className="text-[10px] text-[#4A90E2] uppercase font-bold mb-4">New Records Request Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Requestor (Optional)
                </label>
                <SearchableRelationSelect
                  label=""
                  options={actors.map(a => ({ id: a.id, label: a.full_name }))}
                  value={newRequestData.actor_id ? Number(newRequestData.actor_id) : null}
                  onChange={(id) => setNewRequestData(prev => ({ ...prev, actor_id: id?.toString() || '' }))}
                  placeholder="-- Select Actor --"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Target Entity (Optional)
                </label>
                <SearchableRelationSelect
                  label=""
                  options={entities.map(e => ({ id: e.id, label: e.name }))}
                  value={newRequestData.entity_id ? Number(newRequestData.entity_id) : null}
                  onChange={(id) => setNewRequestData(prev => ({ ...prev, entity_id: id?.toString() || '' }))}
                  placeholder="-- Select Entity --"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Request Type
                </label>
                <select
                  value={newRequestData.request_type}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, request_type: e.target.value as RecordsRequest['request_type'] }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                >
                  <option value="FOIA">FOIA</option>
                  <option value="HIPAA">HIPAA</option>
                  <option value="Medical Records">Medical Records</option>
                  <option value="Internal Memo">Internal Memo</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Status
                </label>
                <select
                  value={newRequestData.status}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, status: e.target.value as RecordsRequest['status'] }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="denied">Denied</option>
                  <option value="stonewalled">Stonewalled</option>
                  <option value="appealed">Appealed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Request Date
                </label>
                <input
                  type="date"
                  value={newRequestData.request_date}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, request_date: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Compliance Deadline
                </label>
                <input
                  type="date"
                  value={newRequestData.compliance_deadline}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, compliance_deadline: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                  Fee Quoted ($)
                </label>
                <input
                  type="number"
                  value={newRequestData.fee_quoted}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, fee_quoted: e.target.value }))}
                  className="w-full bg-black border border-slate-800 p-2 text-xs text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={newRequestData.fee_waiver_requested}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, fee_waiver_requested: e.target.checked }))}
                  className="w-4 h-4 accent-[#4A90E2]"
                />
                <label className="text-xs text-slate-400">Fee Waiver Requested</label>
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">
                Description
              </label>
              <textarea
                value={newRequestData.description}
                onChange={(e) => setNewRequestData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-black border border-slate-800 p-2 text-xs text-white min-h-[60px]"
                placeholder="Brief description of what records were requested..."
              />
            </div>
          </div>
        )}

        <button
          onClick={handleAddRequest}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-3 text-[10px] uppercase tracking-[0.3em] mt-4"
        >
          ADD_RECORDS_REQUEST
        </button>

        {/* List Linked Requests for this Incident */}
        <div className="pt-6 border-t border-slate-900">
          <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-4">Tracked Requests</h4>
          {requests[selectedIncidentId]?.map((req: any) => (
            <div key={req.id} className="border border-slate-800 p-3 bg-black mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-white font-bold">{req.request_type} Request</p>
                  <p className="text-[9px] text-slate-400 mt-1">{req.description || 'No description'}</p>
                  <p className="text-[9px] text-slate-600 mt-1">Status: {req.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (confirm("Remove this request link?")) {
                        const res = await fetch(`/api/modules/incidents/requests?id=${req.id}`, {
                          method: 'DELETE',
                        });
                        if (res.ok) {
                          loadRequestsForIncident(selectedIncidentId);
                        }
                      }
                    }}
                    className="text-[8px] text-red-500 hover:text-red-400 uppercase font-bold"
                  >
                    UNLINK
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* LEFT: Form Panel */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-slate-950/50 border border-slate-800 p-6">
          <div className="flex gap-2 mb-6 border-b border-slate-900 pb-4 overflow-x-auto">
            {['core', 'participants', 'evidence', 'statutes', 'requests'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border whitespace-nowrap transition-all ${activeTab === tab
                  ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10'
                  : 'border-slate-800 text-slate-600 hover:border-slate-600'
                  }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          {activeTab === 'core' && renderCoreForm()}
          {activeTab === 'participants' && renderParticipantsTab()}
          {activeTab === 'evidence' && renderEvidenceTab()}
          {activeTab === 'statutes' && renderStatutesTab()}
          {activeTab === 'requests' && renderRequestsTab()}
        </div>
      </div>

      {/* RIGHT: Incident List - NOW WITH DELETE BUTTON */}
      <div className="xl:col-span-7">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] text-emerald-500 uppercase font-bold tracking-[0.3em]">
            Incident_Registry ({incidents.length})
          </h2>
          <button
            onClick={loadData}
            className="text-[9px] text-slate-500 hover:text-[#4A90E2] uppercase"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-slate-700 text-xs animate-pulse">Loading incidents...</p>
        ) : (
          <div className="space-y-3">
            {incidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  setFormData(inc);
                  setActiveTab('core');
                }}
                className={`border border-slate-800 p-4 bg-slate-950/40 hover:border-[#4A90E2]/40 transition-all cursor-pointer ${selectedIncidentId === inc.id ? 'border-[#4A90E2] bg-[#4A90E2]/5' : ''
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm text-white font-bold uppercase tracking-tight">
                      {inc.title}
                    </h3>
                    <p className="text-[9px] text-slate-500 mt-1">
                      {inc.event_date} • {inc.status}
                    </p>
                    {inc.correlation_id && (
                      <p className="text-[9px] text-[#4A90E2] mt-1">
                        🔗 {inc.correlation_id}
                      </p>
                    )}
                  </div>
                  {/* ✅ UPDATED: text-right block with delete button */}
                  <div className="text-right">
                    <p className="text-[9px] text-slate-600">
                      👥 {(inc as any).participant_count || 0} •
                      📄 {(inc as any).evidence_count || 0} •
                      ⚖️ {(inc as any).statute_count || 0}
                    </p>
                    {/* NEW: Delete button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation(); // Prevent selecting the incident
                        if (confirm(`Delete incident "${inc.title}"? This cannot be undone.`)) {
                          try {
                            const res = await fetch(`/api/modules/incidents?id=${inc.id}`, {
                              method: 'DELETE',
                            });
                            if (res.ok) {
                              await loadData(); // Refresh the list
                            } else {
                              alert("Failed to delete incident");
                            }
                          } catch (err) {
                            console.error("DELETE_ERROR:", err);
                            alert("Error deleting incident");
                          }
                        }
                      }}
                      className="mt-2 text-[8px] text-red-500 hover:text-red-400 uppercase font-bold border border-red-900/30 px-2 py-0.5 hover:bg-red-900/10 transition-colors"
                    >
                      DELETE
                    </button>
                    {inc.is_critical === 1 && (
                      <span className="text-[8px] text-red-500 uppercase font-bold mt-1 block">
                        CRITICAL
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}