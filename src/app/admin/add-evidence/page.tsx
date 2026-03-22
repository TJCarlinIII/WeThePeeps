"use client";
import React, { useState } from 'react';

export default function AdminEvidencePage() {
  const [formData, setFormData] = useState({
    title: '',
    official: 'pat-mcrae',
    statute: '',
    content: '',
    imageFilename: '',
    isTimelineEvent: false,
    isCritical: false
  });

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto border border-[#4A90E2]/30 p-8 rounded-lg bg-slate-900/20">
        <header className="mb-10 border-b border-[#4A90E2]/20 pb-4">
          <h1 className="text-2xl font-bold tracking-tighter text-[#4A90E2]">CORE_DATA_INGRESS v1.0</h1>
          <p className="text-xs text-slate-500 uppercase mt-2">Authorized Access Only // TJCarlinIII_Verified</p>
        </header>

        <form className="space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-[#4A90E2] uppercase mb-1">Subject of Interest</label>
              <select 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none"
                value={formData.official}
                onChange={(e) => setFormData({...formData, official: e.target.value})}
              >
                <option value="pat-mcrae">Pat McRae (Supervisor)</option>
                <option value="jennifer-mansfield">Jennifer Mansfield (Chief)</option>
                <option value="karla-clerk">Karla (FOIA Coordinator)</option>
                <option value="michael-bosnic">Michael Bosnic (Attorney)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#4A90E2] uppercase mb-1">Statute Violation (MCL)</label>
              <input 
                type="text" 
                placeholder="e.g. MCL 15.231" 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none"
              />
            </div>
          </div>

          {/* Main Content */}
          <div>
            <label className="block text-[10px] text-[#4A90E2] uppercase mb-1">Evidence/Narrative (Markdown)</label>
            <textarea 
              rows={10}
              className="w-full bg-black border border-slate-700 p-4 text-sm font-sans focus:border-[#4A90E2] outline-none"
              placeholder="Paste Google Doc text here..."
            />
          </div>

          {/* Logic Toggles */}
          <div className="flex gap-10 py-4 border-y border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#4A90E2]" />
              <span className="text-xs uppercase tracking-widest text-slate-300">Add to Timeline</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-red-600" />
              <span className="text-xs uppercase tracking-widest text-red-500">Critical Evidence</span>
            </label>
          </div>

          <button className="w-full bg-[#4A90E2] hover:bg-blue-600 text-black font-bold py-4 uppercase tracking-[0.3em] transition-all">
            Commit to Database
          </button>
        </form>
      </div>
    </div>
  );
}
