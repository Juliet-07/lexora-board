// Dummy data for the Board Packs page (mirrors the prototype's pg-boardpacks).

export interface PackComment {
  author: string;
  text: string;
  time: string;
}

export interface PackDoc {
  id: string;
  num: number;
  icon: "agenda" | "minutes" | "report" | "finance" | "risk" | "compliance" | "committee" | "doc";
  title: string;
  meta: string;
  commentable: boolean;
  comments: PackComment[];
}

export const q4PackDocs: PackDoc[] = [
  { id: "d1", num: 1, icon: "agenda", title: "Agenda", meta: "2 pages · Final", commentable: true, comments: [] },
  { id: "d2", num: 2, icon: "minutes", title: "Minutes of previous meeting (Q3)", meta: "6 pages · For approval", commentable: true, comments: [] },
  {
    id: "d3", num: 3, icon: "report", title: "Managing Director's Report", meta: "8 pages · For noting", commentable: true,
    comments: [{ author: "Grace Uwimana", text: "What is the timeline for the Phase 2 expansion mentioned on p.4?", time: "Draft" }],
  },
  { id: "d4", num: 4, icon: "finance", title: "CFO Financial Report", meta: "14 pages · For discussion", commentable: true, comments: [] },
  { id: "d5", num: 5, icon: "risk", title: "Risk Dashboard", meta: "4 pages · For noting", commentable: false, comments: [] },
  { id: "d6", num: 6, icon: "compliance", title: "Compliance Report", meta: "6 pages · For discussion", commentable: false, comments: [] },
  { id: "d7", num: 7, icon: "committee", title: "Audit & Risk Committee Report", meta: "8 pages · Presented by: You (Chair)", commentable: false, comments: [] },
  { id: "d8", num: 8, icon: "committee", title: "Nominations Committee Report", meta: "4 pages", commentable: false, comments: [] },
  { id: "d9", num: 9, icon: "committee", title: "Social & Ethics Committee Report", meta: "4 pages", commentable: false, comments: [] },
  { id: "d10", num: 10, icon: "doc", title: "Resolutions for approval", meta: "3 pages · For approval", commentable: false, comments: [] },
  { id: "d11", num: 11, icon: "doc", title: "ESG Progress Report", meta: "6 pages · For discussion", commentable: false, comments: [] },
  { id: "d12", num: 12, icon: "doc", title: "Any Other Business", meta: "1 page", commentable: false, comments: [] },
];

export const boardPacks = {
  q4: {
    id: "q4-pack",
    title: "Board of Directors Q4 — Board Pack",
    distributed: "25 Sep 2026",
    docs: q4PackDocs.length,
    pages: 94,
    meetingDate: "15 Oct 2026",
    status: "New" as const,
  },
  auditRisk: {
    id: "audit-risk-pack",
    title: "Audit & Risk Committee — Board Pack",
    docs: 8,
    status: "All read" as const,
  },
};
