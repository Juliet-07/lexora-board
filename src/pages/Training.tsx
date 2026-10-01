import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  fetchMyTrainings,
  completeTraining,
  resolveBoardFileUrl,
  type MyTraining,
} from "@/lib/board-api";

const shortDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function CompleteTrainingDialog({
  training,
  open,
  onOpenChange,
}: {
  training: MyTraining;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const hasMaterial = !!training.resourceUrl;

  const mut = useMutation({
    mutationFn: () => completeTraining(training._id, file ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board-my-trainings"] });
      toast.success("Training marked complete.");
      onOpenChange(false);
      setFile(null);
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ??
          "Failed to mark this training complete.",
      ),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{training.title}</DialogTitle>
          <DialogDescription>
            {training.provider && `${training.provider} · `}
            {training.cpdHours} CPD hrs
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {hasMaterial ? (
            <>
              <a
                href={resolveBoardFileUrl(training.resourceUrl!)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-primary underline"
              >
                <Paperclip className="h-4 w-4" />
                {training.resourceName || "Open training material"}
              </a>
              <p className="text-xs text-muted-foreground">
                Review the material above, then mark this training complete.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                No material was attached to this training. Upload proof of
                completion (a certificate or screenshot) instead.
              </p>
              <div className="space-y-1.5">
                <Label>Proof of completion</Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={mut.isPending || (!hasMaterial && !file)}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
            )}
            Mark complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Training() {
  const {
    data: trainings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["board-my-trainings"],
    queryFn: fetchMyTrainings,
  });
  const [target, setTarget] = useState<MyTraining | null>(null);

  const completed = trainings.filter((t) => t.myCompletion);
  const outstanding = trainings.filter((t) => !t.myCompletion);
  const mandatory = trainings.filter((t) => t.mandatory);
  const mandatoryDone = mandatory.filter((t) => t.myCompletion).length;
  const cpdHours = completed.reduce((sum, t) => sum + t.cpdHours, 0);
  const cpdYear = new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your trainings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Training &amp; CPD
        </h1>
        <p className="text-sm text-muted-foreground">
          Trainings assigned to you by the board, your continuing professional
          development record, and certificates.
        </p>
      </div>

      {isError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn't load your trainings. Try refreshing the page.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              CPD hours ({cpdYear})
            </p>
            <p className="text-xl font-extrabold">{cpdHours}</p>
            <p className="text-xs text-muted-foreground">
              From {completed.length} completed training
              {completed.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              Mandatory trainings
            </p>
            <p
              className={cn(
                "text-xl font-extrabold",
                mandatoryDone === mandatory.length
                  ? "text-success"
                  : "text-amber-700",
              )}
            >
              {mandatoryDone} / {mandatory.length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              Outstanding
            </p>
            <p
              className={cn(
                "text-xl font-extrabold",
                outstanding.length > 0 ? "text-amber-700" : "text-success",
              )}
            >
              {outstanding.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {outstanding.length > 0
                ? outstanding.map((t) => t.title).join(", ")
                : "Nothing outstanding"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-bold">Your course record</p>
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>CPD</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map((t) => {
                  const overdue =
                    !t.myCompletion &&
                    !!t.dueDate &&
                    new Date(t.dueDate) < new Date();
                  return (
                    <TableRow
                      key={t._id}
                      className={cn(!t.myCompletion && "bg-warning/10")}
                    >
                      <TableCell className="whitespace-nowrap font-semibold">
                        {t.title}
                        {t.mandatory && (
                          <div className="text-xs font-normal text-muted-foreground">
                            Mandatory
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.provider || "—"}
                      </TableCell>
                      <TableCell>{t.cpdHours}</TableCell>
                      <TableCell
                        className={cn(
                          overdue && "font-medium text-destructive",
                        )}
                      >
                        {shortDate(t.dueDate)}
                      </TableCell>
                      <TableCell>
                        {t.myCompletion ? (
                          <Badge className="bg-success/10 text-success hover:bg-success/10">
                            Complete
                          </Badge>
                        ) : overdue ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">
                            Assigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.myCompletion ? (
                          t.myCompletion.method ===
                            "Proof of completion uploaded" &&
                          t.myCompletion.proofFileUrl ? (
                            <a
                              href={resolveBoardFileUrl(
                                t.myCompletion.proofFileUrl,
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button size="sm" variant="outline">
                                <Award className="mr-1.5 h-3.5 w-3.5" /> View
                                proof
                              </Button>
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Completed {shortDate(t.myCompletion.completedAt)}
                            </span>
                          )
                        ) : (
                          <Button size="sm" onClick={() => setTarget(t)}>
                            {t.resourceUrl ? (
                              <>
                                <FileText className="mr-1.5 h-3.5 w-3.5" /> View
                                &amp; complete
                              </>
                            ) : (
                              <>
                                <UploadCloud className="mr-1.5 h-3.5 w-3.5" />{" "}
                                Upload proof
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {trainings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-1 py-6">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        No trainings assigned yet.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {target && (
        <CompleteTrainingDialog
          training={target}
          open={!!target}
          onOpenChange={(o) => !o && setTarget(null)}
        />
      )}
    </div>
  );
}
