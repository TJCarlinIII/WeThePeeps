// File: src/lib/schemas.ts
export interface SchemaField {
  name: string;
  label: string;
  // ✅ Added "boolean" to this union type to support checkbox flags
  type: 'text' | 'textarea' | 'select' | 'relation' | 'date' | 'number' | 'boolean'; 
  placeholder?: string;
  table?: string;
  options?: string[];
  required?: boolean;
  /**
   * Used for dependent dropdowns. 
   * e.g. entity_id depends on sector_id 
   */
  dependsOn?: string; 
}

export const TABLE_SCHEMAS: Record<string, SchemaField[]> = {
  
  // ─────────────────────────────────────────────────────────────
  // SECTORS (Updated to AI Studio version)
  // ─────────────────────────────────────────────────────────────
  sectors: [
    { name: 'name', label: 'Sector Name', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

// ─────────────────────────────────────────────────────────────
// ENTITIES 
// ─────────────────────────────────────────────────────────────
entities: [
  { name: 'name', label: 'Organization Name', type: 'text', required: true },
  { name: 'sector_id', label: 'Sector', type: 'relation', table: 'sectors' },
  { name: 'slug', label: 'URL Slug', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'entity_type', label: 'Entity Type', type: 'text' },
  { name: 'address', label: 'Street Address', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
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
  // ── Geospatial Fields for Leaflet Integration ──
  { name: 'latitude', label: 'Latitude (GPS)', type: 'number' },
  { name: 'longitude', label: 'Longitude (GPS)', type: 'number' },
  { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
],

  // ─────────────────────────────────────────────────────────────
  // ACTORS 
  // ─────────────────────────────────────────────────────────────
  actors: [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true },
    { name: 'entity_id', label: 'Primary Entity', type: 'relation', table: 'entities' },
    { name: 'job_title', label: 'Official Title', type: 'text' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['active', 'under_review', 'former'] },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'bio', label: 'Biography', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' },
    { name: 'cdn_image_url', label: 'Image URL', type: 'text' }
  ],

  // ─────────────────────────────────────────────────────────────
  // INCIDENTS (Updated to AI Studio version)
  // ─────────────────────────────────────────────────────────────
  incidents: [
    { name: 'title', label: 'Incident Heading', type: 'text', required: true },
    { name: 'entity_id', label: 'Involved Entity', type: 'relation', table: 'entities' },
    { name: 'actor_id', label: 'Primary Actor', type: 'relation', table: 'actors' },
    { name: 'statute_id', label: 'Relevant Statute', type: 'relation', table: 'statutes' },
    { name: 'event_date', label: 'Date of Occurrence', type: 'date' },
    { name: 'description', label: 'Incident Narrative', type: 'textarea' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['pending', 'completed', 'stonewalled'] },
    { name: 'is_critical', label: 'Flag Critical?', type: 'boolean' },
    { name: 'moral_violation_type', label: 'Moral Violation Type', type: 'select', options: ['not-kill', 'false-witness', 'not-steal', 'not-covet', 'honor-parents', 'denial-of-due-process'] }
  ],

  // ─────────────────────────────────────────────────────────────
  // REBUTTALS (Updated to AI Studio version)
  // ─────────────────────────────────────────────────────────────
  rebuttals: [
    { name: 'actor_id', label: 'Select Individual', type: 'relation', table: 'actors', required: true },
    { name: 'falsified_claim', label: 'Falsified Claim', type: 'textarea', required: true },
    { name: 'clinical_fact', label: 'Clinical Fact', type: 'textarea', required: true },
    { name: 'evidence_id', label: 'Master Evidence Document', type: 'relation', table: 'media' },
    { name: 'evidence_url', label: 'External Fallback URL', type: 'text' }
  ],

  // ─────────────────────────────────────────────────────────────
  // CONNECTIONS (Updated to AI Studio version)
  // ─────────────────────────────────────────────────────────────
  connections: [
    { name: 'source_id', label: 'Source (Actor)', type: 'relation', table: 'actors', required: true },
    { name: 'target_id', label: 'Target (Entity)', type: 'relation', table: 'entities', required: true },
    { name: 'connection_type', label: 'Nature of Connection', type: 'select', options: ['employment', 'board_member', 'funding', 'legal_representation', 'contracted_vendor'] },
    { name: 'description', label: 'Evidence/Context', type: 'textarea' },
    { name: 'strength', label: 'Connection Weight', type: 'number' }
  ],

  // ─────────────────────────────────────────────────────────────
  // CASES (Updated to AI Studio version)
  // ─────────────────────────────────────────────────────────────
  cases: [
    { name: 'name', label: 'Case Name', type: 'text', required: true },
    { name: 'case_number', label: 'Reference #', type: 'text', required: true },
    { name: 'status', label: 'Legal Status', type: 'select', options: ['active', 'closed', 'under_review'] }
  ],

  // ─────────────────────────────────────────────────────────────
  // MEDIA (Updated to AI Studio version)
  // ─────────────────────────────────────────────────────────────
  media: [
    { name: 'file_path', label: 'File Path', type: 'text', required: true },
    { name: 'alt_text', label: 'Alt Text', type: 'text' },
    { name: 'incident_id', label: 'Link to Incident', type: 'relation', table: 'incidents' },
    { name: 'is_redacted', label: 'Is Redacted?', type: 'select', options: ['Yes', 'No'] }
  ],

  // ─────────────────────────────────────────────────────────────
  // POSTS (Updated to AI Studio version)
  // ─────────────────────────────────────────────────────────────
  posts: [
    { name: 'title', label: 'Post Title', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'summary', label: 'Short Summary', type: 'textarea' },
    { name: 'content', label: 'Main Content (Markdown)', type: 'textarea' },
    { name: 'is_featured', label: 'Feature on Homepage?', type: 'boolean' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' },
    { name: 'created_at', label: 'Log Date', type: 'date' } // Changed 'datetime' to 'date'
  ],

  // ─────────────────────────────────────────────────────────────
  // ALL OTHER TABLES (Preserved from original)
  // ─────────────────────────────────────────────────────────────
  evidence: [
    { name: 'title', label: 'Evidence Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'file_url', label: 'File URL', type: 'text' },
    { name: 'isCritical', label: 'Critical?', type: 'boolean' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Post Entitites
  // ─────────────────────────────────────────────────────────────
  post_entities: [
    { name: 'post_id', label: 'Post', type: 'relation', table: 'posts', required: true },
    { name: 'entity_id', label: 'Entity', type: 'relation', table: 'entities', required: true }
  ],
  // ─────────────────────────────────────────────────────────────
  // Evidence Relations
  // ─────────────────────────────────────────────────────────────
  evidence_relations: [
    { name: 'source_id', label: 'Source Evidence', type: 'relation', table: 'evidence', required: true },
    { name: 'target_id', label: 'Target Evidence', type: 'relation', table: 'evidence', required: true },
    { name: 'relation_type', label: 'Relation Type', type: 'select', options: ['REFUTES', 'SUPPORTS', 'CONTEXT'] },
    { name: 'notes', label: 'Internal Notes', type: 'textarea' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Evidence Media
  // ─────────────────────────────────────────────────────────────
  evidence_media: [
    { name: 'evidence_id', label: 'Evidence', type: 'relation', table: 'evidence', required: true },
    { name: 'file_url', label: 'File URL', type: 'text', required: true },
    { name: 'file_type', label: 'File Type', type: 'text' },
    { name: 'display_name', label: 'Display Name', type: 'text' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Record Taxonomy
  // ─────────────────────────────────────────────────────────────
  record_taxonomy: [
    { name: 'parent_id', label: 'Parent ID', type: 'number' },
    { name: 'parent_type', label: 'Parent Type', type: 'select', options: ['incident', 'actor', 'entity'] },
    { name: 'taxonomy_type', label: 'Taxonomy Type', type: 'select', options: ['topic', 'statute', 'official'] },
    { name: 'taxonomy_value', label: 'Tag Value', type: 'text' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Taxonomy Definitions
  // ─────────────────────────────────────────────────────────────
  taxonomy_definitions: [
    { name: 'name', label: 'Term Name', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'type', label: 'Classification', type: 'select', options: ['category', 'tag', 'statute'], required: true },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Statutes
  // ─────────────────────────────────────────────────────────────
  statutes: [
    { name: 'title', label: 'Statute Title', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'citation', label: 'Citation', type: 'text' },
    { name: 'jurisdiction_level', label: 'Jurisdiction Level', type: 'select', options: ['Federal', 'State', 'Local'] },
    { name: 'jurisdiction_body_id', label: 'Jurisdiction Body', type: 'relation', table: 'jurisdiction_bodies' },
    { name: 'summary', label: 'Summary', type: 'textarea' },
    { name: 'legal_text', label: 'Full Legal Text', type: 'textarea' },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    { name: 'effective_date', label: 'Effective Date', type: 'date' },
    { name: 'official_url', label: 'Official URL', type: 'text' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Jurisdiction Bodies
  // ─────────────────────────────────────────────────────────────
  jurisdiction_bodies: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'short_name', label: 'Short Name', type: 'text' },
    { name: 'jurisdiction_level', label: 'Level', type: 'select', options: ['Federal', 'State', 'Local'] }
  ],
  // ─────────────────────────────────────────────────────────────
  // Records Request
  // ─────────────────────────────────────────────────────────────
  records_requests: [
    { name: 'actor_id', label: 'Requestor', type: 'relation', table: 'actors' },
    { name: 'request_type', label: 'Request Type', type: 'select', options: ['HIPAA', 'FOIA', 'Medical Records'] },
    { name: 'request_date', label: 'Request Date', type: 'date' },
    { name: 'compliance_deadline', label: 'Compliance Deadline', type: 'date' },
    { name: 'status', label: 'Status', type: 'text' },
    { name: 'days_overdue', label: 'Days Overdue', type: 'number' },
    { name: 'description', label: 'Description', type: 'textarea' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Medical Neglect
  // ─────────────────────────────────────────────────────────────
  med_neglect: [
    { name: 'actor_id', label: 'Patient', type: 'relation', table: 'actors' },
    { name: 'medication_name', label: 'Medication', type: 'text' },
    { name: 'reported_symptom', label: 'Reported Symptom', type: 'textarea' },
    { name: 'physician_response', label: 'Physician Response', type: 'textarea' },
    { name: 'date_reported', label: 'Date Reported', type: 'date' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Delerium Events
  // ─────────────────────────────────────────────────────────────
  delirium_events: [
    { name: 'event_title', label: 'Event Title', type: 'text' },
    { name: 'event_date', label: 'Event Date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'witnesses', label: 'Witnesses', type: 'text' },
    { name: 'clinical_context', label: 'Clinical Context', type: 'text' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Neuro Symptoms
  // ─────────────────────────────────────────────────────────────
  neuro_symptoms: [
    { name: 'symptom_name', label: 'Symptom Name', type: 'text' },
    { name: 'clinical_definition', label: 'Clinical Definition', type: 'textarea' },
    { name: 'patient_description', label: 'Patient Description', type: 'textarea' },
    { name: 'misinterpretation_by_doctors', label: 'Misinterpretation by Doctors', type: 'textarea' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Professional Loss
  // ─────────────────────────────────────────────────────────────
  professional_loss: [
    { name: 'employer_name', label: 'Employer', type: 'text' },
    { name: 'role_title', label: 'Role', type: 'text' },
    { name: 'years_tenure', label: 'Years Tenure', type: 'number' },
    { name: 'functional_failure', label: 'Functional Failure', type: 'textarea' },
    { name: 'termination_date', label: 'Termination Date', type: 'date' },
    { name: 'gastman_notified', label: 'Gastman Notified?', type: 'boolean' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Disability Obstruction
  // ─────────────────────────────────────────────────────────────
  disability_obstruction: [
    { name: 'agency_name', label: 'Agency', type: 'text' },
    { name: 'date_denied', label: 'Date Denied', type: 'date' },
    { name: 'reason_given', label: 'Reason Given', type: 'textarea' },
    { name: 'conflicting_evidence_withheld', label: 'Conflicting Evidence Withheld', type: 'textarea' },
    { name: 'actor_id', label: 'Associated Actor', type: 'relation', table: 'actors' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Survival Support
  // ─────────────────────────────────────────────────────────────
  survival_support: [
    { name: 'provider_name', label: 'Provider', type: 'text' },
    { name: 'support_type', label: 'Support Type', type: 'text' },
    { name: 'estimated_value', label: 'Estimated Value', type: 'number' },
    { name: 'date_range', label: 'Date Range', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'textarea' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Funtional Deficits
  // ─────────────────────────────────────────────────────────────
  functional_deficits: [
    { name: 'skill_category', label: 'Skill Category', type: 'text' },
    { name: 'baseline_capability', label: 'Baseline Capability', type: 'textarea' },
    { name: 'post_injury_deficit', label: 'Post-Injury Deficit', type: 'textarea' },
    { name: 'clinical_implication', label: 'Clinical Implication', type: 'textarea' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Neglectg Timeline 2023
  // ─────────────────────────────────────────────────────────────
  neglect_timeline_2023: [
    { name: 'date_occurred', label: 'Date', type: 'date' },
    { name: 'event_type', label: 'Event Type', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'actor_id', label: 'Actor', type: 'relation', table: 'actors' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Front Page Headlines
  // ─────────────────────────────────────────────────────────────
  front_page_headlines: [
    { name: 'headline', label: 'Headline', type: 'text' },
    { name: 'subheadline', label: 'Subheadline', type: 'text' },
    { name: 'incident_id', label: 'Incident', type: 'relation', table: 'incidents' },
    { name: 'layout_position', label: 'Layout Position', type: 'select', options: ['main', 'sidebar', 'footer'] }
  ],
  // ─────────────────────────────────────────────────────────────
  // Home Page Layout
  // ─────────────────────────────────────────────────────────────
  home_page_layout: [
    { name: 'incident_id', label: 'Incident', type: 'relation', table: 'incidents' },
    { name: 'section_type', label: 'Section Type', type: 'select', options: ['hero', 'sidebar', 'ticker', 'grid'] },
    { name: 'display_order', label: 'Display Order', type: 'number' },
    { name: 'is_active', label: 'Active?', type: 'boolean' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Incident Statutes
  // ─────────────────────────────────────────────────────────────
  incident_statutes: [
    { name: 'incident_id', label: 'Incident', type: 'relation', table: 'incidents', required: true },
    { name: 'statute_id', label: 'Statute', type: 'relation', table: 'statutes', required: true }
  ],
  // ─────────────────────────────────────────────────────────────
  // Stories
  // ─────────────────────────────────────────────────────────────
  stories: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'slug', label: 'Slug', type: 'text' },
    { name: 'summary', label: 'Summary', type: 'textarea' },
    { name: 'main_actor_id', label: 'Main Actor', type: 'relation', table: 'actors' },
    { name: 'summary_hook', label: 'Summary Hook', type: 'text' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Sidebar Stats
  // ─────────────────────────────────────────────────────────────
  sidebar_stats: [
    { name: 'label', label: 'Label', type: 'text' },
    { name: 'stat_value', label: 'Value', type: 'text' },
    { name: 'subtext', label: 'Subtext', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: ['professional', 'constitutional', 'medical'] }
  ],
  // ─────────────────────────────────────────────────────────────
  // Brand Assets
  // ─────────────────────────────────────────────────────────────
  brand_assets: [
    { name: 'asset_name', label: 'Asset Name', type: 'text', required: true },
    { name: 'asset_path', label: 'Asset Path', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' }
  ],
  // ─────────────────────────────────────────────────────────────
  // Junction Table for Network Graph)
  // ─────────────────────────────────────────────────────────────
  actor_entity_relations: [
    { name: 'actor_id', label: 'Actor', type: 'relation', table: 'actors', required: true },
    { name: 'entity_id', label: 'Entity', type: 'relation', table: 'entities', required: true },
    { name: 'connection_type', label: 'Connection Type', type: 'select', options: ['Board Member', 'Employment', 'Conflict of Interest', 'Funding', 'Legal Representation'] }
  ],
  // ─────────────────────────────────────────────────────────────
  // LEGAL DEMANDS (NEW: Speed-Up Investigation Checklist)
  // ─────────────────────────────────────────────────────────────
  legal_demands: [
    { name: 'title', label: 'Demand Title', type: 'text', required: true, placeholder: 'e.g. FOIA - April Sydow Emails' },
    { name: 'entity_id', label: 'Target Entity', type: 'relation', table: 'entities', required: true },
    { name: 'type', label: 'Demand Type', type: 'select', options: ['FOIA', 'HIPAA_ACCESS', 'EVIDENCE_PRESERVATION', '911_RECORDING'] },
    { name: 'date_sent', label: 'Date Sent', type: 'date', required: true },
    { name: 'deadline_date', label: 'Statutory Deadline', type: 'date' },
    { name: 'status', label: 'Response Status', type: 'select', options: ['sent', 'acknowledged', 'fulfilled', 'stonewalled', 'appealed'] },
    { name: 'tracking_number', label: 'Certified Mail / Tracking #', type: 'text' }
  ],
// ─────────────────────────────────────────────────────────────
// CONTENT (Legal, Help Guides, Personal Story)
// ─────────────────────────────────────────────────────────────
content: [
  { name: 'title', label: 'Article Title', type: 'text', required: true },
  { name: 'slug', label: 'URL Slug', type: 'text', required: true },
  { name: 'post_type', label: 'Category', type: 'select', options: ['Legal Notice', 'Tactical Guide', 'Personal Narrative', 'FOIA Archive'] },
  { name: 'subtitle', label: 'Brief Summary / Hook', type: 'text' },
  { name: 'body', label: 'Full Article Content', type: 'textarea' },
  { name: 'is_featured', label: 'Feature on Home Page', type: 'boolean' },
  { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
]
};