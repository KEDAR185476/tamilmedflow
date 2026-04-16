import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp, IndianRupee, Activity, Wrench, Users, Bed, Clock,
  Sparkles, Award, Target, FileBarChart, Download, ArrowRight,
  Zap, Briefcase, AlertTriangle,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  getROIMetrics, getSavingsBreakdown, getEfficiencyScores, getOverallScore,
  getScoreGrade, getPurchaseAvoidance, getThroughputGains, getSavingsTrend,
  getUtilizationCurve, getDeptEfficiency, getROIProjection,
  getCostAvoidanceBreakdown, getAIValueLines, getInvestorMetrics,
} from "@/lib/roiEngine";

export const Route = createFileRoute("/hospital/roi")({
  component: ROIPage,
});

function useCounter(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    let start: number | null = null;
    let raf: number;
    const step = (t: number) => {
      if (!start) start = t;
      const progress = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

const PIE_COLORS = ["hsl(190 90% 60%)", "hsl(150 70% 55%)", "hsl(45 90% 60%)", "hsl(280 70% 65%)", "hsl(15 85% 60%)", "hsl(220 70% 65%)"];

function ROIPage() {
  const [activated, setActivated] = useState(false);
  const [view, setView] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  const data = useMemo(() => ({
    metrics: getROIMetrics(activated),
    savings: getSavingsBreakdown(),
    scores: getEfficiencyScores(activated),
    avoided: getPurchaseAvoidance(),
    throughput: getThroughputGains(),
    savingsTrend: getSavingsTrend(),
    utilCurve: getUtilizationCurve(),
    deptEff: getDeptEfficiency(),
    projection: getROIProjection(),
    avoidanceBreakdown: getCostAvoidanceBreakdown(),
    aiValue: getAIValueLines(),
    investor: getInvestorMetrics(),
  }), [activated]);

  const overall = getOverallScore(data.scores);
  const grade = getScoreGrade(overall);

  const monthlyTotal = data.savings.reduce((s, x) => s + x.monthly, 0);
  const totalAvoided = data.avoided.reduce((s, x) => s + x.totalAvoided, 0);

  const viewMul = view === "monthly" ? 1 : view === "quarterly" ? 3 : 12;

  // Animated counters
  const cMonthly = useCounter(data.metrics.monthlySavingsLakhs, activated);
  const cIdle = useCounter(data.metrics.idleReductionPct, activated);
  const cBed = useCounter(data.metrics.bedUtilGainPct, activated);
  const cWait = useCounter(data.metrics.waitTimeReductionPct, activated);
  const cStaff = useCounter(data.metrics.staffEfficiencyGainPct, activated);
  const cAvoid = useCounter(data.metrics.equipmentAvoidedLakhs, activated);
  const cReady = useCounter(data.metrics.emergencyReadinessGainPct, activated);
  const cROI = useCounter(data.metrics.annualROIPct, activated);

  const gradeColor =
    grade.color === "emerald" ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" :
    grade.color === "cyan" ? "text-cyan-400 border-cyan-500/40 bg-cyan-500/10" :
    grade.color === "amber" ? "text-amber-400 border-amber-500/40 bg-amber-500/10" :
    "text-red-400 border-red-500/40 bg-red-500/10";

  const exportReport = (kind: "pdf" | "csv") => {
    const lines = [
      `MedFlow Nexus — Executive Impact Report`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      ``,
      `Overall Efficiency Score: ${overall} (${grade.label})`,
      `Monthly Savings: ₹${data.metrics.monthlySavingsLakhs.toFixed(1)} L`,
      `Annual ROI Projection: ${data.metrics.annualROIPct}%`,
      `Equipment Purchase Avoided: ₹${data.metrics.equipmentAvoidedLakhs} L`,
      ``,
      `Savings Breakdown`,
      ...data.savings.map(s => `  ${s.category}: ₹${s.monthly} L/month`),
    ].join("\n");
    const blob = new Blob([lines], { type: kind === "csv" ? "text/csv" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medflow-impact-${Date.now()}.${kind === "csv" ? "csv" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-amber-500/40 text-amber-400">
              <Award className="h-2.5 w-2.5 mr-1" /> Executive · R3
            </Badge>
            <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
              Boardroom Analytics
            </Badge>
            {activated && (
              <Badge className="text-[10px] uppercase bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                ✓ Impact Activated
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Executive ROI & Business Impact</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Measurable value — savings, efficiency gains, purchase avoidance, throughput growth.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => exportReport("csv")} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3 w-3" /> CSV
          </Button>
          <Button onClick={() => exportReport("pdf")} variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileBarChart className="h-3 w-3" /> Boardroom
          </Button>
          <Button onClick={() => setActivated(!activated)}
            className="gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-500 hover:opacity-90 shadow-elevated text-black font-semibold">
            <Sparkles className="h-4 w-4" />
            {activated ? "Reset" : "Show Business Impact Now"}
          </Button>
        </div>
      </div>

      {/* Hero Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KPICard title="Monthly Savings" value={`₹${cMonthly.toFixed(1)}L`} icon={<IndianRupee className="h-4 w-4" />} trend={activated ? "live" : undefined} trendUp />
        <KPICard title="Idle Reduction" value={`${Math.round(cIdle)}%`} icon={<Wrench className="h-4 w-4" />} trend={activated ? "+62%" : undefined} trendUp />
        <KPICard title="Bed Util Gain" value={`${Math.round(cBed)}%`} icon={<Bed className="h-4 w-4" />} trend={activated ? "+22%" : undefined} trendUp />
        <KPICard title="Wait Time Cut" value={`${Math.round(cWait)}%`} icon={<Clock className="h-4 w-4" />} trend={activated ? "-45%" : undefined} trendUp />
        <KPICard title="Staff Efficiency" value={`${Math.round(cStaff)}%`} icon={<Users className="h-4 w-4" />} trend={activated ? "+18%" : undefined} trendUp />
        <KPICard title="Purchase Avoided" value={`₹${Math.round(cAvoid)}L`} icon={<Briefcase className="h-4 w-4" />} trend={activated ? "annual" : undefined} trendUp />
        <KPICard title="Emergency Ready" value={`${Math.round(cReady)}%`} icon={<AlertTriangle className="h-4 w-4" />} trend={activated ? "+35%" : undefined} trendUp />
        <KPICard title="Annual ROI" value={`${Math.round(cROI)}%`} icon={<TrendingUp className="h-4 w-4" />} trend={activated ? "Year 1" : undefined} trendUp />
      </div>

      {/* Efficiency Scorecard + AI Value */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-5 border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" /> Resource Efficiency Scorecard
            </h3>
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${gradeColor}`}>
              {grade.label}
            </span>
          </div>
          <div className="text-center py-4 border-y border-border/40 mb-4">
            <div className="text-5xl font-bold tracking-tight bg-gradient-to-br from-amber-300 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
              {overall}
            </div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">Composite Score / 100</div>
          </div>
          <div className="space-y-2.5">
            {data.scores.map(s => (
              <div key={s.factor}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">{s.factor}</span>
                  <span className="text-foreground font-medium">{Math.round(s.score)}</span>
                </div>
                <Progress value={s.score} className="h-1" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> How AI Created Value This Month
            </h3>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
              ₹{data.aiValue.reduce((s, x) => s + x.valueLakhs, 0).toFixed(1)}L attributed
            </Badge>
          </div>
          <div className="space-y-2 max-h-[340px] overflow-y-auto">
            {data.aiValue.map(v => (
              <div key={v.id} className="flex items-center justify-between gap-3 p-2.5 rounded border border-border/40 bg-card/30 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[9px] uppercase text-muted-foreground/70 tracking-wider w-16 shrink-0">{v.category}</span>
                  <p className="text-[12px] text-foreground truncate">{v.text}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-400 shrink-0">₹{v.valueLakhs}L</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Cost Saving Calculator + Purchase Avoidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Cost Saving Calculator</h3>
              <p className="text-[11px] text-muted-foreground">Modeled estimates · Indian private hospital benchmarks</p>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-card/40 p-1">
              {(["monthly", "quarterly", "yearly"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
                    view === v ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 font-medium text-muted-foreground">Saving Category</th>
                  <th className="text-left font-medium text-muted-foreground">Driver</th>
                  <th className="text-right font-medium text-muted-foreground">{view === "monthly" ? "Monthly" : view === "quarterly" ? "Quarterly" : "Annual"} ₹</th>
                </tr>
              </thead>
              <tbody>
                {data.savings.map(s => (
                  <tr key={s.category} className="border-b border-border/30 hover:bg-white/[0.02]">
                    <td className="py-2 font-medium text-foreground">{s.category}</td>
                    <td className="text-muted-foreground">{s.description}</td>
                    <td className="text-right font-semibold text-emerald-400">₹{(s.monthly * viewMul).toFixed(1)}L</td>
                  </tr>
                ))}
                <tr className="bg-emerald-500/5">
                  <td className="py-3 font-bold text-foreground">Total</td>
                  <td></td>
                  <td className="text-right text-base font-bold text-emerald-400">₹{(monthlyTotal * viewMul).toFixed(1)}L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-emerald-400" /> Purchase Avoidance
            </h3>
          </div>
          <div className="text-center py-3 border-y border-border/40 mb-3">
            <div className="text-3xl font-bold text-emerald-400">₹{totalAvoided.toFixed(1)}L</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Capital Spend Deferred</div>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {data.avoided.map(a => (
              <div key={a.asset} className="p-2 rounded border border-border/40 bg-card/30">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-medium text-foreground">{a.asset}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">₹{a.totalAvoided}L</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{a.count} units · {a.reason}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground italic mt-3 pt-3 border-t border-border/30">
            "Existing assets optimized before capital spending."
          </p>
        </GlassCard>
      </div>

      {/* Throughput Gains + Department Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Throughput Gain Analyzer
          </h3>
          <div className="space-y-2.5">
            {data.throughput.map(t => (
              <div key={t.metric} className="flex items-center justify-between gap-3 py-2 border-b border-border/30 last:border-0">
                <span className="text-xs text-muted-foreground flex-1 min-w-0">{t.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/70 line-through">{t.before}{t.unit}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{t.after}{t.unit}</span>
                  <span className="text-[10px] font-bold text-emerald-400 w-12 text-right">{t.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Department Efficiency Comparison</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.deptEff} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} />
              <YAxis type="category" dataKey="dept" stroke="rgba(255,255,255,0.3)" fontSize={10} width={80} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="baseline" name="Baseline" fill="hsl(0 60% 50%)" radius={[0, 3, 3, 0]} />
              <Bar dataKey="optimized" name="Optimized" fill="hsl(150 70% 50%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Savings Trend — 12 Month Ramp</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.savingsTrend}>
              <defs>
                <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(150 70% 55%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(150 70% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => `₹${v}L`} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="savings" name="Monthly ₹L" stroke="hsl(150 70% 55%)" fill="url(#savGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="avoided" name="Avoided ₹L" stroke="hsl(45 90% 60%)" fill="hsl(45 90% 60% / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Utilization Improvement Curve</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.utilCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline %" stroke="hsl(220 30% 60%)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="optimized" name="With MedFlow %" stroke="hsl(190 90% 60%)" strokeWidth={2.5} dot={{ fill: "hsl(190 90% 60%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Cost Avoidance Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.avoidanceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={2}>
                {data.avoidanceBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => `₹${v}L`} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">24-Month ROI Projection (Cumulative ₹L)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.projection}>
              <defs>
                <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45 90% 60%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(45 90% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={9} interval={2} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => `₹${v}L`} />
              <Area type="monotone" dataKey="cumulative" name="Net ₹L" stroke="hsl(45 90% 60%)" fill="url(#roiGrad)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="breakeven" stroke="hsl(0 70% 60%)" strokeDasharray="3 3" strokeWidth={1} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Investor Mode */}
      <GlassCard className="p-5 border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-cyan-500/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-amber-400" /> Investor Mode · Market & Scaling
            </h3>
            <p className="text-[11px] text-muted-foreground">SaaS subscription model · Multi-hospital horizontal scale</p>
          </div>
          <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">Series A Ready</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.investor.map(m => (
            <div key={m.label} className="p-3 rounded-md border border-border/50 bg-card/40">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">{m.label}</p>
              <p className="text-xl font-bold tracking-tight bg-gradient-to-br from-amber-300 to-cyan-400 bg-clip-text text-transparent">{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{m.sub}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Leadership Reports */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-primary" /> Leadership Summary Reports
          </h3>
          <span className="text-[10px] text-muted-foreground">Auto-generated · Updated hourly</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { title: "Weekly Operations Impact", desc: "Throughput, savings, reallocation events" },
            { title: "Monthly Savings Summary", desc: "Category-wise cost recovery breakdown" },
            { title: "Resource Waste Reduction", desc: "Idle assets, overtime trends, utilization" },
            { title: "Emergency Preparedness", desc: "Reserve readiness & response time gains" },
            { title: "Department Performance", desc: "Comparative efficiency scorecards" },
          ].map(r => (
            <button key={r.title} onClick={() => exportReport("pdf")}
              className="text-left p-3 rounded-md border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 transition-all">
              <p className="text-[12px] font-semibold text-foreground mb-1">{r.title}</p>
              <p className="text-[10px] text-muted-foreground mb-2 leading-snug">{r.desc}</p>
              <span className="text-[10px] text-primary inline-flex items-center gap-1">
                <Download className="h-2.5 w-2.5" /> Export
              </span>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
