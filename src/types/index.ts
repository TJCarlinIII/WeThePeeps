// src/types/index.ts

export interface EvidenceRecord {
  id: number;
  title: string;
  official: string;    // Matches your database (no spaces)
  statute: string;     // Matches your database (no spaces)
  content: string;     // Matches your database (no spaces)
  isCritical: number;  // 1 for true, 0 for false
  created_at: string;  
}

export interface AdminSession {
  authenticated: boolean;
  expires: number;
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  officer_name: string; // matches what src/lib/actions.ts is expecting
}