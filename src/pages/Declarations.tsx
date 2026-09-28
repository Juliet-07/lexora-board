import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  declarationHistory, declarationKpis, registerOfInterests, type DeclarationStatus, type HistoryStatus,
} from "@/data/declarationsMockData";

function statusBadge(status: DeclarationStatus | HistoryStatus) {
  if (status === "overdue") return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">Overdue</Badge>;
  if (status === "current") return <Badge className="bg-success/10 text-success hover:bg-success/10">Current</Badge>;
  return <Badge variant="outline" className="border-border bg-muted text-muted-foreground hover:bg-muted">Archived</Badge>;
}

export default function Declarations() {
  const [coiOpen, setCoiOpen] = useState(false);
  const [coiSubmitted, setCoiSubmitted] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const submitCoi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmChecked) {
      toast("Please confirm the information provided is true and complete.");
      return;
    }
    setCoiSubmitted(true);
    setCoiOpen(false);
    setConfirmChecked(false);
    toast.success("Conflict of Interest declaration submitted.");
  };

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterOpen(false);
    toast.success("Register of interests updated.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Declarations</h1>
        <p className="text-sm text-muted-foreground">Keep your conflict of interest, register of interests, and fitness & propriety declarations current.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {declarationKpis.map((k) => {
          const effectiveStatus = k.id === "coi" && coiSubmitted ? "current" : k.status;
          return (
            <Card key={k.id}>
              <CardContent className="space-y-2 p-5">
                <p className="text-xs font-semibold text-muted-foreground">{k.label}</p>
                {statusBadge(effectiveStatus)}
                <p className="text-xs text-muted-foreground">{k.id === "coi" && coiSubmitted ? "Submitted just now" : k.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!coiSubmitted && (
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-bold">Conflict of Interest Declaration — Annual 2026</p>
                <p className="text-xs font-semibold text-destructive">OVERDUE · Was due 31 Jan 2026</p>
              </div>
            </div>
            <Button onClick={() => setCoiOpen(true)}>Submit declaration now</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">My register of interests</p>
            <Button size="sm" variant="outline" onClick={() => setRegisterOpen(true)}>Update register</Button>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Declared</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registerOfInterests.map((r) => (
                  <TableRow key={r.category}>
                    <TableCell className="whitespace-nowrap font-semibold">{r.category}</TableCell>
                    <TableCell className="text-muted-foreground">{r.details}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{r.declared}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-bold">Declaration history</p>
          <div className="overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {declarationHistory.map((h) => {
                  const effectiveStatus = h.id === "h1" && coiSubmitted ? "current" : h.status;
                  const effectiveSubmitted = h.id === "h1" && coiSubmitted ? "Just now" : h.submitted;
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="whitespace-nowrap font-semibold">{h.type}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{h.period}</TableCell>
                      <TableCell className={cn("whitespace-nowrap", effectiveSubmitted === "—" && "text-muted-foreground")}>{effectiveSubmitted}</TableCell>
                      <TableCell>{statusBadge(effectiveStatus)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* COI declaration modal */}
      <Dialog open={coiOpen} onOpenChange={setCoiOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={submitCoi}>
            <DialogHeader>
              <DialogTitle>Conflict of Interest Declaration — Annual 2026</DialogTitle>
              <DialogDescription>This declaration will be reviewed by the Company Secretary and the Board Chair.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Do you hold any other directorships?</Label>
                <Select defaultValue="no">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Details of other directorships</Label>
                <Textarea placeholder="List any other directorships held, or leave blank if none." className="min-h-[70px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Shareholdings that could conflict?</Label>
                <Select defaultValue="no">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Family members with interests?</Label>
                <Select defaultValue="no">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Any other material interests?</Label>
                <Textarea placeholder="Describe any other interests that could give rise to a conflict." className="min-h-[70px]" />
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
                <Checkbox
                  id="coi-confirm"
                  checked={confirmChecked}
                  onCheckedChange={(v) => setConfirmChecked(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="coi-confirm" className="text-xs font-normal leading-relaxed">
                  I confirm that the information provided is true and complete.
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCoiOpen(false)}>Cancel</Button>
              <Button type="submit">
                <ScrollText className="mr-1.5 h-4 w-4" /> Submit declaration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update register of interests modal */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={submitRegister}>
            <DialogHeader>
              <DialogTitle>Update register of interests</DialogTitle>
              <DialogDescription>Keep this current — the Company Secretary is notified of any change.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Other directorships</Label>
                <Textarea defaultValue="None" className="min-h-[60px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Shareholdings</Label>
                <Textarea defaultValue="None declared" className="min-h-[60px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Professional memberships</Label>
                <Textarea defaultValue="ICPAR, ACCA" className="min-h-[60px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Family interests</Label>
                <Textarea defaultValue="None declared" className="min-h-[60px]" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>Cancel</Button>
              <Button type="submit">
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
