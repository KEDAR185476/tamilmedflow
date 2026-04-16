import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { DATA_SOURCES } from "@/data/source-registry";
import { Terminal, Database, Clock, MapPin, Activity, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { selectedDistrict, districtName } = useDistrictFilter();

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          Admin / Debug Panel
        </h1>
        <p className="text-sm text-muted-foreground">System state, data pipelines, and service health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current District */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Current Filter</h3>
          </div>
          <p className="text-lg font-bold text-primary">{districtName}</p>
          <p className="text-xs text-muted-foreground mt-1">District ID: {selectedDistrict}</p>
        </GlassCard>

        {/* Refresh timestamps */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Refresh Timestamps</h3>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Page load:</span><span className="text-foreground">{new Date().toLocaleTimeString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Data refresh:</span><span className="text-foreground">Static (on-load)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Simulation tick:</span><span className="text-foreground">5s interval</span></div>
          </div>
        </GlassCard>

        {/* Service Health */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Service Health</h3>
          </div>
          <div className="space-y-1 text-xs">
            <ServiceStatus name="Data Service" status="ok" />
            <ServiceStatus name="Simulation Engine" status="ok" />
            <ServiceStatus name="District Filter" status="ok" />
            <ServiceStatus name="FastAPI Backend" status="pending" detail="Not connected" />
            <ServiceStatus name="WebSocket" status="pending" detail="Not connected" />
          </div>
        </GlassCard>
      </div>

      {/* Active Datasets */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Active Datasets Loaded</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DATA_SOURCES.map(src => (
            <div key={src.id} className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{src.name.slice(0, 30)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${src.status === "live" ? "bg-success/20 text-success" : src.status === "processed" ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"}`}>
                  {src.status}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Updated: {src.lastUpdated}</p>
              <p className="text-[10px] text-muted-foreground">Reliability: {"★".repeat(src.reliabilityScore)}{"☆".repeat(5 - src.reliabilityScore)}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Data Pipeline Logs */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Data Pipeline Log</h3>
        <div className="font-mono text-xs space-y-1 text-muted-foreground max-h-60 overflow-y-auto">
          <LogLine time="00:00:01" msg="[INIT] Loading TN district master data (12 districts)" level="info" />
          <LogLine time="00:00:01" msg="[INIT] Loading hospital capacity data (20 hospitals)" level="info" />
          <LogLine time="00:00:02" msg="[INIT] Generating disease data (12 districts × 12 months = 144 records)" level="info" />
          <LogLine time="00:00:02" msg="[INIT] Generating weather data (12 districts × 12 months = 144 records)" level="info" />
          <LogLine time="00:00:02" msg="[INIT] Loading accident data (12 districts)" level="info" />
          <LogLine time="00:00:03" msg="[INIT] Computing staff benchmarks from hospital capacity" level="info" />
          <LogLine time="00:00:03" msg="[INIT] Computing equipment inventory from hospital data" level="info" />
          <LogLine time="00:00:03" msg="[INIT] Data services ready — all datasets loaded" level="success" />
          <LogLine time="00:00:04" msg="[SIM] Simulation engine initialized (5s tick interval)" level="info" />
          <LogLine time="00:00:04" msg="[WARN] FastAPI backend not connected — using local data only" level="warn" />
          <LogLine time="00:00:04" msg="[WARN] WebSocket not connected — using polling simulation" level="warn" />
        </div>
      </GlassCard>
    </div>
  );
}

function ServiceStatus({ name, status, detail }: { name: string; status: "ok" | "pending" | "error"; detail?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{name}</span>
      <span className={`flex items-center gap-1 ${status === "ok" ? "text-success" : status === "error" ? "text-destructive" : "text-warning"}`}>
        {status === "ok" ? <CheckCircle className="h-3 w-3" /> : <span className="h-2 w-2 rounded-full bg-current" />}
        {detail ?? status}
      </span>
    </div>
  );
}

function LogLine({ time, msg, level }: { time: string; msg: string; level: "info" | "success" | "warn" | "error" }) {
  const color = level === "success" ? "text-success" : level === "warn" ? "text-warning" : level === "error" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className={color}>
      <span className="text-muted-foreground/50">[{time}]</span> {msg}
    </div>
  );
}
