import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { complianceObligations, doInsurance, type ComplianceStatus } from "@/data/complianceMockData";

function statusBadge(status: ComplianceStatus) {
  switch (status) {
    case "overdue":
      return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">Overdue</Badge>;
    case "due-soon":
      return <Badge className="bg-info/10 text-info hover:bg-info/10">Due soon</Badge>;
    case "active":
      return <Badge className="bg-success/10 text-success hover:bg-success/10">Active</Badge>;
    case "complete":
      return <Badge className="bg-success/10 text-success hover:bg-success/10">Complete</Badge>;
    default:
      return <Badge className="bg-success/10 text-success hover:bg-success/10">Current</Badge>;
  }
}

export default function Compliance() {
  const overdueCount = complianceObligations.filter((o) => o.status === "overdue").length;
  const upcomingCount = complianceObligations.filter((o) => o.status === "due-soon").length;
  const currentCount = complianceObligations.length - overdueCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Compliance</h1>
        <p className="text-sm text-muted-foreground">Your personal compliance tracker. Keep all statutory and regulatory obligations current.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">Overall status</p>
            <p className={cn("text-base font-bold", overdueCount > 0 ? "text-amber-700" : "text-success")}>
              {overdueCount > 0 ? "Attention needed" : "All current"}
            </p>
            <p className="text-xs text-muted-foreground">{overdueCount} overdue, {upcomingCount} upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">Items current</p>
            <p className="text-lg font-extrabold text-success">{currentCount} / {complianceObligations.length}</p>
            <p className="text-xs text-muted-foreground">Obligations tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">D&amp;O Insurance</p>
            <p className="text-base font-bold text-success">Active</p>
            <p className="text-xs text-muted-foreground">Expires 31 Mar 2027</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-bold">Compliance obligations</p>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Obligation</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Last completed</TableHead>
                  <TableHead>Next due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceObligations.map((o) => (
                  <TableRow key={o.id} className={cn(o.highlighted && "bg-warning/10")}>
                    <TableCell className="whitespace-nowrap font-semibold">{o.obligation}</TableCell>
                    <TableCell className="text-muted-foreground">{o.requirement}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{o.lastCompleted}</TableCell>
                    <TableCell className={cn("whitespace-nowrap", o.status === "overdue" && "font-semibold text-destructive")}>{o.nextDue}</TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-bold">D&amp;O Insurance details</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Insurer</span><span className="font-medium">{doInsurance.insurer}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Policy number</span><span className="font-medium">{doInsurance.policyNumber}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Coverage</span><span className="font-medium">{doInsurance.coverage}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Policy period</span><span className="font-medium">{doInsurance.policyPeriod}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Covers</span><span className="font-medium">{doInsurance.covers}</span></div>
          </div>
          <Button size="sm" variant="outline">View policy summary</Button>
        </CardContent>
      </Card>
    </div>
  );
}
