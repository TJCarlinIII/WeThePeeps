"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RebuttalRecord {
  id: number;
  actor_name: string;
  incident_title?: string;
  falsified_claim: string;
  clinical_fact: string;
  evidence_url?: string;
}

// Define the shape of your API response to satisfy TypeScript
interface ApiResponse {
  results: RebuttalRecord[];
}

export function RebuttalTable({ tableName }: { tableName: string }) {
  const [data, setData] = useState<RebuttalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/${tableName}`);
        // CAST the JSON result to our ApiResponse interface
        const result = (await res.json()) as ApiResponse;
        
        // Now 'result' is typed, and 'result.results' is recognized as RebuttalRecord[]
        setData(result.results || []);
      } catch (err) {
        console.error("FETCH_ERROR", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tableName]);

  if (loading) return <div className="p-8 text-blue-500 animate-pulse font-mono uppercase text-xs">Accessing Rebuttal Registry...</div>;

  return (
    <div className="rounded-none border border-slate-800 bg-black">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-800">
            <TableHead className="text-[#4A90E2] text-[10px] font-bold tracking-widest uppercase">OFFICIAL</TableHead>
            <TableHead className="text-red-500 text-[10px] font-bold tracking-widest uppercase">THE_LIE (CLAIM)</TableHead>
            <TableHead className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase">THE_LAB (FACT)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <TableRow key={r.id} className="border-slate-800 hover:bg-slate-900/30 transition-colors">
              <TableCell>
                <div className="text-[11px] font-bold text-white uppercase tracking-tight">{r.actor_name}</div>
                {r.incident_title && <div className="text-[9px] text-slate-500 font-mono mt-1 italic">{r.incident_title}</div>}
              </TableCell>
              <TableCell className="text-[10px] text-slate-400 font-mono leading-relaxed max-w-[300px]">
                {r.falsified_claim}
              </TableCell>
              <TableCell className="text-[10px] text-slate-200 font-mono leading-relaxed max-w-[300px]">
                {r.clinical_fact}
                {r.evidence_url && (
                   <a 
                    href={r.evidence_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mt-2 text-[#4A90E2] hover:text-blue-300 transition-colors font-bold tracking-tighter"
                   >
                     [ VIEW_VERIFIED_EVIDENCE ]
                   </a>
                )}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-12 text-slate-700 font-mono text-[10px] uppercase tracking-[0.3em]">
                NO_REBUTTALS_LOGGED_IN_PARTITION
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}