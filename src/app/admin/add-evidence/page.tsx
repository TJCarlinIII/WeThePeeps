"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from 'react';
import { authenticateAdmin } from '../actions';

interface Actor { id: number; name: string; sector: string; }
interface Statute { id: number; code: string; }
interface Entity { id: number; name: string; sector: string; }
interface Sector { id: number; name: string; }
interface ApiResponse<T> { results?: T[]; error?: string; }

export default function AdminEvidencePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [actors, setActors] = useState<Actor[]>([]);
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [activeModal, setActiveModal] = useState<'actor' | 'statute' | 'entity' | 'sector' | null>(null);
  const [quickInput, setQuickInput] = useState({ name: '', extra: '' });
  const [status, setStatus] = useState({ type: 'IDLE', msg: '' });
  const [formData, setFormData] = useState({
    title: '', official: '', statute: '', entity: '', sector: '', content: '',
    isCritical: false, fileUrl: '', category: 'Legal'
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchData = async () => {
      try {
        const [aRes, sRes, eRes, secRes] = await Promise.all([
          fetch('/api/actors'), fetch('/api/statutes'),
          fetch('/api/entities'), fetch('/api/sectors')
        ]);
        const aData = (await aRes.json()) as ApiResponse<Actor>;
        const sData = (await sRes.json()) as ApiResponse<Statute>;
        const eData = (await eRes.json()) as ApiResponse<Entity>;
        const secData = (await secRes.json()) as ApiResponse<Sector>;
        setActors(aData.results || []);
        setStatutes(sData.results || []);
        setEntities(eData.results || []);
        setSectors(secData.results || []);
      } catch (error) {
        console.error("Data sync failed:", error);
        setStatus({ type: 'ERROR', msg: 'Sync Failed' });
      }
    };
    
    fetchData();
  }, [isAuthenticated]);

  const handleManualRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [aRes, sRes, eRes, secRes] = await Promise.all([
        fetch('/api/actors'), fetch('/api/statutes'),
        fetch('/api/entities'), fetch('/api/sectors')
      ]);
      const aData = (await aRes.json()) as ApiResponse<Actor>;
      const sData = (await sRes.json()) as ApiResponse<Statute>;
      const eData = (await eRes.json()) as ApiResponse<Entity>;
      const secData = (await secRes.json()) as ApiResponse<Sector>;
      setActors(aData.results || []);
      setStatutes(sData.results || []);
      setEntities(eData.results || []);
      setSectors(secData.results || []);
    } catch (error) {
      console.error("Data sync failed:", error);
      setStatus({ type: 'ERROR', msg: 'Sync Failed' });
    }
  }, [isAuthenticated]);

  const handleQuickAdd = async () => {
    let endpoint = '';
    let body = {};
    if (activeModal === 'entity') {
      endpoint = '/api/entities';
      body = { name: quickInput.name, sector: quickInput.extra };
    } else if (activeModal === 'sector') {
      endpoint = '/api/sectors';
      body = { name: quickInput.name };
    }
    const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
    if (res.ok) {
      await handleManualRefresh();
      setActiveModal(null);
      setQuickInput({ name: '', extra: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'SYNCING', msg: 'Committing to D1...' });
    try {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus({ type: 'SUCCESS', msg: 'Record Manifested' });
        setFormData({ ...formData, title: '', content: '', fileUrl: '' });
      } else {
        setStatus({ type: 'ERROR', msg: 'Submission Failed' });
      }
    } catch (err) {
      console.error("Form submission error:", err);
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
          <input
            type="password"
            placeholder="Passphrase"
            className="w-full bg-black border border-slate-700 p-3 text-white mb-4 outline-none focus:border-[#4A90E2]"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
          <button className="w-full bg-[#4A90E2] text-black py-3 font-bold uppercase text-xs">Unlock Terminal</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono relative">
      {activeModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-[#4A90E2] p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-[#4A90E2] mb-4 text-xs font-bold uppercase tracking-widest italic">Add_New_{activeModal}</h3>
            <input
              autoFocus
              className="w-full bg-black border border-slate-700 p-2 mb-4 outline-none focus:border-[#4A90E2] text-sm text-white"
              placeholder="Value"
              value={quickInput.name}
              onChange={(e) => setQuickInput({...quickInput, name: e.target.value})}
            />
            {activeModal === 'entity' && (
              <select
                className="w-full bg-black border border-slate-700 p-2 mb-4 text-sm text-white outline-none"
                value={quickInput.extra}
                onChange={(e) => setQuickInput({...quickInput, extra: e.target.value})}
              >
                <option value="">Select Sector...</option>
                {sectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={handleQuickAdd} className="flex-1 bg-[#4A90E2] text-black py-2 text-[10px] font-black uppercase">Initialize</button>
              <button onClick={() => setActiveModal(null)} className="flex-1 border border-slate-800 py-2 text-[10px] font-black uppercase text-slate-500">Abort</button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto border border-slate-900 p-10 bg-slate-900/10">
        <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Data_Entry_Portal</h1>
            <p className="text-[9px] text-[#4A90E2] font-bold uppercase mt-2 tracking-[0.4em]">We The Peeps // Operations</p>
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase">
            Status: <span className="text-[#4A90E2] font-bold">{status.type}</span>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-[0.2em]">Primary Actor</label>
              <select
                className="w-full bg-black border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none text-white"
                value={formData.official}
                onChange={(e) => e.target.value === "NEW" ? setActiveModal('actor') : setFormData({...formData, official: e.target.value})}
              >
                <option value="">Select Actor...</option>
                <option value="NEW" className="text-[#4A90E2] font-bold">+ REGISTER NEW ACTOR</option>
                {actors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-[0.2em]">Statute Reference</label>
              <select
                className="w-full bg-black border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none text-white"
                value={formData.statute}
                onChange={(e) => e.target.value === "NEW" ? setActiveModal('statute') : setFormData({...formData, statute: e.target.value})}
              >
                <option value="">Select Statute...</option>
                <option value="NEW" className="text-[#4A90E2] font-bold">+ REGISTER NEW STATUTE</option>
                {statutes.map(s => <option key={s.id} value={s.code}>{s.code}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-[0.2em]">Operating Sector</label>
              <select
                className="w-full bg-black border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none text-white"
                value={formData.sector}
                onChange={(e) => e.target.value === "NEW" ? setActiveModal('sector') : setFormData({...formData, sector: e.target.value})}
              >
                <option value="">Select Sector...</option>
                <option value="NEW" className="text-[#4A90E2] font-bold">+ ADD NEW SECTOR</option>
                {sectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-[0.2em]">Associated Entity</label>
              <select
                className="w-full bg-black border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none text-white"
                value={formData.entity}
                onChange={(e) => e.target.value === "NEW" ? setActiveModal('entity') : setFormData({...formData, entity: e.target.value})}
              >
                <option value="">Select Entity...</option>
                <option value="NEW" className="text-[#4A90E2] font-bold">+ REGISTER NEW ENTITY</option>
                {entities.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-[0.2em]">Evidence Heading</label>
              <input
                type="text"
                className="w-full bg-black border border-slate-800 p-3 text-sm outline-none focus:border-[#4A90E2] text-white"
                placeholder="Brief Summary"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-[0.2em]">Media Path</label>
              <input
                type="text"
                className="w-full bg-black border border-slate-800 p-3 text-sm outline-none focus:border-[#4A90E2] text-white"
                placeholder="/media/report.pdf"
                value={formData.fileUrl}
                onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
              />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-[0.2em]">Evidence Manifest</label>
          <textarea
            rows={8}
            className="w-full bg-black border border-slate-800 p-4 text-sm outline-none focus:border-[#4A90E2] font-sans text-slate-300"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </div>
        <div className="mt-8 flex items-center gap-6 border-t border-slate-900 pt-8">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="hidden"
              checked={formData.isCritical}
              onChange={(e) => setFormData({...formData, isCritical: e.target.checked})}
            />
            <div className={`w-4 h-4 border ${formData.isCritical ? 'bg-red-600 border-red-600' : 'border-slate-700'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${formData.isCritical ? 'text-red-500' : 'text-slate-600'}`}>Flag_Critical</span>
          </label>
          <button
            type="submit"
            className="flex-1 bg-[#4A90E2] text-black py-4 font-black uppercase text-xs tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_20px_rgba(74,144,226,0.3)]"
          >
            Commit_To_Database
          </button>
        </div>
      </form>
    </div>
  );
}