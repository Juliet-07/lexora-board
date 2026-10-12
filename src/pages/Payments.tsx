import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Wallet } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { paymentsKpis } from "@/data/paymentsMockData";
import {
  fetchMyFeeStructure,
  fetchMyExpenseClaims,
  submitMyExpenseClaim,
  fetchMyMeetings,
  fetchMyFeeStatements,
  type MyClaimCategory,
  type MyFeeStatementStatus,
} from "@/lib/board-api";

const fmtRwf = (n: number) => `RWF ${n.toLocaleString()}`;
const fmtMoney = (n: number, currency: string) =>
  `${currency} ${n.toLocaleString()}`;

// Same list used across the tenant app's own finance pages (Payroll,
// Profile currency picker) — kept in sync by convention, not import,
// since lexora-board and lexora-tenant are separate apps.
const CLAIM_CURRENCIES = ["RWF", "USD", "EUR", "GBP", "NGN", "KES", "ZAR"];
const CLAIM_CATEGORIES: MyClaimCategory[] = [
  "Travel",
  "Accommodation",
  "Meals",
  "Other",
];

const statusBadge = (status: string) => {
  switch (status) {
    case "Paid":
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/10">
          Paid
        </Badge>
      );
    case "Approved":
      return (
        <Badge className="bg-info/10 text-info hover:bg-info/10">
          Approved
        </Badge>
      );
    case "Rejected":
      return (
        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">
          Submitted
        </Badge>
      );
  }
};

const statementIcon = (status: MyFeeStatementStatus) =>
  status === "Paid" ? (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
      <Wallet className="h-[18px] w-[18px]" />
    </div>
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-amber-700">
      <Clock className="h-[18px] w-[18px]" />
    </div>
  );

const statementSub = (fs: {
  status: MyFeeStatementStatus;
  dueOn: string;
  paidAt: string | null;
  scheduledPaymentDate: string | null;
}) => {
  if (fs.status === "Paid" && fs.paidAt)
    return `Paid ${new Date(fs.paidAt).toLocaleDateString()}`;
  if (fs.status === "Scheduled" && fs.scheduledPaymentDate)
    return `Scheduled ${new Date(fs.scheduledPaymentDate).toLocaleDateString()}`;
  if (fs.status === "Rejected") return "Rejected";
  return `Due ${new Date(fs.dueOn).toLocaleDateString()}`;
};

export default function Payments() {
  const queryClient = useQueryClient();

  const { data: feeStructure } = useQuery({
    queryKey: ["board-my-fee-structure"],
    queryFn: fetchMyFeeStructure,
  });

  const { data: claims = [] } = useQuery({
    queryKey: ["board-my-expense-claims"],
    queryFn: fetchMyExpenseClaims,
  });

  const { data: feeStatements = [] } = useQuery({
    queryKey: ["board-my-fee-statements"],
    queryFn: fetchMyFeeStatements,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["board-my-meetings-for-claims"],
    queryFn: fetchMyMeetings,
  });
  const meetingOptions = useMemo(
    () =>
      meetings.map(
        (m) => `${m.title} (${new Date(m.date).toLocaleDateString()})`,
      ),
    [meetings],
  );

  const [claimOpen, setClaimOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    currency: "RWF",
    category: "Travel" as MyClaimCategory,
    otherCategoryDetail: "",
    relatedMeetingLabel: "",
  });

  const resetForm = () =>
    setForm({
      description: "",
      amount: "",
      currency: "RWF",
      category: "Travel",
      otherCategoryDetail: "",
      relatedMeetingLabel: "",
    });

  const submitMut = useMutation({
    mutationFn: () =>
      submitMyExpenseClaim({
        description: form.description.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        category: form.category,
        otherCategoryDetail:
          form.category === "Other"
            ? form.otherCategoryDetail.trim()
            : undefined,
        relatedMeetingLabel: form.relatedMeetingLabel || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-my-expense-claims"] });
      resetForm();
      setClaimOpen(false);
      toast.success("Expense claim submitted.");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message ?? "Could not submit the claim.");
    },
  });

  const submitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount.trim()) {
      toast("Fill in a description and amount.");
      return;
    }
    if (form.category === "Other" && !form.otherCategoryDetail.trim()) {
      toast("Please specify what this expense claim is for.");
      return;
    }
    submitMut.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Payments &amp; Fees
        </h1>
        <p className="text-sm text-muted-foreground">
          Your director fee statements, sitting fee records, and expense claim
          submissions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              Total received (YTD)
            </p>
            <p className="text-lg font-extrabold">
              {paymentsKpis.totalReceivedYtd}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              Pending payment
            </p>
            <p className="text-lg font-extrabold">
              {paymentsKpis.pendingPayment}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              Expense claims
            </p>
            <p className="text-lg font-extrabold">
              {paymentsKpis.expenseClaims}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-xs font-semibold text-muted-foreground">
              Next payment
            </p>
            <p className="text-base font-bold">{paymentsKpis.nextPayment}</p>
          </CardContent>
        </Card>
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
                <div
                  key={fs._id}
                  className="flex items-center gap-3.5 border-b py-3 last:border-b-0"
                >
                  {statementIcon(fs.status)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{fs.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {statementSub(fs)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${fs.status === "Paid" ? "text-success" : "text-amber-700"}`}
                  >
                    {fmtMoney(fs.amount, fs.currency)}
                  </p>
                </div>
              ))}
              {!feeStatements.length && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No fee statements yet — these appear once the company records
                  a payment against you.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Expense claims</p>
                <Button size="sm" onClick={() => setClaimOpen(true)}>
                  + Submit claim
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell>
                          <div className="font-medium">{c.description}</div>
                          {c.relatedMeetingLabel && (
                            <div className="text-xs text-muted-foreground">
                              {c.relatedMeetingLabel}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {c.category ?? "—"}
                          {c.category === "Other" && c.otherCategoryDetail && (
                            <div className="text-xs text-muted-foreground">
                              {c.otherCategoryDetail}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {fmtMoney(c.amount, c.currency)}
                        </TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                      </TableRow>
                    ))}
                    {!claims.length && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-6 text-center text-sm text-muted-foreground"
                        >
                          No expense claims yet.
                        </TableCell>
                      </TableRow>
                    )}
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
              <p className="text-xs text-muted-foreground">
                Set by the company for your role. Contact the Company Secretary
                if this looks out of date.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Annual retainer</span>
                  <span className="font-medium">
                    {fmtRwf(feeStructure?.annualRetainer ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">
                    Meeting attendance fee
                  </span>
                  <span className="font-medium">
                    {fmtRwf(feeStructure?.meetingAttendanceFee ?? 0)} / meeting
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">
                    Committee chair fee
                  </span>
                  <span className="font-medium">
                    {fmtRwf(feeStructure?.committeeChairFee ?? 0)} / meeting
                  </span>
                </div>
                {feeStructure?.lastReviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last reviewed</span>
                    <span className="font-medium">
                      {new Date(
                        feeStructure.lastReviewedAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
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
              <DialogDescription>
                Sent to the Company Secretary for approval and reimbursement.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Related meeting (optional)</Label>
                <Select
                  value={form.relatedMeetingLabel || "none"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      relatedMeetingLabel: v === "none" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Not related to a specific meeting
                    </SelectItem>
                    {meetingOptions.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as MyClaimCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLAIM_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.category === "Other" && (
                <div className="space-y-1.5">
                  <Label>What is this expense claim for?</Label>
                  <Input
                    value={form.otherCategoryDetail}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        otherCategoryDetail: e.target.value,
                      }))
                    }
                    placeholder="Specify what this claim is for..."
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, currency: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLAIM_CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Brief description..."
                  className="min-h-[70px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setClaimOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitMut.isPending}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
