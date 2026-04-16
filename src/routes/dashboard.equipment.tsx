import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench, Wind, Droplets, Monitor, AlertTriangle, Zap, Activity } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  getEquipmentMetrics,
  getEquipmentStatusGrid,
  getMaintenanceAlerts,
  getEquipmentRecommendations,
  getEquipmentUsageTrend,
} from "@/services/equipmentEngine";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/dashboard/equipment")({
  component: EquipmentPage,
});

function EquipmentPage() {
  const { selectedDistrict } = useDistrictFilter();
  const metrics = getEquipmentMetrics(selectedDistrict);
  const grid = getEquipmentStatusGrid(selectedDistrict);
  const alerts = getMaintenanceAlerts(selectedDistrict);
  const recs = getEquipmentRecommendations(selectedDistrict);
  const usageTrend = getEquipmentUsageTrend();
  const [optimized, setOptimized] = useState(false);

  const statusColor = (status: string) =>
    status === "critical" ? "text-red-400 border-red-500/30" :
    status === "warning" ? "text-yellow-400 border-yellow-500/30" : "text-emerald-400 border-emerald-500/30";

  const priorityBadge = (p: string) =>
    p === "critical" ? "bg-red-500/20 text-red-400" :
    p === "high" ? "bg-orange-500/20 text-orange-400" :
    p === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400";

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipment Intelligence Hub</h1>
          <p className="text-sm text-muted-foreground">Device tracking, utilization analytics, and maintenance scheduling</p>
        </div>
        <Button onClick={() => setOptimized(!optimized)} className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90">
          <Zap className="h-4 w-4" />
          {optimized ? "Reset" : "Redistribute Equipment"}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Ventilators Free" value={String(optimized ? metrics.ventilatorsAvailable + 8 : metrics.ventilatorsAvailable)} icon={<Wind className="h-5 w-5" />} trend={optimized ? "+8 freed" : undefined} trendUp={optimized} />
        <KPICard title="O₂ Units Active" value={String(metrics.oxygenUnitsActive)} icon={<Droplets className="h-5 w-5" />} />
        <KPICard title="Monitors In Use" value={String(metrics.monitorsInUse)} icon={<Monitor className="h-5 w-5" />} />
        <KPICard title="Wheelchairs Free" value={String(metrics.wheelchairsFree)} icon={<Wrench className="h-5 w-5" />} />
        <KPICard title="Maintenance Due" value={String(optimized ? Math.round(metrics.maintenancePending * 0.6) : metrics.maintenancePending)} icon={<AlertTriangle className="h-5 w-5" />} trend={optimized ? "-40% cleared" : undefined} trendUp={optimized} />
        <KPICard title="Readiness" value={`${optimized ? Math.min(98, metrics.readinessScore + 12) : metrics.readinessScore}%`} icon={<Activity className="h-5 w-5" />} trend={optimized ? "+12% improved" : undefined} trendUp={optimized} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Status Grid */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Equipment Status Grid</h3>
          <div className="grid grid-cols-2 gap-3">
            {grid.map(item => (
              <div key={item.type} className={`rounded-lg p-3 bg-white/5 border ${statusColor(item.status)} border-opacity-30`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">{item.type}</span>
                  <span className={`text-xs font-bold ${statusColor(item.status).split(" ")[0]}`}>{item.utilization}%</span>
                </div>
                <Progress value={optimized ? Math.max(30, item.utilization - 10) : item.utilization} className="h-1.5 mb-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{item.inUse}/{item.total} in use</span>
                  <span>{item.available} free</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Usage Trend */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">24h Equipment Usage Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={usageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} interval={3} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="ventilators" stroke="hsl(190 90% 60%)" fill="hsl(190 90% 60% / 0.15)" strokeWidth={2} />
              <Area type="monotone" dataKey="oxygen" stroke="hsl(140 70% 50%)" fill="hsl(140 70% 50% / 0.1)" strokeWidth={2} />
              <Area type="monotone" dataKey="monitors" stroke="hsl(45 90% 55%)" fill="hsl(45 90% 55% / 0.08)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Maintenance Alerts */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" /> Maintenance Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${priorityBadge(alert.priority)}`}>{alert.priority}</span>
                    <span className="text-sm font-medium text-foreground">{alert.device}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.issue} — {alert.location}</p>
                </div>
                <span className="text-xs text-muted-foreground">{alert.dueDate}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> AI Equipment Recommendations
          </h3>
          <div className="space-y-3">
            {recs.map(rec => (
              <div key={rec.id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${priorityBadge(rec.urgency)}`}>{rec.urgency}</span>
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
