// src/lib/foia/templates.ts

export interface TemplateSnippet {
  id: string;
  label: string;
  category: 'medical' | 'foia' | 'policy' | 'incident' | 'staff' | 'billing';
  template: (formData: any) => string;
}

export interface RecordCategory {
  id: string;
  label: string;
  description: string;
  template: string;
  color?: 'blue' | 'red' | 'emerald' | 'orange' | 'yellow';
}

// ✅ Record categories with legally precise language (based on your Tandem 365 demand)
export const RECORD_CATEGORIES: RecordCategory[] = [
  {
    id: 'clinical',
    label: 'Clinical Records',
    description: 'Progress notes, care plans, assessments, treatment logs',
    color: 'blue',
    template: `• Complete clinical records: progress notes, visit summaries, care plans, assessments, treatment protocols, and discharge documentation from [START DATE] to [END DATE].`
  },
  {
    id: 'diagnostic',
    label: 'Diagnostic & Testing',
    description: 'Lab results, imaging, EKGs, neurological tests',
    color: 'emerald',
    template: `• Diagnostic records: all laboratory results, imaging studies (X-ray, CT, MRI, ultrasound), electrocardiograms, neurological testing, pulmonary function tests, and specialist consultation reports.`
  },
  {
    id: 'medications',
    label: 'Medication Records',
    description: 'Prescriptions, pharmacy logs, prior authorizations',
    color: 'yellow',
    template: `• Medication records: prescription histories, medication administration records, pharmacy dispensing logs, and prior authorization documentation.`
  },
  {
    id: 'billing',
    label: 'Billing & Claims',
    description: 'Itemized statements, insurance claims, denials',
    color: 'orange',
    template: `• Billing and claims: itemized statements, CPT/ICD code assignments, insurance claim submissions, denial letters, and appeal correspondence.`
  },
  {
    id: 'communications',
    label: 'Internal Communications',
    description: 'Emails, memos, meeting notes about the case',
    color: 'blue',
    template: `• Communications: all internal emails, memos, meeting notes, and inter-departmental communications referencing the patient's care, complaints, or case management.`
  },
  {
    id: 'staff',
    label: 'Staff Identification',
    description: 'Names, licenses, titles of involved personnel',
    color: 'red',
    template: `• Staff identification: full names, professional licenses (with license numbers), job titles, and supervisory chains for all clinicians, administrators, and support staff involved in the patient's care.`
  },
  {
    id: 'incidents',
    label: 'Incident & Complaint Files',
    description: 'Abuse reports, investigations, APS/law enforcement comms',
    color: 'red',
    template: `• Incident documentation: all records related to reported adverse events, complaints of neglect or abuse, internal investigations, and mandatory reporter filings (including APS, law enforcement, or licensing board communications).`
  },
  {
    id: 'policies',
    label: 'Policies & Protocols',
    description: 'Institutional guidelines cited in care decisions',
    color: 'yellow',
    template: `• Policy references: all institutional policies, protocols, or guidelines cited in the patient's care decisions, especially regarding record retention, complaint response, or patient containment.`
  },
  {
    id: 'law_enforcement',
    label: 'Law Enforcement Records',
    description: 'Police reports, incident logs, officer communications',
    color: 'red',
    template: `• Law enforcement records: all police reports, incident logs, officer notes, dispatch records, and communications between [AGENCY] and law enforcement regarding the patient or related incidents.`
  },
  {
    id: 'aps',
    label: 'Adult Protective Services',
    description: 'APS reports, case notes, worker communications',
    color: 'orange',
    template: `• Adult Protective Services records: all APS case files, worker notes, investigation reports, and communications between [AGENCY] and APS employees regarding the patient.`
  }
];

// ✅ Medical Records Full Demand (based on your Tandem 365 document)
export const MEDICAL_RECORDS_FULL_DEMAND = (formData: any) => `All medical records, clinical documentation, and administrative files pertaining to patient ${formData.userName || "[PATIENT NAME]"}, including but not limited to:

• Complete clinical records: progress notes, visit summaries, care plans, assessments, treatment protocols, and discharge documentation from [START DATE] to [END DATE].

• Diagnostic records: all laboratory results, imaging studies (X-ray, CT, MRI, ultrasound), electrocardiograms, neurological testing, pulmonary function tests, and specialist consultation reports.

• Medication records: prescription histories, medication administration records, pharmacy dispensing logs, and prior authorization documentation.

• Billing and claims: itemized statements, CPT/ICD code assignments, insurance claim submissions, denial letters, and appeal correspondence.

• Communications: all internal emails, memos, meeting notes, and inter-departmental communications referencing the patient's care, complaints, or case management.

• Staff identification: full names, professional licenses (with license numbers), job titles, and supervisory chains for all clinicians, administrators, and support staff involved in the patient's care.

• Incident documentation: all records related to reported adverse events, complaints of neglect or abuse, internal investigations, and mandatory reporter filings (including APS, law enforcement, or licensing board communications).

• Policy references: all institutional policies, protocols, or guidelines cited in the patient's care decisions, especially regarding record retention, complaint response, or patient containment.

This request is made pursuant to HIPAA (45 CFR § 164.524), Michigan's Patient Right to Access statute (MCL 333.26261), and the Michigan Freedom of Information Act (MCL 15.231 et seq.). Production of these records is required within 30 days under HIPAA and 5 business days under FOIA for public entities.`;

// ✅ Helper: Replace date placeholders with actual values or "all records" language
export function applyDateRange(template: string, startDate: string, endDate: string, allRecords: boolean): string {
  if (allRecords) {
    return template
      .replace(/\[START DATE\]/g, 'the earliest available date')
      .replace(/\[END DATE\]/g, 'the present date');
  }
  
  const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the earliest available date';
  const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the present date';
  
  return template
    .replace(/\[START DATE\]/g, start)
    .replace(/\[END DATE\]/g, end);
}

// ✅ Main FOIA Template Generator
export function generateFOIATemplate(
  formData: {
    userName: string;
    userAddress: string;
    userPhone: string;
    userEmail: string;
    agencyName: string;
    caseReference: string;
    recordsDescription: string;
    isIndigent: boolean;
    startDate?: string;
    endDate?: string;
    allRecords?: boolean;
  },
  selectedCategories: string[]
): string {
  const {
    userName,
    userAddress,
    userPhone,
    userEmail,
    agencyName,
    caseReference,
    recordsDescription,
    isIndigent,
    startDate,
    endDate,
    allRecords = false
  } = formData;

  // ✅ Only add case reference line if provided
  const caseRefLine = caseReference?.trim()
    ? `\n\nCASE REFERENCE: ${caseReference}`
    : "";

  // ✅ Auto-generate today's date
  const requestDate = new Date().toLocaleDateString();

  // Build selected category templates with date replacement
  const categoryText = selectedCategories
    .map(catId => {
      const cat = RECORD_CATEGORIES.find(c => c.id === catId);
      if (!cat) return '';
      // ✅ Apply date range logic to each category template
      return applyDateRange(cat.template, startDate || '', endDate || '', allRecords);
    })
    .filter(Boolean)
    .join('\n\n');

  // Combine custom description + categories
  const fullRecordsSection = [
    recordsDescription.trim(),
    categoryText
  ].filter(Boolean).join('\n\n');

  // Indigent clause
  const indigentClause = isIndigent
    ? `\n\nI am also requesting a fee waiver as an indigent person under MCL 15.234(2)(a). I am currently receiving public assistance or am able to provide facts showing inability to pay due to financial indigence.`
    : "";

  return `
${userName}
${userAddress}
${userPhone ? userPhone + '\n' : ''}${userEmail ? userEmail + '\n' : ''}
${requestDate}

RE: Freedom of Information Act Request${caseRefLine}

To the FOIA Coordinator of ${agencyName}:

Under the Michigan Freedom of Information Act, Public Act 442 of 1976, MCL 15.231, et seq., I am writing to request a copy of the following public records:

${fullRecordsSection || "[No record categories selected. Please check at least one category above.]"}${indigentClause}

If there are any fees for searching or copying these records, please inform me if the cost will exceed $20.00. I expect a response within five (5) business days, as required by the Act.

If you deny any or all of this request, please cite each specific exemption under MCL 15.243 and notify me of appeal procedures under MCL 15.240.

Sincerely,

${userName}

__________________________
Signature of Requester

Date: _______________
`.trim();
}