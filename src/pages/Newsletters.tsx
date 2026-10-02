import { useState } from "react";
import { toast } from "sonner";
import { Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { newsletters, type Newsletter } from "@/data/newslettersMockData";

export default function Newsletters() {
  const [open, setOpen] = useState<Newsletter | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Newsletters &amp; Updates</h1>
        <p className="text-sm text-muted-foreground">Governance insights, regulatory updates, and company communications.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {newsletters.map((nl) => (
          <Card
            key={nl.id}
            className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
            onClick={() => (nl.readable ? setOpen(nl) : toast(nl.title, { description: "Demo only: no full article for this one yet." }))}
          >
            <div className="flex h-24 items-center justify-center text-2xl text-white" style={{ background: nl.gradient }}>
              <Newspaper className="h-7 w-7" />
            </div>
            <CardContent className="space-y-1 p-4">
              <p className="text-sm font-bold leading-snug">{nl.title}</p>
              <p className="text-xs text-muted-foreground">{nl.summary}</p>
              <p className="text-[11px] text-muted-foreground/70">{nl.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="border-b pb-4 text-center">
              <p className="text-xl font-extrabold text-primary">Boardroom Bytes</p>
              <p className="mt-1 text-xs text-muted-foreground">{open?.date}</p>
            </div>
            <DialogTitle className="sr-only">{open?.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
            {open?.sections?.map((s) => (
              <div key={s.heading}>
                <p className="font-bold">{s.heading}</p>
                <p className="text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
