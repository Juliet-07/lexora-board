import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Loader2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchMyMeetings, type MyMeeting } from "@/lib/board-api";

// The board calendar — real meetings this director is invited to,
// grouped by month. A meeting is added here as soon as its Notice or
// board pack has been dispatched (the same visibility rule as "My
// Meetings"). Other governance milestones (compliance deadlines,
// training dates) aren't yet surfaced to the board portal from a real
// source, so this stays meetings-only rather than mixing in
// fabricated categories — unlike the earlier mock version of this
// page.

type FilterKey = "all" | "needs-rsvp" | "past";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs-rsvp", label: "Needs RSVP" },
  { key: "past", label: "Past" },
];

const monthLabel = (d: Date) =>
  d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

export default function BoardCalendar() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["board-my-meetings"],
    queryFn: fetchMyMeetings,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your calendar…
      </div>
    );
  }

  const now = Date.now();
  const filtered = meetings.filter((m) => {
    const isPast = new Date(m.date).getTime() < now;
    if (filter === "past") return isPast;
    if (filter === "needs-rsvp")
      return (
        !isPast &&
        !!m.notice &&
        (!m.myNoticeRsvp || m.myNoticeRsvp.rsvp === "Pending")
      );
    return !isPast;
  });

  const sorted = [...filtered].sort((a, b) =>
    filter === "past"
      ? +new Date(b.date) - +new Date(a.date)
      : +new Date(a.date) - +new Date(b.date),
  );

  const groups: { label: string; meetings: MyMeeting[] }[] = [];
  for (const m of sorted) {
    const label = monthLabel(new Date(m.date));
    const g = groups.find((x) => x.label === label);
    if (g) g.meetings.push(m);
    else groups.push({ label, meetings: [m] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Your board and committee meetings, in one timeline.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="divide-y p-5">
          {groups.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No meetings in this view.
            </p>
          )}
          {groups.map((group, gi) => (
            <div
              key={group.label}
              className={cn("space-y-2", gi > 0 && "pt-5")}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.meetings.map((m) => {
                  const d = new Date(m.date);
                  const needsRsvp =
                    !!m.notice &&
                    (!m.myNoticeRsvp || m.myNoticeRsvp.rsvp === "Pending");
                  return (
                    <div
                      key={m._id}
                      className="flex items-center gap-3.5 rounded-xl border bg-card p-3.5"
                    >
                      <div className="flex w-12 shrink-0 flex-col items-center">
                        <span className="text-lg font-extrabold leading-none">
                          {d.getDate()}
                        </span>
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                          {d
                            .toLocaleString("en", { month: "short" })
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{m.title}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarClock className="h-3 w-3" />
                          {d.toLocaleString("en", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {m.mode === "Online" ? "Online" : m.location}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "shrink-0",
                          needsRsvp
                            ? "bg-warning/15 text-amber-700 hover:bg-warning/15"
                            : m.status === "Held"
                              ? "border-border bg-muted text-muted-foreground hover:bg-muted"
                              : "bg-primary/10 text-primary hover:bg-primary/10",
                        )}
                        variant={needsRsvp ? "default" : "outline"}
                      >
                        {needsRsvp
                          ? "RSVP needed"
                          : m.status === "Held"
                            ? "Held"
                            : m.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
