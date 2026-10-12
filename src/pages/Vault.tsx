import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  fetchMyVault,
  resolveBoardFileUrl,
  type MyVaultDocument,
} from "@/lib/board-api";

type CategoryFilter = "all" | MyVaultDocument["category"];

const ICON: Record<MyVaultDocument["category"], React.ElementType> = {
  "Governance Document": ScrollText,
  "Regulatory Filing": FileText,
};

const ICON_CLASS: Record<MyVaultDocument["category"], string> = {
  "Governance Document": "bg-primary/10 text-primary",
  "Regulatory Filing": "bg-info/10 text-info",
};

export default function Vault() {
  const { data, isLoading } = useQuery({
    queryKey: ["board-vault"],
    queryFn: fetchMyVault,
  });
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const documents = data?.documents ?? [];

  const sections = useMemo(() => {
    const byFolder = new Map<string, MyVaultDocument[]>();
    for (const doc of documents) {
      if (filter !== "all" && doc.category !== filter) continue;
      const key = doc.folder || "Uncategorized";
      if (!byFolder.has(key)) byFolder.set(key, []);
      byFolder.get(key)!.push(doc);
    }
    return Array.from(byFolder.entries())
      .map(([folder, docs]) => ({
        folder,
        docs: docs.sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        ),
      }))
      .sort((a, b) => a.folder.localeCompare(b.folder));
  }, [documents, filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading documents…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Document Vault</h1>
        <p className="text-sm text-muted-foreground">
          Documents the Company Secretary has filed for you specifically.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: "All" },
            { key: "Governance Document", label: "Governance Documents" },
            { key: "Regulatory Filing", label: "Regulatory Filings" },
          ] as { key: CategoryFilter; label: string }[]
        ).map((f) => (
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

      {sections.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No documents filed for you yet.
          </CardContent>
        </Card>
      )}

      {sections.map((section) => (
        <Card key={section.folder}>
          <CardContent className="space-y-1 p-5">
            <p className="mb-2 text-sm font-bold">{section.folder}</p>
            {section.docs.map((doc) => {
              const Icon = ICON[doc.category];
              return (
                <div
                  key={doc._id}
                  className="flex items-center gap-3.5 border-b py-3 last:border-b-0"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      ICON_CLASS[doc.category],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category} · Uploaded{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {doc.uploadedBy && ` by ${doc.uploadedBy}`}
                    </p>
                  </div>
                  {doc.signedAt && (
                    <Badge className="bg-success/10 text-success hover:bg-success/10">
                      Signed
                    </Badge>
                  )}
                  {doc.fileUrl ? (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={resolveBoardFileUrl(doc.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      No file
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
