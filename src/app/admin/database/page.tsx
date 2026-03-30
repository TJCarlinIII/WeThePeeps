"use client";

import React, { useState, useEffect } from 'react';
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Define the expected API response shapes
interface ListTablesResponse {
  tables?: string[];
}

interface TableDataResponse {
  columns?: string[];
  rows?: Record<string, unknown>[];
}

export default function DatabaseExplorer() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/database?action=list_tables')
      .then(res => res.json())
      .then(rawData => {
        // Cast the raw JSON to our defined interface
        const data = rawData as ListTablesResponse;
        setTables(data.tables || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch tables:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
    setLoading(true);
    fetch(`/api/admin/database?action=table_data&table=${selectedTable}`)
      .then(res => res.json())
      .then(rawData => {
        // Cast the raw JSON to our defined interface
        const data = rawData as TableDataResponse;
        setColumns(data.columns || []);
        setRows(data.rows || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch table data:", err);
        setLoading(false);
      });
  }, [selectedTable]);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12 border-b border-slate-900 pb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#4A90E2]">
                  Database_Explorer
                </h1>
                <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">
                  SECURE_NODE // DIRECT_D1_ACCESS
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2">
                <select 
                  className="bg-black text-[#4A90E2] border-none outline-none text-xs uppercase font-bold tracking-widest cursor-pointer"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  <option value="">-- SELECT_TABLE_TO_QUERY --</option>
                  {tables.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </header>

            {loading ? (
              <div className="text-slate-500 animate-pulse text-xs uppercase tracking-widest">Executing_Query...</div>
            ) : selectedTable ? (
              <div className="overflow-x-auto border border-slate-800 bg-slate-950/30">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-900 border-b border-slate-800">
                    <tr>
                      {columns.map(col => (
                        <th key={col} className="p-3 text-[#4A90E2] font-black uppercase tracking-widest whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                        {columns.map(col => (
                          <td key={col} className="p-3 text-slate-300 max-w-xs truncate">
                            {row[col] === null ? <span className="text-slate-600 italic">NULL</span> : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={columns.length} className="p-8 text-center text-slate-600 italic uppercase tracking-widest">
                          TABLE_IS_EMPTY
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-dashed border-slate-800 p-20 text-center text-slate-600 text-xs uppercase tracking-widest">
                Awaiting_Table_Selection
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}