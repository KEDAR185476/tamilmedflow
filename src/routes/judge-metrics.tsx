import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/layout/GlassCard";
import { Gauge, TrendingUp, Activity, CheckCircle2, XCircle, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { runBacktest, type BacktestResult } from "@/lib/forecastBacktest";
import { computeAcceptanceStats, getDecisions, subscribe, clearDecisions } from "@/lib/acceptanceStore";
import { getLatencySamples, latencyStats, subscribeLatency } from "@/lib/latencySamples";

export const Route = createFileRoute("/judge-metrics")({
  head: () => ({
    meta: [
      { title: "Judge Metrics Scorecard — MedFlow Nexus" },
      { name: "description", content: "Live pass/fail scorecard for all three judging criteria: forecast MAPE, recommendation acceptance rate, and dashboard update latency." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JudgeMetrics,
});

function JudgeMetrics() {
  // ----- MAPE (backtest) -----
  const bt24: BacktestResult = useMemo(() => runBacktest("holt-winters", 1), []);
  const bt7d: BacktestResult = useMemo(() => runBacktest("holt-winters", 7), []);
  const mapePasses = bt24.mape < 10 && bt7d.mape < 10;

  // ----- Acceptance -----
  const [acc, setAcc] = useState(() => computeAcceptanceStats());
  const [decisions, setDecisions] = useState(() => getDecisions());
  useEffect(() => subscribe(recs => { setDecisions(recs); setAcc(computeAcceptanceStats(recs)); }), []);
  const accPasses = acc.total >= 5 && acc.rate >= 70;

  // ----- Latency -----
  const [lat, setLat] = useState(() => latencyStats(getLatencySamples()));
  const [samples, setSamples] = useState<number[]>(() => getLatencySamples());
  useEffect(() => subscribeLatency(s => { setSamples([...s]); setLat(latencyStats(s)); }), []);
  const latPasses = lat.count > 0 && lat.passes;

  const criteria = [
    {
      key: "mape", icon: TrendingUp, target: "MAPE < 10%",
      label: "Admission Forecast Accuracy",
      pass: mapePasses,
      primary: `${bt24.mape.toFixed(2)}%`,
      sub: `24h · 7d MAPE = ${bt7d.mape.toFixed(2)}% · Holt-Winters on ${bt24.trainSize + bt24.testSize}d history`,
      link: { to: "/dashboard/ai-transparency", label: "View backtest panel" },
    },
    {
      key: "acc", icon: CheckCircle2, target: "Human-judged ≥ 70%",
      label: "Recommendation Acceptance",
      pass: accPasses,
      primary: acc.total === 0 ? "—" : `${acc.rate.toFixed(1)}%`,
      sub: acc.total === 0
        ? "No decisions logged yet — accept/reject cards to populate"
        : `${acc.accepted} accepted · ${acc.rejected} rejected · n=${acc.total}`,
      link: { to: "/dashboard/recommendations", label: "Log decisions" },
    },
    {
      key: "lat", icon: Activity, target: "p95 < 2000 ms",
      label: "Dashboard Update Latency",
      pass: latPasses,
      primary: lat.count === 0 ? "—" : `${lat.p95.toFixed(1)} ms`,
      sub: lat.count === 0
        ? "Waiting for samples — LatencyMonitor emits every 1.5s"
        : `p50 ${lat.p50.toFixed(1)} · avg ${lat.avg.toFixed(1)} · max ${lat.max.toFixed(1)} · n=${lat.count}`,
      link: { to: "/dashboard", label: "Live dashboard" },
    },
  ];

  const allPass = criteria.every(c => c.pass);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Live judging scorecard
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Gauge className="h-6 w-6 text-primary" /> Judge Metrics Scorecard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time measurement of all three success criteria — no mocked numbers.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            allPass ? "bg-success/10 border-success/40 text-success" : "bg-warning/10 border-warning/40 text-warning"
          }`}>
            {allPass ? <CheckCircle2 className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
            {allPass ? "All targets met" : "Targets pending"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {criteria.map(c => (
            <GlassCard key={c.key} className={`p-5 border ${c.pass ? "border-success/40" : "border-warning/30"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <c.icon className="h-4 w-4 text-primary" /> {c.label}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  c.pass ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                }`}>
                  {c.pass ? "PASS" : "PENDING"}
                </span>
              </div>
              <div className={`text-4xl font-bold tabular-nums mb-1 ${c.pass ? "text-success" : "text-foreground"}`}>
                {c.primary}
              </div>
              <div className="text-[10px] text-muted-foreground">Target: {c.target}</div>
              <div className="text-[11px] text-muted-foreground mt-2 border-t border-border/40 pt-2">{c.sub}</div>
              <Link
                to={c.link.to}
                className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                {c.link.label} <ArrowRight className="h-3 w-3" />
              </Link>
            </GlassCard>
          ))}
        </div>

        {/* Latency sparkline */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Live tick→paint latency ({samples.length} samples)
            </h3>
            <span className="text-[10px] text-muted-foreground">2000 ms ceiling</span>
          </div>
          <LatencySparkline samples={samples} />
        </GlassCard>

        {/* Acceptance log */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Recommendation decision log
            </h3>
            {decisions.length > 0 && (
              <button
                onClick={() => { clearDecisions(); }}
                className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset log
              </button>
            )}
          </div>
          {decisions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No decisions yet. Visit <Link to="/dashboard/recommendations" className="text-primary hover:underline">the Recommendation Center</Link> and accept/reject actions to populate this log.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border/40">
                    <th className="py-2 font-medium">Action</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">Urgency</th>
                    <th className="py-2 font-medium">Decision</th>
                    <th className="py-2 font-medium text-right">When</th>
                  </tr>
                </thead>
                <tbody>
                  {[...decisions].sort((a, b) => b.ts - a.ts).slice(0, 20).map(d => (
                    <tr key={d.id} className="border-b border-border/20">
                      <td className="py-2 text-foreground">{d.action}</td>
                      <td className="py-2 text-muted-foreground capitalize">{d.category}</td>
                      <td className="py-2 text-muted-foreground capitalize">{d.urgency}</td>
                      <td className="py-2">
                        {d.decision === "accepted" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-success/20 text-success inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Accepted
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-destructive/20 text-destructive inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right text-muted-foreground tabular-nums">
                        {relativeTime(d.ts)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        <div className="text-[10px] text-muted-foreground text-center">
          Measured live in the browser · Backtest = Holt-Winters on held-out window · Latency = double-rAF tick→paint · Acceptance = user decisions in this session
        </div>
      </div>
    </div>
  );
}

function LatencySparkline({ samples }: { samples: number[] }) {
  const W = 800, H = 100;
  if (samples.length === 0) {
    return <div className="text-xs text-muted-foreground text-center py-8">Waiting for samples…</div>;
  }
  const max = Math.max(50, ...samples);
  const step = W / Math.max(samples.length - 1, 1);
  const points = samples.map((v, i) => `${i * step},${H - (v / max) * (H - 10) - 4}`).join(" ");
  const ceilingY = H - (2000 / max) * (H - 10) - 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
      <line x1={0} x2={W} y1={ceilingY} y2={ceilingY} stroke="hsl(var(--destructive))" strokeDasharray="4 4" strokeOpacity="0.4" />
      <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" points={points} />
      {samples.map((v, i) => (
        <circle key={i} cx={i * step} cy={H - (v / max) * (H - 10) - 4} r={1.5} fill="hsl(var(--primary))" />
      ))}
    </svg>
  );
}

function relativeTime(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
