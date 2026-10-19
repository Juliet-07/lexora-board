import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchMyEvents, acknowledgeMyEvent, type MyPortalEvent } from "@/lib/board-api";

// In-house events this board member is invited to. There is no
// separate "check in" step — acknowledging here, from the board
// member's own portal, is itself the real attendance record.

export default function Events() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const EventCard = ({ e }: { e: MyPortalEvent }) => {
    const acknowledged = e.myStatus === "Acknowledged";
    return (
      <Card key={e._id}>
        <CardContent className="p-5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge variant="outline">{e.type}</Badge>
              <h3 className="font-bold text-foreground mt-1">{e.title}</h3>
            </div>
            {acknowledged ? (
              <Badge className="bg-success/15 text-success shrink-0" variant="secondary">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Attending
              </Badge>
            ) : e.status === "Published" ? (
              <Button
                size="sm"
                className="shrink-0"
                onClick={() => ackMut.mutate(e._id)}
                disabled={ackMut.isPending}
              >
                Acknowledge attendance
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {e.date.slice(0, 10)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {e.startTime}–{e.endTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {e.virtual ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
              {e.virtual ? "Virtual" : e.location || "—"}
            </span>
          </div>
          {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
          {e.virtual && e.meetingLink && acknowledged && (
            <a
              href={e.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline break-all"
            >
              {e.meetingLink}
            </a>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Board events you're invited to — acknowledge your attendance here.
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
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((e) => (
              <EventCard key={e._id} e={e} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Past
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map((e) => (
              <EventCard key={e._id} e={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
