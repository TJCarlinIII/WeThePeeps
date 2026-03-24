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