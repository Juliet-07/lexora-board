import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PenLine, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  fetchEsgApprovals,
  decideEsgApproval,
  fetchEsgCommitteeApprovals,
  decideEsgCommitteeApproval,
  resolveBoardFileUrl,
} from "@/lib/board-api";

type EsigningRole = "ESG Committee Chair" | "Board Chair";

// A unified shape over both board-portal dockets — a director can
// show up in either, or both, so the page merges them into one list
// tagged by role rather than rendering two separate pages. Only the
// Board Chair's items carry a prior-reviewer snapshot (esgChairName/
// esgChairDecidedAt); the Committee Chair is always the first step,
// so there's nothing before them to show.
interface EsigningItem {
  role: EsigningRole;
  id: string;
  code: string;
  title: string;
  requirement: string;
  response: string;
  evidence: { _id?: string; name: string; fileUrl: string | null }[];
  frameworkLabel: string;
  myDecision: "Pending" | "Approved" | "Declined";
  myNotes: string;
  myDecidedAt: string | null;
  esgChairName?: string;
  esgChairDecidedAt?: string | null;
}

const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

export default function ESigning() {
  const qc = useQueryClient();

  const boardChairQuery = useQuery({
    queryKey: ["board-esg-approvals"],
    queryFn: fetchEsgApprovals,
  });
  const committeeChairQuery = useQuery({
    queryKey: ["board-esg-committee-approvals"],
    queryFn: fetchEsgCommitteeApprovals,
  });
  const isLoading = boardChairQuery.isLoading || committeeChairQuery.isLoading;

  const items: EsigningItem[] = [
    ...(committeeChairQuery.data ?? []).map((i) => ({
      ...i,
      role: "ESG Committee Chair" as const,
    })),
    ...(boardChairQuery.data ?? []).map((i) => ({
      ...i,
      role: "Board Chair" as const,
    })),
  ];

  const awaiting = items.filter((i) => i.myDecision === "Pending");
  const decided = items.filter((i) => i.myDecision !== "Pending");

  const [target, setTarget] = useState<EsigningItem | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [notes, setNotes] = useState("");

  const closeDialog = () => {
    setTarget(null);
    setConfirmed(false);
    setFullName("");
    setNotes("");
  };

  const decideMut = useMutation({
    mutationFn: ({ decision }: { decision: "Approved" | "Declined" }) => {
      if (!target) return Promise.reject(new Error("No disclosure selected"));
      return target.role === "ESG Committee Chair"
        ? decideEsgCommitteeApproval(
            target.id,
            decision,
            notes.trim() || undefined,
          )
        : decideEsgApproval(target.id, decision, notes.trim() || undefined);
    },
    onSuccess: (_res, { decision }) => {
      toast.success(
        decision === "Approved" ? "Signature applied" : "Declined",
        {
          description:
            decision === "Approved"
              ? `${target?.code} — ${target?.title} has been signed off.`
              : `${target?.code} — ${target?.title} was sent back for revision.`,
        },
      );
      qc.invalidateQueries({ queryKey: ["board-esg-approvals"] });
      qc.invalidateQueries({ queryKey: ["board-esg-committee-approvals"] });
      closeDialog();
    },
    onError: (e: any) =>
      toast.error("Could not record your decision", {
        description: e?.response?.data?.message ?? e.message,
      }),
  });

  const applySignature = () => {
    if (!target) return;
    if (!confirmed || !fullName.trim()) {
      toast(
        "Confirm you've read the disclosure and type your full name to sign.",
      );
      return;
    }
    decideMut.mutate({ decision: "Approved" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your docket…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">E-Signing</h1>
        <p className="text-sm text-muted-foreground">
          ESG disclosures awaiting your review — as ESG Committee Chair, the
          first step in the chain, or as Board Chair once the Committee Chair
          has reviewed.
        </p>
      </div>

      <Tabs defaultValue="awaiting">
        <TabsList>
          <TabsTrigger value="awaiting">
            Awaiting action ({awaiting.length})
          </TabsTrigger>
          <TabsTrigger value="signed">History</TabsTrigger>
        </TabsList>

        <TabsContent value="awaiting" className="space-y-2.5">
          {awaiting.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Nothing awaiting your review or signature.
              </CardContent>
            </Card>
          )}
          {awaiting.map((doc) => (
            <Card
              key={`${doc.role}-${doc.id}`}
              className="cursor-pointer"
              onClick={() => setTarget(doc)}
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-amber-700">
                  <PenLine className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {doc.code} — {doc.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.frameworkLabel}
                    {doc.role === "Board Chair" &&
                      doc.esgChairName &&
                      ` · Reviewed by ${doc.esgChairName}${doc.esgChairDecidedAt ? ` on ${fmtDate(doc.esgChairDecidedAt)}` : ""}`}
                  </p>
                </div>
                <Badge variant="outline" className="whitespace-nowrap">
                  {doc.role}
                </Badge>
                <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">
                  Pending
                </Badge>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTarget(doc);
                  }}
                >
                  Sign
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="signed">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Disclosure</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Decided on</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decided.map((doc) => (
                      <TableRow key={`${doc.role}-${doc.id}`}>
                        <TableCell className="whitespace-nowrap font-semibold">
                          {doc.code} — {doc.title}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {doc.role}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              doc.myDecision === "Approved"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {doc.myDecision === "Approved" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {doc.myDecision}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {fmtDate(doc.myDecidedAt) || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {decided.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-xs text-muted-foreground py-8"
                        >
                          Nothing decided yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!target} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review &amp; sign disclosure</DialogTitle>
            <DialogDescription>
              {target?.code} — {target?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {target?.requirement && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs italic text-muted-foreground">
                {target.requirement}
              </div>
            )}
            <div className="rounded-lg border bg-primary/5 p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {target?.response || "No response has been recorded yet."}
            </div>
            {!!target?.evidence?.length && (
              <div className="space-y-1">
                <Label className="text-xs">Evidence</Label>
                {target.evidence.map((ev, idx) => (
                  <div
                    key={ev._id ?? idx}
                    className="flex justify-between border rounded px-2 py-1.5 text-xs"
                  >
                    <span>{ev.name}</span>
                    {ev.fileUrl && (
                      <a
                        href={resolveBoardFileUrl(ev.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            {target?.role === "Board Chair" ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Reviewed by {target?.esgChairName || "the ESG Committee Chair"}
                {target?.esgChairDecidedAt &&
                  ` on ${fmtDate(target.esgChairDecidedAt)}`}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                You're reviewing this as the first step in the approval chain —
                the Board Chair signs next, once you approve.
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any comments…"
              />
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
              <Checkbox
                id="esign-confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="esign-confirm"
                className="text-xs font-normal leading-relaxed"
              >
                I have read and understood this disclosure. By clicking "Apply
                signature" I electronically sign it as{" "}
                {target?.role ?? "reviewer"}.
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label>Type your full name to sign</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Upendo Mbeki"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={decideMut.isPending}
                onClick={() => decideMut.mutate({ decision: "Declined" })}
              >
                <XCircle className="mr-1.5 h-4 w-4" /> Decline
              </Button>
              <Button disabled={decideMut.isPending} onClick={applySignature}>
                <PenLine className="mr-1.5 h-4 w-4" /> Apply signature
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
