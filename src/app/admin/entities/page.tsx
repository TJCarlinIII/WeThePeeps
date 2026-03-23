"use client";

import React, { useState } from 'react';
import DynamicIngressForm from '@/components/admin/DynamicIngressForm';
import { useRouter } from 'next/navigation';

// Define what the API response looks like to satisfy TypeScript
interface DbResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export default function EntitiesAdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (formData: Record<string, unknown>) => {
    setIsSubmitting(true);
    
    try {
      const isUpdate = Boolean(formData.id);
      const method = isUpdate ? 'PATCH' : 'POST';
      
      const response = await fetch('/api/db/entities', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Cast the result to our interface so TS doesn't complain it is 'unknown'
      const result = (await response.json()) as DbResponse;

      if (result.success) {
        alert(`SUCCESS: Entity ${isUpdate ? 'Updated' : 'Created'}!`);
        router.refresh();
      } else {
        console.error("D1_SAVE_ERROR:", result.error);
        alert(`DATABASE_ERROR: ${result.error}`);
      }
    } catch (err) {
      console.error("NETWORK_ERROR:", err);
      alert("CRITICAL: Failed to connect to the API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-6">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Entity_Management
          </h1>
          <p className="text-slate-500 font-mono text-sm mt-2">
            Add or Update Organizations, Departments, and Healthcare Providers.
          </p>
        </header>

        <section className="bg-slate-900/30 border border-slate-800 p-8 rounded-sm mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-[#4A90E2]">
              {isSubmitting ? "Processing_Transaction..." : "Ingress_Form"}
            </h2>
          </div>

          <DynamicIngressForm 
            tableName="entities" 
            onSave={handleSave} 
          />
        </section>

        <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-sm">
          <p className="text-[10px] text-blue-400 font-mono uppercase leading-relaxed">
            SYSTEM_LOG: Relational integrity active. Sector IDs are linked via the &apos;sectors&apos; table. 
            Ensure slugs are unique to avoid routing collisions in the public directory.
          </p>
        </div>
      </div>
    </main>
  );
}