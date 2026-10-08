import { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  fetchSkillsMatrix,
  addMySkill,
  removeMySkill,
  type SkillCategory,
  type SkillLevel,
} from "@/lib/board-api";

const CATEGORIES: SkillCategory[] = [
  "Finance",
  "Legal",
  "Risk",
  "Strategy",
  "Technology",
  "Governance",
  "Industry",
  "Other",
];
const LEVELS: SkillLevel[] = ["Basic", "Intermediate", "Expert"];

const LEVEL_RANK: Record<SkillLevel, number> = {
  Basic: 1,
  Intermediate: 2,
  Expert: 3,
};
const LEVEL_CLASS: Record<SkillLevel, string> = {
  Basic: "bg-muted text-muted-foreground",
  Intermediate: "bg-warning/15 text-amber-700",
  Expert: "bg-success/10 text-success",
};

export default function SkillsMatrix() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Governance" as SkillCategory,
    level: "Intermediate" as SkillLevel,
    yearsExperience: 1,
    qualified: true,
    notes: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["board-skills-matrix"],
    queryFn: fetchSkillsMatrix,
  });
  const rows = data ?? [];

  const addMut = useMutation({
    mutationFn: addMySkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-skills-matrix"] });
      toast.success("Skill added to the matrix.");
      setOpen(false);
      setForm({
        name: "",
        category: "Governance",
        level: "Intermediate",
        yearsExperience: 1,
        qualified: true,
        notes: "",
      });
    },
    onError: () => toast.error("Failed to add skill."),
  });

  const removeMut = useMutation({
    mutationFn: removeMySkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-skills-matrix"] });
      toast.success("Skill removed.");
    },
    onError: () =>
      toast.error(
        "Could not remove that skill — you can only withdraw one you submitted yourself.",
      ),
  });

  // Best level recorded for each director × category, derived client
  // side from the real BoardSkill[] every director already has, plus
  // a board-wide coverage read (how many directors have at least one
  // qualified skill in that category) — the same idea as the tenant's
  // own aggregate "Board skills matrix" card, just per-director here.
  const cellFor = (
    skills: {
      category: SkillCategory;
      level: SkillLevel;
      qualified: boolean;
    }[],
    category: SkillCategory,
  ) => {
    const matches = skills.filter((s) => s.category === category);
    if (matches.length === 0) return null;
    const best = matches.reduce((a, b) =>
      LEVEL_RANK[b.level] > LEVEL_RANK[a.level] ? b : a,
    );
    return { level: best.level, count: matches.length };
  };

  const coverageFor = (category: SkillCategory) =>
    rows.filter((r) =>
      r.skills.some((s) => s.category === category && s.qualified),
    ).length;

  const mySkills = useMemo(
    () =>
      rows.flatMap((r, ri) =>
        r.skills
          .map((s, si) => ({ ...s, rowIndex: ri, skillIndex: si }))
          .filter((s) => s.addedBy === "Self"),
      ),
    [rows],
  );

  const submit = () => {
    if (!form.name.trim()) {
      toast("Skill name required.");
      return;
    }
    addMut.mutate({
      ...form,
      name: form.name.trim(),
      notes: form.notes.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Board Skills Matrix
          </h1>
          <p className="text-sm text-muted-foreground">
            Every director's recorded skills and credentials. Submit one of your
            own if the tenant hasn't recorded it yet.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Submit a skill
        </Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-bold">Skills matrix</p>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Category</TableHead>
                    {rows.map((r) => (
                      <TableHead key={r.boardMemberId} className="text-center">
                        {r.name}
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {r.role}
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CATEGORIES.map((cat) => (
                    <TableRow key={cat}>
                      <TableCell className="whitespace-nowrap font-semibold">
                        {cat}
                      </TableCell>
                      {rows.map((r) => {
                        const cell = cellFor(r.skills, cat);
                        return (
                          <TableCell
                            key={r.boardMemberId}
                            className="text-center"
                          >
                            {cell ? (
                              <div
                                title={r.skills
                                  .filter((s) => s.category === cat)
                                  .map((s) => `${s.name} (${s.level})`)
                                  .join(", ")}
                                className={cn(
                                  "mx-auto flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-[10px] font-bold",
                                  LEVEL_CLASS[cell.level],
                                )}
                              >
                                {cell.level}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {coverageFor(cat)}/{rows.length}
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

      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <TrendingUp className="h-4 w-4" /> My submitted skills
          </p>
          {mySkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven't submitted any skills of your own yet — use "Submit a
              skill" above if the tenant hasn't recorded one of yours.
            </p>
          ) : (
            <div className="space-y-1.5">
              {mySkills.map((s) => (
                <div
                  key={`${s.rowIndex}-${s.skillIndex}`}
                  className="flex items-start justify-between gap-2 rounded border px-2.5 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.category} · {s.level} · {s.yearsExperience} yr(s)
                    </p>
                  </div>
                  <button onClick={() => removeMut.mutate(s.skillIndex)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit a skill</DialogTitle>
            <DialogDescription>
              Shows immediately on the board's skills matrix, tagged as
              self-submitted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Skill / credential</Label>
              <Input
                placeholder="e.g. Cybersecurity oversight, CPA, MBA Finance"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as SkillCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) =>
                    setForm({ ...form, level: v as SkillLevel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Years of experience</Label>
              <Input
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={(e) =>
                  setForm({ ...form, yearsExperience: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Institution, year, remarks…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={addMut.isPending}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
