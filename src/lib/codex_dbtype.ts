import { SubjectStatus } from './shared_dbtype';

export interface Sector {
  id: number;
  name: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at: string;
}

export interface Entity {
  id: number;
  sector_id: number;
  name: string;
  type: 'Federal Agency' | 'Local PD' | 'Hospital' | 'Private Corp';
  slug: string;
  description?: string;
  website?: string;
  image_url?: string;
  created_at: string;
}

export interface Actor {
  id: number;
  entity_id: number;
  name: string;
  job_title?: string;
  status: SubjectStatus;
  slug: string;
  description?: string;
  image_url?: string;
  official_bio_url?: string;
  created_at: string;
}