import { Check, CheckCircle2, Clock, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  onboardingStages,
  onboardingSteps,
  onboardingSummary,
} from "@/data/onboardingMockData";

const stageLabel = Object.fromEntries(
  onboardingStages.map((s) => [s.id, s.label]),
);

export default function Onboarding() {
  const total = onboardingSteps.length;
  const done = onboardingSteps.length; // all steps complete in the dummy data
  const s = onboardingSummary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Onboarding</h1>
        <p className="text-sm text-muted-foreground">
          Your completed onboarding journey. All steps were finalised before
          your first board meeting.
        </p>
      </div>

      {/* Lifecycle stages */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-0">
            {onboardingStages.map((stage, i) => (
              <li
                key={stage.id}
                className={cn(
                  "flex flex-col items-center gap-1 border border-success/40 bg-success/10 px-2 py-3 text-center text-success",
                  "rounded-lg sm:rounded-none sm:first:rounded-l-lg sm:last:rounded-r-lg sm:-ml-px sm:first:ml-0",
                )}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
                <span className="text-[11px] font-semibold leading-tight">
                  {stage.label}
                </span>
                <span className="sr-only">Step {i + 1} complete</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-base font-bold text-success">
                Onboarding {s.status.toLowerCase()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-base font-bold">{s.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-base font-bold">{s.durationDays} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-3 text-base">
            <Badge className="gap-1 bg-success/10 px-3 py-1 text-[13px] font-bold text-success hover:bg-success/10">
              <Check className="h-3.5 w-3.5" strokeWidth={3} /> Onboarding
              complete
            </Badge>
            <span className="text-xs font-normal text-muted-foreground">
              Started {s.started} · Completed {s.completed} · {s.durationDays}{" "}
              days
            </span>
            <span className="ml-auto text-xs font-medium text-muted-foreground">
              {done} of {total} steps
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {onboardingSteps.map((step) => (
              <li key={step.id} className="flex items-start gap-3 py-3.5">
                <div className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-success text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.detail}</p>
                </div>
                <Badge
                  variant="outline"
                  className="hidden shrink-0 text-[10px] font-semibold text-muted-foreground sm:inline-flex"
                >
                  {stageLabel[step.stageId]}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
