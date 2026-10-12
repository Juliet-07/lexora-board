import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  fetchMyResolutions,
  castMyResolutionVote,
  respondMyResolution,
  type MyResolution,
  type MyVoteChoice,
} from "@/lib/board-api";

const VOTE_LABEL: Record<MyVoteChoice, string> = {
  Approve: "Approve",
  Oppose: "Reject",
  Abstain: "Abstain",
};

export default function Resolutions() {
  const queryClient = useQueryClient();
  const { data: resolutions = [], isLoading } = useQuery({
    queryKey: ["board-resolutions"],
    queryFn: fetchMyResolutions,
  });
  const [votes, setVotes] = useState<Record<string, MyVoteChoice>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["board-resolutions"] });

  const voteMut = useMutation({
    mutationFn: (v: {
      res: MyResolution;
      choice: MyVoteChoice;
      comment: string;
    }) =>
      v.res.type === "Board"
        ? castMyResolutionVote(v.res._id, v.choice, v.comment)
        : respondMyResolution(v.res._id, v.choice, v.comment),
    onSuccess: () => {
      invalidate();
      toast.success("Vote recorded.");
    },
    onError: (err: any) =>
      toast(err?.response?.data?.message ?? "Failed to record vote."),
  });

  const submitVote = (res: MyResolution) => {
    const choice = votes[res._id];
    if (!choice) {
      toast("Select Approve, Reject, or Abstain first.");
      return;
    }
    voteMut.mutate({ res, choice, comment: comments[res._id] ?? "" });
  };

  const pending = resolutions.filter((r) => r.canAct);
  const voted = resolutions.filter(
    (r) =>
      !r.canAct && r.myRow && (r.myRow.vote || r.myRow.status === "Responded"),
  );
  const all = resolutions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading resolutions…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resolutions</h1>
        <p className="text-sm text-muted-foreground">
          Circular resolutions requiring your vote, and a record of all
          resolutions.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Awaiting my vote ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="voted">Voted</TabsTrigger>
          <TabsTrigger value="all">All resolutions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3.5">
          {pending.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Nothing awaiting your vote.
              </CardContent>
            </Card>
          )}
          {pending.map((res) => (
            <Card key={res._id} className="border-l-4 border-l-primary">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-bold">
                      {res.reference}: {res.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {res.type}
                      {res.deadline &&
                        ` · Response deadline: ${new Date(res.deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    Vote required
                  </Badge>
                </div>

                <div
                  className="rounded-lg bg-primary/5 p-3 text-sm leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: res.fullText }}
                />

                <div className="space-y-2">
                  <p className="text-sm font-bold">Cast your vote:</p>
                  <RadioGroup
                    value={votes[res._id] ?? ""}
                    onValueChange={(v) =>
                      setVotes((s) => ({ ...s, [res._id]: v as MyVoteChoice }))
                    }
                    className="gap-2"
                  >
                    {(["Approve", "Oppose", "Abstain"] as MyVoteChoice[]).map(
                      (choice) => (
                        <label
                          key={choice}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-sm font-semibold transition-colors",
                            votes[res._id] === choice
                              ? "border-primary bg-primary/5"
                              : "border-border",
                          )}
                        >
                          <RadioGroupItem value={choice} />
                          {VOTE_LABEL[choice]}
                        </label>
                      ),
                    )}
                  </RadioGroup>
                </div>

                <div className="space-y-1.5">
                  <Label>Comments (optional)</Label>
                  <Textarea
                    value={comments[res._id] ?? ""}
                    onChange={(e) =>
                      setComments((s) => ({ ...s, [res._id]: e.target.value }))
                    }
                    placeholder="Add conditions or reasoning..."
                    className="min-h-[70px]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Votes cast: {res.tally.total - res.tally.awaiting} of{" "}
                    {res.tally.total}
                  </p>
                  <Button
                    onClick={() => submitVote(res)}
                    disabled={voteMut.isPending}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Submit vote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="voted">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resolution</TableHead>
                      <TableHead>My vote</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voted.map((v) => (
                      <TableRow key={v._id}>
                        <TableCell className="whitespace-nowrap font-semibold">
                          {v.reference}: {v.subject}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-success/10 text-success hover:bg-success/10">
                            {v.myRow?.vote ? VOTE_LABEL[v.myRow.vote] : "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {v.outcome ? (
                            <Badge
                              className={cn(
                                v.outcome === "Passed"
                                  ? "bg-success/10 text-success hover:bg-success/10"
                                  : "bg-destructive/10 text-destructive hover:bg-destructive/10",
                              )}
                            >
                              {v.outcome}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-border bg-muted text-muted-foreground hover:bg-muted"
                            >
                              Pending other votes
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {voted.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground py-8"
                        >
                          Nothing voted on yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Effective</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {all.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell className="whitespace-nowrap font-semibold">
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            {r.reference}
                          </span>
                        </TableCell>
                        <TableCell>{r.subject}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {r.type}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {new Date(r.effectiveDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {r.outcome ? (
                            <Badge className="bg-success/10 text-success hover:bg-success/10">
                              {r.outcome}
                            </Badge>
                          ) : (
                            <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">
                              {r.status}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {all.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No resolutions yet.
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
    </div>
  );
}
