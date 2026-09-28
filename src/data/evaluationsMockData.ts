// Dummy data for the Board Evaluations page (mirrors the prototype's pg-evaluations).

export interface EvalQuestion {
  id: string;
  text: string;
}

export interface EvalSection {
  key: "self" | "peer" | "chair" | "committee";
  label: string;
  questions: EvalQuestion[];
}

export const evaluationSections: EvalSection[] = [
  {
    key: "self",
    label: "Self-assessment",
    questions: [
      { id: "s1", text: "I come to board meetings well prepared, having read the papers in advance." },
      { id: "s2", text: "I contribute constructively to board discussions and decision-making." },
      { id: "s3", text: "I understand the company's strategy and the key risks it faces." },
      { id: "s4", text: "I exercise independent judgement and am willing to challenge management." },
      { id: "s5", text: "I actively participate in the committee(s) I sit on." },
      { id: "s6", text: "I declare conflicts of interest promptly and appropriately." },
      { id: "s7", text: "I keep my skills and industry knowledge up to date." },
      { id: "s8", text: "I maintain the confidentiality of board discussions and information." },
      { id: "s9", text: "I devote sufficient time to my board responsibilities." },
      { id: "s10", text: "Overall, I am an effective member of this Board." },
    ],
  },
  {
    key: "peer",
    label: "Peer review",
    questions: [
      { id: "p1", text: "This director prepares thoroughly for meetings." },
      { id: "p2", text: "This director contributes valuable insight to board discussions." },
      { id: "p3", text: "This director listens to and respects other viewpoints." },
      { id: "p4", text: "This director constructively challenges management where needed." },
      { id: "p5", text: "This director is effective in their committee role(s)." },
      { id: "p6", text: "Overall, this director adds significant value to the Board." },
    ],
  },
  {
    key: "chair",
    label: "Chair evaluation",
    questions: [
      { id: "c1", text: "The Chair sets a clear agenda and runs meetings effectively." },
      { id: "c2", text: "The Chair encourages open debate and diverse viewpoints." },
      { id: "c3", text: "The Chair ensures the Board receives high-quality, timely information." },
      { id: "c4", text: "The Chair manages the relationship between the Board and management well." },
      { id: "c5", text: "Overall, the Chair provides effective leadership of the Board." },
    ],
  },
  {
    key: "committee",
    label: "Committee eval",
    questions: [
      { id: "cm1", text: "The committee's Terms of Reference are clear and up to date." },
      { id: "cm2", text: "The committee has the right mix of skills and experience." },
      { id: "cm3", text: "The committee receives sufficient information to discharge its duties." },
      { id: "cm4", text: "The committee's meeting frequency is appropriate." },
      { id: "cm5", text: "The committee reports effectively to the full Board." },
      { id: "cm6", text: "The committee follows up on agreed actions." },
      { id: "cm7", text: "The committee Chair leads meetings effectively." },
      { id: "cm8", text: "Overall, the committee is operating effectively." },
    ],
  },
];

export interface PastEvaluation {
  id: string;
  period: string;
  type: string;
  status: "Submitted" | "Pending";
  boardScore: string;
}

export const pastEvaluations: PastEvaluation[] = [
  { id: "e1", period: "FY2025", type: "Self + Peer + External", status: "Submitted", boardScore: "4.2 / 5" },
  { id: "e2", period: "H1 2025", type: "Self-assessment", status: "Submitted", boardScore: "3.8 / 5" },
];

export const currentEvaluationMeta = {
  title: "Q4 2026 Board Self-Assessment",
  due: "10 Oct 2026",
  duration: "15 minutes",
};
