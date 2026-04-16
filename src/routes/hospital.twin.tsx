import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Activity, Sparkles, Building2, Bed, Users, Wrench,
  HeartPulse, ArrowRight, Zap, IndianRupee, Gauge, AlertTriangle,
  Clock, TrendingDown, Database, Brain, Play,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  HOSPITAL_PROFILE, SCENARIOS, getDeptState, getFlagshipMetrics,
  getAIRecommendations, getOperationalRhythm, get90DayHistory,
  getBeforeAfterComparison, type ScenarioId, type WardStatus,
} from "@/lib/flagshipHospital";

export const Route = createFileRoute("/hospital/twin")({
  component: TwinPage,
});

function TwinPage() {
  const [scenario, setScenario] = useState<ScenarioId>("evening-surge");
  const [optimized, setOptimized] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [running, setRunning] = useState(false);

  // Live demo orchestration
  useEffect(() => {
    if (!running) return;
    if (demoStep >= 5) { setRunning(false); return; }
    const t = setTimeout(() => {
      setDemoStep(s => s + 1);
      if (demoStep === 3) setOptimized(true);
    }, 1100);
    return () => clearTimeout(t);
  }, [running, demoStep]);

  const data = useMemo(() => ({
    depts: getDeptState(scenario, optimized),
    metrics: getFlagshipMetrics(scenario, optimized),
    recs: getAIRecommendations(scenario),
    rhythm: getOperationalRhythm(scenario),
    history: get90DayHistory(),
    comparison: getBeforeAfterComparison(scenario),
  }), [scenario, optimized]);

  const handleRunDemo = () => {
    setOptimized(false); setDemoStep(0); setRunning(true);
  };

  const wardColor = (s: WardStatus) =>
    s === "overload" ? "border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]" :
    s === "rising" ? "border-amber-500/40 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]" :
    "border-emerald-500/30 bg-emerald-500/5";

  const wardDot = (s: WardStatus) =>
    s === "overload" ? "bg-red-400 animate-pulse" :
    s === "rising" ? "bg-amber-400" : "bg-emerald-400";

  const urgencyBadge = (u: string) =>
    u === "critical" ? "bg-red-500/15 text-red-400 border-red-500/30" :
    u === "high" ? "bg-orange-500/15 text-orange-400 border-orange-500/30" :
    "bg-amber-500/15 text-amber-400 border-amber-500/30";

  const demoSteps = [
    "Hospital state loaded",
    "AI detecting overload patterns…",
    "Generating optimization plan…",
    "Reallocating resources across wards…",
    "Recovery in progress — metrics improving…",
    "Optimization complete · gains locked in",
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">
              Digital Twin · R2
            </Badge>
            <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
              <Building2 className="h-2.5 w-2.5 mr-1" />
              {HOSPITAL_PROFILE.name}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
              {HOSPITAL_PROFILE.city} · {HOSPITAL_PROFILE.type}
            </Badge>
            {optimized && (
              <Badge className="text-[10px] uppercase bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                ✓ AI Optimized
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Operational Digital Twin · Live Hospital Simulation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Flagship case study — realistic baseline + scenario-driven signals + AI optimization in real time.
          </p>
        </div>
        <Button onClick={handleRunDemo} disabled={running}
          className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 shadow-elevated">
          <Play className="h-4 w-4" />
          {running ? "Running…" : "Run Live Hospital Optimization"}
        </Button>
      </div>

      {/* Demo orchestration banner */}
      {(running || demoStep > 0) && (
        <GlassCard className="p-4 border-primary/40 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">
              [{Math.min(demoStep, demoSteps.length - 1) + 1}/6] {demoSteps[Math.min(demoStep, demoSteps.length - 1)]}
            </span>
            <div className="flex-1 h-1 rounded-full bg-card/60 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-700"
                style={{ width: `${((demoStep + 1) / 6) * 100}%` }} />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Scenario selector */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Live Scenario Simulator</h3>
            <p className="text-[11px] text-muted-foreground">
              {SCENARIOS.find(s => s.id === scenario)?.context}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
            <Database className="h-2.5 w-2.5 mr-1" />
            Source: Operational Digital Twin
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {SCENARIOS.map(s => (
            <button key={s.id}
              onClick={() => { setScenario(s.id); setOptimized(false); setDemoStep(0); }}
              className={`text-left p-2.5 rounded-md border transition-all ${
                scenario === s.id
                  ? "border-primary/50 bg-primary/10 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                  : "border-border bg-card/30 hover:border-border/80 hover:bg-card/50"
              }`}
            >
              <p className={`text-[11px] font-semibold ${scenario === s.id ? "text-primary" : "text-foreground"}`}>
                {s.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KPICard title="Occupancy" value={`${data.metrics.occupancyPct}%`} icon={<Bed className="h-4 w-4" />} />
        <KPICard title="Avg Wait" value={`${data.metrics.avgWaitMin}m`} icon={<Clock className="h-4 w-4" />} trend={optimized ? "-45%" : undefined} trendUp />
        <KPICard title="ICU Load" value={`${data.metrics.icuLoadPct}%`} icon={<HeartPulse className="h-4 w-4" />} trend={optimized ? "-12%" : undefined} trendUp />
        <KPICard title="Idle Equipment" value={String(data.metrics.idleEquipment)} icon={<Wrench className="h-4 w-4" />} trend={optimized ? "-72%" : undefined} trendUp />
        <KPICard title="Delayed Transfers" value={String(data.metrics.delayedTransfers)} icon={<TrendingDown className="h-4 w-4" />} />
        <KPICard title="Staff Imbalance" value={`${data.metrics.staffImbalance}`} icon={<Users className="h-4 w-4" />} />
        <KPICard title="Cost Saved" value={`₹${data.metrics.costSavedLakhs.toFixed(1)}L`} icon={<IndianRupee className="h-4 w-4" />} trend={optimized ? "today" : undefined} trendUp />
        <KPICard title="Opt Score" value={`${data.metrics.optimizationScore}`} icon={<Gauge className="h-4 w-4" />} trend={optimized ? "+22 pts" : undefined} trendUp />
      </div>

      {/* Digital Twin — Ward grid */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Digital Twin — Live Ward Status
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Each block reflects real-time bed occupancy, staff pressure, and equipment usage
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-muted-foreground">Healthy</span></span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /><span className="text-muted-foreground">Rising</span></span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" /><span className="text-muted-foreground">Overload</span></span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {data.depts.map(d => {
            const occPct = Math.round((d.occupied / d.beds) * 100);
            return (
              <div key={d.name} className={`p-3 rounded-lg border transition-all ${wardColor(d.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-foreground">{d.name}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${wardDot(d.status)}`} />
                </div>
                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span>Beds</span><span>{d.occupied}/{d.beds}</span>
                    </div>
                    <Progress value={occPct} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span>Staff load</span><span>{d.staffPressure}%</span>
                    </div>
                    <Progress value={d.staffPressure} className="h-1" />
                  </div>
                  {d.ventTotal > 0 && (
                    <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                      <span>Vents</span>
                      <span className="text-foreground">{d.ventInUse}/{d.ventTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Nurses</span><span className="text-foreground">{d.nurses}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* AI recommendations + Before/After */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Optimization Recommendations
            </h3>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              {data.recs.length} actions
            </Badge>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {data.recs.map(r => (
              <div key={r.id} className="p-3 rounded-md border border-border/50 bg-card/30 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded border ${urgencyBadge(r.urgency)}`}>
                        {r.urgency}
                      </span>
                      <span className="text-[9px] uppercase text-muted-foreground tracking-wider">{r.category}</span>
                    </div>
                    <p className="text-[12px] font-medium text-foreground">{r.action}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{r.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-muted-foreground">conf</div>
                    <div className="text-sm font-semibold text-primary">{r.confidence}%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-[10px] text-emerald-400">→ {r.expectedGain}</span>
                  <button className="text-[10px] text-primary hover:underline">
                    {optimized ? "✓ Applied" : "Approve"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-primary/20">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Before vs After AI
          </h3>
          <div className="space-y-2.5">
            {data.comparison.map(c => (
              <div key={c.metric} className="py-2 border-b border-border/30 last:border-0">
                <p className="text-[11px] text-muted-foreground mb-1">{c.metric}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground/70 line-through">{c.before}{c.unit}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span className="text-base font-semibold text-emerald-400">{c.after}{c.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">24h Operational Rhythm</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.rhythm}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} interval={3} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="admissions" stroke="hsl(190 90% 60%)" fill="hsl(190 90% 60% / 0.2)" strokeWidth={2} />
              <Area type="monotone" dataKey="discharges" stroke="hsl(150 70% 50%)" fill="hsl(150 70% 50% / 0.15)" strokeWidth={2} />
              <Area type="monotone" dataKey="icuLoad" stroke="hsl(0 80% 60%)" fill="hsl(0 80% 60% / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Department Occupancy — Before vs Optimized</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.depts.map(d => ({
              name: d.name.length > 8 ? d.name.slice(0, 8) + "…" : d.name,
              before: Math.round((d.occupied / d.beds) * 100),
              optimized: Math.round((d.occupied / d.beds) * 100 * (optimized ? 1 : 0.85)),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} angle={-15} textAnchor="end" height={50} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="before" name="Current" fill="hsl(0 70% 55%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="optimized" name="Optimized Target" fill="hsl(190 90% 55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">90-Day Hospital Baseline — Realistic Operational History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={9} interval={9} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="occupancy" stroke="hsl(190 90% 60%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="admissions" stroke="hsl(150 70% 55%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="icuUsage" stroke="hsl(0 80% 60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Data transparency footer */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 text-[11px]">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Database className="h-3 w-3" /> Baseline: <span className="text-foreground">Seeded realistic hospital model</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="h-3 w-3" /> Live: <span className="text-foreground">Operational digital twin</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Brain className="h-3 w-3" /> AI: <span className="text-foreground">Optimization + forecasting engine</span>
            </span>
          </div>
          <span className="text-muted-foreground">Tenant-isolated · 90-day history · Updated live</span>
        </div>
      </GlassCard>
    </div>
  );
}
