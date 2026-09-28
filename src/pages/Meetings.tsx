import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  FileStack,
  MapPin,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  actionItems,
  meetingTypes,
  pastMeetings,
  upcomingMeetings,
  type UpcomingMeeting,
} from "@/data/meetingMockData";

function rsvpBadge(m: UpcomingMeeting) {
  if (m.rsvp === "confirmed")
    return (
      <Badge className="bg-success/10 text-success hover:bg-success/10">
        ✓ RSVP confirmed
      </Badge>
    );
  if (m.rsvp === "not-member")
    return (
      <Badge
        variant="outline"
        className="border-border bg-muted text-muted-foreground hover:bg-muted"
      >
        Not a member
      </Badge>
    );
  return null;
}
function packBadge(m: UpcomingMeeting) {
  if (m.pack === "ready")
    return (
      <Badge className="bg-info/10 text-info hover:bg-info/10">
        Board pack ready
      </Badge>
    );
  if (m.pack === "pending")
    return (
      <Badge
        variant="outline"
        className="border-border bg-muted text-muted-foreground hover:bg-muted"
      >
        Pack pending
      </Badge>
    );
  return null;
}

export default function Meetings() {
  const navigate = useNavigate();

  const [rsvpTarget, setRsvpTarget] = useState<UpcomingMeeting | null>(null);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [rsvpState, setRsvpState] = useState<Record<string, RsvpChoice>>({});

  type RsvpChoice = "confirmed" | "declined";

  const submitRsvp = (choice: RsvpChoice) => {
    if (!rsvpTarget) return;
    setRsvpState((s) => ({ ...s, [rsvpTarget.id]: choice }));
    toast.success(
      choice === "confirmed"
        ? "RSVP confirmed."
        : "You've declined this meeting.",
    );
    setRsvpTarget(null);
  };

  const submitUrgent = (e: React.FormEvent) => {
    e.preventDefault();
    setUrgentOpen(false);
    toast.success("Urgent meeting request sent to the Company Secretary.");
  };

  const submitPropose = (e: React.FormEvent) => {
    e.preventDefault();
    setProposeOpen(false);
    toast.success("Meeting proposal sent to the Company Secretary.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
        <p className="text-sm text-muted-foreground">
          Your board and committee meetings. Confirm attendance, access agendas,
          and review minutes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Button onClick={() => setUrgentOpen(true)}>
          <AlertTriangle className="mr-1.5 h-4 w-4" /> Request urgent meeting
        </Button>
        <Button variant="outline" onClick={() => setProposeOpen(true)}>
          <CalendarPlus className="mr-1.5 h-4 w-4" /> Propose meeting
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past meetings</TabsTrigger>
          <TabsTrigger value="actions">My action items</TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="space-y-2.5">
          {upcomingMeetings.map((m) => {
            const rsvped = rsvpState[m.id];
            return (
              <Card key={m.id} className="border-l-4 border-l-primary">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex w-14 shrink-0 flex-col items-center sm:items-start">
                    <span className="text-[22px] font-extrabold leading-none">
                      {m.day}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                      {m.month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.time} · {m.location}
                    </p>
                    {(m.agendaItems || m.packDocs) && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                        {m.agendaItems && `Agenda: ${m.agendaItems} items`}
                        {m.agendaItems && m.packDocs && " · "}
                        {m.packDocs && `Board pack: ${m.packDocs} docs`}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.chairing && (
                        <Badge className="bg-success/10 text-success hover:bg-success/10">
                          You chair
                        </Badge>
                      )}
                      {rsvped === "confirmed" ? (
                        <Badge className="bg-success/10 text-success hover:bg-success/10">
                          ✓ RSVP confirmed
                        </Badge>
                      ) : rsvped === "declined" ? (
                        <Badge
                          variant="outline"
                          className="border-border bg-muted text-muted-foreground hover:bg-muted"
                        >
                          Declined
                        </Badge>
                      ) : (
                        rsvpBadge(m)
                      )}
                      {packBadge(m)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                    {m.pack === "ready" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/board-packs")}
                      >
                        <Package className="mr-1.5 h-3.5 w-3.5" /> Open pack
                      </Button>
                    )}
                    {m.rsvp === "pending" && !rsvped && (
                      <Button size="sm" onClick={() => setRsvpTarget(m)}>
                        RSVP
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Past */}
        <TabsContent value="past">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meeting</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Minutes</TableHead>
                      <TableHead>Your actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastMeetings.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="whitespace-nowrap font-semibold">
                          {m.name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {m.date}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-success/10 text-success hover:bg-success/10">
                            {m.attendance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toast(`Minutes — ${m.name}`, {
                                description:
                                  "Demo only: no document to open yet.",
                              })
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                        <TableCell
                          className={cn(
                            m.openActions === 0 && "text-muted-foreground",
                          )}
                        >
                          {m.openActions > 0 ? `${m.openActions} open` : "0"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action items */}
        <TabsContent value="actions">
          <Card>
            <CardContent className="space-y-2 p-4">
              {actionItems.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl border bg-card p-3.5",
                    a.status === "done" && "opacity-70",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      a.status === "done"
                        ? "bg-success/10 text-success"
                        : "bg-warning/15 text-amber-700",
                    )}
                  >
                    {a.status === "done" ? (
                      <CheckCircle2 className="h-[18px] w-[18px]" />
                    ) : (
                      <ClipboardList className="h-[18px] w-[18px]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      From: {a.from}
                    </p>
                  </div>
                  <Badge
                    className={
                      a.status === "done"
                        ? "bg-success/10 text-success hover:bg-success/10"
                        : "bg-warning/15 text-amber-700 hover:bg-warning/15"
                    }
                  >
                    {a.status === "done" ? "Done" : "Open"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RSVP dialog */}
      <Dialog
        open={!!rsvpTarget}
        onOpenChange={(o) => !o && setRsvpTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>RSVP</DialogTitle>
            <DialogDescription>
              {rsvpTarget?.title} — {rsvpTarget?.time} · {rsvpTarget?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" /> {rsvpTarget?.location}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => submitRsvp("declined")}>
              Decline
            </Button>
            <Button onClick={() => submitRsvp("confirmed")}>
              Confirm attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request urgent meeting */}
      <Dialog open={urgentOpen} onOpenChange={setUrgentOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={submitUrgent}>
            <DialogHeader>
              <DialogTitle>Request an urgent meeting</DialogTitle>
              <DialogDescription>
                Sent directly to the Company Secretary for scheduling.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Committee / meeting type</Label>
                <Select defaultValue={meetingTypes[0]}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reason for urgency</Label>
                <Textarea
                  required
                  placeholder="Briefly explain why this can't wait for the next scheduled meeting..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUrgentOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Propose meeting */}
      <Dialog open={proposeOpen} onOpenChange={setProposeOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={submitPropose}>
            <DialogHeader>
              <DialogTitle>Propose a meeting</DialogTitle>
              <DialogDescription>
                Suggest a date and topic for the Company Secretary to schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Committee / meeting type</Label>
                <Select defaultValue={meetingTypes[0]}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Preferred date</Label>
                <Input type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label>Topic / purpose</Label>
                <Textarea
                  required
                  placeholder="What should this meeting cover?"
                  className="min-h-[70px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProposeOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <FileStack className="mr-1.5 h-4 w-4" /> Send proposal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
