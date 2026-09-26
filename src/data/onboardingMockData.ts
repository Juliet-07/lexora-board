// Dummy data for the My Onboarding journey (mirrors the interactive board-app prototype).

export const ONBOARDING_STEP_COUNT = 6;

export interface OnboardingStepMeta {
  n: number;
  label: string;
  title: string;
}

export const onboardingSteps: OnboardingStepMeta[] = [
  { n: 1, label: "Accept", title: "Accept appointment & sign consent to act" },
  { n: 2, label: "Regulatory", title: "Regulatory Fit & Proper declaration" },
  { n: 3, label: "Documents", title: "Documents & declarations" },
  { n: 4, label: "Training", title: "Mandatory training" },
  { n: 5, label: "Induction", title: "Induction pack" },
  { n: 6, label: "Active", title: "Portal access activation" },
];

// Step 1 is already complete when the demo starts; step 2 is the live step.
export const ONBOARDING_START_STEP = 2;
export const STEP1_COMPLETED_ON = "15 Aug 2026";

export const appointmentRecord = [
  { label: "Proposed role", value: "Independent Non-Executive Director" },
  { label: "Term", value: "3 years from 1 Sep 2026" },
];

export interface Directorship {
  company: string;
  position: string;
  detail: string; // dates held (regulatory) or nature of business (COI)
}

export const regulatoryDefaults = {
  dob: "1982-04-11",
  idNumber: "1198280012345678",
  nationality: "Rwandan",
  address: "KG 15 Ave, Kacyiru, Kigali",
  directorships: [
    {
      company: "Umuco Capital Partners Ltd",
      position: "Non-Executive Director",
      detail: "2019–2024",
    },
  ] as Directorship[],
  reference: {
    name: "Eng. Claude Habimana",
    relationship: "Former board colleague",
    email: "claude.h@example.com",
  },
};

export const regulatoryQuestions = [
  {
    id: "sanction",
    text: "Have you ever been subject to any regulatory sanction or disciplinary action?",
  },
  {
    id: "bankrupt",
    text: "Have you ever been declared bankrupt or been party to a company insolvency/liquidation?",
  },
  { id: "convictions", text: "Do you have any unspent criminal convictions?" },
];

export const signDocuments = [
  {
    id: "charter",
    icon: "charter",
    title: "Board Charter — acceptance",
    meta: "Confirms you have read and accept the Board Charter",
  },
  {
    id: "conduct",
    icon: "conduct",
    title: "Code of Conduct & Ethics",
    meta: "Standards of behaviour for directors",
  },
  {
    id: "nda",
    icon: "nda",
    title: "Confidentiality & Non-Disclosure Agreement",
    meta: "Board information handling obligations",
  },
];

export const coiDefaults = {
  directorships: [
    {
      company: "Kigali Logistics Partners Ltd",
      position: "Non-Executive Director",
      detail: "Logistics & freight",
    },
  ] as Directorship[],
};

export const coiQuestions = [
  {
    id: "interest",
    text: "Do you, or a close family member, have any financial interest in transactions involving Lexora Africa?",
  },
  {
    id: "related",
    text: "Are you related to, or do you have a close personal relationship with, any other director or senior manager?",
  },
];

export const trainingModules = [
  {
    id: "aml",
    icon: "shield",
    title: "AML / CFT Awareness",
    meta: "~25 min · Pass mark 80%",
  },
  {
    id: "privacy",
    icon: "lock",
    title: "Data Protection & Privacy",
    meta: "~20 min · Pass mark 80%",
  },
  {
    id: "abc",
    icon: "ban",
    title: "Anti-Bribery & Corruption",
    meta: "~20 min · Pass mark 80%",
  },
];

export const inductionItems = [
  "Board Charter (current version)",
  "Articles of Incorporation",
  "Company strategy document",
  "Latest audited financial statements",
  "Organisational chart",
  "Key policies (AML/CFT, Data Protection, Code of Conduct)",
  "Minutes of last 3 board meetings",
  "Register of directors and company secretary",
];

export const portalFeatures = [
  "Meeting packs & board calendar",
  "E-signing for resolutions",
  "Committee workspace access",
  "Document vault",
];
