"use client";
import React, { useState } from 'react';

// 1. Move Interface OUTSIDE the function
interface EvidenceFormData {
  title: string;
  official: string;
  statute: string;
  content: string;
  imageFilename: string;
  isTimelineEvent: boolean;
  isCritical: boolean;
  organizationId: string; 
}

export default function AdminEvidencePage() {
  const [formData, setFormData] = useState<EvidenceFormData>({
    title: '',
    official: 'pat-mcrae',
    statute: '',
    content: '',
    imageFilename: '',
    isTimelineEvent: false,
    isCritical: false,
    organizationId: '' 
  });

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto border border-[#4A90E2]/30 p-8 rounded-lg bg-slate-900/20">
        <header className="mb-10 border-b border-[#4A90E2]/20 pb-4">
          <h1 className="text-2xl font-bold tracking-tighter text-[#4A90E2]">CORE_DATA_INGRESS v1.0</h1>
          <p className="text-xs text-slate-500 uppercase mt-2">Authorized Access Only // TJCarlinIII_Verified</p>
        </header>

        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SUBJECT SELECT */}
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

            {/* ORGANIZATION SELECT (Place it here) */}
            <div>
              <label className="block text-[10px] text-[#4A90E2] uppercase mb-1">Affiliated Organization</label>
              <select 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none text-white"
                value={formData.organizationId}
                onChange={(e) => setFormData({...formData, organizationId: e.target.value})}
              >
                <option value="">Select Organization...</option>
                <option value="1">Redford Township Administration</option>
                <option value="2">Redford Township Police Department</option>
                <option value="3">17th District Court</option>
                <option value="4">Michigan Dept of Attorney General</option>
                <option value="6">MDHHS / APS</option>
                <option value="8">Corewell Health / Medical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* STATUTE INPUT */}
            <div>
              <label className="block text-[10px] text-[#4A90E2] uppercase mb-1">Statute Violation (MCL)</label>
              <input 
                type="text" 
                value={formData.statute}
                onChange={(e) => setFormData({...formData, statute: e.target.value})}
                placeholder="e.g. MCL 15.231" 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none"
              />
            </div>
            {/* TITLE INPUT */}
            <div>
              <label className="block text-[10px] text-[#4A90E2] uppercase mb-1">Evidence Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Falsified FOIA Response" 
                className="w-full bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none"
              />
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div>
            <label className="block text-[10px] text-[#4A90E2] uppercase mb-1">Evidence/Narrative (Markdown)</label>
            <textarea 
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-black border border-slate-700 p-4 text-sm font-sans focus:border-[#4A90E2] outline-none"
              placeholder="Paste Google Doc text here..."
            />
          </div>

          <div className="flex gap-10 py-4 border-y border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isTimelineEvent}
                onChange={(e) => setFormData({...formData, isTimelineEvent: e.target.checked})}
                className="w-4 h-4 accent-[#4A90E2]" 
              />
              <span className="text-xs uppercase tracking-widest text-slate-300">Add to Timeline</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isCritical}
                onChange={(e) => setFormData({...formData, isCritical: e.target.checked})}
                className="w-4 h-4 accent-red-600" 
              />
              <span className="text-xs uppercase tracking-widest text-red-500">Critical Evidence</span>
            </label>
          </div>

          <button 
            type="button"
            className="w-full bg-[#4A90E2] hover:bg-blue-600 text-black font-bold py-4 uppercase tracking-[0.3em] transition-all"
          >
            Commit to Database
          </button>
        </form>
      </div>
    </div>
  );
}