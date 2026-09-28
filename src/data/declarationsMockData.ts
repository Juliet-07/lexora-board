// Dummy data for the Declarations page (mirrors the prototype's pg-declarations).

export type DeclarationStatus = "overdue" | "current" | "archived";

export interface DeclarationKpi {
  id: string;
  label: string;
  status: DeclarationStatus;
  detail: string;
}

export const declarationKpis: DeclarationKpi[] = [
  { id: "coi", label: "Conflict of Interest declaration", status: "overdue", detail: "Was due 31 Jan 2026" },
  { id: "register", label: "Register of interests", status: "current", detail: "Updated 15 Jan 2026" },
  { id: "fitproper", label: "Fit & Proper declaration", status: "current", detail: "Submitted 20 Jan 2026" },
];

export interface InterestRow {
  category: string;
  details: string;
  declared: string;
}

export const registerOfInterests: InterestRow[] = [
  { category: "Other directorships", details: "None", declared: "15 Jan 2026" },
  { category: "Shareholdings", details: "None declared", declared: "15 Jan 2026" },
  { category: "Professional memberships", details: "ICPAR, ACCA", declared: "15 Jan 2026" },
  { category: "Family interests", details: "None declared", declared: "15 Jan 2026" },
];

export type HistoryStatus = "overdue" | "current" | "archived";

export interface DeclarationHistoryRow {
  id: string;
  type: string;
  period: string;
  submitted: string;
  status: HistoryStatus;
}

export const declarationHistory: DeclarationHistoryRow[] = [
  { id: "h1", type: "Conflict of Interest", period: "Annual 2026", submitted: "—", status: "overdue" },
  { id: "h2", type: "Register of Interests", period: "Annual 2026", submitted: "15 Jan 2026", status: "current" },
  { id: "h3", type: "Fit & Proper", period: "Annual 2026", submitted: "20 Jan 2026", status: "current" },
  { id: "h4", type: "Conflict of Interest", period: "Annual 2025", submitted: "28 Jan 2025", status: "archived" },
];
