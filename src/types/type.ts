// src/types/index.ts
export interface EvidenceRecord {
  id: number;               // or string, depending on your DB
  title: string;
  category: string;
  description: string;
  r2_key: string;          // file key in R2 storage
  is_public: string;       // the date field, e.g., "2026-03-23"
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  officer_name: string;   // maybe the actual officer name
}