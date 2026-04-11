"use client";

import { useState, useEffect, useRef } from "react";
import { globalSearch, type SearchResult } from "@/app/codex/actions";
import Link from "next/link";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length >= 2) {
      try {
        const res = await globalSearch(val);
        setResults(res as SearchResult[]);
        setIsOpen(true);
      } catch {
        setResults([]);
      }
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const getHref = (res: SearchResult) => {
    const type = res.type as string;
    const identifier = res.slug || encodeURIComponent(res.title || res.id);

    if (type === 'STATUTE') return `/statutes/${res.id}`;
    if (type === 'ACTOR') return `/actors/${identifier}`;
    if (type === 'ENTITY') return `/entities/${identifier}`;
    if (type === 'REBUTTAL') return `/rebuttals/${res.id}`;
    return `/evidence/${res.id}`;
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="SEARCH_MANIFEST (MIN 2 CHARS)..."
          className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 font-mono text-xs text-[#4A90E2] focus:border-[#4A90E2] focus:outline-none transition-colors uppercase placeholder-slate-600"
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-slate-700 font-black animate-pulse">
          [SCANNING]
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-black border border-[#4A90E2]/20 mt-1 shadow-2xl z-50 max-h-96 overflow-y-auto backdrop-blur-md">
          {results.map((r, i) => {
            const isRebuttal = r.type === 'REBUTTAL';

            return (
              <Link
                key={`${r.type}-${r.id}-${i}`}
                href={getHref(r)}
                className={`block p-4 border-b border-slate-900 hover:bg-[#4A90E2]/10 transition-colors group ${
                  isRebuttal ? 'bg-emerald-950/10' : ''
                }`}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 border ${
                    isRebuttal 
                      ? 'text-emerald-500 border-emerald-900/50' 
                      : 'text-[#4A90E2] border-blue-900/50'
                  }`}>
                    {isRebuttal ? '🛡️ REBUTTAL' : r.type}
                  </span>
                  <span className="text-[8px] text-slate-600 font-mono">ID_{r.id}</span>
                </div>

                <div className="text-sm font-bold text-white group-hover:text-[#4A90E2] transition-colors">
                  {r.title}
                </div>

                {/* ✅ YOUR INTEGRATED LOGIC GOES HERE */}
                {r.subtitle && (
                  <div className={`text-[10px] truncate mt-1 ${
                    isRebuttal ? 'text-emerald-400 italic' : 'text-slate-500'
                  }`}>
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