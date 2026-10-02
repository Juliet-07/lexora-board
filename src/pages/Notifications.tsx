import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, GraduationCap, Newspaper, Package, PenLine, Scale, Vote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  notificationFilters, notifications as initialNotifications, type NotifCategory, type NotificationItem,
} from "@/data/notificationsMockData";

const ICON: Record<NotificationItem["icon"], React.ElementType> = {
  sign: PenLine,
  pack: Package,
  vote: Vote,
  declaration: Scale,
  training: GraduationCap,
  meeting: CalendarDays,
  newsletter: Newspaper,
};

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | NotifCategory>("all");

  const visible = items.filter((n) => filter === "all" || n.category === filter);

  const markRead = (id: string) => {
    setItems((its) => its.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const handleAction = (n: NotificationItem) => {
    markRead(n.id);
    if (n.actionTo) navigate(n.actionTo);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">Alerts and updates from the Company Secretary, committees, and portal activity.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {notificationFilters.map((f) => (
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
        <CardContent className="divide-y p-0">
          {visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications in this category.</p>
          )}
          {visible.map((n) => {
            const Icon = ICON[n.icon];
            return (
              <div
                key={n.id}
                className={cn("flex items-start gap-3.5 p-4 transition-colors", n.unread && "bg-primary/5")}
                onClick={() => n.unread && markRead(n.id)}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", n.iconBg)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", n.unread ? "font-bold" : "font-semibold")}>{n.title}</p>
                  {n.detail && <p className="mt-0.5 text-xs text-muted-foreground">{n.detail}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground/70">{n.time}</p>
                </div>
                {n.actionLabel && (
                  <Button
                    size="sm"
                    variant={n.category === "action" ? "default" : "outline"}
                    onClick={(e) => { e.stopPropagation(); handleAction(n); }}
                  >
                    {n.actionLabel}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
