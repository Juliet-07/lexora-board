import { useState } from "react";
import { toast } from "sonner";
import { Download, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  awaitingSignature as initialAwaiting, signedDocuments as initialSigned,
  type AwaitingSignature, type SignedDocument,
} from "@/data/esigningMockData";

export default function ESigning() {
  const [awaiting, setAwaiting] = useState<AwaitingSignature[]>(initialAwaiting);
  const [signed, setSigned] = useState<SignedDocument[]>(initialSigned);
  const [target, setTarget] = useState<AwaitingSignature | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [fullName, setFullName] = useState("");

  const closeDialog = () => {
    setTarget(null);
    setConfirmed(false);
    setFullName("");
  };

  const applySignature = () => {
    if (!target) return;
    if (!confirmed || !fullName.trim()) {
      toast("Confirm you've read the document and type your full name to sign.");
      return;
    }
    setAwaiting((a) => a.filter((d) => d.id !== target.id));
    setSigned((s) => [
      { id: target.id, title: target.title, signedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
      ...s,
    ]);
    toast.success("Signature applied.");
    closeDialog();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">E-Signing</h1>
        <p className="text-sm text-muted-foreground">Documents requiring your electronic signature.</p>
      </div>

      <Tabs defaultValue="awaiting">
        <TabsList>
          <TabsTrigger value="awaiting">Awaiting signature ({awaiting.length})</TabsTrigger>
          <TabsTrigger value="signed">Signed</TabsTrigger>
        </TabsList>

        <TabsContent value="awaiting" className="space-y-2.5">
          {awaiting.length === 0 && (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Nothing awaiting your signature.</CardContent></Card>
          )}
          {awaiting.map((doc) => (
            <Card key={doc.id} className="cursor-pointer" onClick={() => setTarget(doc)}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${doc.urgency === "urgent" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-amber-700"}`}>
                  <PenLine className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.detail}</p>
                </div>
                {doc.urgency === "urgent" ? (
                  <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">Urgent</Badge>
                ) : (
                  <Badge className="bg-warning/15 text-amber-700 hover:bg-warning/15">Pending</Badge>
                )}
                <Button size="sm" onClick={(e) => { e.stopPropagation(); setTarget(doc); }}>Sign</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="signed">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[480px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Signed on</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signed.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="whitespace-nowrap font-semibold">{doc.title}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{doc.signedOn}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast(doc.title, { description: "Demo only: document preview isn't wired up yet." })}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!target} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review &amp; sign document</DialogTitle>
            <DialogDescription>{target?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-primary/5 p-4 text-sm leading-relaxed">{target?.body}</div>
            <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
              <Checkbox id="esign-confirm" checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} className="mt-0.5" />
              <Label htmlFor="esign-confirm" className="text-xs font-normal leading-relaxed">
                I have read and understood this document. By clicking "Apply signature" I electronically sign it.
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label>Type your full name to sign</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Grace Uwimana" />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => toast("Demo only: PDF download isn't wired up yet.")}
              >
                <Download className="mr-1.5 h-4 w-4" /> Download PDF
              </Button>
              <Button onClick={applySignature}>
                <PenLine className="mr-1.5 h-4 w-4" /> Apply signature
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
