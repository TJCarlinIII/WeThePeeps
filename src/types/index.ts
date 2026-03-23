// src/types/index.ts

export interface EvidenceRecord {
  id: number;
  title: string;
  official: string;    // The name of the individual (e.g., Jennifer Mansfield)
  statute: string;     // The legal code (e.g., MCL 15.231)
  content: string;     // The full body of evidence
  isCritical: number;  // 1 for true, 0 for false
  created_at: string;  // Database timestamp
}

export interface AdminSession {
  authenticated: boolean;
  expires: number;
}