import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldAlert,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  PenLine,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  complianceObligations,
  doInsurance,
  type ComplianceStatus,
} from "@/data/complianceMockData";
import {
  fetchMyPolicyApprovals,
  decideMyPolicyApproval,
  fetchMyPolicyAcknowledgements,
  acknowledgeMyPolicy,
  resolveBoardFileUrl,
  type PendingPolicyApproval,
  type PendingPolicyAcknowledgement,
} from "@/lib/board-api";

function statusBadge(status: ComplianceStatus) {
  switch (status) {
    case "overdue":
      return (
        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">
          Overdue
        </Badge>
      );
    case "due-soon":
      return (
        <Badge className="bg-info/10 text-info hover:bg-info/10">
          Due soon
        </Badge>
      );
    case "active":
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/10">
          Active
        </Badge>
      );
    case "complete":
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/10">
          Complete
        </Badge>
      );
    default:
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/10">
          Current
        </Badge>
      );
  }
}

function PolicyContentPreview({
  item,
}: {
  item: {
    sections: { id: string; title: string; content: string }[];
    fileUrl: string | null;
    fileName: string;
  };
}) {
  if (item.sections.length > 0) {
    return (
      <div className="max-h-[50vh] space-y-4 overflow-y-auto rounded-md border p-4">
        {item.sections
          .slice()
          .sort((a, b) => (a as any).order - (b as any).order)
          .map((s) => (
            <div key={s.id}>
              <p className="mb-1 text-sm font-bold">{s.title}</p>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: s.content }}
              />
            </div>
          ))}
      </div>
    );
  }
  if (item.fileUrl) {
    return (
      <Button size="sm" variant="outline" asChild>
        <a
          href={resolveBoardFileUrl(item.fileUrl)}
          target="_blank"
          rel="noreferrer"
        >
          <FileText className="mr-1 h-4 w-4" />
          View {item.fileName || "document"}
        </a>
      </Button>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      No content attached to this policy yet.
    </p>
  );
}

export default function Compliance() {
  const overdueCount = complianceObligations.filter(
    (o) => o.status === "overdue",
  ).length;
  const upcomingCount = complianceObligations.filter(
    (o) => o.status === "due-soon",
  ).length;
  const currentCount = complianceObligations.length - overdueCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Compliance</h1>
        <p className="text-sm text-muted-foreground">
          Policies the tenant has sent you to approve or acknowledge, plus your
          own statutory and regulatory obligations.
        </p>
      </div>

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="obligations">My Obligations</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <PolicyApprovalsSection />
          <PolicyAcknowledgementsSection />
        </TabsContent>

        <TabsContent value="obligations" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="space-y-1 p-5">
                <p className="text-xs font-semibold text-muted-foreground">
                  Overall status
                </p>
                <p
                  className={cn(
                    "text-base font-bold",
                    overdueCount > 0 ? "text-amber-700" : "text-success",
                  )}
                >
                  {overdueCount > 0 ? "Attention needed" : "All current"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {overdueCount} overdue, {upcomingCount} upcoming
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 p-5">
                <p className="text-xs font-semibold text-muted-foreground">
                  Items current
                </p>
                <p className="text-lg font-extrabold text-success">
                  {currentCount} / {complianceObligations.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Obligations tracked
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 p-5">
                <p className="text-xs font-semibold text-muted-foreground">
                  D&amp;O Insurance
                </p>
                <p className="text-base font-bold text-success">Active</p>
                <p className="text-xs text-muted-foreground">
                  Expires 31 Mar 2027
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-bold">Compliance obligations</p>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Obligation</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Last completed</TableHead>
                      <TableHead>Next due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceObligations.map((o) => (
                      <TableRow
                        key={o.id}
                        className={cn(o.highlighted && "bg-warning/10")}
                      >
                        <TableCell className="whitespace-nowrap font-semibold">
                          {o.obligation}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {o.requirement}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {o.lastCompleted}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "whitespace-nowrap",
                            o.status === "overdue" &&
                              "font-semibold text-destructive",
                          )}
                        >
                          {o.nextDue}
                        </TableCell>
                        <TableCell>{statusBadge(o.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-bold">D&amp;O Insurance details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Insurer</span>
                  <span className="font-medium">{doInsurance.insurer}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Policy number</span>
                  <span className="font-medium">
                    {doInsurance.policyNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className="font-medium">{doInsurance.coverage}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Policy period</span>
                  <span className="font-medium">
                    {doInsurance.policyPeriod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Covers</span>
                  <span className="font-medium">{doInsurance.covers}</span>
                </div>
              </div>
              <Button size="sm" variant="outline">
                View policy summary
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Policies awaiting this director's approval ──────────────────

function PolicyApprovalsSection() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["board-policy-approvals"],
    queryFn: fetchMyPolicyApprovals,
  });

  const pending = items.filter(
    (p) => p.myDecision === "Pending" || !p.myDecision,
  );
  const decided = items.filter(
    (p) => p.myDecision && p.myDecision !== "Pending",
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading policy approvals…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Awaiting your approval ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No policies need your approval right now.
            </div>
          )}
          {pending.map((p) => (
            <PolicyApprovalRow
              key={p.id}
              policy={p}
              onDecided={() =>
                qc.invalidateQueries({ queryKey: ["board-policy-approvals"] })
              }
            />
          ))}
        </CardContent>
      </Card>

      {decided.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Your past approval decisions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {decided.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.category} · {p.version}
                  </div>
                </div>
                <Badge
                  variant={
                    p.myDecision === "Approved" ? "default" : "destructive"
                  }
                >
                  {p.myDecision === "Approved" ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <XCircle className="mr-1 h-3 w-3" />
                  )}
                  {p.myDecision}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PolicyApprovalRow({
  policy,
  onDecided,
}: {
  policy: PendingPolicyApproval;
  onDecided: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  const decideMut = useMutation({
    mutationFn: (decision: "Approved" | "Rejected") =>
      decideMyPolicyApproval(policy.id, decision, notes),
    onSuccess: (_res, decision) => {
      toast.success(
        decision === "Approved" ? "Approved" : "Sent back for review",
        {
          description:
            decision === "Approved"
              ? `${policy.title} was recorded as approved.`
              : `${policy.title} was sent back to the tenant for review.`,
        },
      );
      setOpen(false);
      onDecided();
    },
    onError: (e: any) =>
      toast.error("Could not record your decision", {
        description: e?.response?.data?.message ?? e.message,
      }),
  });

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <FileText className="h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{policy.title}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {policy.category} · {policy.version}
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Review
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{policy.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {policy.description && (
              <p className="text-sm text-muted-foreground">
                {policy.description}
              </p>
            )}
            <PolicyContentPreview item={policy} />
            <div>
              <Textarea
                rows={2}
                placeholder="Notes (optional) — shared with the tenant"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={decideMut.isPending}
                onClick={() => decideMut.mutate("Rejected")}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Send back for review
              </Button>
              <Button
                disabled={decideMut.isPending}
                onClick={() => decideMut.mutate("Approved")}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Published policies this director still needs to acknowledge ──

function PolicyAcknowledgementsSection() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["board-policy-acknowledgements"],
    queryFn: fetchMyPolicyAcknowledgements,
  });

  const outstanding = items.filter((p) => !p.alreadyAcknowledged);
  const acknowledged = items.filter((p) => p.alreadyAcknowledged);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading policies to acknowledge…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Awaiting your acknowledgement ({outstanding.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {outstanding.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nothing outstanding — you're up to date on every published policy.
            </div>
          )}
          {outstanding.map((p) => (
            <PolicyAckRow
              key={p.id}
              policy={p}
              onAcknowledged={() =>
                qc.invalidateQueries({
                  queryKey: ["board-policy-acknowledgements"],
                })
              }
            />
          ))}
        </CardContent>
      </Card>

      {acknowledged.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Already acknowledged</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {acknowledged.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.category} · {p.version}
                    {p.ackedAt &&
                      ` · Acknowledged ${new Date(p.ackedAt).toLocaleDateString()}`}
                  </div>
                </div>
                <Badge className="bg-success/10 text-success hover:bg-success/10">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Acknowledged
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PolicyAckRow({
  policy,
  onAcknowledged,
}: {
  policy: PendingPolicyAcknowledgement;
  onAcknowledged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [signature, setSignature] = useState("");

  const ackMut = useMutation({
    mutationFn: () => acknowledgeMyPolicy(policy.id, signature),
    onSuccess: () => {
      toast.success("Acknowledged", {
        description: `${policy.title} has been recorded as acknowledged.`,
      });
      setOpen(false);
      setSignature("");
      onAcknowledged();
    },
    onError: (e: any) =>
      toast.error("Could not record your acknowledgement", {
        description: e?.response?.data?.message ?? e.message,
      }),
  });

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <FileText className="h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{policy.title}</div>
        <div className="text-xs text-muted-foreground">
          {policy.category} · {policy.version}
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Review &amp; acknowledge
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{policy.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {policy.description && (
              <p className="text-sm text-muted-foreground">
                {policy.description}
              </p>
            )}
            <PolicyContentPreview item={policy} />
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <PenLine className="h-3 w-3" />
                Type your full name to acknowledge
              </label>
              <Input
                placeholder="Your full name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                disabled={!signature.trim() || ackMut.isPending}
                onClick={() => ackMut.mutate()}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Acknowledge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
