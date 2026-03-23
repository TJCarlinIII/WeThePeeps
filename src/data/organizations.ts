// ─────────────────────────────────────────────────────────────────────────────
// CENTRAL DATA STORE: WE THE PEEPS
// ─────────────────────────────────────────────────────────────────────────────

// Removed unused Lucide imports to clear ESLint warnings. 
// The strings in the 'icon' fields below will be mapped to components in the UI.

export type SubjectStatus = "active" | "former" | "under_review" | "terminated";

export interface BadActor {
  id: string;
  name: string;
  title: string;
  department: string;
  status: SubjectStatus;
  summary?: string;
}

export type LawCategory =
  | "constitutional"
  | "federal"
  | "state"
  | "regulation";

export interface LawReference {
  id: string;
  citation: string;
  title: string;
  description: string;
  category: LawCategory;
  penalty?: string;
}

export interface Organization {
  id: string;
  name: string;
  icon: string; // The Lucide icon name string (e.g., "Landmark")
  category: string;
  subjects: BadActor[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGAL REFERENCES
// ─────────────────────────────────────────────────────────────────────────────

export const laws: LawReference[] = [
  // — Constitutional Rights —
  {
    id: "1st-amend",
    citation: "U.S. Const. amend. I",
    title: "First Amendment — Free Speech & Petition",
    description: "Prohibits government from abridging freedom of speech, the press, or the right to petition the government for a redress of grievances. Retaliation for whistleblowing or public advocacy is a First Amendment violation.",
    category: "constitutional",
  },
  {
    id: "4th-amend",
    citation: "U.S. Const. amend. IV",
    title: "Fourth Amendment — Unlawful Search & Seizure",
    description: "Guarantees the right of the people to be secure against unreasonable searches and seizures. Requires probable cause and a warrant for most searches.",
    category: "constitutional",
  },
  {
    id: "14th-amend-dp",
    citation: "U.S. Const. amend. XIV, § 1",
    title: "Fourteenth Amendment — Due Process",
    description: "No state shall deprive any person of life, liberty, or property without due process of law. Protects against arbitrary government action and procedural unfairness.",
    category: "constitutional",
  },
  // — Federal Statutes —
  {
    id: "42-usc-1983",
    citation: "42 U.S.C. § 1983",
    title: "Civil Action for Deprivation of Rights",
    description: "Creates a federal cause of action against any person acting under color of state law who deprives another of constitutional rights.",
    category: "federal",
    penalty: "Compensatory & punitive damages; attorney's fees under § 1988",
  },
  // — Michigan State Laws —
  {
    id: "mi-wpa",
    citation: "MCL 15.361–15.369",
    title: "Michigan Whistleblowers' Protection Act",
    description: "Prohibits employers from retaliating against employees who report suspected violations of law to a public body.",
    category: "state",
    penalty: "Reinstatement; back pay; attorney's fees; civil fine up to $500",
  },
  {
    id: "mi-foia",
    citation: "MCL 15.231–15.246",
    title: "Michigan Freedom of Information Act (FOIA)",
    description: "Requires disclosure of public records upon request. Government bodies must respond within 5 business days.",
    category: "state",
    penalty: "Court-ordered disclosure; attorney's fees; punitive damages up to $1,000",
  },
  // — Regulations & Codes —
  {
    id: "mi-ins-regs",
    citation: "MCL 500.2006",
    title: "Michigan Insurance Code — Unfair Trade Practices",
    description: "Prohibits insurance companies from engaging in unfair or deceptive acts or practices.",
    category: "regulation",
    penalty: "DIFS enforcement; fines; license revocation",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const organizations: Organization[] = [
  {
    id: "redford-township",
    name: "Redford Township",
    icon: "Landmark",
    category: "Local Government",
    subjects: [
      {
        id: "rt-001",
        name: "[Name Pending]",
        title: "Township Supervisor",
        department: "Township Administration",
        status: "under_review",
        summary: "Subject of ongoing FOIA investigation.",
      },
    ],
  },
  {
    id: "corewell-health",
    name: "Corewell Health",
    icon: "Building2",
    category: "Healthcare",
    subjects: [
      {
        id: "cw-001",
        name: "[Name Pending]",
        title: "Administrator",
        department: "Patient Services",
        status: "under_review",
      },
    ],
  },
  {
    id: "mdhhs-aps",
    name: "MDHHS / APS",
    icon: "ShieldAlert",
    category: "State Agency",
    subjects: [
      {
        id: "aps-001",
        name: "[Name Pending]",
        title: "APS Investigator",
        department: "Adult Protective Services",
        status: "under_review",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getOrganization(id: string): Organization | undefined {
  return organizations.find((o) => o.id === id);
}

export function getLawsByCategory(category: LawCategory): LawReference[] {
  return laws.filter((l) => l.category === category);
}

export const statusConfig: Record<SubjectStatus, { label: string; color: string }> = {
  active: { 
    label: "ACTIVE_INVESTIGATION", 
    color: "text-red-500 border-red-900/50 bg-red-950/20" 
  },
  under_review: {
    label: "UNDER_REVIEW",
    color: "text-amber-500 border-amber-900/50 bg-amber-950/20",
  },
  former: {
    label: "ARCHIVED_SUBJECT",
    color: "text-slate-500 border-slate-800 bg-slate-900/50",
  },
  terminated: {
    label: "RESOLVED",
    color: "text-[#4A90E2] border-blue-900/50 bg-blue-950/20",
  },
};