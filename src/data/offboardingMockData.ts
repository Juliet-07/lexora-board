// Dummy data for the Offboarding page (mirrors the prototype's pg-offboarding).

export const offboardingLifecycle = ["Notice", "Handover", "Declarations", "Return docs", "Regulatory", "Exit complete"];

export interface OffboardingChecklistItem {
  id: string;
  title: string;
  detail: string;
}

export const offboardingChecklist: OffboardingChecklistItem[] = [
  { id: "ob1", title: "Acknowledge resignation/retirement notice", detail: "Confirm receipt of formal notice or non-renewal letter" },
  { id: "ob2", title: "Complete final COI declaration", detail: "Disclose any interests that arose during tenure" },
  { id: "ob3", title: "Complete exit evaluation questionnaire", detail: "Confidential feedback on board effectiveness" },
  { id: "ob4", title: "Handover committee responsibilities", detail: "Transfer chair/committee duties to successor; brief incoming director" },
  { id: "ob5", title: "Return all confidential documents", detail: "Physical and digital board packs, keys, access cards" },
  { id: "ob6", title: "Sign confidentiality undertaking (post-tenure)", detail: "Ongoing confidentiality obligations after departure" },
  { id: "ob7", title: "Acknowledge post-service restrictions", detail: "Non-compete / cooling-off period for related appointments" },
  { id: "ob8", title: "BNR deregistration submitted", detail: "Company Secretary files regulatory notification" },
  { id: "ob9", title: "Portal access revoked", detail: "Board Portal and email access terminated" },
  { id: "ob10", title: "Final fee settlement confirmed", detail: "All outstanding fees, expense claims, and tax certificates issued" },
];

export const postTenureObligations = {
  confidentiality: "Indefinite (NDA signed 10 Sep 2024)",
  nonCompete: "12 months from departure",
  doRunOff: "6 years post-departure",
  documentRetention: "None: all materials returned",
};

export const termExpires = "31 Aug 2027";
