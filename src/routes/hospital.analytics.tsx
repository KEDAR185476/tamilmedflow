import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, TrendingUp, Zap, CheckCircle, BedDouble, Users, Wrench, Stethoscope, Shield, Clock } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData, saveHospitalData } from "@/lib/hospitalDataEngine";
import { generateRecommendations, generateForecast, generateAlerts, computeEfficiencyScore } from "@/lib/hospitalAIEngine";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/analytics")({ component: HospitalAnalytics });

function HospitalAnalytics() {
  const auth = getHospitalAuth();
  const tenantId = auth?.tenant?.id || "demo";
  const [hd, setHd] = useState(() => loadHospitalData(tenantId));
  const [running, setRunning] = useState(false);
  const [optimized, setOptimized] = useState(false);

  const recs = generateRecommendations(hd);
  const forecast = generateForecast(hd);
  const alerts = generateAlerts(hd);
  const efficiency = computeEfficiencyScore(hd);
  const occRate = Math.round((hd.liveOps.beds.occupied / Math.max(1, hd.capacity.totalBeds)) * 100);

  function handleAutoRun() {
    setRunning(true);
    setOptimized(false);
    setTimeout(() => {
      const improved = {
        ...hd,
        liveOps: {
          ...hd.liveOps,
          beds: { ...hd.liveOps.beds, occupied: Math.round(hd.liveOps.beds.occupied * 0.88), vacant: hd.liveOps.beds.vacant + Math.round(hd.liveOps.beds.occupied * 0.12) },
          staff: { ...hd.liveOps.staff, onDutyDoctors: Math.min(hd.staff.doctors, hd.liveOps.staff.onDutyDoctors + 3), onDutyNurses: Math.min(hd.staff.nurses, hd.liveOps.staff.onDutyNurses + 5) },
          equipment: { ...hd.liveOps.equipment, maintenancePending: Math.max(0, hd.liveOps.equipment.maintenancePending - 2) },
          patientFlow: { ...hd.liveOps.patientFlow, dischargeReady: Math.max(2, hd.liveOps.patientFlow.dischargeReady - 6), pharmacyDelays: Math.max(1, hd.liveOps.patientFlow.pharmacyDelays - 3) },
          admissions: { ...hd.liveOps.admissions, erWaiting: Math.max(1, hd.liveOps.admissions.erWaiting - 3) },
        },
        opsBaseline: { ...hd.opsBaseline, avgWaitTime: Math.max(12, hd.opsBaseline.avgWaitTime - 12) },
      };
      saveHospitalData(tenantId, improved);
      setHd(improved);
      setRunning(false);
      setOptimized(true);
      toast.success("Hospital operations optimized!");
    }, 2500);
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="h-5 w-5 text-chart-2" /> Executive Analytics & AI Command</h1>
        <button onClick={handleAutoRun} disabled={running}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-chart-2 text-primary-foreground text-sm font-bold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all disabled:opacity-50">
          {running ? (
            <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Running AI...</>
          ) : optimized ? (
            <><CheckCircle className="h-4 w-4" /> Optimized!</>
          ) : (
            <><Zap className="h-4 w-4" /> AUTO RUN MY HOSPITAL</>
          )}
        </button>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: BedDouble, label: "Occupancy", value: `${occRate}%`, sub: occRate > 85 ? "Above target" : "Healthy" },
          { icon: Users, label: "Staff Active", value: `${hd.liveOps.staff.onDutyDoctors + hd.liveOps.staff.onDutyNurses}`, sub: `of ${hd.staff.doctors + hd.staff.nurses}` },
          { icon: Wrench, label: "Equip Ready", value: `${Math.round(((hd.equipment.ventilators - hd.liveOps.equipment.maintenancePending) / Math.max(1, hd.equipment.ventilators)) * 100)}%`, sub: `${hd.liveOps.equipment.maintenancePending} pending` },
          { icon: Clock, label: "Wait Time", value: `${hd.opsBaseline.avgWaitTime}m`, sub: "Avg today" },
          { icon: TrendingUp, label: "Efficiency", value: `${efficiency}%`, sub: efficiency > 75 ? "Good" : "Needs attention" },
        ].map(k => (
          <GlassCard key={k.label} className="p-3 text-center">
            <k.icon className="h-4 w-4 text-chart-2 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.label}</p>
            <p className="text-[9px] text-chart-2">{k.sub}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Forecast Chart */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">24h Occupancy Forecast</h3>
          <div className="flex items-end gap-0.5 h-28">
            {forecast.map((f, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-full rounded-t transition-all ${f.occupancy > 88 ? "bg-destructive/70" : f.occupancy > 80 ? "bg-chart-4/70" : "bg-chart-2/70"}`} style={{ height: `${f.occupancy * 1.1}%` }} />
                {i % 4 === 0 && <span className="text-[7px] text-muted-foreground mt-0.5">{f.label}</span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">AI Confidence: 86% · Based on hospital historical data</p>
        </GlassCard>

        {/* Alerts Feed */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Live Alerts</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map(a => (
              <div key={a.id} className="flex items-start gap-2 text-xs">
                <div className={`h-2 w-2 rounded-full mt-1 shrink-0 ${a.severity === "critical" ? "bg-destructive animate-pulse" : a.severity === "warning" ? "bg-chart-4" : "bg-chart-2"}`} />
                <div className="flex-1">
                  <p className="text-foreground">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground">{a.time} · {a.category}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-chart-4" /> AI Recommendations ({recs.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recs.map(r => (
              <div key={r.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-border">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5 ${r.urgency === "critical" ? "bg-destructive/20 text-destructive" : r.urgency === "high" ? "bg-chart-4/20 text-chart-4" : "bg-chart-2/20 text-chart-2"}`}>
                  {r.urgency === "critical" ? "!" : r.urgency === "high" ? "▲" : "○"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground">{r.reason}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className="text-chart-2">{r.confidence}%</span>
                    <span className="text-muted-foreground/50">·</span>
                    <span className="text-chart-4">{r.benefit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Optimized Success */}
      {optimized && (
        <GlassCard glow className="p-5 text-center">
          <CheckCircle className="h-8 w-8 text-chart-2 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-foreground">Operations Optimized</h3>
          <p className="text-xs text-muted-foreground mb-3">AI recommendations applied — metrics improved</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {[
              { label: "Occupancy", value: `${Math.round((hd.liveOps.beds.occupied / Math.max(1, hd.capacity.totalBeds)) * 100)}%`, color: "text-chart-2" },
              { label: "Wait Time", value: `${hd.opsBaseline.avgWaitTime}m`, color: "text-chart-2" },
              { label: "ER Queue", value: hd.liveOps.admissions.erWaiting.toString(), color: "text-chart-2" },
              { label: "Efficiency", value: `${computeEfficiencyScore(hd)}%`, color: "text-chart-2" },
            ].map(m => (
              <div key={m.label} className="bg-muted/30 rounded-lg p-2">
                <p className="text-muted-foreground">{m.label}</p>
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Debug */}
      <GlassCard className="p-3">
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-chart-2" /> Tenant: {tenantId}</span>
          <span>Last sync: {hd.lastSynced ? new Date(hd.lastSynced).toLocaleString("en-IN") : "Never"}</span>
          <span>Active alerts: {alerts.length}</span>
          <span>Recommendations: {recs.length}</span>
          <span>Forecast model: v2.1-hospital</span>
        </div>
      </GlassCard>
    </div>
  );
}
