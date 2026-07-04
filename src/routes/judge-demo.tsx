import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Pause, SkipForward, RotateCcw, X, ChevronRight, ChevronLeft,
  Sparkles, Brain, Zap, Activity, TrendingUp, Hospital, AlertTriangle,
  CheckCircle, Clock, DollarSign, Users, HeartPulse, Eye, EyeOff,
  HelpCircle, Rocket, Target, BarChart3, Shield, MapPin, Stethoscope,
} from "lucide-react";

export const Route = createFileRoute("/judge-demo")({
  head: () => ({
    meta: [
      { title: "Judge Demo — MedFlow Nexus Live Pitch Experience" },
      { name: "description", content: "Cinematic guided demo: problem, AI solution, real impact, and final reveal across 10 scenes." },
      { property: "og:title", content: "MedFlow Nexus Judge Demo" },
      { property: "og:description", content: "10-scene guided story with scenarios, ROI reveal and presenter assist." },
    ],
  }),
  component: JudgeDemoPage,
});

// ============= SCENES =============
interface Scene {
  id: number;
  phase: "problem" | "solution" | "impact" | "reveal";
  icon: typeof Brain;
  title: string;
  caption: string;
  detail: string;
  metric?: { label: string; before: string; after: string; trend: "up" | "down" };
  talkingPoint: string;
  duration: number;
}

const SCENES: Scene[] = [
  { id: 1, phase: "problem", icon: Hospital, title: "Hospital Under Pressure",
    caption: "300-bed multi-specialty hospital · Chennai · 18:42 IST",
    detail: "Beds at 94% capacity. ER queue rising. Idle ventilators sitting unused in low-priority wards. Staff stretched thin.",
    metric: { label: "Occupancy", before: "78%", after: "94%", trend: "up" },
    talkingPoint: "Open with the human cost: every minute of overload risks lives.", duration: 4500 },
  { id: 2, phase: "problem", icon: BarChart3, title: "Existing Systems Just Watch",
    caption: "Traditional dashboards = passive observation",
    detail: "HMS / EMR systems report numbers, but no system tells the hospital WHAT to do. Decisions stay manual, reactive, and slow.",
    talkingPoint: "Frame the gap: dashboards exist everywhere, intelligence does not.", duration: 4500 },
  { id: 3, phase: "solution", icon: Sparkles, title: "MedFlow Nexus Activates",
    caption: "Dual-mode platform: Regional + Hospital intelligence",
    detail: "Real-time digital twin lights up. 7 departments, 230 assets, 90-day baseline — all live.",
    talkingPoint: "This is the wow moment — show the platform waking up.", duration: 4000 },
  { id: 4, phase: "solution", icon: Brain, title: "AI Predicts Overload",
    caption: "Forecast engine projects next 6 hours",
    detail: "Admission surge +22% predicted. ICU stress probability 34%. Discharge bottleneck flagged: 12 patients delayed.",
    metric: { label: "ICU Risk", before: "Low", after: "HIGH", trend: "up" },
    talkingPoint: "Stress that this is hours BEFORE crisis hits — not after.", duration: 4500 },
  { id: 5, phase: "solution", icon: Eye, title: "Idle Resources Detected",
    caption: "Optimization engine scans 230 assets across 7 wards",
    detail: "Ventilator V12 idle 6 hours in General Ward. Monitor M08 unused 3 hours. Wheelchair fleet 40% idle in Surgery.",
    metric: { label: "Idle Assets", before: "—", after: "23", trend: "up" },
    talkingPoint: "Show the waste hospitals can't see today.", duration: 4500 },
  { id: 6, phase: "solution", icon: Zap, title: "Resources Reallocated",
    caption: "Smart engine moves assets to where they're needed",
    detail: "V12 → ICU. M08 → ER. 2 nurses redeployed from low-load ward. Reserve thresholds protected.",
    metric: { label: "ICU Available", before: "2", after: "6", trend: "up" },
    talkingPoint: "Emphasise: existing assets, used smarter — not new purchases.", duration: 4500 },
  { id: 7, phase: "solution", icon: Users, title: "Beds & Staff Balanced",
    caption: "Discharge acceleration + workforce rebalance",
    detail: "12 discharge-ready patients fast-tracked. 14 beds freed. Burnout risk on night shift mitigated.",
    metric: { label: "Beds Freed", before: "0", after: "14", trend: "up" },
    talkingPoint: "Connect resource moves to patient outcomes.", duration: 4500 },
  { id: 8, phase: "impact", icon: Clock, title: "Wait Time Drops",
    caption: "ER throughput recovers in real time",
    detail: "Average ER wait time falls from 45 minutes to 18. Patient flow stabilises. ICU stress resolves.",
    metric: { label: "Wait Time", before: "45 min", after: "18 min", trend: "down" },
    talkingPoint: "This is what patients feel — make it visceral.", duration: 4500 },
  { id: 9, phase: "impact", icon: DollarSign, title: "Measurable Business Impact",
    caption: "ROI engine quantifies every action taken",
    detail: "₹4.2L monthly savings. 3 ventilators purchase deferred. Overtime cost down 8%. Annual ROI: 312%.",
    metric: { label: "Monthly Savings", before: "₹0", after: "₹4.2L", trend: "up" },
    talkingPoint: "Pivot to investors: this saves money AND lives.", duration: 5000 },
  { id: 10, phase: "reveal", icon: Rocket, title: "MedFlow Nexus Wins",
    caption: "One platform. Statewide reach. Hospital-grade depth.",
    detail: "Built for Tamil Nadu's 1,264 hospitals and 38 districts. Multi-tenant. Edge-deployed. Production-ready.",
    talkingPoint: "Close strong: ready to deploy, ready to scale, ready to win.", duration: 5500 },
];

const SCENARIOS = [
  { id: "icu", label: "Chennai ICU Crisis", icon: HeartPulse, color: "text-rose-400",
    summary: "ICU at 96% with 4 critical incoming. AI rebalances vents and accelerates step-down transfers." },
  { id: "dengue", label: "Dengue Surge Week", icon: AlertTriangle, color: "text-amber-400",
    summary: "Seasonal admissions +40%. Pediatrics & General Med absorb load via cross-ward bed sharing." },
  { id: "accident", label: "Highway Accident Event", icon: Activity, color: "text-red-400",
    summary: "12 trauma cases inbound. Trauma beds reserved, 2 surgeons activated, ER staff doubled." },
  { id: "night", label: "Night Shift Shortage", icon: Users, color: "text-violet-400",
    summary: "3 nurses absent. Workload rebalanced across wards, burnout risk capped at amber." },
  { id: "idle", label: "Idle Equipment Waste", icon: Eye, color: "text-cyan-400",
    summary: "23 idle assets identified across 4 wards. ₹18L purchase avoidance modelled this quarter." },
  { id: "single", label: "Single Hospital Turnaround", icon: Hospital, color: "text-emerald-400",
    summary: "MedFlow General: 30-day occupancy gain +18%, wait time -27%, efficiency score 87/100." },
  { id: "medicine", label: "Dengue Outbreak Medicine Surge", icon: Sparkles, color: "text-fuchsia-400",
    summary: "Sudden dengue outbreak spikes Paracetamol & ORS demand +140%. AI predicts shortage 48h ahead, auto-generates reorder, and redistributes stock from DH Vellore → CHC Chennai — averting stock-out." },
];

const FAQ = [
  { q: "Why is AI needed here?", a: "Hospitals already have data. They lack continuous, prescriptive decisions. AI converts signal into action — every minute, across every ward." },
  { q: "Is the data real?", a: "Yes. Public Tamil Nadu HMIS, NHM, district health datasets, plus a rule-driven operational digital twin for the flagship hospital. All sources are visible in the Data Transparency module." },
  { q: "How scalable is this?", a: "Multi-tenant by design. Edge-deployed on Cloudflare Workers. AI models retrain per-tenant. Architecture validated for 1,000+ hospitals." },
  { q: "What's the revenue model?", a: "Three tiers: SaaS subscription (private hospitals), Enterprise (hospital chains), and Government (state-level deployments). TAM detailed in ROI module." },
  { q: "How do you deploy?", a: "Onboarding wizard captures hospital profile in under 10 minutes. Tenant-isolated workspace provisioned automatically. Zero infra setup required." },
  { q: "Why is this unique?", a: "Only platform combining statewide regional intelligence with per-hospital optimization. Most tools do one. We do both, with shared AI infrastructure." },
];

const FINAL_METRICS = [
  { label: "Wait Time Reduced", value: 27, suffix: "%", icon: Clock, color: "text-emerald-400" },
  { label: "Bed Utilization Gain", value: 18, suffix: "%", icon: TrendingUp, color: "text-cyan-400" },
  { label: "Idle Equipment Cut", value: 34, suffix: "%", icon: Zap, color: "text-violet-400" },
  { label: "ICU Stress Resolved", value: 100, suffix: "%", icon: HeartPulse, color: "text-rose-400" },
  { label: "Purchase Avoided", value: 18, suffix: "L", prefix: "₹", icon: DollarSign, color: "text-amber-400" },
  { label: "Emergency Readiness", value: 92, suffix: "/100", icon: Shield, color: "text-blue-400" },
];

const SHORTCUTS = [
  { label: "Skip to AI Prediction", scene: 3 },
  { label: "Skip to Optimization", scene: 5 },
  { label: "Skip to ROI Impact", scene: 8 },
  { label: "Skip to Final Reveal", scene: 9 },
];

const TIMER_MODES = [
  { label: "2 min pitch", seconds: 120 },
  { label: "3 min pitch", seconds: 180 },
  { label: "5 min detailed", seconds: 300 },
];

// ============= COUNTER HOOK =============
function useCounter(target: number, run: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) { setValue(0); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

// ============= MAIN PAGE =============
function JudgeDemoPage() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [scenario, setScenario] = useState<string | null>(null);
  const [presenterMode, setPresenterMode] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const advanceRef = useRef<number | null>(null);

  const scene = SCENES[sceneIdx];
  const progress = ((sceneIdx + (showReveal ? 1 : 0)) / SCENES.length) * 100;

  const advance = useCallback(() => {
    setSceneIdx((i) => {
      if (i >= SCENES.length - 1) {
        setShowReveal(true);
        setPlaying(false);
        return i;
      }
      return i + 1;
    });
  }, []);

  // autoplay
  useEffect(() => {
    if (!playing || showReveal) return;
    advanceRef.current = window.setTimeout(advance, scene.duration);
    return () => { if (advanceRef.current) window.clearTimeout(advanceRef.current); };
  }, [playing, sceneIdx, showReveal, advance, scene.duration]);

  // pitch timer
  useEffect(() => {
    if (timerSeconds === null) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerSeconds]);

  const reset = () => {
    setSceneIdx(0); setPlaying(false); setShowReveal(false);
    setScenario(null); setElapsed(0); setTimerSeconds(null);
  };

  const handleActivate = () => {
    setActivating(true);
    setTimeout(() => { setActivating(false); setActivated(true); }, 2800);
  };

  const fmtTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const timerColor = timerSeconds && elapsed > timerSeconds ? "text-rose-400" : timerSeconds && elapsed > timerSeconds * 0.8 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ====== ACTIVATION OVERLAY ====== */}
      {(activating || activated) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/97 backdrop-blur-xl">
          {activating ? (
            <div className="text-center">
              <div className="relative mx-auto mb-8">
                <div className="h-24 w-24 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
                <Rocket className="h-9 w-9 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">MedFlow Nexus Activating</h2>
              <p className="text-sm text-muted-foreground">Maps glowing · Alerts stabilising · Metrics optimising</p>
            </div>
          ) : (
            <div className="text-center max-w-lg px-6 animate-scale-in">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold mb-3">MedFlow Nexus is Live</h2>
              <p className="text-sm text-muted-foreground mb-6">Statewide intelligence and per-hospital optimization — both online.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setActivated(false)} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                  Continue Demo
                </button>
                <Link to="/dashboard" className="px-5 py-2.5 rounded-lg glass border border-border/40 text-sm font-medium hover:border-primary/40">
                  Open Platform
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== TOP BAR ====== */}
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Exit
            </Link>
            <div className="h-4 w-px bg-border/50" />
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-wide">JUDGE DEMO</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">Scene {sceneIdx + 1} / {SCENES.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {timerSeconds !== null && (
              <div className={`text-xs font-mono ${timerColor} px-2 py-1 rounded glass border border-border/40`}>
                {fmtTimer(elapsed)} / {fmtTimer(timerSeconds)}
              </div>
            )}
            <button onClick={() => setPresenterMode(!presenterMode)}
              className={`glass rounded-lg p-2 border transition-colors ${presenterMode ? "border-primary/50 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
              title="Presenter Assist">
              {presenterMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button onClick={() => setShowFAQ(!showFAQ)}
              className="glass rounded-lg p-2 border border-border/40 text-muted-foreground hover:text-foreground"
              title="Judge Q&A">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button onClick={reset} className="glass rounded-lg p-2 border border-border/40 text-muted-foreground hover:text-foreground" title="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-muted/40">
          <div className="h-full bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-6">
        {/* ====== STAGE ====== */}
        <div className="space-y-6">
          {showReveal ? (
            <FinalRevealPanel onReplay={reset} onActivate={handleActivate} />
          ) : (
            <ScenePanel scene={scene} />
          )}

          {/* Problem vs Solution split */}
          {!showReveal && scene.phase !== "reveal" && (
            <ProblemSolutionSplit phase={scene.phase} />
          )}

          {/* Scenario Showcase */}
          {!showReveal && (
            <div className="glass rounded-2xl border border-border/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Scenario Showcase</h3>
                  <p className="text-[11px] text-muted-foreground">Click any scenario to load it onto the stage</p>
                </div>
                {scenario && (
                  <button onClick={() => setScenario(null)} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {SCENARIOS.map((s) => {
                  const active = scenario === s.id;
                  return (
                    <button key={s.id} onClick={() => setScenario(s.id)}
                      className={`text-left p-3 rounded-xl border transition-all ${active ? "border-primary/60 bg-primary/5" : "border-border/40 hover:border-primary/40 hover:bg-muted/20"}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <s.icon className={`h-4 w-4 ${s.color}`} />
                        <span className="text-xs font-semibold">{s.label}</span>
                      </div>
                      {active && <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{s.summary}</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Master CTA */}
          <button onClick={handleActivate}
            className="w-full group relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-cyan-500/10 to-emerald-500/15 p-5 hover:border-primary/70 transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(56,189,248,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] font-bold tracking-[0.2em] text-primary mb-1">FINAL CTA</div>
                <div className="text-lg font-bold">ACTIVATE MEDFLOW NEXUS LIVE</div>
                <div className="text-xs text-muted-foreground mt-0.5">Maps glow · Alerts stabilise · Platform wakes up</div>
              </div>
              <Rocket className="h-6 w-6 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* ====== JUDGE CONTROL CENTER ====== */}
        <aside className="space-y-4">
          <div className="glass rounded-2xl border border-border/30 p-4">
            <div className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground mb-3">CONTROL CENTER</div>
            <div className="flex gap-2 mb-3">
              <button onClick={() => { setShowReveal(false); setPlaying(!playing); }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
                {playing ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Play Full Demo</>}
              </button>
              <button onClick={advance} disabled={showReveal}
                className="px-3 py-2 rounded-lg glass border border-border/40 hover:border-primary/40 disabled:opacity-30">
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {SHORTCUTS.map((s) => (
                <button key={s.label} onClick={() => { setSceneIdx(s.scene - 1); setShowReveal(false); setPlaying(false); }}
                  className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground inline-flex items-center justify-between group">
                  <span>{s.label}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              <button onClick={reset} className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground inline-flex items-center justify-between group">
                <span>Reset Demo</span>
                <RotateCcw className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Pitch Timer */}
          <div className="glass rounded-2xl border border-border/30 p-4">
            <div className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground mb-3">PITCH TIMER</div>
            <div className="space-y-1.5">
              {TIMER_MODES.map((m) => (
                <button key={m.label} onClick={() => { setTimerSeconds(m.seconds); setElapsed(0); }}
                  className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-md inline-flex items-center justify-between border transition-colors
                    ${timerSeconds === m.seconds ? "border-primary/40 bg-primary/5 text-foreground" : "border-transparent hover:bg-muted/30 text-muted-foreground hover:text-foreground"}`}>
                  <span>{m.label}</span>
                  <Clock className="h-3 w-3" />
                </button>
              ))}
              {timerSeconds !== null && (
                <button onClick={() => { setTimerSeconds(null); setElapsed(0); }}
                  className="w-full text-[11px] px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground">
                  Stop timer
                </button>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="glass rounded-2xl border border-border/30 p-4">
            <div className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground mb-3">JUMP TO MODULE</div>
            <div className="space-y-1.5 text-[11px]">
              {[
                { to: "/dashboard", label: "Regional Intelligence", icon: MapPin },
                { to: "/hospital", label: "My Hospital Mode", icon: Hospital },
                { to: "/hospital/twin", label: "Digital Twin Demo", icon: Sparkles },
                { to: "/hospital/resources", label: "Resource Optimizer", icon: Zap },
                { to: "/hospital/roi", label: "ROI Dashboard", icon: TrendingUp },
              ].map((l) => (
                <Link key={l.to} to={l.to as any}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground group">
                  <span className="inline-flex items-center gap-2"><l.icon className="h-3 w-3" />{l.label}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ====== PRESENTER OVERLAY ====== */}
      {presenterMode && !showReveal && (
        <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 glass rounded-2xl border border-primary/40 p-4 backdrop-blur-2xl bg-background/85 animate-slide-in-right">
          <div className="flex items-start justify-between mb-2">
            <div className="text-[10px] font-bold tracking-[0.2em] text-primary inline-flex items-center gap-1.5">
              <Target className="h-3 w-3" /> PRESENTER ASSIST
            </div>
            <button onClick={() => setPresenterMode(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-foreground leading-relaxed mb-2">{scene.talkingPoint}</p>
          <div className="text-[10px] text-muted-foreground border-t border-border/30 pt-2">
            Next scene in {Math.round(scene.duration / 1000)}s · Phase: <span className="text-foreground font-medium">{scene.phase}</span>
          </div>
        </div>
      )}

      {/* ====== FAQ DRAWER ====== */}
      {showFAQ && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setShowFAQ(false)}>
          <div className="max-w-2xl w-full max-h-[85vh] overflow-y-auto glass rounded-2xl border border-border/40 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold inline-flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Judge Q&A — Quick Answers</h3>
                <p className="text-xs text-muted-foreground mt-1">Anticipated questions with prepared responses.</p>
              </div>
              <button onClick={() => setShowFAQ(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <div key={f.q} className="border border-border/30 rounded-xl p-3.5 hover:border-primary/30 transition-colors">
                  <div className="text-sm font-semibold text-foreground mb-1.5">Q. {f.q}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= SCENE PANEL =============
function ScenePanel({ scene }: { scene: Scene }) {
  const Icon = scene.icon;
  const phaseColor = {
    problem: "from-rose-500/20 to-amber-500/10 border-rose-500/30 text-rose-300",
    solution: "from-cyan-500/20 to-primary/10 border-cyan-500/30 text-cyan-300",
    impact: "from-emerald-500/20 to-cyan-500/10 border-emerald-500/30 text-emerald-300",
    reveal: "from-violet-500/20 to-primary/10 border-violet-500/30 text-violet-300",
  }[scene.phase];

  return (
    <div key={scene.id} className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${phaseColor} p-8 md:p-10 animate-fade-in`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(56,189,248,0.12),transparent_60%)]" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-xl bg-background/40 border border-border/40 flex items-center justify-center backdrop-blur">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">Scene {scene.id} · {scene.phase}</div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{scene.title}</h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{scene.caption}</p>
        <p className="text-base text-foreground/90 leading-relaxed mb-6 max-w-3xl">{scene.detail}</p>

        {scene.metric && (
          <div className="inline-flex items-center gap-6 glass rounded-2xl border border-border/40 px-5 py-4 backdrop-blur">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-1 tracking-wider uppercase">Before</div>
              <div className="text-xl font-bold text-rose-300">{scene.metric.before}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-primary" />
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-1 tracking-wider uppercase">After</div>
              <div className="text-xl font-bold text-emerald-300">{scene.metric.after}</div>
            </div>
            <div className="border-l border-border/30 pl-5 text-left">
              <div className="text-[10px] text-muted-foreground tracking-wider uppercase">{scene.metric.label}</div>
              <div className="text-[10px] text-primary inline-flex items-center gap-1 mt-0.5">
                <TrendingUp className={`h-3 w-3 ${scene.metric.trend === "down" ? "rotate-180" : ""}`} /> live
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= PROBLEM VS SOLUTION SPLIT =============
function ProblemSolutionSplit({ phase }: { phase: Scene["phase"] }) {
  const showSolutionFocus = phase === "solution" || phase === "impact";
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className={`rounded-2xl border p-5 transition-all ${!showSolutionFocus ? "border-rose-500/40 bg-rose-500/5" : "border-border/30 opacity-50"}`}>
        <div className="text-[10px] font-bold tracking-[0.2em] text-rose-400 mb-3">BEFORE MEDFLOW NEXUS</div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {["Manual decisions under pressure", "Resources sit idle, unseen", "Reactive crisis response", "ER wait times grow", "Capital wasted on duplicate buys"].map(i => (
            <li key={i} className="flex gap-2"><span className="text-rose-400">×</span>{i}</li>
          ))}
        </ul>
      </div>
      <div className={`rounded-2xl border p-5 transition-all ${showSolutionFocus ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/30 opacity-50"}`}>
        <div className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 mb-3">AFTER MEDFLOW NEXUS</div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {["AI-led prescriptive planning", "Optimized asset utilization", "Faster patient throughput", "Proactive surge response", "Smart purchase avoidance"].map(i => (
            <li key={i} className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============= FINAL REVEAL =============
function FinalRevealPanel({ onReplay, onActivate }: { onReplay: () => void; onActivate: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-violet-500/10 to-emerald-500/15 p-8 md:p-10 animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.2),transparent_60%)]" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-primary">FINAL IMPACT REVEAL</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">MedFlow Nexus delivers measurable outcomes.</h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-2xl">Across every department, every shift, every district — the platform turns observation into action.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {FINAL_METRICS.map((m, i) => <RevealMetric key={m.label} {...m} delay={i * 120} />)}
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={onActivate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
            <Rocket className="h-4 w-4" /> Activate MedFlow Nexus Live
          </button>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-border/40 text-sm font-medium hover:border-primary/40">
            <MapPin className="h-4 w-4" /> Explore Regional Mode
          </Link>
          <Link to="/hospital" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-border/40 text-sm font-medium hover:border-primary/40">
            <Stethoscope className="h-4 w-4" /> Explore Hospital Mode
          </Link>
          <button onClick={onReplay} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-4 w-4" /> Replay Story
          </button>
        </div>
      </div>
    </div>
  );
}

function RevealMetric({ label, value, suffix, prefix, icon: Icon, color, delay }: {
  label: string; value: number; suffix?: string; prefix?: string; icon: typeof Clock; color: string; delay: number;
}) {
  const [run, setRun] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRun(true), delay); return () => clearTimeout(t); }, [delay]);
  const v = useCounter(value, run);
  return (
    <div className="glass rounded-2xl border border-border/30 p-4 hover:border-primary/40 transition-colors">
      <Icon className={`h-4 w-4 ${color} mb-2`} />
      <div className="text-2xl font-black tracking-tight">
        {prefix}{Math.round(v)}{suffix}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1 tracking-wide uppercase">{label}</div>
    </div>
  );
}
