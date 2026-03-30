export const dynamic = "force-dynamic";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import EntityRegistry from "./EntityRegistry";
import Link from "next/link";

export default function EntitiesPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* Unified Header */}
            <header className="flex justify-between items-end mb-12 border-b border-slate-900 pb-8">
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-[#4A90E2]">
                  Entity_Architect
                </h1>
                <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">
                  SECURE_NODE // ORGANIZATION_INDEX_V1
                </p>
              </div>
              
              <Link href="/admin" className="group flex items-center gap-3 bg-slate-900/50 hover:bg-blue-600/20 px-4 py-2 rounded border border-slate-800 transition-all">
                <span className="text-blue-500 text-lg">«</span>
                <span className="text-white font-bold uppercase tracking-widest text-[10px]">Back_to_Control_Center</span>
              </Link>
            </header>

            {/* The Meat */}
            <EntityRegistry />
            
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}