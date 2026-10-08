import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  fetchMessageThreads,
  fetchMessageThread,
  sendBoardMessage,
  fetchDirectory,
  type BoardMessageItem,
  type DirectoryEntry,
} from "@/lib/board-api";
import { useRealtimeEvent } from "@/lib/realtime-api";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Messages() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("with");
  const [draft, setDraft] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const threadsQuery = useQuery({
    queryKey: ["board-message-threads"],
    queryFn: fetchMessageThreads,
    refetchInterval: 45_000,
  });
  const threads = threadsQuery.data ?? [];

  const directoryQuery = useQuery({
    queryKey: ["board-directory"],
    queryFn: fetchDirectory,
  });
  const directory = directoryQuery.data ?? [];

  const threadQuery = useQuery({
    queryKey: ["board-message-thread", selectedId],
    queryFn: () => fetchMessageThread(selectedId as string),
    enabled: !!selectedId,
  });
  const messages = threadQuery.data ?? [];

  const selectedThread = threads.find((t) => t.counterpartId === selectedId);
  const selectedDirectoryEntry = directory.find((d) => d.id === selectedId);
  const selectedName =
    selectedThread?.name ?? selectedDirectoryEntry?.name ?? "";
  const selectedRole =
    selectedThread?.role ?? selectedDirectoryEntry?.role ?? "";

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["board-message-threads"] });
    if (selectedId) {
      queryClient.invalidateQueries({
        queryKey: ["board-message-thread", selectedId],
      });
    }
  };

  // Realtime — a message that arrives live refreshes whichever
  // queries it affects immediately, rather than waiting on the
  // 45s poll fallback above.
  useRealtimeEvent<BoardMessageItem & { fromBoardMemberId?: string }>(
    "message:new",
    (payload) => {
      queryClient.invalidateQueries({ queryKey: ["board-message-threads"] });
      if (payload.fromBoardMemberId === selectedId) {
        queryClient.invalidateQueries({
          queryKey: ["board-message-thread", selectedId],
        });
      } else {
        toast(`New message from ${payload.fromName ?? "a director"}`, {
          description: payload.body,
        });
      }
    },
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMut = useMutation({
    mutationFn: () => sendBoardMessage(selectedId as string, draft.trim()),
    onSuccess: () => {
      setDraft("");
      invalidateAll();
    },
    onError: () =>
      toast("Failed to send message.", { description: "Try again." }),
  });

  const send = () => {
    if (!selectedId || !draft.trim()) return;
    sendMut.mutate();
  };

  const startThreadWith = (d: DirectoryEntry) => {
    setParams({ with: d.id });
    setPickerOpen(false);
  };

  const otherDirectors = useMemo(
    () => directory.filter((d) => !d.isYou),
    [directory],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Direct messages with fellow directors on this board.
          </p>
        </div>
        <Button variant="outline" onClick={() => setPickerOpen(true)}>
          <Users className="mr-1.5 h-4 w-4" /> New message
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-[560px] overflow-hidden">
          <CardContent className="flex h-full flex-col gap-1 overflow-y-auto p-2">
            {threadsQuery.isLoading && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Loading…
              </p>
            )}
            {!threadsQuery.isLoading && threads.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No messages yet — start one from the Board Directory or "New
                message" above.
              </p>
            )}
            {threads.map((t) => (
              <button
                key={t.counterpartId}
                onClick={() => setParams({ with: t.counterpartId })}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60",
                  selectedId === t.counterpartId && "bg-primary/10",
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                  {initials(t.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="truncate">{t.name}</span>
                    {t.unreadCount > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">
                        {t.unreadCount}
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.lastMessage}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {new Date(t.lastAt).toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="flex h-[560px] flex-col overflow-hidden">
          {!selectedId ? (
            <CardContent className="flex h-full flex-1 items-center justify-center p-5 text-sm text-muted-foreground">
              Select a thread, or start a new message.
            </CardContent>
          ) : (
            <>
              <div className="flex items-center gap-2.5 border-b p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                  {initials(selectedName || "?")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedRole}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {threadQuery.isLoading && (
                  <p className="text-center text-sm text-muted-foreground">
                    Loading…
                  </p>
                )}
                {!threadQuery.isLoading && messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No messages yet. Say hello.
                  </p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[75%] rounded-lg px-3.5 py-2 text-sm",
                      m.fromMe
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    <p className="whitespace-pre-line leading-relaxed">
                      {m.body}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        m.fromMe
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground/70",
                      )}
                    >
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-end gap-2 border-t p-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={2}
                  placeholder="Type a message…"
                  className="resize-none"
                />
                <Button
                  size="icon"
                  onClick={send}
                  disabled={!draft.trim() || sendMut.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Start a new message</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-1 overflow-y-auto">
            {otherDirectors.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No other directors found yet.
              </p>
            )}
            {otherDirectors.map((d) => (
              <button
                key={d.id}
                onClick={() => startThreadWith(d)}
                className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left hover:bg-muted/60"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-bold text-white">
                  {initials(d.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
