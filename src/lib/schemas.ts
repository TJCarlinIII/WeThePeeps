export const TABLE_SCHEMAS = {
  entities: [
    { name: 'name', label: 'Organization Name', type: 'text', placeholder: 'e.g. Redford Township' },
    { name: 'org_type', label: 'Sector', type: 'select', options: ['Medical', 'Government', 'Legal', 'Utility'] },
    { name: 'description', label: 'Entity Summary', type: 'textarea' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'redford-township' }
  ],
  actors: [
    { name: 'full_name', label: 'Full Name', type: 'text' },
    { name: 'entity_id', label: 'Affiliated Entity', type: 'relation', table: 'entities' },
    { name: 'job_title', label: 'Official Title', type: 'text' },
    { name: 'slug', label: 'URL Slug', type: 'text' }
  ],
  incidents: [
    { name: 'title', label: 'Incident Title', type: 'text' },
    { name: 'entity_id', label: 'Involved Entity', type: 'relation', table: 'entities' },
    { name: 'actor_id', label: 'Primary Actor', type: 'relation', table: 'actors' },
    { name: 'event_date', label: 'Date of Occurrence', type: 'date' },
    { name: 'description', label: 'Incident Narrative', type: 'textarea' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['pending', 'completed', 'stonewalled'] }
  ],
  media: [
    { name: 'file_path', label: 'File URL (SEO Name)', type: 'text', placeholder: 'evidence-01.jpg' },
    { name: 'alt_text', label: 'SEO Alt Text', type: 'text' },
    { name: 'incident_id', label: 'Link to Incident', type: 'relation', table: 'incidents' },
    { name: 'is_redacted', label: 'Redaction Status', type: 'select', options: ['Yes', 'No'] }
  ]
};