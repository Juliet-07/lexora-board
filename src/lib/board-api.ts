import { api } from "./api";

const unwrap = (res: any) => res.data?.data ?? res.data;

// Documents/induction-pack files come back as backend-relative paths
// (e.g. "/uploads/grc/board-members/documents/xyz.pdf") — resolve to
// an absolute URL the same way lexora-tenant's resolveGrcFileUrl does.
const API_BASE = (api.defaults as any)?.baseURL ?? "/api";
export const resolveBoardFileUrl = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `${new URL(API_BASE).origin}${url}`;
};

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
// Training modules are a real, tenant-authored catalog now (see
// TrainingModule below) — no fixed id set any more, so this is just a
// plain string (the module's real _id).

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

// signedDocumentIds now holds the _id of each BoardMember.documentsToSign
// entry the tenant set up for this director (see SignableDocument
// below) rather than the old fixed 'charter'/'conduct'/'nda' literals
// — a director with none configured simply has nothing to sign here.
export interface DocumentsCoiSubmission {
  signedDocumentIds: string[];
  holdsOtherDirectorships: boolean;
  currentDirectorships: Directorship[];
  answers: YesNoAnswer[];
  submittedAt: string;
}

// A document the tenant set up for this director to sign (Board
// Charter, Code of Conduct, etc.) — a snapshot of one of the tenant's
// published Governance Codes, taken when they assigned it.
export interface SignableDocument {
  _id: string;
  title: string;
  category: string;
  sourceCodeId: string | null;
  // The code's rich-text body at assignment time — codes are authored
  // in-app, not uploaded as files, so this (not fileUrl) is what lets
  // the director actually read and review what they're signing.
  body: string;
  fileUrl: string | null;
  version: number;
}

// A real file in the induction pack the tenant has sent so far — every
// document the tenant has uploaded for this director (from either the
// "Documents" tab or the dedicated induction-pack sender, which now
// write to the same place on the backend).
export interface InductionPackFile {
  _id: string;
  name: string;
  fileUrl: string | null;
  mimeType: string | null;
  size: number;
  uploadedBy: string;
}

// A real, tenant-authored mandatory training module (Step 4) — the
// tenant's own catalog, not a fixed reference list. "Start module"
// opens resourceUrl when present; a module with none is still
// completable by self-attestation.
export interface TrainingModule {
  _id: string;
  title: string;
  description: string;
  resourceUrl: string | null;
  resourceMimeType: string | null;
  order: number;
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
    documentsCoi: {
      done: boolean;
      submission: DocumentsCoiSubmission | null;
      documents: SignableDocument[];
    };
    training: {
      done: boolean;
      completedModuleIds: string[];
      modules: TrainingModule[];
    };
    induction: {
      done: boolean;
      acknowledgement: {
        scheduledDate: string | null;
        acknowledgedDocumentIds: string[];
        acknowledgedAt: string;
      } | null;
      pack: InductionPackFile[];
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
  // Tenant-provided at director-creation time — used to prefill Step 2
  // of onboarding unless the tenant left them blank.
  nationality: string;
  idNumber: string;
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
  signedDocumentIds: string[];
  holdsOtherDirectorships: boolean;
  currentDirectorships: Directorship[];
  answers: YesNoAnswer[];
}): Promise<MyOnboarding> => {
  const res = await api.post("/board-portal/onboarding/documents-coi", dto);
  return unwrap(res);
};

export const submitOnboardingTraining = async (
  completedModuleIds: string[],
): Promise<MyOnboarding> => {
  const res = await api.post("/board-portal/onboarding/training", {
    completedModuleIds,
  });
  return unwrap(res);
};

export const submitInduction = async (dto: {
  scheduledDate?: string;
  acknowledgedDocumentIds: string[];
}): Promise<MyOnboarding> => {
  const res = await api.post("/board-portal/onboarding/induction", dto);
  return unwrap(res);
};

// ══════════════════════════════════════════════════════════════
// Governance Codes — codes this director has been asked to
// approve (Board Charter, Code of Conduct, etc.), decided in-app
// rather than via an emailed link since a board member is already
// an authenticated portal user.
// ══════════════════════════════════════════════════════════════

export type CodeApprovalDecision = "Pending" | "Approved" | "Rejected";

export interface PendingGovernanceCode {
  id: string;
  title: string;
  category: string;
  version: number;
  status: string;
  body: string;
  myDecision: CodeApprovalDecision | null;
  myNotes: string;
  myDecidedAt: string | null;
}

export const fetchPendingGovernanceCodes = async (): Promise<
  PendingGovernanceCode[]
> => {
  const res = await api.get("/board-portal/governance-codes");
  const d = unwrap(res);
  return Array.isArray(d) ? d : [];
};

export const decideGovernanceCode = async (
  id: string,
  decision: "Approved" | "Rejected",
  notes?: string,
): Promise<{ status: string }> => {
  const res = await api.post(`/board-portal/governance-codes/${id}/decide`, {
    decision,
    notes,
  });
  return unwrap(res);
};
