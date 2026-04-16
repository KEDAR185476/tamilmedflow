import { createFileRoute } from "@tanstack/react-router";
import { Stethoscope, AlertTriangle, Zap, ArrowRight, Clock, Pill, Receipt, Truck } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";
import { generateRecommendations } from "@/lib/hospitalAIEngine";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/patients")({ component: HospitalPatientsPage });

function HospitalPatientsPage() {
  const auth = getHospitalAuth();
  const hd = loadHospitalData(auth?.tenant?.id || "demo");
  const recs = generateRecommendations(hd).filter(r => r.category === "flow");
  const { liveOps, opsBaseline } = hd;

  const bottlenecks = [
    { label: "Discharge Ready", value: liveOps.patientFlow.dischargeReady, icon: Clock, warn: liveOps.patientFlow.dischargeReady > 8 },
    { label: "Transfer Pending", value: liveOps.patientFlow.transferPending, icon: Truck, warn: liveOps.patientFlow.transferPending > 3 },
    { label: "Pharmacy Delays", value: liveOps.patientFlow.pharmacyDelays, icon: Pill, warn: liveOps.patientFlow.pharmacyDelays > 4 },
    { label: "Billing Pending", value: liveOps.patientFlow.billingPending, icon: Receipt, warn: liveOps.patientFlow.billingPending > 5 },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Stethoscope className="h-5 w-5 text-chart-2" /> Patient Flow Intelligence</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Today Admitted", value: liveOps.admissions.todayAdmitted.toString() },
          { label: "ER Waiting", value: liveOps.admissions.erWaiting.toString(), warn: liveOps.admissions.erWaiting > 5 },
          { label: "Avg Wait Time", value: `${opsBaseline.avgWaitTime}m` },
          { label: "Surgery Scheduled", value: liveOps.admissions.surgeryScheduled.toString() },
        ].map(k => (
          <GlassCard key={k.label} className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn ? "text-destructive" : "text-chart-2"}`}>{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bottlenecks */}
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Flow Bottlenecks</h3>
          <div className="grid grid-cols-2 gap-3">
            {bottlenecks.map(b => (
              <div key={b.label} className={`p-3 rounded-lg border ${b.warn ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/20"} flex items-center gap-3`}>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${b.warn ? "bg-destructive/10" : "bg-chart-2/10"}`}>
                  <b.icon className={`h-5 w-5 ${b.warn ? "text-destructive" : "text-chart-2"}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${b.warn ? "text-destructive" : "text-foreground"}`}>{b.value}</p>
                  <p className="text-[10px] text-muted-foreground">{b.label}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Actions */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
          <div className="space-y-2">
            {["Fast-track Billing", "Prioritize Transport", "Refill Cancelled OT Slot", "Escalate Delayed Transfer"].map(a => (
              <button key={a} onClick={() => toast.success(`${a} — initiated`)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-chart-2/30 transition-all">
                {a} <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {recs.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-chart-4" /> AI Flow Recommendations</h3>
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
