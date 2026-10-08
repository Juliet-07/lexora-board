import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarDays,
  FileCheck2,
  Gavel,
  Leaf,
  MessageSquare,
  GraduationCap,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type BoardNotificationItem,
  type BoardNotificationType,
} from "@/lib/board-api";
import { useRealtimeEvent } from "@/lib/realtime-api";

const ICON: Record<BoardNotificationType, React.ElementType> = {
  Meeting: CalendarDays,
  Minutes: FileCheck2,
  "Governance Code": Gavel,
  ESG: Leaf,
  Message: MessageSquare,
  Training: GraduationCap,
  General: Bell,
};

const ICON_BG: Record<BoardNotificationType, string> = {
  Meeting: "bg-blue-500/10 text-blue-600",
  Minutes: "bg-violet-500/10 text-violet-600",
  "Governance Code": "bg-amber-500/10 text-amber-700",
  ESG: "bg-emerald-500/10 text-emerald-700",
  Message: "bg-primary/10 text-primary",
  Training: "bg-pink-500/10 text-pink-600",
  General: "bg-muted text-muted-foreground",
};

const FILTERS: Array<{ key: "all" | BoardNotificationType; label: string }> = [
  { key: "all", label: "All" },
  { key: "Meeting", label: "Meetings" },
  { key: "Minutes", label: "Minutes" },
  { key: "Governance Code", label: "Governance" },
  { key: "ESG", label: "ESG" },
  { key: "Message", label: "Messages" },
  { key: "Training", label: "Training" },
];

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | BoardNotificationType>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["board-notifications"],
    queryFn: fetchMyNotifications,
  });
  const items = data ?? [];

  // Realtime — a notification that arrives live while this page is
  // open drops straight into the list rather than waiting on a
  // refetch.
  useRealtimeEvent<BoardNotificationItem>("notification:new", (payload) => {
    queryClient.setQueryData<BoardNotificationItem[]>(
      ["board-notifications"],
      (prev) => [payload, ...(prev ?? [])],
    );
    queryClient.invalidateQueries({ queryKey: ["board-unread-count"] });
  });

  const readMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<BoardNotificationItem[]>(
        ["board-notifications"],
        (prev) =>
          (prev ?? []).map((n) => (n._id === updated._id ? updated : n)),
      );
      queryClient.invalidateQueries({ queryKey: ["board-unread-count"] });
    },
  });

  const readAllMut = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.setQueryData<BoardNotificationItem[]>(
        ["board-notifications"],
        (prev) =>
          (prev ?? []).map((n) => ({
            ...n,
            read: true,
            readAt: new Date().toISOString(),
          })),
      );
      queryClient.invalidateQueries({ queryKey: ["board-unread-count"] });
      toast.success("All notifications marked as read.");
    },
    onError: () => toast.error("Failed to mark notifications as read."),
  });

  const visible = items.filter((n) => filter === "all" || n.type === filter);
  const unreadCount = items.filter((n) => !n.read).length;

  const handleClick = (n: BoardNotificationItem) => {
    if (!n.read) readMut.mutate(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Real-time alerts from meetings, minutes, governance codes, ESG
            approvals, training, and messages from fellow directors.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => readAllMut.mutate()}
            disabled={readAllMut.isPending}
          >
            Mark all as read
          </Button>
        )}
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
        <CardContent className="divide-y p-0">
          {isLoading && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          )}
          {!isLoading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notifications in this category.
            </p>
          )}
          {visible.map((n) => {
            const Icon = ICON[n.type] ?? Bell;
            return (
              <div
                key={n._id}
                className={cn(
                  "flex cursor-pointer items-start gap-3.5 p-4 transition-colors hover:bg-muted/40",
                  !n.read && "bg-primary/5",
                )}
                onClick={() => handleClick(n)}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    ICON_BG[n.type] ?? ICON_BG.General,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      !n.read ? "font-bold" : "font-semibold",
                    )}
                  >
                    {n.title}
                  </p>
                  {n.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
