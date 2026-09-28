import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  currentEvaluationMeta, evaluationSections, pastEvaluations, type EvalSection,
} from "@/data/evaluationsMockData";

const RATING_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

function RatingRow({
  questionNum, text, value, onChange,
}: { questionNum: number; text: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2 border-b py-3.5 last:border-b-0">
      <p className="text-sm font-medium">{questionNum}. {text}</p>
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

function SectionForm({
  section, ratings, setRating, comment, setComment, onSubmit,
}: {
  section: EvalSection;
  ratings: Record<string, number>;
  setRating: (id: string, v: number) => void;
  comment: string;
  setComment: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Rate each statement: 1 (strongly disagree) to 5 (strongly agree).</p>
      <div>
        {section.questions.map((q, i) => (
          <RatingRow
            key={q.id}
            questionNum={i + 1}
            text={q.text}
            value={ratings[q.id] ?? 0}
            onChange={(v) => setRating(q.id, v)}
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
      <div className="flex justify-end">
        <Button onClick={onSubmit}>Save &amp; continue →</Button>
      </div>
    </div>
  );
}

export default function Evaluations() {
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState("self");

  const setRating = (sectionKey: string, id: string, v: number) => {
    setRatings((r) => ({ ...r, [sectionKey]: { ...(r[sectionKey] ?? {}), [id]: v } }));
  };
  const setComment = (sectionKey: string, v: string) => {
    setComments((c) => ({ ...c, [sectionKey]: v }));
  };

  const answeredCount = (key: string) => Object.keys(ratings[key] ?? {}).length;

  const submitSection = (section: EvalSection, nextKey?: string) => {
    const answered = answeredCount(section.key);
    if (answered < section.questions.length) {
      toast(`Rate all ${section.questions.length} statements first.`, { description: `${answered}/${section.questions.length} answered so far.` });
      return;
    }
    setSubmitted((s) => ({ ...s, [section.key]: true }));
    toast.success(`${section.label} saved.`);
    if (nextKey) setTab(nextKey);
  };

  const selfDone = !!submitted.self;
  const overallIncomplete = !Object.values(submitted).every(Boolean) || Object.keys(submitted).length < evaluationSections.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board Evaluations</h1>
        <p className="text-sm text-muted-foreground">Confidential self, peer, chair, and committee assessments that feed the annual board effectiveness review.</p>
      </div>

      <Card className="border-l-4 border-l-accent">
        <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold">{currentEvaluationMeta.title}</p>
            <p className="text-xs text-muted-foreground">
              Due {currentEvaluationMeta.due} · Confidential · {currentEvaluationMeta.duration}
            </p>
          </div>
          <Badge className={cn(overallIncomplete ? "bg-warning/15 text-amber-700 hover:bg-warning/15" : "bg-success/10 text-success hover:bg-success/10")}>
            {overallIncomplete ? "Incomplete" : "Complete"}
          </Badge>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {evaluationSections.map((s) => (
            <TabsTrigger key={s.key} value={s.key} disabled={s.key !== "self" && !selfDone}>
              {s.key !== "self" && !selfDone && <Lock className="mr-1 h-3 w-3" />}
              {s.label} ({answeredCount(s.key)}/{s.questions.length})
            </TabsTrigger>
          ))}
        </TabsList>

        {evaluationSections.map((section, idx) => {
          const nextKey = evaluationSections[idx + 1]?.key;
          const locked = section.key !== "self" && !selfDone;
          return (
            <TabsContent key={section.key} value={section.key}>
              <Card>
                <CardContent className="p-5">
                  {locked ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Complete self-assessment first.</p>
                  ) : submitted[section.key] ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                      <p className="text-sm font-semibold">{section.label} submitted.</p>
                      <p className="text-xs text-muted-foreground">You can still adjust your ratings below.</p>
                      <div className="mt-4 w-full text-left">
                        <SectionForm
                          section={section}
                          ratings={ratings[section.key] ?? {}}
                          setRating={(id, v) => setRating(section.key, id, v)}
                          comment={comments[section.key] ?? ""}
                          setComment={(v) => setComment(section.key, v)}
                          onSubmit={() => submitSection(section, nextKey)}
                        />
                      </div>
                    </div>
                  ) : (
                    <SectionForm
                      section={section}
                      ratings={ratings[section.key] ?? {}}
                      setRating={(id, v) => setRating(section.key, id, v)}
                      comment={comments[section.key] ?? ""}
                      setComment={(v) => setComment(section.key, v)}
                      onSubmit={() => submitSection(section, nextKey)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-bold">Past evaluations</p>
          <div className="overflow-x-auto">
            <Table className="min-w-[520px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Board score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastEvaluations.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap font-semibold">{e.period}</TableCell>
                    <TableCell className="text-muted-foreground">{e.type}</TableCell>
                    <TableCell>
                      <Badge className="bg-success/10 text-success hover:bg-success/10">{e.status}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{e.boardScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
