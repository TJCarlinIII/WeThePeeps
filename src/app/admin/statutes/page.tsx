// File: src/app/admin/statutes/page.tsx
export const dynamic = "force-dynamic";

import AdminGuard from "@/components/admin/AdminGuard";
import StatuteRegistry from "./StatuteRegistry";

export default function StatutesPage() {
  return (
    <AdminGuard>
      <StatuteRegistry />
    </AdminGuard>
  );
}