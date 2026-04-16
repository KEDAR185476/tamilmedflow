import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Code, Send, Brain, Database, Activity, Shield, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/api-docs")({
  head: () => ({
    meta: [
      { title: "API Documentation — MedFlow Nexus" },
      { name: "description", content: "Complete API reference for MedFlow Nexus healthcare intelligence platform." },
    ],
  }),
  component: ApiDocsPage,
});

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  desc: string;
  category: string;
  request?: string;
  response: string;
}

const endpoints: Endpoint[] = [
  { method: "GET", category: "Capacity", path: "/api/v1/capacity/overview", desc: "Get system-wide bed capacity metrics",
    response: `{ "totalBeds": 45200, "occupied": 37100, "occupancyRate": 82.1, "icuTotal": 3200, "icuOccupied": 2560, "icuRate": 80.0, "timestamp": "2025-04-16T10:00:00Z" }` },
  { method: "POST", category: "AI / ML", path: "/ml/forecast/admissions", desc: "Predict admissions for next 24-72h",
    request: `{ "hospital_id": "tenant_xyz", "last_30_days_data": [...], "season": "monsoon", "district": "Chennai" }`,
    response: `{ "next_24h": 52, "next_48h": 48, "next_72h": 55, "confidence": 0.87, "model": "xgboost_v2.1", "features_used": ["historical_admissions","weather","day_of_week"] }` },
  { method: "POST", category: "AI / ML", path: "/ml/forecast/occupancy", desc: "Predict bed occupancy trend",
    request: `{ "hospital_id": "tenant_xyz", "horizon_days": 7 }`,
    response: `{ "predictions": [{"day":1,"occupancy":84.2},{"day":2,"occupancy":86.1}], "confidence": 0.82, "model": "prophet_v1.3" }` },
  { method: "POST", category: "AI / ML", path: "/ml/forecast/icu", desc: "Predict ICU demand",
    request: `{ "hospital_id": "tenant_xyz", "current_icu_load": 85 }`,
    response: `{ "predicted_demand_24h": 22, "surge_probability": 0.34, "recommended_reserve": 5, "model": "xgboost_v2.0" }` },
  { method: "GET", category: "AI / ML", path: "/api/v1/recommendations", desc: "Get AI-generated action recommendations",
    response: `{ "recommendations": [{"id":"r1","action":"Accelerate discharges in Ward 3","priority":"high","impact":"Frees 8 beds","confidence":0.91}], "model": "constraint_logic_v1.5" }` },
  { method: "POST", category: "Simulation", path: "/api/v1/simulation/run", desc: "Run what-if simulation scenario",
    request: `{ "hospital_id": "tenant_xyz", "scenario": "monsoon_surge", "params": {"surge_factor": 1.4, "duration_days": 7} }`,
    response: `{ "ticks": 168, "peak_occupancy": 96.2, "beds_needed": 45, "staff_gap": 12, "recommendations": [...] }` },
  { method: "POST", category: "Hospital", path: "/api/hospital/data/update", desc: "Update hospital operational data",
    request: `{ "tenant_id": "tenant_xyz", "section": "capacity", "data": {"totalBeds": 250, "icuBeds": 25} }`,
    response: `{ "success": true, "version": 42, "impact": {"occupancy_change": -3.2, "icu_pressure_change": -5.1} }` },
  { method: "GET", category: "Hospital", path: "/api/hospital/history/metrics", desc: "Get historical performance metrics",
    response: `{ "snapshots": [{"date":"2025-04-15","occupancy":81,"icu_util":76,"wait_time":28}], "benchmark": {"occupancy_trend": "improving", "efficiency_gain": 12.4} }` },
  { method: "POST", category: "Automation", path: "/api/hospital/automation/run", desc: "Execute automation evaluation cycle",
    request: `{ "tenant_id": "tenant_xyz", "mode": "full_auto" }`,
    response: `{ "actions_triggered": 7, "rules_evaluated": 14, "time_saved_min": 45, "efficiency_gain": 8.3 }` },
  { method: "GET", category: "System", path: "/api/v1/system/health", desc: "System health check",
    response: `{ "status": "healthy", "services": {"api":"up","db":"up","cache":"up","ml":"up"}, "latency_ms": 12, "uptime": "99.97%" }` },
];

const categories = [...new Set(endpoints.map(e => e.category))];

function ApiDocsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = activeCategory === "all" ? endpoints : endpoints.filter(e => e.category === activeCategory);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold neon-text">API Documentation</h1>
        </div>
        <p className="text-muted-foreground mb-4">Complete REST API reference for MedFlow Nexus platform integration</p>

        <div className="glass-card p-3 border border-border/50 mb-8 inline-flex items-center gap-2 text-xs">
          <Shield className="h-4 w-4 text-green-400" />
          <span>Base URL: <code className="text-primary">https://api.medflownexus.com</code></span>
          <span className="text-muted-foreground">· Auth: Bearer JWT · Rate limit: 1000 req/min</span>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCategory("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "glass-card border border-border/50 hover:border-primary/50"}`}>
            All Endpoints
          </button>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === c ? "bg-primary text-primary-foreground" : "glass-card border border-border/50 hover:border-primary/50"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Endpoints */}
        <div className="space-y-4">
          {filtered.map((ep, i) => (
            <div key={i} className="glass-card border border-border/50 overflow-hidden">
              <div className="p-4 flex items-start gap-3">
                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${ep.method === "GET" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {ep.method}
                </span>
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-mono text-foreground">{ep.path}</code>
                  <p className="text-xs text-muted-foreground mt-1">{ep.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{ep.category}</span>
              </div>

              {ep.request && (
                <div className="px-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">Request Body</span>
                    <button onClick={() => copyCode(ep.request!, `req-${i}`)} className="text-muted-foreground hover:text-foreground">
                      {copied === `req-${i}` ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <pre className="text-[11px] bg-muted/30 rounded p-2 overflow-x-auto font-mono text-muted-foreground">{ep.request}</pre>
                </div>
              )}

              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Response</span>
                  <button onClick={() => copyCode(ep.response, `res-${i}`)} className="text-muted-foreground hover:text-foreground">
                    {copied === `res-${i}` ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="text-[11px] bg-muted/30 rounded p-2 overflow-x-auto font-mono text-green-400/80">{ep.response}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
