// src/types/index.ts

/**
 * EVIDENCE LOCKER
 * Represents a physical or digital piece of evidence stored in R2/D1.
 */
export interface EvidenceRecord {
  id: number;
  title: string;
  official: string;      // The "Subject" involved (e.g., "pat-mcrae")
  statute: string;       // The Legal Citation (e.g., "mi-foia")
  content: string;       // The textual description or transcript
  r2_key?: string;       // The filename in Cloudflare R2 bucket
  isCritical: number;    // 1 for true, 0 for false (D1 doesn't have Boolean)
  is_public: string;     // The ISO date string of publication (e.g., "2026-03-23")
  category: string;      // High-level grouping (e.g., "Medical", "Municipal")
  created_at: string;    // Database timestamp
}

/**
 * ACCOUNTABILITY PROFILES
 * Represents the "Bad Actor" or "Official" being tracked.
 */
export interface Profile {
  id: number;
  name: string;          // Formal display name
  title: string;         // Professional job title
  officer_name: string;  // The slug/ID used in database queries
  summary?: string;      // Brief background on the subject
}

/**
 * AUTHENTICATION
 * Security state for the /admin dashboard.
 */
export interface AdminSession {
  authenticated: boolean;
  expires: number;       // Unix timestamp
}

/**
 * UI HELPER TYPES
 */
export type SubjectStatus = "active" | "former" | "under_review" | "terminated";

export interface StatusBadgeConfig {
  label: string;
  color: string;
}