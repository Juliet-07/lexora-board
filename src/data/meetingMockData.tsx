// Dummy data for the Meetings page (mirrors the prototype's pg-meetings).

export type RsvpStatus = "confirmed" | "pending" | "not-member";
export type PackStatus = "ready" | "pending" | null;

export interface UpcomingMeeting {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  agendaItems?: number;
  packDocs?: number;
  rsvp: RsvpStatus;
  pack: PackStatus;
  chairing?: boolean;
}

export const upcomingMeetings: UpcomingMeeting[] = [
  {
    id: "m1",
    day: "15",
    month: "OCT",
    title: "Board of Directors Q4",
    time: "14:00 CAT",
    location: "Kigali Office, Boardroom 1",
    agendaItems: 13,
    packDocs: 12,
    rsvp: "confirmed",
    pack: "ready",
  },
  {
    id: "m2",
    day: "22",
    month: "OCT",
    title: "Audit & Risk Committee",
    time: "10:00 CAT",
    location: "Virtual (MS Teams)",
    rsvp: "pending",
    pack: "pending",
    chairing: true,
  },
  {
    id: "m3",
    day: "05",
    month: "NOV",
    title: "Nominations & Governance Committee",
    time: "11:00 CAT",
    location: "Kigali Office",
    rsvp: "not-member",
    pack: null,
  },
];

export interface PastMeeting {
  id: string;
  name: string;
  date: string;
  attendance: string;
  chaired?: boolean;
  openActions: number;
}

export const pastMeetings: PastMeeting[] = [
  {
    id: "p1",
    name: "Board Q3",
    date: "15 Jul 2026",
    attendance: "Present",
    openActions: 1,
  },
  {
    id: "p2",
    name: "Audit & Risk",
    date: "22 Jul 2026",
    attendance: "Present (Chair)",
    chaired: true,
    openActions: 0,
  },
  {
    id: "p3",
    name: "Board Q2",
    date: "15 Apr 2026",
    attendance: "Present",
    openActions: 0,
  },
  {
    id: "p4",
    name: "Board Q1",
    date: "15 Jan 2026",
    attendance: "Present",
    openActions: 0,
  },
];

export interface ActionItem {
  id: string;
  title: string;
  from: string;
  status: "open" | "done";
  completedOn?: string;
}

export const actionItems: ActionItem[] = [
  {
    id: "a1",
    title: "Present Audit Committee report to full Board",
    from: "Board Q3 (15 Jul 2026) · Due: Board Q4 (15 Oct 2026)",
    status: "open",
  },
  {
    id: "a2",
    title: "Review and approve internal audit plan FY2027",
    from: "Audit & Risk (22 Jul 2026) · Completed 05 Aug 2026",
    status: "done",
    completedOn: "05 Aug 2026",
  },
];

export const meetingTypes = [
  "Board of Directors",
  "Audit & Risk Committee",
  "Nominations & Governance Committee",
  "Remuneration Committee",
  "Social & Ethics Committee",
];
