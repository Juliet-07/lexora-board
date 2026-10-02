import { useState } from "react";
import { toast } from "sonner";
import { Clock, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  expenseCategories, expenseClaims as initialClaims, feeStatements, feeStructure,
  paymentsKpis, relatedMeetings, type ExpenseClaim,
} from "@/data/paymentsMockData";

export default function Payments() {
  const [claims, setClaims] = useState<ExpenseClaim[]>(initialClaims);
  const [claimOpen, setClaimOpen] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "" });

  const submitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount.trim()) {
      toast("Fill in a description and amount.");
      return;
    }
    setClaims((c) => [
      { id: `claim-${Date.now()}`, description: form.description.trim(), amount: `RWF ${Number(form.amount).toLocaleString()}`, status: "submitted" },
      ...c,
    ]);
    setForm({ description: "", amount: "" });
    setClaimOpen(false);
    toast.success("Expense claim submitted.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments &amp; Fees</h1>
        <p className="text-sm text-muted-foreground">Your director fee statements, sitting fee records, and expense claim submissions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="space-y-1 p-5"><p className="text-xs font-semibold text-muted-foreground">Total received (YTD)</p><p className="text-lg font-extrabold">{paymentsKpis.totalReceivedYtd}</p></CardContent></Card>
        <Card><CardContent className="space-y-1 p-5"><p className="text-xs font-semibold text-muted-foreground">Pending payment</p><p className="text-lg font-extrabold">{paymentsKpis.pendingPayment}</p></CardContent></Card>
        <Card><CardContent className="space-y-1 p-5"><p className="text-xs font-semibold text-muted-foreground">Expense claims</p><p className="text-lg font-extrabold">{paymentsKpis.expenseClaims}</p></CardContent></Card>
        <Card><CardContent className="space-y-1 p-5"><p className="text-xs font-semibold text-muted-foreground">Next payment</p><p className="text-base font-bold">{paymentsKpis.nextPayment}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="statements">
        <TabsList>
          <TabsTrigger value="statements">Fee statements</TabsTrigger>
          <TabsTrigger value="expenses">Expense claims</TabsTrigger>
          <TabsTrigger value="structure">Fee structure</TabsTrigger>
        </TabsList>

        <TabsContent value="statements">
          <Card>
            <CardContent className="space-y-1 p-5">
              {feeStatements.map((fs) => (
                <div key={fs.id} className="flex items-center gap-3.5 border-b py-3 last:border-b-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${fs.status === "paid" ? "bg-success/10 text-success" : "bg-warning/15 text-amber-700"}`}>
                    {fs.status === "paid" ? <Wallet className="h-[18px] w-[18px]" /> : <Clock className="h-[18px] w-[18px]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{fs.title}</p>
                    <p className="text-xs text-muted-foreground">{fs.sub}</p>
                  </div>
                  <p className={`text-sm font-bold ${fs.status === "paid" ? "text-success" : "text-amber-700"}`}>{fs.amount}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Expense claims</p>
                <Button size="sm" onClick={() => setClaimOpen(true)}>+ Submit claim</Button>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[480px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.description}</TableCell>
                        <TableCell className="whitespace-nowrap">{c.amount}</TableCell>
                        <TableCell>
                          {c.status === "paid" ? (
                            <Badge className="bg-success/10 text-success hover:bg-success/10">Paid</Badge>
                          ) : (
                            <Badge className="bg-info/10 text-info hover:bg-info/10">Submitted</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-bold">Your fee structure</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Annual retainer</span><span className="font-medium">{feeStructure.annualRetainer}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Board meeting fee</span><span className="font-medium">{feeStructure.boardMeetingFee}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Committee fee</span><span className="font-medium">{feeStructure.committeeFee}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Chair premium</span><span className="font-medium">{feeStructure.chairPremium}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Approved by</span><span className="font-medium">{feeStructure.approvedBy}</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={submitClaim}>
            <DialogHeader>
              <DialogTitle>Submit expense claim</DialogTitle>
              <DialogDescription>Sent to the Company Secretary for approval and reimbursement.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Related meeting</Label>
                <Select defaultValue={relatedMeetings[0]}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{relatedMeetings.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select defaultValue={expenseCategories[0]}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Amount (RWF)</Label>
                  <Input type="number" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description..." className="min-h-[70px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Receipt</Label>
                <Input type="file" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClaimOpen(false)}>Cancel</Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
