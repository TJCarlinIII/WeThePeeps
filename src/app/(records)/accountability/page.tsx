"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { Database, ChevronRight, ShieldAlert } from "lucide-react";

interface Actor {
  id: number;
  name: string;
  role?: string;
  status?: string;
  agency?: string;
  slug?: string;
}

interface D1Response {
  results: Array<{
    id: number;
    full_name: string;
    job_title: string;
    status: string;
    slug: string;
    entity_name?: string;
  }>;
}

export default function DossiersPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActors = async () => {
      try {
        const response = await fetch('/api/db/actors');
        const data = (await response.json()) as D1Response;

        if (data?.results && Array.isArray(data.results)) {
          const mappedActors = data.results.map((row) => ({
            id: row.id,
            name: row.full_name,
            role: row.job_title,
            status: row.status,
            slug: row.slug,
            agency: row.entity_name || "UNSPECIFIED_AGENCY",
          }));
          setActors(mappedActors);
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
    <div className="py-12">
      {/* Header Section */}
      <header className="mb-16 border-l-4 border-[#4A90E2] pl-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-5 h-5 text-[#4A90E2]" />
          <span className="font-mono text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.4em]">
            Archive_Node: MI_CENTRAL
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-white uppercase mb-4">
          Accountability <span className="text-[#D4AF37]">Registry</span>
        </h1>
        <p className="text-slate-500 font-serif text-sm max-w-2xl leading-relaxed">
          The public record archive of officials, medical professionals, and state actors
          identified in the concealment of public data and neglect of constitutional duty.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-4 text-[#4A90E2] animate-pulse font-mono text-xs uppercase tracking-widest py-20">
          <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-ping" />
          Querying_Encrypted_Ledger...
        </div>
      ) : actors.length === 0 ? (
        <div className="border border-dashed border-slate-800 p-20 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
          No subjects on record.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-900/30 border border-slate-900">
          {actors.map((actor) => (
            <Link
              key={actor.id}
              href={`/accountability/${actor.slug || actor.id}`}
              className="group relative bg-[#050a18] p-8 hover:bg-[#4A90E2]/5 transition-all"
            >
              <div className="absolute top-4 right-4 text-slate-800 group-hover:text-[#4A90E2]/40 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>

              <span className="text-[9px] text-[#4A90E2] font-black uppercase tracking-[0.2em] block mb-2">
                {actor.agency}
              </span>
              <h2 className="text-xl font-bold text-slate-200 mb-6 group-hover:text-white transition-colors">
                {actor.name}
              </h2>

              <div className="space-y-3 font-mono">
                <div className="flex justify-between text-[10px] uppercase">
                  <span className="text-slate-600">Designation:</span>
                  <span className="text-slate-400">{actor.role || "FIELD_OFFICER"}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase">
                  <span className="text-slate-600">Priority:</span>
                  <span className={cn(
                    "font-bold px-2 py-0.5 rounded-sm",
                    actor.status?.toLowerCase().includes("criminal")
                      ? "bg-red-950/30 text-red-500 border border-red-900/30"
                      : "bg-yellow-950/30 text-yellow-500 border border-yellow-900/30"
                  )}>
                    {actor.status || "PENDING_REVIEW"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}