export interface SchemaField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'relation' | 'date' | 'number';
  placeholder?: string;
  table?: string;
  options?: string[];
  required?: boolean;
}

export const TABLE_SCHEMAS: Record<string, SchemaField[]> = {
  sectors: [
    { name: 'name', label: 'Sector Name', type: 'text', required: true, placeholder: 'e.g. Healthcare, Law Enforcement' },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true, placeholder: 'law-enforcement' }
  ],
  entities: [
    { name: 'name', label: 'Organization Name', type: 'text', required: true, placeholder: 'e.g. Redford Township' },
    { name: 'sector_id', label: 'Sector', type: 'relation', table: 'sectors' },
    { name: 'description', label: 'Entity Summary', type: 'textarea' },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true, placeholder: 'redford-township' }
  ],
  actors: [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true },
    { name: 'entity_id', label: 'Affiliated Entity', type: 'relation', table: 'entities' },
    { name: 'job_title', label: 'Official Title', type: 'text' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['active', 'under_review', 'former'] },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'bio', label: 'Biography', type: 'textarea' }
  ],
  statutes: [
    { name: 'citation', label: 'Statute Citation', type: 'text' },
    { name: 'title', label: 'Statute Title', type: 'text' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' }
  ],
  incidents: [
    { name: 'title', label: 'Incident Heading', type: 'text', required: true },
    { name: 'description', label: 'Incident Narrative', type: 'textarea', required: true },
    { name: 'actor_id', label: 'Primary Actor', type: 'relation', table: 'actors' },
    { name: 'entity_id', label: 'Involved Entity', type: 'relation', table: 'entities' },
    { name: 'statute_id', label: 'Relevant Statute', type: 'relation', table: 'statutes' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['pending', 'verified', 'archived'] },
    { name: 'is_critical', label: 'Flag Critical?', type: 'select', options: ['0', '1'] },
    { name: 'event_date', label: 'Date of Occurrence', type: 'date' }
  ],
  posts: [
    { name: 'title', label: 'Post Title', type: 'text', required: true },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Personal Story', 'How-To', 'Update', 'Legal Analysis'] },
    { name: 'summary', label: 'Short Summary', type: 'textarea' },
    { name: 'content', label: 'Main Content (Markdown)', type: 'textarea' },
    { name: 'is_featured', label: 'Feature on Homepage?', type: 'select', options: ['0', '1'] }
  ],
  media: [
    { name: 'file_path', label: 'File Path', type: 'text', required: true },
    { name: 'alt_text', label: 'Alt Text', type: 'text' },
    { name: 'incident_id', label: 'Associated Incident', type: 'relation', table: 'incidents' },
    { name: 'is_redacted', label: 'Is Redacted?', type: 'select', options: ['0', '1'] }
  ]
};