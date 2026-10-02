import { useState } from "react";
import { toast } from "sonner";
import { BarChart3, FileText, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { vaultFilters, vaultSections, type VaultCategory, type VaultDoc } from "@/data/vaultMockData";

const ICON: Record<VaultDoc["icon"], React.ElementType> = {
  charter: ScrollText,
  tor: ScrollText,
  policy: FileText,
  report: BarChart3,
};

const ICON_CLASS: Record<VaultDoc["icon"], string> = {
  charter: "bg-primary/10 text-primary",
  tor: "bg-success/10 text-success",
  policy: "bg-info/10 text-info",
  report: "bg-warning/15 text-amber-700",
};

export default function Vault() {
  const [filter, setFilter] = useState<"all" | VaultCategory>("all");

  const visibleSections = vaultSections
    .map((s) => ({ ...s, docs: s.docs.filter((d) => filter === "all" || d.category === filter) }))
    .filter((s) => s.docs.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Document Vault</h1>
        <p className="text-sm text-muted-foreground">Governance documents shared with you by the Company Secretary.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {vaultFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibleSections.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No documents in this category.</CardContent></Card>
      )}

      {visibleSections.map((section) => (
        <Card key={section.id}>
          <CardContent className="space-y-1 p-5">
            <p className="mb-2 text-sm font-bold">{section.title}</p>
            {section.docs.map((doc) => {
              const Icon = ICON[doc.icon];
              return (
                <div key={doc.id} className="flex items-center gap-3.5 border-b py-3 last:border-b-0">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", ICON_CLASS[doc.icon])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.meta}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast(doc.title, { description: "Demo only: document preview isn't wired up yet." })}
                  >
                    View
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
