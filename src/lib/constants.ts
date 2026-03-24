export type SubjectStatus = "pending" | "completed" | "stonewalled" | "active" | "under_review";

export interface StatusStyle {
  label: string;
  color: string;
  bgColor: string;
}

export const STATUS_CONFIG: Record<string, StatusStyle> = {
  pending: { 
    label: "OPEN_INVESTIGATION", 
    color: "text-amber-500", 
    bgColor: "bg-amber-950/20 border-amber-900/50" 
  },
  stonewalled: { 
    label: "ACCESS_DENIED", 
    color: "text-red-600", 
    bgColor: "bg-red-950/30 border-red-900/80" 
  },
  completed: { 
    label: "ARCHIVED_REPORT", 
    color: "text-[#4A90E2]", 
    bgColor: "bg-blue-950/20 border-blue-900/50" 
  },
  active: {
    label: "ACTIVE_SUBJECT",
    color: "text-white",
    bgColor: "bg-slate-900 border-slate-700"
  }
};

export const LAW_CATEGORIES = [
  { id: "constitutional", label: "Constitutional Law" },
  { id: "federal", label: "Federal Statute" },
  { id: "state", label: "Michigan Compiled Law (MCL)" },
  { id: "regulation", label: "Administrative Code" }
];

export const BRAND = {
  name: "WE THE PEEPS",
  primary: "#4A90E2",
  critical: "#DC2626",
  accent: "#C4A77D",
};