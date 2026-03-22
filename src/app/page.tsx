// src/app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server Component: fetch data here, pass it to the client SiteLayout.
//
// TO CONNECT TO D1 (Cloudflare Database):
//   const db = process.env.DB as D1Database;
//   const { results } = await db
//     .prepare("SELECT * FROM evidence_records WHERE is_public = 1 ORDER BY created_at DESC")
//     .all<EvidenceRecord>();
//   Then pass: <SiteLayout evidenceData={results} />
// ─────────────────────────────────────────────────────────────────────────────

import { SiteLayout } from "@/components/site-layout";
import type { EvidenceRecord } from "@/components/evidence-card";

// Mock data — replace with a D1 query once your database is ready
const evidenceData: EvidenceRecord[] = [
  {
    id: 1,
    title: "Township Meeting Minutes — Q1 2026",
    category: "PUBLIC RECORD",
    description:
      "Official transcription of the Redford Township board meeting regarding infrastructure allocation. Multiple procedural violations of the Michigan Open Meetings Act identified.",
    r2_key: "foia-001",
    is_public: 1,
    created_at: "2026-03-15T12:00:00Z",
  },
  {
    id: 2,
    title: "Property Tax Assessment Audit",
    category: "FINANCIAL RECORD",
    description:
      "Awaiting response from the County Assessor's office regarding valuation discrepancies. FOIA request submitted 2026-02-28. Response overdue by 14 days.",
    r2_key: "foia-002",
    is_public: 1,
    created_at: "2026-03-10T12:00:00Z",
  },
];

export default function EvidenceFeed() {
  return <SiteLayout evidenceData={evidenceData} />;
}
