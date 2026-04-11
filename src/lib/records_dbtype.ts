import { IncidentStatus, MoralViolationType, TacticCategory } from './shared_dbtype';

export interface Incident {
  id: number;
  title: string;
  slug: string;
  description?: string;
  incident_date?: string;
  status: IncidentStatus;
  moral_violation?: MoralViolationType;
  tactic_category?: TacticCategory;
  created_at: string;
}

export interface Demand {
  id: number;
  title: string;
  entity_id: number;
  type: 'FOIA' | 'HIPAA' | '911_RECORDING' | 'EVIDENCE_PRESERVATION';
  status: 'sent' | 'acknowledged' | 'fulfilled' | 'stonewalled' | 'appealed';
  date_sent: string;
  deadline_date?: string;
  tracking_number?: string;
  created_at: string;
}

// Join Table Types
export interface IncidentParticipant {
  incident_id: number;
  actor_id: number;
  role_description?: string;
}