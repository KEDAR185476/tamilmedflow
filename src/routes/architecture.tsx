import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Database, Server, Cpu, Globe, Wifi, HardDrive, Shield, Zap, Activity, Brain, BarChart3, Clock, Users } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Production Architecture — MedFlow Nexus" },
      { name: "description", content: "Enterprise-grade technical architecture powering MedFlow Nexus healthcare intelligence." },
    ],
  }),
  component: ArchitecturePage,
});

const stackLayers = [
  { label: "Frontend", tech: "React 19 · TanStack Start · Tailwind v4 · Vite 7", icon: Globe, color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
  { label: "API Gateway", tech: "Edge Functions · REST · WebSocket · Rate Limiting", icon: Zap, color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
  { label: "Backend Services", tech: "Node.js Microservices · FastAPI ML Pipeline · Auth Service", icon: Server, color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30" },
  { label: "AI / ML Layer", tech: "Forecast Engine · Recommendation Engine · Simulation Engine · Learning Lab", icon: Brain, color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
  { label: "Data Layer", tech: "PostgreSQL · Redis Cache · Object Storage · Event Queue", icon: Database, color: "from-red-500/20 to-rose-500/20", border: "border-red-500/30" },
  { label: "Infrastructure", tech: "Edge Deployment · CDN · Auto-Scaling · Health Checks", icon: HardDrive, color: "from-teal-500/20 to-cyan-500/20", border: "border-teal-500/30" },
];

const dbSchemas = [
  { name: "tenants", cols: "id, name, type, registration_id, email, city, district, config, created_at" },
  { name: "hospital_profiles", cols: "id, tenant_id, name, type, beds, departments, specialties, contact" },
  { name: "hospital_capacity", cols: "id, tenant_id, total_beds, icu_beds, hdu_beds, isolation_beds, ot_count, ambulances" },
  { name: "hospital_staff", cols: "id, tenant_id, doctors, nurses, specialists, admin_staff, shift_model, vacancy_rate" },
  { name: "hospital_equipment", cols: "id, tenant_id, ventilators, monitors, oxygen_units, ct_scanners, dialysis, utilization" },
  { name: "hospital_operations_daily", cols: "id, tenant_id, date, admissions, discharges, occupancy, icu_util, wait_time" },
  { name: "regional_district_metrics", cols: "id, district_id, date, occupancy, icu_load, disease_risk, accident_risk, staff_index" },
  { name: "regional_predictions", cols: "id, district_id, model_id, prediction_date, value, confidence, features_used" },
  { name: "alerts", cols: "id, tenant_id, type, severity, message, target_role, acknowledged, created_at" },
  { name: "recommendations", cols: "id, tenant_id, model, action, priority, impact, status, applied_at" },
  { name: "audit_logs", cols: "id, tenant_id, user_id, action, detail, ip_address, timestamp" },
  { name: "model_versions", cols: "id, model_name, version, accuracy, features, retrained_at, status" },
  { name: "exports", cols: "id, tenant_id, type, format, filters, file_url, created_at" },
];

const perfTargets = [
  { metric: "Dashboard Load", target: "<2s", current: "1.4s", pct: 93 },
  { metric: "API Response (p95)", target: "<200ms", current: "145ms", pct: 88 },
  { metric: "Real-Time Update", target: "<500ms", current: "320ms", pct: 91 },
  { metric: "Hospital Capacity", target: "10,000+", current: "Scale-ready", pct: 85 },
  { metric: "Concurrent Users", target: "5,000+", current: "Multi-worker", pct: 80 },
  { metric: "AI Inference", target: "<1s", current: "0.6s", pct: 95 },
];

function ArchitecturePage() {
  const [visibleLayers, setVisibleLayers] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setVisibleLayers(v => Math.min(v + 1, stackLayers.length)), 300);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Server className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold neon-text">Production Architecture</h1>
        </div>
        <p className="text-muted-foreground mb-12">Enterprise-grade stack designed for healthcare-scale workloads</p>

        {/* Animated Stack Diagram */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Cpu className="h-5 w-5 text-primary" /> Technology Stack</h2>
          <div className="space-y-3">
            {stackLayers.map((layer, i) => (
              <div
                key={layer.label}
                className={`glass-card p-4 border ${layer.border} bg-gradient-to-r ${layer.color} transition-all duration-500 ${i < visibleLayers ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <div className="flex items-center gap-4">
                  <layer.icon className="h-6 w-6 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{layer.label}</div>
                    <div className="text-xs text-muted-foreground">{layer.tech}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    {[0,1,2].map(j => (
                      <div key={j} className={`h-2 w-2 rounded-full ${i < visibleLayers ? "bg-green-400 animate-pulse" : "bg-muted"}`} style={{ animationDelay: `${j*200}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {/* Connection Lines */}
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wifi className="h-4 w-4 text-green-400" />
                <span>All layers connected · Auto-scaling · Health-monitored</span>
              </div>
            </div>
          </div>
        </section>

        {/* Database Schemas */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Database Schema Design</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dbSchemas.map(s => (
              <div key={s.name} className="glass-card p-3 border border-border/50">
                <div className="font-mono text-xs text-primary font-semibold mb-1">{s.name}</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">{s.cols}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Targets */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Performance Targets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {perfTargets.map(p => (
              <div key={p.metric} className="glass-card p-4 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{p.metric}</div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-lg font-bold text-primary">{p.target}</span>
                  <span className="text-xs text-muted-foreground">current: {p.current}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-1000" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Principles */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Architecture Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Shield, t: "Zero-Trust Security", d: "Every request authenticated and authorized. No implicit trust between services." },
              { icon: Users, t: "Multi-Tenant by Design", d: "Complete data isolation per hospital. Row-level security on every table." },
              { icon: BarChart3, t: "Observability First", d: "Structured logging, distributed tracing, real-time metrics dashboards." },
              { icon: Clock, t: "Disaster Recovery", d: "Automated backups, point-in-time recovery, multi-region failover capability." },
            ].map(p => (
              <div key={p.t} className="glass-card p-4 border border-border/50 flex gap-3">
                <p.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div><div className="font-semibold text-sm mb-1">{p.t}</div><div className="text-xs text-muted-foreground">{p.d}</div></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
