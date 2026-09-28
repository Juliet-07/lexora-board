import { useState } from "react";
import {
  CalendarClock,
  ClipboardCheck,
  History,
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
  auditRiskCommittee,
  boardOfDirectors,
  committeeRows,
} from "@/data/committeesMockData";

function Kv({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-[12.5px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

type PanelKind = "tor" | "history" | "charter" | null;

export default function Committees() {
  const [panel, setPanel] = useState<PanelKind>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Committees</h1>
        <p className="text-sm text-muted-foreground">
          Committees you serve on, terms of reference, and committee materials.
        </p>
      </div>

      {/* Featured cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold">
                  {auditRiskCommittee.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Role:{" "}
                  <span className="font-bold text-primary">
                    {auditRiskCommittee.role}
                  </span>
                </p>
              </div>
              <Badge className="bg-success/10 text-success hover:bg-success/10">
                {auditRiskCommittee.status}
              </Badge>
            </div>
            <div className="mt-3">
              <Kv label="Members">{auditRiskCommittee.members}</Kv>
              <Kv label="Meets">{auditRiskCommittee.meets}</Kv>
              <Kv label="Next meeting">{auditRiskCommittee.nextMeeting}</Kv>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPanel("tor")}
              >
                <ScrollText className="mr-1.5 h-3.5 w-3.5" /> View ToR
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPanel("history")}
              >
                <History className="mr-1.5 h-3.5 w-3.5" /> History
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold">{boardOfDirectors.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Role:{" "}
                  <span className="font-semibold text-foreground">
                    {boardOfDirectors.role}
                  </span>
                </p>
              </div>
              <Badge className="bg-success/10 text-success hover:bg-success/10">
                {boardOfDirectors.status}
              </Badge>
            </div>
            <div className="mt-3">
              <Kv label="Members">{boardOfDirectors.members}</Kv>
              <div className="flex items-center justify-between py-2 text-[12.5px]">
                <span className="text-muted-foreground">Your attendance</span>
                <span className="font-semibold text-success">
                  {boardOfDirectors.attendancePct}% (
                  {boardOfDirectors.attendanceFraction})
                </span>
              </div>
              <Progress
                value={boardOfDirectors.attendancePct}
                className="h-1.5"
              />
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPanel("charter")}
              >
                <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" /> View charter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All committees table */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[14.5px] font-bold">
            <Users className="h-4 w-4 text-primary" /> All board committees
          </h2>
          <div className="overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Committee</TableHead>
                  <TableHead>Chair</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Your role</TableHead>
                  <TableHead>Next meeting</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {committeeRows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-nowrap font-semibold">
                      {c.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {c.chair}
                    </TableCell>
                    <TableCell>{c.members}</TableCell>
                    <TableCell>
                      {c.yourRole === "Chair" ? (
                        <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                          Chair
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-border bg-muted text-muted-foreground hover:bg-muted"
                        >
                          N/A
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "whitespace-nowrap",
                        c.nextMeeting === "TBD" && "text-muted-foreground",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        {c.nextMeeting}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Terms of Reference */}
      <Dialog open={panel === "tor"} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {auditRiskCommittee.name} — Terms of Reference
            </DialogTitle>
            <DialogDescription>
              {auditRiskCommittee.tor.version}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
            <div>
              <p className="mb-1 text-[12.5px] font-bold text-muted-foreground">
                Purpose
              </p>
              <p className="text-[13px] leading-relaxed">
                {auditRiskCommittee.tor.purpose}
              </p>
            </div>
            <div>
              <p className="mb-1.5 text-[12.5px] font-bold text-muted-foreground">
                Key responsibilities
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed">
                {auditRiskCommittee.tor.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-[12.5px] font-bold text-muted-foreground">
                Composition &amp; quorum
              </p>
              <p className="text-[13px] leading-relaxed">
                {auditRiskCommittee.tor.composition}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Committee history */}
      <Dialog
        open={panel === "history"}
        onOpenChange={(o) => !o && setPanel(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{auditRiskCommittee.name} — History</DialogTitle>
            <DialogDescription>
              Recent committee activity and decisions.
            </DialogDescription>
          </DialogHeader>
          <ol className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {auditRiskCommittee.history.map((h) => (
              <li
                key={h.date}
                className="border-b pb-3 text-[13px] last:border-b-0 last:pb-0"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                  {h.date}
                </p>
                <p className="mt-0.5 leading-relaxed">{h.event}</p>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>

      {/* Board charter */}
      <Dialog
        open={panel === "charter"}
        onOpenChange={(o) => !o && setPanel(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{boardOfDirectors.name} — Charter</DialogTitle>
            <DialogDescription>
              {boardOfDirectors.charter.version}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
            <div>
              <p className="mb-1 text-[12.5px] font-bold text-muted-foreground">
                Purpose
              </p>
              <p className="text-[13px] leading-relaxed">
                {boardOfDirectors.charter.purpose}
              </p>
            </div>
            <div>
              <p className="mb-1.5 text-[12.5px] font-bold text-muted-foreground">
                Operating principles
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed">
                {boardOfDirectors.charter.principles.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
