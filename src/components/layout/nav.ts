import {
  LayoutDashboard,
  Bell,
  CalendarDays,
  ShieldCheck,
  Rocket,
  Building2,
  Package,
  Vote,
  Landmark,
  Target,
  Scale,
  LineChart,
  UserRound,
  PenLine,
  Lock,
  GraduationCap,
  Wallet,
  Newspaper,
  MessageSquare,
  Settings,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import type { NavBadgeCounts } from "@/data/boardMockData";

export interface PortalNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: keyof NavBadgeCounts;
}

// Flat sidebar — no section headers (PO, Oct 2026: "the demarcations
// and labelling on the sidebar isn't necessary, let it all be removed
// and let the sidebar be arranged in a way the user can understand
// and in a proper progression"). Ordered as a director would actually
// move through the portal: get oriented → get onboarded → the
// standing board work (calendar, meetings, packs, resolutions) → the
// governance/compliance cluster → documents → development & pay →
// communications → account, last.
export const NAV_ITEMS: PortalNavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Onboarding", url: "/onboarding", icon: Rocket },
  { title: "Board Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Meetings", url: "/meetings", icon: Building2 },
  { title: "Board Packs", url: "/board-packs", icon: Package },
  { title: "Resolutions", url: "/resolutions", icon: Vote },
  { title: "Policy Approvals", url: "/policy-approvals", icon: ShieldCheck },
  { title: "Governance Codes", url: "/governance-codes", icon: BookOpen },
  { title: "Committees", url: "/committees", icon: Landmark },
  { title: "Skills Matrix", url: "/skills-matrix", icon: Target },
  { title: "Board Evaluations", url: "/evaluations", icon: LineChart },
  { title: "Board Directory", url: "/directory", icon: UserRound },
  { title: "Document Vault", url: "/vault", icon: Lock },
  { title: "E-Signing", url: "/e-signing", icon: PenLine },
  { title: "Training & CPD", url: "/training", icon: GraduationCap },
  { title: "Payments", url: "/payments", icon: Wallet },
  { title: "Newsletters", url: "/newsletters", icon: Newspaper },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
    badge: "messages",
  },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile & Settings", url: "/settings", icon: Settings },
];
