// src/app/admin/db/page.tsx
import { getIncidentStats } from "@/app/admin/actions";
import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import AdminGuard from "@/components/admin/AdminGuard";

export default async function AdminDashboardPage() {
  // Fetch live stats from D1 via Server Action
  const stats = await getIncidentStats();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white p-8 font-mono">
        <header className="mb-8">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">
            Control_Panel // System_Overview
          </h1>
          <p className="text-slate-500 text-[10px] uppercase">
            Data_Source: Cloudflare_D1_Primary
          </p>
        </header>

        {/* The Live Dashboard Cards */}
        <AdminDashboardHeader stats={stats} />

        <div className="grid grid-cols-1 gap-4">
          {/* Your existing table navigation or database links go here */}
          <p className="text-slate-700 text-[10px]">Standing by for ingress...</p>
        </div>
      </div>
    </AdminGuard>
  );
}