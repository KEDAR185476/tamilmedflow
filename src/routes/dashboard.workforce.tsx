import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, HeartPulse, Shield, Clock, AlertTriangle, Zap, Activity } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getWorkforceMetrics,
  getDepartmentLoads,
  getShiftTimeline,
  getWorkforceRecommendations,
  getBurnoutByDepartment,
} from "@/services/workforceEngine";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
} from "recharts";

export const Route = createFileRoute("/dashboard/workforce")({
  component: WorkforcePage,
});

function WorkforcePage() {
  const { selectedDistrict } = useDistrictFilter();
  const metrics = getWorkforceMetrics(selectedDistrict);
  const deptLoads = getDepartmentLoads(selectedDistrict);
  const shifts = getShiftTimeline(selectedDistrict);
  const recs = getWorkforceRecommendations(selectedDistrict);
  const burnoutData = getBurnoutByDepartment(selectedDistrict);
  const [optimized, setOptimized] = useState(false);

  const burnoutColor = (risk: string) =>
    risk === "critical" ? "text-red-400" : risk === "high" ? "text-orange-400" : risk === "medium" ? "text-yellow-400" : "text-emerald-400";

  const burnoutBg = (risk: string) =>
    risk === "critical" ? "bg-red-500/20" : risk === "high" ? "bg-orange-500/20" : risk === "medium" ? "bg-yellow-500/20" : "bg-emerald-500/20";

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workforce Intelligence Center</h1>
          <p className="text-sm text-muted-foreground">Staff scheduling, fatigue monitoring, and skill-match allocation</p>
        </div>
        <Button
          onClick={() => setOptimized(!optimized)}
          className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90"
        >
          <Zap className="h-4 w-4" />
          {optimized ? "Reset" : "Optimize Staffing"}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Doctors" value={String(optimized ? metrics.totalDoctors + 12 : metrics.totalDoctors)} icon={<Users className="h-5 w-5" />} trend={optimized ? "+12 deployed" : undefined} trendUp={optimized} />
        <KPICard title="Nurses" value={String(optimized ? metrics.totalNurses + 18 : metrics.totalNurses)} icon={<Users className="h-5 w-5" />} trend={optimized ? "+18 redeployed" : undefined} trendUp={optimized} />
        <KPICard title="Specialists" value={String(metrics.specialistsOnDuty)} icon={<Shield className="h-5 w-5" />} />
        <KPICard title="Burnout Risk" value={`${optimized ? Math.max(30, metrics.burnoutRiskScore - 22) : metrics.burnoutRiskScore}%`} icon={<HeartPulse className="h-5 w-5" />} trend={optimized ? "-22% reduced" : undefined} trendUp={optimized} />
        <KPICard title="Shift Balance" value={`${optimized ? Math.min(95, metrics.shiftBalanceIndex + 12) : metrics.shiftBalanceIndex}%`} icon={<Clock className="h-5 w-5" />} trend={optimized ? "+12% improved" : undefined} trendUp={optimized} />
        <KPICard title="Reserve Ready" value={String(metrics.emergencyReserveReady)} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Load by Department */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Staff Load by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptLoads} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis type="category" dataKey="department" stroke="rgba(255,255,255,0.3)" fontSize={11} width={90} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="load" fill="url(#loadGradient)" radius={[0, 4, 4, 0]} />
              <defs>
                <linearGradient id="loadGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(190 90% 60%)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Burnout Heatmap */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Burnout Risk by Department</h3>
          <div className="grid grid-cols-2 gap-3">
            {deptLoads.map(dept => (
              <div key={dept.department} className={`rounded-lg p-3 ${burnoutBg(dept.burnoutRisk)} border border-white/5`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">{dept.department}</span>
                  <span className={`text-xs font-bold ${burnoutColor(dept.burnoutRisk)}`}>{dept.load}%</span>
                </div>
                <Progress value={optimized ? Math.max(20, dept.load - 15) : dept.load} className="h-1.5" />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{dept.doctors}D / {dept.nurses}N</span>
                  <span className={`text-[10px] font-medium uppercase ${burnoutColor(dept.burnoutRisk)}`}>{dept.burnoutRisk}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Shift Timeline */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Shift Coverage Timeline</h3>
          <div className="space-y-3">
            {shifts.map(shift => (
              <div key={shift.shift} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">{shift.shift}</span>
                    <span className="text-xs text-muted-foreground ml-2">{shift.hours}</span>
                  </div>
                  <span className={`text-sm font-bold ${shift.coverage >= 85 ? "text-emerald-400" : shift.coverage >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                    {shift.coverage}%
                  </span>
                </div>
                <Progress value={shift.coverage} className="h-1.5 mb-2" />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{shift.doctors} doctors</span>
                  <span>{shift.nurses} nurses</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Burnout Trend */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">7-Day Burnout Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={burnoutData[0]?.trend.map((_, i) => {
              const point: Record<string, number | string> = { day: `Day ${i + 1}` };
              burnoutData.slice(0, 4).forEach(d => { point[d.department] = d.trend[i]; });
              return point;
            }) ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              {burnoutData.slice(0, 4).map((d, i) => (
                <Line key={d.department} type="monotone" dataKey={d.department} stroke={["hsl(0 80% 60%)", "hsl(30 80% 55%)", "hsl(50 80% 50%)", "hsl(190 80% 50%)"][i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* AI Recommendations */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> AI Workforce Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recs.map(rec => (
            <div key={rec.id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  rec.urgency === "critical" ? "bg-red-500/20 text-red-400" :
                  rec.urgency === "high" ? "bg-orange-500/20 text-orange-400" :
                  rec.urgency === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400"
                }`}>{rec.urgency}</span>
                <span className="text-xs text-primary font-medium">{rec.confidence}% confidence</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{rec.action}</p>
              <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
              <p className="text-xs text-primary/80">Impact: {rec.impact}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
