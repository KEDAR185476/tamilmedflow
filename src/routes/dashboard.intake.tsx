import { createFileRoute } from "@tanstack/react-router";
import { Stethoscope, AlertTriangle, ThermometerSun, HeartPulse } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getIntakeBriefings } from "@/services/patientFlowEngine";

export const Route = createFileRoute("/dashboard/intake")({
  component: IntakePage,
});

function IntakePage() {
  const { selectedDistrict } = useDistrictFilter();
  const briefings = getIntakeBriefings(selectedDistrict);

  const severityColor = (score: number) =>
    score >= 8 ? "border-red-500/40 bg-red-500/5" :
    score >= 6 ? "border-orange-500/40 bg-orange-500/5" :
    score >= 4 ? "border-yellow-500/40 bg-yellow-500/5" : "border-emerald-500/40 bg-emerald-500/5";

  const priorityBadge = (p: string) =>
    p === "critical" ? "bg-red-500/20 text-red-400" :
    p === "high" ? "bg-orange-500/20 text-orange-400" :
    p === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400";

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Doctor Intake Briefing Console</h1>
        <p className="text-sm text-muted-foreground">AI-assisted patient summary cards for rapid first consultation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {briefings.map(b => (
          <GlassCard key={b.id} className={`border ${severityColor(b.severityScore)}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">{b.patientId}</span>
                  <p className="text-xs text-muted-foreground">{b.ageBand} yrs • {b.gender} • {b.district}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${priorityBadge(b.priorityLevel)}`}>{b.priorityLevel}</span>
                <p className="text-xs text-muted-foreground mt-1">Admitted {b.admissionTime}</p>
              </div>
            </div>

            {/* Vitals Strip */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <HeartPulse className="h-3 w-3 mx-auto text-red-400 mb-1" />
                <span className="text-xs font-medium text-foreground">BP</span>
                <p className="text-sm font-bold text-foreground">{b.vitals.bp}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <span className="text-[10px] text-muted-foreground">Pulse</span>
                <p className={`text-sm font-bold ${b.vitals.pulse > 100 ? "text-red-400" : "text-foreground"}`}>{b.vitals.pulse}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <span className="text-[10px] text-muted-foreground">SpO₂</span>
                <p className={`text-sm font-bold ${b.vitals.spo2 < 95 ? "text-red-400" : "text-foreground"}`}>{b.vitals.spo2}%</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <ThermometerSun className="h-3 w-3 mx-auto text-orange-400 mb-1" />
                <span className="text-[10px] text-muted-foreground">Temp</span>
                <p className={`text-sm font-bold ${b.vitals.temp > 38.5 ? "text-red-400" : "text-foreground"}`}>{b.vitals.temp}°C</p>
              </div>
            </div>

            {/* Severity Gauge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-muted-foreground">Severity</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${b.severityScore >= 8 ? "bg-red-500" : b.severityScore >= 6 ? "bg-orange-500" : b.severityScore >= 4 ? "bg-yellow-500" : "bg-emerald-500"}`}
                  style={{ width: `${b.severityScore * 10}%` }}
                />
              </div>
              <span className="text-sm font-bold text-foreground">{b.severityScore}/10</span>
            </div>

            {/* Details */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Symptoms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {b.symptoms.map(s => (
                    <span key={s} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px]">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">History:</span>
                <span className="text-foreground ml-1">{b.medicalHistory.join(", ")}</span>
              </div>
              {b.allergies[0] !== "None known" && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                  <span className="text-red-400 font-medium">Allergies: {b.allergies.join(", ")}</span>
                </div>
              )}
            </div>

            {/* AI Suggested Action */}
            <div className="mt-4 bg-primary/10 rounded-lg p-3 border border-primary/20">
              <span className="text-[10px] font-bold text-primary uppercase">AI Suggested Action</span>
              <p className="text-sm text-foreground mt-1">{b.suggestedAction}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
