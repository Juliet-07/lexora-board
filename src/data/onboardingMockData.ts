// Dummy data for the My Onboarding page (matches the approved prototype).

export interface OnboardingStage {
  id: string;
  label: string;
}

export const onboardingStages: OnboardingStage[] = [
  { id: "accept", label: "Accept" },
  { id: "fit-proper", label: "Fit & Proper" },
  { id: "sign-docs", label: "Sign docs" },
  { id: "training", label: "Training" },
  { id: "induction", label: "Induction" },
  { id: "active", label: "Active" },
];

export interface OnboardingStep {
  id: string;
  title: string;
  detail: string;
  stageId: string;
  completedOn: string;
}

export const onboardingSummary = {
  status: "Complete" as const,
  started: "01 Sep 2024",
  completed: "30 Sep 2024",
  durationDays: 29,
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "s1",
    stageId: "accept",
    title: "Accepted appointment and signed consent to act",
    detail: "01 Sep 2024",
    completedOn: "01 Sep 2024",
  },
  {
    id: "s2",
    stageId: "fit-proper",
    title: "Submitted BNR Fit & Proper application",
    detail: "05 Sep 2024 · Approved 20 Sep 2024",
    completedOn: "20 Sep 2024",
  },
  {
    id: "s3",
    stageId: "sign-docs",
    title: "Signed Code of Conduct & NDA",
    detail: "E-signed 10 Sep 2024",
    completedOn: "10 Sep 2024",
  },
  {
    id: "s4",
    stageId: "sign-docs",
    title: "Submitted initial COI declaration",
    detail: "12 Sep 2024",
    completedOn: "12 Sep 2024",
  },
  {
    id: "s5",
    stageId: "training",
    title: "Completed AML/CFT training",
    detail: "18 Sep 2024 · Certificate uploaded",
    completedOn: "18 Sep 2024",
  },
  {
    id: "s6",
    stageId: "induction",
    title: "Received induction pack",
    detail: "20 Sep 2024",
    completedOn: "20 Sep 2024",
  },
  {
    id: "s7",
    stageId: "induction",
    title: "Portal access and 2FA enabled",
    detail: "22 Sep 2024",
    completedOn: "22 Sep 2024",
  },
  {
    id: "s8",
    stageId: "active",
    title: "Attended first board meeting",
    detail: "15 Oct 2024",
    completedOn: "15 Oct 2024",
  },
];
