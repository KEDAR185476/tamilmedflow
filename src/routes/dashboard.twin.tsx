import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Building2, Users, Wrench, Activity } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getDigitalTwinWards } from "@/services/crisisEngine";

export const Route = createFileRoute("/dashboard/twin")({
  component: DigitalTwinPage,
});

function DigitalTwinPage() {
  const { selectedDistrict } = useDistrictFilter();
  const [wards, setWards] = useState(() => getDigitalTwinWards(selectedDistrict));
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setWards(getDigitalTwinWards(selectedDistrict));
  }, [selectedDistrict]);

  // Animate live state changes
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setWards(prev => prev.map(w => {
        const delta = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newOcc = Math.max(0, Math.min(w.beds, w.occupied + delta));
        const newStatus = newOcc / w.beds > 0.9 ? "critical" : newOcc / w.beds > 0.75 ? "stressed" : "normal";
        return { ...w, occupied: newOcc, status: newStatus } as typeof w;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (s: string) =>
    s === "critical" ? "border-red-500/40 bg-red-500/10" :
    s === "stressed" ? "border-yellow-500/40 bg-yellow-500/10" : "border-emerald-500/40 bg-emerald-500/10";

  const statusDot = (s: string) =>
    s === "critical" ? "bg-red-500 animate-pulse" : s === "stressed" ? "bg-yellow-500 animate-pulse" : "bg-emerald-500";

  const detail = selectedWard ? wards.find(w => w.name === selectedWard) : null;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Digital Twin Hospital</h1>
        <p className="text-sm text-muted-foreground">Live virtual replica — real-time ward status, patient flow, and resource distribution</p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-4 gap-3">
        <GlassCard className="text-center py-3">
          <p className="text-[10px] text-muted-foreground uppercase">Total Wards</p>
          <p className="text-xl font-bold text-foreground">{wards.length}</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-[10px] text-muted-foreground uppercase">Total Beds</p>
          <p className="text-xl font-bold text-foreground">{wards.reduce((s, w) => s + w.beds, 0)}</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-[10px] text-muted-foreground uppercase">Occupied</p>
          <p className="text-xl font-bold text-primary">{wards.reduce((s, w) => s + w.occupied, 0)}</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-[10px] text-muted-foreground uppercase">Critical Wards</p>
          <p className="text-xl font-bold text-red-400">{wards.filter(w => w.status === "critical").length}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {wards.map(w => {
              const occRate = w.beds > 0 ? Math.round((w.occupied / w.beds) * 100) : 0;
              return (
                <button
                  key={w.name}
                  onClick={() => setSelectedWard(selectedWard === w.name ? null : w.name)}
                  className={`rounded-xl p-3 border transition-all hover:scale-[1.02] text-left ${statusColor(w.status)} ${selectedWard === w.name ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className={`h-2 w-2 rounded-full ${statusDot(w.status)}`} />
                    <span className="text-[10px] font-medium text-foreground truncate">{w.name}</span>
                  </div>
                  {/* Bed Grid Visualization */}
                  <div className="grid grid-cols-5 gap-0.5 mb-2">
                    {Array.from({ length: Math.min(20, w.beds) }, (_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-full rounded-sm ${
                          i < Math.round((w.occupied / w.beds) * Math.min(20, w.beds))
                            ? w.status === "critical" ? "bg-red-500" : w.status === "stressed" ? "bg-yellow-500" : "bg-primary"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>{w.occupied}/{w.beds}</span>
                    <span>{occRate}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Flow Paths */}
          <GlassCard className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Patient Flow Paths</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {["Triage", "Emergency", "Assessment", "Ward", "Treatment", "Discharge"].map((stage, i) => (
                <div key={stage} className="flex items-center gap-1">
                  <div className="bg-primary/15 border border-primary/20 rounded-lg px-3 py-2 text-xs text-foreground whitespace-nowrap">
                    {stage}
                  </div>
                  {i < 5 && (
                    <div className="flex items-center">
                      <div className="w-4 h-0.5 bg-primary/40" />
                      <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-primary/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Detail Panel */}
        <GlassCard>
          {detail ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-3 w-3 rounded-full ${statusDot(detail.status)}`} />
                <h3 className="text-sm font-semibold text-foreground">{detail.name}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  detail.status === "critical" ? "bg-red-500/20 text-red-400" :
                  detail.status === "stressed" ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400"
                }`}>{detail.status}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <Building2 className="h-3 w-3 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{detail.occupied}/{detail.beds}</p>
                  <p className="text-[9px] text-muted-foreground">Beds</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <Users className="h-3 w-3 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{detail.staff}</p>
                  <p className="text-[9px] text-muted-foreground">Staff</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <Wrench className="h-3 w-3 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{detail.equipment}</p>
                  <p className="text-[9px] text-muted-foreground">Devices</p>
                </div>
              </div>

              <h4 className="text-xs text-muted-foreground font-medium mb-2">Patient Severity Mix</h4>
              <div className="space-y-1.5">
                {detail.patients.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-white/5 rounded px-2 py-1.5">
                    <span className="text-xs text-foreground">{p.id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.severity === "critical" ? "bg-red-500/20 text-red-400" :
                      p.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                      p.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>{p.severity}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <Building2 className="h-12 w-12 text-primary/20 mb-3" />
              <p className="text-sm text-muted-foreground">Click a ward to view details</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Beds update in real-time</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
