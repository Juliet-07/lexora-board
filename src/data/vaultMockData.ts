// Dummy data for the Document Vault page (mirrors the prototype's pg-vault).

export type VaultCategory = "charters" | "policies" | "minutes" | "reports";
export type VaultIcon = "charter" | "tor" | "policy" | "report";

export interface VaultDoc {
  id: string;
  title: string;
  meta: string;
  icon: VaultIcon;
  category: VaultCategory;
}

export interface VaultSection {
  id: string;
  title: string;
  docs: VaultDoc[];
}

export const vaultSections: VaultSection[] = [
  {
    id: "framework",
    title: "Governance framework",
    docs: [
      { id: "v1", title: "Board Charter", meta: "v3.0 · Jan 2026", icon: "charter", category: "charters" },
      { id: "v2", title: "Delegation of Authority Framework", meta: "v2.1", icon: "charter", category: "charters" },
      { id: "v3", title: "Board Code of Conduct", meta: "v1.0", icon: "charter", category: "charters" },
    ],
  },
  {
    id: "tors",
    title: "Committee ToRs",
    docs: [
      { id: "v4", title: "Audit & Risk Committee ToR", meta: "v2.0", icon: "tor", category: "charters" },
      { id: "v5", title: "Nominations & Governance ToR", meta: "v1.1", icon: "tor", category: "charters" },
      { id: "v6", title: "Remuneration Committee ToR", meta: "v1.0", icon: "tor", category: "charters" },
      { id: "v7", title: "Social & Ethics Committee ToR", meta: "v1.0", icon: "tor", category: "charters" },
    ],
  },
  {
    id: "policies",
    title: "Key policies",
    docs: [
      { id: "v8", title: "AML/CFT Policy", meta: "v3.0 · Jul 2026", icon: "policy", category: "policies" },
      { id: "v9", title: "Whistleblower Policy", meta: "v1.0", icon: "policy", category: "policies" },
      { id: "v10", title: "Data Protection & Privacy Policy", meta: "v2.0", icon: "policy", category: "policies" },
      { id: "v11", title: "Conflict of Interest Policy", meta: "v1.1", icon: "policy", category: "policies" },
      { id: "v12", title: "Related Party Transactions Policy", meta: "v1.0", icon: "policy", category: "policies" },
    ],
  },
  {
    id: "reports",
    title: "Annual reports",
    docs: [
      { id: "v13", title: "Integrated Annual Report FY2025", meta: "Apr 2026", icon: "report", category: "reports" },
      { id: "v14", title: "Audited Financial Statements FY2025", meta: "Mar 2026", icon: "report", category: "reports" },
    ],
  },
];

export const vaultFilters: { key: "all" | VaultCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "charters", label: "Charters & ToRs" },
  { key: "policies", label: "Policies" },
  { key: "minutes", label: "Minutes" },
  { key: "reports", label: "Reports" },
];
