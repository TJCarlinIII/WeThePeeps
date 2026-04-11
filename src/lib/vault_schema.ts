import { SchemaField } from './constants_dbtype';
import { IncidentStatus, MoralViolationType, TacticCategory } from './shared_dbtype';

export const VAULT_SCHEMA: Record<string, SchemaField[]> = {
  evidence: [
    { name: 'wtp_id', label: 'WTP ID', type: 'text', required: true, placeholder: 'WTP-EV-XXXX' },
    { name: 'title', label: 'Document Title', type: 'text', required: true },
    { name: 'description', label: 'Detailed Summary', type: 'textarea' },
    { name: 'avif_url', label: 'Image URL (jsDelivr)', type: 'text', required: true },
    { name: 'security_level', label: 'Access Level', type: 'select', options: ['public', 'private', 'internal'] },
    { name: 'source_date', label: 'Document Date', type: 'date' }
  ],
  rebuttals: [
    { name: 'evidence_id', label: 'Source Evidence', type: 'relation', table: 'evidence', required: true },
    { name: 'claim_rebutted', label: 'The Claim Being Rebutted', type: 'textarea', required: true },
    { name: 'rebuttal_summary', label: 'Explanation of Proof', type: 'textarea', required: true }
  ]
};