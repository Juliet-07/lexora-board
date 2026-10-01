import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  Mail,
  Mic,
  Paperclip,
  ShieldAlert,
  Users2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  fetchMyMeetings,
  fetchMyProfile,
  submitMeetingAck,
  submitMeetingNoticeRsvp,
  markMeetingNoticeOpened,
  setMyMeetingActionItemStatus,
  submitMeetingConflict,
  resolveBoardFileUrl,
  MEETING_CONFLICT_ACTIONS,
  type MyMeeting,
  type MeetingConflictAction,
  type MeetingConflictStatus,
} from "@/lib/board-api";

const shortDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function AttendanceBadge({ meeting }: { meeting: MyMeeting }) {
  // Per-attendee Present/Proxy/Apology/Absent status when available
  // (per PO feedback: attendance captures in-person vs proxy), else
  // fall back to the legacy present/absent boolean for older meetings.
  if (meeting.myAttendanceStatus) {
    const status = meeting.myAttendanceStatus;
    if (status === "Present")
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/10">
          Present
        </Badge>
      );
    if (status === "Proxy")
      return (
        <Badge className="bg-info/10 text-info hover:bg-info/10">
          Present by proxy
        </Badge>
      );
    if (status === "Apology")
      return (
        <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">
          Apology
        </Badge>
      );
    return (
      <Badge
        variant="outline"
        className="border-border bg-muted text-muted-foreground hover:bg-muted"
      >
        Absent
      </Badge>
    );
  }
  if (meeting.myAttendance === null)
    return (
      <Badge
        variant="outline"
        className="border-border bg-muted text-muted-foreground hover:bg-muted"
      >
        Not yet recorded
      </Badge>
    );
  return meeting.myAttendance ? (
    <Badge className="bg-success/10 text-success hover:bg-success/10">
      Present
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="border-border bg-muted text-muted-foreground hover:bg-muted"
    >
      Absent
    </Badge>
  );
}

// Shared styling for the four conflict-status values (see board-api.ts)
// — used both in the past-meetings table and the meeting-detail dialog.
function conflictStatusBadgeClass(status: MeetingConflictStatus): string {
  if (status === "Conflict declared — recusal required")
    return "bg-warning/15 text-amber-700 hover:bg-warning/15";
  if (status === "Standing declaration — ongoing")
    return "bg-info/10 text-info hover:bg-info/10";
  if (status === "No conflict declared")
    return "bg-muted text-muted-foreground hover:bg-muted";
  return "bg-success/10 text-success hover:bg-success/10";
}

function ConflictDialog({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: MyMeeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [agendaItems, setAgendaItems] = useState<string[]>([]);
  const [natureOfConflict, setNatureOfConflict] = useState("");
  const [actionTaken, setActionTaken] = useState<MeetingConflictAction | "">(
    "",
  );

  const mut = useMutation({
    mutationFn: () =>
      submitMeetingConflict(meeting._id, {
        agendaItems,
        natureOfConflict: natureOfConflict.trim(),
        actionTaken: actionTaken || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board-my-meetings"] });
      toast.success("Conflict of interest declared.");
      onOpenChange(false);
      setAgendaItems([]);
      setNatureOfConflict("");
      setActionTaken("");
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ??
          "Failed to declare the conflict of interest.",
      ),
  });

  const toggleAgendaItem = (title: string) =>
    setAgendaItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            Declare a conflict of interest
          </DialogTitle>
          <DialogDescription>
            {meeting.title} — {new Date(meeting.date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Agenda items affected</Label>
            <div className="mt-1 max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
              {meeting.agenda.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  No agenda items on this meeting.
                </p>
              )}
              {meeting.agenda.map((item, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer items-center gap-2 text-xs"
                >
                  <Checkbox
                    checked={agendaItems.includes(item.title)}
                    onCheckedChange={() => toggleAgendaItem(item.title)}
                  />
                  <span className="truncate">{item.title}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Nature of conflict</Label>
            <Textarea
              rows={3}
              className="mt-1"
              value={natureOfConflict}
              onChange={(e) => setNatureOfConflict(e.target.value)}
              placeholder="Describe the interest and how it relates to the agenda…"
            />
          </div>
          <div>
            <Label className="text-xs">Action to be taken</Label>
            <Select
              value={actionTaken}
              onValueChange={(v) => setActionTaken(v as MeetingConflictAction)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {MEETING_CONFLICT_ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={mut.isPending}
            onClick={() => {
              if (!natureOfConflict.trim()) {
                toast.error("Describe the nature of the conflict.");
                return;
              }
              mut.mutate();
            }}
          >
            {mut.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : null}
            Submit declaration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Meetings() {
  const qc = useQueryClient();
  const [ackTarget, setAckTarget] = useState<MyMeeting | null>(null);
  const [minutesTarget, setMinutesTarget] = useState<MyMeeting | null>(null);
  const [conflictTarget, setConflictTarget] = useState<MyMeeting | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["board-my-profile"],
    queryFn: fetchMyProfile,
  });
  const {
    data: meetings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["board-my-meetings"],
    queryFn: fetchMyMeetings,
  });

  const ackMut = useMutation({
    mutationFn: (meeting: MyMeeting) => submitMeetingAck(meeting._id, true),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board-my-meetings"] });
      toast.success("Agenda acknowledged.");
      setAckTarget(null);
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ?? "Failed to acknowledge the agenda.",
      ),
  });

  const noticeRsvpMut = useMutation({
    mutationFn: ({
      meetingId,
      rsvp,
    }: {
      meetingId: string;
      rsvp: "Confirmed" | "Apologies";
    }) => submitMeetingNoticeRsvp(meetingId, rsvp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board-my-meetings"] });
      toast.success("RSVP recorded.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to record RSVP."),
  });

  const openNotice = (m: MyMeeting) => {
    setMinutesTarget(m);
    if (m.notice && !m.myNoticeRsvp?.openedAt) {
      markMeetingNoticeOpened(m._id).then(() =>
        qc.invalidateQueries({ queryKey: ["board-my-meetings"] }),
      );
    }
  };

  const actionStatusMut = useMutation({
    mutationFn: ({
      meetingId,
      actionItemId,
      status,
    }: {
      meetingId: string;
      actionItemId: string;
      status: "Open" | "Done";
    }) => setMyMeetingActionItemStatus(meetingId, actionItemId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board-my-meetings"] });
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ?? "Failed to update the action item.",
      ),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your meetings…
      </div>
    );
  }

  const now = Date.now();
  const upcoming = meetings
    .filter((m) => m.status !== "Held" && new Date(m.date).getTime() >= now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const past = meetings
    .filter((m) => m.status === "Held" || new Date(m.date).getTime() < now)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const allActionItems = meetings.flatMap((m) =>
    m.actionItems.map((a) => ({ ...a, meeting: m })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
        <p className="text-sm text-muted-foreground">
          Your board and committee meetings. Acknowledge agendas, access board
          packs, and review minutes.
        </p>
      </div>

      {isError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn't load your meetings. Try refreshing the page.
        </p>
      )}

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past meetings ({past.length})</TabsTrigger>
          <TabsTrigger value="actions">
            My action items (
            {allActionItems.filter((a) => a.status !== "Done").length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="space-y-2.5">
          {upcoming.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No upcoming meetings. You'll see a meeting here as soon as it's
                dispatched to you.
              </CardContent>
            </Card>
          )}
          {upcoming.map((m) => {
            const d = new Date(m.date);
            const chairing =
              !!profile?.name &&
              m.chair.trim().toLowerCase() ===
                profile.name.trim().toLowerCase();
            return (
              <Card key={m._id} className="border-l-4 border-l-primary">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex w-14 shrink-0 flex-col items-center sm:items-start">
                    <span className="text-[22px] font-extrabold leading-none">
                      {d.getDate()}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                      {d.toLocaleString("en", { month: "short" }).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.toLocaleString("en", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {m.mode === "Online" ? "Online" : m.location}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                      Agenda: {m.agenda.length} items
                      {m.boardPack.length > 0 &&
                        ` · Board pack: ${m.boardPack.length} docs`}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {chairing && (
                        <Badge className="bg-success/10 text-success hover:bg-success/10">
                          You chair
                        </Badge>
                      )}
                      {m.notice &&
                        (m.myNoticeRsvp?.rsvp === "Confirmed" ? (
                          <Badge className="bg-success/10 text-success hover:bg-success/10">
                            ✓ RSVP'd — attending
                          </Badge>
                        ) : m.myNoticeRsvp?.rsvp === "Apologies" ? (
                          <Badge
                            variant="outline"
                            className="border-border bg-muted text-muted-foreground hover:bg-muted"
                          >
                            RSVP'd — apologies
                          </Badge>
                        ) : (
                          <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">
                            RSVP needed
                          </Badge>
                        ))}
                      {m.myAck ? (
                        <Badge className="bg-success/10 text-success hover:bg-success/10">
                          ✓ Agenda acknowledged
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-border bg-muted text-muted-foreground hover:bg-muted"
                        >
                          Acknowledgement pending
                        </Badge>
                      )}
                      {m.boardPack.length > 0 ? (
                        <Badge className="bg-info/10 text-info hover:bg-info/10">
                          Board pack ready
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-border bg-muted text-muted-foreground hover:bg-muted"
                        >
                          No documents yet
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                    {!m.myAck && (
                      <Button size="sm" onClick={() => setAckTarget(m)}>
                        Acknowledge agenda
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openNotice(m)}
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> View meeting
                    </Button>
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
                      <TableHead>Conflict of interest</TableHead>
                      <TableHead>Minutes</TableHead>
                      <TableHead>Your actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {past.map((m) => {
                      const openActions = m.actionItems.filter(
                        (a) => a.status !== "Done",
                      ).length;
                      return (
                        <TableRow key={m._id}>
                          <TableCell className="whitespace-nowrap font-semibold">
                            {m.title}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {shortDate(m.date)}
                          </TableCell>
                          <TableCell>
                            <AttendanceBadge meeting={m} />
                          </TableCell>
                          <TableCell>
                            {m.myConflict ? (
                              <Badge
                                className={conflictStatusBadgeClass(
                                  m.myConflict.status,
                                )}
                              >
                                {m.myConflict.status}
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={() => setConflictTarget(m)}
                              >
                                Declare
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            {m.minutesSentAt ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMinutesTarget(m)}
                              >
                                View
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Not yet sent
                              </span>
                            )}
                          </TableCell>
                          <TableCell
                            className={cn(
                              openActions === 0 && "text-muted-foreground",
                            )}
                          >
                            {openActions > 0 ? `${openActions} open` : "0"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {past.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          No past meetings yet.
                        </TableCell>
                      </TableRow>
                    )}
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
              {allActionItems.map((a) => (
                <div
                  key={a._id}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl border bg-card p-3.5",
                    a.status === "Done" && "opacity-70",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      a.status === "Done"
                        ? "bg-success/10 text-success"
                        : "bg-warning/15 text-amber-700",
                    )}
                  >
                    {a.status === "Done" ? (
                      <CheckCircle2 className="h-[18px] w-[18px]" />
                    ) : (
                      <ClipboardList className="h-[18px] w-[18px]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      From: {a.meeting.title} ({shortDate(a.meeting.date)})
                      {a.dueDate && ` · Due: ${shortDate(a.dueDate)}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={a.status === "Done" ? "outline" : "default"}
                    disabled={actionStatusMut.isPending}
                    onClick={() =>
                      actionStatusMut.mutate({
                        meetingId: a.meeting._id,
                        actionItemId: a._id,
                        status: a.status === "Done" ? "Open" : "Done",
                      })
                    }
                  >
                    {a.status === "Done" ? "Reopen" : "Mark done"}
                  </Button>
                </div>
              ))}
              {allActionItems.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No action items assigned to you yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Acknowledge agenda */}
      <Dialog open={!!ackTarget} onOpenChange={(o) => !o && setAckTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Acknowledge agenda</DialogTitle>
            <DialogDescription>
              {ackTarget?.title} — {ackTarget ? shortDate(ackTarget.date) : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This confirms you've received and reviewed the agenda and board pack
            for this meeting.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAckTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={ackMut.isPending}
              onClick={() => ackTarget && ackMut.mutate(ackTarget)}
            >
              {ackMut.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              Confirm acknowledgement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting detail — agenda, board pack, minutes */}
      <Dialog
        open={!!minutesTarget}
        onOpenChange={(o) => !o && setMinutesTarget(null)}
      >
        <DialogContent className="max-w-lg">
          {minutesTarget && (
            <>
              <DialogHeader>
                <DialogTitle>{minutesTarget.title}</DialogTitle>
                <DialogDescription>
                  {shortDate(minutesTarget.date)} · {minutesTarget.type} ·{" "}
                  {minutesTarget.mode === "Online"
                    ? "Online"
                    : minutesTarget.location}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
                {minutesTarget.notice && (
                  <div className="rounded-md border p-3">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> Notice
                    </p>
                    <p className="whitespace-pre-wrap text-[13px]">
                      {minutesTarget.notice.body}
                    </p>
                    {minutesTarget.notice.rsvpDeadline && (
                      <p className="mt-1.5 text-[11px] text-amber-700">
                        RSVP by {shortDate(minutesTarget.notice.rsvpDeadline)}
                      </p>
                    )}
                    <div className="mt-2.5">
                      {minutesTarget.myNoticeRsvp?.rsvp &&
                      minutesTarget.myNoticeRsvp.rsvp !== "Pending" ? (
                        <Badge
                          className={
                            minutesTarget.myNoticeRsvp.rsvp === "Confirmed"
                              ? "bg-success/10 text-success hover:bg-success/10"
                              : "border-border bg-muted text-muted-foreground hover:bg-muted"
                          }
                        >
                          RSVP'd —{" "}
                          {minutesTarget.myNoticeRsvp.rsvp === "Confirmed"
                            ? "attending"
                            : "apologies"}
                        </Badge>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={noticeRsvpMut.isPending}
                            onClick={() =>
                              noticeRsvpMut.mutate({
                                meetingId: minutesTarget._id,
                                rsvp: "Confirmed",
                              })
                            }
                          >
                            I will attend
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={noticeRsvpMut.isPending}
                            onClick={() =>
                              noticeRsvpMut.mutate({
                                meetingId: minutesTarget._id,
                                rsvp: "Apologies",
                              })
                            }
                          >
                            Apologies
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" /> Agenda
                  </p>
                  {minutesTarget.agenda.length ? (
                    <ul className="space-y-1">
                      {minutesTarget.agenda.map((a, i) => (
                        <li
                          key={`${a.title}-${i}`}
                          className="flex items-center justify-between border-b pb-1 text-[13px] last:border-b-0"
                        >
                          <span>
                            {i + 1}. {a.title}
                            {a.presenter && (
                              <span className="text-muted-foreground">
                                {" "}
                                — {a.presenter}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {a.durationMinutes}m
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">
                      No agenda items yet.
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5" /> Board pack
                  </p>
                  {minutesTarget.boardPack.length ? (
                    <ul className="space-y-1">
                      {minutesTarget.boardPack.map((d, i) => (
                        <li key={i} className="text-[13px]">
                          {d.fileUrl ? (
                            <a
                              href={resolveBoardFileUrl(d.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline"
                            >
                              {d.name}
                            </a>
                          ) : (
                            d.name
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">
                      No documents yet.
                    </p>
                  )}
                </div>
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between border-b py-1.5 text-[12.5px] last:border-b-0">
                    <span className="text-muted-foreground">Chair</span>
                    <span className="font-semibold">{minutesTarget.chair}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users2 className="h-3.5 w-3.5" /> Your attendance
                    </span>
                    <AttendanceBadge meeting={minutesTarget} />
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground">
                    <ShieldAlert className="h-3.5 w-3.5" /> Conflict of interest
                  </p>
                  {minutesTarget.myConflict ? (
                    <div className="space-y-1 text-[13px]">
                      <Badge
                        className={conflictStatusBadgeClass(
                          minutesTarget.myConflict.status,
                        )}
                      >
                        {minutesTarget.myConflict.status}
                      </Badge>
                      {minutesTarget.myConflict.agendaItems.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Re: {minutesTarget.myConflict.agendaItems.join(", ")}
                        </p>
                      )}
                      <p>{minutesTarget.myConflict.natureOfConflict}</p>
                      {minutesTarget.myConflict.actionTaken && (
                        <p className="text-xs text-muted-foreground">
                          Action: {minutesTarget.myConflict.actionTaken}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-[13px] text-muted-foreground">
                        No conflict declared for this meeting.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConflictTarget(minutesTarget)}
                      >
                        <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                        Declare conflict of interest
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground">
                    <Mic className="h-3.5 w-3.5" /> Minutes
                  </p>
                  {minutesTarget.minutesSentAt ? (
                    <div className="space-y-2">
                      {minutesTarget.minutes && (
                        <div
                          className="prose prose-sm max-w-none rounded-md border p-3 text-[13px]"
                          dangerouslySetInnerHTML={{
                            __html: minutesTarget.minutes,
                          }}
                        />
                      )}
                      {minutesTarget.minutesPdfUrl && (
                        <a
                          href={resolveBoardFileUrl(
                            minutesTarget.minutesPdfUrl,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            Download minutes PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">
                      Minutes haven't been sent yet.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Declare conflict of interest */}
      {conflictTarget && (
        <ConflictDialog
          meeting={conflictTarget}
          open={!!conflictTarget}
          onOpenChange={(o) => !o && setConflictTarget(null)}
        />
      )}
    </div>
  );
}
