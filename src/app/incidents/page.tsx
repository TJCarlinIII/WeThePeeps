import { IncidentTable } from "@/components/admin/incident-table";

export default function IncidentsAdminPage() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-500 uppercase">
          Federal Evidence Registry
        </h1>
        <p className="text-gray-400 text-sm">
          Active tracking of civil rights violations and clinical falsifications.
        </p>
      </header>

      <div className="grid gap-4">
        <IncidentTable tableName="incidents" />
      </div>
    </div>
  );
}