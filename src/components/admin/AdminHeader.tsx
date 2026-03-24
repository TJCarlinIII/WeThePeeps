"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: number;
  title: string;
  type: 'actor' | 'statute' | 'post';
}

export default function AdminHeader() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    // Logic encapsulated in a function to avoid synchronous setStates in the effect body
    const performSearch = async () => {
      if (query.length < 2) {
        // We only clear if they aren't already cleared to avoid loops
        setResults(prev => prev.length > 0 ? [] : prev);
        setIsOpen(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json() as { results: SearchResult[] }; // Explicit Type Cast
        
        setResults(data.results || []);
        setIsOpen((data.results || []).length > 0);
      } catch (err) {
        console.error("SEARCH_ERROR:", err);
      }
    };

    const delayDebounce = setTimeout(performSearch, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-900 relative z-50">
      <div className="flex-1 max-w-md relative" ref={dropdownRef}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]">🔎</span>
        <input 
          type="text"
          placeholder="SEARCH_SYSTEM_RECORDS..."
          className="w-full bg-slate-900/40 border border-slate-800 py-2 pl-10 pr-4 text-[10px] font-mono text-[#4A90E2] outline-none focus:border-[#4A90E2] transition-all uppercase"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-black border border-slate-700 shadow-2xl rounded overflow-hidden">
            {results.map((res) => (
              <Link 
                key={`${res.type}-${res.id}`} 
                href={`/admin/db/${res.type === 'actor' ? 'actors' : res.type + 's'}`}
                onClick={() => { setIsOpen(false); setQuery(''); }}
                className="block p-3 border-b border-slate-900 hover:bg-slate-900 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white font-bold truncate pr-4 uppercase">{res.title}</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono group-hover:text-[#4A90E2]">
                    [{res.type}]
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="px-3 py-1 border border-green-900/30 bg-green-900/10 rounded">
        <span className="text-[9px] text-green-500 font-mono uppercase tracking-widest animate-pulse">● System_Online</span>
      </div>
    </header>
  );
}