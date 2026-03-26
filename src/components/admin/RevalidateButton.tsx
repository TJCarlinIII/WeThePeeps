// src/components/admin/RevalidateButton.tsx
"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function RevalidateButton() {
  const [loading, setLoading] = useState(false);

  const handleRevalidate = async () => {
    setLoading(true);
    try {
      await fetch("/api/revalidate", { method: "POST" });
      alert("CACHE_PURGE_SUCCESSFUL");
    } catch (err) {
      alert("CACHE_PURGE_FAILURE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRevalidate}
      disabled={loading}
      className="w-full group/btn relative mt-2 flex items-center justify-between border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 transition-all hover:bg-emerald-500 hover:text-black disabled:opacity-50"
    >
      <span className="text-[10px] font-black uppercase tracking-tighter italic">
        {loading ? "EXECUTING_PURGE..." : "RUN_REVALIDATION_PROTOCOL"}
      </span>
      <RefreshCw 
        size={14} 
        className={`${loading ? "animate-spin" : "group-hover/btn:rotate-180 transition-transform duration-500"}`} 
      />
    </button>
  );
}