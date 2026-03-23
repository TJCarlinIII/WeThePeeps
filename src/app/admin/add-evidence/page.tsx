"use client";

import React, { useState } from 'react';
import { authenticateAdmin } from '../actions';

// Define the shape of the form and the API response
interface EvidenceFormData {
  title: string;
  official: string;
  statute: string;
  content: string;
  isTimelineEvent: boolean;
  isCritical: boolean;
  organizationId: string;
}

// Added this interface to resolve the 'unknown' type error
interface ApiResponse {
  success?: boolean;
  error?: string;
}

export default function AdminEvidencePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg: string }>({ 
    type: 'idle', 
    msg: '' 
  });

  const [formData, setFormData] = useState<EvidenceFormData>({
    title: '',
    official: '',
    statute: '',
    content: '',
    isTimelineEvent: false,
    isCritical: false,
    organizationId: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Authenticating...' });
    
    const result = await authenticateAdmin(passphrase);
    
    if (result.success) {
      setIsAuthenticated(true);
      setStatus({ type: 'idle', msg: '' });
    } else {
      setStatus({ type: 'error', msg: 'Access Denied' });
      alert("Access Denied: Invalid Credentials");
    }
  };

  const handleSubmit = async () => {
    setStatus({ type: 'loading', msg: 'Syncing with D1...' });

    try {
      const response = await fetch('/api/evidence', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Explicitly type the result to resolve the 'unknown' error
      const result = (await response.json()) as ApiResponse;

      if (response.ok) {
        setStatus({ type: 'success', msg: 'CORE_DATA_COMMITTED' });
        // Reset the form but keep the organizationId for faster bulk entry
        setFormData(prev => ({ 
          ...prev, 
          title: '', 
          content: '', 
          statute: '',
          isCritical: false // Resetting this prevents accidental double-flagging
        }));
      } else {
        throw new Error(result.error || 'Database rejection');
      }
    } catch (err: unknown) {
      // Use 'unknown' instead of 'any' and type-guard it to satisfy ESLint
      const errorMsg = err instanceof Error ? err.message : 'Unknown Failure';
      setStatus({ 
        type: 'error', 
        msg: `CRITICAL_FAILURE: ${errorMsg}` 
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4">
        <form onSubmit={handleLogin} className="border border-[#4A90E2]/50 p-8 rounded-lg bg-slate-900/20 max-w-sm w-full shadow-[0_0_30px_rgba(74,144,226,0.1)]">
          <h2 className="text-[#4A90E2] mb-6 text-center tracking-widest uppercase text-xs font-bold">Auth_Required</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Passphrase"
            className="w-full bg-black border border-slate-700 p-3 text-white mb-4 focus:border-[#4A90E2] outline-none transition-all"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
          <button className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-black py-3 font-bold uppercase text-xs tracking-widest transition-colors">
            {status.type === 'loading' ? 'Verifying...' : 'Unlock Terminal'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto border border-[#4A90E2]/30 p-8 rounded-lg bg-slate-900/10 shadow-2xl">
        <header className="mb-10 border-b border-[#4A90E2]/20 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-[#4A90E2] uppercase">Core_Data_Ingress</h1>
            <p className="text-[10px] text-slate-500 uppercase mt-2 font-bold tracking-widest">Operator: Thomas J. Carlin III</p>
          </div>
          {status.msg && (
            <div className={`text-[10px] px-4 py-2 font-bold border ${
              status.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 
              status.type === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-500' : 
              'border-blue-500/50 bg-blue-500/10 text-blue-500'
            }`}>
              {status.msg}
            </div>
          )}
        </header>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-[#4A90E2] font-bold uppercase mb-2 tracking-widest">Affiliated Organization</label>
              <select 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors appearance-none"
                value={formData.organizationId}
                onChange={(e) => setFormData({...formData, organizationId: e.target.value})}
              >
                <option value="">Select Registry...</option>
                <option value="1">Redford Township Administration</option>
                <option value="2">Redford Township Police Department</option>
                <option value="6">MDHHS / APS</option>
                <option value="8">Corewell Health / Medical</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#4A90E2] font-bold uppercase mb-2 tracking-widest">Subject Name</label>
              <input 
                type="text" 
                placeholder="e.g. Jennifer Mansfield" 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors"
                value={formData.official}
                onChange={(e) => setFormData({...formData, official: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-[#4A90E2] font-bold uppercase mb-2 tracking-widest">Statute (MCL)</label>
              <input 
                type="text" 
                placeholder="MCL 15.231" 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors"
                value={formData.statute}
                onChange={(e) => setFormData({...formData, statute: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#4A90E2] font-bold uppercase mb-2 tracking-widest">Evidence Title</label>
              <input 
                type="text" 
                placeholder="Ex: Records_Withheld_FOIA" 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#4A90E2] font-bold uppercase mb-2 tracking-widest">Evidence_Manifest (Markdown)</label>
            <textarea 
              rows={12}
              placeholder="Enter documented findings here..."
              className="w-full bg-black border border-slate-700 p-4 text-sm font-sans focus:border-[#4A90E2] outline-none transition-colors text-slate-200"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-3">
             <input 
              type="checkbox" 
              id="critical_check"
              className="accent-[#4A90E2] w-4 h-4"
              checked={formData.isCritical}
              onChange={(e) => setFormData({...formData, isCritical: e.target.checked})}
            />
            <label htmlFor="critical_check" className="text-[10px] uppercase font-bold text-red-500 tracking-[0.2em] cursor-pointer">
              Flag as Critical High-Impact Evidence
            </label>
          </div>

          <button 
            type="button"
            onClick={handleSubmit}
            disabled={status.type === 'loading'}
            className="w-full bg-[#4A90E2] hover:bg-[#357ABD] disabled:bg-slate-800 text-black font-black py-5 uppercase tracking-[0.4em] transition-all text-xs"
          >
            {status.type === 'loading' ? 'SYNCHRONIZING...' : 'Commit to Database'}
          </button>
        </form>
      </div>
    </div>
  );
}