import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BedDouble, HeartPulse, AlertTriangle, CheckCircle, ArrowRight, Zap, Shield } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";
import { generateRecommendations } from "@/lib/hospitalAIEngine";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/beds")({ component: HospitalBeds });

function HospitalBeds() {
  const auth = getHospitalAuth();
  const hd = loadHospitalData(auth?.tenant?.id || "demo");
  const recs = generateRecommendations(hd).filter(r => r.category === "beds");
  const { capacity, liveOps } = hd;
  const occRate = Math.round((liveOps.beds.occupied / Math.max(1, capacity.totalBeds)) * 100);

  const wards = [
    { name: "General Ward", beds: capacity.generalBeds, occ: Math.round(capacity.generalBeds * 0.78) },
    { name: "ICU", beds: capacity.icuBeds, occ: Math.round(capacity.icuBeds * 0.85) },
    { name: "HDU", beds: capacity.hduBeds, occ: Math.round(capacity.hduBeds * 0.7) },
    { name: "Isolation", beds: capacity.isolationBeds, occ: Math.round(capacity.isolationBeds * 0.5) },
    { name: "Emergency", beds: Math.round(capacity.totalBeds * 0.08), occ: Math.round(capacity.totalBeds * 0.08 * 0.9) },
    { name: "Pediatrics", beds: Math.round(capacity.totalBeds * 0.06), occ: Math.round(capacity.totalBeds * 0.06 * 0.65) },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><BedDouble className="h-5 w-5 text-chart-2" /> Bed & Capacity Intelligence</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Beds", value: capacity.totalBeds, color: "text-chart-2" },
          { label: "Occupied", value: liveOps.beds.occupied, color: occRate > 85 ? "text-destructive" : "text-chart-2" },
          { label: "Available", value: liveOps.beds.vacant, color: "text-chart-2" },
          { label: "Occupancy", value: `${occRate}%`, color: occRate > 85 ? "text-destructive" : "text-chart-2" },
        ].map(k => (
          <GlassCard key={k.label} className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ward matrix */}
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Ward-wise Bed Matrix</h3>
          <div className="space-y-2.5">
            {wards.map(w => {
              const pct = Math.round((w.occ / Math.max(1, w.beds)) * 100);
              return (
                <div key={w.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">{w.name}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct > 85 ? "bg-destructive" : pct > 70 ? "bg-chart-4" : "bg-chart-2"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-16 text-right">{w.occ}/{w.beds} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {["Assign Patient to Bed", "Reserve ICU Bed", "Transfer Between Wards", "Hold Isolation Bed"].map(a => (
              <button key={a} onClick={() => toast.success(`${a} — initiated`)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-chart-2/30 transition-all">
                {a} <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Recommendations */}
      {recs.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-chart-4" /> AI Recommendations</h3>
          <div className="space-y-2">
            {recs.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${r.urgency === "critical" ? "text-destructive" : "text-chart-4"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-chart-2">{r.confidence}% confidence</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-chart-4">{r.benefit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
