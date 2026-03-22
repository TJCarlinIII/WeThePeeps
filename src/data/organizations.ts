// src/data/organizations.ts
// ─────────────────────────────────────────────────────────────────────────────
// Central data store for all organizations, subjects (bad actors), and
// applicable laws. This file is intentionally static so it deploys easily on
// Cloudflare Workers/Pages. When you're ready to connect to D1, replace the
// exports with async fetch functions that query your database.
// ─────────────────────────────────────────────────────────────────────────────

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
  icon: string; // lucide icon name
  category: string;
  subjects: BadActor[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGAL REFERENCES
// Add / update these as you document specific violations
// ─────────────────────────────────────────────────────────────────────────────

export const laws: LawReference[] = [
  // — Constitutional Rights —
  {
    id: "1st-amend",
    citation: "U.S. Const. amend. I",
    title: "First Amendment — Free Speech & Petition",
    description:
      "Prohibits government from abridging freedom of speech, the press, or the right to petition the government for a redress of grievances. Retaliation for whistleblowing or public advocacy is a First Amendment violation.",
    category: "constitutional",
  },
  {
    id: "4th-amend",
    citation: "U.S. Const. amend. IV",
    title: "Fourth Amendment — Unlawful Search & Seizure",
    description:
      "Guarantees the right of the people to be secure against unreasonable searches and seizures. Requires probable cause and a warrant for most searches.",
    category: "constitutional",
  },
  {
    id: "14th-amend-dp",
    citation: "U.S. Const. amend. XIV, § 1",
    title: "Fourteenth Amendment — Due Process",
    description:
      "No state shall deprive any person of life, liberty, or property without due process of law. Protects against arbitrary government action and procedural unfairness.",
    category: "constitutional",
  },
  {
    id: "14th-amend-ep",
    citation: "U.S. Const. amend. XIV, § 1",
    title: "Fourteenth Amendment — Equal Protection",
    description:
      "Prohibits states from denying any person within their jurisdiction equal protection of the laws. Bars discriminatory enforcement and targeting.",
    category: "constitutional",
  },
  // — Federal Statutes —
  {
    id: "42-usc-1983",
    citation: "42 U.S.C. § 1983",
    title: "Civil Action for Deprivation of Rights",
    description:
      "Creates a federal cause of action against any person acting under color of state law who deprives another of constitutional rights. Primary vehicle for civil rights lawsuits against government employees.",
    category: "federal",
    penalty: "Compensatory & punitive damages; attorney's fees under § 1988",
  },
  {
    id: "42-usc-1985",
    citation: "42 U.S.C. § 1985",
    title: "Conspiracy to Interfere with Civil Rights",
    description:
      "Prohibits conspiracies by two or more persons to deprive any person or class of persons of equal protection of the laws or equal privileges.",
    category: "federal",
    penalty: "Civil damages; potential criminal referral",
  },
  {
    id: "ada",
    citation: "42 U.S.C. § 12101 et seq.",
    title: "Americans with Disabilities Act (ADA)",
    description:
      "Prohibits discrimination against individuals with disabilities in all areas of public life. Title II covers state and local government programs and services.",
    category: "federal",
    penalty: "Civil damages; injunctive relief; DOJ enforcement",
  },
  {
    id: "hipaa",
    citation: "45 C.F.R. Parts 160 & 164",
    title: "HIPAA Privacy & Security Rules",
    description:
      "Protects individuals' medical records and other personal health information. Healthcare entities and their business associates must safeguard PHI.",
    category: "federal",
    penalty: "$100–$50,000 per violation; criminal referral for willful violations",
  },
  {
    id: "fca",
    citation: "31 U.S.C. § 3729",
    title: "False Claims Act",
    description:
      "Imposes liability on individuals and companies who defraud governmental programs. Qui tam provisions allow private citizens to file suit on behalf of the government.",
    category: "federal",
    penalty: "Treble damages plus $13,000–$26,000 per false claim",
  },
  // — Michigan State Laws —
  {
    id: "mi-wpa",
    citation: "MCL 15.361–15.369",
    title: "Michigan Whistleblowers' Protection Act",
    description:
      "Prohibits employers from retaliating against employees who report suspected violations of law to a public body. Covers public and private sector employers.",
    category: "state",
    penalty: "Reinstatement; back pay; attorney's fees; civil fine up to $500",
  },
  {
    id: "mi-foia",
    citation: "MCL 15.231–15.246",
    title: "Michigan Freedom of Information Act (FOIA)",
    description:
      "Requires disclosure of public records upon request. Government bodies must respond within 5 business days. Unjustified denials can be challenged in circuit court.",
    category: "state",
    penalty:
      "Court-ordered disclosure; attorney's fees; punitive damages up to $1,000 for arbitrary refusal",
  },
  {
    id: "elcra",
    citation: "MCL 37.2101 et seq.",
    title: "Elliott-Larsen Civil Rights Act",
    description:
      "Michigan's comprehensive anti-discrimination law covering employment, housing, and public accommodation. Prohibits discrimination based on religion, race, color, national origin, age, sex, height, weight, familial status, or marital status.",
    category: "state",
    penalty: "Civil damages; injunctive relief; MDCR enforcement",
  },
  {
    id: "mi-apa",
    citation: "MCL 24.201 et seq.",
    title: "Michigan Administrative Procedures Act",
    description:
      "Governs the procedures state agencies must follow when making rules and conducting hearings. Violations of required procedures can invalidate agency action.",
    category: "state",
  },
  {
    id: "mi-open-meetings",
    citation: "MCL 15.261–15.275",
    title: "Michigan Open Meetings Act",
    description:
      "Requires all meetings of public bodies to be open to the public. Secret meetings, improper closed sessions, and decisions made outside of public meeting are violations.",
    category: "state",
    penalty:
      "Actions taken in violation are voidable; civil fines; criminal misdemeanor",
  },
  // — Regulations & Codes —
  {
    id: "mi-ins-regs",
    citation: "MCL 500.2006",
    title: "Michigan Insurance Code — Unfair Trade Practices",
    description:
      "Prohibits insurance companies from engaging in unfair or deceptive acts or practices. Includes wrongful claim denials, misrepresentation, and failure to act promptly.",
    category: "regulation",
    penalty: "DIFS enforcement; fines; license revocation",
  },
  {
    id: "mi-adult-protect",
    citation: "MCL 400.11 et seq.",
    title: "Michigan Adult Protective Services Act",
    description:
      "Requires mandatory reporting of abuse, neglect, or exploitation of vulnerable adults. APS must investigate reports and take protective action.",
    category: "regulation",
    penalty:
      "Failure to report is a misdemeanor; civil liability for negligent investigation",
  },
  {
    id: "lara-licensing",
    citation: "MCL 333.20101 et seq.",
    title: "Michigan Public Health Code — Licensing",
    description:
      "LARA regulates health facilities, professionals, and services. Providers must meet standards of care. Complaints are investigated and can result in license action.",
    category: "regulation",
    penalty: "License suspension/revocation; civil fines; criminal referral",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATIONS
// Subjects (bad actors) are placeholders — add names as you document them.
// Status options: "active" | "former" | "under_review" | "terminated"
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
    id: "priority-health",
    name: "Priority Health",
    icon: "HeartPulse",
    category: "Insurance",
    subjects: [
      {
        id: "ph-001",
        name: "[Name Pending]",
        title: "Claims Director",
        department: "Claims Management",
        status: "under_review",
      },
    ],
  },
  {
    id: "henry-ford-health",
    name: "Henry Ford Health",
    icon: "Building2",
    category: "Healthcare",
    subjects: [
      {
        id: "hfh-001",
        name: "[Name Pending]",
        title: "Administrator",
        department: "Administration",
        status: "under_review",
      },
    ],
  },
  {
    id: "tandem-365",
    name: "Tandem 365",
    icon: "Users",
    category: "Social Services",
    subjects: [
      {
        id: "t365-001",
        name: "[Name Pending]",
        title: "Case Manager",
        department: "Case Management",
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
  {
    id: "lara",
    name: "LARA",
    icon: "Scale",
    category: "State Agency",
    subjects: [
      {
        id: "lara-001",
        name: "[Name Pending]",
        title: "Licensing Analyst",
        department: "Bureau of Professional Licensing",
        status: "under_review",
      },
    ],
  },
  {
    id: "attorney-general",
    name: "Attorney General",
    icon: "Gavel",
    category: "State Office",
    subjects: [
      {
        id: "ag-001",
        name: "[Name Pending]",
        title: "Assistant AG",
        department: "Consumer Protection Division",
        status: "under_review",
      },
    ],
  },
  {
    id: "governor",
    name: "Governor's Office",
    icon: "Star",
    category: "State Office",
    subjects: [
      {
        id: "gov-001",
        name: "[Name Pending]",
        title: "Policy Director",
        department: "Executive Office",
        status: "under_review",
      },
    ],
  },
];

// Helper: get org by ID
export function getOrganization(id: string): Organization | undefined {
  return organizations.find((o) => o.id === id);
}

// Helper: group laws by category
export function getLawsByCategory(
  category: LawCategory
): LawReference[] {
  return laws.filter((l) => l.category === category);
}

// Status badge styles
export const statusConfig: Record<
  SubjectStatus,
  { label: string; color: string }
> = {
  active: { label: "Active", color: "text-red-400 border-red-400/30 bg-red-400/10" },
  under_review: {
    label: "Under Review",
    color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  },
  former: {
    label: "Former",
    color: "text-slate-400 border-slate-400/30 bg-slate-400/10",
  },
  terminated: {
    label: "Terminated",
    color: "text-green-400 border-green-400/30 bg-green-400/10",
  },
};