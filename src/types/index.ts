export interface EvidenceRecord {
  id: number;
  title: string;
  official: string;      
  statute: string;       
  content: string;       
  r2_key?: string;       
  isCritical: number;    
  is_public: string;     
  category: string;      
  created_at: string;    
}

export interface Profile {
  id: number;
  name: string;          
  title: string;         
  officer_name: string;  
  summary?: string;      
}

export interface AdminSession {
  authenticated: boolean;
  expires: number;       
}

export type SubjectStatus = "active" | "former" | "under_review" | "terminated";

export interface StatusBadgeConfig {
  label: string;
  color: string;
}

export interface Rebuttal {
  id: number;
  actor_id: number;
  incident_id?: number;
  falsified_claim: string;
  clinical_fact: string;
  evidence_url?: string;
  created_at: string;
}