import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Loader2,
  ScrollText,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  fetchMyCommittees,
  fetchMyProfile,
  fetchBoardOverview,
  type MyCommittee,
} from "@/lib/board-api";

function Kv({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-[12.5px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

const shortDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBD";

export default function Committees() {
  const [detailFor, setDetailFor] = useState<MyCommittee | null>(null);
  const [charterOpen, setCharterOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["board-my-profile"],
    queryFn: fetchMyProfile,
  });
  const {
    data: committees = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["board-my-committees"],
    queryFn: fetchMyCommittees,
  });
  const {
    data: boardOverview,
    isLoading: isBoardOverviewLoading,
    isError: isBoardOverviewError,
  } = useQuery({
    queryKey: ["board-overview"],
    queryFn: fetchBoardOverview,
  });

  const totalTasks = committees.reduce((n, c) => n + c.tasks.length, 0);
  const openTasks = committees.reduce(
    (n, c) => n + c.tasks.filter((t) => t.status !== "Done").length,
    0,
  );
  // Highlight whichever committee this director chairs, if any — otherwise
  // just the first one they belong to. Purely a display choice; every
  // committee is listed below regardless.
  const featured =
    committees.find((c) => c.myRole === "Chair") ?? committees[0] ?? null;

  if (isLoading || isBoardOverviewLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your committees…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Committees</h1>
        <p className="text-sm text-muted-foreground">
          Committees you serve on, mandates, and open tasks.
        </p>
      </div>

      {(isError || isBoardOverviewError) && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn't load your committees. Try refreshing the page.
        </p>
      )}

      {/* Featured cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {featured ? (
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold">{featured.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Role:{" "}
                    <span className="font-bold text-primary">
                      {featured.myRole}
                    </span>
                  </p>
                </div>
                <Badge className="bg-success/10 text-success hover:bg-success/10">
                  Active
                </Badge>
              </div>
              <div className="mt-3">
                <Kv label="Members">{featured.membersCount}</Kv>
                <Kv label="Meets">{featured.cadence}</Kv>
                <Kv label="Next meeting">{shortDate(featured.nextMeeting)}</Kv>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDetailFor(featured)}
                >
                  <ScrollText className="mr-1.5 h-3.5 w-3.5" /> View details
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              You haven't been added to a committee yet. Once a committee adds
              you as a member, it will show up here.
            </CardContent>
          </Card>
        )}

        {boardOverview && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold">{boardOverview.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Role:{" "}
                    <span className="font-semibold text-foreground">
                      {boardOverview.role}
                    </span>
                  </p>
                </div>
                <Badge className="bg-success/10 text-success hover:bg-success/10">
                  {boardOverview.status}
                </Badge>
              </div>
              <div className="mt-3">
                <Kv label="Members">{boardOverview.totalMembers} directors</Kv>
                {boardOverview.attendance ? (
                  <>
                    <div className="flex items-center justify-between py-2 text-[12.5px]">
                      <span className="text-muted-foreground">
                        Your attendance
                      </span>
                      <span className="font-semibold text-success">
                        {boardOverview.attendance.pct}% (
                        {boardOverview.attendance.present}/
                        {boardOverview.attendance.eligible})
                      </span>
                    </div>
                    <Progress
                      value={boardOverview.attendance.pct}
                      className="h-1.5"
                    />
                  </>
                ) : (
                  <p className="py-2 text-[12.5px] text-muted-foreground">
                    No board meetings recorded yet.
                  </p>
                )}
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!boardOverview.charter}
                  onClick={() => setCharterOpen(true)}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  {boardOverview.charter
                    ? "View charter"
                    : "No charter published"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All committees table */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[14.5px] font-bold">
              <Users className="h-4 w-4 text-primary" /> All my committees
            </h2>
            {totalTasks > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ClipboardList className="h-3.5 w-3.5" />
                {openTasks} of {totalTasks} tasks open
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Committee</TableHead>
                  <TableHead>Chair</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Your role</TableHead>
                  <TableHead>Next meeting</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {committees.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="whitespace-nowrap font-semibold">
                      {c.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {c.chair ?? "Not assigned"}
                    </TableCell>
                    <TableCell>{c.membersCount}</TableCell>
                    <TableCell>
                      {c.myRole === "Chair" ? (
                        <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                          Chair
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-border bg-muted text-muted-foreground hover:bg-muted"
                        >
                          {c.myRole}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "whitespace-nowrap",
                        !c.nextMeeting && "text-muted-foreground",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        {shortDate(c.nextMeeting)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDetailFor(c)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!committees.length && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      You're not on any committees yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Committee detail — mandate, cadence, quorum, charter, and tasks */}
      <Dialog open={!!detailFor} onOpenChange={(o) => !o && setDetailFor(null)}>
        <DialogContent className="max-w-lg">
          {detailFor && (
            <>
              <DialogHeader>
                <DialogTitle>{detailFor.name}</DialogTitle>
                <DialogDescription>
                  You're a {detailFor.myRole.toLowerCase()} on this committee.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
                <div>
                  <p className="mb-1 text-[12.5px] font-bold text-muted-foreground">
                    Purpose
                  </p>
                  <p className="text-[13px] leading-relaxed">
                    {detailFor.purpose || "No mandate description yet."}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <Kv label="Chair">{detailFor.chair ?? "Not assigned"}</Kv>
                  <Kv label="Members">{detailFor.membersCount}</Kv>
                  <Kv label="Cadence">{detailFor.cadence}</Kv>
                  <Kv label="Quorum">{detailFor.quorum}</Kv>
                  <Kv label="Next meeting">
                    {shortDate(detailFor.nextMeeting)}
                  </Kv>
                  <Kv label="Linked charter">
                    {detailFor.charter || "Not linked"}
                  </Kv>
                </div>
                <div>
                  <p className="mb-1.5 text-[12.5px] font-bold text-muted-foreground">
                    Tasks &amp; responsibilities
                  </p>
                  {detailFor.tasks.length ? (
                    <ul className="space-y-1.5">
                      {detailFor.tasks.map((t, i) => (
                        <li
                          key={`${t.title}-${i}`}
                          className="flex items-center justify-between gap-2 border-b pb-1.5 text-[13px] last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "truncate font-medium",
                                t.status === "Done" &&
                                  "line-through text-muted-foreground",
                              )}
                            >
                              {t.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {t.ownerBoardMemberId &&
                              t.ownerBoardMemberId === profile?.id
                                ? "Assigned to you"
                                : t.owner}{" "}
                              · Due {shortDate(t.dueDate)}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {t.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">
                      No tasks yet.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Board charter — the tenant's currently published Governance
          Code with category "Board Charter" (governance-code.schema.ts;
          there's no separate charter entity). */}
      <Dialog open={charterOpen} onOpenChange={setCharterOpen}>
        <DialogContent className="max-w-lg">
          {boardOverview?.charter && (
            <>
              <DialogHeader>
                <DialogTitle>{boardOverview.charter.title}</DialogTitle>
                <DialogDescription>
                  Version {boardOverview.charter.version}
                  {boardOverview.charter.publishedAt &&
                    ` · Published ${shortDate(boardOverview.charter.publishedAt)}`}
                </DialogDescription>
              </DialogHeader>
              <div
                className="prose prose-sm max-h-[60vh] max-w-none overflow-y-auto rounded-md border p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: boardOverview.charter.body }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
