import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileBarChart,
  Leaf,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  downloadEsgReportPdf,
  fetchEsgReport,
  markEsgReportRead,
  type EsgReportIndicator,
  type EsgReportSummary,
} from "@/lib/board-api";

const fmt = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

// ── List: published ESG reports, shown above the meeting packs ──

export function EsgReportList({
  reports,
  onOpen,
}: {
  reports: EsgReportSummary[];
  onOpen: (id: string) => void;
}) {
  if (!reports.length) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Leaf className="h-4 w-4 text-success" />
        <h2 className="text-sm font-semibold">ESG reports</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Card
            key={r._id}
            className={cn(!r.readAt && "border-l-4 border-l-primary")}
          >
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-bold leading-snug">{r.title}</p>
                <Badge
                  className={cn(
                    r.readAt
                      ? "bg-success/10 text-success hover:bg-success/10"
                      : "bg-info/10 text-info hover:bg-info/10",
                  )}
                >
                  {r.readAt ? "Read" : "New"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {r.frameworkLabel} · Period {r.period}
                {r.publishedAt && ` · Published ${fmt(r.publishedAt)}`}
              </p>
              {r.totals && (
                <p className="text-xs text-muted-foreground">
                  {r.totals.signedOff} of {r.totals.applicable} disclosures
                  signed off ({r.totals.pct}%)
                </p>
              )}
              {r.message && (
                <p className="line-clamp-2 text-xs italic text-muted-foreground">
                  “{r.message}”
                </p>
              )}
              <Button size="sm" onClick={() => onOpen(r._id)}>
                <FileBarChart className="mr-1.5 h-3.5 w-3.5" /> Open report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function IndicatorBlock({ i }: { i: EsgReportIndicator }) {
  const signed = i.status === "Signed off";
  return (
    <div className="border-t py-4 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="mr-2 text-[13px] font-semibold text-primary">
            {i.code}
          </span>
          <span className="text-[13px] font-medium">{i.title}</span>
          {i.owner && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Owner: {i.owner}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0",
            !i.isApplicable
              ? "text-muted-foreground"
              : signed
                ? "border-success/30 text-success"
                : "border-warning/30 text-warning",
          )}
        >
          {!i.isApplicable ? "Not applicable" : i.status}
        </Badge>
      </div>
      {!i.isApplicable ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {i.applicabilityNote || "No reason recorded."}
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {i.requirement && (
            <p className="text-xs italic text-muted-foreground">
              {i.requirement}
            </p>
          )}
          {i.response?.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {i.response}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No response entered.
            </p>
          )}
          {i.evidence.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Evidence: {i.evidence.join(" · ")}
            </p>
          )}
          {signed && (i.esgChairName || i.boardChairName) && (
            <p className="text-xs text-success">
              {i.esgChairName &&
                `ESG Committee Chair: ${i.esgChairName} (${fmt(i.esgChairDecidedAt)})`}
              {i.esgChairName && i.boardChairName && "  ·  "}
              {i.boardChairName &&
                `Board Chair: ${i.boardChairName} (${fmt(i.boardChairDecidedAt)})`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Detail: read the report in-app, download the PDF ──

export function EsgReportDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["board-esg-report", id],
    queryFn: () => fetchEsgReport(id),
  });

  const readMut = useMutation({
    mutationFn: () => markEsgReportRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board-esg-reports"] });
      qc.invalidateQueries({ queryKey: ["board-esg-report", id] });
    },
  });

  // Opening it is what counts as reading it.
  useEffect(() => {
    if (report && !report.readAt && !readMut.isPending && !readMut.isSuccess) {
      readMut.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?._id, report?.readAt]);

  const download = async () => {
    if (!report) return;
    try {
      await downloadEsgReportPdf(report._id, `${report.title}.pdf`);
    } catch {
      toast.error("Couldn't download the report — try again.");
    }
  };

  const back = (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Back to Board Packs
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {back}
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading report…
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="space-y-6">
        {back}
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            This report isn't available. It may not have been published yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { snapshot: snap } = report;
  const t = snap.totals;

  return (
    <div className="space-y-6">
      {back}

      <Card className="border-l-4 border-l-primary">
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-bold">{report.title}</p>
              <p className="text-xs text-muted-foreground">
                {snap.businessName} · {snap.frameworkLabel} · Period{" "}
                {report.period}
                {report.publishedAt &&
                  ` · Published ${fmt(report.publishedAt)}`}
                {report.publishedBy && ` by ${report.publishedBy}`}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={download}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
            </Button>
          </div>
          {report.message && (
            <p className="border-l-2 border-warning/60 bg-muted/40 px-3 py-2 text-sm">
              {report.message}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
            {[
              ["Disclosures", String(t.total)],
              ["Signed off", `${t.signedOff} of ${t.applicable}`],
              ["Pending", String(t.pending)],
              ["Coverage", `${t.pct}%`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border p-3">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {k}
                </div>
                <div className="text-lg font-semibold">{v}</div>
              </div>
            ))}
          </div>
          {report.readAt && (
            <p className="flex items-center gap-1.5 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> You opened this report on{" "}
              {fmt(report.readAt)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          {snap.indicators.map((i) => (
            <IndicatorBlock key={i.code} i={i} />
          ))}
          {!snap.indicators.length && (
            <p className="text-sm text-muted-foreground">
              This report has no disclosures.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
