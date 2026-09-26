// Dummy data for the frontend-first Board Portal build.
// Mirrors the dashboard content of the approved prototype.

export type Tone = "red" | "amber" | "blue" | "violet" | "green" | "gray";

export interface BoardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organisation: string;
}

export const DEMO_USER: BoardUser = {
  id: "dir-001",
  firstName: "Grace",
  lastName: "Uwimana",
  email: "grace.uwimana@lexora.africa",
  role: "Independent NED",
  organisation: "Lexora Africa Limited",
};

// Any password works in the demo; these are just shown as a hint on the login page.
export const DEMO_CREDENTIALS = { email: DEMO_USER.email, password: "board2026" };

export interface AttentionItem {
  id: string;
  title: string;
  subtitle: string;
  icon:
    | "conflict"
    | "sign"
    | "pack"
    | "vote"
    | "evaluation"
    | "training"
    | "skills";
  pill: string;
  tone: Tone;
  to: string;
}

export const attentionItems: AttentionItem[] = [
  { id: "a1", icon: "conflict", title: "Submit your Conflict of Interest declaration", subtitle: "Annual 2026 · Overdue since 31 Jan 2026", pill: "Overdue", tone: "red", to: "/declarations" },
  { id: "a2", icon: "sign", title: "Sign: Board Resolution RES-2026-018", subtitle: "Circular resolution · Approval of Q3 financial statements", pill: "Awaiting", tone: "amber", to: "/e-signing" },
  { id: "a3", icon: "sign", title: "Sign: Updated Audit Committee Terms of Reference", subtitle: "Requested by Company Secretary · Due 30 Sep 2026", pill: "Awaiting", tone: "amber", to: "/e-signing" },
  { id: "a4", icon: "pack", title: "Review Board Pack: Q4 Board Meeting", subtitle: "12 documents · 94 pages · Meeting on 15 Oct 2026", pill: "New", tone: "blue", to: "/board-packs" },
  { id: "a5", icon: "vote", title: "Vote: Appointment of External Auditor FY2027", subtitle: "Circular resolution · Voting closes 28 Sep 2026", pill: "Vote", tone: "violet", to: "/resolutions" },
  { id: "a6", icon: "evaluation", title: "Complete: Board Self-Assessment Questionnaire", subtitle: "Q4 2026 evaluation · Due 10 Oct 2026", pill: "Pending", tone: "amber", to: "/evaluations" },
  { id: "a7", icon: "training", title: "Complete: Cyber Risk Oversight training", subtitle: "NACD · 3 CPD hours · Assigned by Company Secretary", pill: "Assigned", tone: "amber", to: "/training" },
  { id: "a8", icon: "skills", title: "Update your skills self-assessment", subtitle: "Annual skills matrix update · Due 31 Oct 2026", pill: "New", tone: "blue", to: "/skills-matrix" },
];

export const dashboardKpis = {
  pendingActions: { value: 8, sub: "Across all categories" },
  documentsToSign: { value: 3, sub: "E-signature required" },
  packsToRead: { value: 1, sub: "Q4 Board Pack" },
  nextMeeting: { value: "15 Oct", sub: "Board of Directors Q4" },
  cpd: { done: 14, target: 18, sub: "4 hours remaining" },
  coi: { value: "Overdue", sub: "Annual 2026" },
};

export interface UpcomingMeeting {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  tag: string;
  tagTone: Tone;
}

export const upcomingMeetings: UpcomingMeeting[] = [
  { id: "m1", day: "15", month: "OCT", title: "Board of Directors Q4", time: "14:00 CAT", location: "Kigali Office", tag: "Board pack ready", tagTone: "blue" },
  { id: "m2", day: "22", month: "OCT", title: "Audit & Risk Committee", time: "10:00 CAT", location: "Virtual", tag: "You chair", tagTone: "green" },
];

export interface ComplianceSnapshotItem {
  id: string;
  label: string;
  status: string;
  due: string;
  tone: "red" | "amber" | "green";
}

export const complianceSnapshot: ComplianceSnapshotItem[] = [
  { id: "c1", label: "COI declaration", status: "Overdue", due: "31 Jan 2026", tone: "red" },
  { id: "c2", label: "Fit & Proper", status: "Current", due: "20 Jan 2026", tone: "green" },
  { id: "c3", label: "AML/CFT training", status: "Complete", due: "✓", tone: "green" },
  { id: "c4", label: "CPD hours", status: "14/18", due: "31 Dec 2026", tone: "amber" },
  { id: "c5", label: "D&O Insurance", status: "Active", due: "Exp 31 Mar 2027", tone: "green" },
];

export interface NavBadgeCounts {
  notifications: number;
  boardPacks: number;
  resolutions: number;
  eSigning: number;
  messages: number;
}

export const navBadges: NavBadgeCounts = {
  notifications: 5,
  boardPacks: 1,
  resolutions: 2,
  eSigning: 3,
  messages: 2,
};
