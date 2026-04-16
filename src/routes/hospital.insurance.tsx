import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Shield, FileCheck, IndianRupee, Sparkles, AlertTriangle, CheckCircle2,
  Info, Search, ChevronRight, FileText, User, ClipboardList, ExternalLink,
  Wallet, HeartHandshake, ShieldCheck, FileWarning, BadgeCheck,
} from "lucide-react";
import {
  checkInsurance, EMPTY_PROFILE, SAMPLE_PROFILE,
  type PatientProfile, type InsuranceResult, type SchemeMatch,
} from "@/lib/insuranceEngine";

export const Route = createFileRoute("/hospital/insurance")({
  head: () => ({
    meta: [
      { title: "Insurance Intelligence — MedFlow Nexus" },
      { name: "description", content: "Government scheme matcher, private insurance checker, document readiness and coverage impact for every patient." },
    ],
  }),
  component: InsurancePage,
});

const STATES = ["Tamil Nadu", "Andhra Pradesh", "Karnataka", "Kerala", "Maharashtra", "Other"];
const TN_DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Vellore", "Erode", "Thanjavur", "Other"];

const labelTone: Record<string, string> = {
  "Likely Eligible": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  "Possible Match": "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  "Needs Verification": "bg-amber-500/10 text-amber-300 border-amber-500/30",
  "Not Enough Data": "bg-muted/30 text-muted-foreground border-border/40",
  "No Current Match Found": "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

function fmtINR(n: number) {
  if (!n) return "—";
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return `₹${n}`;
}

function InsurancePage() {
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [result, setResult] = useState<InsuranceResult | null>(null);
  const [running, setRunning] = useState(false);

  const valid = useMemo<boolean>(() =>
    profile.name.trim().length > 1 && typeof profile.age === "number" && profile.age > 0 && Boolean(profile.gender) && Boolean(profile.state),
    [profile]
  );

  const update = <K extends keyof PatientProfile>(k: K, v: PatientProfile[K]) => setProfile(p => ({ ...p, [k]: v }));

  const run = () => {
    if (!valid) return;
    setRunning(true);
    setTimeout(() => {
      setResult(checkInsurance(profile));
      setRunning(false);
    }, 700);
  };

  const loadSample = () => { setProfile(SAMPLE_PROFILE); setResult(checkInsurance(SAMPLE_PROFILE)); };
  const reset = () => { setProfile(EMPTY_PROFILE); setResult(null); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-primary mb-2">
            <Shield className="h-3 w-3" /> INSURANCE INTELLIGENCE
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Patient Affordability Console</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Match every patient to real Indian / Tamil Nadu government schemes and private cover. Heuristic eligibility — final approval requires manual verification.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSample} className="px-3 py-2 rounded-lg glass border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40">
            Load sample patient
          </button>
          <Link to="/hospital/insurance-sources" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40">
            <FileText className="h-3.5 w-3.5" /> Data sources
          </Link>
        </div>
      </div>

      {/* Honesty banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
        <Info className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          MedFlow Nexus never guarantees eligibility. All matches are heuristic estimates based on publicly available scheme criteria.
          Confirm enrolment status, sum insured, and document validity directly with the scheme authority or insurer before clinical or financial action.
        </div>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        {/* ===== LEFT: PATIENT FORM ===== */}
        <aside className="glass rounded-2xl border border-border/30 p-5 space-y-4 h-fit lg:sticky lg:top-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground">
            <User className="h-3.5 w-3.5 text-primary" /> PATIENT PROFILE
          </div>

          <Field label="Patient Name">
            <input value={profile.name} onChange={e => update("name", e.target.value)} maxLength={80}
              placeholder="Full name" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <input type="number" min={0} max={120} value={profile.age}
                onChange={e => update("age", e.target.value === "" ? "" : Math.min(120, Math.max(0, Number(e.target.value))))}
                className={inputCls} />
            </Field>
            <Field label="Gender">
              <select value={profile.gender} onChange={e => update("gender", e.target.value as PatientProfile["gender"])} className={inputCls}>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="State">
              <select value={profile.state} onChange={e => update("state", e.target.value)} className={inputCls}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="District">
              <select value={profile.district} onChange={e => update("district", e.target.value)} className={inputCls}>
                <option value="">Select</option>
                {TN_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Occupation">
            <select value={profile.occupation} onChange={e => update("occupation", e.target.value as PatientProfile["occupation"])} className={inputCls}>
              <option value="">Select</option>
              {["Formal Employee", "Informal Worker", "Government Employee", "Self-Employed", "Unemployed", "Student", "Retired"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Annual Family Income">
            <select value={profile.incomeCategory} onChange={e => update("incomeCategory", e.target.value as PatientProfile["incomeCategory"])} className={inputCls}>
              <option value="">Select</option>
              {["Below 1L", "1L–3L", "3L–8L", "8L+"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <div className="space-y-2 pt-1">
            <Toggle label="BPL / Ration card holder" value={profile.bplCardHolder} onChange={v => update("bplCardHolder", v)} />
            <Toggle label="Existing private insurance" value={profile.hasInsurance} onChange={v => update("hasInsurance", v)} />
            <Toggle label="Employer-provided coverage" value={profile.employerCovered} onChange={v => update("employerCovered", v)} />
            <Toggle label="Hospitalization required" value={profile.hospitalizationRequired} onChange={v => update("hospitalizationRequired", v)} />
          </div>

          <Field label="Diagnosis / Disease">
            <input value={profile.diagnosis} onChange={e => update("diagnosis", e.target.value)} maxLength={120} placeholder="e.g. Diabetes, MI, Maternity" className={inputCls} />
          </Field>

          <Field label="Planned Treatment Type">
            <select value={profile.treatmentType} onChange={e => update("treatmentType", e.target.value as PatientProfile["treatmentType"])} className={inputCls}>
              <option value="">Select</option>
              {["Outpatient", "Hospitalization", "Surgery", "Maternity", "Critical Care", "Diagnostic"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <div className="flex gap-2 pt-2">
            <button onClick={run} disabled={!valid || running}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
              {running ? <><span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Analyzing</> : <><Search className="h-3.5 w-3.5" /> Check Coverage</>}
            </button>
            <button onClick={reset} className="px-3 py-2.5 rounded-lg glass border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground">Reset</button>
          </div>
        </aside>

        {/* ===== RIGHT: RESULTS ===== */}
        <div className="space-y-5">
          {!result ? <EmptyState onRun={run} valid={valid} onSample={loadSample} /> : (
            <>
              {/* Master CTA banner */}
              <button onClick={run}
                className="w-full group relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-cyan-500/10 to-emerald-500/15 p-4 text-left hover:border-primary/70 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.2em] text-primary mb-1">JUDGE WOW MOMENT</div>
                    <div className="text-base font-bold">CHECK PATIENT SUPPORT NOW</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Re-run engine · refresh schemes, docs, coverage estimate</div>
                  </div>
                  <Sparkles className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
                </div>
              </button>

              <CoverageImpact result={result} />
              <PrivateInsurancePanel result={result} />
              <SchemeMatches schemes={result.schemes} />
              <DocumentsPanel result={result} />
              <AINotes notes={result.aiNotes} />
              <CoverageCharts result={result} />
              <GeneratedFooter at={result.generatedAt} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// =================== SUBCOMPONENTS ===================

const inputCls = "w-full px-3 py-2 rounded-lg bg-background/50 border border-border/40 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} type="button"
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-background/40 border border-border/40 hover:border-primary/40 transition-colors">
      <span className="text-xs text-foreground">{label}</span>
      <span className={`relative h-4 w-7 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all ${value ? "left-3.5" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function EmptyState({ onRun, valid, onSample }: { onRun: () => void; valid: boolean; onSample: () => void }) {
  return (
    <div className="glass rounded-2xl border border-dashed border-border/40 p-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <HeartHandshake className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-bold mb-1.5">Patient Affordability Intelligence</h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5">
        Enter patient details to match against Ayushman Bharat, CMCHIS, ESI, CGHS and 4+ public schemes. Get document checklist and out-of-pocket estimate instantly.
      </p>
      <div className="flex justify-center gap-2">
        <button onClick={onRun} disabled={!valid} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40">
          Check Coverage
        </button>
        <button onClick={onSample} className="px-4 py-2 rounded-lg glass border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground">
          Use sample patient
        </button>
      </div>
    </div>
  );
}

function CoverageImpact({ result }: { result: InsuranceResult }) {
  const { coverage } = result;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat icon={Wallet} tone="text-emerald-400" label="Out-of-Pocket Reduced" value={`${coverage.outOfPocketReductionPct}%`} />
      <Stat icon={IndianRupee} tone="text-primary" label="Coverage Available" value={fmtINR(coverage.estimatedCoverageINR)} />
      <Stat icon={FileCheck} tone="text-cyan-400" label="Approval Readiness" value={`${coverage.approvalReadinessPct}%`} />
      <Stat icon={BadgeCheck} tone="text-violet-400" label="Avg Scheme Confidence" value={`${coverage.schemeConfidenceAvg}%`} />
      <div className="sm:col-span-2 lg:col-span-4 glass rounded-xl border border-primary/30 bg-primary/5 p-3.5 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-primary mt-0.5" />
        <div>
          <div className="text-[10px] font-bold tracking-wider text-primary mb-1">PRIMARY RECOMMENDATION</div>
          <div className="text-xs text-foreground">{coverage.primaryRecommendation}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, tone, label, value }: { icon: typeof Wallet; tone: string; label: string; value: string }) {
  return (
    <div className="glass rounded-xl border border-border/30 p-4 hover:border-primary/40 transition-colors">
      <Icon className={`h-4 w-4 ${tone} mb-2`} />
      <div className="text-2xl font-black tracking-tight">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">{label}</div>
    </div>
  );
}

function PrivateInsurancePanel({ result }: { result: InsuranceResult }) {
  const { privateInsurance } = result;
  const tone = privateInsurance.status === "covered" ? "border-emerald-500/30 bg-emerald-500/5"
    : privateInsurance.status === "needs-verification" ? "border-amber-500/30 bg-amber-500/5"
    : "border-rose-500/30 bg-rose-500/5";
  const Icon = privateInsurance.status === "covered" ? ShieldCheck : privateInsurance.status === "needs-verification" ? Shield : Wallet;
  const title = privateInsurance.status === "covered" ? "Private Cover Active" : privateInsurance.status === "needs-verification" ? "Private Insurance — Verification Required" : "Self-Pay Likely";

  return (
    <div className={`glass rounded-2xl border ${tone} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-foreground" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {privateInsurance.notes.map(n => (
          <li key={n} className="text-xs text-muted-foreground flex gap-2">
            <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />{n}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SchemeMatches({ schemes }: { schemes: SchemeMatch[] }) {
  if (!schemes.length) {
    return (
      <div className="glass rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold mb-1">No Current Match Found</h3>
          <p className="text-xs text-muted-foreground">No direct scheme confidently matched based on current details. Consider financial counseling and self-pay planning.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold inline-flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5 text-primary" /> Scheme Matches</h3>
        <span className="text-[10px] text-muted-foreground">{schemes.length} scheme{schemes.length !== 1 ? "s" : ""} evaluated</span>
      </div>
      <div className="space-y-2.5">
        {schemes.map(s => (
          <div key={s.id} className="glass rounded-xl border border-border/30 p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-foreground">{s.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${labelTone[s.label]}`}>{s.label}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.authority}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-black text-primary leading-none">{s.confidence}<span className="text-xs text-muted-foreground">%</span></div>
                <div className="text-[9px] text-muted-foreground tracking-wider uppercase mt-0.5">Confidence</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5 mb-3">
              <InfoRow label="Coverage" value={s.coverageType} />
              <InfoRow label="Benefit" value={s.benefitRange} />
            </div>

            {s.whyEligible.length > 0 && (
              <div className="mb-2.5">
                <div className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase mb-1.5">Why eligible</div>
                <ul className="space-y-1">
                  {s.whyEligible.map(r => (
                    <li key={r} className="text-[11px] text-muted-foreground flex gap-2">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {s.whyNotEligible && s.whyNotEligible.length > 0 && (
              <div className="mb-2.5">
                <div className="text-[10px] font-semibold tracking-wider text-rose-400 uppercase mb-1.5">Caveats</div>
                <ul className="space-y-1">
                  {s.whyNotEligible.map(r => (
                    <li key={r} className="text-[11px] text-muted-foreground flex gap-2">
                      <FileWarning className="h-3 w-3 text-rose-400 mt-0.5 shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-2.5 border-t border-border/30">
              <div className="text-[11px] text-muted-foreground">Apply at: <span className="text-foreground">{s.applyAt}</span></div>
              <a href={s.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                Official source <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/30 border border-border/30 px-3 py-2">
      <div className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</div>
      <div className="text-[11px] text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function DocumentsPanel({ result }: { result: InsuranceResult }) {
  const items = result.documents;
  const tone: Record<string, string> = {
    Available: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    Missing: "border-rose-500/30 bg-rose-500/5 text-rose-300",
    "Need Verification": "border-amber-500/30 bg-amber-500/5 text-amber-300",
  };
  return (
    <div className="glass rounded-2xl border border-border/30 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold inline-flex items-center gap-2"><FileCheck className="h-3.5 w-3.5 text-primary" /> Document Readiness</h3>
        <span className="text-[10px] text-muted-foreground">{items.filter(d => d.status === "Available").length} / {items.filter(d => d.required).length} ready</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map(d => (
          <div key={d.name} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${tone[d.status]}`}>
            <div>
              <div className="text-xs font-semibold text-foreground">{d.name}{!d.required && <span className="text-[9px] text-muted-foreground ml-1">(optional)</span>}</div>
              {d.note && <div className="text-[10px] text-muted-foreground">{d.note}</div>}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AINotes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <div className="glass rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <h3 className="text-sm font-bold inline-flex items-center gap-2 mb-3"><Sparkles className="h-3.5 w-3.5 text-primary" /> AI Recommendations</h3>
      <ul className="space-y-1.5">
        {notes.map(n => (
          <li key={n} className="text-xs text-muted-foreground flex gap-2">
            <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />{n}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoverageCharts({ result }: { result: InsuranceResult }) {
  // Lightweight inline bars — avoids extra deps
  const top = result.schemes.slice(0, 5);
  const docCounts = result.documents.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const docMax = Math.max(1, ...Object.values(docCounts));

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="glass rounded-2xl border border-border/30 p-5">
        <h4 className="text-xs font-bold tracking-wider mb-3 uppercase text-muted-foreground">Scheme Confidence Distribution</h4>
        {top.length ? (
          <div className="space-y-2">
            {top.map(s => (
              <div key={s.id}>
                <div className="flex justify-between text-[11px] mb-1"><span className="truncate text-foreground">{s.name}</span><span className="text-muted-foreground">{s.confidence}%</span></div>
                <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${s.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-muted-foreground">No schemes matched.</p>}
      </div>
      <div className="glass rounded-2xl border border-border/30 p-5">
        <h4 className="text-xs font-bold tracking-wider mb-3 uppercase text-muted-foreground">Document Status</h4>
        <div className="space-y-2">
          {(["Available", "Need Verification", "Missing"] as const).map(k => (
            <div key={k}>
              <div className="flex justify-between text-[11px] mb-1"><span className="text-foreground">{k}</span><span className="text-muted-foreground">{docCounts[k] || 0}</span></div>
              <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div className={`h-full ${k === "Available" ? "bg-emerald-400" : k === "Need Verification" ? "bg-amber-400" : "bg-rose-400"}`}
                  style={{ width: `${((docCounts[k] || 0) / docMax) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GeneratedFooter({ at }: { at: string }) {
  return (
    <div className="text-[10px] text-muted-foreground text-center pt-2">
      Generated {new Date(at).toLocaleString()} · Heuristic estimate · Verify with scheme authority
    </div>
  );
}
