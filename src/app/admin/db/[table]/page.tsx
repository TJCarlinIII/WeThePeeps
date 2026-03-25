import { notFound } from "next/navigation";
import ActorForm from "@/components/admin/forms/ActorForm";
import EntityForm from "@/components/admin/forms/EntityForm";
import StatuteForm from "@/components/admin/forms/StatuteForm";
import SectorForm from "@/components/admin/forms/SectorForm";
import ActorTypeForm from "@/components/admin/forms/ActorTypeForm";

// Using Record<string, unknown> instead of any for cleaner typing
interface DbRow extends Record<string, unknown> {
  id?: number;
}

export default async function DynamicDbPage({ 
  params 
}: { 
  params: Promise<{ table: string }> 
}) {
  const resolvedParams = await params;
  const table = resolvedParams.table.toLowerCase();

  const initialData: DbRow | null = null; 

  const handleSave = async (formData: Record<string, unknown>) => {
    "use server";
    console.log(`Saving to ${table}:`, formData);
  };

  // Map the components
  // We use the eslint-disable flag to allow the 'as any' cast specifically 
  // for the prop mismatch until the individual form types are unified.
  const forms: Record<string, React.ReactNode> = {
    actors: (
      /* eslint-disable @typescript-eslint/no-explicit-any */
      <ActorForm 
        onSave={handleSave as any} 
        entities={[]} 
        initialData={initialData as any} 
      />
    ),
    entities: (
      <EntityForm 
        onSave={handleSave as any} 
        sectors={[]} 
        initialData={initialData as any} 
      />
    ),
    statutes: (
      <StatuteForm 
        onSave={handleSave as any} 
        initialData={initialData as any} 
      />
    ),
    sectors: (
      <SectorForm 
        onSave={handleSave as any} 
        initialData={initialData as any} 
      />
    ),
    actortypes: (
      <ActorTypeForm 
        onSave={handleSave as any} 
        initialData={initialData as any} 
      />
      /* eslint-enable @typescript-eslint/no-explicit-any */
    ),
  };

  const ActiveForm = forms[table];

  if (!ActiveForm) return notFound();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 border-b border-slate-900 pb-6">
        <h2 className="text-white text-2xl font-black uppercase tracking-tighter font-mono">
          <span className="text-red-600">/</span> Ingress_{table}
        </h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold font-mono">
          System_Status: Secure_Terminal_Ready
        </p>
      </header>

      <div className="bg-slate-950/40 border border-slate-900 p-8 shadow-2xl">
        {ActiveForm}
      </div>
    </div>
  );
}