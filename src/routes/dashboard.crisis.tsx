import { createFileRoute } from "@tanstack/react-router";
import { Shield, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { Progress } from "@/components/ui/progress";
import { getCrisisMetrics, runScenarioSimulation } from "@/services/crisisEngine";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/dashboard/crisis")({
  component: CrisisPage,
});

function CrisisPage() {
  const { selectedDistrict } = useDistrictFilter();
  const metrics = getCrisisMetrics(selectedDistrict);

  // Compare scenarios
  const scenarios = [
    { name: "Highway Accident", id: "highway-accident" },
    { name: "Dengue Outbreak", id: "dengue-outbreak" },
    { name: "Festival Surge", id: "festival-overload" },
    { name: "ICU Crisis", id: "icu-crisis" },
    { name: "Flood Event", id: "chennai-flood" },
  ];

  const comparisonData = scenarios.map(s => {
    const res = runScenarioSimulation({ scenario: s.id, severity: 6, duration: 24, districtId: selectedDistrict, staffPercent: 80, bedPercent: 100, equipmentPercent: 85 });
    return { name: s.name, occupancy: res.occupancyPercent, icuLoad: res.icuLoad, waitTime: res.waitTime, staffPressure: res.staffPressure };
  });

  const readinessTrend = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    readiness: Math.round(metrics.surgeReadinessScore - 5 + i * 2 + Math.sin(i) * 3),
    recovery: Math.round(metrics.recoveryTimeEstimate - i * 2 + Math.cos(i) * 4),
  }));

  const weakLinks = [
    { area: "ICU Ventilator Buffer", score: 35, detail: "Only 2-day ventilator reserve" },
    { area: "Night Shift Coverage", score: 42, detail: "68% coverage, below 80% target" },
    { area: "Blood Bank Supply", score: 55, detail: "3-day buffer, target is 7 days" },
    { area: "Oxygen Pipeline Redundancy", score: 48, detail: "Single source, no backup manifold" },
    { area: "Emergency Generator", score: 72, detail: "8-hour fuel reserve, needs 24hr" },
  ].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Crisis Planning Dashboard</h1>
        <p className="text-sm text-muted-foreground">Surge preparedness analysis and investment planning</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard title="Readiness" value={`${metrics.surgeReadinessScore}%`} icon={<Shield className="h-5 w-5" />} />
        <KPICard title="Backup Beds" value={String(metrics.backupCapacity)} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Reserve Staff" value={String(metrics.reserveStaff)} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Equip Buffer" value={`${metrics.equipmentBufferDays}d`} icon={<Clock className="h-5 w-5" />} />
        <KPICard title="Risky Districts" value={String(metrics.riskyDistricts)} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Recovery Time" value={`${metrics.recoveryTimeEstimate}h`} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Comparison */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Scenario Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} width={100} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="occupancy" fill="hsl(190 90% 55%)" radius={[0, 3, 3, 0]} name="Occupancy %" />
              <Bar dataKey="icuLoad" fill="hsl(0 80% 60%)" radius={[0, 3, 3, 0]} name="ICU Load %" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Readiness Trend */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Preparedness Trend (7-Day)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={readinessTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="readiness" stroke="hsl(190 90% 55%)" strokeWidth={2} dot={false} name="Readiness %" />
              <Line type="monotone" dataKey="recovery" stroke="hsl(45 90% 55%)" strokeWidth={2} dot={false} name="Recovery hrs" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Weakest Links */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Weakest Links Analysis</h3>
          <div className="space-y-3">
            {weakLinks.map(w => (
              <div key={w.area} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{w.area}</span>
                  <span className={`text-sm font-bold ${w.score < 40 ? "text-red-400" : w.score < 60 ? "text-yellow-400" : "text-emerald-400"}`}>{w.score}%</span>
                </div>
                <Progress value={w.score} className="h-1.5 mb-1" />
                <p className="text-xs text-muted-foreground">{w.detail}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recommended Investments */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Recommended Investments</h3>
          <div className="space-y-3">
            {[
              { investment: "Add 20 ICU-capable ventilators", cost: "₹2.4 Cr", roi: "Reduces ventilator gap by 60%", priority: "critical" },
              { investment: "Hire 15 additional night-shift nurses", cost: "₹45 L/yr", roi: "Improves night coverage to 85%", priority: "high" },
              { investment: "Install backup oxygen manifold", cost: "₹18 L", roi: "Eliminates single-point oxygen failure", priority: "high" },
              { investment: "Extend generator fuel reserve to 24hr", cost: "₹8 L", roi: "Full-day power independence during outage", priority: "medium" },
              { investment: "Establish blood bank MOU with 3 partners", cost: "₹5 L/yr", roi: "Doubles blood availability buffer", priority: "medium" },
            ].map((inv, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    inv.priority === "critical" ? "bg-red-500/20 text-red-400" :
                    inv.priority === "high" ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>{inv.priority}</span>
                  <span className="text-xs text-primary font-medium">{inv.cost}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{inv.investment}</p>
                <p className="text-xs text-muted-foreground mt-1">{inv.roi}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
