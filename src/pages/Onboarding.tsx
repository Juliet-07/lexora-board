import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BookOpen,
  Ban,
  Check,
  CheckCircle2,
  Download,
  FileText,
  Handshake,
  Lock,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  ONBOARDING_START_STEP,
  ONBOARDING_STEP_COUNT,
  STEP1_COMPLETED_ON,
  appointmentRecord,
  coiDefaults,
  coiQuestions,
  inductionItems,
  onboardingSteps,
  portalFeatures,
  regulatoryDefaults,
  regulatoryQuestions,
  signDocuments,
  trainingModules,
  type Directorship,
} from "@/data/onboardingMockData";

/* ───────── progress persistence (dummy, browser-only) ───────── */

const STORAGE_KEY = "lexora-board-onboarding";
interface Progress {
  current: number; // 1..7 (7 = every step complete)
  completedOn: Record<number, string>;
}
const initialProgress = (): Progress => ({
  current: ONBOARDING_START_STEP,
  completedOn: { 1: STEP1_COMPLETED_ON },
});
function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch {
    /* ignore */
  }
  return initialProgress();
}

/* ───────── small building blocks ───────── */

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[12.5px] font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-[11.5px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function YesNo({
  id,
  question,
  value,
  onChange,
  detail,
  onDetail,
}: {
  id: string;
  question: string;
  value: boolean;
  onChange: (v: boolean) => void;
  detail: string;
  onDetail: (v: string) => void;
}) {
  return (
    <Field label={question} required>
      <div className="mt-1 flex gap-5">
        {[true, false].map((opt) => (
          <label
            key={String(opt)}
            className="flex cursor-pointer items-center gap-1.5 text-[13px]"
          >
            <input
              type="radio"
              name={id}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="h-4 w-4 accent-primary"
            />
            {opt ? "Yes" : "No"}
          </label>
        ))}
      </div>
      {value && (
        <div className="mt-2 rounded-lg border border-dashed bg-muted/40 p-3">
          <Textarea
            value={detail}
            onChange={(e) => onDetail(e.target.value)}
            placeholder="Provide details..."
            className="min-h-[60px] bg-card"
          />
        </div>
      )}
    </Field>
  );
}

function DirectorshipRows({
  rows,
  onChange,
  placeholders,
}: {
  rows: Directorship[];
  onChange: (r: Directorship[]) => void;
  placeholders: [string, string, string];
}) {
  const set = (i: number, k: keyof Directorship, v: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  return (
    <div className="rounded-lg border border-dashed bg-muted/40 p-3.5">
      {rows.map((r, i) => (
        <div key={i} className="mb-2 grid gap-2 sm:grid-cols-3">
          <Input
            className="bg-card"
            placeholder={placeholders[0]}
            value={r.company}
            onChange={(e) => set(i, "company", e.target.value)}
          />
          <Input
            className="bg-card"
            placeholder={placeholders[1]}
            value={r.position}
            onChange={(e) => set(i, "position", e.target.value)}
          />
          <Input
            className="bg-card"
            placeholder={placeholders[2]}
            value={r.detail}
            onChange={(e) => set(i, "detail", e.target.value)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...rows, { company: "", position: "", detail: "" }])
        }
        className="text-[11.5px] font-semibold text-primary hover:underline"
      >
        + Add another directorship
      </button>
    </div>
  );
}

function Declaration({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-primary/15 bg-accent p-3.5 text-[12.5px] text-muted-foreground">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-primary"
      />
      <label htmlFor={id} className="cursor-pointer">
        {children}
      </label>
    </div>
  );
}

function StatusBanner({
  kind,
  children,
}: {
  kind: "done" | "current" | "locked";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-2.5 rounded-lg px-4 py-3 text-[12.5px] font-semibold",
        kind === "done" && "bg-success/10 text-success",
        kind === "current" && "bg-accent text-accent-foreground",
        kind === "locked" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}

function PanelHead({
  n,
  kind,
  title,
}: {
  n: number;
  kind: "done" | "current" | "locked";
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div
        className={cn(
          "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
          kind === "locked"
            ? "bg-muted text-muted-foreground"
            : kind === "done"
              ? "bg-success text-white"
              : "bg-primary text-primary-foreground",
        )}
      >
        {kind === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
      </div>
      <b className="text-[15px]">{title}</b>
    </div>
  );
}

function ActionButton({
  done,
  current,
  onClick,
  children,
  disabledHint,
}: {
  done: boolean;
  current: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabledHint: string;
}) {
  if (done) return null;
  return (
    <>
      <Button
        type="button"
        onClick={onClick}
        disabled={!current}
        className="mt-5 h-11 w-full rounded-lg font-semibold"
      >
        {children}
      </Button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {disabledHint}
      </p>
    </>
  );
}

function ToggleDoneButton({
  done,
  label,
  doneLabel,
  onClick,
}: {
  done: boolean;
  label: string;
  doneLabel: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={done}
      className={cn(
        "shrink-0",
        done &&
          "border-success bg-success text-white opacity-100 hover:bg-success disabled:opacity-100",
      )}
    >
      {done && <Check className="mr-1 h-3.5 w-3.5" />}
      {done ? doneLabel : label}
    </Button>
  );
}

const docIcons = { charter: BookOpen, conduct: Handshake, nda: Lock };
const modIcons = { shield: ShieldCheck, lock: LockKeyhole, ban: Ban };

/* ───────── page ───────── */

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [viewing, setViewing] = useState<number>(() =>
    Math.min(loadProgress().current, ONBOARDING_STEP_COUNT),
  );
  const { current, completedOn } = progress;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* ignore */
    }
  }, [progress]);

  // Step 2 – regulatory
  const [fullName, setFullName] = useState(
    user ? `${user.firstName} ${user.lastName}` : "",
  );
  const [dob, setDob] = useState(regulatoryDefaults.dob);
  const [idNumber, setIdNumber] = useState(regulatoryDefaults.idNumber);
  const [nationality, setNationality] = useState(
    regulatoryDefaults.nationality,
  );
  const [address, setAddress] = useState(regulatoryDefaults.address);
  const [pastDirs, setPastDirs] = useState<Directorship[]>(
    regulatoryDefaults.directorships,
  );
  const [regAnswers, setRegAnswers] = useState<
    Record<string, { yes: boolean; detail: string }>
  >(
    Object.fromEntries(
      regulatoryQuestions.map((q) => [q.id, { yes: false, detail: "" }]),
    ),
  );
  const [reference, setReference] = useState(regulatoryDefaults.reference);
  const [regDeclared, setRegDeclared] = useState(false);

  // Step 3 – documents & COI
  const [signed, setSigned] = useState<string[]>([]);
  const [holdsDirs, setHoldsDirs] = useState(true);
  const [currentDirs, setCurrentDirs] = useState<Directorship[]>(
    coiDefaults.directorships,
  );
  const [coiAnswers, setCoiAnswers] = useState<
    Record<string, { yes: boolean; detail: string }>
  >(
    Object.fromEntries(
      coiQuestions.map((q) => [q.id, { yes: false, detail: "" }]),
    ),
  );
  const [coiDeclared, setCoiDeclared] = useState(false);

  // Step 4 – training
  const [trained, setTrained] = useState<string[]>([]);

  // Step 5 – induction
  const [inductionDate, setInductionDate] = useState("");
  const [indDeclared, setIndDeclared] = useState(false);

  const kindOf = (n: number): "done" | "current" | "locked" =>
    n < current ? "done" : n === current ? "current" : "locked";

  const advance = (n: number, message: string) => {
    if (n !== current) return;
    const today = format(new Date(), "d MMM yyyy");
    // Step 5 is the last action: portal activation (step 6) happens automatically with it.
    const lastAction = n === ONBOARDING_STEP_COUNT - 1;
    setProgress((p) => ({
      current: lastAction ? ONBOARDING_STEP_COUNT + 1 : p.current + 1,
      completedOn: {
        ...p.completedOn,
        [n]: today,
        ...(lastAction ? { [ONBOARDING_STEP_COUNT]: today } : {}),
      },
    }));
    setViewing(n + 1);
    toast.success(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitRegulatory = () => {
    if (![fullName, dob, idNumber, nationality, address].every((v) => v.trim()))
      return toast.error("Please complete all required fields.");
    if (
      regulatoryQuestions.some(
        (q) => regAnswers[q.id].yes && !regAnswers[q.id].detail.trim(),
      )
    )
      return toast.error("Please give details for each 'Yes' answer.");
    if (!regDeclared)
      return toast.error("Please tick the declaration before submitting.");
    advance(2, "Fit & Proper declaration submitted to the Company Secretary.");
  };

  const submitDocuments = () => {
    if (signed.length < signDocuments.length)
      return toast.error("All 3 documents must be signed first.");
    if (holdsDirs && !currentDirs.some((d) => d.company.trim()))
      return toast.error("Please list your current directorships.");
    if (
      coiQuestions.some(
        (q) => coiAnswers[q.id].yes && !coiAnswers[q.id].detail.trim(),
      )
    )
      return toast.error("Please give details for each 'Yes' answer.");
    if (!coiDeclared)
      return toast.error("Please tick the declaration before submitting.");
    advance(3, "Documents and Conflict of Interest declaration submitted.");
  };

  const submitTraining = () => {
    if (trained.length < trainingModules.length)
      return toast.error("All 3 modules must be marked complete first.");
    advance(4, "Mandatory training complete.");
  };

  const submitInduction = () => {
    if (!indDeclared)
      return toast.error("Please acknowledge receipt of the induction pack.");
    advance(5, "Induction confirmed. Your portal access is now active.");
  };

  const resetDemo = () => {
    setProgress(initialProgress());
    setViewing(ONBOARDING_START_STEP);
    setSigned([]);
    setTrained([]);
    setRegDeclared(false);
    setCoiDeclared(false);
    setIndDeclared(false);
    setInductionDate("");
    toast("Onboarding demo reset.");
  };

  const allDone = current > ONBOARDING_STEP_COUNT;
  const hint = allDone
    ? "All steps complete. Click any step to review it."
    : `Steps 1–${current - 1} complete. Step ${current} is your current step. Click any step to review it, or ahead to preview locked steps.`;

  const lockedNote = (n: number) =>
    `Locked — unlocks once Step ${n - 1} is submitted`;
  const banner = (n: number) => {
    const k = kindOf(n);
    if (k === "done")
      return (
        <StatusBanner kind="done">
          <CheckCircle2 className="h-4 w-4" /> Completed{" "}
          {completedOn[n] ?? completedOn[n - 1]}
        </StatusBanner>
      );
    if (k === "current")
      return (
        <StatusBanner kind="current">
          <Circle className="h-3 w-3 fill-current" /> In progress — this is your
          current step
        </StatusBanner>
      );
    return (
      <StatusBanner kind="locked">
        <Lock className="h-4 w-4" /> {lockedNote(n)}
      </StatusBanner>
    );
  };
  const panelClass = (n: number) =>
    cn(
      "rounded-xl border bg-card p-5 sm:p-6",
      kindOf(n) === "current" && "border-2 border-primary",
    );
  // Completed and locked steps are read-only; only the current step is editable.
  const readOnly = (n: number) => kindOf(n) !== "current";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Onboarding</h1>
          <p className="text-sm text-muted-foreground">
            Click any step to review it. Complete the current step's action to
            move on to the next one.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetDemo}
          className="text-xs text-muted-foreground"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset demo
        </Button>
      </div>

      {/* Stepper — every step is a clickable tab */}
      <div>
        <ol className="grid grid-cols-6 overflow-hidden rounded-xl border bg-card">
          {onboardingSteps.map((s) => {
            const k = kindOf(s.n);
            return (
              <li key={s.n} className="border-r last:border-r-0">
                <button
                  type="button"
                  onClick={() => setViewing(s.n)}
                  aria-current={viewing === s.n ? "step" : undefined}
                  className={cn(
                    "flex w-full flex-col items-center px-0.5 py-3.5 text-center transition-colors hover:bg-accent/60 sm:px-2",
                    viewing === s.n && "bg-accent hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      k === "done" && "bg-success text-white",
                      k === "current" && "bg-primary text-primary-foreground",
                      k === "locked" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {k === "done" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      s.n
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-bold sm:text-[10.5px]",
                      k === "done" && "text-success",
                      k === "current" && "text-primary",
                      k === "locked" && "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-center text-[11.5px] text-muted-foreground">
          {hint}
        </p>
      </div>

      {/* STEP 1 */}
      {viewing === 1 && (
        <section>
          {banner(1)}
          <div className={panelClass(1)}>
            <PanelHead
              n={1}
              kind={kindOf(1)}
              title={onboardingSteps[0].title}
            />
            <Row label="Appointment letter">
              <Badge className="bg-success/10 text-success hover:bg-success/10">
                ✓ Accepted
              </Badge>
            </Row>
            {appointmentRecord.map((r) => (
              <Row key={r.label} label={r.label}>
                {r.value}
              </Row>
            ))}
            <Row label="Consent to Act as Director">
              <Badge className="bg-success/10 text-success hover:bg-success/10">
                ✓ Signed, {STEP1_COMPLETED_ON}
              </Badge>
            </Row>
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={() => toast("Demo only: no file to download yet.")}
              >
                <Download className="mr-1.5 h-4 w-4" /> Download signed consent
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {viewing === 2 && (
        <section>
          {banner(2)}
          <div className={panelClass(2)}>
            <PanelHead
              n={2}
              kind={kindOf(2)}
              title={onboardingSteps[1].title}
            />
            <fieldset disabled={readOnly(2)} className="contents">
              <p className="-mt-2 mb-4 text-[12.5px] text-muted-foreground">
                This declaration is submitted to the relevant Regulator as part
                of your Fit &amp; Proper assessment. Please complete all fields
                accurately.
              </p>
              <div className="grid gap-x-3 sm:grid-cols-2">
                <Field label="Full legal name" required>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Field>
                <Field label="Date of birth" required>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </Field>
                <Field label="National ID / passport number" required>
                  <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </Field>
                <Field label="Nationality" required>
                  <Input
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Residential address" required>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Field>

              <Field label="Previous directorships held in the last 5 years">
                <DirectorshipRows
                  rows={pastDirs}
                  onChange={setPastDirs}
                  placeholders={["Company name", "Position", "Dates held"]}
                />
              </Field>

              {regulatoryQuestions.map((q) => (
                <YesNo
                  key={q.id}
                  id={`reg-${q.id}`}
                  question={q.text}
                  value={regAnswers[q.id].yes}
                  onChange={(yes) =>
                    setRegAnswers((a) => ({
                      ...a,
                      [q.id]: { ...a[q.id], yes },
                    }))
                  }
                  detail={regAnswers[q.id].detail}
                  onDetail={(detail) =>
                    setRegAnswers((a) => ({
                      ...a,
                      [q.id]: { ...a[q.id], detail },
                    }))
                  }
                />
              ))}

              <Field label="Professional reference">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    placeholder="Name"
                    value={reference.name}
                    onChange={(e) =>
                      setReference({ ...reference, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Relationship"
                    value={reference.relationship}
                    onChange={(e) =>
                      setReference({
                        ...reference,
                        relationship: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Contact email"
                    value={reference.email}
                    onChange={(e) =>
                      setReference({ ...reference, email: e.target.value })
                    }
                  />
                </div>
              </Field>

              <Declaration
                id="reg-declare"
                checked={regDeclared || kindOf(2) === "done"}
                onChange={setRegDeclared}
              >
                I declare that the information provided is true and complete,
                and I consent to Lexora Africa submitting this declaration to
                the relevant Regulator on my behalf.
              </Declaration>
            </fieldset>
            <ActionButton
              done={kindOf(2) === "done"}
              current={kindOf(2) === "current"}
              onClick={submitRegulatory}
              disabledHint={
                kindOf(2) === "locked"
                  ? lockedNote(2)
                  : "Submitting sends this declaration to the Company Secretary for filing with the Regulator, and unlocks Step 3."
              }
            >
              Submit Fit &amp; Proper declaration
            </ActionButton>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {viewing === 3 && (
        <section>
          {banner(3)}
          <div className={panelClass(3)}>
            <PanelHead
              n={3}
              kind={kindOf(3)}
              title={onboardingSteps[2].title}
            />
            <fieldset disabled={readOnly(3)} className="contents">
              <h3 className="mb-2 text-[13px] font-bold">
                Sign the following documents
              </h3>
              {signDocuments.map((d) => {
                const Icon = docIcons[d.icon as keyof typeof docIcons];
                const isSigned = signed.includes(d.id) || kindOf(3) === "done";
                return (
                  <div
                    key={d.id}
                    className="mb-2 flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <b className="block text-[13px]">{d.title}</b>
                      <div className="text-[11px] text-muted-foreground">
                        {d.meta}
                      </div>
                    </div>
                    <ToggleDoneButton
                      done={isSigned}
                      label="Sign now"
                      doneLabel="Signed"
                      onClick={() => setSigned((s) => [...s, d.id])}
                    />
                  </div>
                );
              })}

              <h3 className="mb-1 mt-6 text-[13px] font-bold">
                Conflict of Interest declaration
              </h3>
              <p className="mb-4 text-[12.5px] text-muted-foreground">
                Used to maintain the Conflict of Interest register and identify
                any recusal requirements at board and committee meetings.
              </p>

              <Field
                label="Do you currently hold directorships in any other company?"
                required
              >
                <div className="mt-1 flex gap-5">
                  {[true, false].map((opt) => (
                    <label
                      key={String(opt)}
                      className="flex cursor-pointer items-center gap-1.5 text-[13px]"
                    >
                      <input
                        type="radio"
                        name="coi-holds"
                        checked={holdsDirs === opt}
                        onChange={() => setHoldsDirs(opt)}
                        className="h-4 w-4 accent-primary"
                      />
                      {opt ? "Yes" : "No"}
                    </label>
                  ))}
                </div>
                {holdsDirs && (
                  <div className="mt-2">
                    <DirectorshipRows
                      rows={currentDirs}
                      onChange={setCurrentDirs}
                      placeholders={[
                        "Company name",
                        "Your position",
                        "Nature of business",
                      ]}
                    />
                  </div>
                )}
              </Field>

              {coiQuestions.map((q) => (
                <YesNo
                  key={q.id}
                  id={`coi-${q.id}`}
                  question={q.text}
                  value={coiAnswers[q.id].yes}
                  onChange={(yes) =>
                    setCoiAnswers((a) => ({
                      ...a,
                      [q.id]: { ...a[q.id], yes },
                    }))
                  }
                  detail={coiAnswers[q.id].detail}
                  onDetail={(detail) =>
                    setCoiAnswers((a) => ({
                      ...a,
                      [q.id]: { ...a[q.id], detail },
                    }))
                  }
                />
              ))}

              <Declaration
                id="coi-declare"
                checked={coiDeclared || kindOf(3) === "done"}
                onChange={setCoiDeclared}
              >
                I declare that the information provided above is true, complete,
                and accurate, and I undertake to notify the Company Secretary
                promptly of any change in circumstances.
              </Declaration>
            </fieldset>
            <ActionButton
              done={kindOf(3) === "done"}
              current={kindOf(3) === "current"}
              onClick={submitDocuments}
              disabledHint={
                kindOf(3) === "locked"
                  ? lockedNote(3)
                  : "All 3 documents must be signed before this submits."
              }
            >
              Submit documents &amp; declaration
            </ActionButton>
          </div>
        </section>
      )}

      {/* STEP 4 */}
      {viewing === 4 && (
        <section>
          {banner(4)}
          <div className={panelClass(4)}>
            <PanelHead
              n={4}
              kind={kindOf(4)}
              title={onboardingSteps[3].title}
            />
            <fieldset disabled={readOnly(4)} className="contents">
              {trainingModules.map((m) => {
                const Icon = modIcons[m.icon as keyof typeof modIcons];
                const isDone = trained.includes(m.id) || kindOf(4) === "done";
                return (
                  <div
                    key={m.id}
                    className="mb-2 flex items-center gap-3 rounded-lg border p-3.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <b className="block text-[13px]">{m.title}</b>
                      <div className="text-[11px] text-muted-foreground">
                        {m.meta}
                      </div>
                    </div>
                    <ToggleDoneButton
                      done={isDone}
                      label="Start module"
                      doneLabel="Complete"
                      onClick={() => setTrained((t) => [...t, m.id])}
                    />
                  </div>
                );
              })}
            </fieldset>
            <ActionButton
              done={kindOf(4) === "done"}
              current={kindOf(4) === "current"}
              onClick={submitTraining}
              disabledHint={
                kindOf(4) === "locked"
                  ? lockedNote(4)
                  : "All 3 modules must be marked complete first."
              }
            >
              Complete training
            </ActionButton>
          </div>
        </section>
      )}

      {/* STEP 5 */}
      {viewing === 5 && (
        <section>
          {banner(5)}
          <div className={panelClass(5)}>
            <PanelHead
              n={5}
              kind={kindOf(5)}
              title={onboardingSteps[4].title}
            />
            <fieldset disabled={readOnly(5)} className="contents">
              <p className="mb-2 text-[12.5px] text-muted-foreground">
                Review the induction pack below, then acknowledge receipt.
              </p>
              {inductionItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 py-1.5 text-[12.5px] text-muted-foreground"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" /> {item}
                </div>
              ))}
              <div className="mt-4">
                <Field label="Schedule your induction session">
                  <Input
                    type="date"
                    value={inductionDate}
                    onChange={(e) => setInductionDate(e.target.value)}
                  />
                </Field>
              </div>
              <Declaration
                id="ind-declare"
                checked={indDeclared || kindOf(5) === "done"}
                onChange={setIndDeclared}
              >
                I acknowledge receipt of the induction pack and will review it
                before my first board meeting.
              </Declaration>
            </fieldset>
            <ActionButton
              done={kindOf(5) === "done"}
              current={kindOf(5) === "current"}
              onClick={submitInduction}
              disabledHint={
                kindOf(5) === "locked"
                  ? lockedNote(5)
                  : "Confirming activates your full Board Portal access."
              }
            >
              Acknowledge &amp; confirm induction
            </ActionButton>
          </div>
        </section>
      )}

      {/* STEP 6 */}
      {viewing === 6 && (
        <section>
          {banner(6)}
          <div className={panelClass(6)}>
            {kindOf(6) === "locked" ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-muted text-muted-foreground">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-[17px] font-bold text-muted-foreground">
                  Portal access activation
                </h3>
                <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                  Once unlocked, your full Board Portal access is enabled
                  automatically.
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-success/20 bg-success/10 text-success">
                  <Check className="h-7 w-7" strokeWidth={3} />
                </div>
                <h3 className="text-[17px] font-bold">
                  Portal access activated
                </h3>
                <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                  Onboarding is complete. Your full Board Portal access is now
                  enabled.
                </p>
              </div>
            )}
            <div className="mt-2">
              {portalFeatures.map((f) => (
                <Row key={f} label={f}>
                  {kindOf(6) === "locked" ? (
                    <Badge variant="secondary">Locked</Badge>
                  ) : (
                    <Badge className="bg-success/10 text-success hover:bg-success/10">
                      Enabled
                    </Badge>
                  )}
                </Row>
              ))}
            </div>
            {kindOf(6) !== "locked" && (
              <Button
                className="mt-5 h-11 w-full rounded-lg font-semibold"
                onClick={() => navigate("/dashboard")}
              >
                Go to dashboard
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 text-[12.5px] last:border-b-0">
      <span>{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
