// File: src/app/admin/evidence/add-evidence/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Actor { id: number; full_name: string; }
interface Statute { id: number; citation: string; }
interface Entity { id: number; name: string; }

interface ActorResponse { results: Actor[]; }
interface StatuteResponse { results: Statute[]; }
interface EntityResponse { results: Entity[]; }

export default function AdminEvidencePage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [status, setStatus] = useState({ type: 'IDLE', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', actor_id: '', statute_id: '', entity_id: '', description: '', is_critical: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, sRes, eRes] = await Promise.all([
          fetch('/api/actors'),
          fetch('/api/statutes'),
          fetch('/api/entities')
        ]);
        
        if (aRes.ok) {
          const aData = (await aRes.json()) as ActorResponse;
          setActors(aData.results || []);
        }
        if (sRes.ok) {
          const sData = (await sRes.json()) as StatuteResponse;
          setStatutes(sData.results || []);
        }
        if (eRes.ok) {
          const eData = (await eRes.json()) as EntityResponse;
          setEntities(eData.results || []);
        }
      } catch (err) {
        console.error("DATA_FETCH_CRITICAL_FAILURE", err);
        setStatus({ type: 'ERROR', msg: 'Terminal Sync Failed' });
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus({ type: 'SYNCING', msg: 'Committing to D1...' });
    
    // Generate a quick URL slug from the title
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const payload = {
      title: formData.title,
      slug: slug,
      description: formData.description,
      actor_id: formData.actor_id || null,
      entity_id: formData.entity_id || null,
      statute_id: formData.statute_id || null,
      status: 'pending',
      is_critical: formData.is_critical ? 1 : 0,
      event_date: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus({ type: 'SUCCESS', msg: 'Incident Manifested' });
        setFormData({ title: '', description: '', actor_id: '', statute_id: '', entity_id: '', is_critical: false });
      } else {
        setStatus({ type: 'ERROR', msg: 'Submission Failed' });
      }
    } catch (err) {
      console.error("INCIDENT_POST_ERROR:", err);
      setStatus({ type: 'ERROR', msg: 'Network Error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto border border-slate-900 p-10 bg-slate-900/10">
            <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Incident_Logging_Terminal
                </h1>
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                Status: <span className={`${status.type === 'ERROR' ? 'text-red-500' : 'text-[#4A90E2]'} font-bold`}>{status.msg || status.type}</span>
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-widest">Primary Actor</label>
                  <select
                    className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2] transition-all"
                    value={formData.actor_id}
                    onChange={(e) => setFormData({...formData, actor_id: e.target.value})}
                  >
                    <option value="">Select Actor...</option>
                    {actors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-widest">Statute Reference</label>
                  <select
                    className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2] transition-all"
                    value={formData.statute_id}
                    onChange={(e) => setFormData({...formData, statute_id: e.target.value})}
                  >
                    <option value="">Select Statute...</option>
                    {statutes.map(s => <option key={s.id} value={s.id}>{s.citation}</option>)}
                  </select>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-widest">Associated Entity</label>
                  <select
                    className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2] transition-all"
                    value={formData.entity_id}
                    onChange={(e) => setFormData({...formData, entity_id: e.target.value})}
                  >
                    <option value="">Select Entity...</option>
                    {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-widest">Critical Flag</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_critical}
                      onChange={(e) => setFormData({...formData, is_critical: e.target.checked})}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-xs uppercase tracking-wider">Mark as Critical Incident</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Full-width description field */}
            <div className="mt-8">
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-widest">Incident Description</label>
              <textarea
                className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2] transition-all h-32"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            {/* Title field (moved to bottom for logical flow) */}
            <div className="mt-8">
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-widest">Incident Title</label>
              <input
                type="text"
                className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2] transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-10 w-full bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black uppercase text-sm tracking-[0.4em] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'PROCESSING...' : 'COMMIT_EVIDENCE_TO_MANIFEST'}
            </button>
          </form>
        </main>
      </div>
    </AdminGuard>
  );
}