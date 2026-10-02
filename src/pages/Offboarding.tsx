import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  offboardingChecklist, offboardingLifecycle, postTenureObligations, termExpires,
} from "@/data/offboardingMockData";

export default function Offboarding() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Offboarding</h1>
        <p className="text-sm text-muted-foreground">When your tenure concludes, the Company Secretary will initiate the offboarding process. You will complete the steps below.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="outline" className="border-border bg-muted text-muted-foreground hover:bg-muted">Not yet initiated</Badge>
            <span className="text-xs text-muted-foreground">Your current term expires: {termExpires}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            When offboarding begins, the following steps will require your action. Until then, this section is for your reference only.
          </p>
          <div className="flex flex-wrap gap-2 opacity-60">
            {offboardingLifecycle.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1 p-5 opacity-70">
          <p className="mb-3 text-sm font-bold">Offboarding checklist (preview)</p>
          {offboardingChecklist.map((item) => (
            <div key={item.id} className="flex items-start gap-3 border-b py-3 last:border-b-0">
              <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border")}>
                <Check className="h-3 w-3 text-transparent" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-bold">Reference: Post-tenure obligations</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Confidentiality</span><span className="font-medium">{postTenureObligations.confidentiality}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Non-compete cooling off</span><span className="font-medium">{postTenureObligations.nonCompete}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">D&amp;O run-off cover</span><span className="font-medium">{postTenureObligations.doRunOff}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Document retention</span><span className="font-medium">{postTenureObligations.documentRetention}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
