import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  notificationPreferences as initialPrefs, personalDetails, security, type NotificationPreference,
} from "@/data/settingsMockData";

export default function Settings() {
  const [prefs, setPrefs] = useState<NotificationPreference[]>(initialPrefs);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ phone: personalDetails.phone, qualifications: personalDetails.qualifications });

  const togglePref = (id: string) => {
    setPrefs((p) => p.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const savePrefs = () => {
    toast.success("Notification preferences saved.");
  };

  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setEditOpen(false);
    toast.success("Personal details updated.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile &amp; Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information, notification preferences, and security settings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-sm font-bold">Personal details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Full name</span><span className="font-medium">{personalDetails.fullName}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Designation</span><span className="font-medium">{personalDetails.designation}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Email</span><span className="font-medium text-primary">{personalDetails.email}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Phone</span><span className="font-medium">{form.phone}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Qualifications</span><span className="font-medium">{form.qualifications}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Appointed</span><span className="font-medium">{personalDetails.appointed}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Term expires</span><span className="font-medium">{personalDetails.termExpires}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Committee roles</span><span className="font-medium">{personalDetails.committeeRoles}</span></div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>Edit personal details</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-1 p-5">
              <p className="mb-2 text-sm font-bold">Notification preferences</p>
              {prefs.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2.5 border-b py-2.5 text-sm last:border-b-0">
                  <Checkbox checked={p.checked} onCheckedChange={() => togglePref(p.id)} />
                  {p.label}
                </label>
              ))}
              <div className="pt-3">
                <Button size="sm" onClick={savePrefs}>Save preferences</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-bold">Security</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Two-factor auth</span><span className="font-medium text-success">✓ {security.twoFactor}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Last login</span><span className="font-medium">{security.lastLogin}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Password changed</span><span className="font-medium">{security.passwordChanged}</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => toast("Demo only: not wired up yet.")}>Change password</Button>
                <Button size="sm" variant="outline" onClick={() => toast("Demo only: not wired up yet.")}>Manage 2FA</Button>
                <Button size="sm" variant="outline" onClick={() => toast("Demo only: not wired up yet.")}>View login history</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={saveDetails}>
            <DialogHeader>
              <DialogTitle>Edit personal details</DialogTitle>
              <DialogDescription>Only phone and qualifications are self-editable; other fields are managed by the Company Secretary.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Qualifications</Label>
                <Input value={form.qualifications} onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
