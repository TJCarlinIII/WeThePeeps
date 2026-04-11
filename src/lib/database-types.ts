// src/lib/database-types.ts
// ============================================================================
// CENTRALIZED TYPE DEFINITIONS FOR WETHEPEEPS.NET
// ============================================================================

// ============================================================================
// 1. SHARED TYPE ALIASES
// ============================================================================

/**
 * Actor/Subject status values - matches D1 CHECK constraint on actors.status
 */
export type SubjectStatus =
  | "pending"
  | "stonewalled"
  | "completed"
  | "active"
  | "under_review"
  | "former";

/**
 * Natural Law / Moral Violation categories for incident classification
 */
export type MoralViolationType =
  | "not-kill"       // Medical Negligence
  | "false-witness"  // Falsified Records
  | "not-steal"      // Financial Exploitation
  | "not-covet"      // Profit-Over-Patient
  | "honor-parents"  // Elder/Vulnerable Abuse
  | null;

export type IncidentStatus = "pending" | "verified" | "archived" | "stonewalled";
export type EvidenceStatus = "active_incident" | "resolved" | "archived";

// ============================================================================
// 2. HOME PAGE / NETWORK MAP TYPES
// ============================================================================

/**
 * Minimal entity node for the network map components.
 * has_documented_crimes and is_high_priority are integers (0/1) from D1.
 */
export interface EntityNode {
  id: number;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  has_documented_crimes: number;
  is_high_priority: number;
}

/**
 * Minimal actor node for the network map components.
 * status may be null from D1 if not set.
 */
export interface ActorNode {
  id: number;
  full_name: string;
  slug: string;
  status: SubjectStatus | null;
}

/**
 * Connection between an actor and an entity.
 * Maps to the `connections` table in D1.
 *
 * CONVENTION (enforced throughout all queries and components):
 *   source_id → actors.id   (the person / actor)
 *   target_id → entities.id (the institution / entity)
 *
 * DO NOT alias these to actor_id / entity_id in SQL — use the column names directly.
 */
export interface ActorEntityRelation {
  source_id: number;   // FK → actors.id
  target_id: number;   // FK → entities.id
  connection_type: string;
}

// ============================================================================
// 3. INCIDENT / EVIDENCE TYPES
// ============================================================================

/**
 * Primary incident record for IntelligenceFeed and evidence pages.
 */
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
  has_verified_evidence: number;
  moral_violation_type: MoralViolationType;
}

/**
 * Legacy evidence record structure (for /evidence/[id] pages).
 */
export interface EvidenceRecord {
  id: number;
  title: string;
  official: string;
  statute: string;
  content: string;
  r2_key?: string;
  is_critical: boolean;
  status: EvidenceStatus;
  is_public: boolean;
  category: string;
  created_at: string;
}

// ============================================================================
// 4. ENTITY / ACTOR / DOSSIER TYPES
// ============================================================================

/**
 * Full entity record for directory pages and admin forms.
 */
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
  
  // Tactical Tracking Flags
  is_foia_target: boolean | number; // D1 stores as 0/1
  is_medical_target: boolean | number;
  history_of_falsification: boolean | number;
  history_of_withholding: boolean | number;
  statutory_delayer: boolean | number;
  
  // Geospatial & Regional
  geographic_cluster?: 'Metro Detroit' | 'Lansing (State)' | 'Grand Rapids (Hub)' | 'Ann Arbor (Mobile)';
  latitude?: number;
  longitude?: number;
  
  seo_keywords?: string;
  created_at?: string;
}

// For the Network Map and Dossier Cards
export interface EntityNode extends Entity {
  actor_count?: number;
  incident_count?: number;
}

/**
 * Dossier card data — aggregated query result with incident/statute counts.
 */
export interface OfficialDossier {
  id: number;
  uid: string;
  full_name: string;
  job_title: string;
  agency_name: string;
  agency_slug: string;
  status: SubjectStatus;
  incident_count: number;
  statute_count: number;
  slug: string;
  history_of_falsification: number;
}

/**
 * Actor profile for accountability/[slug] pages.
 */
export interface ActorProfile {
  id: number;
  full_name: string;
  slug: string;
  job_title: string;
  status: SubjectStatus | null;
  entity_id?: number;
  agency_name?: string;
  bio?: string;
  official_website_url?: string;
  social_media_url?: string;
}

/**
 * Simplified actor for search/dropdowns.
 */
export interface ActorReference {
  id: number;
  full_name: string;
  slug: string;
}

// ============================================================================
// 5. STATUTE / LEGAL CODEX TYPES
// ============================================================================

export interface Statute {
  id?: number;
  citation: string;
  title: string;
  slug: string;
  summary: string;
  legal_text: string;
  jurisdiction: "Federal" | "State" | "Local";
  jurisdiction_body: string;
  seo_description?: string;
  seo_keywords?: string;
  official_website_url?: string;
  categories?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface TopStatute {
  id: number;
  citation: string;
  title: string;
  violation_count: number;
}

// ============================================================================
// 6. REBUTTAL / FACT-CHECK TYPES
// ============================================================================

export interface Rebuttal {
  id: number;
  actor_id: number;
  incident_id?: number;
  falsified_claim: string;
  clinical_fact: string;
  evidence_url?: string;
  created_at: string;
  actor_name?: string;
  incident_title?: string;
  evidence_title?: string;
}

// ============================================================================
// 7. ADMIN / UTILITY TYPES
// ============================================================================

export interface AdminSession {
  authenticated: boolean;
  expires: number;
}

export interface StatusBadgeConfig {
  label: string;
  color: string;
  bgColor: string;
}

// ============================================================================
// 8. INTEL ARTICLES / BRIEFINGS (POSTS)
// ============================================================================

/**
 * High-level intelligence briefings and investigative articles.
 * is_featured is stored as a number (0/1) in D1.
 */
export interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  is_featured: number; 
  seo_keywords?: string;
  created_at: string; // ✅ Added to match your DB migration
}