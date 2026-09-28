// Dummy data for the Board Calendar page (mirrors the prototype's pg-calendar).

export type EventCategory =
  | "meeting"
  | "committee"
  | "deadline"
  | "training"
  | "regulatory";
export type FilterKey =
  | "all"
  | "meetings"
  | "deadlines"
  | "training"
  | "regulatory";
export type PillVariant = "red" | "amber" | "green" | "violet" | "gray";

export interface CalendarEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  subtitle: string;
  category: EventCategory;
  pillLabel: string;
  pillVariant: PillVariant;
}

export interface CalendarMonthGroup {
  label: string;
  events: CalendarEvent[];
}

export const calendarGroups: CalendarMonthGroup[] = [
  {
    label: "September 2026",
    events: [
      {
        id: "ev1",
        day: "28",
        month: "SEP",
        title: "Voting closes: External Auditor Appointment",
        subtitle: "Circular resolution RES-2026-019",
        category: "deadline",
        pillLabel: "3 days",
        pillVariant: "red",
      },
      {
        id: "ev2",
        day: "30",
        month: "SEP",
        title: "E-signing deadline: Audit Committee ToR & Resolution",
        subtitle: "2 documents due",
        category: "deadline",
        pillLabel: "5 days",
        pillVariant: "amber",
      },
    ],
  },
  {
    label: "October 2026",
    events: [
      {
        id: "ev3",
        day: "10",
        month: "OCT",
        title: "Board self-assessment due",
        subtitle: "Q4 2026 evaluation questionnaire",
        category: "deadline",
        pillLabel: "Deadline",
        pillVariant: "amber",
      },
      {
        id: "ev4",
        day: "15",
        month: "OCT",
        title: "Board of Directors Q4",
        subtitle: "14:00 CAT · Kigali Office, Boardroom 1",
        category: "meeting",
        pillLabel: "Meeting",
        pillVariant: "violet",
      },
      {
        id: "ev5",
        day: "22",
        month: "OCT",
        title: "Audit & Risk Committee",
        subtitle: "10:00 CAT · Virtual · You chair",
        category: "committee",
        pillLabel: "Committee",
        pillVariant: "green",
      },
      {
        id: "ev6",
        day: "31",
        month: "OCT",
        title: "Skills matrix self-assessment due",
        subtitle: "Annual skills update",
        category: "deadline",
        pillLabel: "Deadline",
        pillVariant: "amber",
      },
      {
        id: "ev7",
        day: "31",
        month: "OCT",
        title: "Cyber Risk Oversight training due",
        subtitle: "NACD · 3 CPD hours",
        category: "training",
        pillLabel: "Training",
        pillVariant: "green",
      },
    ],
  },
  {
    label: "November 2026",
    events: [
      {
        id: "ev8",
        day: "05",
        month: "NOV",
        title: "Nominations & Governance Committee",
        subtitle: "11:00 CAT · Kigali Office",
        category: "committee",
        pillLabel: "Committee",
        pillVariant: "gray",
      },
    ],
  },
  {
    label: "December 2026",
    events: [
      {
        id: "ev9",
        day: "12",
        month: "DEC",
        title: "Remuneration Committee",
        subtitle: "Kigali Office",
        category: "committee",
        pillLabel: "Committee",
        pillVariant: "gray",
      },
      {
        id: "ev10",
        day: "31",
        month: "DEC",
        title: "CPD hours target deadline",
        subtitle: "18 hours required · 14 completed",
        category: "deadline",
        pillLabel: "4 hrs remaining",
        pillVariant: "amber",
      },
      {
        id: "ev11",
        day: "31",
        month: "DEC",
        title: "TCFD reporting deadline (FY2025)",
        subtitle: "Climate disclosure submission",
        category: "regulatory",
        pillLabel: "Regulatory",
        pillVariant: "gray",
      },
    ],
  },
  {
    label: "January 2027",
    events: [
      {
        id: "ev12",
        day: "15",
        month: "JAN",
        title: "Board of Directors Q1",
        subtitle: "Kigali Office · Date TBC",
        category: "meeting",
        pillLabel: "Tentative",
        pillVariant: "gray",
      },
      {
        id: "ev13",
        day: "31",
        month: "JAN",
        title: "COI declaration due (Annual 2027)",
        subtitle: "Annual conflict of interest",
        category: "deadline",
        pillLabel: "Deadline",
        pillVariant: "gray",
      },
    ],
  },
];

export const calendarFilters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "meetings", label: "Meetings" },
  { key: "deadlines", label: "Deadlines" },
  { key: "training", label: "Training" },
  { key: "regulatory", label: "AGM/Regulatory" },
];

export function matchesFilter(
  category: EventCategory,
  filter: FilterKey,
): boolean {
  if (filter === "all") return true;
  if (filter === "meetings")
    return category === "meeting" || category === "committee";
  if (filter === "deadlines") return category === "deadline";
  if (filter === "training") return category === "training";
  return category === "regulatory";
}
