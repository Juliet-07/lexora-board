import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  fetchPublishedGovernanceCodes,
  resolveBoardFileUrl,
  type PendingGovernanceCode,
  type PublishedGovernanceCode,
} from "@/lib/board-api";
import {
  DocumentPreviewDialog,
  type PreviewDocument,
} from "@/components/DocumentPreviewDialog";

export default function GovernanceCodeApprovals() {
  const qc = useQueryClient();
  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["board-governance-codes"],
    queryFn: fetchPendingGovernanceCodes,
  });
  // The board's own read-only code library — every Published code for
  // the tenant, not just ones this director has a decision row for
  // (Oct 2026: "after a governance code is approved by board and
  // published, the board member should be able to see the governance
  // codes that are published and can read the document").
  const { data: published = [], isLoading: publishedLoading } = useQuery({
    queryKey: ["board-governance-codes-published"],
    queryFn: fetchPublishedGovernanceCodes,
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

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">To review</TabsTrigger>
          <TabsTrigger value="published">
            Published library ({published.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-6 mt-4">
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
                    qc.invalidateQueries({
                      queryKey: ["board-governance-codes"],
                    })
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
        </TabsContent>

        <TabsContent value="published" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Published codes ({published.length})
              </CardTitle>
              <CardDescription>
                Every governance code your tenant has published — read the text
                or view the uploaded document, the same way you would in your
                Document Vault. Viewing only; these aren't downloadable from
                here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {publishedLoading ? (
                <div className="flex justify-center py-10 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading published codes…
                </div>
              ) : published.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  Nothing published yet.
                </div>
              ) : (
                published.map((c) => <PublishedCodeRow key={c.id} code={c} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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

// A published code's row in the library tab — "Read code" opens the
// same rich-text body the approval dialog shows, and each uploaded
// document attachment gets its own "View document" button that opens
// it through DocumentPreviewDialog with allowDownload={false}, the
// exact same viewable-but-not-downloadable pattern Document Vault
// uses for the director's own files (see Vault.tsx).
function PublishedCodeRow({ code }: { code: PublishedGovernanceCode }) {
  const [bodyOpen, setBodyOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);
  const hasBody = !!code.body?.replace(/<[^>]*>/g, "").trim();
  const documents = code.documents.filter((d) => d.fileUrl);

  return (
    <div className="flex flex-wrap items-center gap-3 border rounded-lg p-3">
      <BookOpen className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">{code.title}</div>
        <div className="text-xs text-muted-foreground">
          {code.category} · v{code.version}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {hasBody && (
          <Dialog open={bodyOpen} onOpenChange={setBodyOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                Read code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{code.title}</DialogTitle>
              </DialogHeader>
              <div
                className="prose prose-sm max-w-none border rounded-md p-4 max-h-[60vh] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: code.body }}
              />
            </DialogContent>
          </Dialog>
        )}
        {documents.map((doc, i) => (
          <Button
            key={i}
            size="sm"
            variant="outline"
            onClick={() =>
              setPreviewDoc({
                url: resolveBoardFileUrl(doc.fileUrl!),
                name: doc.name || code.title,
              })
            }
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {documents.length > 1 ? doc.name : "View document"}
          </Button>
        ))}
        {!hasBody && documents.length === 0 && (
          <Badge variant="outline" className="text-muted-foreground">
            No content yet
          </Badge>
        )}
      </div>

      <DocumentPreviewDialog
        doc={previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
        allowDownload={false}
      />
    </div>
  );
}
