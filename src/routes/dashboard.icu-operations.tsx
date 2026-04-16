import { createFileRoute } from "@tanstack/react-router";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalCapacity } from "@/services/dataService";
import { forecastICUDemand } from "@/services/forecastEngine";
import { getAdmissionQueue } from "@/services/capacityOperations";
import { generateRecommendations } from "@/services/recommendationEngine";
import { HeartPulse, Activity, AlertTriangle, TrendingUp, Wind, Shield, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/dashboard/icu-operations")({
  component: ICUOperationsPage,
});

function ICUOperationsPage() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const dId = selectedDistrict === "all" ? undefined : selectedDistrict;
  const cap = getHospitalCapacity(dId);
  const icu = forecastICUDemand(selectedDistrict);
  const queue = getAdmissionQueue(dId);
  const recs = generateRecommendations(selectedDistrict).filter(r => r.category === "capacity" || r.action.toLowerCase().includes("icu"));

  const icuQueue = queue.filter(p => p.icuNeed);
  const ventRate = cap.ventilators > 0 ? Math.round((cap.ventilatorsInUse / cap.ventilators) * 100) : 0;

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-primary" />
            ICU Operations
          </h1>
          <p className="text-sm text-muted-foreground">{districtName} — Critical Care Management</p>
        </div>
        <DistrictSelector />
      </div>

      {/* ICU KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <ICUMetric label="ICU Total" value={cap.icuTotal} icon={<HeartPulse className="h-4 w-4" />} />
        <ICUMetric label="Occupied" value={cap.icuOccupied} icon={<Activity className="h-4 w-4" />} alert={icu.riskLevel === "critical" || icu.riskLevel === "high"} />
        <ICUMetric label="Available" value={cap.icuTotal - cap.icuOccupied} icon={<HeartPulse className="h-4 w-4" />} good />
        <ICUMetric label="Ventilators" value={`${cap.ventilatorsInUse}/${cap.ventilators}`} icon={<Wind className="h-4 w-4" />} alert={ventRate > 85} />
        <ICUMetric label="Pending ICU" value={icuQueue.length} icon={<Clock className="h-4 w-4" />} alert={icuQueue.length > 3} />
        <ICUMetric label="Peak Forecast" value={`${icu.predictedPeak}%`} icon={<TrendingUp className="h-4 w-4" />} alert={icu.predictedPeak > 85} />
      </div>

      {/* Risk banner */}
      {(icu.riskLevel === "critical" || icu.riskLevel === "high") && (
        <div className={`rounded-lg p-3 flex items-center gap-3 ${icu.riskLevel === "critical" ? "bg-destructive/10 border border-destructive/30" : "bg-warning/10 border border-warning/30"}`}>
          <AlertTriangle className={`h-5 w-5 ${icu.riskLevel === "critical" ? "text-destructive" : "text-warning"}`} />
          <div>
            <p className={`text-sm font-semibold ${icu.riskLevel === "critical" ? "text-destructive" : "text-warning"}`}>
              ICU {icu.riskLevel.toUpperCase()} — {icu.currentOccupancy}% occupied, peak {icu.predictedPeak}% at {icu.peakHour}
            </p>
            <p className="text-xs text-muted-foreground">
              {icu.riskLevel === "critical" ? "Activate surge protocol. Convert HDU beds. Call reserve team." : "Monitor closely. Prepare surge capacity."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ICU Trend Chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">ICU Occupancy Forecast — 24h</h3>
            <p className="text-[10px] text-muted-foreground mb-3">
              Model: XGBoost | Current: {icu.currentOccupancy}% | Peak: {icu.predictedPeak}% at {icu.peakHour}
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={icu.points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} interval={3} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} domain={[0, cap.icuTotal]} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(251,146,60,0.08)" />
                  <Area type="monotone" dataKey="predicted" stroke="#fb923c" fill="rgba(251,146,60,0.15)" strokeWidth={2} />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(251,146,60,0.03)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Feature importance */}
            <div className="mt-3">
              <p className="text-[10px] text-muted-foreground mb-1">Demand Drivers:</p>
              <div className="flex flex-wrap gap-1.5">
                {icu.drivers.map(d => (
                  <span key={d.name} className="text-[9px] glass rounded px-2 py-0.5 text-muted-foreground">{d.name}: {d.contribution}%</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Ventilator Tracker */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Wind className="h-4 w-4 text-primary" /> Ventilator Status
            </h3>
            <div className="space-y-3">
              <OccupancyRing label="In Use" used={cap.ventilatorsInUse} total={cap.ventilators} />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="glass rounded p-2">
                  <div className="text-lg font-bold text-foreground">{cap.ventilators - cap.ventilatorsInUse}</div>
                  <div className="text-[9px] text-muted-foreground">Available</div>
                </div>
                <div className="glass rounded p-2">
                  <div className="text-lg font-bold text-foreground">{ventRate}%</div>
                  <div className="text-[9px] text-muted-foreground">Utilization</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Severity Queue */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">ICU Priority Queue ({icuQueue.length})</h3>
            <div className="space-y-1.5">
              {icuQueue.length > 0 ? icuQueue.map(p => (
                <div key={p.id} className="flex items-center justify-between glass rounded px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{p.id}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-destructive/20 text-destructive">CRITICAL</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{p.department} • ETA {p.etaMinutes}m</span>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">No ICU patients in queue</p>
              )}
            </div>
          </GlassCard>

          {/* ICU Recommendations */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> ICU Actions
            </h3>
            <div className="space-y-2">
              {recs.length > 0 ? recs.slice(0, 4).map(r => (
                <div key={r.id} className="glass rounded p-2 border-l-2 border-l-warning">
                  <p className="text-[11px] font-medium text-foreground">{r.action}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{r.confidence}% confidence</p>
                </div>
              )) : (
                <p className="text-xs text-success">All ICU metrics within safe thresholds ✓</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function ICUMetric({ label, value, icon, alert, good }: { label: string; value: string | number; icon: React.ReactNode; alert?: boolean; good?: boolean }) {
  const color = alert ? "text-destructive" : good ? "text-success" : "text-primary";
  return (
    <GlassCard className={`p-3 text-center ${alert ? "border border-destructive/30" : ""}`}>
      <div className={`flex justify-center mb-0.5 ${color}`}>{icon}</div>
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </GlassCard>
  );
}

function OccupancyRing({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct > 85 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#38bdf8";

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" className="transform -rotate-90">
        <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx="45" cy="45" r="36" fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="text-center -mt-14">
        <div className="text-lg font-bold text-foreground">{pct}%</div>
        <div className="text-[9px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
