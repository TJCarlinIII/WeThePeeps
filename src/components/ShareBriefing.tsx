"use client";

import { useState } from "react";

export default function ShareBriefing({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/articles/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
    } catch (err) {
      console.error("Failed to copy data stream:", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`group flex items-center gap-3 px-4 py-2 border transition-all font-mono text-[10px] font-black uppercase tracking-widest ${
        copied 
          ? "border-emerald-500 bg-emerald-950/20 text-emerald-500" 
          : "border-[#4A90E2]/30 bg-[#4A90E2]/5 text-[#4A90E2] hover:border-[#4A90E2] hover:bg-[#4A90E2]/10"
      }`}
    >
      <span className={`w-2 h-2 rounded-full animate-pulse ${copied ? "bg-emerald-500" : "bg-[#4A90E2]"}`}></span>
      {copied ? "DATA_LINK_COPIED_TO_CLIPBOARD" : "SHARE_INTEL_BRIEFING"}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        [EXTRACT_URL]
      </span>
    </button>
  );
}