export const revalidate = 0; // Disables cache for this page
export const dynamic = 'force-dynamic';
import AdminGuard from "@/components/admin/AdminGuard";
import ActorRegistry from "./ActorRegistry";

export default function ActorsPage() {
  return (
    <AdminGuard>
      <ActorRegistry />
    </AdminGuard>
  );
}