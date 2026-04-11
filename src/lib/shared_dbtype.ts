/**
 * Shared status and classification values
 * This master list supports both the legacy site and the new v2 architecture.
 */

export type SubjectStatus = 
  | "pending" 
  | "stonewalled" 
  | "completed" 
  | "verified" 
  | "active" 
  | "under_review" 
  | "former" 
  | "deceased";

export type IncidentStatus = 
  | "pending" 
  | "verified" 
  | "archived" 
  | "stonewalled";

export type MoralViolationType =
  | "not-kill"           // Medical Negligence
  | "false-witness"      // Falsified Records
  | "not-steal"          // Financial Exploitation
  | "not-covet"          // Profit-Over-Patient
  | "honor-parents"      // Elder/Vulnerable Abuse
  | "denial-of-due-process"
  | null;

export type TacticCategory =
  | "coordinated-withdrawal"
  | "forced-proxying"
  | "document-falsification"
  | "gaslighting"
  | "information-siloing"
  | "proxy-takeover"
  | "stonewall"
  | null;