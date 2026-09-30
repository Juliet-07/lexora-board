import { useState } from "react";
import { toast } from "sonner";
import {
  Award,
  Leaf,
  Lock,
  PlayCircle,
  Scale,
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
  availableCourses as initialAvailableCourses,
  courseRecord as initialCourseRecord,
  cpdTarget,
  type AvailableCourse,
  type CourseRecordRow,
} from "@/data/trainingMockData";

const AVAILABLE_ICON: Record<AvailableCourse["icon"], React.ElementType> = {
  lock: Lock,
  leaf: Leaf,
  scale: Scale,
};

export default function Training() {
  const [courses, setCourses] =
    useState<CourseRecordRow[]>(initialCourseRecord);
  const [available, setAvailable] = useState<AvailableCourse[]>(
    initialAvailableCourses,
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    course: "",
    provider: "",
    hours: "",
  });

  const completedHours = courses
    .filter((c) => c.status === "complete")
    .reduce((sum, c) => sum + c.cpdHours, 0);
  const hoursRemaining = Math.max(cpdTarget.target - completedHours, 0);
  const assignedCourses = courses.filter((c) => c.status === "assigned");

  const startCourse = (id: string) => {
    setCourses((cs) =>
      cs.map((c) => (c.id === id ? { ...c, status: "complete" } : c)),
    );
    toast.success("Course completed — certificate added to your record.");
  };

  const enrol = (course: AvailableCourse) => {
    setCourses((cs) => [
      ...cs,
      {
        id: `enrol-${course.id}`,
        course: course.title,
        provider: course.provider,
        cpdHours: course.cpdHours,
        status: "assigned",
      },
    ]);
    setAvailable((cs) => cs.filter((c) => c.id !== course.id));
    toast.success(`Enrolled in ${course.title}.`);
  };

  const submitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !uploadForm.course.trim() ||
      !uploadForm.provider.trim() ||
      !uploadForm.hours.trim()
    ) {
      toast("Fill in the course, provider, and CPD hours.");
      return;
    }
    setCourses((cs) => [
      ...cs,
      {
        id: `ext-${Date.now()}`,
        course: uploadForm.course.trim(),
        provider: uploadForm.provider.trim(),
        cpdHours: Number(uploadForm.hours) || 0,
        status: "complete",
      },
    ]);
    setUploadForm({ course: "", provider: "", hours: "" });
    setUploadOpen(false);
    toast.success("External certificate added to your record.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Training &amp; CPD
        </h1>
        <p className="text-sm text-muted-foreground">
          Your continuing professional development tracker, assigned courses,
          and certificates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              CPD hours ({cpdTarget.year})
            </p>
            <p className="text-xl font-extrabold">
              {completedHours}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {cpdTarget.target}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {hoursRemaining > 0
                ? `${hoursRemaining} hours remaining`
                : "Target met"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              Mandatory courses
            </p>
            <p className="text-xl font-extrabold text-success">2 / 2</p>
            <p className="text-xs text-muted-foreground">AML/CFT, Governance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              Assigned to you
            </p>
            <p
              className={cn(
                "text-xl font-extrabold",
                assignedCourses.length > 0 ? "text-amber-700" : "text-success",
              )}
            >
              {assignedCourses.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {assignedCourses.length > 0
                ? assignedCourses.map((c) => c.course).join(", ")
                : "Nothing outstanding"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-bold">Your course record</p>
          <div className="overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>CPD</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow
                    key={c.id}
                    className={cn(c.status === "assigned" && "bg-warning/10")}
                  >
                    <TableCell className="whitespace-nowrap font-semibold">
                      {c.course}
                      {c.assignedBy && (
                        <div className="text-xs font-normal text-muted-foreground">
                          Assigned by: {c.assignedBy}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.provider}
                    </TableCell>
                    <TableCell>{c.cpdHours}</TableCell>
                    <TableCell>
                      {c.status === "assigned" ? (
                        <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge className="bg-success/10 text-success hover:bg-success/10">
                          Complete
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.status === "assigned" ? (
                        <Button size="sm" onClick={() => startCourse(c.id)}>
                          <PlayCircle className="mr-1.5 h-3.5 w-3.5" /> Start
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toast(c.course, {
                              description:
                                "Demo only: certificate download isn't wired up yet.",
                            })
                          }
                        >
                          <Award className="mr-1.5 h-3.5 w-3.5" /> Cert
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-bold">Available courses</p>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You're enrolled in everything on offer right now.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {available.map((course) => {
                const Icon = AVAILABLE_ICON[course.icon];
                return (
                  <Card key={course.id}>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-bold leading-snug">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.provider} · {course.duration} ·{" "}
                        {course.cpdHours} CPD
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => enrol(course)}
                      >
                        Enrol
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploadOpen(true)}
          >
            <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Upload external
            certificate
          </Button>
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={submitUpload}>
            <DialogHeader>
              <DialogTitle>Upload external certificate</DialogTitle>
              <DialogDescription>
                Add a course you completed outside the portal to your CPD
                record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Course name</Label>
                <Input
                  value={uploadForm.course}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, course: e.target.value }))
                  }
                  placeholder="e.g. Strategic Risk Management"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Provider</Label>
                <Input
                  value={uploadForm.provider}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, provider: e.target.value }))
                  }
                  placeholder="e.g. IoDSA"
                />
              </div>
              <div className="space-y-1.5">
                <Label>CPD hours</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={uploadForm.hours}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, hours: e.target.value }))
                  }
                  placeholder="e.g. 3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add to record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
