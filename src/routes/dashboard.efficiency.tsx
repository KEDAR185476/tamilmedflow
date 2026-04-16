import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, TrendingUp, Clock, AlertTriangle, Zap, BarChart3 } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { Button } from "@/components/ui/button";
import { getEfficiencyMetrics } from "@/services/patientFlowEngine";
import { getWorkforceMetrics } from "@/services/workforceEngine";
import { getEquipmentMetrics } from "@/services/equipmentEngine";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard/efficiency")({
  component: EfficiencyPage,
});

function EfficiencyPage() {
  const { selectedDistrict } = useDistrictFilter();
  const eff = getEfficiencyMetrics(selectedDistrict);
  const wf = getWorkforceMetrics(selectedDistrict);
  const eq = getEquipmentMetrics(selectedDistrict);
  const [optimized, setOptimized] = useState(false);

  const ringStyle = (value: number, color: string) => ({
    background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
  });

  const trendData = eff.burnoutRiskTrend.map((v, i) => ({
    day: `Day ${i + 1}`,
    burnout: optimized ? Math.max(30, v - 18) : v,
    efficiency: optimized ? Math.min(95, 100 - v + 25) : 100 - v,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operational Efficiency Overview</h1>
          <p className="text-sm text-muted-foreground">Executive summary of hidden waste, delays, and optimization opportunities</p>
        </div>
        <Button onClick={() => setOptimized(!optimized)} className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90">
          <Zap className="h-4 w-4" />
          {optimized ? "Reset" : "Optimize Operations Now"}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Staff Efficiency" value={`${optimized ? Math.min(92, eff.staffEfficiencyScore + 18) : eff.staffEfficiencyScore}%`} icon={<Gauge className="h-5 w-5" />} trend={optimized ? "+18% improved" : undefined} trendUp={optimized} />
        <KPICard title="Equipment Util." value={`${optimized ? Math.min(88, eff.equipmentUtilization + 15) : eff.equipmentUtilization}%`} icon={<BarChart3 className="h-5 w-5" />} trend={optimized ? "+15% improved" : undefined} trendUp={optimized} />
        <KPICard title="Transfer Delay" value={`${optimized ? Math.max(20, eff.transferDelayPercent - 30) : eff.transferDelayPercent}%`} icon={<Clock className="h-5 w-5" />} trend={optimized ? "-30% reduced" : undefined} trendUp={optimized} />
        <KPICard title="Discharge Delay" value={`${optimized ? Math.max(5, eff.dischargeDelayPercent - 25) : eff.dischargeDelayPercent}%`} icon={<Clock className="h-5 w-5" />} trend={optimized ? "-25% reduced" : undefined} trendUp={optimized} />
        <KPICard title="Burnout Risk" value={`${optimized ? Math.max(30, wf.burnoutRiskScore - 22) : wf.burnoutRiskScore}%`} icon={<AlertTriangle className="h-5 w-5" />} trend={optimized ? "-22% reduced" : undefined} trendUp={optimized} />
        <KPICard title="Waste Index" value={String(optimized ? Math.round(eff.hiddenWasteIndex * 0.4) : eff.hiddenWasteIndex)} icon={<TrendingUp className="h-5 w-5" />} trend={optimized ? "-60% reduced" : undefined} trendUp={optimized} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Rings */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-6">Efficiency Scorecard</h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Staff", value: optimized ? 92 : eff.staffEfficiencyScore, color: "hsl(190 90% 55%)" },
              { label: "Equipment", value: optimized ? 88 : eff.equipmentUtilization, color: "hsl(140 70% 50%)" },
              { label: "Flow", value: optimized ? 90 : 100 - eff.transferDelayPercent, color: "hsl(45 90% 55%)" },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="relative h-24 w-24 rounded-full flex items-center justify-center" style={ringStyle(item.value, item.color)}>
                  <div className="h-18 w-18 rounded-full bg-background flex items-center justify-center" style={{ height: '72px', width: '72px' }}>
                    <span className="text-xl font-bold text-foreground">{item.value}%</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-2">{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Trend Chart */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">7-Day Efficiency vs Burnout Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="efficiency" stroke="hsl(190 90% 55%)" strokeWidth={2} dot={false} name="Efficiency %" />
              <Line type="monotone" dataKey="burnout" stroke="hsl(0 80% 60%)" strokeWidth={2} dot={false} name="Burnout Risk %" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Hidden Waste Breakdown */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Hidden Waste Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Discharge Delays", detail: "Beds blocked by billing/pharmacy", value: `${eff.dischargeDelayPercent}%`, severity: eff.dischargeDelayPercent > 30 ? "critical" : "medium" },
              { label: "Transfer Bottlenecks", detail: "Internal transport queue overhead", value: `${eff.transferDelayPercent}%`, severity: eff.transferDelayPercent > 60 ? "critical" : "medium" },
              { label: "Equipment Idle", detail: "Devices available but unassigned", value: `${100 - eff.equipmentUtilization}%`, severity: 100 - eff.equipmentUtilization > 35 ? "high" : "low" },
              { label: "Staff Mismatch", detail: "Skill vs demand misalignment", value: `${100 - eff.staffEfficiencyScore}%`, severity: 100 - eff.staffEfficiencyScore > 30 ? "high" : "low" },
            ].map(item => (
              <div key={item.label} className={`rounded-lg p-4 border ${
                item.severity === "critical" ? "bg-red-500/10 border-red-500/20" :
                item.severity === "high" ? "bg-orange-500/10 border-orange-500/20" :
                item.severity === "medium" ? "bg-yellow-500/10 border-yellow-500/20" : "bg-white/5 border-white/5"
              }`}>
                <span className="text-2xl font-bold text-foreground">{optimized ? "↓" : ""}{item.value}</span>
                <p className="text-sm font-medium text-foreground mt-1">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
