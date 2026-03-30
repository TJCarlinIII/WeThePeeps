// src/lib/database-types.ts

export type SubjectStatus = 'pending' | 'stonewalled' | 'completed' | 'active' | 'under_review' | 'former';

export type MoralViolationType = 'not-kill' | 'false-witness' | 'not-steal' | 'not-covet' | 'honor-parents' | null;

// ✅ RE-ADDED: OfficialDossier for DossierCard compatibility
export interface OfficialDossier {
  id: number;
  uid: string; // e.g., WTP-00001
  full_name: string;
  job_title: string;
  agency_name: string;
  agency_slug: string;
  status: SubjectStatus;
  incident_count: number;
  statute_count: number;
  slug: string;
  history_of_falsification: number; // 0 or 1
}

export interface EntityNode {
  id: number;
  name: string;
  slug: string;
  has_documented_crimes: number; // 0 or 1
  is_high_priority: number;      // 0 or 1
}

export interface ActorNode {
  id: number;
  full_name: string;
  slug: string;
  status: SubjectStatus;
}

export interface ActorEntityRelation {
  actor_id: number;
  entity_id: number;
  connection_type: string;
  role_title?: string; // Optional: matches your new DB schema
}

export interface IntelligenceIncident {
  id: number;
  title: string;
  event_date: string;
  description: string;
  entity_id: number;
  entity_name: string;
  entity_slug: string;
  is_critical: number;
  slug: string;
  has_verified_evidence: number; // 0 or 1
  moral_violation_type: MoralViolationType;
}

export interface TopStatute {
  id: number;
  citation: string;
  title: string;
  violation_count: number;
}