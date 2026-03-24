export const TABLE_SCHEMAS = {
  sectors: [
    { name: 'name', label: 'Sector Name', type: 'text', placeholder: 'e.g. Healthcare, Law Enforcement' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'law-enforcement' }
  ],
  entities: [
    { name: 'name', label: 'Organization Name', type: 'text', placeholder: 'e.g. Redford Township' },
    { name: 'sector_id', label: 'Sector', type: 'relation', table: 'sectors' },
    { name: 'description', label: 'Entity Summary', type: 'textarea' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'redford-township' }
  ],
  actors: [
    { name: 'full_name', label: 'Full Name', type: 'text' },
    { name: 'entity_id', label: 'Affiliated Entity', type: 'relation', table: 'entities' },
    { name: 'job_title', label: 'Official Title', type: 'text' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['active', 'under_review', 'former'] },
    { name: 'slug', label: 'URL Slug', type: 'text' }
  ],
  statutes: [
    { name: 'citation', label: 'Legal Citation', type: 'text', placeholder: 'MCL 15.231' },
    { name: 'title', label: 'Statute Title', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: ['constitutional', 'federal', 'state', 'regulation'] },
    { name: 'description', label: 'Full Definition', type: 'textarea' }
  ],
  incidents: [
    { name: 'title', label: 'Incident Title', type: 'text' },
    { name: 'entity_id', label: 'Involved Entity', type: 'relation', table: 'entities' },
    { name: 'actor_id', label: 'Primary Actor', type: 'relation', table: 'actors' },
    { name: 'statute_id', label: 'Relevant Statute', type: 'relation', table: 'statutes' },
    { name: 'event_date', label: 'Date of Occurrence', type: 'date' },
    { name: 'description', label: 'Incident Narrative', type: 'textarea' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['pending', 'completed', 'stonewalled'] },
    { name: 'is_critical', label: 'High Priority?', type: 'select', options: ['0', '1'] }
  ],
  media: [
    { name: 'file_path', label: 'File URL (SEO Name)', type: 'text', placeholder: 'evidence-01.jpg' },
    { name: 'alt_text', label: 'SEO Alt Text', type: 'text' },
    { name: 'incident_id', label: 'Link to Incident', type: 'relation', table: 'incidents' },
    { name: 'is_redacted', label: 'Redaction Status', type: 'select', options: ['Yes', 'No'] }
  ],
  posts: [
    { name: 'title', label: 'Post Title', type: 'text' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'my-story-title' },
    { name: 'category', label: 'Category', type: 'select', options: ['Personal Story', 'How-To', 'Update', 'Legal Analysis'] },
    { name: 'summary', label: 'Short Summary', type: 'textarea' },
    { name: 'content', label: 'Main Content (Markdown)', type: 'textarea' },
    { name: 'is_featured', label: 'Feature on Homepage?', type: 'select', options: ['0', '1'] }
  ]
};