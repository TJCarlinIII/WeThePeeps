export const dynamic = "force-dynamic";

import React from 'react';
import SiteLayout from '../../components/site-layout';

export default function EvidenceLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
