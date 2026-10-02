// Dummy data for the My Compliance page (mirrors the prototype's pg-compliance).

export type ComplianceStatus = "overdue" | "current" | "complete" | "due-soon" | "active";

export interface ComplianceObligation {
  id: string;
  obligation: string;
  requirement: string;
  lastCompleted: string;
  nextDue: string;
  status: ComplianceStatus;
  highlighted?: boolean;
}

export const complianceObligations: ComplianceObligation[] = [
  {
    id: "co1", obligation: "COI Declaration", requirement: "Annual",
    lastCompleted: "28 Jan 2025", nextDue: "31 Jan 2026", status: "overdue", highlighted: true,
  },
  {
    id: "co2", obligation: "Register of Interests", requirement: "Annual + changes",
    lastCompleted: "15 Jan 2026", nextDue: "15 Jan 2027", status: "current",
  },
  {
    id: "co3", obligation: "Fit & Proper Self-Assessment", requirement: "Annual (BNR)",
    lastCompleted: "20 Jan 2026", nextDue: "20 Jan 2027", status: "current",
  },
  {
    id: "co4", obligation: "AML/CFT Training", requirement: "Annual (BNR)",
    lastCompleted: "18 Sep 2024", nextDue: "18 Sep 2025", status: "complete",
  },
  {
    id: "co5", obligation: "CPD Hours", requirement: "18 hrs / year",
    lastCompleted: "Ongoing", nextDue: "31 Dec 2026", status: "due-soon",
  },
  {
    id: "co6", obligation: "Annual Confirmation of Independence", requirement: "Annual",
    lastCompleted: "15 Jan 2026", nextDue: "15 Jan 2027", status: "current",
  },
  {
    id: "co7", obligation: "Code of Conduct Acknowledgement", requirement: "Annual",
    lastCompleted: "10 Jan 2026", nextDue: "10 Jan 2027", status: "current",
  },
  {
    id: "co8", obligation: "Board Skills Self-Assessment", requirement: "Annual",
    lastCompleted: "Nov 2025", nextDue: "31 Oct 2026", status: "due-soon",
  },
  {
    id: "co9", obligation: "D&O Insurance Coverage", requirement: "Continuous",
    lastCompleted: "Renewed 01 Apr 2026", nextDue: "31 Mar 2027", status: "active",
  },
];

export const doInsurance = {
  insurer: "SONARWA General Insurance",
  policyNumber: "DO-2026-XXXX",
  coverage: "USD 5,000,000",
  policyPeriod: "01 Apr 2026 to 31 Mar 2027",
  covers: "All directors and officers",
};
