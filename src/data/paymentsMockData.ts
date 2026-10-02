// Dummy data for the Payments & Fees page (mirrors the prototype's pg-payments).

export const paymentsKpis = {
  totalReceivedYtd: "RWF 8,880,000",
  pendingPayment: "RWF 800,000",
  expenseClaims: "RWF 180,000",
  nextPayment: "30 Sep 2026",
};

export type FeeStatus = "paid" | "due";

export interface FeeStatement {
  id: string;
  title: string;
  sub: string;
  amount: string;
  status: FeeStatus;
}

export const feeStatements: FeeStatement[] = [
  { id: "fs1", title: "Q3 Board sitting fee", sub: "Paid 31 Jul 2026", amount: "RWF 600,000", status: "paid" },
  { id: "fs2", title: "Q3 Audit Committee (Chair)", sub: "Paid 31 Jul 2026", amount: "RWF 800,000", status: "paid" },
  { id: "fs3", title: "Q3 Annual retainer", sub: "Due 30 Sep 2026", amount: "RWF 1,500,000", status: "due" },
];

export type ExpenseStatus = "paid" | "submitted";

export interface ExpenseClaim {
  id: string;
  description: string;
  amount: string;
  status: ExpenseStatus;
}

export const expenseClaims: ExpenseClaim[] = [
  { id: "ec1", description: "Travel: Airport to office (Board Q3)", amount: "RWF 80,000", status: "paid" },
  { id: "ec2", description: "Accommodation: Serena Hotel (Board Q2)", amount: "RWF 100,000", status: "paid" },
];

export const feeStructure = {
  annualRetainer: "RWF 6,000,000",
  boardMeetingFee: "RWF 600,000 / meeting",
  committeeFee: "RWF 600,000 / meeting",
  chairPremium: "+RWF 200,000 / meeting",
  approvedBy: "Shareholders (AGM 2025)",
};

export const relatedMeetings = ["Board Q4 (15 Oct 2026)", "Audit & Risk (22 Oct 2026)", "Other"];
export const expenseCategories = ["Travel", "Accommodation", "Meals", "Other"];
