import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Wrench, Activity, AlertTriangle, Zap, TrendingUp, Shield,
  ArrowRight, Sparkles, Boxes, Target, IndianRupee, Gauge,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  getOverviewMetrics, getDepartmentDemand, getIdleAssets,
  getReallocationMoves, getReserveLevels, getUtilizationTrend,
  getIdleByDepartment, getSavingsTrend, getOptimizationScoreTrend,
  getLiveAlerts, applyOptimization,
} from "@/lib/hospitalResourceEngine";

export const Route = createFileRoute("/hospital/resources")({
  component: ResourcesPage,
});

type Mode = "recommend" | "approval" | "auto";

function ResourcesPage() {
  const [tick, setTick] = useState(0);
  const [optimized, setOptimized] = useState(false);
  const [mode, setMode] = useState<Mode>("recommend");

  const data = useMemo(() => ({
    metrics: getOverviewMetrics(),
    demand: getDepartmentDemand(),
    idle: getIdleAssets(),
    moves: getReallocationMoves(),
    reserves: getReserveLevels(),
    util: getUtilizationTrend(),
    idleByDept: getIdleByDepartment(),
    savings: getSavingsTrend(),
    scoreTrend: getOptimizationScoreTrend(),
    alerts: getLiveAlerts(),
  }), [tick]);

  const handleMaximize = () => {
    applyOptimization();
    setOptimized(true);
    setTick(t => t + 1);
  };

  const priColor = (p: string) =>
    p === "critical" ? "bg-red-500/15 text-red-400 border-red-500/30" :
    p === "high" ? "bg-orange-500/15 text-orange-400 border-orange-500/30" :
    p === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

  const heatColor = (s: number) => {
    if (s >= 60) return "bg-red-500/25 text-red-300 border-red-500/40";
    if (s >= 30) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    if (s >= 10) return "bg-amber-500/15 text-amber-300 border-amber-500/25";
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
  };

  const reserveColor = (s: string) =>
    s === "red" ? "text-red-400 bg-red-500/10 border-red-500/30" :
    s === "yellow" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
    "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">
              Resource Optimization · R1
            </Badge>
            {optimized && (
              <Badge className="text-[10px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Optimized · Live
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resource Optimization Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use minimum available resources at maximum efficiency — reallocate idle assets to where they save lives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-border bg-card/40 p-1">
            {(["recommend", "approval", "auto"] as Mode[]).map(m => (
              <button key={m}
                onClick={() => setMode(m)}
                className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
                  mode === m ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "recommend" ? "Recommend" : m === "approval" ? "Approval" : "Auto"}
              </button>
            ))}
          </div>
          <Button onClick={handleMaximize} className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 shadow-elevated">
            <Sparkles className="h-4 w-4" />
            Maximize Available Resources Now
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard title="Total Assets" value={String(data.metrics.total)} icon={<Boxes className="h-4 w-4" />} />
        <KPICard title="Active Utilization" value={`${data.metrics.utilization}%`} icon={<Activity className="h-4 w-4" />} trend={optimized ? "+14% vs baseline" : undefined} trendUp />
        <KPICard title="Idle Assets" value={String(data.metrics.idle)} icon={<Wrench className="h-4 w-4" />} trend={optimized ? "-62% reduced" : undefined} trendUp />
        <KPICard title="Move Opportunities" value={String(data.metrics.opportunities)} icon={<ArrowRight className="h-4 w-4" />} />
        <KPICard title="Reserve Readiness" value={`${data.metrics.reserveReadiness}%`} icon={<Shield className="h-4 w-4" />} />
        <KPICard title="Cost Saved" value={`₹${(data.metrics.costSaved / 100000).toFixed(1)}L`} icon={<IndianRupee className="h-4 w-4" />} trend={optimized ? "+₹2.4L this week" : undefined} trendUp />
        <KPICard title="Optimization Score" value={`${data.metrics.optimizationScore}`} icon={<Gauge className="h-4 w-4" />} trend={optimized ? "+22 pts" : undefined} trendUp />
      </div>

      {/* Row 1: Demand vs Supply Heatmap (wide) + Reserves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Department Demand vs Supply Matrix</h3>
              <p className="text-[11px] text-muted-foreground">Heatmap — red = critical shortage, green = balanced</p>
            </div>
            <Target className="h-4 w-4 text-primary/60" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 font-medium text-muted-foreground">Department</th>
                  <th className="text-center font-medium text-muted-foreground">Beds</th>
                  <th className="text-center font-medium text-muted-foreground">Ventilators</th>
                  <th className="text-center font-medium text-muted-foreground">Monitors</th>
                  <th className="text-center font-medium text-muted-foreground">Oxygen</th>
                  <th className="text-center font-medium text-muted-foreground">Shortage</th>
                </tr>
              </thead>
              <tbody>
                {data.demand.map(d => (
                  <tr key={d.department} className="border-b border-border/30 hover:bg-white/[0.02]">
                    <td className="py-2.5 font-medium text-foreground">{d.department}</td>
                    <td className="text-center text-muted-foreground">{d.beds.occupied}/{d.beds.total}</td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] ${heatColor(Math.max(0, d.ventilators.needed - d.ventilators.available) * 12)}`}>
                        {d.ventilators.available}/{d.ventilators.needed}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] ${heatColor(Math.max(0, d.monitors.needed - d.monitors.available) * 6)}`}>
                        {d.monitors.available}/{d.monitors.needed}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] ${heatColor(Math.max(0, d.oxygen.needed - d.oxygen.available) * 5)}`}>
                        {d.oxygen.available}/{d.oxygen.needed}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold ${heatColor(d.shortageScore)}`}>
                        {d.shortageScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Emergency Reserve Manager</h3>
              <p className="text-[11px] text-muted-foreground">Safety stock — never reallocate below threshold</p>
            </div>
            <Shield className="h-4 w-4 text-emerald-400/70" />
          </div>
          <div className="space-y-2">
            {data.reserves.map(r => (
              <div key={`${r.department}-${r.type}`} className={`p-2.5 rounded border ${reserveColor(r.status)}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      r.status === "red" ? "bg-red-400 animate-pulse" :
                      r.status === "yellow" ? "bg-amber-400" : "bg-emerald-400"
                    }`} />
                    <span className="text-[11px] font-medium text-foreground">{r.type}</span>
                    <span className="text-[10px] text-muted-foreground">· {r.department}</span>
                  </div>
                  <span className="text-[11px] font-semibold">{r.current}/{r.threshold}</span>
                </div>
                <Progress value={Math.min(100, (r.current / r.threshold) * 100)} className="h-1" />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Equipment Exchange Board (wide) + Live Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Dynamic Equipment Exchange Board</h3>
              <p className="text-[11px] text-muted-foreground">Live reallocation opportunities ranked by priority</p>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              {data.moves.length} pending
            </Badge>
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card/95 backdrop-blur">
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 font-medium text-muted-foreground">Asset</th>
                  <th className="text-left font-medium text-muted-foreground">From</th>
                  <th className="text-center font-medium text-muted-foreground">Idle</th>
                  <th className="text-left font-medium text-muted-foreground">→ To</th>
                  <th className="text-center font-medium text-muted-foreground">Priority</th>
                  <th className="text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.moves.map(m => (
                  <tr key={m.id} className="border-b border-border/30 hover:bg-white/[0.02]">
                    <td className="py-2">
                      <div className="font-medium text-foreground">{m.assetId}</div>
                      <div className="text-[10px] text-muted-foreground">{m.type}</div>
                    </td>
                    <td className="text-muted-foreground">{m.from}</td>
                    <td className="text-center text-amber-400">{m.idleHours}h</td>
                    <td>
                      <div className="flex items-center gap-1 text-foreground">
                        <ArrowRight className="h-3 w-3 text-primary" />
                        <span className="font-medium">{m.to}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] uppercase font-semibold ${priColor(m.priority)}`}>
                        {m.priority}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="text-[10px] text-primary hover:text-primary/80 font-medium">
                        {mode === "auto" ? "Auto-moved" : mode === "approval" ? "Approve" : "Move Now"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Live Optimization Feed
            </h3>
            <AlertTriangle className="h-4 w-4 text-amber-400/70" />
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {data.alerts.map(a => (
              <div key={a.id} className={`p-2.5 rounded border text-[11px] ${
                a.type === "critical" ? "bg-red-500/5 border-red-500/20 text-red-300" :
                a.type === "warn" ? "bg-amber-500/5 border-amber-500/20 text-amber-300" :
                a.type === "success" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" :
                "bg-card/40 border-border/40 text-muted-foreground"
              }`}>
                <p className="leading-snug">{a.text}</p>
                <p className="text-[9px] text-muted-foreground mt-1">{a.time}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Equipment Utilization — 24h</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.util}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} interval={3} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="utilization" name="Baseline" stroke="hsl(220 30% 50%)" fill="hsl(220 30% 50% / 0.15)" strokeWidth={2} />
              <Area type="monotone" dataKey="optimized" name="Optimized" stroke="hsl(190 90% 60%)" fill="hsl(190 90% 60% / 0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Idle vs In-Use by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.idleByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="department" stroke="rgba(255,255,255,0.3)" fontSize={9} angle={-15} textAnchor="end" height={50} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="inUse" name="In Use" fill="hsl(190 90% 55%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="idle" name="Idle" fill="hsl(35 90% 55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Reallocation Savings — 7 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.savings}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => `₹${v}K`} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="saved" name="Saved (₹K)" fill="hsl(150 70% 50%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="avoided" name="Purchase Avoided (₹K)" fill="hsl(190 70% 55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Optimization Score — 14 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="hsl(190 90% 60%)" strokeWidth={2.5} dot={{ fill: "hsl(190 90% 60%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Idle Assets Feed + Impact panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Idle Assets Feed — Top 12</h3>
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
              {data.idle.length} idle total
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.idle.slice(0, 12).map(a => (
              <div key={a.id} className="p-2.5 rounded border border-border/40 bg-card/30 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono font-semibold text-foreground">{a.id}</span>
                  <span className="text-[9px] text-amber-400">{a.idleHours}h</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{a.type}</p>
                <p className="text-[10px] text-primary/70">{a.department}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-primary/20">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Utilization Impact
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { label: "Utilization", before: "62%", after: "84%", up: true },
              { label: "Idle Assets", before: "47", after: "18", up: true },
              { label: "ICU Shortages", before: "8", after: "1", up: true },
              { label: "Avg Wait Time", before: "32m", after: "19m", up: true },
              { label: "Equipment Purchases Avoided", before: "—", after: "₹12.4L", up: true },
              { label: "Emergency Readiness", before: "71%", after: "96%", up: true },
            ].map(i => (
              <div key={i.label} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <span className="text-muted-foreground">{i.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/60 line-through text-[10px]">{i.before}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span className="text-emerald-400 font-semibold">{i.after}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
