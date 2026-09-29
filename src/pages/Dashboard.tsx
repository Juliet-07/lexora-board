import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Loader2,
  Package,
  PenLine,
  Rocket,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  fetchMyDashboard,
  type DashboardAttentionKind,
  type Tone,
} from "@/lib/board-api";

const toneBadge: Record<Tone, string> = {
  red: "bg-destructive/10 text-destructive",
  amber: "bg-warning/15 text-amber-700",
  blue: "bg-info/10 text-info",
  violet: "bg-accent text-accent-foreground",
  green: "bg-success/10 text-success",
  gray: "bg-muted text-muted-foreground",
};

const iconMap: Record<
  DashboardAttentionKind,
  { icon: LucideIcon; tone: Tone }
> = {
  onboarding: { icon: Rocket, tone: "amber" },
  sign: { icon: PenLine, tone: "amber" },
  rsvp: { icon: CalendarDays, tone: "amber" },
  ack: { icon: CheckCircle2, tone: "blue" },
  pack: { icon: Package, tone: "blue" },
  code: { icon: BookOpen, tone: "violet" },
  action: { icon: ClipboardList, tone: "amber" },
};

const dotTone = {
  red: "bg-destructive",
  amber: "bg-warning",
  green: "bg-success",
  blue: "bg-info",
  violet: "bg-accent",
  gray: "bg-muted-foreground",
} as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function shortDate(value?: string | null) {
  return value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "—";
}

function Kpi({
  label,
  value,
  sub,
  valueClass,
  small,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  valueClass?: string;
  small?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
        <p
          className={cn(
            "font-bold leading-none",
            small ? "text-base pt-1.5 pb-0.5" : "text-2xl",
            valueClass,
          )}
        >
          {value}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground/80">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["board-dashboard"],
    queryFn: fetchMyDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your dashboard…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground">
        Couldn't load your dashboard right now. Try refreshing the page.
      </div>
    );
  }

  const { kpis, attentionItems, upcomingMeetings, standing } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting()}, {user?.firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is what needs your attention across the board portal today.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi
          label="Pending actions"
          value={kpis.pendingActions}
          sub={
            kpis.pendingActions === 0 ? "All caught up" : "Needs your attention"
          }
          valueClass={kpis.pendingActions > 0 ? "text-destructive" : undefined}
        />
        <Kpi
          label="Documents to sign"
          value={kpis.documentsToSign}
          sub={
            kpis.documentsToSign === 0 ? "Nothing outstanding" : "Onboarding"
          }
          valueClass={kpis.documentsToSign > 0 ? "text-amber-600" : undefined}
        />
        <Kpi
          label="Board packs to read"
          value={kpis.boardPacksToRead}
          sub={`of ${kpis.boardPacksTotal} total`}
        />
        <Kpi
          label="Next meeting"
          value={kpis.nextMeeting ? shortDate(kpis.nextMeeting.date) : "—"}
          sub={kpis.nextMeeting ? kpis.nextMeeting.title : "None scheduled"}
          small
        />
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">
              CPD hours (YTD)
            </p>
            <p className="text-2xl font-bold leading-none">
              {kpis.cpdHoursYTD}
            </p>
            <Progress
              value={Math.min(100, kpis.cpdHoursYTD)}
              className="mt-2 h-1.5"
            />
            <p className="mt-2 text-[11px] text-muted-foreground/80">
              Logged this year
            </p>
          </CardContent>
        </Card>
        <Kpi
          label="Code decisions"
          value={kpis.pendingCodeDecisions}
          sub={
            kpis.pendingCodeDecisions === 0
              ? "Nothing pending"
              : "Awaiting your review"
          }
          valueClass={
            kpis.pendingCodeDecisions > 0 ? "text-destructive" : undefined
          }
          small
        />
      </div>

      {/* Attention */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-warning" /> Requires your attention
            <Badge variant="secondary" className="ml-1">
              {attentionItems.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {attentionItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              You're all caught up — nothing needs your attention right now.
            </p>
          ) : (
            attentionItems.map((a) => {
              const { icon: Icon, tone } = iconMap[a.kind];
              return (
                <button
                  key={a.id}
                  onClick={() => navigate(a.to)}
                  className="group flex w-full items-center gap-3.5 rounded-xl border bg-card p-3.5 text-left transition hover:border-primary/60 hover:shadow-sm"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      toneBadge[tone],
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold sm:truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground sm:truncate">
                      {a.subtitle}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                      toneBadge[a.tone],
                    )}
                  >
                    {a.pill}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition group-hover:text-primary" />
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Meetings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" /> Upcoming
              meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {upcomingMeetings.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No upcoming meetings scheduled.
              </p>
            ) : (
              upcomingMeetings.map((m) => {
                const d = new Date(m.date);
                return (
                  <button
                    key={m.id}
                    onClick={() => navigate("/meetings")}
                    className="flex w-full gap-4 rounded-lg border border-l-4 border-l-primary bg-card p-3.5 text-left transition hover:shadow-sm"
                  >
                    <div className="w-12 shrink-0 text-center">
                      <p className="text-[22px] font-extrabold leading-none">
                        {d.getDate()}
                      </p>
                      <p className="text-[10px] font-bold tracking-wider text-muted-foreground">
                        {d
                          .toLocaleDateString("en-GB", { month: "short" })
                          .toUpperCase()}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {m.location || m.mode}
                      </p>
                      <span
                        className={cn(
                          "mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
                          toneBadge[m.tagTone],
                        )}
                      >
                        {m.tag}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Standing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" /> My standing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {standing.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing outstanding — you're in good standing.
              </p>
            ) : (
              <ul className="divide-y">
                {standing.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        dotTone[s.tone],
                      )}
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold">{s.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.status}
                      </p>
                    </div>
                    {s.due && (
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {s.due}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
