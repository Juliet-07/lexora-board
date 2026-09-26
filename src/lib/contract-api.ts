import axios from "axios";

// ── Public, unauthenticated contract-signing API — mirrors
// lexora-tenant's @/lib/crm/tools-api.ts public section exactly
// (same backend endpoints: ToolContract is generic, not
// board-specific). Bypasses the shared `api` axios instance's auth
// header/401 handling since a signer reaching this page from an
// emailed link has no session at all yet. ──────────────────────
const PUBLIC_API_BASE = import.meta.env.VITE_REACT_APP_BASE_URL ?? "/api";
const publicApi = axios.create({ baseURL: PUBLIC_API_BASE });

export type SignatureStatus =
  | "not_sent"
  | "sent"
  | "signed"
  | "countersigned"
  | "declined";

export interface ToolContractInteraction {
  type: string;
  occurredAt: string;
  actor: "signer" | "tenant";
  message: string | null;
}

export interface SignableContract {
  _id: string;
  ref: string;
  title: string;
  counterparty: string;
  renderedBody: string;
  signatureStatus: SignatureStatus;
  interactions: ToolContractInteraction[];
  signature: { signedAt: string; signerName: string } | null;
}

export const fetchToolContractByToken = async (
  token: string,
): Promise<SignableContract> => {
  const res = await publicApi.get(`/tools/contracts/sign/${token}`);
  return res.data?.data ?? res.data;
};

export const submitToolContractComment = async (
  token: string,
  message: string,
): Promise<SignableContract> => {
  const res = await publicApi.post(`/tools/contracts/sign/${token}/comment`, {
    message,
  });
  return res.data?.data ?? res.data;
};

export const signToolContract = async (
  token: string,
  dto: { signerName: string; signatureImageData?: string },
): Promise<SignableContract> => {
  const res = await publicApi.post(`/tools/contracts/sign/${token}/sign`, dto);
  return res.data?.data ?? res.data;
};

export const declineToolContract = async (
  token: string,
  reason?: string,
): Promise<SignableContract> => {
  const res = await publicApi.post(`/tools/contracts/sign/${token}/decline`, {
    reason,
  });
  return res.data?.data ?? res.data;
};
