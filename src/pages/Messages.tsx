import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
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
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { inboxMessages, messageRecipients, type InboxMessage } from "@/data/messagesMockData";

export default function Messages() {
  const [open, setOpen] = useState<InboxMessage | null>(null);
  const [reply, setReply] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const sendReply = () => {
    if (!reply.trim()) {
      toast("Write a reply first.");
      return;
    }
    toast.success(`Reply sent to ${open?.from}.`);
    setReply("");
    setOpen(null);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast("Add a subject and a message.");
      return;
    }
    toast.success("Message sent.");
    setSubject("");
    setBody("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Secure messaging with the Company Secretary, Board Chair, and fellow directors.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-bold">Inbox</p>
          <div className="space-y-2.5">
            {inboxMessages.map((m) => (
              <Card key={m.id} className="cursor-pointer" onClick={() => setOpen(m)}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", m.avatarClass)}>
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      {m.from}
                      <Badge variant="outline" className="border-border bg-muted text-[10px] text-muted-foreground hover:bg-muted">{m.roleTag}</Badge>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">{m.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold">Compose</p>
          <Card>
            <CardContent className="p-5">
              <form className="space-y-4" onSubmit={sendMessage}>
                <div className="space-y-1.5">
                  <Label>To</Label>
                  <Select defaultValue={messageRecipients[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{messageRecipients.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Type your message..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Attach</Label>
                  <Input type="file" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">
                    <Send className="mr-1.5 h-4 w-4" /> Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {open?.from}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", open?.avatarClass)}>
                {open?.initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{open?.from}</p>
                <p className="text-xs text-muted-foreground">{open?.roleTag} · {open?.time}</p>
              </div>
            </div>
            <div className="whitespace-pre-line rounded-lg border bg-primary/5 p-4 text-sm leading-relaxed">
              {open?.body}
            </div>
            <div className="space-y-1.5">
              <Label>Reply</Label>
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} placeholder="Type your reply..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={sendReply}>
              <Send className="mr-1.5 h-4 w-4" /> Send reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
