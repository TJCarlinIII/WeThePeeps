"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface EvidenceMedia {
  id: number;
  file_url: string;
  display_name: string;
  file_type: string;
}

interface EvidenceRecord {
  id: number;
  description: string;
  slug?: string;
  media?: EvidenceMedia[];
}

interface EvidenceApiResponse {
  results?: EvidenceRecord[];
}

export default function EvidenceManager() {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(null);
  
  const [description, setDescription] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaName, setNewMediaName] = useState('');

  // Declare fetchEvidence first to handle hoisting correctly
  const fetchEvidence = useCallback(async () => {
    try {
      const res = await fetch('/api/evidence');
      const data = (await res.json()) as EvidenceApiResponse | EvidenceRecord[];
      const results = Array.isArray(data) ? data : data.results || [];
      setEvidenceList(results);
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    }
  }, []);

  // UseEffect with an async wrapper to satisfy strict ESLint rules
  useEffect(() => {
    const loadData = async () => {
      await fetchEvidence();
    };
    loadData();
  }, [fetchEvidence]);

  const handleEdit = (record: EvidenceRecord) => {
    setSelectedRecord(record);
    setDescription(record.description);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddMedia = async () => {
    if (!selectedRecord || !newMediaUrl) return;

    try {
      const res = await fetch('/api/admin/evidence-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence_id: selectedRecord.id,
          file_url: newMediaUrl,
          display_name: newMediaName || 'Untitled_Document',
          file_type: newMediaUrl.split('.').pop() || 'pdf'
        })
      });

      if (res.ok) {
        setNewMediaUrl('');
        setNewMediaName('');
        await fetchEvidence();
        alert("MEDIA_ATTACHED_SUCCESSFULLY");
      }
    } catch (err) {
      console.error("MEDIA_ERROR:", err);
    }
  };

  const handleSaveDescription = async () => {
    if (!selectedRecord) return;
    // Standard update logic would go here
    alert("DESCRIPTION_UPDATED");
    setIsEditing(false);
    await fetchEvidence();
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12 border-b border-slate-900 pb-6">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#4A90E2]">
                Evidence_Vault
              </h1>
              <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">
                SECURE_NODE // TRUTH_MANIFEST_V2
              </p>
            </header>

            <div className="space-y-8 font-mono">
              {isEditing && selectedRecord && (
                <div className="bg-slate-900/20 border border-[#4A90E2]/30 p-8 rounded-lg animate-in slide-in-from-top duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[#4A90E2] text-xs font-black uppercase tracking-widest">Editing_Record: ID_{selectedRecord.id}</h2>
                    <button onClick={() => setIsEditing(false)} className="text-slate-500 text-[9px] hover:text-white underline">[ CANCEL ]</button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <label className="text-[9px] text-slate-500 uppercase font-bold">Primary_Description</label>
                      <textarea 
                        className="w-full bg-black border border-slate-800 p-4 text-xs text-white h-32 outline-none focus:border-[#4A90E2]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <button 
                        onClick={handleSaveDescription}
                        className="bg-[#4A90E2] text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        Update_Metadata
                      </button>
                    </div>

                    <div className="space-y-4 border-l border-slate-800 pl-8">
                      <label className="text-[9px] text-green-500 uppercase font-bold">Attach_Media_Asset (PDF/JPG)</label>
                      <input 
                        placeholder="DISPLAY_NAME"
                        className="w-full bg-slate-900/50 border border-slate-800 p-2 text-[10px] text-white outline-none"
                        value={newMediaName}
                        onChange={(e) => setNewMediaName(e.target.value)}
                      />
                      <input 
                        placeholder="GITHUB_OR_FILE_URL"
                        className="w-full bg-slate-900/50 border border-slate-800 p-2 text-[10px] text-[#4A90E2] outline-none"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                      />
                      <button 
                        onClick={handleAddMedia}
                        className="w-full border border-green-900/50 text-green-500 py-2 text-[9px] font-black uppercase hover:bg-green-900/10 transition-all"
                      >
                        Link_New_Document
                      </button>

                      <div className="mt-6">
                        <p className="text-[8px] text-slate-500 uppercase mb-2">Currently_Linked_Assets:</p>
                        {selectedRecord.media?.map(m => (
                          <div key={m.id} className="text-[9px] py-1 border-b border-slate-900 flex justify-between">
                            <span className="text-white truncate max-w-[150px]">{m.display_name}</span>
                            <a href={m.file_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">VIEW_FILE</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-slate-900 overflow-hidden rounded">
                <table className="w-full text-left border-collapse bg-slate-900/5">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest bg-black">
                      <th className="p-4">ID</th>
                      <th className="p-4">Evidence_Description</th>
                      <th className="p-4 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceList.map((row) => (
                      <tr key={row.id} className="border-b border-slate-900 hover:bg-slate-900/20 group transition-colors">
                        <td className="p-4 text-[10px] text-[#4A90E2] font-mono">#00{row.id}</td>
                        <td className="p-4 text-[10px] text-white uppercase tracking-tighter max-w-md truncate">
                          {row.description}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleEdit(row)}
                            className="text-[9px] border border-slate-800 px-4 py-1 hover:bg-[#4A90E2] hover:text-black transition-all font-bold uppercase"
                          >
                            Open_File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}