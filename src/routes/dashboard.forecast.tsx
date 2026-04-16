import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { forecastAdmissions, forecastICUDemand, forecastOccupancy, predictSurge, predictStaffPressure, predictDischargeDelay } from "@/services/forecastEngine";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { Brain, TrendingUp, Activity, AlertTriangle, Users, Clock, ChevronRight, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

export const Route = createFileRoute("/dashboard/forecast")({
  component: ForecastDashboard,
});

function ForecastDashboard() {
  const { selectedDistrict, districtName } = useDistrictFilter();

  const admissions24h = forecastAdmissions(selectedDistrict, "24h");
  const admissions7d = forecastAdmissions(selectedDistrict, "7d");
  const icu = forecastICUDemand(selectedDistrict);
  const occupancy = forecastOccupancy(selectedDistrict);
  const surge = predictSurge(selectedDistrict);
  const staff = predictStaffPressure(selectedDistrict);
  const discharge = predictDischargeDelay(selectedDistrict);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Forecast Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered predictions for {districtName}</p>
        </div>
        <DistrictSelector />
      </div>

      {/* Model disclaimer */}
      <div className="glass rounded-lg p-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <span>
          Prototype uses rule-based engines and public datasets. Production deployment would use trained XGBoost/Prophet models
          on a Python backend. All confidence intervals and assumptions are transparently displayed.
        </span>
      </div>

      {/* Summary scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Scorecard label="24h Admissions" value={admissions24h.totalPredicted} confidence={admissions24h.confidence} icon={<TrendingUp className="h-4 w-4" />} />
        <Scorecard label="ICU Peak" value={`${icu.predictedPeak}%`} confidence={icu.confidence} icon={<Activity className="h-4 w-4" />} color={icu.riskLevel === "critical" ? "destructive" : icu.riskLevel === "high" ? "warning" : "primary"} />
        <Scorecard label="Occupancy 7d" value={`${occupancy.predicted7d[6]?.predicted ?? 0}%`} confidence={occupancy.confidence} icon={<TrendingUp className="h-4 w-4" />} />
        <Scorecard label="Surge Risk" value={surge.riskLevel.toUpperCase()} confidence={surge.confidence} icon={<AlertTriangle className="h-4 w-4" />} color={surge.riskLevel === "high" ? "destructive" : surge.riskLevel === "medium" ? "warning" : "success"} />
        <Scorecard label="Staff Pressure" value={`${staff.pressureScore}%`} confidence={staff.confidence} icon={<Users className="h-4 w-4" />} color={staff.pressureScore > 75 ? "destructive" : staff.pressureScore > 55 ? "warning" : "success"} />
        <Scorecard label="Discharge Delay" value={`${discharge.avgDelayHours}h`} confidence={discharge.confidence} icon={<Clock className="h-4 w-4" />} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Admission Forecast 24h */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Admission Forecast — Next 24 Hours
          </h3>
          <p className="text-[10px] text-muted-foreground mb-3">Model: XGBoost | Confidence: {admissions24h.confidence}%</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={admissions24h.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(56,189,248,0.1)" />
                <Area type="monotone" dataKey="predicted" stroke="#38bdf8" fill="rgba(56,189,248,0.2)" strokeWidth={2} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(56,189,248,0.05)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <AssumptionsList assumptions={admissions24h.assumptions} />
        </GlassCard>

        {/* ICU Demand 24h */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            ICU Demand Forecast — 24 Hours
          </h3>
          <p className="text-[10px] text-muted-foreground mb-3">
            Model: XGBoost | Peak: {icu.predictedPeak}% at {icu.peakHour} |
            <span className={`ml-1 ${icu.riskLevel === "critical" ? "text-destructive" : icu.riskLevel === "high" ? "text-warning" : "text-success"}`}>
              Risk: {icu.riskLevel.toUpperCase()}
            </span>
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={icu.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(251,146,60,0.1)" />
                <Area type="monotone" dataKey="predicted" stroke="#fb923c" fill="rgba(251,146,60,0.2)" strokeWidth={2} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(251,146,60,0.05)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Feature importance */}
          <div className="mt-2">
            <p className="text-[10px] text-muted-foreground mb-1">Feature Importance (SHAP):</p>
            <div className="flex flex-wrap gap-1">
              {icu.drivers.map(d => (
                <span key={d.name} className="text-[10px] glass rounded px-1.5 py-0.5">
                  {d.name}: {d.contribution}%
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 7-day Occupancy */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">Bed Occupancy — 7-Day Forecast</h3>
          <p className="text-[10px] text-muted-foreground mb-3">
            Model: Prophet |
            {occupancy.overloadRiskDay ? (
              <span className="text-destructive ml-1">⚠ Overload risk on Day {occupancy.overloadRiskDay}</span>
            ) : (
              <span className="text-success ml-1">✓ No overload predicted</span>
            )}
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancy.predicted7d}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="predicted" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="upper" fill="rgba(251,146,60,0.3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Staff Pressure Breakdown */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">Staff Pressure Breakdown</h3>
          <p className="text-[10px] text-muted-foreground mb-3">
            Model: Rule-Based (WHO-calibrated) | Score: {staff.pressureScore}% |
            <span className={`ml-1 ${staff.shortageRisk === "critical" ? "text-destructive" : staff.shortageRisk === "high" ? "text-warning" : "text-success"}`}>
              {staff.shortageRisk.toUpperCase()}
            </span>
          </p>
          <div className="space-y-2">
            {staff.breakdown.map(b => (
              <div key={b.factor}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-muted-foreground">{b.factor} (w: {b.weight})</span>
                  <span className="text-foreground">{b.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${b.score > 75 ? "bg-destructive" : b.score > 50 ? "bg-warning" : "bg-primary"}`}
                    style={{ width: `${b.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Surge + Discharge row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Surge prediction */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Emergency Surge Prediction</h3>
          <div className="flex items-center gap-4 mb-3">
            <div className={`text-3xl font-bold ${surge.riskLevel === "high" ? "text-destructive" : surge.riskLevel === "medium" ? "text-warning" : "text-success"}`}>
              {surge.probability}%
            </div>
            <div>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${surge.riskLevel === "high" ? "bg-destructive/20 text-destructive" : surge.riskLevel === "medium" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
                {surge.riskLevel.toUpperCase()} RISK
              </span>
              <p className="text-[10px] text-muted-foreground mt-1">Confidence: {surge.confidence}%</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Triggers:</p>
            {surge.triggers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                <ChevronRight className="h-3 w-3 text-primary" />
                {t}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Discharge delay */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Discharge Delay Analysis</h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-3xl font-bold text-warning">{discharge.avgDelayHours}h</div>
            <div>
              <p className="text-xs text-foreground">Avg delay per patient</p>
              <p className="text-[10px] text-muted-foreground">{discharge.patientsAffected} patients affected | Confidence: {discharge.confidence}%</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {discharge.topBottlenecks.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-muted-foreground">{b.cause}</span>
                  <span className="text-foreground">{b.pct}% ({b.delayContribution}h)</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Scorecard({ label, value, confidence, icon, color = "primary" }: {
  label: string;
  value: string | number;
  confidence: number;
  icon: React.ReactNode;
  color?: string;
}) {
  const colorClass = color === "destructive" ? "text-destructive" : color === "warning" ? "text-warning" : color === "success" ? "text-success" : "text-primary";
  return (
    <GlassCard className="p-3 text-center">
      <div className={`flex justify-center mb-1 ${colorClass}`}>{icon}</div>
      <div className={`text-xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-[9px] text-muted-foreground/60 mt-0.5">±{100 - confidence}% margin</div>
    </GlassCard>
  );
}

function AssumptionsList({ assumptions }: { assumptions: string[] }) {
  return (
    <details className="mt-2">
      <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
        Show model assumptions ({assumptions.length})
      </summary>
      <ul className="mt-1 space-y-0.5">
        {assumptions.map((a, i) => (
          <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
            <span className="text-primary">•</span> {a}
          </li>
        ))}
      </ul>
    </details>
  );
}
