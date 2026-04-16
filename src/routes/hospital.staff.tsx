import { createFileRoute } from "@tanstack/react-router";
import { Users, AlertTriangle, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";
import { generateRecommendations } from "@/lib/hospitalAIEngine";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/staff")({ component: HospitalStaffPage });

function HospitalStaffPage() {
  const auth = getHospitalAuth();
  const hd = loadHospitalData(auth?.tenant?.id || "demo");
  const recs = generateRecommendations(hd).filter(r => r.category === "staff");
  const { staff, liveOps } = hd;
  const nurseRatio = (liveOps.staff.onDutyNurses / Math.max(1, liveOps.beds.occupied)).toFixed(2);
  const burnoutRisk = Math.min(100, Math.round(((staff.doctors - liveOps.staff.onDutyDoctors + liveOps.staff.absentCount) / Math.max(1, staff.doctors)) * 100 + liveOps.staff.leaveCount * 3));

  const staffGroups = [
    { role: "Doctors", total: staff.doctors, onDuty: liveOps.staff.onDutyDoctors },
    { role: "Nurses", total: staff.nurses, onDuty: liveOps.staff.onDutyNurses },
    { role: "Specialists", total: staff.specialists, onDuty: Math.round(staff.specialists * 0.7) },
    { role: "Admin", total: staff.adminStaff, onDuty: Math.round(staff.adminStaff * 0.8) },
    { role: "Support", total: staff.supportStaff, onDuty: Math.round(staff.supportStaff * 0.75) },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Users className="h-5 w-5 text-chart-2" /> Workforce Intelligence</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "On Duty", value: `${liveOps.staff.onDutyDoctors + liveOps.staff.onDutyNurses}` },
          { label: "Nurse:Patient", value: nurseRatio },
          { label: "On Leave", value: liveOps.staff.leaveCount.toString() },
          { label: "Burnout Risk", value: `${burnoutRisk}%`, warn: burnoutRisk > 40 },
        ].map(k => (
          <GlassCard key={k.label} className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn ? "text-destructive" : "text-chart-2"}`}>{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Staff Availability</h3>
          <div className="space-y-2.5">
            {staffGroups.map(g => {
              const pct = Math.round((g.onDuty / Math.max(1, g.total)) * 100);
              return (
                <div key={g.role} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{g.role}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${pct < 50 ? "bg-destructive" : pct < 70 ? "bg-chart-4" : "bg-chart-2"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-20 text-right">{g.onDuty}/{g.total} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
          <div className="space-y-2">
            {["Reassign Nurses", "Rotate Overloaded Teams", "Activate Backup Shift", "Call Reserve Specialist"].map(a => (
              <button key={a} onClick={() => toast.success(`${a} — initiated`)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-chart-2/30 transition-all">
                {a} <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {recs.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-chart-4" /> AI Staffing Recommendations</h3>
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
