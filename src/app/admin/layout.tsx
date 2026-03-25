export const dynamic = "force-dynamic";

import AdminGuard from '@/components/admin/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-slate-300 font-mono selection:bg-red-900 selection:text-white">
      {/* This ensures every admin sub-page is dark by default */}
      {children}
    </div>
  );
}