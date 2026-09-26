import {
  LayoutDashboard, Bell, CalendarDays, ShieldCheck, Rocket, DoorOpen, Building2, Package,
  Vote, Landmark, Target, Scale, LineChart, UserRound, PenLine, Lock, GraduationCap,
  Wallet, Newspaper, MessageSquare, Settings, type LucideIcon,
} from "lucide-react";
import type { NavBadgeCounts } from "@/data/boardMockData";

export interface PortalNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: keyof NavBadgeCounts;
}
export interface PortalNavGroup {
  label: string;
  items: PortalNavItem[];
}

// Same information architecture as the approved prototype.
export const NAV_GROUPS: PortalNavGroup[] = [
  { label: "My Portal", items: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Notifications", url: "/notifications", icon: Bell, badge: "notifications" },
    { title: "Board Calendar", url: "/calendar", icon: CalendarDays },
    { title: "My Compliance", url: "/compliance", icon: ShieldCheck },
  ]},
  { label: "Onboarding", items: [
    { title: "My Onboarding", url: "/onboarding", icon: Rocket },
    { title: "Offboarding", url: "/offboarding", icon: DoorOpen },
  ]},
  { label: "Meetings & Packs", items: [
    { title: "Meetings", url: "/meetings", icon: Building2 },
    { title: "Board Packs", url: "/board-packs", icon: Package, badge: "boardPacks" },
    { title: "Resolutions", url: "/resolutions", icon: Vote, badge: "resolutions" },
  ]},
  { label: "Governance", items: [
    { title: "Committees", url: "/committees", icon: Landmark },
    { title: "Skills Matrix", url: "/skills-matrix", icon: Target },
    { title: "Declarations", url: "/declarations", icon: Scale },
    { title: "Board Evaluations", url: "/evaluations", icon: LineChart },
    { title: "Board Directory", url: "/directory", icon: UserRound },
  ]},
  { label: "Documents", items: [
    { title: "E-Signing", url: "/e-signing", icon: PenLine, badge: "eSigning" },
    { title: "Document Vault", url: "/vault", icon: Lock },
  ]},
  { label: "Development", items: [
    { title: "Training & CPD", url: "/training", icon: GraduationCap },
    { title: "Payments", url: "/payments", icon: Wallet },
  ]},
  { label: "Communications", items: [
    { title: "Newsletters", url: "/newsletters", icon: Newspaper },
    { title: "Messages", url: "/messages", icon: MessageSquare, badge: "messages" },
  ]},
  { label: "Account", items: [
    { title: "Profile & Settings", url: "/settings", icon: Settings },
  ]},
];
