// Dummy data for the Notifications page (mirrors the prototype's pg-notifications).

export type NotifCategory = "action" | "documents" | "meetings" | "system";

export interface NotificationItem {
  id: string;
  title: string;
  detail?: string;
  time: string;
  unread: boolean;
  category: NotifCategory;
  iconBg: string;
  icon: "sign" | "pack" | "vote" | "declaration" | "training" | "meeting" | "newsletter";
  actionLabel?: string;
  actionTo?: string;
}

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Document awaiting your signature: Board Resolution RES-2026-018",
    detail: "Requested by Company Secretary. Approval of Q3 financial statements.",
    time: "2 hours ago",
    unread: true,
    category: "action",
    iconBg: "bg-destructive/10 text-destructive",
    icon: "sign",
    actionLabel: "Sign now",
    actionTo: "/e-signing",
  },
  {
    id: "n2",
    title: "Board pack distributed: Q4 Board Meeting (15 Oct 2026)",
    detail: "12 documents, 94 pages. Please review before the meeting.",
    time: "Today, 09:15",
    unread: true,
    category: "documents",
    iconBg: "bg-info/10 text-info",
    icon: "pack",
    actionLabel: "Review",
    actionTo: "/board-packs",
  },
  {
    id: "n3",
    title: "Circular resolution requires your vote: External Auditor Appointment",
    detail: "Voting closes 28 Sep 2026. 4 of 7 directors have voted.",
    time: "Yesterday",
    unread: true,
    category: "action",
    iconBg: "bg-primary/10 text-primary",
    icon: "vote",
    actionLabel: "Vote",
    actionTo: "/resolutions",
  },
  {
    id: "n4",
    title: "Reminder: Your COI declaration is overdue",
    detail: "Annual 2026 declaration was due 31 Jan 2026.",
    time: "Yesterday",
    unread: true,
    category: "action",
    iconBg: "bg-warning/15 text-amber-700",
    icon: "declaration",
    actionLabel: "Submit",
    actionTo: "/declarations",
  },
  {
    id: "n5",
    title: "Training assigned: Cyber Risk Oversight (NACD, 3 CPD hours)",
    detail: "Complete by 31 Oct 2026.",
    time: "3 days ago",
    unread: true,
    category: "action",
    iconBg: "bg-success/10 text-success",
    icon: "training",
    actionLabel: "Start",
    actionTo: "/training",
  },
  {
    id: "n6",
    title: "Meeting confirmed: Board of Directors Q4 on 15 Oct 2026",
    time: "1 week ago",
    unread: false,
    category: "meetings",
    iconBg: "bg-muted text-muted-foreground",
    icon: "meeting",
  },
  {
    id: "n7",
    title: "Newsletter published: Boardroom Bytes, September 2026",
    time: "2 weeks ago",
    unread: false,
    category: "system",
    iconBg: "bg-muted text-muted-foreground",
    icon: "newsletter",
    actionLabel: "Read",
    actionTo: "/newsletters",
  },
];

export const notificationFilters: { key: "all" | NotifCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "action", label: "Action required" },
  { key: "documents", label: "Documents" },
  { key: "meetings", label: "Meetings" },
  { key: "system", label: "System" },
];
