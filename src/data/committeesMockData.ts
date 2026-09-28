// Dummy data for the My Committees page (mirrors the prototype's pg-committees).

export interface CommitteeRow {
  id: string;
  name: string;
  chair: string;
  members: number;
  yourRole: "Chair" | "Member" | "N/A";
  nextMeeting: string;
}

export const committeeRows: CommitteeRow[] = [
  {
    id: "audit-risk",
    name: "Audit & Risk",
    chair: "You",
    members: 3,
    yourRole: "Chair",
    nextMeeting: "22 Oct 2026",
  },
  {
    id: "nominations",
    name: "Nominations & Governance",
    chair: "Claude Mugabo",
    members: 3,
    yourRole: "N/A",
    nextMeeting: "05 Nov 2026",
  },
  {
    id: "remuneration",
    name: "Remuneration",
    chair: "Jean Pierre Habimana",
    members: 3,
    yourRole: "N/A",
    nextMeeting: "12 Dec 2026",
  },
  {
    id: "social-ethics",
    name: "Social & Ethics",
    chair: "Rudo Barbra Sibanda",
    members: 3,
    yourRole: "N/A",
    nextMeeting: "TBD",
  },
];

export const auditRiskCommittee = {
  name: "Audit & Risk Committee",
  role: "Chairperson",
  status: "Active" as const,
  members: "You, Amina, Eric",
  meets: "Quarterly",
  nextMeeting: "22 Oct 2026",
  tor: {
    version: "Approved 12 Mar 2026 · Reviewed annually",
    purpose:
      "The Audit & Risk Committee assists the Board in fulfilling its oversight responsibilities for financial reporting, the system of internal control, the risk management framework, and the external and internal audit functions.",
    responsibilities: [
      "Review the integrity of the annual and interim financial statements before recommending them to the Board",
      "Monitor the effectiveness of internal controls and the enterprise risk management framework",
      "Oversee the relationship with the external auditor, including their independence and the audit fee",
      "Approve the internal audit plan and review findings and management's remediation progress",
      "Review whistleblowing, fraud and AML/CFT reports and escalate matters of significance to the Board",
    ],
    composition:
      "Minimum 3 members, a majority of whom (including the Chair) must be independent non-executive directors. Quorum is 2 members.",
  },
  history: [
    {
      date: "22 Jul 2026",
      event:
        "Q2 committee meeting held — reviewed interim financials and internal audit plan",
    },
    {
      date: "18 Apr 2026",
      event:
        "Q1 committee meeting held — approved FY2025 audit findings and management letter",
    },
    {
      date: "12 Mar 2026",
      event: "Terms of Reference reviewed and re-approved by the Board",
    },
    {
      date: "20 Jan 2026",
      event: "Grace Uwimana appointed Chairperson of the committee",
    },
  ],
};

export const boardOfDirectors = {
  name: "Board of Directors",
  role: "Independent NED",
  status: "Active" as const,
  members: "7 directors",
  attendancePct: 83,
  attendanceFraction: "5/6",
  charter: {
    version: "Approved 5 Feb 2026 · Reviewed annually",
    purpose:
      "The Board Charter sets out the role, composition, and operating principles of the Board of Directors of Lexora Africa Limited, and the division of responsibilities between the Board, its committees, and management.",
    principles: [
      "The Board is collectively responsible for the long-term success of the company and for setting its strategy, risk appetite, and values",
      "A majority of directors must be non-executive, with at least one third independent",
      "Directors must disclose conflicts of interest and recuse themselves from related discussions and decisions",
      "The Board meets at least quarterly, with additional meetings called as required",
      "Directors are expected to prepare for and attend meetings, and to complete annual training and self-assessment",
    ],
  },
};
