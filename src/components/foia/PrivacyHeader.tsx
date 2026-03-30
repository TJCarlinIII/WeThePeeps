// src/components/foia/PrivacyHeader.tsx
'use client';

export default function PrivacyHeader() {
  return (
    <div className="mb-10 space-y-4 no-print">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Cookieless Status */}
        <div className="flex-1 bg-slate-900/50 border border-emerald-900/30 p-4 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" aria-hidden="true" />
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-500">System Status</span>
            <span className="text-sm font-bold text-white uppercase tracking-tighter italic">&quot;Cookieless Environment&quot;</span>
          </div>
        </div>

        {/* Local Processing */}
        <div className="flex-1 bg-slate-900/50 border border-blue-900/30 p-4 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#4A90E2] shadow-[0_0_8px_#4A90E2]" aria-hidden="true" />
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-[#4A90E2]">Data Protocol</span>
            <span className="text-sm font-bold text-white uppercase tracking-tighter italic">&quot;Local Client-Side Only&quot;</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed max-w-3xl italic border-l border-slate-800 pl-4">
        Verification: This site does not utilize HTTP cookies, tracking pixels, or server-side logging for visitors. 
        Information entered into this generator is held in temporary browser memory and is purged upon page refresh. 
        <span className="text-slate-300 font-bold uppercase ml-1 underline decoration-red-900">&quot;No data is stored.&quot;</span>
      </p>
    </div>
  );
}