import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  fetchPendingGovernanceCodes,
  decideGovernanceCode,
  type PendingGovernanceCode,
} from "@/lib/board-api";

export default function GovernanceCodeApprovals() {
  const qc = useQueryClient();
  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["board-governance-codes"],
    queryFn: fetchPendingGovernanceCodes,
  });

  const pending = codes.filter((c) => c.myDecision === "Pending");
  const decided = codes.filter(
    (c) => c.myDecision && c.myDecision !== "Pending",
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading governance codes…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Governance Codes</h1>
        <p className="text-sm text-muted-foreground">
          Board Charters, codes of conduct, and other governance codes your
          tenant has sent you to review and approve.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Awaiting your decision ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Nothing needs your review right now.
            </div>
          )}
          {pending.map((c) => (
            <CodeRow
              key={c.id}
              code={c}
              onDecided={() =>
                qc.invalidateQueries({ queryKey: ["board-governance-codes"] })
              }
            />
          ))}
        </CardContent>
      </Card>

      {decided.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your decisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {decided.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 border rounded-lg p-3"
              >
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.category} · v{c.version}
                  </div>
                </div>
                <Badge
                  variant={
                    c.myDecision === "Approved" ? "default" : "destructive"
                  }
                >
                  {c.myDecision === "Approved" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {c.myDecision}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CodeRow({
  code,
  onDecided,
}: {
  code: PendingGovernanceCode;
  onDecided: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  const decideMut = useMutation({
    mutationFn: (decision: "Approved" | "Rejected") =>
      decideGovernanceCode(code.id, decision, notes),
    onSuccess: (_res, decision) => {
      toast.success(
        decision === "Approved" ? "Approved" : "Sent back for review",
        {
          description:
            decision === "Approved"
              ? `${code.title} was recorded as approved.`
              : `${code.title} was sent back to internal review.`,
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
    <div className="flex items-center gap-3 border rounded-lg p-3">
      <BookOpen className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">{code.title}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {code.category} · v{code.version}
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
            <DialogTitle>{code.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="prose prose-sm max-w-none border rounded-md p-4 max-h-[50vh] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: code.body }}
            />
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
                <XCircle className="h-4 w-4 mr-1" />
                Send back for review
              </Button>
              <Button
                disabled={decideMut.isPending}
                onClick={() => decideMut.mutate("Approved")}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
