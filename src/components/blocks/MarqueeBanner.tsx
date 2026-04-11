"use client";
import React from "react";

export default function MarqueeBanner() {
  return (
    <div className="w-full bg-[#DC2626] text-white overflow-hidden border-b border-red-900/50 py-1.5 relative z-50">
      <div className="animate-marquee font-mono text-[9px] uppercase font-black tracking-widest flex items-center">
        {/* Duplicate content ONCE (2x total) for seamless infinite scrolling */}
        {[...Array(2)].map((_, i) => (
          <span key={i} className="flex items-center px-4 whitespace-nowrap">
            <span className="bg-white text-red-600 px-2 mr-3 py-0.5 rounded-sm font-black">CRITICAL_ALERT</span>
            <span>2024-11-12 — Redford Township // Beauchamp: "FOIA Refusal - Year 3"</span>
            <span className="text-red-300 mx-6">///</span>
            <span className="bg-white text-red-600 px-2 mr-3 py-0.5 rounded-sm font-black">CRITICAL_ALERT</span>
            <span>2024-08-22 — Michigan AG // Nessel: "Civil Rights Ignored"</span>
            <span className="text-red-300 mx-6">///</span>
          </span>
        ))}
      </div>
    </div>
  );
}