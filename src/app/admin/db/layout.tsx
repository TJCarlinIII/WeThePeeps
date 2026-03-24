"use client";

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminGuard from '@/components/admin/AdminGuard';

export default function DbLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black">
        {/* Persistent Navigation */}
        <AdminSidebar />

        {/* Dynamic Workspace */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
             {/* New Global Header */}
             <AdminHeader />
             
             <section className="animate-in fade-in duration-500">
               {children}
             </section>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}