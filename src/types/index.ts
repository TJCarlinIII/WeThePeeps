// src/types/index.ts
export interface EvidenceRecord {
  id: number;
  title: string;
  category: string;
  description: string;
  r2_key: string;
  is_public: number;        // 1 or 0 (boolean in SQLite)
  created_at: string;       // the date field used for sorting/display
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  organization: string;
  summary: string;
}