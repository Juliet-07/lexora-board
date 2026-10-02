// Dummy data for the E-Signing page (mirrors the prototype's pg-esigning).

export type SignUrgency = "urgent" | "pending";

export interface AwaitingSignature {
  id: string;
  title: string;
  detail: string;
  due: string;
  urgency: SignUrgency;
  body: string;
}

export const awaitingSignature: AwaitingSignature[] = [
  {
    id: "sig1",
    title: "Board Resolution RES-2026-018",
    detail: "Q3 financial statements · Due: 30 Sep 2026",
    due: "30 Sep 2026",
    urgency: "urgent",
    body: "RESOLVED THAT the Board hereby approves the unaudited management accounts for Q3 2026 as presented by the CFO.",
  },
  {
    id: "sig2",
    title: "Updated Audit Committee ToR v2.1",
    detail: "Due: 30 Sep 2026",
    due: "30 Sep 2026",
    urgency: "pending",
    body: "This Terms of Reference update reflects the Committee's expanded risk-oversight remit approved by the Board on 12 Mar 2026.",
  },
  {
    id: "sig3",
    title: "Annual Confirmation of Independence",
    detail: "Due: 15 Oct 2026",
    due: "15 Oct 2026",
    urgency: "pending",
    body: "I confirm that I remain independent in character and judgement, and that no relationships or circumstances exist that are likely to affect my independence.",
  },
];

export interface SignedDocument {
  id: string;
  title: string;
  signedOn: string;
}

export const signedDocuments: SignedDocument[] = [
  { id: "sd1", title: "NDA Amendment (Jul 2026)", signedOn: "15 Jul 2026" },
  { id: "sd2", title: "Board Resolution RES-2026-012", signedOn: "15 Jul 2026" },
  { id: "sd3", title: "Code of Conduct", signedOn: "10 Sep 2024" },
  { id: "sd4", title: "NDA / Confidentiality Agreement", signedOn: "10 Sep 2024" },
  { id: "sd5", title: "Consent to Act as Director", signedOn: "01 Sep 2024" },
];
