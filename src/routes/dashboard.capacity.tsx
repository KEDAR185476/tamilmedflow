import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { GlassCard } from "@/components/layout/GlassCard";
import { getKPISummary, getHospitalCapacity } from "@/services/dataService";
import { forecastAdmissions } from "@/services/forecastEngine";
import {
  getWardLoads, generateAlerts, getAdmissionQueue, runAutoOptimize,
  type OptimizationResult, type LiveAlert,
} from "@/services/capacityOperations";
import { generateRecommendations } from "@/services/recommendationEngine";
import { OccupancyByDistrictChart } from "@/components/dashboard/OccupancyChart";
import { BedAvailabilityChart } from "@/components/dashboard/BedAvailabilityChart";
import {
  BedDouble, HeartPulse, AlertTriangle, TrendingUp, Users, Clock,
  Activity, Zap, ChevronRight, Shield, CheckCircle,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/dashboard/capacity")({
  component: CapacityCommandCenter,
});

function CapacityCommandCenter() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const dId = selectedDistrict === "all" ? undefined : selectedDistrict;
  const kpi = getKPISummary(dId);
  const cap = getHospitalCapacity(dId);
  const wards = getWardLoads(dId);
  const alerts = generateAlerts(dId);
  const queue = getAdmissionQueue(dId);
  const recs = generateRecommendations(selectedDistrict);
  const admForecast = forecastAdmissions(selectedDistrict, "24h");

  const [optimizeResult, setOptimizeResult] = useState<OptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const handleAutoOptimize = useCallback(() => {
    setOptimizing(true);
    setOptimizeResult(null);
    // Simulate processing time
    setTimeout(() => {
      const result = runAutoOptimize(dId ? selectedDistrict : undefined);
      setOptimizeResult(result);
      setOptimizing(false);
    }, 1500);
  }, [selectedDistrict, dId]);

  // Reset optimize result on district change
  useEffect(() => { setOptimizeResult(null); }, [selectedDistrict]);

  const availableBeds = cap.totalBeds - cap.occupiedBeds;
  const avgWait = Math.round(12 + kpi.occupancyRate * 0.3); // minutes, derived from occupancy

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Capacity Command Center
          </h1>
          <p className="text-sm text-muted-foreground">{districtName} — Mission Control</p>
        </div>
        <div className="flex items-center gap-3">
          <DistrictSelector />
          <button
            onClick={handleAutoOptimize}
            disabled={optimizing}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 glow-sm"
          >
            <Zap className="h-4 w-4" />
            {optimizing ? "Optimizing..." : "AUTO OPTIMIZE"}
          </button>
        </div>
      </div>

      {/* Optimization Result Banner */}
      {optimizeResult && (
        <div className="neon-border rounded-lg p-4 animate-slide-down">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <h3 className="text-sm font-bold text-success">Optimization Complete</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            <OptStat label="Beds Freed" value={optimizeResult.bedsFreed} />
            <OptStat label="Patients Assigned" value={optimizeResult.patientsAssigned} />
            <OptStat label="Transfers" value={optimizeResult.transfersInitiated} />
            <OptStat label="Wait Reduction" value={`${optimizeResult.waitTimeReduction}m`} />
            <OptStat label="Alerts Resolved" value={optimizeResult.alertsResolved} />
          </div>
          <div className="space-y-1">
            {optimizeResult.actions.map((a, i) => (
              <div key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3 text-success" /> {a}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Row — 8 animated cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <AnimatedKPI icon={<BedDouble className="h-4 w-4" />} label="Total Beds" value={cap.totalBeds} />
        <AnimatedKPI icon={<BedDouble className="h-4 w-4" />} label="Occupied" value={cap.occupiedBeds} alert={kpi.occupancyRate > 85} />
        <AnimatedKPI icon={<BedDouble className="h-4 w-4" />} label="Available" value={availableBeds} good />
        <AnimatedKPI icon={<TrendingUp className="h-4 w-4" />} label="Occupancy" value={`${kpi.occupancyRate}%`} alert={kpi.occupancyRate > 85} />
        <AnimatedKPI icon={<HeartPulse className="h-4 w-4" />} label="ICU Free" value={cap.icuTotal - cap.icuOccupied} alert={kpi.icuRate > 85} />
        <AnimatedKPI icon={<AlertTriangle className="h-4 w-4" />} label="Overload" value={`${kpi.highRiskDistricts} dist`} alert={kpi.highRiskDistricts > 2} />
        <AnimatedKPI icon={<Clock className="h-4 w-4" />} label="Avg Wait" value={`${avgWait}m`} />
        <AnimatedKPI icon={<Users className="h-4 w-4" />} label="In Queue" value={queue.length} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Charts (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ward Load Heatmap */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Ward Load Heatmap</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {wards.map(w => (
                <div key={w.ward} className={`glass rounded-lg p-3 border ${w.rate > 90 ? "border-destructive/40" : w.rate > 80 ? "border-warning/30" : "border-primary/10"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-medium">{w.ward}</span>
                    <span className={`text-[9px] ${w.trend === "rising" ? "text-destructive" : w.trend === "falling" ? "text-success" : "text-muted-foreground"}`}>
                      {w.trend === "rising" ? "↑" : w.trend === "falling" ? "↓" : "→"}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-foreground">{w.rate}%</div>
                  <div className="text-[9px] text-muted-foreground">{w.occupied}/{w.totalBeds} beds</div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${w.rate > 90 ? "bg-destructive" : w.rate > 80 ? "bg-warning" : "bg-primary"}`} style={{ width: `${w.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OccupancyByDistrictChart />
            <GlassCard className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">24h Admission Forecast</h3>
              <p className="text-[10px] text-muted-foreground mb-3">Predicted: {admForecast.totalPredicted} | Confidence: {admForecast.confidence}%</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={admForecast.points}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} interval={5} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(56,189,248,0.08)" />
                    <Area type="monotone" dataKey="predicted" stroke="#38bdf8" fill="rgba(56,189,248,0.15)" strokeWidth={2} />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(56,189,248,0.03)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          <BedAvailabilityChart />
        </div>

        {/* Right: Alerts + Recommendations */}
        <div className="space-y-4">
          {/* Live Alerts */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Live Alerts
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.slice(0, 8).map(a => (
                <AlertItem key={a.id} alert={a} />
              ))}
            </div>
          </GlassCard>

          {/* AI Recommendations */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              AI Actions ({recs.length})
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {recs.slice(0, 6).map(r => (
                <div key={r.id} className={`glass rounded-lg p-2.5 border-l-2 ${r.urgency === "critical" ? "border-l-destructive" : r.urgency === "high" ? "border-l-warning" : "border-l-primary"}`}>
                  <p className="text-xs font-medium text-foreground">{r.action}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.reason.slice(0, 80)}...</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] px-1 py-0.5 rounded ${r.urgency === "critical" ? "bg-destructive/20 text-destructive" : r.urgency === "high" ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"}`}>
                      {r.urgency}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{r.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Admission Queue Preview */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Admission Queue ({queue.length})
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {queue.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between glass rounded px-2 py-1.5">
                  <div>
                    <span className="text-xs font-medium text-foreground">{p.id}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{p.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.icuNeed && <span className="text-[8px] px-1 py-0.5 rounded bg-destructive/20 text-destructive">ICU</span>}
                    <span className={`text-[8px] px-1 py-0.5 rounded ${p.severity === "critical" ? "bg-destructive/20 text-destructive" : p.severity === "severe" ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"}`}>
                      {p.severity}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{p.etaMinutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function AnimatedKPI({ icon, label, value, alert, good }: { icon: React.ReactNode; label: string; value: string | number; alert?: boolean; good?: boolean }) {
  const color = alert ? "text-destructive" : good ? "text-success" : "text-primary";
  return (
    <GlassCard className={`p-2.5 text-center ${alert ? "border border-destructive/30" : ""}`}>
      <div className={`flex justify-center mb-0.5 ${color}`}>{icon}</div>
      <div className={`text-lg font-bold ${color} tabular-nums`}>{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </GlassCard>
  );
}

function OptStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded p-2 text-center">
      <div className="text-lg font-bold text-success">{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </div>
  );
}

function AlertItem({ alert }: { alert: LiveAlert }) {
  const icon = alert.severity === "critical" ? "🔴" : alert.severity === "warning" ? "🟡" : "🟢";
  return (
    <div className={`glass rounded-lg p-2 border-l-2 ${alert.severity === "critical" ? "border-l-destructive" : alert.severity === "warning" ? "border-l-warning" : "border-l-success"}`}>
      <div className="flex items-start gap-1.5">
        <span className="text-xs">{icon}</span>
        <div>
          <p className="text-[11px] text-foreground leading-tight">{alert.message}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {new Date(alert.timestamp).toLocaleTimeString()} • {alert.category}
          </p>
        </div>
      </div>
    </div>
  );
}
