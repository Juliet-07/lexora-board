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
  // The real tenant company that appointed this director — used instead
  // of the platform's own name ("Lexora Africa") in onboarding questions
  // and declaration text, since the director is declaring to this tenant.
  tenantCompanyName: string;
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

// ══════════════════════════════════════════════════════════════
// My Committees — the committees this director belongs to, per
// board-portal.controller.ts#getMyCommittees /
// committee.service.ts#getForBoardMemberPortal. Membership itself is
// set up entirely on the tenant side (Committees / Board Management
// pages there); this is a read-only view of it plus the committee's
// own tasks.
// ══════════════════════════════════════════════════════════════

export type CommitteeMemberRole = "Chair" | "Secretary" | "Member";
export type CommitteeTaskStatus = "Open" | "In Progress" | "Done";

export interface MyCommitteeTask {
  title: string;
  // Display snapshot of the owner's name.
  owner: string;
  // Real link to whichever board member owns this task — compare
  // against the signed-in director's own id to highlight "my tasks".
  ownerBoardMemberId: string | null;
  dueDate: string;
  status: CommitteeTaskStatus;
}

export interface MyCommittee {
  _id: string;
  name: string;
  purpose: string;
  cadence: string;
  quorum: string;
  charter: string;
  nextMeeting: string | null;
  chair: string | null;
  membersCount: number;
  // This director's own role on this committee.
  myRole: CommitteeMemberRole;
  tasks: MyCommitteeTask[];
}

export const fetchMyCommittees = async (): Promise<MyCommittee[]> => {
  const res = await api.get("/board-portal/committees");
  const d = unwrap(res);
  return Array.isArray(d) ? d : [];
};

// ══════════════════════════════════════════════════════════════
// Board of Directors overview — the whole-board card on My
// Committees, distinct from any single committee. Per
// board-portal.controller.ts#getBoardOverview /
// board-member.service.ts#getBoardOverview: this director's own
// role/status, how many active board members the tenant has, their
// own real Board-meeting attendance (computed server-side from
// GovernanceMeeting records, not typed in anywhere), and the
// tenant's current published Board Charter (a Governance Code with
// category "Board Charter" — there's no separate charter document).
// ══════════════════════════════════════════════════════════════

export interface BoardAttendance {
  pct: number;
  present: number;
  eligible: number;
}

export interface BoardCharter {
  id: string;
  title: string;
  version: number;
  // Rich-text/HTML body, same as a Governance Code's body elsewhere
  // in the app — rendered as-is, not parsed into a fixed
  // purpose/principles shape.
  body: string;
  publishedAt: string | null;
}

export interface BoardOverview {
  name: string;
  role: string;
  status: string;
  totalMembers: number;
  // null until at least one Board-type meeting has had attendance
  // recorded and this director was on its attendee list.
  attendance: BoardAttendance | null;
  // null until the tenant has published a Board Charter code.
  charter: BoardCharter | null;
}

export const fetchBoardOverview = async (): Promise<BoardOverview> => {
  const res = await api.get("/board-portal/board-overview");
  return unwrap(res);
};

// ══════════════════════════════════════════════════════════════
// Meetings — "receive everything pertaining to it... both via email
// and on their board portal". Per
// board-portal.controller.ts#getMyMeetings/submitMeetingAck/
// setMyMeetingActionItemStatus and
// meeting.service.ts#getForBoardMemberPortal: every real, dispatched
// (non-Draft) meeting this director is an attendee of, scoped
// server-side to their own attendee record — never a free-text RSVP
// or a locally invented action-item list. Meetings are created and
// dispatched entirely from the tenant app; this is a read + narrow
// self-service view (RSVP, mark own action items done).
// ══════════════════════════════════════════════════════════════

export type MyMeetingAudienceType =
  | "Board"
  | "Committee"
  | "Executive"
  | "Ad-hoc";
export type MyMeetingMode = "Physical" | "Online";
export type MyMeetingStatus = "Sent" | "Held" | "Postponed";
export type MyMeetingActionItemStatus = "Open" | "Done";

export interface MyMeetingAgendaItem {
  title: string;
  presenter: string;
  durationMinutes: number;
}

export interface MyMeetingBoardPackDoc {
  name: string;
  fileUrl: string | null;
  mimeType: string | null;
  size: number;
  uploadedAt: string;
}

export interface MyMeetingActionItem {
  _id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: MyMeetingActionItemStatus;
  completedAt: string | null;
}

export interface MyMeeting {
  _id: string;
  title: string;
  type: MyMeetingAudienceType;
  committeeId: string | null;
  date: string;
  mode: MyMeetingMode;
  location: string;
  chair: string;
  status: MyMeetingStatus;
  agenda: MyMeetingAgendaItem[];
  boardPack: MyMeetingBoardPackDoc[];
  // Only populated once minutes have actually been sent — a director
  // is never shown a draft/unsent minutes text.
  minutes: string | null;
  minutesPdfUrl: string | null;
  minutesSentAt: string | null;
  // null until attendance has been recorded for this meeting.
  myAttendance: boolean | null;
  myAck: { agendaConfirmed: boolean; confirmedAt: string } | null;
  // This director's own action items only, never the full meeting list.
  actionItems: MyMeetingActionItem[];
  // Set once the tenant has dispatched the meeting Notice — visible
  // (and RSVP-able) even while the meeting itself is still Draft, ahead
  // of the board pack. Null until the notice goes out.
  notice: {
    body: string;
    rsvpDeadline: string | null;
    dispatchedAt: string;
  } | null;
  myNoticeRsvp: {
    rsvp: "Pending" | "Confirmed" | "Apologies";
    openedAt: string | null;
  } | null;
  // Board Packs page — this director's own reading progress across the
  // meeting's boardPack documents, plus every note left on any of them
  // (shared among attendees and the tenant, not private per-director).
  myBoardPack: {
    readFileUrls: string[];
    allDocumentsRead: boolean;
    allDocumentsReadAt: string | null;
  };
  boardPackNotes: BoardPackNote[];
}

export interface BoardPackNote {
  fileUrl: string;
  authorName: string;
  authorEmail: string;
  text: string;
  createdAt: string;
}

export const fetchMyMeetings = async (): Promise<MyMeeting[]> => {
  const res = await api.get("/board-portal/meetings");
  const d = unwrap(res);
  return Array.isArray(d) ? d : [];
};

export const submitMeetingNoticeRsvp = async (
  meetingId: string,
  rsvp: "Confirmed" | "Apologies",
): Promise<MyMeeting> => {
  const res = await api.post(
    `/board-portal/meetings/${meetingId}/notice/rsvp`,
    { rsvp },
  );
  return unwrap(res);
};

export const markMeetingNoticeOpened = async (
  meetingId: string,
): Promise<{ success: boolean }> => {
  const res = await api.post(
    `/board-portal/meetings/${meetingId}/notice/opened`,
    {},
  );
  return unwrap(res);
};

export const submitMeetingAck = async (
  meetingId: string,
  agendaConfirmed: boolean,
): Promise<MyMeeting> => {
  const res = await api.post(`/board-portal/meetings/${meetingId}/ack`, {
    agendaConfirmed,
  });
  return unwrap(res);
};

// ── Board Packs page ─────────────────────────────────────────────
// Mirrors board-portal.controller.ts#toggleBoardPackRead/
// confirmBoardPackRead/addBoardPackNote — real per-document reading
// progress and shared notes against a meeting's real boardPack, not a
// local read-tracking / comment store.

export const toggleBoardPackRead = async (
  meetingId: string,
  fileUrl: string,
  read: boolean,
): Promise<MyMeeting> => {
  const res = await api.patch(
    `/board-portal/meetings/${meetingId}/board-pack/read`,
    { fileUrl, read },
  );
  return unwrap(res);
};

export const confirmBoardPackRead = async (
  meetingId: string,
): Promise<MyMeeting> => {
  const res = await api.post(
    `/board-portal/meetings/${meetingId}/board-pack/confirm-read`,
    {},
  );
  return unwrap(res);
};

export const addBoardPackNote = async (
  meetingId: string,
  fileUrl: string,
  text: string,
): Promise<MyMeeting> => {
  const res = await api.post(
    `/board-portal/meetings/${meetingId}/board-pack/notes`,
    { fileUrl, text },
  );
  return unwrap(res);
};

export const setMyMeetingActionItemStatus = async (
  meetingId: string,
  actionItemId: string,
  status: MyMeetingActionItemStatus,
): Promise<MyMeeting> => {
  const res = await api.patch(
    `/board-portal/meetings/${meetingId}/action-items/${actionItemId}/status`,
    { status },
  );
  return unwrap(res);
};
