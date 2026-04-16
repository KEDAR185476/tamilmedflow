import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse, AlertTriangle, Activity } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";
import { generateForecast } from "@/lib/hospitalAIEngine";

export const Route = createFileRoute("/hospital/icu")({ component: HospitalICU });

function HospitalICU() {
  const auth = getHospitalAuth();
  const hd = loadHospitalData(auth?.tenant?.id || "demo");
  const forecast = generateForecast(hd).slice(0, 12);
  const { capacity, liveOps, equipment } = hd;
  const icuOcc = Math.round((liveOps.equipment.ventilatorsInUse / Math.max(1, equipment.ventilators)) * 100);

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><HeartPulse className="h-5 w-5 text-chart-2" /> ICU Monitor</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "ICU Beds", value: capacity.icuBeds.toString() },
          { label: "Ventilators Active", value: `${liveOps.equipment.ventilatorsInUse}/${equipment.ventilators}` },
          { label: "ICU Load", value: `${icuOcc}%`, warn: icuOcc > 80 },
          { label: "ICU Pending", value: liveOps.admissions.icuPending.toString(), warn: liveOps.admissions.icuPending > 2 },
        ].map(k => (
          <GlassCard key={k.label} className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn ? "text-destructive" : "text-chart-2"}`}>{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-chart-2" /> ICU Load Forecast (Next 12 Hours)</h3>
        <div className="flex items-end gap-1 h-32">
          {forecast.map((f, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t bg-chart-2/80 transition-all" style={{ height: `${f.icuLoad * 1.2}%` }}>
                {f.icuLoad > 85 && <div className="h-full w-full bg-destructive/60 rounded-t animate-pulse" />}
              </div>
              <span className="text-[8px] text-muted-foreground">{f.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-chart-2" /> Normal</span>
          <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-destructive" /> Critical ({">"}85%)</span>
          <span className="ml-auto">AI Confidence: 84%</span>
        </div>
      </GlassCard>

      {icuOcc > 70 && (
        <GlassCard className="p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-xs font-medium text-destructive">ICU load above 70% — consider proactive step-down transfers for stable patients</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
