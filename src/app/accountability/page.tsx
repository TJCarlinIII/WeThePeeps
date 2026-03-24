"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface Actor {
  id: number;
  name: string;
  role?: string;
  status?: string;
  agency?: string;
  slug?: string;
}

export default function DossiersPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActors = async () => {
      try {
        const response = await fetch('/api/db/actors');
        const data = await response.json();
        if (Array.isArray(data)) {
          setActors(data);
        }
      } catch (err) {
        console.error("FAILED_TO_LOAD_REGISTRY:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadActors();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <header className="mb-12 border-b border-[#4A90E2]/30 pb-6">
        <h1 className="text-3xl font-bold tracking-[0.2em] text-[#4A90E2] uppercase">
          Accountability_Registry.db
        </h1>
        <p className="text-slate-400 mt-2 text-xs max-w-2xl leading-relaxed">
          Public record archive of officials, medical professionals, and state actors involved in 
          the documented concealment of records and neglect of duty.
        </p>
      </header>

      {isLoading ? (
        <div className="text-[#4A90E2] animate-pulse text-xs uppercase tracking-[0.3em]">
          Querying_Database...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actors.map((actor) => (
            <a 
              key={actor.id}
              href={`/accountability/${actor.slug || actor.id}`}
              className="group relative border border-slate-800 bg-slate-900/20 p-6 hover:border-[#4A90E2]/60 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-slate-700 group-hover:border-[#4A90E2]" />
              
              <span className="text-[10px] text-[#4A90E2] font-bold uppercase tracking-widest block mb-1">
                {actor.agency || "Undefined_Agency"}
              </span>
              <h2 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                {actor.name}
              </h2>
              
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex justify-between text-[10px] uppercase">
                  <span className="text-slate-500">Designation:</span>
                  <span className="text-slate-300">{actor.role || "N/A"}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase">
                  <span className="text-slate-500">Alert_Level:</span>
                  <span className={cn(
                    "font-bold",
                    actor.status?.includes("Criminal") ? "text-red-500" : "text-yellow-500"
                  )}>
                    {actor.status || "PENDING"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[9px] text-[#4A90E2] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>VIEW_FULL_DOSSIER</span>
                <div className="h-[1px] flex-1 bg-[#4A90E2]/30" />
                <span>→</span>
              </div>
            </a>
          ))}

          {actors.length === 0 && (
            <p className="text-slate-600 text-xs italic">NO_RECORDS_RETURNED_FROM_NODE</p>
          )}
        </div>
      )}
    </div>
  );
}