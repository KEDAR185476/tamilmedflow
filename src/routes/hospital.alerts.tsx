import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bell } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";
import { generateAlerts } from "@/lib/hospitalAIEngine";

export const Route = createFileRoute("/hospital/alerts")({ component: HospitalAlerts });

function HospitalAlerts() {
  const auth = getHospitalAuth();
  const hd = loadHospitalData(auth?.tenant?.id || "demo");
  const alerts = generateAlerts(hd);

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Bell className="h-5 w-5 text-chart-2" /> Alert Center</h1>
      <div className="space-y-2">
        {alerts.map(a => (
          <GlassCard key={a.id} className={`p-4 flex items-start gap-3 ${a.severity === "critical" ? "border-destructive/30" : ""}`}>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${a.severity === "critical" ? "bg-destructive/15" : a.severity === "warning" ? "bg-chart-4/15" : "bg-chart-2/15"}`}>
              <AlertTriangle className={`h-4 w-4 ${a.severity === "critical" ? "text-destructive" : a.severity === "warning" ? "text-chart-4" : "text-chart-2"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{a.message}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                <span>{a.time}</span>
                <span className="text-muted-foreground/30">·</span>
                <span className={`px-1.5 py-0.5 rounded ${a.severity === "critical" ? "bg-destructive/10 text-destructive" : a.severity === "warning" ? "bg-chart-4/10 text-chart-4" : "bg-chart-2/10 text-chart-2"}`}>{a.severity}</span>
                <span className="text-muted-foreground/30">·</span>
                <span>{a.category}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
