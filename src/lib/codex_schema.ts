import { SchemaField } from './constants_dbtype';
import { IncidentStatus, MoralViolationType, TacticCategory } from './shared_dbtype';

export const CODEX_SCHEMA: Record<string, SchemaField[]> = {
  sectors: [
    { name: 'name', label: 'Sector Name', type: 'text', required: true, placeholder: 'e.g., Government' },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' }
  ],
  entities: [
    { name: 'name', label: 'Organization Name', type: 'text', required: true },
    { name: 'sector_id', label: 'Parent Sector', type: 'relation', table: 'sectors', required: true },
    { name: 'type', label: 'Entity Type', type: 'select', options: ['Federal Agency', 'Local PD', 'Hospital', 'Private Corp'] },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true }
  ],
  actors: [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'entity_id', label: 'Primary Entity', type: 'relation', table: 'entities', required: true },
    { name: 'job_title', label: 'Official Title', type: 'text' },
    { name: 'status', label: 'Current Status', type: 'select', options: ['active', 'removed', 'under_review'] },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true }
  ]
};