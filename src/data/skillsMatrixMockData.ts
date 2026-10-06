// Dummy data for the Board Skills Matrix page (mirrors the prototype's pg-skills).

export interface SkillsDirector {
  id: string;
  shortLabel: string;
  roleTag?: string;
  isYou?: boolean;
}

// Same six directors as the Board Directory, in the prototype's column order.
export const skillsDirectors: SkillsDirector[] = [
  { id: "dir3", shortLabel: "Grace U.", roleTag: "You", isYou: true },
  { id: "dir2", shortLabel: "Claude M.", roleTag: "Chair" },
  { id: "dir1", shortLabel: "Rudo B.S.", roleTag: "MD" },
  { id: "dir4", shortLabel: "Jean Pierre H." },
  { id: "dir5", shortLabel: "Amina N." },
  { id: "dir6", shortLabel: "Eric N.", roleTag: "CFO" },
];

export type CoverageLevel = "strong" | "developing" | "gap";

export interface SkillCompetency {
  id: string;
  label: string;
  ratings: Record<string, number>; // directorId -> 1 (Awareness) .. 4 (Expert)
  coverage: CoverageLevel;
}

export const skillCompetencies: SkillCompetency[] = [
  {
    id: "governance",
    label: "Corporate Governance",
    ratings: { dir3: 4, dir2: 4, dir1: 4, dir4: 3, dir5: 3, dir6: 2 },
    coverage: "strong",
  },
  {
    id: "finance",
    label: "Financial Acumen",
    ratings: { dir3: 4, dir2: 2, dir1: 3, dir4: 3, dir5: 2, dir6: 4 },
    coverage: "strong",
  },
  {
    id: "risk",
    label: "Risk Management",
    ratings: { dir3: 4, dir2: 3, dir1: 3, dir4: 2, dir5: 3, dir6: 3 },
    coverage: "strong",
  },
  {
    id: "legal",
    label: "Legal & Regulatory",
    ratings: { dir3: 3, dir2: 3, dir1: 4, dir4: 4, dir5: 2, dir6: 2 },
    coverage: "strong",
  },
  {
    id: "aml",
    label: "AML/CFT Compliance",
    ratings: { dir3: 3, dir2: 2, dir1: 4, dir4: 3, dir5: 3, dir6: 2 },
    coverage: "strong",
  },
  {
    id: "strategy",
    label: "Strategy & Business Dev",
    ratings: { dir3: 2, dir2: 4, dir1: 4, dir4: 3, dir5: 3, dir6: 3 },
    coverage: "strong",
  },
  {
    id: "it",
    label: "IT / Cybersecurity",
    ratings: { dir3: 1, dir2: 1, dir1: 2, dir4: 1, dir5: 2, dir6: 3 },
    coverage: "gap",
  },
  {
    id: "esg",
    label: "ESG / Sustainability",
    ratings: { dir3: 2, dir2: 2, dir1: 3, dir4: 2, dir5: 3, dir6: 1 },
    coverage: "developing",
  },
  {
    id: "hr",
    label: "Human Capital / HR",
    ratings: { dir3: 2, dir2: 3, dir1: 3, dir4: 2, dir5: 4, dir6: 2 },
    coverage: "strong",
  },
  {
    id: "industry",
    label: "Industry (TCSP/Fiduciary)",
    ratings: { dir3: 3, dir2: 3, dir1: 4, dir4: 2, dir5: 2, dir6: 3 },
    coverage: "strong",
  },
  {
    id: "international",
    label: "International Markets",
    ratings: { dir3: 2, dir2: 4, dir1: 3, dir4: 3, dir5: 2, dir6: 2 },
    coverage: "developing",
  },
];

export const skillsSelfAssessment = {
  lastUpdated: "November 2025",
  dueDate: "31 Oct 2026",
};

export const RATING_LABELS = [
  "Awareness",
  "Working knowledge",
  "Skilled",
  "Expert",
];

export const skillsGapAnalysis = {
  critical: {
    heading: "Critical gap: IT / Cybersecurity oversight.",
    body: "Only one director (Eric Nsengimana) has working knowledge. The Nominations Committee should consider this gap when evaluating future board appointments or targeted training.",
  },
  developing: {
    heading: "Developing: ESG / Sustainability and International Markets.",
    body: "Training courses are available through the Training & CPD section to address these gaps.",
  },
};
