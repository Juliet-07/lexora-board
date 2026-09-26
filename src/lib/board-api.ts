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

export interface MyOnboarding {
  lifecycleStatus: BoardMemberLifecycleStatus;
  checklist: OnboardingChecklistItem[];
  totalItems: number;
  doneItems: number;
  startedAt: string;
  completedAt: string | null;
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

// Returns the updated BoardMember record — callers generally just
// refetch fetchMyOnboarding() afterward rather than relying on this
// shape directly.
export const completeMyOnboardingItem = async (index: number): Promise<any> => {
  const res = await api.post(
    `/board-portal/onboarding/items/${index}/complete`,
  );
  return unwrap(res);
};
