import { useState } from "react";
import { Zap, CheckCircle, TrendingUp, BedDouble, Users, HeartPulse, Shield } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";

export function MasterOptimize() {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");

  const runOptimize = () => {
    setPhase("running");
    setTimeout(() => setPhase("done"), 3000);
  };

  if (phase === "idle") {
    return (
      <button onClick={runOptimize}
        className="w-full glass rounded-xl p-4 text-center hover:neon-border transition-all group">
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:glow-md transition-all">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">ACTIVATE MEDFLOW NEXUS</p>
            <p className="text-[10px] text-muted-foreground">Run full system optimization across all modules</p>
          </div>
        </div>
      </button>
    );
  }

  if (phase === "running") {
    return (
      <GlassCard className="p-4 neon-border animate-pulse-neon">
        <div className="flex items-center justify-center gap-3">
          <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-primary">Optimizing all systems...</span>
        </div>
        <div className="mt-3 space-y-1.5">
          {["Analyzing bed occupancy...", "Rebalancing staff allocation...", "Redistributing ICU load...", "Resolving active alerts...", "Updating forecasts..."].map((step, i) => (
            <div key={step} className="text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: `${i * 400}ms` }}>
              <CheckCircle className="h-3 w-3 text-success inline mr-1.5" />{step}
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 border-success/30">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-5 w-5 text-success" />
        <span className="text-sm font-bold text-success">System Optimized</span>
        <button onClick={() => setPhase("idle")} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Reset</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: BedDouble, label: "Wait Time", value: "-60%", color: "text-success" },
          { icon: TrendingUp, label: "Bed Utilization", value: "+18%", color: "text-primary" },
          { icon: HeartPulse, label: "ICU Stress", value: "-35%", color: "text-success" },
          { icon: Users, label: "Staff Balance", value: "+24%", color: "text-primary" },
          { icon: Shield, label: "Readiness", value: "98%", color: "text-success" },
        ].map(m => (
          <div key={m.label} className="text-center">
            <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
            <p className={`text-lg font-black ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
