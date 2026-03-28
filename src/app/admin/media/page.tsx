export const dynamic = 'force-dynamic';

import ArchitectView from "@/components/admin/ArchitectView";
import AdminGuard from "@/components/admin/AdminGuard";

export default function MediaArchitect() {
  return (
    <AdminGuard>
      <ArchitectView table="media" title="Digital_Evidence_Vault" />
    </AdminGuard>
  );
}