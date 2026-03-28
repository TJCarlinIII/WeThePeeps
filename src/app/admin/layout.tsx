// File: src/app/admin/layout.tsx
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-wrapper min-h-screen bg-black">
      {/* This is now a pass-through. 
          The sidebar is handled at the page level 
          to prevent double-rendering. 
      */}
      {children}
    </div>
  );
}