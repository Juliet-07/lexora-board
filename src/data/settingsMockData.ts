// Dummy data for the Profile & Settings page (mirrors the prototype's pg-settings).

export const personalDetails = {
  fullName: "Grace Uwimana",
  designation: "Independent Non-Executive Director",
  email: "guwimana@lexora.rw",
  phone: "+250 78• ••• •••",
  qualifications: "ICPAR, ACCA",
  appointed: "01 Sep 2024",
  termExpires: "31 Aug 2027",
  committeeRoles: "Audit & Risk (Chair)",
};

export interface NotificationPreference {
  id: string;
  label: string;
  checked: boolean;
}

export const notificationPreferences: NotificationPreference[] = [
  { id: "np1", label: "Email me when a new board pack is distributed", checked: true },
  { id: "np2", label: "Email me when a document requires my signature", checked: true },
  { id: "np3", label: "Email me when a resolution requires my vote", checked: true },
  { id: "np4", label: "Email me meeting reminders (48 hours before)", checked: true },
  { id: "np5", label: "Email me compliance deadline reminders", checked: true },
  { id: "np6", label: "Email me when a new newsletter is published", checked: false },
];

export const security = {
  twoFactor: "Enabled",
  lastLogin: "25 Sep 2026, 13:42",
  passwordChanged: "01 Jul 2026",
};
