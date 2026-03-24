"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import PostForm, { Post } from '@/components/admin/forms/PostForm';

interface Entity {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  results?: T[];
}

export default function PostsManager() {
  const [rows, setRows] = useState<Post[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 1. Fetch Posts
    fetch('/api/posts')
      .then(res => res.json() as Promise<ApiResponse<Post> | Post[]>)
      .then((data) => {
        setRows(Array.isArray(data) ? data : data.results || []);
      });
    
    // 2. Fetch Entities for the multi-select tagging
    fetch('/api/entities')
      .then(res => res.json() as Promise<ApiResponse<Entity> | Entity[]>)
      .then((data) => {
        setEntities(Array.isArray(data) ? data : data.results || []);
      });
  }, []);

  const handleSave = async (formData: Post) => {
    const method = isEditing ? 'PATCH' : 'POST';
    const payload = isEditing ? { ...formData, id: selectedId ?? undefined } : formData;

    try {
      const res = await fetch('/api/posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("POST_TRANSMISSION_COMPLETE");
        window.location.reload();
      } else {
        alert("TRANSMISSION_ERROR: Check API logs.");
      }
    } catch (err) {
      console.error("SAVE_ERROR:", err);
    }
  };

  const selectedRow = rows.find(r => r.id === selectedId);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white p-8 font-mono">
        <Link href="/admin/db" className="text-[#4A90E2] text-[10px] underline uppercase tracking-widest">
          ← BACK_TO_DATABASE_HUB
        </Link>
        
        <div className="mt-8 border border-slate-700 p-6 rounded-lg bg-slate-900/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#4A90E2] uppercase tracking-[0.2em] text-xs font-bold">
              {isEditing ? `SYSTEM_OVERRIDE [POST_ID: ${selectedId}]` : 'DATA_INGRESS_POSTS'}
            </h2>
            {isEditing && (
              <button 
                onClick={() => { setIsEditing(false); setSelectedId(null); }}
                className="text-slate-500 text-[9px] border border-slate-800 px-3 py-1 hover:text-white"
              >
                [ ABORT_EDIT ]
              </button>
            )}
          </div>
          
          <PostForm 
            initialData={isEditing ? selectedRow : null} 
            entities={entities}
            onSave={(data) => { handleSave(data); }} 
          />
        </div>

        <div className="mt-12">
          <h3 className="text-slate-400 text-[10px] uppercase mb-4 tracking-widest font-bold">Content_Manifest</h3>
          <div className="border border-slate-800 rounded bg-black/40 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-700 text-slate-500 text-[9px] uppercase">
                  <th className="p-4 w-12 text-center">SEL</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Flags</th>
                  <th className="p-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedId(row.id ?? null)}
                    className={`border-b border-slate-900 cursor-pointer ${selectedId === row.id ? "bg-slate-800/60" : "hover:bg-slate-900/40"}`}
                  >
                    <td className="p-4 text-center">
                       <div className={`w-2 h-2 rounded-full mx-auto ${selectedId === row.id ? "bg-[#4A90E2]" : "bg-slate-700"}`} />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{row.title}</div>
                      <div className="text-[10px] text-slate-600 truncate max-w-md">{row.content.substring(0, 80)}...</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {row.is_critical === 1 && <span className="text-[8px] px-1 border border-red-900 text-red-500 bg-red-900/20">CRITICAL</span>}
                        {row.is_featured === 1 && <span className="text-[8px] px-1 border border-blue-900 text-blue-400 bg-blue-900/20">FEATURED</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(row.id ?? null);
                          setIsEditing(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                        className="text-[#4A90E2] text-[9px] uppercase hover:underline"
                      >
                        [ EDIT ]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}