"use client"; // Added to handle the flex-1 p-8 scroll behavior

export const dynamic = "force-dynamic";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ActorRegistry from "./ActorRegistry";

export default function ActorsPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        {/* Left-hand Navigation Node */}
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12 border-b border-slate-900 pb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#4A90E2]">
                  Actor_Registry
                </h1>
                <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">
                  SECURE_NODE // ENTITY_TRACKING_V1
                </p>
              </div>
            </header>

            {/* The main logic component for actors */}
            <ActorRegistry />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}