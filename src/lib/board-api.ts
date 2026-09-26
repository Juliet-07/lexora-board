import { api } from "./api";

const unwrap = (res: any) => res.data?.data ?? res.data;

// ══════════════════════════════════════════════════════════════
// Auth
// ══════════════════════════════════════════════════════════════

export interface BoardPortalUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  user: BoardPortalUser;
  tokens: { accessToken: string; refreshToken: string };
}

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", { email, password });
  return unwrap(res);
};

// ══════════════════════════════════════════════════════════════
// My onboarding (self-service — the signed-in board member's own
// record, scoped server-side to their own JWT, never an arbitrary
// board member id)
// ══════════════════════════════════════════════════════════════

export type BoardOnboardingStageId =
  | "accept"
  | "fit-proper"
  | "sign-docs"
  | "training"
  | "induction";

export interface OnboardingChecklistItem {
  label: string;
  done: boolean;
  completedAt: string | null;
  stageId: BoardOnboardingStageId | null;
}

export type BoardMemberLifecycleStatus = "Onboarding" | "Active" | "Offboarded";

// ══════════════════════════════════════════════════════════════
// Real onboarding form submissions — one shape per step, matching
// the backend's BoardMemberService exactly (board-member.schema.ts /
// board-member.dto.ts). Question/document/module ids are fixed,
// server-validated lists (REGULATORY_QUESTION_IDS, COI_QUESTION_IDS,
// APPOINTMENT_DOCUMENT_IDS, ONBOARDING_TRAINING_MODULE_IDS there),
// mirrored below as plain string unions so this file doesn't need a
// shared package to stay in sync — change one side, change the other.
// ══════════════════════════════════════════════════════════════

export type RegulatoryQuestionId = "sanction" | "bankrupt" | "convictions";
export type CoiQuestionId = "interest" | "related";
export type AppointmentDocumentId = "charter" | "conduct" | "nda";
export type TrainingModuleId = "aml" | "privacy" | "abc";

export interface Directorship {
  company: string;
  position: string;
  detail: string;
}

export interface YesNoAnswer {
  questionId: string;
  yes: boolean;
  detail: string;
}

export interface FitProperSubmission {
  fullName: string;
  dob: string;
  idNumber: string;
  nationality: string;
  address: string;
  directorships: Directorship[];
  answers: YesNoAnswer[];
  referenceName: string;
  referenceRelationship: string;
  referenceEmail: string;
  submittedAt: string;
}

export interface DocumentsCoiSubmission {
  signedDocumentIds: AppointmentDocumentId[];
  holdsOtherDirectorships: boolean;
  currentDirectorships: Directorship[];
  answers: YesNoAnswer[];
  submittedAt: string;
}

export interface MyOnboarding {
  lifecycleStatus: BoardMemberLifecycleStatus;
  checklist: OnboardingChecklistItem[];
  totalItems: number;
  doneItems: number;
  startedAt: string;
  completedAt: string | null;
  stages: {
    accept: { done: boolean };
    fitProper: { done: boolean; submission: FitProperSubmission | null };
    documentsCoi: { done: boolean; submission: DocumentsCoiSubmission | null };
    training: { done: boolean; completedModuleIds: TrainingModuleId[] };
    induction: {
      done: boolean;
      acknowledgement: {
        scheduledDate: string | null;
        acknowledgedAt: string;
      } | null;
    };
  };
}

export const fetchMyProfile = async (): Promise<{
  id: string;
  name: string;
  role: string;
  email: string;
  appointedAt: string;
  termEnds: string;
  lifecycleStatus: BoardMemberLifecycleStatus;
}> => {
  const res = await api.get("/board-portal/me");
  return unwrap(res);
};

export const fetchMyOnboarding = async (): Promise<MyOnboarding> => {
  const res = await api.get("/board-portal/onboarding");
  return unwrap(res);
};

// Each of these four returns the same MyOnboarding shape fetchMyOnboarding
// does (the backend re-derives and returns it after saving), so a
// caller can just swap it straight into the query cache instead of
// refetching.

export const submitFitProper = async (dto: {
  fullName: string;
  dob: string;
  idNumber: string;
  nationality: string;
  address: string;
  directorships: Directorship[];
  answers: YesNoAnswer[];
  referenceName?: string;
  referenceRelationship?: string;
  referenceEmail?: string;
}): Promise<MyOnboarding> => {
  const res = await api.post("/board-portal/onboarding/fit-proper", dto);
  return unwrap(res);
};

export const submitDocumentsCoi = async (dto: {
  signedDocumentIds: AppointmentDocumentId[];
  holdsOtherDirectorships: boolean;
  currentDirectorships: Directorship[];
  answers: YesNoAnswer[];
}): Promise<MyOnboarding> => {
  const res = await api.post("/board-portal/onboarding/documents-coi", dto);
  return unwrap(res);
};

export const submitOnboardingTraining = async (
  completedModuleIds: TrainingModuleId[],
): Promise<MyOnboarding> => {
  const res = await api.post("/board-portal/onboarding/training", {
    completedModuleIds,
  });
  return unwrap(res);
};

export const submitInduction = async (dto: {
  scheduledDate?: string;
}): Promise<MyOnboarding> => {
  const res = await api.post("/board-portal/onboarding/induction", dto);
  return unwrap(res);
};
