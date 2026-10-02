import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  allResolutions, pendingResolutions, votedResolutions,
  type AllResolutionRow, type PendingResolution, type VoteChoice, type VotedResolution,
} from "@/data/resolutionsMockData";

export default function Resolutions() {
  const [pending, setPending] = useState<PendingResolution[]>(pendingResolutions);
  const [voted, setVoted] = useState<VotedResolution[]>(votedResolutions);
  const [allRows, setAllRows] = useState<AllResolutionRow[]>(allResolutions);
  const [votes, setVotes] = useState<Record<string, VoteChoice>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const submitVote = (res: PendingResolution) => {
    const choice = votes[res.id];
    if (!choice) {
      toast("Select Approve, Reject, or Abstain first.");
      return;
    }
    setPending((p) => p.filter((r) => r.id !== res.id));
    setVoted((v) => [
      { id: res.id, title: `${res.ref}: ${res.title}`, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), myVote: choice, outcome: "Pending other votes" },
      ...v,
    ]);
    setAllRows((rows) => rows.map((r) => (r.ref === res.ref ? { ...r, outcome: "passed" } : r)));
    toast.success(`Vote recorded: ${choice}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resolutions</h1>
        <p className="text-sm text-muted-foreground">Circular resolutions requiring your vote, and a record of all resolutions.</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Awaiting my vote ({pending.length})</TabsTrigger>
          <TabsTrigger value="voted">Voted</TabsTrigger>
          <TabsTrigger value="all">All resolutions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3.5">
          {pending.length === 0 && (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Nothing awaiting your vote.</CardContent></Card>
          )}
          {pending.map((res) => (
            <Card key={res.id} className="border-l-4 border-l-primary">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-bold">{res.ref}: {res.title}</p>
                    <p className="text-xs text-muted-foreground">{res.type} · Voting closes: {res.votingCloses}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Vote required</Badge>
                </div>

                <div className="rounded-lg bg-primary/5 p-3 text-sm leading-relaxed">
                  <span className="font-bold">RESOLVED THAT</span> {res.body.replace(/^RESOLVED THAT /, "")}
                </div>

                {res.supportingDocs.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Supporting docs: {res.supportingDocs.map((d, i) => (
                      <span key={d}>
                        <button
                          className="text-primary underline"
                          onClick={() => toast(d, { description: "Demo only: document preview isn't wired up yet." })}
                        >
                          {d}
                        </button>
                        {i < res.supportingDocs.length - 1 && " · "}
                      </span>
                    ))}
                  </p>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-bold">Cast your vote:</p>
                  <RadioGroup
                    value={votes[res.id] ?? ""}
                    onValueChange={(v) => setVotes((s) => ({ ...s, [res.id]: v as VoteChoice }))}
                    className="gap-2"
                  >
                    {(["Approve", "Reject", "Abstain"] as VoteChoice[]).map((choice) => (
                      <label
                        key={choice}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-sm font-semibold transition-colors",
                          votes[res.id] === choice ? "border-primary bg-primary/5" : "border-border",
                        )}
                      >
                        <RadioGroupItem value={choice} />
                        {choice}
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-1.5">
                  <Label>Comments (optional)</Label>
                  <Textarea
                    value={comments[res.id] ?? ""}
                    onChange={(e) => setComments((s) => ({ ...s, [res.id]: e.target.value }))}
                    placeholder="Add conditions or reasoning..."
                    className="min-h-[70px]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Votes cast: {res.votesCast} of {res.totalDirectors} · Quorum: {res.quorum}</p>
                  <Button onClick={() => submitVote(res)}>
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
                      <TableHead>Date</TableHead>
                      <TableHead>My vote</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voted.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="whitespace-nowrap font-semibold">{v.title}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{v.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-success/10 text-success hover:bg-success/10">{v.myVote}</Badge>
                        </TableCell>
                        <TableCell>
                          {v.outcome.startsWith("Passed") ? (
                            <Badge className="bg-success/10 text-success hover:bg-success/10">{v.outcome}</Badge>
                          ) : (
                            <Badge variant="outline" className="border-border bg-muted text-muted-foreground hover:bg-muted">{v.outcome}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
                      <TableHead>Date</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRows.map((r) => (
                      <TableRow key={r.ref}>
                        <TableCell className="whitespace-nowrap font-semibold">
                          <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{r.ref}</span>
                        </TableCell>
                        <TableCell>{r.description}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{r.type}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{r.date}</TableCell>
                        <TableCell>
                          {r.outcome === "passed" ? (
                            <Badge className="bg-success/10 text-success hover:bg-success/10">Passed</Badge>
                          ) : (
                            <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">Open</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
