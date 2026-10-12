import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  evaluationSections,
  type EvalSection,
} from "@/data/evaluationsMockData";
import {
  fetchMyEvaluationContext,
  fetchMyEvaluationHistory,
  submitMySelfEvaluation,
  submitMyPeerEvaluation,
  submitMyChairEvaluation,
  submitMyCommitteeEvaluation,
  type EvaluationSubmission,
} from "@/lib/board-api";

const RATING_LABELS = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

const sectionByKey = (key: EvalSection["key"]) =>
  evaluationSections.find((s) => s.key === key)!.questions;

function RatingRow({
  questionNum,
  text,
  value,
  onChange,
}: {
  questionNum: number;
  text: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2 border-b py-3.5 last:border-b-0">
      <p className="text-sm font-medium">
        {questionNum}. {text}
      </p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            title={RATING_LABELS[n - 1]}
            onClick={() => onChange(n)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// One rating+comment+submit form, reused for self, each peer, the
// chair, and each committee — the only thing that changes per use is
// the question bank and which existing submission (if any) to prefill
// from, so a director can revise their own answers before the cycle
// closes.
function QuestionForm({
  questions,
  initial,
  onSubmit,
  submitting,
}: {
  questions: { id: string; text: string }[];
  initial?: EvaluationSubmission | null;
  onSubmit: (
    ratings: { question: string; score: number }[],
    comment: string,
  ) => void;
  submitting: boolean;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  useEffect(() => {
    const map: Record<string, number> = {};
    if (initial) {
      for (const q of questions) {
        const match = initial.ratings.find((r) => r.question === q.text);
        if (match) map[q.id] = match.score;
      }
    }
    setRatings(map);
    setComment(initial?.comment ?? "");
  }, [initial, questions]);

  const answered = Object.keys(ratings).length;

  const handleSubmit = () => {
    if (answered < questions.length) {
      toast(`Rate all ${questions.length} statements first.`, {
        description: `${answered}/${questions.length} answered so far.`,
      });
      return;
    }
    onSubmit(
      questions.map((q) => ({ question: q.text, score: ratings[q.id] })),
      comment,
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Rate each statement: 1 (strongly disagree) to 5 (strongly agree).
      </p>
      <div>
        {questions.map((q, i) => (
          <RatingRow
            key={q.id}
            questionNum={i + 1}
            text={q.text}
            value={ratings[q.id] ?? 0}
            onChange={(v) => setRatings((r) => ({ ...r, [q.id]: v }))}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        <Label>Additional comments</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any further observations..."
          className="min-h-[80px]"
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        {initial ? (
          <span className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Submitted {new Date(initial.submittedAt).toLocaleDateString()}
          </span>
        ) : (
          <span />
        )}
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  );
}

function LockedCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="py-6 text-center text-sm text-muted-foreground">
          Complete self-assessment first.
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function TargetPicker<T extends { id: string; name: string }>({
  targets,
  doneIds,
  selectedId,
  onSelect,
}: {
  targets: T[];
  doneIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {targets.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            selectedId === t.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-primary/50",
          )}
        >
          {doneIds.has(t.id) && (
            <CheckCircle2 className="mr-1 inline h-3 w-3" />
          )}
          {t.name}
        </button>
      ))}
    </div>
  );
}

export default function Evaluations() {
  const queryClient = useQueryClient();
  const { data: ctx, isLoading } = useQuery({
    queryKey: ["board-eval-context"],
    queryFn: fetchMyEvaluationContext,
  });
  const { data: history = [] } = useQuery({
    queryKey: ["board-eval-history"],
    queryFn: fetchMyEvaluationHistory,
  });

  const [tab, setTab] = useState("self");
  const [peerTargetId, setPeerTargetId] = useState<string | null>(null);
  const [committeeTargetId, setCommitteeTargetId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (ctx?.peers?.length && !peerTargetId) setPeerTargetId(ctx.peers[0].id);
  }, [ctx, peerTargetId]);
  useEffect(() => {
    if (ctx?.committees?.length && !committeeTargetId) {
      setCommitteeTargetId(ctx.committees[0].id);
    }
  }, [ctx, committeeTargetId]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["board-eval-context"] });
  const onError = (err: any) =>
    toast(err?.response?.data?.message ?? "Could not save your evaluation.");

  const selfMut = useMutation({
    mutationFn: (vars: {
      ratings: { question: string; score: number }[];
      comment: string;
    }) => submitMySelfEvaluation(ctx!.cycle!._id, vars),
    onSuccess: () => {
      invalidate();
      toast.success("Self-assessment saved.");
    },
    onError,
  });
  const peerMut = useMutation({
    mutationFn: (vars: {
      ratings: { question: string; score: number }[];
      comment: string;
    }) => submitMyPeerEvaluation(ctx!.cycle!._id, peerTargetId!, vars),
    onSuccess: () => {
      invalidate();
      toast.success("Peer review saved.");
    },
    onError,
  });
  const chairMut = useMutation({
    mutationFn: (vars: {
      ratings: { question: string; score: number }[];
      comment: string;
    }) => submitMyChairEvaluation(ctx!.cycle!._id, vars),
    onSuccess: () => {
      invalidate();
      toast.success("Chair evaluation saved.");
    },
    onError,
  });
  const committeeMut = useMutation({
    mutationFn: (vars: {
      ratings: { question: string; score: number }[];
      comment: string;
    }) =>
      submitMyCommitteeEvaluation(ctx!.cycle!._id, committeeTargetId!, vars),
    onSuccess: () => {
      invalidate();
      toast.success("Committee evaluation saved.");
    },
    onError,
  });

  const renderHistory = () => (
    <Card>
      <CardContent className="space-y-4 p-5">
        <p className="text-sm font-bold">Past evaluations</p>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No closed evaluation cycles yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[520px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Your submissions</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((e) => (
                  <TableRow key={e.cycleId}>
                    <TableCell className="whitespace-nowrap font-semibold">
                      {e.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.closedAt
                        ? new Date(e.closedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.myTypes.length ? e.myTypes.join(", ") : "None"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          e.mySubmissionCount > 0
                            ? "bg-success/10 text-success hover:bg-success/10"
                            : "bg-muted text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {e.mySubmissionCount > 0
                          ? "Submitted"
                          : "Not completed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!ctx?.cycle) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Board Evaluations
          </h1>
          <p className="text-sm text-muted-foreground">
            Confidential self, peer, chair, and committee assessments that feed
            the annual board effectiveness review.
          </p>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No evaluation cycle is currently open. Check back once the board
            launches one.
          </CardContent>
        </Card>
        {renderHistory()}
      </div>
    );
  }

  const selfDone = !!ctx.submissions.self;
  const peerDoneIds = new Set(Object.keys(ctx.submissions.peer));
  const committeeDoneIds = new Set(Object.keys(ctx.submissions.committee));
  const chairDone = !!ctx.submissions.chair;
  const showChairTab = !ctx.isChair;

  const tabsAvailable = [
    { key: "self", label: "Self-assessment", count: `${selfDone ? 1 : 0}/1` },
    {
      key: "peer",
      label: "Peer review",
      count: `${peerDoneIds.size}/${ctx.peers.length}`,
    },
    ...(showChairTab
      ? [
          {
            key: "chair",
            label: "Chair evaluation",
            count: ctx.chair ? `${chairDone ? 1 : 0}/1` : "—",
          },
        ]
      : []),
    {
      key: "committee",
      label: "Committee eval",
      count: `${committeeDoneIds.size}/${ctx.committees.length}`,
    },
  ];

  const overallIncomplete =
    !selfDone ||
    peerDoneIds.size < ctx.peers.length ||
    committeeDoneIds.size < ctx.committees.length ||
    (showChairTab && !!ctx.chair && !chairDone);

  const selectedPeer = ctx.peers.find((p) => p.id === peerTargetId) ?? null;
  const selectedCommittee =
    ctx.committees.find((c) => c.id === committeeTargetId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board Evaluations</h1>
        <p className="text-sm text-muted-foreground">
          Confidential self, peer, chair, and committee assessments that feed
          the annual board effectiveness review.
        </p>
      </div>

      <Card className="border-l-4 border-l-accent">
        <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold">{ctx.cycle.title}</p>
            <p className="text-xs text-muted-foreground">
              Due {new Date(ctx.cycle.dueDate).toLocaleDateString()} ·
              Confidential
            </p>
          </div>
          <Badge
            className={cn(
              overallIncomplete
                ? "bg-warning/15 text-amber-700 hover:bg-warning/15"
                : "bg-success/10 text-success hover:bg-success/10",
            )}
          >
            {overallIncomplete ? "Incomplete" : "Complete"}
          </Badge>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {tabsAvailable.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              disabled={t.key !== "self" && !selfDone}
            >
              {t.key !== "self" && !selfDone && (
                <Lock className="mr-1 h-3 w-3" />
              )}
              {t.label} ({t.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="self">
          <Card>
            <CardContent className="p-5">
              <QuestionForm
                questions={sectionByKey("self")}
                initial={ctx.submissions.self}
                submitting={selfMut.isPending}
                onSubmit={(ratings, comment) =>
                  selfMut.mutate({ ratings, comment })
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peer">
          {!selfDone ? (
            <LockedCard />
          ) : ctx.peers.length === 0 ? (
            <EmptyCard text="No other active directors to review yet." />
          ) : (
            <Card>
              <CardContent className="space-y-4 p-5">
                <TargetPicker
                  targets={ctx.peers}
                  doneIds={peerDoneIds}
                  selectedId={peerTargetId}
                  onSelect={setPeerTargetId}
                />
                {selectedPeer && (
                  <QuestionForm
                    key={selectedPeer.id}
                    questions={sectionByKey("peer")}
                    initial={ctx.submissions.peer[selectedPeer.id] ?? null}
                    submitting={peerMut.isPending}
                    onSubmit={(ratings, comment) =>
                      peerMut.mutate({ ratings, comment })
                    }
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {showChairTab && (
          <TabsContent value="chair">
            {!selfDone ? (
              <LockedCard />
            ) : !ctx.chair ? (
              <EmptyCard text="No current Board Chair is set." />
            ) : (
              <Card>
                <CardContent className="p-5">
                  <p className="mb-3 text-sm font-semibold">
                    Evaluating: {ctx.chair.name}
                  </p>
                  <QuestionForm
                    questions={sectionByKey("chair")}
                    initial={ctx.submissions.chair}
                    submitting={chairMut.isPending}
                    onSubmit={(ratings, comment) =>
                      chairMut.mutate({ ratings, comment })
                    }
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        <TabsContent value="committee">
          {!selfDone ? (
            <LockedCard />
          ) : ctx.committees.length === 0 ? (
            <EmptyCard text="You don't sit on any committees yet." />
          ) : (
            <Card>
              <CardContent className="space-y-4 p-5">
                <TargetPicker
                  targets={ctx.committees}
                  doneIds={committeeDoneIds}
                  selectedId={committeeTargetId}
                  onSelect={setCommitteeTargetId}
                />
                {selectedCommittee && (
                  <QuestionForm
                    key={selectedCommittee.id}
                    questions={sectionByKey("committee")}
                    initial={
                      ctx.submissions.committee[selectedCommittee.id] ?? null
                    }
                    submitting={committeeMut.isPending}
                    onSubmit={(ratings, comment) =>
                      committeeMut.mutate({ ratings, comment })
                    }
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {renderHistory()}
    </div>
  );
}
