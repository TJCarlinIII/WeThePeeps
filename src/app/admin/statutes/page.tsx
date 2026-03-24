"use client";

export const dynamic = "force-dynamic";

import { saveStatute } from "./actions";
import { useState } from "react";

export default function AdminStatutesPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("Verifying_Legal_Code...");
    const result = await saveStatute(formData);
    if (result.success) {
      setStatus("Statute_Logged_Successfully.");
      (document.getElementById("statute-form") as HTMLFormElement).reset();
    } else {
      setStatus("Error: Database_Rejection.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-slate-900 pb-6">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Statute_Entry_Terminal</h1>
          <p className="text-[#4A90E2] text-[10px] mt-2 tracking-[0.3em]">SECURE_NODE // LEGAL_FRAMEWORK_V1</p>
        </header>

        <form id="statute-form" action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Citation_ID</label>
              <input name="citation" required className="bg-slate-950 border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors" placeholder="Ex: MCL 15.231" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Statute_Category</label>
              <select name="category" className="bg-slate-950 border border-slate-800 p-3 text-sm outline-none text-white uppercase font-bold">
                <option value="state">State_Law (Michigan)</option>
                <option value="federal">Federal_Statute</option>
                <option value="constitutional">Constitutional_Right</option>
                <option value="regulation">Administrative_Regulation</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Formal_Title</label>
            <input name="title" required className="bg-slate-950 border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors" placeholder="Ex: Freedom of Information Act" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Legal_Summary_And_Scope</label>
            <textarea name="description" rows={6} required className="bg-slate-950 border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors font-sans" placeholder="Describe the purpose of this law and how it applies to public transparency..." />
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-900">
            <span className="text-[10px] font-bold text-slate-600 italic uppercase tracking-widest">{status}</span>
            <button type="submit" className="bg-white text-black font-black uppercase px-10 py-4 italic tracking-tighter hover:bg-[#4A90E2] hover:text-white transition-all">
              Commit_To_Codex &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
