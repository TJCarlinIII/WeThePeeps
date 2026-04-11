import { IncidentStatus, MoralViolationType, TacticCategory } from './shared_dbtype';

export type SecurityLevel = 'public' | 'private' | 'internal';

export interface Evidence {
  id: number;
  wtp_id: string; // e.g., WTP-EV-1001
  title: string;
  description?: string;
  avif_url: string;
  source_date?: string;
  security_level: SecurityLevel;
  seo_keywords?: string;
  created_at: string;
}

export interface Rebuttal {
  id: number;
  evidence_id: number;
  claim_rebutted: string;
  rebuttal_summary: string;
  is_verified: boolean;
}

export interface EvidenceRelation {
  evidence_id: number;
  actor_id?: number;
  entity_id?: number;
  role_in_document?: string;
}