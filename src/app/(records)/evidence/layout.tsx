export const dynamic = "force-dynamic";

import React from 'react';

export default function EvidenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full py-12">
      {children}
    </section>
  );
}