// Dummy data for the Training & CPD page (mirrors the prototype's pg-training).

export type CourseStatus = "assigned" | "complete";

export interface CourseRecordRow {
  id: string;
  course: string;
  provider: string;
  cpdHours: number;
  status: CourseStatus;
  assignedBy?: string;
}

export const courseRecord: CourseRecordRow[] = [
  {
    id: "cr1",
    course: "Cyber Risk Oversight",
    provider: "NACD",
    cpdHours: 3,
    status: "assigned",
    assignedBy: "Company Secretary",
  },
  {
    id: "cr2",
    course: "AML/CFT for Directors",
    provider: "BNR Academy",
    cpdHours: 4,
    status: "complete",
  },
  {
    id: "cr3",
    course: "King IV Governance",
    provider: "IoDSA",
    cpdHours: 6,
    status: "complete",
  },
  {
    id: "cr4",
    course: "Financial Literacy for NEDs",
    provider: "ACCA",
    cpdHours: 4,
    status: "complete",
  },
];

export interface AvailableCourse {
  id: string;
  icon: "lock" | "leaf" | "scale";
  title: string;
  provider: string;
  duration: string;
  cpdHours: number;
}

export const availableCourses: AvailableCourse[] = [
  {
    id: "ac1",
    icon: "lock",
    title: "AML/CFT Refresher",
    provider: "BNR Academy",
    duration: "2 hrs",
    cpdHours: 2,
  },
  {
    id: "ac2",
    icon: "leaf",
    title: "ESG Reporting for Boards",
    provider: "Lexora Academy",
    duration: "3 hrs",
    cpdHours: 3,
  },
  {
    id: "ac3",
    icon: "scale",
    title: "Directors' Duties (Rwanda)",
    provider: "Lexora Academy",
    duration: "4 hrs",
    cpdHours: 4,
  },
];

export const cpdTarget = {
  year: 2026,
  target: 18,
};
