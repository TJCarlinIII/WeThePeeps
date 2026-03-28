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
        setResults(res as SearchResult[]); // Casting to ensure the array matches
      } catch {
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
            // Cast r.type as string to bypass potential type mismatch
            const currentType = r.type as string;

            const link =
              currentType === 'STATUTE'
                ? `/statutes/${encodeURIComponent(r.subtitle || '')}`
                : currentType === 'ACTOR'
                ? `/actors/${encodeURIComponent(r.title)}`
                : currentType === 'ENTITY'
                ? `/entities/${encodeURIComponent(r.title)}`
                : currentType === 'REBUTTAL'
                ? `/rebuttals/${r.id}`
                : `/evidence/${r.id}`;

            const isRebuttal = currentType === 'REBUTTAL';

            return (
              <Link
                key={i}
                href={link}
                className={`block p-3 border-b border-slate-900 hover:bg-slate-900/50 transition-colors ${
                  isRebuttal ? 'bg-emerald-900/5' : ''
                }`}
                onClick={() => {
                  setResults([]);
                  setQuery("");
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-[9px] font-black uppercase border px-1.5 py-0.5 ${
                      isRebuttal
                        ? 'text-emerald-500 border-emerald-900/5'
                        : 'text-[#4A90E2] border-blue-900/50'
                    }`}
                  >
                    {isRebuttal ? '🛡️ REBUTTAL' : r.type}
                  </span>
                  <span className="text-[9px] text-slate-500">ID: {r.id}</span>
                </div>

                <div className="text-sm font-bold text-white truncate group-hover:text-[#4A90E2]">
                  {r.title}
                </div>

                {r.subtitle && (
                  <div
                    className={`text-[10px] truncate mt-1 ${
                      isRebuttal ? 'text-emerald-400 italic' : 'text-slate-400'
                    }`}
                  >
                    {isRebuttal ? `TRUTH: ${r.subtitle}` : r.subtitle}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}