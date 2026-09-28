import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  FileCheck2,
  FileStack,
  FileText,
  Landmark,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { boardPacks, q4PackDocs, type PackComment, type PackDoc } from "@/data/boardPacksMockData";

const DOC_ICON: Record<PackDoc["icon"], React.ElementType> = {
  agenda: ClipboardList,
  minutes: FileText,
  report: FileBarChart,
  finance: Landmark,
  risk: AlertTriangle,
  compliance: ShieldCheck,
  committee: Users,
  doc: FileCheck2,
};

export default function BoardPacks() {
  const [view, setView] = useState<"list" | "reader">("list");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, PackComment[]>>(
    () => Object.fromEntries(q4PackDocs.map((d) => [d.id, d.comments])) as Record<string, PackComment[]>,
  );
  const [noteDraft, setNoteDraft] = useState("");

  const totalDocs = q4PackDocs.length;
  const readCount = readIds.size;
  const allRead = readCount === totalDocs;

  const markRead = (id: string) => {
    setReadIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleThread = (doc: PackDoc) => {
    if (!doc.commentable) return;
    setOpenThread((cur) => (cur === doc.id ? null : doc.id));
    setNoteDraft("");
  };

  const addNote = (docId: string) => {
    if (!noteDraft.trim()) return;
    setComments((c) => ({
      ...c,
      [docId]: [...c[docId], { author: "You", text: noteDraft.trim(), time: "Just now" }],
    }));
    setNoteDraft("");
    toast.success("Note added — visible to the Company Secretary before the meeting.");
  };

  const confirmAllRead = () => {
    if (!allRead) {
      toast("Mark every document read first.", { description: `${readCount}/${totalDocs} read so far.` });
      return;
    }
    toast.success("All documents confirmed as read.");
  };

  if (view === "list") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Board Packs</h1>
          <p className="text-sm text-muted-foreground">Read board and committee papers ahead of each meeting, and share your notes with the Company Secretary.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-bold leading-snug">{boardPacks.q4.title}</p>
                <Badge className="bg-info/10 text-info hover:bg-info/10">{boardPacks.q4.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Distributed {boardPacks.q4.distributed} · {boardPacks.q4.docs} documents · {boardPacks.q4.pages} pages
              </p>
              <p className="text-xs text-muted-foreground">For meeting: {boardPacks.q4.meetingDate}</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Reading progress</span>
                  <span>{readCount}/{totalDocs}</span>
                </div>
                <Progress value={(readCount / totalDocs) * 100} className="h-1.5" />
              </div>
              <Button size="sm" onClick={() => setView("reader")}>
                <FileStack className="mr-1.5 h-3.5 w-3.5" /> Open pack
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-bold leading-snug">{boardPacks.auditRisk.title}</p>
                <Badge className="bg-success/10 text-success hover:bg-success/10">{boardPacks.auditRisk.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{boardPacks.auditRisk.docs} documents</p>
              <div className="flex items-center gap-1.5 pt-1 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> All documents read
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setView("list")}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Board Packs
      </button>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="space-y-1 p-5">
          <p className="text-[15px] font-bold">{boardPacks.q4.title}</p>
          <p className="text-xs text-muted-foreground">
            Distributed {boardPacks.q4.distributed} · {boardPacks.q4.docs} documents · {boardPacks.q4.pages} pages · For meeting: {boardPacks.q4.meetingDate}
          </p>
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Reading progress</span>
              <span>{readCount}/{totalDocs}</span>
            </div>
            <Progress value={(readCount / totalDocs) * 100} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {q4PackDocs.map((doc) => {
          const Icon = DOC_ICON[doc.icon];
          const isRead = readIds.has(doc.id);
          const threadOpen = openThread === doc.id;
          const docComments = comments[doc.id] ?? [];
          return (
            <Card key={doc.id}>
              <CardContent className="p-0">
                <div
                  className={cn(
                    "flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center",
                    doc.commentable && "cursor-pointer",
                  )}
                  onClick={() => toggleThread(doc)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {doc.num}. {doc.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{doc.meta}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {doc.commentable && (
                      <Badge variant="outline" className="border-border bg-muted text-muted-foreground hover:bg-muted">
                        <MessageSquare className="mr-1 h-3 w-3" /> {docComments.length}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast(doc.title, { description: "Demo only: document preview isn't wired up yet." })}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant={isRead ? "secondary" : "default"}
                      onClick={() => markRead(doc.id)}
                    >
                      {isRead ? <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Read</> : "Mark read"}
                    </Button>
                  </div>
                </div>

                {doc.commentable && threadOpen && (
                  <div className="space-y-3 border-t bg-muted/30 p-3.5">
                    <p className="text-xs font-semibold text-muted-foreground">Your notes &amp; questions</p>
                    {docComments.length > 0 && (
                      <div className="space-y-2">
                        {docComments.map((c, i) => (
                          <div key={i} className="rounded-lg border bg-card p-2.5">
                            <p className="text-xs font-semibold">{c.author} <span className="font-normal text-muted-foreground">· {c.time}</span></p>
                            <p className="mt-0.5 text-sm">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Add a note or question for the Company Secretary..."
                        className="min-h-[60px] flex-1"
                      />
                      <Button size="sm" className="self-end" onClick={() => addNote(doc.id)}>Add</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
          <p className="text-xs text-muted-foreground">Your commentary will be shared with the Company Secretary before the meeting.</p>
          <Button onClick={confirmAllRead} disabled={allRead} variant={allRead ? "secondary" : "default"}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> {allRead ? "All documents confirmed read" : "Confirm all documents read"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
