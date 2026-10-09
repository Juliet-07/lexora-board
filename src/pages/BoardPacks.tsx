import { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileBarChart,
  FileCheck2,
  FileStack,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  addBoardPackNote,
  confirmBoardPackRead,
  fetchMyMeetings,
  resolveBoardFileUrl,
  toggleBoardPackRead,
  type MyMeeting,
  type MyMeetingBoardPackDoc,
} from "@/lib/board-api";

// Real board packs, drawn from the same meetings this director already
// sees on "My Meetings" — any meeting the tenant has attached board
// pack documents to. There's no separate "pack" entity on the
// backend: one meeting's boardPack IS its board pack, so this page is
// a document-reading/acknowledgement workspace over that same real
// data, not a parallel store.

const iconForDoc = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return FileText;
  if (["doc", "docx"].includes(ext)) return FileCheck2;
  if (["xls", "xlsx"].includes(ext)) return FileBarChart;
  if (["jpg", "jpeg", "png"].includes(ext)) return ImageIcon;
  return FileStack;
};

const formatSize = (bytes: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function BoardPacks() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["board-my-meetings"],
    queryFn: fetchMyMeetings,
  });

  const packs = useMemo(
    () =>
      [...meetings]
        .filter((m) => m.boardPack.length > 0)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [meetings],
  );

  const selected = packs.find((p) => p._id === selectedId) ?? null;

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["board-my-meetings"] });

  const toggleMut = useMutation({
    mutationFn: ({ fileUrl, read }: { fileUrl: string; read: boolean }) =>
      toggleBoardPackRead(selected!._id, fileUrl, read),
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't update — try again."),
  });

  const confirmMut = useMutation({
    mutationFn: () => confirmBoardPackRead(selected!._id),
    onSuccess: () => {
      invalidate();
      toast.success("All documents confirmed as read.");
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message ?? "Mark every document read first.",
      ),
  });

  const noteMut = useMutation({
    mutationFn: ({ fileUrl, text }: { fileUrl: string; text: string }) =>
      addBoardPackNote(selected!._id, fileUrl, text),
    onSuccess: () => {
      invalidate();
      setNoteDraft("");
      toast.success(
        "Note added — visible to the Company Secretary before the meeting.",
      );
    },
    onError: () => toast.error("Couldn't add note — try again."),
  });

  const toggleThread = (fileUrl: string) => {
    setOpenThread((cur) => (cur === fileUrl ? null : fileUrl));
    setNoteDraft("");
  };

  const addNote = (fileUrl: string) => {
    if (!noteDraft.trim()) return;
    noteMut.mutate({ fileUrl, text: noteDraft.trim() });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading board packs…
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Board Packs</h1>
          <p className="text-sm text-muted-foreground">
            Read board and committee papers ahead of each meeting, and share
            your notes with the Company Secretary.
          </p>
        </div>

        {packs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No board packs yet. You'll see a pack here as soon as the tenant
              adds board pack documents to a meeting you're invited to.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {packs.map((p) => {
              const total = p.boardPack.length;
              const read = p.myBoardPack.readFileUrls.length;
              const allRead = p.myBoardPack.allDocumentsRead;
              return (
                <Card
                  key={p._id}
                  className={cn(!allRead && "border-l-4 border-l-primary")}
                >
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold leading-snug">
                        {p.title}
                      </p>
                      <Badge
                        className={cn(
                          allRead
                            ? "bg-success/10 text-success hover:bg-success/10"
                            : "bg-info/10 text-info hover:bg-info/10",
                        )}
                      >
                        {allRead ? "All read" : "New"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {total} document{total === 1 ? "" : "s"}
                      {p.notice?.dispatchedAt &&
                        ` · Distributed ${new Date(
                          p.notice.dispatchedAt,
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      For meeting:{" "}
                      {new Date(p.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {allRead ? (
                      <div className="flex items-center gap-1.5 pt-1 text-xs text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> All documents
                        read
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Reading progress</span>
                          <span>
                            {read}/{total}
                          </span>
                        </div>
                        <Progress
                          value={(read / total) * 100}
                          className="h-1.5"
                        />
                      </div>
                    )}
                    <Button size="sm" onClick={() => setSelectedId(p._id)}>
                      <FileStack className="mr-1.5 h-3.5 w-3.5" /> Open pack
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const total = selected.boardPack.length;
  const readUrls = new Set(selected.myBoardPack.readFileUrls);
  const readCount = readUrls.size;
  const allRead = selected.myBoardPack.allDocumentsRead;

  return (
    <div className="space-y-6">
      <button
        onClick={() => setSelectedId(null)}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Board Packs
      </button>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="space-y-1 p-5">
          <p className="text-[15px] font-bold">{selected.title}</p>
          <p className="text-xs text-muted-foreground">
            {total} document{total === 1 ? "" : "s"} · For meeting:{" "}
            {new Date(selected.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Reading progress</span>
              <span>
                {readCount}/{total}
              </span>
            </div>
            <Progress value={(readCount / total) * 100} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {selected.executiveSummary?.trim() && (
        <Card>
          <CardContent className="space-y-1.5 p-5">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Cover page &amp; executive
              summary
            </p>
            <div
              className="text-[13px] prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
              dangerouslySetInnerHTML={{ __html: selected.executiveSummary }}
            />
            {selected.executiveSummaryUpdatedAt && (
              <p className="pt-1 text-[11px] text-muted-foreground">
                Last updated{" "}
                {new Date(
                  selected.executiveSummaryUpdatedAt,
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {selected.boardPack.map((doc: MyMeetingBoardPackDoc, i: number) => {
          const Icon = iconForDoc(doc.name);
          const isRead = doc.fileUrl ? readUrls.has(doc.fileUrl) : false;
          const threadOpen = openThread === doc.fileUrl;
          const docNotes = selected.boardPackNotes.filter(
            (n) => n.fileUrl === doc.fileUrl,
          );
          return (
            <Card key={doc.fileUrl ?? i}>
              <CardContent className="p-0">
                <div
                  className="flex cursor-pointer flex-col gap-3 p-3.5 sm:flex-row sm:items-center"
                  onClick={() => doc.fileUrl && toggleThread(doc.fileUrl)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {i + 1}. {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        formatSize(doc.size),
                        `Uploaded ${new Date(doc.uploadedAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div
                    className="flex shrink-0 items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {docNotes.length > 0 && (
                      <Badge
                        variant="outline"
                        className="border-border bg-muted text-muted-foreground hover:bg-muted"
                      >
                        <MessageSquare className="mr-1 h-3 w-3" />{" "}
                        {docNotes.length}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!doc.fileUrl}
                      onClick={() =>
                        doc.fileUrl &&
                        window.open(
                          resolveBoardFileUrl(doc.fileUrl),
                          "_blank",
                          "noreferrer",
                        )
                      }
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant={isRead ? "secondary" : "default"}
                      disabled={!doc.fileUrl || toggleMut.isPending}
                      onClick={() =>
                        doc.fileUrl &&
                        toggleMut.mutate({
                          fileUrl: doc.fileUrl,
                          read: !isRead,
                        })
                      }
                    >
                      {isRead ? (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Read
                        </>
                      ) : (
                        "Mark read"
                      )}
                    </Button>
                  </div>
                </div>

                {threadOpen && (
                  <div className="space-y-3 border-t bg-muted/30 p-3.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Notes &amp; questions
                    </p>
                    {docNotes.length > 0 && (
                      <div className="space-y-2">
                        {docNotes.map((n, ni) => (
                          <div
                            key={ni}
                            className="rounded-lg border bg-card p-2.5"
                          >
                            <p className="flex items-center gap-1.5 text-xs font-semibold">
                              {n.authorName}
                              {n.fromTenant && (
                                <Badge
                                  variant="outline"
                                  className="border-primary/30 bg-primary/10 text-primary text-[10px] px-1.5 py-0"
                                >
                                  Company Secretary
                                </Badge>
                              )}
                              <span className="font-normal text-muted-foreground">
                                ·{" "}
                                {new Date(n.createdAt).toLocaleDateString(
                                  "en-GB",
                                  { day: "numeric", month: "short" },
                                )}
                              </span>
                            </p>
                            <p className="mt-0.5 text-sm">{n.text}</p>
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
                      <Button
                        size="sm"
                        className="self-end"
                        disabled={noteMut.isPending}
                        onClick={() => doc.fileUrl && addNote(doc.fileUrl)}
                      >
                        Add
                      </Button>
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
          <p className="text-xs text-muted-foreground">
            Your commentary will be shared with the Company Secretary before the
            meeting.
          </p>
          {readCount < total && !allRead && (
            <p className="flex items-center gap-1.5 text-xs text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> Mark every document read
              to confirm the pack.
            </p>
          )}
          <Button
            onClick={() => confirmMut.mutate()}
            disabled={allRead || readCount < total || confirmMut.isPending}
            variant={allRead ? "secondary" : "default"}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />{" "}
            {allRead
              ? "All documents confirmed read"
              : "Confirm all documents read"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
