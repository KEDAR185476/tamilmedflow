import { useState } from "react";
import { Zap, AlertTriangle, Bug, Users, Activity, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";

interface Scenario {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  district: string;
  effects: { label: string; change: string }[];
}

const SCENARIOS: Scenario[] = [
  { id: "chennai-icu", name: "Chennai ICU Crisis", icon: <AlertTriangle className="h-4 w-4" />, description: "ICU occupancy hits 96% in Chennai. Ventilator demand surges.", district: "Chennai", effects: [{ label: "ICU Load", change: "+22%" }, { label: "Wait Time", change: "+35min" }, { label: "Transfers", change: "+8" }] },
  { id: "madurai-dengue", name: "Madurai Dengue Surge", icon: <Bug className="h-4 w-4" />, description: "Dengue cases spike 3x in Madurai cluster. Fever ward overflow.", district: "Madurai", effects: [{ label: "Admissions", change: "+45/day" }, { label: "Bed Demand", change: "+60" }, { label: "Staff Need", change: "+12" }] },
  { id: "coimbatore-accident", name: "Coimbatore Accident Spike", icon: <Zap className="h-4 w-4" />, description: "Multi-vehicle accident on NH-544. 18 casualties incoming.", district: "Coimbatore", effects: [{ label: "Trauma Beds", change: "-14" }, { label: "ER Load", change: "+180%" }, { label: "Ambulances", change: "6 dispatched" }] },
  { id: "tirunelveli-staff", name: "Tirunelveli Staff Shortage", icon: <Users className="h-4 w-4" />, description: "30% nursing staff unavailable due to leave cluster.", district: "Tirunelveli", effects: [{ label: "Nurse Ratio", change: "1:12" }, { label: "Burnout", change: "High" }, { label: "Coverage", change: "-30%" }] },
  { id: "statewide-stress", name: "Statewide Stress Test", icon: <Activity className="h-4 w-4" />, description: "Simultaneous pressure across all 12 monitored districts.", district: "All", effects: [{ label: "Occupancy", change: "91%" }, { label: "ICU", change: "88%" }, { label: "Alerts", change: "24 active" }] },
];

export function LiveScenarios() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const runScenario = (id: string) => {
    setActiveScenario(id);
    setTimeout(() => {
      setResolved(prev => new Set(prev).add(id));
      setActiveScenario(null);
    }, 2500);
  };

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" /> Live Demo Scenarios
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => runScenario(s.id)} disabled={activeScenario === s.id}
            className={`glass rounded-xl p-3 text-left transition-all hover:neon-border ${activeScenario === s.id ? "neon-border animate-pulse-neon" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary">{s.icon}</span>
              <span className="text-xs font-semibold text-foreground">{s.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{s.description}</p>
            {activeScenario === s.id ? (
              <div className="flex items-center gap-1 text-[10px] text-warning">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse" /> Running...
              </div>
            ) : resolved.has(s.id) ? (
              <div className="flex items-center gap-1 text-[10px] text-success">
                <CheckCircle className="h-3 w-3" /> Resolved
              </div>
            ) : (
              <div className="flex gap-1.5 flex-wrap">
                {s.effects.map(e => (
                  <span key={e.label} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{e.label}: {e.change}</span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
