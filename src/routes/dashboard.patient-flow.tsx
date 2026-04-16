import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GitBranch, Clock, ArrowRightLeft, AlertTriangle, Zap, Activity } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { KPICard } from "@/components/layout/KPICard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  getPatientFlowMetrics,
  getDischargeBottlenecks,
  getTransferQueue,
  getPatientPipeline,
  getFlowRecommendations,
} from "@/services/patientFlowEngine";

export const Route = createFileRoute("/dashboard/patient-flow")({
  component: PatientFlowPage,
});

function PatientFlowPage() {
  const { selectedDistrict } = useDistrictFilter();
  const metrics = getPatientFlowMetrics(selectedDistrict);
  const bottlenecks = getDischargeBottlenecks(selectedDistrict);
  const transfers = getTransferQueue(selectedDistrict);
  const pipeline = getPatientPipeline(selectedDistrict);
  const recs = getFlowRecommendations(selectedDistrict);
  const [optimized, setOptimized] = useState(false);

  const priorityColor = (p: string) =>
    p === "urgent" || p === "critical" ? "bg-red-500/20 text-red-400" :
    p === "high" ? "bg-orange-500/20 text-orange-400" :
    p === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400";

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Flow Control Tower</h1>
          <p className="text-sm text-muted-foreground">Patient journey tracking, discharge optimization, and bottleneck detection</p>
        </div>
        <Button onClick={() => setOptimized(!optimized)} className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90">
          <Zap className="h-4 w-4" />
          {optimized ? "Reset" : "Optimize Flow"}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Avg Transfer" value={`${optimized ? Math.round(metrics.avgTransferTime * 0.6) : metrics.avgTransferTime}m`} icon={<ArrowRightLeft className="h-5 w-5" />} trend={optimized ? "-40% faster" : undefined} trendUp={optimized} />
        <KPICard title="Pending Discharge" value={String(optimized ? Math.round(metrics.pendingDischarges * 0.35) : metrics.pendingDischarges)} icon={<Clock className="h-5 w-5" />} trend={optimized ? "-65% cleared" : undefined} trendUp={optimized} />
        <KPICard title="Internal Queue" value={String(metrics.internalQueueCount)} icon={<GitBranch className="h-5 w-5" />} />
        <KPICard title="OT Delays" value={String(optimized ? Math.max(0, metrics.otDelays - 3) : metrics.otDelays)} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Family Requests" value={String(metrics.familyRequestVolume)} icon={<Activity className="h-5 w-5" />} />
        <KPICard title="Flow Score" value={`${optimized ? Math.min(95, metrics.flowEfficiencyScore + 22) : metrics.flowEfficiencyScore}%`} icon={<Zap className="h-5 w-5" />} trend={optimized ? "+22% improved" : undefined} trendUp={optimized} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Journey Pipeline */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Patient Journey Pipeline</h3>
          <div className="space-y-2">
            {pipeline.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${stage.bottleneck ? "bg-red-400 animate-pulse" : "bg-primary"}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{stage.count} patients</span>
                      {stage.avgTime > 0 && <span className="text-xs text-muted-foreground">{stage.avgTime}m avg</span>}
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${stage.bottleneck ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, stage.count * 5 + 10)}%` }}
                    />
                  </div>
                </div>
                {i < pipeline.length - 1 && <div className="text-muted-foreground text-xs">→</div>}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Discharge Bottleneck Tracker */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4">Discharge Bottleneck Funnel</h3>
          <div className="space-y-3">
            {bottlenecks.map(b => (
              <div key={b.category} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{b.category}</span>
                  <span className="text-sm font-bold text-foreground">{optimized ? Math.round(b.count * 0.4) : b.count} patients</span>
                </div>
                <Progress value={optimized ? b.percentage * 0.4 : b.percentage} className="h-1.5 mb-1" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{b.percentage}% of delays</span>
                  <span>Avg {b.avgDelay}m delay</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Transfer Queue */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" /> Transfer Queue
          </h3>
          <div className="space-y-2">
            {transfers.map(t => (
              <div key={t.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${priorityColor(t.priority)}`}>{t.priority}</span>
                    <span className="text-sm font-medium text-foreground">{t.patientId}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${t.status === "in-transit" ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"}`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t.from} → {t.to}</p>
                <p className="text-xs text-muted-foreground">{t.reason} • {t.waitTime}m wait</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> AI Flow Recommendations
          </h3>
          <div className="space-y-3">
            {recs.map(rec => (
              <div key={rec.id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${priorityColor(rec.urgency)}`}>{rec.urgency}</span>
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
