export interface EvidenceRecord {
  id: number;
  title: string;
  official: string;      
  statute: string;       
  content: string;       
  r2_key?: string;       
  is_critical: boolean;  // Changed from number to boolean
  status: 'active_incident' | 'resolved' | 'archived'; // For the banner logic
  is_public: boolean;    // Usually better as boolean too
  category: string;      
  created_at: string;    
}

// Added Statute Interface
export interface Statute {
  id?: number;
  citation: string;
  title: string;
  slug: string;
  summary: string;
  legal_text: string;
  jurisdiction: 'Federal' | 'State' | 'Local';
  jurisdiction_body: string;
  seo_description?: string;
  seo_keywords?: string;
  official_website_url?: string;
  categories?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
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

export interface Entity {
  id: number;
  name: string;
  slug: string;
  description?: string;
  // New Directory Fields
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  website_url?: string;
  parent_entity_id?: number;
  entity_type?: string; 
  updated_at?: string;
}