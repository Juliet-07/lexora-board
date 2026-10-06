import { useState } from "react";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  skillCompetencies as initialCompetencies,
  skillsDirectors,
  skillsGapAnalysis,
  skillsSelfAssessment,
  RATING_LABELS,
  type CoverageLevel,
} from "@/data/skillsMatrixMockData";

const ME = "dir3";

const CELL_CLASS: Record<number, string> = {
  1: "bg-destructive/10 text-destructive",
  2: "bg-warning/15 text-amber-700",
  3: "bg-success/10 text-success",
  4: "bg-primary/10 text-primary",
};

function SkillCell({ value }: { value: number }) {
  return (
    <div
      className={cn(
        "mx-auto flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold",
        CELL_CLASS[value] ?? "bg-muted text-muted-foreground",
      )}
    >
      {value}
    </div>
  );
}

function coverageBadge(level: CoverageLevel) {
  switch (level) {
    case "strong":
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/10">
          Strong
        </Badge>
      );
    case "developing":
      return (
        <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">
          Developing
        </Badge>
      );
    case "gap":
      return (
        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">
          Gap
        </Badge>
      );
  }
}

function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((n) => (
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
  );
}

export default function SkillsMatrix() {
  const [competencies, setCompetencies] = useState(initialCompetencies);
  const [lastUpdated, setLastUpdated] = useState(
    skillsSelfAssessment.lastUpdated,
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialCompetencies.map((c) => [c.id, c.ratings[ME]])),
  );
  const [extraSkills, setExtraSkills] = useState("");
  const [developmentAreas, setDevelopmentAreas] = useState("");

  const submitAssessment = () => {
    const unrated = competencies.filter((c) => !draft[c.id]);
    if (unrated.length > 0) {
      toast(`Rate all ${competencies.length} competencies first.`, {
        description: `${competencies.length - unrated.length}/${competencies.length} rated so far.`,
      });
      return;
    }
    setCompetencies((cs) =>
      cs.map((c) => ({ ...c, ratings: { ...c.ratings, [ME]: draft[c.id] } })),
    );
    setLastUpdated(
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
    toast.success("Skills self-assessment submitted.");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Board Skills Matrix
        </h1>
        <p className="text-sm text-muted-foreground">
          The skills matrix maps collective board competencies against strategic
          needs. Update your self-assessment annually.
        </p>
      </div>

      <Card className="border-l-4 border-l-accent">
        <CardContent className="space-y-3.5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold">Your skills self-assessment</p>
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated} · Annual update due:{" "}
                {skillsSelfAssessment.dueDate}
              </p>
            </div>
            <Button size="sm" onClick={() => setOpen(true)}>
              Update my skills
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Rate your proficiency:</span>
            {RATING_LABELS.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                    CELL_CLASS[i + 1],
                  )}
                >
                  {i + 1}
                </span>
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-bold">
            Board skills matrix (aggregate)
          </p>
          <div className="overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">
                    Skill / Competency
                  </TableHead>
                  {skillsDirectors.map((d) => (
                    <TableHead key={d.id} className="text-center">
                      {d.shortLabel}
                      {d.roleTag && (
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {d.isYou ? "(You)" : d.roleTag}
                        </span>
                      )}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Board Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competencies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-nowrap font-semibold">
                      {c.label}
                    </TableCell>
                    {skillsDirectors.map((d) => (
                      <TableCell key={d.id} className="text-center">
                        <SkillCell value={c.ratings[d.id]} />
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      {coverageBadge(c.coverage)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <TrendingUp className="h-4 w-4" /> Skills gap analysis
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-destructive">
              {skillsGapAnalysis.critical.heading}
            </span>{" "}
            {skillsGapAnalysis.critical.body}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-amber-700">
              {skillsGapAnalysis.developing.heading}
            </span>{" "}
            {skillsGapAnalysis.developing.body}
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update your skills self-assessment</DialogTitle>
            <DialogDescription>
              Rate your proficiency in each competency area: 1 = Awareness, 2 =
              Working knowledge, 3 = Skilled, 4 = Expert. Your assessment feeds
              into the board skills matrix and helps identify development needs.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
            <div>
              {competencies.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
                >
                  <p className="text-sm font-medium">{c.label}</p>
                  <RatingPicker
                    value={draft[c.id] ?? 0}
                    onChange={(v) => setDraft((d) => ({ ...d, [c.id]: v }))}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>Additional skills or qualifications to note</Label>
              <Textarea
                value={extraSkills}
                onChange={(e) => setExtraSkills(e.target.value)}
                placeholder="Any certifications, specialist expertise, or skills not listed above..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Development areas you would like training in</Label>
              <Textarea
                value={developmentAreas}
                onChange={(e) => setDevelopmentAreas(e.target.value)}
                placeholder="E.g., Cybersecurity oversight, ESG reporting..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAssessment}>Submit assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
