// src/components/admin/incident-table.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Strict interfaces to satisfy ESLint and TypeScript
export interface IncidentRecord {
  id: number;
  title: string;
  event_date: string;
  status: string;
  is_critical: number;
  actor_name?: string;
  entity_name?: string;
}

export interface ApiResponse {
  results: IncidentRecord[];
}

export function IncidentTable({ tableName }: { tableName: string }) {
  const [data, setData] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/${tableName}`);
        // Explicitly casting the response to solve the 'unknown' error
        const result = (await response.json()) as ApiResponse;
        setData(result.results || []);
      } catch (error) {
        console.error(`Registry Data Sync Error:`, error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tableName]);

  if (loading) {
    return (
      <div className="p-8 text-[#4A90E2] animate-pulse font-mono tracking-widest text-xs">
        SYNCHRONIZING FEDERAL LEDGER...
      </div>
    );
  }

  return (
    <div className="rounded-none border border-slate-800 bg-black/50 backdrop-blur-md">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-800">
            <TableHead className="text-[#4A90E2] text-[10px] font-bold tracking-widest uppercase">
              Timestamp
            </TableHead>
            <TableHead className="text-[#4A90E2] text-[10px] font-bold tracking-widest uppercase">
              Event / Evidence
            </TableHead>
            <TableHead className="text-[#4A90E2] text-[10px] font-bold tracking-widest uppercase">
              Actor / Entity
            </TableHead>
            <TableHead className="text-[#4A90E2] text-[10px] font-bold tracking-widest uppercase">
              Verification
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const isDeadlineTarget =
              item.status === "pending" && item.title.includes("Deadline");
            return (
              <TableRow
                key={item.id}
                className={`border-slate-800/50 transition-colors ${
                  isDeadlineTarget
                    ? "bg-red-950/5 animate-pulse"
                    : "hover:bg-[#4A90E2]/5"
                }`}
              >
                <TableCell className="font-mono text-[10px] text-slate-500">
                  {new Date(item.event_date).toISOString().split("T")[0]}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 uppercase tracking-tight">
                      {item.title}
                    </span>
                    {item.is_critical === 1 && (
                      <Badge variant="destructive">Critical Conflict</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-[11px] text-[#4A90E2] font-semibold">
                    {item.actor_name || "SYSTEM"}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-tighter">
                    {item.entity_name || "Enterprise"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.status === "verified" ? "default" : "outline"}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ✅ ADD THIS: Default export as fallback for flexible imports
export default IncidentTable;