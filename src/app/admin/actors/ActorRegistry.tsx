"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit, Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DynamicForm from "@/components/admin/DynamicForm";

interface Entity {
  id: number;
  name: string;
  sector_id: number;
  [key: string]: string | number | boolean | undefined | null;
}

interface Sector {
  id: number;
  name: string;
  [key: string]: string | number | boolean | undefined | null;
}

interface Actor {
  id: number;
  full_name: string;
  entity_id: number;
  job_title: string;
  status: string;
  slug: string;
  entity_name?: string;
}

interface ApiResponse<T> {
  results: T[];
}

const actorToRecord = (actor: Actor | null | undefined): Record<string, string | number | null> | null => {
  if (!actor) return null;
  return {
    id: actor.id,
    full_name: actor.full_name,
    entity_id: actor.entity_id,
    job_title: actor.job_title,
    status: actor.status,
    slug: actor.slug,
  };
};

export default function ActorRegistry() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterEntity, setFilterEntity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [actorRes, entityRes, sectorRes] = await Promise.all([
        fetch("/api/actors"),
        fetch("/api/entities"),
        fetch("/api/sectors")
      ]);

      const actorData = await actorRes.json() as ApiResponse<Actor>;
      const entityData = await entityRes.json() as ApiResponse<Entity>;
      const sectorData = await sectorRes.json() as ApiResponse<Sector>;

      setActors(actorData.results || []);
      setEntities(entityData.results || []);
      setSectors(sectorData.results || []);
    } catch (err) {
      console.error("LOAD_ERROR:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (data: Record<string, unknown>) => {
    const method = isEditing ? "PATCH" : "POST";
    
    // ESLint-safe destructuring: extracts sector_id to ignore it, 
    // and captures everything else in payload.
    const { sector_id, ...payload } = data;

    const res = await fetch("/api/actors", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEditing ? { ...payload, id: selectedId } : payload)
    });

    if (res.ok) {
      setSelectedId(null);
      setIsEditing(false);
      fetchData();
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-mono">
      <AdminSidebar />
      <main className="flex-1 p-8 grid xl:grid-cols-12 gap-8">
        
        {/* FORM PANEL */}
        <div className="xl:col-span-4 bg-slate-950/30 border border-slate-900 p-6 rounded h-fit sticky top-8">
          <h2 className="text-blue-500 text-[10px] font-black uppercase mb-6 tracking-[0.3em]">
            Actor_Ingress
          </h2>
          <DynamicForm
            key={selectedId || "new"}
            table="actors"
            initialData={actorToRecord(actors.find((a: Actor) => a.id === selectedId))}
            relations={{ entities, sectors }}
            onSave={handleSave}
          />
        </div>

        {/* LIST PANEL */}
        <div className="xl:col-span-8">
          <div className="mb-6 flex gap-2 flex-wrap items-center">
            <button 
              onClick={() => setFilterEntity(null)}
              className={`px-3 py-1 text-[9px] border font-bold uppercase transition-all ${!filterEntity ? 'bg-blue-600 border-blue-500' : 'border-slate-800 text-slate-500'}`}
            >
              All_Actors
            </button>
            {entities.map(e => (
              <button 
                key={e.id} 
                onClick={() => setFilterEntity(e.id)}
                className={`px-3 py-1 text-[9px] border font-bold uppercase transition-all ${filterEntity === e.id ? 'bg-blue-600 border-blue-500' : 'border-slate-800 text-slate-500'}`}
              >
                {e.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-500" />
              </div>
            ) : (
              actors
                .filter(a => !filterEntity || a.entity_id === filterEntity)
                .map(actor => (
                  <div key={actor.id} className="p-4 border border-slate-900 flex justify-between items-center group">
                    <div>
                      <h3 className="font-black uppercase tracking-tight">{actor.full_name}</h3>
                      <p className="text-[9px] text-blue-500 font-bold uppercase">
                        {actor.job_title} @ {actor.entity_name || 'Independent'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setSelectedId(actor.id); setIsEditing(true); }} 
                        className="p-2 border border-slate-800 hover:bg-white hover:text-black"
                      >
                        <Edit size={14}/>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}