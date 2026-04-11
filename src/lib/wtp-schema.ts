// src/lib/wtp-schema.ts
// ============================================================================
// WETHEPEEPS-V2: ADMIN FORM SCHEMAS (Join-Table Architecture)
// Purpose: Dynamic form generation for the refactored database
// ============================================================================

export type SchemaFieldType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'relation' 
  | 'date' 
  | 'number' 
  | 'boolean'
  | 'multi-relation'; // NEW: For join-table participant selectors

export interface SchemaField {
  name: string;
  label: string;
  type: SchemaFieldType;
  placeholder?: string;
  table?: string; // For relation types: which table to fetch options from
  options?: string[]; // For select types
  required?: boolean;
  dependsOn?: string; // For dependent dropdowns (e.g., actors depend on entity)
  helpText?: string; // Tooltip/explanatory text for complex fields
}

// ─────────────────────────────────────────────────────────────
// CORE TABLE SCHEMAS (v2 Refactored)
// ─────────────────────────────────────────────────────────────

export const WTP_TABLE_SCHEMAS: Record<string, SchemaField[]> = {
  // ── SECTORS (Unchanged from legacy) ────────────────────────
  sectors: [
    { name: 'name', label: 'Sector Name', type: 'text', required: false, placeholder: 'e.g. Healthcare, Law Enforcement' },
    { name: 'slug', label: 'URL Slug', type: 'text', required: false, placeholder: 'law-enforcement' },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ── ENTITIES (Unchanged from legacy) ───────────────────────
  entities: [
    { name: 'name', label: 'Organization Name', type: 'text', required: false },
    { name: 'sector_id', label: 'Sector', type: 'relation', table: 'sectors' },
    { name: 'slug', label: 'URL Slug', type: 'text', required: false },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'entity_type', label: 'Entity Type', type: 'text' },
    { name: 'address', label: 'Street Address', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'state', label: 'State', type: 'text', placeholder: 'MI' },
    { name: 'zip_code', label: 'Zip Code', type: 'text' },
    { name: 'phone', label: 'Phone Number', type: 'text' },
    { name: 'parent_entity_id', label: 'Parent Organization', type: 'relation', table: 'entities' },
    { name: 'official_website_url', label: 'Official Website', type: 'text' },
    { name: 'is_foia_target', label: 'Enable FOIA Generator', type: 'boolean' },
    { name: 'is_medical_target', label: 'Enable Medical Demand', type: 'boolean' },
    { name: 'history_of_falsification', label: 'History of Falsification', type: 'boolean' },
    { name: 'history_of_withholding', label: 'History of Withholding', type: 'boolean' },
    { name: 'statutory_delayer', label: 'Statutory Delayer', type: 'boolean' },
    { name: 'geographic_cluster', label: 'Geographic Region', type: 'select', options: ['Metro Detroit', 'Lansing (State)', 'Grand Rapids (Hub)', 'Ann Arbor (Mobile)'] },
    { name: 'latitude', label: 'Latitude (GPS)', type: 'number' },
    { name: 'longitude', label: 'Longitude (GPS)', type: 'number' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ── ACTORS (Unchanged from legacy) ─────────────────────────
  actors: [
    { name: 'full_name', label: 'Full Name', type: 'text', required: false },
    { name: 'entity_id', label: 'Primary Entity', type: 'relation', table: 'entities' },
    { name: 'job_title', label: 'Official Title', type: 'text' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['active', 'under_review', 'former', 'deceased'] },
    { name: 'slug', label: 'URL Slug', type: 'text', required: false },
    { name: 'bio', label: 'Biography', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' },
    { name: 'cdn_image_url', label: 'Image URL', type: 'text' },
    { name: 'official_website_url', label: 'Official Website', type: 'text' },
    { name: 'map_icon', label: 'Map Icon', type: 'select', options: ['badge', 'justice', 'pharmacia', 'suit', 'money'] }
  ],

  // ── STATUTES (Unchanged from legacy) ───────────────────────
  statutes: [
    { name: 'citation', label: 'Statute Citation', type: 'text', required: false, placeholder: 'e.g. MCL 15.231' },
    { name: 'title', label: 'Statute Title', type: 'text', required: false },
    { name: 'slug', label: 'URL Slug', type: 'text', required: false },
    { name: 'summary', label: 'Executive Summary', type: 'textarea' },
    { name: 'legal_text', label: 'Full Legal Text', type: 'textarea' },
    { name: 'jurisdiction', label: 'Jurisdiction', type: 'select', options: ['Federal', 'State', 'Local'] },
    { name: 'jurisdiction_body', label: 'Governing Body', type: 'text', placeholder: 'e.g. Michigan Legislature' },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' },
    { name: 'official_url', label: 'Official URL', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: ['active', 'repealed', 'amended'] },
    { name: 'effective_date', label: 'Effective Date', type: 'date' }
  ],

  // ── EVIDENCE (Master evidence records) ─────────────────────
  evidence: [
    { name: 'title', label: 'Evidence Title', type: 'text', required: false },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'category', label: 'Category', type: 'select', options: ['FOIA', 'Medical', 'Email', 'Video', 'Audio', 'Document', 'Photo'] },
    { name: 'file_url', label: 'File URL (R2 Key or External)', type: 'text' },
    { name: 'file_type', label: 'File Type', type: 'text', placeholder: 'pdf, avif, mp4, etc.' },
    { name: 'is_critical', label: 'Critical Evidence?', type: 'boolean' },
    { name: 'is_public', label: 'Publicly Viewable?', type: 'boolean', placeholder: 'Default: true' }
  ],

  // ── MEDIA (Individual files) ───────────────────────────────
  media: [
    { name: 'file_path', label: 'File Path', type: 'text', required: false },
    { name: 'alt_text', label: 'Alt Text', type: 'text' },
    { name: 'incident_id', label: 'Associated Incident (Legacy)', type: 'relation', table: 'incidents', helpText: 'Deprecated for new incidents; use incident_evidence join table instead' },
    { name: 'is_redacted', label: 'Is Redacted?', type: 'select', options: ['Yes', 'No'] }
  ],

  // ── INCIDENTS (Refactored: NO direct actor/entity foreign keys) ─
  incidents: [
    { name: 'title', label: 'Incident Heading', type: 'text', required: false },
    { name: 'slug', label: 'URL Slug', type: 'text', required: false },
    { name: 'event_date', label: 'Date of Occurrence', type: 'date', required: false },
    { name: 'description', label: 'Incident Narrative', type: 'textarea', required: false, helpText: 'Main factual account of the event' },
    
    // Classification fields
    { name: 'status', label: 'Current Status', type: 'select', options: ['pending', 'completed', 'stonewalled', 'verified'] },
    { name: 'is_critical', label: 'Flag Critical?', type: 'boolean' },
    { name: 'moral_violation_type', label: 'Moral Violation Type', type: 'select', options: [
      'not-kill', 'false-witness', 'not-steal', 'not-covet', 'honor-parents', 'denial-of-due-process'
    ], helpText: 'Natural Law framework classification' },
    
    // Forensic/retrospective fields
    { name: 'forensic_analysis', label: 'Forensic Analysis (Retrospective)', type: 'textarea', helpText: '"Right Mind" contextual notes added after the fact' },
    { name: 'tactic_category', label: 'Tactical Classification', type: 'select', options: [
      'coordinated-withdrawal', 'forced-proxying', 'document-falsification', 
      'gaslighting', 'information-siloing', 'proxy-takeover', 'stonewall'
    ] },
    { name: 'correlation_id', label: 'Correlation ID', type: 'text', placeholder: 'e.g. JULY-7-8-LOCKOUT', helpText: 'Link related incidents across time/entities' },
    
    // SEO fields
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ── JOIN TABLE: incident_participants (Unlimited actors/entities per incident) ─
  incident_participants: [
    { name: 'incident_id', label: 'Incident', type: 'relation', table: 'incidents', required: false },
    { name: 'actor_id', label: 'Actor (Optional)', type: 'relation', table: 'actors', helpText: 'Leave blank if linking only an entity' },
    { name: 'entity_id', label: 'Entity (Optional)', type: 'relation', table: 'entities', helpText: 'Leave blank if linking only an actor' },
    { name: 'role_description', label: 'Role/Action in Incident', type: 'text', required: false, placeholder: 'e.g. "Denied FOIA fee waiver", "Closed APS case"' },
    { name: 'forensic_note', label: 'Forensic Note', type: 'textarea', helpText: 'Specific contribution to the incident narrative' },
    { name: 'is_primary', label: 'Primary Participant?', type: 'boolean', helpText: 'Flag the main actor if needed for UI sorting' }
  ],

  // ── JOIN TABLE: incident_evidence (Link evidence with context) ─
  incident_evidence: [
    { name: 'incident_id', label: 'Incident', type: 'relation', table: 'incidents', required: false },
    { name: 'evidence_id', label: 'Evidence Record', type: 'relation', table: 'evidence', required: false },
    { name: 'is_rebuttal', label: 'Is This a Rebuttal?', type: 'boolean', helpText: 'Check if this evidence refutes a claim made in the incident' },
    { name: 'rebuttal_target_actor_id', label: 'Rebuttal Target Actor', type: 'relation', table: 'actors', dependsOn: 'is_rebuttal', helpText: 'Who made the claim being rebutted' },
    { name: 'rebuttal_text', label: 'Rebuttal Explanation', type: 'textarea', dependsOn: 'is_rebuttal', placeholder: 'e.g. "U of M records prove clinical diagnosis, not self-diagnosis"' },
    { name: 'display_order', label: 'Display Order', type: 'number', helpText: 'For UI sequencing of evidence items' }
  ],

  // ── JOIN TABLE: incident_statutes (Link violated statutes) ─
  incident_statutes: [
    { name: 'incident_id', label: 'Incident', type: 'relation', table: 'incidents', required: false },
    { name: 'statute_id', label: 'Statute', type: 'relation', table: 'statutes', required: false },
    { name: 'violation_context', label: 'How Was This Statute Violated?', type: 'textarea', required: false }
  ],

  // ── JOIN TABLE: incident_requests (Link records requests to incidents) ─
  incident_requests: [
    { name: 'incident_id', label: 'Incident', type: 'relation', table: 'incidents', required: false },
    { name: 'request_id', label: 'Records Request', type: 'relation', table: 'records_requests', required: false }
  ],

  // ── TABLE: records_requests (Track FOIA/records requests) ─
  records_requests: [
    { name: 'incident_id', label: 'Associated Incident', type: 'relation', table: 'incidents' },
    { name: 'actor_id', label: 'Requestor', type: 'relation', table: 'actors' },
    { name: 'entity_id', label: 'Target Entity', type: 'relation', table: 'entities' },
    { name: 'request_type', label: 'Request Type', type: 'select', options: ['FOIA', 'HIPAA', 'Medical Records', 'Internal Memo'] },
    { name: 'request_date', label: 'Request Date', type: 'date' },
    { name: 'compliance_deadline', label: 'Statutory Deadline', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['pending', 'fulfilled', 'denied', 'stonewalled', 'appealed'] },
    { name: 'fee_quoted', label: 'Fee Quoted ($)', type: 'number' },
    { name: 'fee_waiver_requested', label: 'Fee Waiver Requested?', type: 'boolean' },
    { name: 'days_overdue', label: 'Days Overdue', type: 'number' },
    { name: 'description', label: 'Description of Request', type: 'textarea' }
  ],

  // ── SUPPORTING TABLES (Preserved from legacy) ─────────────
  rebuttals: [
    { name: 'actor_id', label: 'Actor Who Made False Claim', type: 'relation', table: 'actors', required: false },
    { name: 'incident_id', label: 'Associated Incident', type: 'relation', table: 'incidents' },
    { name: 'falsified_claim', label: 'Falsified Claim', type: 'textarea', required: false },
    { name: 'clinical_fact', label: 'Clinical/Verified Fact', type: 'textarea', required: false },
    { name: 'evidence_id', label: 'Supporting Evidence', type: 'relation', table: 'evidence' },
    { name: 'evidence_url', label: 'External Fallback URL', type: 'text' }
  ],

  posts: [
    { name: 'title', label: 'Post Title', type: 'text', required: false },
    { name: 'slug', label: 'URL Slug', type: 'text', required: false },
    { name: 'category', label: 'Category', type: 'select', options: ['Personal Story', 'How-To', 'Update', 'Legal Analysis', 'Investigative Briefing'] },
    { name: 'summary', label: 'Short Summary', type: 'textarea' },
    { name: 'content', label: 'Main Content (Markdown)', type: 'textarea' },
    { name: 'is_featured', label: 'Feature on Homepage?', type: 'boolean' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' },
    { name: 'created_at', label: 'Log Date', type: 'date' }
  ],

  taxonomy_definitions: [
    { name: 'name', label: 'Term Name', type: 'text', required: false },
    { name: 'slug', label: 'URL Slug', type: 'text', required: false },
    { name: 'type', label: 'Classification', type: 'select', options: ['category', 'tag', 'statute'], required: false },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  record_taxonomy: [
    { name: 'parent_id', label: 'Parent ID', type: 'number' },
    { name: 'parent_type', label: 'Parent Type', type: 'select', options: ['incident', 'actor', 'entity', 'statute'] },
    { name: 'taxonomy_type', label: 'Taxonomy Type', type: 'select', options: ['topic', 'statute', 'official'] },
    { name: 'taxonomy_value', label: 'Tag Value', type: 'text' }
  ],

  connections: [
    { name: 'source_id', label: 'Source (Actor)', type: 'relation', table: 'actors', required: false },
    { name: 'target_id', label: 'Target (Entity)', type: 'relation', table: 'entities', required: false },
    { name: 'connection_type', label: 'Nature of Connection', type: 'select', options: ['employment', 'board_member', 'funding', 'legal_representation', 'contracted_vendor'] },
    { name: 'description', label: 'Evidence/Context', type: 'textarea' },
    { name: 'strength', label: 'Connection Weight', type: 'number', placeholder: '1-10' }
  ]
};