import { createFileRoute } from "@tanstack/react-router";
import { Settings, Shield, Clock, Building2 } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";

export const Route = createFileRoute("/hospital/settings")({ component: HospitalSettings });

function HospitalSettings() {
  const auth = getHospitalAuth();
  const hd = loadHospitalData(auth?.tenant?.id || "demo");

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Settings className="h-5 w-5 text-chart-2" /> Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-chart-2" /> Hospital Info</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground">{auth?.tenant?.name || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">{auth?.tenant?.type || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">City</span><span className="text-foreground">{auth?.tenant?.city || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tenant ID</span><span className="text-foreground font-mono text-[10px]">{auth?.tenant?.id || "—"}</span></div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-chart-2" /> Security</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Auth</span><span className="text-chart-2">JWT Active</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Encryption</span><span className="text-chart-2">AES-256</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Session Timeout</span><span className="text-foreground">30 min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Audit Log</span><span className="text-chart-2">Enabled</span></div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-chart-2" /> Data Status</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Setup Complete</span><span className={hd.setupComplete ? "text-chart-2" : "text-chart-4"}>{hd.setupComplete ? "Yes" : "No"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Synced</span><span className="text-foreground">{hd.lastSynced ? new Date(hd.lastSynced).toLocaleString("en-IN") : "Never"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Change Log</span><span className="text-foreground">{hd.changeLog.length} entries</span></div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
