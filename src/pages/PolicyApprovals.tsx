import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  PenLine,
  ClipboardCheck,
  ShieldCheck,
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
import { cn } from "@/lib/utils";
import {
  fetchMyPolicyApprovals,
  decideMyPolicyApproval,
  fetchMyPolicyAcknowledgements,
  acknowledgeMyPolicy,
  resolveBoardFileUrl,
  type PendingPolicyApproval,
  type PendingPolicyAcknowledgement,
} from "@/lib/board-api";
import {
  DocumentPreviewDialog,
  type PreviewDocument,
} from "@/components/DocumentPreviewDialog";

function PolicyContentPreview({
  item,
  onPreview,
}: {
  item: {
    sections: { id: string; title: string; content: string }[];
    fileUrl: string | null;
    fileName: string;
  };
  onPreview: (doc: PreviewDocument) => void;
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
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onPreview({
            url: resolveBoardFileUrl(item.fileUrl)!,
            name: item.fileName || "document",
          })
        }
      >
        <FileText className="mr-1 h-4 w-4" />
        View {item.fileName || "document"}
      </Button>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      No content attached to this policy yet.
    </p>
  );
}

// Policy Approvals (Oct 2026, replaces the old "My Compliance" page) —
// the PO asked for everything about compliance obligations removed
// and the page redesigned around stat cards showing policies awaiting
// approval, awaiting acknowledgement, and already decided, "to make
// the page more engaging." The two real sections (approvals,
// acknowledgements) are unchanged functionally — just lifted up here
// so their counts can drive the stat cards at the top.
export default function PolicyApprovals() {
  const qc = useQueryClient();

  const { data: approvals = [], isLoading: approvalsLoading } = useQuery({
    queryKey: ["board-policy-approvals"],
    queryFn: fetchMyPolicyApprovals,
  });
  const { data: acks = [], isLoading: acksLoading } = useQuery({
    queryKey: ["board-policy-acknowledgements"],
    queryFn: fetchMyPolicyAcknowledgements,
  });

  const pendingApprovals = approvals.filter(
    (p) => p.myDecision === "Pending" || !p.myDecision,
  );
  const decidedApprovals = approvals.filter(
    (p) => p.myDecision && p.myDecision !== "Pending",
  );
  const outstandingAcks = acks.filter((p) => !p.alreadyAcknowledged);
  const doneAcks = acks.filter((p) => p.alreadyAcknowledged);
  const completedCount = decidedApprovals.length + doneAcks.length;

  const isLoading = approvalsLoading || acksLoading;

  const invalidateApprovals = () =>
    qc.invalidateQueries({ queryKey: ["board-policy-approvals"] });
  const invalidateAcks = () =>
    qc.invalidateQueries({ queryKey: ["board-policy-acknowledgements"] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Policy Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Policies the tenant has sent you to approve or acknowledge.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-amber-700">
              <ClipboardCheck className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Awaiting your approval
              </p>
              <p className="text-2xl font-extrabold">
                {isLoading ? "—" : pendingApprovals.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-info">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
              <PenLine className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Awaiting your acknowledgement
              </p>
              <p className="text-2xl font-extrabold">
                {isLoading ? "—" : outstandingAcks.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Past approvals
              </p>
              <p className="text-2xl font-extrabold">
                {isLoading ? "—" : completedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Awaiting your approval ({pendingApprovals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingApprovals.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No policies need your approval right now.
                  </div>
                )}
                {pendingApprovals.map((p) => (
                  <PolicyApprovalRow
                    key={p.id}
                    policy={p}
                    onDecided={invalidateApprovals}
                  />
                ))}
              </CardContent>
            </Card>

            {decidedApprovals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Your past approval decisions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {decidedApprovals.map((p) => (
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
                          p.myDecision === "Approved"
                            ? "default"
                            : "destructive"
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

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Awaiting your acknowledgement ({outstandingAcks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {outstandingAcks.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Nothing outstanding — you're up to date on every published
                    policy.
                  </div>
                )}
                {outstandingAcks.map((p) => (
                  <PolicyAckRow
                    key={p.id}
                    policy={p}
                    onAcknowledged={invalidateAcks}
                  />
                ))}
              </CardContent>
            </Card>

            {doneAcks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Already acknowledged
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {doneAcks.map((p) => (
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
        </div>
      )}
    </div>
  );
}

// ── Policies awaiting this director's approval ──────────────────

function PolicyApprovalRow({
  policy,
  onDecided,
}: {
  policy: PendingPolicyApproval;
  onDecided: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);

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
            <PolicyContentPreview item={policy} onPreview={setPreviewDoc} />
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
      <DocumentPreviewDialog
        doc={previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
        allowDownload={false}
      />
    </div>
  );
}

// ── Published policies this director still needs to acknowledge ──

function PolicyAckRow({
  policy,
  onAcknowledged,
}: {
  policy: PendingPolicyAcknowledgement;
  onAcknowledged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [signature, setSignature] = useState("");
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);

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
            <PolicyContentPreview item={policy} onPreview={setPreviewDoc} />
            <div>
              <label
                className={cn(
                  "mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground",
                )}
              >
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
      <DocumentPreviewDialog
        doc={previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
        allowDownload={false}
      />
    </div>
  );
}
