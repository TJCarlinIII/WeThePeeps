import { IncidentStatus, MoralViolationType, TacticCategory } from './shared_dbtype';

import { SchemaField } from './constants_dbtype';

export const RECORDS_SCHEMA: Record<string, SchemaField[]> = {
  incidents: [
    { name: 'title', label: 'Incident Title', type: 'text', required: true },
    { name: 'incident_date', label: 'Date of Occurrence', type: 'date' },
    { name: 'description', label: 'Full Narrative', type: 'textarea' },
    { name: 'status', label: 'Investigation Status', type: 'select', options: ['pending', 'active', 'stonewalled', 'completed'] },
    { name: 'slug', label: 'URL Slug', type: 'text', required: true }
  ],
  incident_evidence: [
    { name: 'incident_id', label: 'Target Incident', type: 'relation', table: 'incidents', required: true },
    { name: 'evidence_id', label: 'Evidence to Attach', type: 'relation', table: 'evidence', required: true },
    { name: 'is_rebuttal', label: 'Mark as Rebuttal?', type: 'boolean' }
  ],
  demands: [
    { name: 'title', label: 'Demand Subject', type: 'text', required: true },
    { name: 'entity_id', label: 'Target Organization', type: 'relation', table: 'entities', required: true },
    { name: 'type', label: 'Request Type', type: 'select', options: ['FOIA', 'HIPAA', '911_RECORDING'] },
    { name: 'status', label: 'Fulfillment Status', type: 'select', options: ['sent', 'acknowledged', 'stonewalled', 'fulfilled'] }
  ]
};