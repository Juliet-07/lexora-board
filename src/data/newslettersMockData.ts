// Dummy data for the Newsletters page (mirrors the prototype's pg-newsletters).

export interface NewsletterSection {
  heading: string;
  body: string;
}

export interface Newsletter {
  id: string;
  title: string;
  summary: string;
  date: string;
  gradient: string;
  readable: boolean;
  sections?: NewsletterSection[];
}

export const newsletters: Newsletter[] = [
  {
    id: "nl1",
    title: "Boardroom Bytes: Sep 2026",
    summary: "BNR fit & proper update, King IV, TCFD.",
    date: "15 Sep 2026",
    gradient: "linear-gradient(135deg,#5b4bff,#3a2dcc)",
    readable: true,
    sections: [
      { heading: "1. BNR Circular: Updated Fit & Proper Requirements", body: "The National Bank of Rwanda has issued Circular No. 2026/08 updating fit and proper requirements for directors of licensed financial institutions, including TCSPs." },
      { heading: "2. King IV Compliance: Self-Assessment Toolkit", body: "Lexora Africa is rolling out a King IV self-assessment toolkit for all client boards." },
      { heading: "3. TCFD Reporting Deadline: 31 December 2026", body: "Boards should ensure climate-related risks are properly assessed and disclosed in the integrated annual report." },
    ],
  },
  {
    id: "nl2",
    title: "Boardroom Bytes: Aug 2026",
    summary: "ESG trends, Companies Act amendments.",
    date: "15 Aug 2026",
    gradient: "linear-gradient(135deg,#16a34a,#0f7130)",
    readable: true,
    sections: [
      { heading: "1. ESG Trends for African Boards", body: "A roundup of the ESG disclosure trends regional regulators are converging on heading into 2027." },
      { heading: "2. Companies Act Amendments", body: "Summary of amendments affecting director duties and disclosure obligations." },
    ],
  },
  {
    id: "nl3",
    title: "Company Update: H1 2026",
    summary: "Key financial highlights and milestones.",
    date: "30 Jun 2026",
    gradient: "linear-gradient(135deg,#dc2626,#a51e1e)",
    readable: false,
  },
  {
    id: "nl4",
    title: "Regulatory Alert: BNR Capital",
    summary: "New minimum capital for TCSPs.",
    date: "20 Jun 2026",
    gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)",
    readable: false,
  },
];
