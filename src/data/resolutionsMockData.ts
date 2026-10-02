// Dummy data for the Resolutions page (mirrors the prototype's pg-resolutions).

export interface PendingResolution {
  id: string;
  ref: string;
  title: string;
  type: string;
  votingCloses: string;
  body: string;
  supportingDocs: string[];
  votesCast: number;
  quorum: number;
  totalDirectors: number;
}

export const pendingResolutions: PendingResolution[] = [
  {
    id: "res19",
    ref: "RES-2026-019",
    title: "Appointment of External Auditor FY2027",
    type: "Circular resolution",
    votingCloses: "28 Sep 2026",
    body: "RESOLVED THAT the Board hereby approves the appointment of KPMG Rwanda as external auditors for FY2027, at a fee to be agreed by the Audit & Risk Committee, subject to shareholder ratification at the next AGM.",
    supportingDocs: ["Audit Committee recommendation", "KPMG proposal"],
    votesCast: 4,
    quorum: 4,
    totalDirectors: 7,
  },
  {
    id: "res18",
    ref: "RES-2026-018",
    title: "Approval of Q3 Financial Statements",
    type: "Circular",
    votingCloses: "30 Sep 2026",
    body: "RESOLVED THAT the Board approves the unaudited management accounts for Q3 2026.",
    supportingDocs: [],
    votesCast: 3,
    quorum: 4,
    totalDirectors: 7,
  },
];

export type VoteChoice = "Approve" | "Reject" | "Abstain";

export interface VotedResolution {
  id: string;
  title: string;
  date: string;
  myVote: VoteChoice;
  outcome: string;
}

export const votedResolutions: VotedResolution[] = [
  { id: "res15", title: "RES-2026-015: Appointment of Alternate Director", date: "01 Sep 2026", myVote: "Approve", outcome: "Passed (6-0-1)" },
  { id: "res12", title: "RES-2026-012: Updated AML Policy", date: "15 Jul 2026", myVote: "Approve", outcome: "Passed (7-0-0)" },
  { id: "res8", title: "RES-2026-008: FY2025 Annual Report", date: "15 Apr 2026", myVote: "Approve", outcome: "Passed (7-0-0)" },
];

export type ResolutionOutcome = "open" | "passed";

export interface AllResolutionRow {
  ref: string;
  description: string;
  type: string;
  date: string;
  outcome: ResolutionOutcome;
}

export const allResolutions: AllResolutionRow[] = [
  { ref: "RES-2026-019", description: "External Auditor FY2027", type: "Circular", date: "20 Sep 2026", outcome: "open" },
  { ref: "RES-2026-018", description: "Q3 Financial Statements", type: "Circular", date: "20 Sep 2026", outcome: "open" },
  { ref: "RES-2026-015", description: "Alternate Director", type: "Board meeting", date: "01 Sep 2026", outcome: "passed" },
  { ref: "RES-2026-012", description: "Updated AML Policy", type: "Board meeting", date: "15 Jul 2026", outcome: "passed" },
  { ref: "RES-2026-008", description: "FY2025 Annual Report", type: "Board meeting", date: "15 Apr 2026", outcome: "passed" },
];
