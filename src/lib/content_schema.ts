import { SchemaField } from './constants_dbtype';
import { IncidentStatus, MoralViolationType, TacticCategory } from './shared_dbtype';

export const CONTENT_SCHEMA: Record<string, SchemaField[]> = {
  posts: [
    { name: 'title', label: 'Headline', type: 'text', required: true },
    { name: 'subtitle', label: 'Sub-headline', type: 'text' },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true },
    { name: 'featured_image_url', label: 'Hero Image', type: 'text' },
    { name: 'status', label: 'Post Status', type: 'select', options: ['draft', 'published', 'archived'] },
    { name: 'meta_description', label: 'SEO Description', type: 'textarea' }
  ]
};