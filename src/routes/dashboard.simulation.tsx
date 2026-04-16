import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical, Play, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { runScenarioSimulation } from "@/services/crisisEngine";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard/simulation")({
  component: SimulationPage,
});

const SCENARIOS = [
  { id: "highway-accident", label: "Highway Accident Surge", icon: "🚗", desc: "Mass casualty event on NH corridor" },
  { id: "dengue-outbreak", label: "Dengue Outbreak", icon: "🦟", desc: "Monsoon-driven vector-borne disease spike" },
  { id: "festival-overload", label: "Festival Overload", icon: "🎆", desc: "Pongal/Diwali crowd surge + accidents" },
  { id: "icu-crisis", label: "ICU Occupancy Crisis", icon: "🏥", desc: "ICU demand exceeds capacity" },
  { id: "nurse-shortage", label: "Nurse Shortage", icon: "👩‍⚕️", desc: "30% nursing staff unavailable" },
  { id: "chennai-flood", label: "Chennai Flood Event", icon: "🌊", desc: "Urban flooding disrupts hospital access" },
  { id: "oxygen-shortage", label: "Oxygen Shortage", icon: "💨", desc: "Supply chain disruption" },
];

function SimulationPage() {
  const { selectedDistrict } = useDistrictFilter();
  const [scenario, setScenario] = useState("highway-accident");
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState(24);
  const [staffPct, setStaffPct] = useState(80);
  const [bedPct, setBedPct] = useState(100);
  const [equipPct, setEquipPct] = useState(85);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof runScenarioSimulation> | null>(null);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const res = runScenarioSimulation({
        scenario, severity, duration, districtId: selectedDistrict,
        staffPercent: staffPct, bedPercent: bedPct, equipmentPercent: equipPct,
      });
      setResult(res);
      setRunning(false);
    }, 800);
  };

  const handleReset = () => { setResult(null); setSeverity(5); setDuration(24); setStaffPct(80); setBedPct(100); setEquipPct(85); };

  const metricColor = (val: number, threshHigh: number) =>
    val >= threshHigh ? "text-red-400" : val >= threshHigh * 0.75 ? "text-yellow-400" : "text-emerald-400";

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Simulation Lab</h1>
          <p className="text-sm text-muted-foreground">What-if scenario modeling for crisis preparedness</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>
          <Button onClick={handleRun} disabled={running} className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90">
            <Play className="h-4 w-4" /> {running ? "Simulating..." : "Run Simulation"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <GlassCard className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" /> Scenario Parameters
          </h3>

          {/* Scenario Selector */}
          <div className="space-y-2 mb-6">
            <span className="text-xs text-muted-foreground font-medium">Select Scenario</span>
            <div className="space-y-1.5">
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${
                    scenario === s.id ? "bg-primary/15 border-primary/30 text-foreground" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2">{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          {[
            { label: "Severity", value: severity, set: setSeverity, min: 1, max: 10, unit: `/10` },
            { label: "Duration", value: duration, set: setDuration, min: 4, max: 72, unit: ` hrs` },
            { label: "Staff Available", value: staffPct, set: setStaffPct, min: 30, max: 100, unit: `%` },
            { label: "Bed Capacity", value: bedPct, set: setBedPct, min: 50, max: 100, unit: `%` },
            { label: "Equipment Ready", value: equipPct, set: setEquipPct, min: 30, max: 100, unit: `%` },
          ].map(s => (
            <div key={s.label} className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="text-foreground font-medium">{s.value}{s.unit}</span>
              </div>
              <input
                type="range" min={s.min} max={s.max} value={s.value}
                onChange={e => s.set(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          ))}
        </GlassCard>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Result Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: "Projected Admissions", value: result.projectedAdmissions, threshold: 200 },
                  { label: "Occupancy", value: result.occupancyPercent, threshold: 90, unit: "%" },
                  { label: "ICU Load", value: result.icuLoad, threshold: 85, unit: "%" },
                  { label: "Wait Time", value: result.waitTime, threshold: 60, unit: "m" },
                  { label: "Staff Pressure", value: result.staffPressure, threshold: 80, unit: "%" },
                ].map(m => (
                  <GlassCard key={m.label} className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                    <p className={`text-2xl font-bold ${metricColor(m.value, m.threshold)}`}>
                      {m.value}{m.unit || ""}
                    </p>
                  </GlassCard>
                ))}
              </div>

              {/* Shortage Alerts */}
              {result.shortageAlerts.length > 0 && (
                <GlassCard className="border-red-500/20">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">⚠ Shortage Alerts</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.shortageAlerts.map((a, i) => (
                      <span key={i} className="text-xs bg-red-500/15 text-red-400 px-3 py-1 rounded-full">{a}</span>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Surge Forecast Chart */}
              <GlassCard>
                <h3 className="text-sm font-semibold text-foreground mb-4">Surge Forecast Curve</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={result.surgeForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={11} label={{ value: "Hours", position: "bottom", fill: "rgba(255,255,255,0.3)" }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="admissions" stroke="hsl(0 80% 60%)" fill="hsl(0 80% 60% / 0.15)" strokeWidth={2} name="Admissions/hr" />
                    <Area type="monotone" dataKey="occupancy" stroke="hsl(190 90% 55%)" fill="hsl(190 90% 55% / 0.1)" strokeWidth={2} name="Occupancy %" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <FlaskConical className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Select scenario & parameters</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Click "Run Simulation" to see projected impact</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
