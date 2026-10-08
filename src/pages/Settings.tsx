import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "@/lib/board-api";

// Profile & Settings — "Board member can edit their details, like
// phone number and email and it updates the db and they can change
// their password. Remove the part for notification settings, it
// isn't needed." (PO, Oct 2026). Both cards below are wired to the
// real backend; there is no notification-preferences section any
// more, and no 2FA/login-history section — neither was asked for and
// neither has a backend to wire to.
export default function Settings() {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", email: "" });

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["board-my-profile"],
    queryFn: fetchMyProfile,
  });

  const updateMut = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(["board-my-profile"], updated);
      toast.success("Personal details updated.");
      setEditOpen(false);
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ?? "Failed to update personal details.",
      ),
  });

  const pwMut = useMutation({
    mutationFn: changeMyPassword,
    onSuccess: () => {
      toast.success("Password changed.");
      setPwOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to change password."),
  });

  const openEdit = () => {
    if (!profile) return;
    setEditForm({ phone: profile.phone ?? "", email: profile.email ?? "" });
    setEditOpen(true);
  };

  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateMut.mutate(editForm);
  };

  const submitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast("Current and new password are required.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast("New password and confirmation don't match.");
      return;
    }
    pwMut.mutate(pwForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Profile &amp; Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and security settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-sm font-bold">Personal details</p>
            {isLoading || !profile ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Loading…
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Full name</span>
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Designation</span>
                  <span className="font-medium">{profile.role}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-primary">
                    {profile.email}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{profile.phone || "—"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Appointed</span>
                  <span className="font-medium">
                    {profile.appointedAt
                      ? new Date(profile.appointedAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Term expires</span>
                  <span className="font-medium">
                    {profile.termEnds
                      ? new Date(profile.termEnds).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={openEdit}
              disabled={!profile}
            >
              Edit personal details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-bold">Security</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Change the password you use to sign in to the board portal.
            </p>
            <Button size="sm" variant="outline" onClick={() => setPwOpen(true)}>
              Change password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={saveDetails}>
            <DialogHeader>
              <DialogTitle>Edit personal details</DialogTitle>
              <DialogDescription>
                Phone and email are self-editable; other fields are managed by
                the Company Secretary.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMut.isPending}>
                {updateMut.isPending && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={submitPasswordChange}>
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>
                You'll keep using your current password to sign in until this is
                submitted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Current password</Label>
                <Input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm((f) => ({
                      ...f,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) =>
                    setPwForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPwOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pwMut.isPending}>
                {pwMut.isPending && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                Change password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
