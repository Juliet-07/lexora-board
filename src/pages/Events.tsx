import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PartyPopper } from "lucide-react";
import { useState } from "react";
import {
  PortalEventCard,
  PortalEventDialog,
} from "@/components/PortalEventCard";
import { useToast } from "@/hooks/use-toast";
import { fetchMyEvents, acknowledgeMyEvent } from "@/lib/board-api";

// In-house events this board member is invited to. There is no
// separate "check in" step — acknowledging here, from the board
// member's own portal, is itself the real attendance record.

export default function Events() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["my-events"],
    queryFn: fetchMyEvents,
  });

  const ackMut = useMutation({
    mutationFn: (id: string) => acknowledgeMyEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      toast({ title: "Attendance acknowledged" });
    },
    onError: (err: any) =>
      toast({
        title: "Failed to acknowledge",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const upcoming = events.filter((e) => e.status === "Published");
  const past = events.filter((e) => e.status === "Completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Board events you're invited to — click one for the full details and
          acknowledge your attendance.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && events.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <PartyPopper className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              No event invitations at the moment.
            </p>
          </CardContent>
        </Card>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Upcoming
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((e) => (
              <PortalEventCard
                key={e._id}
                e={e}
                onOpen={() => setOpenId(e._id)}
                onAcknowledge={() => ackMut.mutate(e._id)}
                acknowledging={ackMut.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Past
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {past.map((e) => (
              <PortalEventCard
                key={e._id}
                e={e}
                onOpen={() => setOpenId(e._id)}
                onAcknowledge={() => ackMut.mutate(e._id)}
                acknowledging={ackMut.isPending}
              />
            ))}
          </div>
        </div>
      )}

      <PortalEventDialog
        e={events.find((x) => x._id === openId) ?? null}
        onClose={() => setOpenId(null)}
        onAcknowledge={(id) => ackMut.mutate(id)}
        acknowledging={ackMut.isPending}
      />
    </div>
  );
}
