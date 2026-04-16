import { createFileRoute } from "@tanstack/react-router";
import { Wrench, AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";
import { generateRecommendations } from "@/lib/hospitalAIEngine";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/equipment")({ component: HospitalEquipmentPage });

function HospitalEquipmentPage() {
  const auth = getHospitalAuth();
  const hd = loadHospitalData(auth?.tenant?.id || "demo");
  const recs = generateRecommendations(hd).filter(r => r.category === "equipment");
  const { equipment, liveOps } = hd;

  const devices = [
    { name: "Ventilators", total: equipment.ventilators, inUse: liveOps.equipment.ventilatorsInUse },
    { name: "Monitors", total: equipment.monitors, inUse: liveOps.equipment.monitorsInUse },
    { name: "Oxygen Units", total: equipment.oxygenUnits, inUse: liveOps.equipment.oxygenActive },
    { name: "Infusion Pumps", total: equipment.infusionPumps, inUse: Math.round(equipment.infusionPumps * 0.6) },
    { name: "Wheelchairs", total: equipment.wheelchairs, inUse: Math.round(equipment.wheelchairs * 0.4) },
    { name: "Portable Beds", total: equipment.portableBeds, inUse: Math.round(equipment.portableBeds * 0.5) },
  ];

  const readiness = Math.round(((equipment.ventilators + equipment.monitors + equipment.oxygenUnits - liveOps.equipment.maintenancePending * 3) / Math.max(1, equipment.ventilators + equipment.monitors + equipment.oxygenUnits)) * 100);

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Wrench className="h-5 w-5 text-chart-2" /> Equipment Intelligence</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Readiness", value: `${readiness}%` },
          { label: "Maintenance Due", value: liveOps.equipment.maintenancePending.toString(), warn: liveOps.equipment.maintenancePending > 2 },
          { label: "Ventilators Free", value: (equipment.ventilators - liveOps.equipment.ventilatorsInUse).toString() },
          { label: "O₂ Available", value: (equipment.oxygenUnits - liveOps.equipment.oxygenActive).toString() },
        ].map(k => (
          <GlassCard key={k.label} className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn ? "text-destructive" : "text-chart-2"}`}>{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Device Utilization</h3>
          <div className="space-y-2.5">
            {devices.map(d => {
              const pct = Math.round((d.inUse / Math.max(1, d.total)) * 100);
              return (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{d.name}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 85 ? "bg-destructive" : pct > 65 ? "bg-chart-4" : "bg-chart-2"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-20 text-right">{d.inUse}/{d.total} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
          <div className="space-y-2">
            {["Move Ventilator to ICU", "Reserve Oxygen Units", "Schedule Maintenance", "Redistribute Monitors"].map(a => (
              <button key={a} onClick={() => toast.success(`${a} — initiated`)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-chart-2/30 transition-all">
                {a} <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {recs.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-chart-4" /> AI Equipment Recommendations</h3>
          <div className="space-y-2">
            {recs.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${r.urgency === "critical" ? "text-destructive" : "text-chart-4"}`} />
                <div>
                  <p className="text-xs font-medium text-foreground">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground">{r.reason}</p>
                  <span className="text-[10px] text-chart-2">{r.confidence}% confidence · {r.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
