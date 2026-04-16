import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Shield, Truck, HeartPulse, Zap, Activity, Radio, Siren } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getEmergencyMetrics,
  getEmergencyAlerts,
  getSurgeAllocations,
  getEmergencyRecommendations,
} from "@/services/crisisEngine";

export const Route = createFileRoute("/dashboard/emergency")({
  component: EmergencyPage,
});

function EmergencyPage() {
  const { selectedDistrict } = useDistrictFilter();
  const metrics = getEmergencyMetrics(selectedDistrict);
  const alerts = getEmergencyAlerts(selectedDistrict);
  const allocations = getSurgeAllocations(selectedDistrict);
  const recs = getEmergencyRecommendations(selectedDistrict);
  const [surgeActive, setSurgeActive] = useState(false);

  const levelColor = (level: string) =>
    level === "critical" ? "text-red-400 bg-red-500/20 border-red-500/30" :
    level === "emergency" ? "text-orange-400 bg-orange-500/20 border-orange-500/30" :
    level === "alert" ? "text-yellow-400 bg-yellow-500/20 border-yellow-500/30" :
    "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";

  const severityBadge = (s: string) =>
    s === "critical" ? "bg-red-500/20 text-red-400" :
    s === "high" ? "bg-orange-500/20 text-orange-400" :
    s === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400";

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with Alert Level */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-4 w-4 rounded-full ${metrics.riskLevel === "critical" || metrics.riskLevel === "emergency" ? "bg-red-500 animate-pulse" : metrics.riskLevel === "alert" ? "bg-yellow-500 animate-pulse" : "bg-emerald-500"}`} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Emergency Command Center</h1>
            <p className="text-sm text-muted-foreground">Surge protocol activation and real-time emergency dispatch</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg border font-bold text-sm uppercase ${levelColor(metrics.riskLevel)}`}>
            {metrics.riskLevel} MODE
          </div>
          <Button
            onClick={() => setSurgeActive(!surgeActive)}
            className={`gap-2 ${surgeActive ? "bg-red-600 hover:bg-red-700" : "bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90"}`}
          >
            <Siren className="h-4 w-4" />
            {surgeActive ? "Deactivate Surge" : "Run Surge Response Now"}
          </Button>
        </div>
      </div>

      {/* Surge Banner */}
      {surgeActive && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4 animate-scale-in">
          <Siren className="h-6 w-6 text-red-400 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">SURGE RESPONSE ACTIVE</p>
            <p className="text-xs text-red-300/70">Beds reserved • Teams activated • ICU redistributed • Ambulances redirected</p>
          </div>
          <div className="flex gap-4 text-center">
            <div><p className="text-lg font-bold text-emerald-400">+15</p><p className="text-[10px] text-muted-foreground">Beds Freed</p></div>
            <div><p className="text-lg font-bold text-emerald-400">6</p><p className="text-[10px] text-muted-foreground">Staff Deployed</p></div>
            <div><p className="text-lg font-bold text-emerald-400">-40%</p><p className="text-[10px] text-muted-foreground">Wait Reduced</p></div>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard title="Risk Level" value={metrics.riskLevel.toUpperCase()} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Incoming" value={String(surgeActive ? 0 : metrics.incomingCasualties)} icon={<Truck className="h-5 w-5" />} trend={surgeActive ? "Managed" : undefined} trendUp={surgeActive} />
        <KPICard title="Beds Reserved" value={String(surgeActive ? metrics.bedsReserved + 15 : metrics.bedsReserved)} icon={<Shield className="h-5 w-5" />} />
        <KPICard title="ICU Ready" value={`${surgeActive ? Math.min(100, metrics.icuReadiness + 18) : metrics.icuReadiness}%`} icon={<HeartPulse className="h-5 w-5" />} />
        <KPICard title="Trauma Team" value={surgeActive ? "DEPLOYED" : metrics.traumaTeamStatus.toUpperCase()} icon={<Activity className="h-5 w-5" />} />
        <KPICard title="Ambulance Load" value={`${surgeActive ? Math.max(20, metrics.ambulanceLoad - 30) : metrics.ambulanceLoad}%`} icon={<Truck className="h-5 w-5" />} />
        <KPICard title="Response ETA" value={`${surgeActive ? Math.max(8, metrics.responseETA - 12) : metrics.responseETA}m`} icon={<Radio className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Alert Feed */}
        <GlassCard className="border-red-500/10">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live Alert Feed
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${severityBadge(alert.severity)}`}>{alert.severity}</span>
                  <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                </div>
                <p className="text-sm text-foreground">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-primary">{alert.district}</span>
                  <span className="text-[10px] text-muted-foreground">• {alert.type}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Surge Resource Allocation */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Surge Resource Allocation</h3>
          <div className="space-y-3">
            {allocations.map(a => (
              <div key={a.resource} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{a.resource}</span>
                  <span className={`text-xs font-bold ${a.gap > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {a.gap > 0 ? `Gap: ${a.gap}` : "✓ Sufficient"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Progress value={a.needed > 0 ? Math.min(100, (a.current / a.needed) * 100) : 100} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{a.current}/{a.needed}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{a.action}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Response Recommendations */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> AI Emergency Response Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recs.map(rec => (
              <div key={rec.id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${severityBadge(rec.urgency)}`}>{rec.urgency}</span>
                  <span className="text-xs text-primary font-medium">{rec.confidence}%</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{rec.action}</p>
                <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
                <p className="text-xs text-primary/80">Impact: {rec.impact}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
