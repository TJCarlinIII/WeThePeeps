"use client";

import { useState } from "react";
import { globalSearch, SearchResult } from "@/app/codex/actions";
import Link from "next/link";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      try {
        const res = await globalSearch(val);
        setResults(res);
      } catch (err) {
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search Manifest (Min 2 chars)..."
        className="w-full bg-slate-900/50 border border-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-[#4A90E2] focus:outline-none transition-colors font-mono uppercase"
        value={query}
        onChange={handleSearch}
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-black border border-slate-800 mt-1 shadow-2xl z-50 max-h-96 overflow-y-auto">
          {results.map((r, i) => {
            const link = r.type === 'STATUTE' ? `/statutes/${encodeURIComponent(r.subtitle || '')}` :
              r.type === 'ACTOR' ? `/actors/${encodeURIComponent(r.title)}` :
              r.type === 'ENTITY' ? `/entities/${encodeURIComponent(r.title)}` :
              `/evidence/${r.id}`;

            return (
              <Link
                key={i}
                href={link}
                className="block p-3 border-b border-slate-900 hover:bg-slate-900/50 transition-colors"
                onClick={() => { setResults([]); setQuery(""); }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#4A90E2] font-bold uppercase">{r.type}</span>
                  <span className="text-[9px] text-slate-500">ID: {r.id}</span>
                </div>
                <div className="text-sm font-bold text-white truncate">{r.title}</div>
                {r.subtitle && <div className="text-[10px] text-slate-400 truncate mt-1">{r.subtitle}</div>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}