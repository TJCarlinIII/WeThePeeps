"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { authenticateAdmin } from '../actions';

interface Actor { id: number; full_name: string; }
interface Statute { id: number; citation: string; }
interface Entity { id: number; name: string; }

export default function AdminEvidencePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [actors, setActors] = useState<Actor[]>([]);
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [status, setStatus] = useState({ type: 'IDLE', msg: '' });
  
  const [formData, setFormData] = useState({
    title: '', actor_id: '', statute_id: '', entity_id: '', description: '', is_critical: false
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      const [aRes, sRes, eRes] = await Promise.all([
        fetch('/api/actors'), fetch('/api/statutes'), fetch('/api/entities')
      ]);
      setActors(await aRes.json() || []);
      setStatutes(await sRes.json() || []);
      setEntities(await eRes.json() || []);
    };
    fetchData();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'SYNCING', msg: 'Committing to D1...' });
    
    // Map to incidents table schema
    const payload = {
      title: formData.title,
      description: formData.description,
      actor_id: formData.actor_id || null,
      entity_id: formData.entity_id || null,
      statute_id: formData.statute_id || null,
      status: 'pending',
      is_critical: formData.is_critical ? 1 : 0,
      event_date: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus({ type: 'SUCCESS', msg: 'Incident Manifested' });
        setFormData({ ...formData, title: '', description: '' });
      } else {
        setStatus({ type: 'ERROR', msg: 'Submission Failed' });
      }
    } catch (err) {
      console.error("INCIDENT_POST_ERROR:", err);
      setStatus({ type: 'ERROR', msg: 'Network Error' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4 text-white">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const result = await authenticateAdmin(passphrase);
          if (result.success) setIsAuthenticated(true);
        }} className="border border-[#4A90E2]/50 p-8 rounded bg-slate-900/20 w-full max-w-sm">
          <h2 className="text-[#4A90E2] mb-6 text-center text-xs font-bold uppercase tracking-widest">Auth_Required</h2>
          <input type="password" placeholder="Passphrase" className="w-full bg-black border border-slate-700 p-3 text-white mb-4 outline-none focus:border-[#4A90E2]" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
          <button className="w-full bg-[#4A90E2] text-black py-3 font-bold uppercase text-xs">Unlock Terminal</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono relative">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto border border-slate-900 p-10 bg-slate-900/10">
        <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Incident_Logging_Terminal</h1>
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase">
            Status: <span className="text-[#4A90E2] font-bold">{status.msg || status.type}</span>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Primary Actor</label>
              <select className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2]" value={formData.actor_id} onChange={(e) => setFormData({...formData, actor_id: e.target.value})}>
                <option value="">Select Actor...</option>
                {actors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Statute Reference</label>
              <select className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2]" value={formData.statute_id} onChange={(e) => setFormData({...formData, statute_id: e.target.value})}>
                <option value="">Select Statute...</option>
                {statutes.map(s => <option key={s.id} value={s.id}>{s.citation}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Associated Entity</label>
              <select className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2]" value={formData.entity_id} onChange={(e) => setFormData({...formData, entity_id: e.target.value})}>
                <option value="">Select Entity...</option>
                {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Incident Heading</label>
              <input type="text" className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-[#4A90E2]" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required/>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Incident Narrative</label>
          <textarea rows={8} className="w-full bg-black border border-slate-800 p-4 text-sm font-sans text-slate-300 outline-none focus:border-[#4A90E2]" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
        </div>
        <div className="mt-8 flex items-center gap-6 border-t border-slate-900 pt-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="hidden" checked={formData.is_critical} onChange={(e) => setFormData({...formData, is_critical: e.target.checked})} />
            <div className={`w-4 h-4 border ${formData.is_critical ? 'bg-red-600 border-red-600' : 'border-slate-700'}`} />
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Flag_Critical</span>
          </label>
          <button type="submit" className="flex-1 bg-[#4A90E2] hover:bg-white transition-all text-black py-4 font-black uppercase text-xs tracking-widest">Commit_To_Database</button>
        </div>
      </form>
    </div>
  );
}