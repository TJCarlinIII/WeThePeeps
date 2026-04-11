// src/lib/wtp-data-types.ts
// ============================================================================
// WETHEPEEPS-V2: CENTRALIZED TYPE DEFINITIONS (Join-Table Architecture)
// Purpose: Type-safe interfaces for the refactored database schema
// ============================================================================

// ─────────────────────────────────────────────────────────────
// 1. SHARED TYPE ALIASES & ENUMS
// ─────────────────────────────────────────────────────────────

/**
 * Actor/Subject status values - matches D1 CHECK constraint
 */
export type SubjectStatus =
  | "pending"
  | "stonewalled"
  | "completed"
  | "verified"
  | "active"
  | "under_review"
  | "former"
  | "deceased";

/**
 * Natural Law / Moral Violation categories for incident classification
 */
export type MoralViolationType =
  | "not-kill"           // Medical Negligence
  | "false-witness"      // Falsified Records
  | "not-steal"          // Financial Exploitation
  | "not-covet"          // Profit-Over-Patient
  | "honor-parents"      // Elder/Vulnerable Abuse
  | "denial-of-due-process"
  | null;

/**
 * Incident verification status
 */
export type IncidentStatus = "pending" | "verified" | "archived" | "stonewalled";

/**
 * Tactical classifications for coordinated actions
 */
export type TacticCategory =
  | "coordinated-withdrawal"
  | "forced-proxying"
  | "document-falsification"
  | "gaslighting"
  | "information-siloing"
  | "proxy-takeover"
  | "stonewall"
  | null;

/**
 * Geographic clusters for Michigan-based entities
 */
export type GeographicCluster =
  | "Metro Detroit"
  | "Lansing (State)"
  | "Grand Rapids (Hub)"
  | "Ann Arbor (Mobile)"
  | null;

// ─────────────────────────────────────────────────────────────
// 2. CORE ENTITY TYPES (Reference Data)
// ─────────────────────────────────────────────────────────────

export interface Sector {
  id: number;
  name: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at?: string;
}

export interface Entity {
  id: number;
  name: string;
  sector_id?: number;
  slug: string;
  description?: string;
  entity_type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  parent_entity_id?: number;
  official_website_url?: string;
  
  // Tactical tracking flags (stored as 0/1 in D1)
  is_foia_target: boolean | number;
  is_medical_target: boolean | number;
  history_of_falsification: boolean | number;
  history_of_withholding: boolean | number;
  statutory_delayer: boolean | number;
  
  // Geospatial
  geographic_cluster?: GeographicCluster;
  latitude?: number;
  longitude?: number;
  
  seo_keywords?: string;
  created_at?: string;
}

export interface Actor {
  id: number;
  full_name: string;
  entity_id?: number; // Primary affiliation (optional)
  job_title?: string;
  status: SubjectStatus | null;
  slug: string;
  bio?: string;
  seo_keywords?: string;
  cdn_image_url?: string;
  official_website_url?: string;
  map_icon?: 'badge' | 'justice' | 'pharmacia' | 'suit' | 'money';
  created_at?: string;
}

export interface Statute {
  id: number;
  citation: string; // e.g. "MCL 15.231"
  title: string;
  slug: string;
  summary?: string;
  legal_text?: string;
  jurisdiction: 'Federal' | 'State' | 'Local';
  jurisdiction_body?: string;
  seo_description?: string;
  seo_keywords?: string;
  official_url?: string;
  status?: 'active' | 'repealed' | 'amended';
  effective_date?: string;
  created_at?: string;
}

// ─────────────────────────────────────────────────────────────
// 3. EVIDENCE & MEDIA TYPES
// ─────────────────────────────────────────────────────────────

export interface Evidence {
  id: number;
  title: string;
  description?: string;
  category?: string; // 'FOIA', 'Medical', 'Email', etc.
  file_url?: string; // R2 key or external URL
  file_type?: string; // 'pdf', 'avif', 'mp4', etc.
  is_critical: boolean | number;
  is_public: boolean | number;
  created_at?: string;
}

export interface Media {
  id: number;
  file_path: string;
  alt_text?: string;
  incident_id?: number; // Legacy direct link (deprecated)
  is_redacted?: 'Yes' | 'No';
  created_at?: string;
}

// ─────────────────────────────────────────────────────────────
// 4. INCIDENT CORE TYPE (NO direct actor/entity foreign keys)
// ─────────────────────────────────────────────────────────────

export interface Incident {
  id: number;
  title: string;
  slug: string;
  event_date: string; // ISO 8601 date string
  description: string; // Main narrative
  status: IncidentStatus;
  is_critical: boolean | number;
  moral_violation_type: MoralViolationType;
  
  // Forensic/retrospective fields
  forensic_analysis?: string; // "Right Mind" contextual notes
  tactic_category?: TacticCategory;
  correlation_id?: string; // Link related incidents (e.g. 'JULY-7-8-LOCKOUT')
  
  // SEO
  seo_description?: string;
  seo_keywords?: string;
  
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────────
// 5. JOIN TABLE TYPES (The Scalable Core)
// ─────────────────────────────────────────────────────────────

/**
 * incident_participants: Unlimited actors/entities per incident
 * This is the "Tri-Node" architecture that replaces actor_id/entity_id in incidents
 */
export interface IncidentParticipant {
  id: number;
  incident_id: number;
  actor_id?: number | null; // Optional: link to an actor
  entity_id?: number | null; // Optional: link to an entity
  role_description: string; // e.g. "Denied FOIA fee waiver", "Closed APS case"
  forensic_note?: string; // Specific contribution to the incident
  is_primary: boolean | number; // Flag the main actor if needed for UI
}

/**
 * incident_evidence: Link evidence to incidents with context
 * Supports rebuttals that surgically target specific claims
 */
export interface IncidentEvidence {
  id: number;
  incident_id: number;
  evidence_id: number;
  is_rebuttal: boolean | number; // 1 = this evidence refutes a claim in the incident
  rebuttal_target_actor_id?: number | null; // Who made the claim being rebutted
  rebuttal_text?: string; // Explanation: "U of M records prove clinical diagnosis..."
  display_order?: number; // For UI sequencing of evidence items
}

/**
 * incident_statutes: Link violated statutes to incidents
 */
export interface IncidentStatute {
  id: number;
  incident_id: number;
  statute_id: number;
  violation_context: string; // How this statute was violated in this incident
}

/**
 * incident_requests: Join table linking records_requests to incidents
 * Allows unlimited requests per incident (and vice versa)
 */
export interface IncidentRequest {
  id: number;
  incident_id: number;
  request_id: number;
  created_at?: string;
}

/**
 * records_requests: Track FOIA/records requests tied to incidents
 */
export interface RecordsRequest {
  id: number;
  incident_id?: number | null;
  actor_id?: number | null; // Who made the request
  entity_id?: number | null; // Who was asked
  request_type: 'FOIA' | 'HIPAA' | 'Medical Records' | 'Internal Memo';
  request_date?: string;
  compliance_deadline?: string;
  status: 'pending' | 'fulfilled' | 'denied' | 'stonewalled' | 'appealed';
  fee_quoted?: number | null;
  fee_waiver_requested: boolean | number;
  days_overdue?: number | null;
  description?: string;
  created_at?: string;
}

// ─────────────────────────────────────────────────────────────
// 6. SUPPORTING TYPES (Preserved from legacy)
// ─────────────────────────────────────────────────────────────

export interface Rebuttal {
  id: number;
  actor_id?: number;
  incident_id?: number;
  falsified_claim: string;
  clinical_fact: string;
  evidence_id?: number;
  evidence_url?: string;
  created_at?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  category?: string;
  summary?: string;
  content: string; // Markdown
  is_featured: boolean | number;
  seo_keywords?: string;
  created_at?: string;
}

export interface TaxonomyDefinition {
  id: number;
  name: string;
  slug: string;
  type: 'category' | 'tag' | 'statute';
  seo_description?: string;
  seo_keywords?: string;
}

export interface RecordTaxonomy {
  id: number;
  parent_id?: number;
  parent_type?: 'incident' | 'actor' | 'entity' | 'statute';
  taxonomy_type?: 'topic' | 'statute' | 'official';
  taxonomy_value?: string;
  created_at?: string;
}

export interface Connection {
  id: number;
  source_id: number; // actors.id
  target_id: number; // entities.id
  connection_type: 'employment' | 'board_member' | 'funding' | 'legal_representation' | 'contracted_vendor';
  description?: string;
  strength?: number;
  created_at?: string;
}

// ─────────────────────────────────────────────────────────────
// 7. AGGREGATED QUERY TYPES (For UI Components)
// ─────────────────────────────────────────────────────────────

/**
 * Incident with all joined participants, evidence, and statutes
 * Used for detailed incident views and forensic timelines
 */
export interface IncidentDetail extends Incident {
  participants: IncidentParticipant[];
  evidence: IncidentEvidence[];
  statutes: IncidentStatute[];
  records_requests: RecordsRequest[];
  
  // Convenience: Pre-joined actor/entity names for display
  participant_details: Array<{
    actor_name?: string;
    entity_name?: string;
    role_description: string;
    is_primary: boolean;
  }>;
}

/**
 * Minimal incident for feed/list views
 */
export interface IncidentSummary {
  id: number;
  title: string;
  slug: string;
  event_date: string;
  description: string;
  is_critical: boolean | number;
  moral_violation_type: MoralViolationType;
  status: IncidentStatus;
  
  // Pre-aggregated counts for UI badges
  participant_count: number;
  evidence_count: number;
  statute_count: number;
}

/**
 * Entity with aggregated incident/participant counts
 * Used for jurisdiction profiles and network map nodes
 */
export interface EntitySummary extends Entity {
  incident_count: number;
  actor_count: number;
  // For network map highlighting
  has_documented_crimes: boolean | number;
  is_high_priority: boolean | number;
}

/**
 * Actor with aggregated incident/rebuttal counts
 * Used for accountability dossiers
 */
export interface ActorSummary extends Actor {
  incident_count: number;
  rebuttal_count: number;
  // For UI status badges
  status_style?: {
    label: string;
    textColor: string;
    ringColor: string;
    bg: string;
  };
}

// ─────────────────────────────────────────────────────────────
// 8. ADMIN / UTILITY TYPES
// ─────────────────────────────────────────────────────────────

export interface AdminSession {
  authenticated: boolean;
  expires: number;
}

export interface StatusBadgeConfig {
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Result shape for API responses with pagination
 */
export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page?: number;
  limit?: number;
}