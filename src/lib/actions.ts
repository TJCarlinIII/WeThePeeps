"use server";

import { EvidenceRecord, Profile } from "@/types";

export async function getOfficialProfiles(): Promise<{ success: boolean; data: Profile[] }> {
  try {
    const { results } = await process.env.DB.prepare(
      "SELECT id, name, title, organization, summary FROM official_profiles ORDER BY name ASC"
    ).all<Profile>();   // <-- use generic

    return { success: true, data: results };
  } catch (error) {
    console.error("D1 Fetch Error:", error);
    return { success: false, data: [] };
  }
}

export async function getEvidenceRecords(): Promise<{ success: boolean; data: EvidenceRecord[] }> {
  try {
    const { results } = await process.env.DB.prepare(
      "SELECT id, title, category, description, r2_key, is_public, created_at FROM evidence_records WHERE is_public = 1 ORDER BY created_at DESC"
    ).all<EvidenceRecord>();   // <-- use generic

    return { success: true, data: results };
  } catch (error) {
    console.error("D1 Fetch Error (Evidence):", error);
    return { success: false, data: [] };
  }
}