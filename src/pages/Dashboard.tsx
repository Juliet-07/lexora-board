import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, CalendarDays, ChevronRight, Package, PenLine, Scale, ShieldCheck,
  Target, TrendingUp, Vote, GraduationCap, Zap, type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  attentionItems, complianceSnapshot, dashboardKpis, upcomingMeetings,
  type AttentionItem, type Tone,
} from "@/data/boardMockData";

const toneBadge: Record<Tone, string> = {
  red: "bg-destructive/10 text-destructive",
  amber: "bg-warning/15 text-amber-700",
  blue: "bg-info/10 text-info",
  violet: "bg-accent text-accent-foreground",
  green: "bg-success/10 text-success",
  gray: "bg-muted text-muted-foreground",
};

const iconMap: Record<AttentionItem["icon"], { icon: LucideIcon; tone: Tone }> = {
  conflict: { icon: Scale, tone: "red" },
  sign: { icon: PenLine, tone: "amber" },
  pack: { icon: Package, tone: "blue" },
  vote: { icon: Vote, tone: "violet" },
  evaluation: { icon: TrendingUp, tone: "green" },
  training: { icon: GraduationCap, tone: "amber" },
  skills: { icon: Target, tone: "blue" },
};

const dotTone = { red: "bg-destructive", amber: "bg-warning", green: "bg-success" } as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Kpi({ label, value, sub, valueClass, small }: { label: string; value: React.ReactNode; sub: string; valueClass?: string; small?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
        <p className={cn("font-bold leading-none", small ? "text-base pt-1.5 pb-0.5" : "text-2xl", valueClass)}>{value}</p>
        <p className="mt-2 text-[11px] text-muted-foreground/80">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const k = dashboardKpis;
  const cpdPct = Math.round((k.cpd.done / k.cpd.target) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting()}, {user?.firstName}</h1>
        <p className="text-sm text-muted-foreground">Here is what needs your attention across the board portal today.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Pending actions" value={k.pendingActions.value} sub={k.pendingActions.sub} valueClass="text-destructive" />
        <Kpi label="Documents to sign" value={k.documentsToSign.value} sub={k.documentsToSign.sub} valueClass="text-amber-600" />
        <Kpi label="Board packs to read" value={k.packsToRead.value} sub={k.packsToRead.sub} />
        <Kpi label="Next meeting" value={k.nextMeeting.value} sub={k.nextMeeting.sub} small />
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">CPD hours (YTD)</p>
            <p className="text-2xl font-bold leading-none">
              {k.cpd.done} <span className="text-sm font-medium text-muted-foreground">/ {k.cpd.target}</span>
            </p>
            <Progress value={cpdPct} className="mt-2 h-1.5" />
            <p className="mt-2 text-[11px] text-muted-foreground/80">{k.cpd.sub}</p>
          </CardContent>
        </Card>
        <Kpi label="COI declaration" value={k.coi.value} sub={k.coi.sub} valueClass="text-destructive" small />
      </div>

      {/* Attention */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-warning" /> Requires your attention
            <Badge variant="secondary" className="ml-1">{attentionItems.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {attentionItems.map((a) => {
            const { icon: Icon, tone } = iconMap[a.icon];
            return (
              <button
                key={a.id}
                onClick={() => navigate(a.to)}
                className="group flex w-full items-center gap-3.5 rounded-xl border bg-card p-3.5 text-left transition hover:border-primary/60 hover:shadow-sm"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneBadge[tone])}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold sm:truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground sm:truncate">{a.subtitle}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", toneBadge[a.tone])}>{a.pill}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition group-hover:text-primary" />
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Meetings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" /> Upcoming meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {upcomingMeetings.map((m) => (
              <button
                key={m.id}
                onClick={() => navigate("/meetings")}
                className="flex w-full gap-4 rounded-lg border border-l-4 border-l-primary bg-card p-3.5 text-left transition hover:shadow-sm"
              >
                <div className="w-12 shrink-0 text-center">
                  <p className="text-[22px] font-extrabold leading-none">{m.day}</p>
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground">{m.month}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.time} · {m.location}</p>
                  <span className={cn("mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold", toneBadge[m.tagTone])}>{m.tag}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" /> Compliance snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {complianceSnapshot.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotTone[c.tone])} />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.status}</p>
                  </div>
                  <span className={cn("whitespace-nowrap text-xs", c.tone === "red" ? "font-semibold text-destructive" : "text-muted-foreground")}>
                    {c.due}
                  </span>
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/compliance")} className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <AlertTriangle className="h-3.5 w-3.5" /> View all obligations
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
