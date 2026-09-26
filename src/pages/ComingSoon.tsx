import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ComingSoon({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">This section is queued for the next build phase.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <p className="font-semibold">{title} is coming next</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Login and Dashboard are live with dummy data. Tell me which page to build after this one.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
