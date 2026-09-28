import { useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  calendarFilters,
  calendarGroups,
  matchesFilter,
  type EventCategory,
  type FilterKey,
  type PillVariant,
} from "@/data/calendaMockData";

const CATEGORY_ICON: Record<EventCategory, React.ElementType> = {
  meeting: CalendarClock,
  committee: Users,
  deadline: AlertCircle,
  training: GraduationCap,
  regulatory: ShieldCheck,
};

const CATEGORY_ICON_CLASS: Record<EventCategory, string> = {
  meeting: "bg-primary/10 text-primary",
  committee: "bg-success/10 text-success",
  deadline: "bg-warning/15 text-amber-700",
  training: "bg-success/10 text-success",
  regulatory: "bg-muted text-muted-foreground",
};

function pillClass(variant: PillVariant) {
  switch (variant) {
    case "red":
      return "bg-destructive/10 text-destructive hover:bg-destructive/10";
    case "amber":
      return "bg-warning/15 text-amber-700 hover:bg-warning/15";
    case "green":
      return "bg-success/10 text-success hover:bg-success/10";
    case "violet":
      return "bg-primary/10 text-primary hover:bg-primary/10";
    default:
      return "border-border bg-muted text-muted-foreground hover:bg-muted";
  }
}

export default function BoardCalendar() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const visibleGroups = calendarGroups
    .map((g) => ({
      ...g,
      events: g.events.filter((e) => matchesFilter(e.category, filter)),
    }))
    .filter((g) => g.events.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Unified view of meetings, submission deadlines, training dates, and
          key governance milestones.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {calendarFilters.map((f) => (
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
          {visibleGroups.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No events in this category.
            </p>
          )}
          {visibleGroups.map((group, gi) => (
            <div
              key={group.label}
              className={cn("space-y-2", gi > 0 && "pt-5")}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.events.map((ev) => {
                  const Icon = CATEGORY_ICON[ev.category];
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3.5 rounded-xl border bg-card p-3.5"
                    >
                      <div className="flex w-12 shrink-0 flex-col items-center">
                        <span className="text-lg font-extrabold leading-none">
                          {ev.day}
                        </span>
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                          {ev.month}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          CATEGORY_ICON_CLASS[ev.category],
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ev.subtitle}
                        </p>
                      </div>
                      <Badge
                        className={cn("shrink-0", pillClass(ev.pillVariant))}
                        variant={
                          ev.pillVariant === "gray" ? "outline" : "default"
                        }
                      >
                        {ev.pillLabel}
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
