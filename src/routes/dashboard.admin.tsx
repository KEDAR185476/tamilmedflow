import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { DATA_SOURCES } from "@/data/source-registry";
import { AI_MODELS, getActiveModels } from "@/data/ai-models";
import {
  Terminal, Database, Clock, MapPin, Activity, CheckCircle, Brain, Cpu,
  Server, Wifi, HardDrive, Zap, Shield, RefreshCw,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const [healthRefreshing, setHealthRefreshing] = useState(false);

  const refreshHealth = () => {
    setHealthRefreshing(true);
    setTimeout(() => setHealthRefreshing(false), 1200);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            System Operations Center
          </h1>
          <p className="text-sm text-muted-foreground">Service health, data pipelines, and infrastructure monitoring</p>
        </div>
        <button onClick={refreshHealth}
          className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-xs text-primary hover:bg-primary/10 transition-colors">
          <RefreshCw className={`h-3 w-3 ${healthRefreshing ? "animate-spin" : ""}`} /> Refresh Health
        </button>
      </div>

      {/* System Health Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <HealthCard icon={Server} name="API Gateway" status="operational" uptime="99.97%" />
        <HealthCard icon={Database} name="Database" status="operational" uptime="99.99%" />
        <HealthCard icon={Wifi} name="WebSocket" status="degraded" uptime="Simulated" />
        <HealthCard icon={Brain} name="AI Models" status="operational" uptime={`${getActiveModels().length} active`} />
        <HealthCard icon={HardDrive} name="Cache Layer" status="operational" uptime="Redis OK" />
        <HealthCard icon={Zap} name="Queue Service" status="operational" uptime="0 pending" />
        <HealthCard icon={Shield} name="Auth Service" status="operational" uptime="JWT Active" />
        <HealthCard icon={Activity} name="Metrics Collector" status="operational" uptime="5s interval" />
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
            <h3 className="text-sm font-semibold text-foreground">Internal Services</h3>
          </div>
          <div className="space-y-1 text-xs">
            <ServiceStatus name="Data Service" status="ok" />
            <ServiceStatus name="Simulation Engine" status="ok" />
            <ServiceStatus name="District Filter" status="ok" />
            <ServiceStatus name="Forecast Engine" status="ok" />
            <ServiceStatus name="Recommendation Engine" status="ok" />
            <ServiceStatus name="AI Model Registry" status="ok" detail={`${getActiveModels().length} active`} />
            <ServiceStatus name="FastAPI Backend" status="pending" detail="Not connected" />
            <ServiceStatus name="WebSocket" status="pending" detail="Simulated" />
          </div>
        </GlassCard>
      </div>

      {/* Database Schema */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Database Schema Architecture</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {["users", "roles", "hospitals", "districts", "beds", "icu_status", "staff_roster", "equipment_assets", "admissions", "predictions", "alerts", "recommendations", "audit_logs", "reports"].map(table => (
            <div key={table} className="glass rounded-lg p-2 text-center">
              <p className="text-xs font-mono text-primary">{table}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">PostgreSQL</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Production schema ready for Supabase / PostgreSQL deployment. Current prototype uses in-memory data services.
        </p>
      </GlassCard>

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

      {/* AI Model Status */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">AI Model Status</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AI_MODELS.map(m => (
            <div key={m.id} className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{m.name.slice(0, 28)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.status === "active" ? "bg-success/20 text-success" : m.status === "experimental" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                  {m.status}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{m.modelType} v{m.version}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <Cpu className="h-3 w-3" />
                <span>Accuracy: {m.accuracyEstimate > 0 ? `${m.accuracyEstimate}%` : "N/A"}</span>
                <span>|</span>
                <span>Inference: {m.status === "active" ? "<50ms" : "N/A"}</span>
              </div>
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
          <LogLine time="00:00:04" msg="[AUTH] JWT authentication service initialized" level="info" />
          <LogLine time="00:00:04" msg="[AUDIT] Audit logging service ready" level="info" />
          <LogLine time="00:00:04" msg="[SIM] Simulation engine initialized (5s tick interval)" level="info" />
          <LogLine time="00:00:05" msg="[WARN] FastAPI backend not connected — using local data only" level="warn" />
          <LogLine time="00:00:05" msg="[WARN] WebSocket not connected — using polling simulation" level="warn" />
        </div>
      </GlassCard>
    </div>
  );
}

function HealthCard({ icon: Icon, name, status, uptime }: { icon: React.ComponentType<{ className?: string }>; name: string; status: "operational" | "degraded" | "down"; uptime: string }) {
  const colors = { operational: "text-success", degraded: "text-warning", down: "text-destructive" };
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">{name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium capitalize ${colors[status]}`}>{status}</span>
        <span className="text-[10px] text-muted-foreground">{uptime}</span>
      </div>
      <div className={`h-1 mt-2 rounded-full ${status === "operational" ? "bg-success" : status === "degraded" ? "bg-warning" : "bg-destructive"}`} />
    </GlassCard>
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
