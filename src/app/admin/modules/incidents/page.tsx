// src/app/admin/modules/incidents/page.tsx
export const dynamic = 'force-dynamic';

import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import IncidentManager from "./IncidentManager";

export default function IncidentsModulePage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12 border-b border-slate-900 pb-6">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#4A90E2]">
                Incident_Architect_v2
              </h1>
              <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">
                SECURE_NODE // JOIN_TABLE_ARCHITECTURE // wethepeeps-v2
              </p>
            </header>
            
            <IncidentManager />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}