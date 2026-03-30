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
  // SECTORS
  // ─────────────────────────────────────────────────────────────
  sectors: [
    { name: 'name', label: 'Sector Name', type: 'text', required: true, placeholder: 'e.g. Healthcare, Law Enforcement' },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true, placeholder: 'law-enforcement' },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES (with Behavioral & Legal Protocol Flags)
  // ─────────────────────────────────────────────────────────────
  entities: [
    { name: 'name', label: 'Organization Name', type: 'text', required: true, placeholder: 'e.g. Redford Township' },
    { name: 'sector_id', label: 'Sector', type: 'relation', table: 'sectors', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true, placeholder: 'redford-township' },
    { name: 'parent_entity_id', label: 'Parent Organization', type: 'relation', table: 'entities' },
    { name: 'address', label: 'Street Address', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'zip_code', label: 'Zip Code', type: 'text' },
    { name: 'phone', label: 'Phone Number', type: 'text' },
    { name: 'official_website_url', label: 'Official Website', type: 'text' },
    
    // ✅ NEW: Behavioral & Legal Protocol Flags (type: 'boolean')
    { name: 'is_foia_target', label: 'Enable FOIA Generator', type: 'boolean' },
    { name: 'is_medical_target', label: 'Enable Medical Demand', type: 'boolean' },
    { name: 'history_of_falsification', label: 'History of Falsification (Liar Clause)', type: 'boolean' },
    { name: 'history_of_withholding', label: 'History of Withholding (Haunting Clause)', type: 'boolean' },
    { name: 'statutory_delayer', label: 'Statutory Delayer (5-Day Warning)', type: 'boolean' },

    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ─────────────────────────────────────────────────────────────
  // ACTORS
  // ─────────────────────────────────────────────────────────────
  actors: [
    { name: 'sector_id', label: 'Step 1: Filter by Sector', type: 'relation', table: 'sectors' },
    { name: 'entity_id', label: 'Step 2: Affiliated Entity', type: 'relation', table: 'entities', dependsOn: 'sector_id', required: true },
    { name: 'full_name', label: 'Full Name', type: 'text', required: true },
    { name: 'job_title', label: 'Official Title', type: 'text' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['active', 'under_review', 'former'] },
    { name: 'is_under_inquiry', label: 'Under Congressional Inquiry?', type: 'select', options: ['0', '1'] },
    { name: 'liability_count', label: 'Liability Count', type: 'number' },
    { name: 'cdn_image_url', label: 'GitHub Evidence (AVIF) URL', type: 'text', placeholder: 'https://raw.githubusercontent.com/...' },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'bio', label: 'Biography', type: 'textarea' },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ─────────────────────────────────────────────────────────────
  // STATUTES
  // ─────────────────────────────────────────────────────────────
  statutes: [
    { name: 'citation', label: 'Statute Citation', type: 'text', required: true },
    { name: 'title', label: 'Statute Title', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'jurisdiction', label: 'Jurisdiction Level', type: 'select', options: ['Federal', 'State', 'Local'] },
    { name: 'jurisdiction_body', label: 'Governing Body', type: 'text', placeholder: 'Michigan / Redford' },
    { name: 'summary', label: 'Executive Summary', type: 'textarea' },
    { name: 'legal_text', label: 'Full Legal Text', type: 'textarea' },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ─────────────────────────────────────────────────────────────
  // TAXONOMY DEFINITIONS
  // ─────────────────────────────────────────────────────────────
  taxonomy_definitions: [
    { name: 'name', label: 'Term Name', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'type', label: 'Classification', type: 'select', options: ['category', 'tag', 'statute'], required: true },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ─────────────────────────────────────────────────────────────
  // INCIDENTS
  // ─────────────────────────────────────────────────────────────
  incidents: [
    { name: 'title', label: 'Incident Heading', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'description', label: 'Incident Narrative', type: 'textarea', required: true },
    { name: 'event_date', label: 'Date of Occurrence', type: 'date', required: true },
    { name: 'sector_id', label: 'Filter by Sector', type: 'relation', table: 'sectors' },
    { name: 'entity_id', label: 'Involved Entity', type: 'relation', table: 'entities', dependsOn: 'sector_id' },
    { name: 'actor_id', label: 'Primary Actor', type: 'relation', table: 'actors', dependsOn: 'entity_id' },
    { name: 'statute_id', label: 'Relevant Statute', type: 'relation', table: 'statutes' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['pending', 'verified', 'archived'] },
    { name: 'is_critical', label: 'Flag Critical?', type: 'select', options: ['0', '1'] },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ],

  // ─────────────────────────────────────────────────────────────
  // REBUTTALS
  // ─────────────────────────────────────────────────────────────
  rebuttals: [
    { name: 'actor_id', label: 'Step 1: Select Individual', type: 'relation', table: 'actors', required: true },
    { name: 'falsified_claim', label: 'Falsified Claim (The "Lie")', type: 'textarea', required: true, placeholder: 'patient is neurologically intact' },
    { name: 'clinical_fact', label: 'Clinical Fact (The "Lab")', type: 'textarea', required: true, placeholder: 'U of M confirms Hearing Loss' },
    { name: 'evidence_id', label: 'Master Evidence Document', type: 'relation', table: 'media' }, // ✅ Added so the UI can map it to media
    { name: 'evidence_url', label: 'External Fallback URL', type: 'text' },
    { name: 'incident_id', label: 'Associated Incident (Optional)', type: 'relation', table: 'incidents' }
  ],

  // ─────────────────────────────────────────────────────────────
  // CASES
  // ─────────────────────────────────────────────────────────────
  cases: [
    { name: 'name', label: 'Case Name', type: 'text', required: true, placeholder: 'e.g. AG Civil Rights Complaint' },
    { name: 'case_number', label: 'Reference #', type: 'text', required: true, placeholder: 'e.g. 230019685' },
    { name: 'status', label: 'Legal Status', type: 'select', options: ['active', 'closed', 'under_review'] }
  ],

  // ─────────────────────────────────────────────────────────────
  // MEDIA
  // ─────────────────────────────────────────────────────────────
  media: [
    { name: 'file_name', label: 'Asset Name', type: 'text', required: true },
    { name: 'file_type', label: 'MIME Type', type: 'text', placeholder: 'image/png, application/pdf' },
    { name: 'url', label: 'Storage URL', type: 'text', required: true },
    { name: 'incident_id', label: 'Link to Incident', type: 'relation', table: 'incidents' },
    { name: 'is_redacted', label: 'Is Redacted?', type: 'select', options: ['0', '1'] }
  ],

  // ─────────────────────────────────────────────────────────────
  // POSTS
  // ─────────────────────────────────────────────────────────────
  posts: [
    { name: 'title', label: 'Post Title', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Personal Story', 'How-To', 'Update', 'Legal Analysis'] },
    { name: 'summary', label: 'Short Summary', type: 'textarea' },
    { name: 'content', label: 'Main Content (Markdown)', type: 'textarea' },
    { name: 'is_featured', label: 'Feature on Homepage?', type: 'select', options: ['0', '1'] },
    { name: 'status', label: 'Publish Status', type: 'select', options: ['draft', 'published'] },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { name: 'seo_keywords', label: 'SEO Keywords', type: 'text' }
  ]
};