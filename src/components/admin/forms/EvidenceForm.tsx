"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard'; // Use your guard!

interface Actor { id: number; full_name: string; }
interface Statute { id: number; citation: string; }
interface Entity { id: number; name: string; }

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
          fetch('/api/actors'), fetch('/api/statutes'), fetch('/api/entities')
        ]);

        // Guard against non-OK responses
        if (aRes.ok) setActors(await aRes.json() || []);
        if (sRes.ok) setStatutes(await sRes.json() || []);
        if (eRes.ok) setEntities(await eRes.json() || []);
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
    
    const payload = {
      ...formData,
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
        setFormData({ title: '', description: '', actor_id: '', statute_id: '', entity_id: '', is_critical: false });
      } else {
        setStatus({ type: 'ERROR', msg: 'D1_REJECTION_ERROR' });
      }
    } catch (err) {
      setStatus({ type: 'ERROR', msg: 'Network_Link_Severed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white p-8 font-mono relative">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto border border-slate-900 p-10 bg-slate-900/10">
          <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Incident_Logging_Terminal</h1>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Status: <span className={`${status.type === 'ERROR' ? 'text-red-500' : 'text-[#4A90E2]'} font-bold`}>{status.msg || status.type}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* ... (Rest of your form inputs remain the same) ... */}
          </div>

          <div className="mt-8 flex items-center gap-6 border-t border-slate-900 pt-8">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`flex-1 ${isSubmitting ? 'bg-slate-800 text-slate-500' : 'bg-[#4A90E2] hover:bg-white text-black'} py-4 font-black uppercase text-xs tracking-widest transition-all`}
            >
              {isSubmitting ? 'UPLOADING_ENCRYPTED_PACKET...' : 'Commit_To_Database'}
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}