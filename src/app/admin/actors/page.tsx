import AdminGuard from "@/components/admin/AdminGuard";
import ActorRegistry from "./ActorRegistry";

export default function ActorsPage() {
  return (
    <AdminGuard>
      <ActorRegistry />
    </AdminGuard>
  );
}