import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Pill, AlertTriangle, TrendingUp, Clock, Package, Activity,
  ArrowRight, CheckCircle, Truck, Sparkles, Calendar, Shield, Map as MapIcon,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/medicine")({
  component: MedicineIntelligence,
});

type Status = "Healthy" | "Low Stock" | "Critical";

interface Medicine {
  name: string;
  category: string;
  stock: number;
  dailyUsage: number;
  unit: string;
  expiryDays: number;
}

const MEDICINES: Medicine[] = [
  { name: "Paracetamol 500mg", category: "Analgesic", stock: 1200, dailyUsage: 200, unit: "tabs", expiryDays: 180 },
  { name: "ORS Sachets", category: "Rehydration", stock: 340, dailyUsage: 85, unit: "sachets", expiryDays: 90 },
  { name: "Insulin (Regular)", category: "Diabetes", stock: 42, dailyUsage: 12, unit: "vials", expiryDays: 45 },
  { name: "Amoxicillin 250mg", category: "Antibiotic", stock: 780, dailyUsage: 60, unit: "caps", expiryDays: 220 },
  { name: "COVID-19 Vaccine", category: "Vaccine", stock: 210, dailyUsage: 18, unit: "doses", expiryDays: 28 },
  { name: "Emergency Adrenaline", category: "Emergency", stock: 24, dailyUsage: 2, unit: "amps", expiryDays: 60 },
  { name: "Iron & Folic Acid", category: "Supplement", stock: 1600, dailyUsage: 90, unit: "tabs", expiryDays: 300 },
  { name: "Anti-Rabies Vaccine", category: "Vaccine", stock: 18, dailyUsage: 3, unit: "vials", expiryDays: 40 },
];

const FACILITIES = [
  { name: "PHC Tirunelveli", availability: 92, risk: "Low", action: "Routine" },
  { name: "PHC Madurai", availability: 68, risk: "Medium", action: "Reorder ORS & Insulin" },
  { name: "CHC Coimbatore", availability: 81, risk: "Low", action: "Monitor vaccine stock" },
  { name: "CHC Chennai", availability: 54, risk: "High", action: "Immediate transfer needed" },
  { name: "PHC Salem", availability: 76, risk: "Medium", action: "Reorder antibiotics" },
  { name: "DH Vellore", availability: 88, risk: "Low", action: "Redistribute surplus" },
];

function statusOf(m: Medicine): Status {
  const days = m.stock / Math.max(1, m.dailyUsage);
  if (days < 4) return "Critical";
  if (days < 8) return "Low Stock";
  return "Healthy";
}

function MedicineIntelligence() {
  const [outbreak, setOutbreak] = useState(false);

  const meds = useMemo(() =>
    MEDICINES.map(m => outbreak && (m.name.includes("Paracetamol") || m.name.includes("ORS"))
      ? { ...m, dailyUsage: Math.round(m.dailyUsage * 2.4) }
      : m
    ), [outbreak]);

  const critical = meds.filter(m => statusOf(m) === "Critical").length;
  const expiring = meds.filter(m => m.expiryDays <= 45).length;
  const predictedOut = meds.filter(m => (m.stock / Math.max(1, m.dailyUsage)) < 10).length;
  const healthScore = Math.round(
    100 - (critical * 15 + meds.filter(m => statusOf(m) === "Low Stock").length * 6 + expiring * 3)
  );

  const forecasts = [
    {
      title: "Paracetamol",
      msg: outbreak ? "Demand spiking due to dengue surge. Depletion in 2.5 days." : "Expected to last 6 days at current usage.",
      confidence: outbreak ? 94 : 88,
      depletion: outbreak ? "Nov 6, 2026" : "Nov 10, 2026",
      reorder: outbreak ? "Nov 4, 2026" : "Nov 7, 2026",
    },
    {
      title: "Insulin",
      msg: "Demand may increase by 18% next week — chronic patient cohort growing.",
      confidence: 82, depletion: "Nov 8, 2026", reorder: "Nov 5, 2026",
    },
    {
      title: "ORS Sachets",
      msg: outbreak ? "Consumption up 140% — dengue outbreak driving rehydration needs." : "Consumption likely to rise due to seasonal illness.",
      confidence: outbreak ? 96 : 79, depletion: outbreak ? "Nov 5, 2026" : "Nov 9, 2026", reorder: "Nov 4, 2026",
    },
  ];

  const alerts = [
    { level: "critical" as const, title: "Anti-Rabies Vaccine below threshold", detail: "18 vials remaining · 6 days of supply · immediate reorder recommended" },
    { level: "high" as const, title: "Insulin expiry approaching", detail: "42 vials expiring in 45 days — prioritise consumption or transfer" },
    { level: outbreak ? "critical" : "medium" as const, title: outbreak ? "ORS demand spike detected" : "ORS usage trending upward", detail: outbreak ? "AI detected 140% increase — likely dengue outbreak signal" : "Monitor closely, seasonal pattern emerging" },
    { level: "medium" as const, title: "COVID-19 Vaccine expiry watch", detail: "210 doses expiring in 28 days — schedule outreach camp" },
  ];

  const redistribution = [
    { from: "DH Vellore", to: "CHC Chennai", item: "Insulin (25 vials)", saving: "₹42,000", reason: "Vellore has 3-week surplus, Chennai depletion in 4 days" },
    { from: "PHC Tirunelveli", to: "PHC Madurai", item: "ORS (150 sachets)", saving: "₹8,500", reason: "Neighboring facility surplus, avoids emergency procurement" },
    { from: "Central Warehouse", to: "CHC Chennai", item: "Paracetamol (5,000 tabs)", saving: "₹18,000", reason: "Bulk transfer cheaper than local emergency order" },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Pill className="h-5 w-5 text-chart-2" /> Medicine Stock Intelligence
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time AI inventory monitoring across PHCs, CHCs & District Hospitals</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/hospital/medicine-supply"
            className="text-xs px-3 py-1.5 rounded-lg border border-chart-2/40 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 transition-all flex items-center gap-1.5"
          >
            <MapIcon className="h-3.5 w-3.5" /> Supply Chain Map
          </Link>
          <button
            onClick={() => { setOutbreak(v => !v); toast(outbreak ? "Normal demand restored" : "Dengue outbreak simulated — demand surging"); }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${outbreak ? "bg-destructive/15 border-destructive/40 text-destructive" : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"}`}
          >
            {outbreak ? "● Outbreak Mode Active" : "Simulate Dengue Outbreak"}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Stock Health Score", value: `${healthScore}%`, color: healthScore > 75 ? "text-chart-2" : healthScore > 55 ? "text-chart-4" : "text-destructive", icon: Shield },
          { label: "Critical Shortages", value: critical, color: critical > 0 ? "text-destructive" : "text-chart-2", icon: AlertTriangle },
          { label: "Expiring Soon", value: expiring, color: expiring > 2 ? "text-chart-4" : "text-chart-2", icon: Calendar },
          { label: "Predicted Stock-Outs", value: predictedOut, color: predictedOut > 2 ? "text-destructive" : "text-chart-2", icon: TrendingUp },
        ].map(k => (
          <GlassCard key={k.label} className="p-4">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
              <k.icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Inventory + AI Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-chart-2" /> Medicine Inventory Dashboard
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/40">
                  <th className="py-2 font-medium">Medicine</th>
                  <th className="py-2 font-medium text-right">Stock</th>
                  <th className="py-2 font-medium text-right">Daily Use</th>
                  <th className="py-2 font-medium text-right">Days Left</th>
                  <th className="py-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {meds.map(m => {
                  const days = Math.floor(m.stock / Math.max(1, m.dailyUsage));
                  const s = statusOf(m);
                  const color = s === "Critical" ? "text-destructive bg-destructive/10" : s === "Low Stock" ? "text-chart-4 bg-chart-4/10" : "text-chart-2 bg-chart-2/10";
                  return (
                    <tr key={m.name} className="border-b border-border/20 hover:bg-muted/10">
                      <td className="py-2">
                        <div className="font-medium text-foreground">{m.name}</div>
                        <div className="text-[10px] text-muted-foreground">{m.category}</div>
                      </td>
                      <td className="py-2 text-right text-foreground">{m.stock} <span className="text-muted-foreground text-[10px]">{m.unit}</span></td>
                      <td className="py-2 text-right text-foreground">{m.dailyUsage}</td>
                      <td className="py-2 text-right text-foreground">{days}d</td>
                      <td className="py-2 text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${color}`}>{s}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-chart-2" /> AI Stock Forecasting
          </h3>
          <div className="space-y-3">
            {forecasts.map(f => (
              <div key={f.title} className="p-3 rounded-lg border border-border/40 bg-muted/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">{f.title}</span>
                  <span className="text-[10px] text-chart-2">{f.confidence}% conf.</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">{f.msg}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <div className="text-muted-foreground">Depletion</div>
                    <div className="text-foreground font-medium">{f.depletion}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Reorder By</div>
                    <div className="text-chart-2 font-medium">{f.reorder}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Alerts + Redistribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-4" /> Smart Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map((a, i) => {
              const style = a.level === "critical" ? "border-destructive/40 bg-destructive/5" : a.level === "high" ? "border-chart-4/40 bg-chart-4/5" : "border-border/40 bg-muted/10";
              const dot = a.level === "critical" ? "bg-destructive" : a.level === "high" ? "bg-chart-4" : "bg-chart-2";
              return (
                <div key={i} className={`p-3 rounded-lg border ${style}`}>
                  <div className="flex items-start gap-2">
                    <span className={`h-2 w-2 rounded-full mt-1.5 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">{a.title}</div>
                      <div className="text-[11px] text-muted-foreground">{a.detail}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4 text-chart-2" /> Redistribution Recommendations
          </h3>
          <div className="space-y-2">
            {redistribution.map((r, i) => (
              <div key={i} className="p-3 rounded-lg border border-chart-2/20 bg-chart-2/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-1">
                  <span>{r.from}</span>
                  <ArrowRight className="h-3 w-3 text-chart-2" />
                  <span>{r.to}</span>
                  <span className="ml-auto text-[10px] text-chart-2">Save {r.saving}</span>
                </div>
                <div className="text-[11px] text-foreground">{r.item}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{r.reason}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => toast.success("Transfer approved")} className="text-[10px] px-2 py-1 rounded bg-chart-2/20 text-chart-2 hover:bg-chart-2/30">Approve</button>
                  <button onClick={() => toast("Recommendation dismissed")} className="text-[10px] px-2 py-1 rounded bg-muted/30 text-muted-foreground hover:bg-muted/50">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* PHC/CHC Snapshot */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-chart-2" /> PHC / CHC Inventory Snapshot
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/40">
                <th className="py-2 font-medium">Facility</th>
                <th className="py-2 font-medium text-right">Availability</th>
                <th className="py-2 font-medium text-right">Risk Level</th>
                <th className="py-2 font-medium">Action Required</th>
              </tr>
            </thead>
            <tbody>
              {FACILITIES.map(f => {
                const rc = f.risk === "High" ? "text-destructive bg-destructive/10" : f.risk === "Medium" ? "text-chart-4 bg-chart-4/10" : "text-chart-2 bg-chart-2/10";
                return (
                  <tr key={f.name} className="border-b border-border/20 hover:bg-muted/10">
                    <td className="py-2 text-foreground font-medium">{f.name}</td>
                    <td className="py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${f.availability > 80 ? "bg-chart-2" : f.availability > 65 ? "bg-chart-4" : "bg-destructive"}`} style={{ width: `${f.availability}%` }} />
                        </div>
                        <span className="text-foreground">{f.availability}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${rc}`}>{f.risk}</span>
                    </td>
                    <td className="py-2 text-muted-foreground">{f.action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-2">
        <CheckCircle className="h-3 w-3 text-chart-2" />
        AI forecast: Holt-Winters + rule-based demand signals · Data: TN eHospital + facility feeds · Latency &lt; 2s
      </div>
    </div>
  );
}
