"use client";

export const dynamic = 'force-dynamic';

import ArchitectView from "@/components/admin/ArchitectView";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function CasesArchitect() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        {/* Navigation Matrix */}
        <AdminSidebar />

        {/* Intelligence Surface */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12 border-b border-slate-900 pb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#4A90E2]">
                  Case_Architect
                </h1>
                <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">
                  SECURE_NODE // LEGAL_PRECEDENT_V1
                </p>
              </div>
            </header>

            {/* The dynamic registry for cases */}
            <ArchitectView table="cases" title="Legal_Case_Registry" />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}