import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { TN_DISTRICTS } from "@/data/districts";
import { forecastAdmissions, forecastICUDemand, forecastOccupancy, predictSurge, predictStaffPressure } from "@/services/forecastEngine";
import { getHospitalCapacity, getEmergencyRisk } from "@/services/dataService";
import { MapPin, TrendingUp, Activity, AlertTriangle, Users, BedDouble } from "lucide-react";

export const Route = createFileRoute("/dashboard/district-predictions")({
  component: DistrictPredictionView,
});

function DistrictPredictionView() {
  const districtData = TN_DISTRICTS.map(d => {
    const cap = getHospitalCapacity(d.id);
    const admissions = forecastAdmissions(d.id, "24h");
    const icu = forecastICUDemand(d.id);
    const occupancy = forecastOccupancy(d.id);
    const surge = predictSurge(d.id);
    const staff = predictStaffPressure(d.id);
    const risk = getEmergencyRisk(d.id);
    const occupancyRate = cap.totalBeds > 0 ? Math.round((cap.occupiedBeds / cap.totalBeds) * 100) : 0;

    return { district: d, cap, admissions, icu, occupancy, surge, staff, risk, occupancyRate };
  });

  // Sort by risk descending
  districtData.sort((a, b) => b.risk - a.risk);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          District Prediction View
        </h1>
        <p className="text-sm text-muted-foreground">
          AI predictions across all Tamil Nadu districts — sorted by risk level
        </p>
      </div>

      {/* Overview grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {districtData.map(({ district, cap, admissions, icu, occupancy, surge, staff, risk, occupancyRate }) => (
          <GlassCard key={district.id} className={`p-4 border ${risk > 60 ? "border-destructive/30" : risk > 40 ? "border-warning/20" : "border-primary/10"}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">{district.name}</h3>
                <p className="text-[10px] text-muted-foreground">
                  Pop: {(district.population / 1000000).toFixed(1)}M | Zone: {district.zone}
                </p>
              </div>
              <div className={`text-lg font-bold ${risk > 60 ? "text-destructive" : risk > 40 ? "text-warning" : "text-success"}`}>
                {risk}
                <span className="text-[9px] text-muted-foreground block text-center">risk</span>
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <MiniMetric icon={<BedDouble className="h-3 w-3" />} label="Occupancy" value={`${occupancyRate}%`} alert={occupancyRate > 85} />
              <MiniMetric icon={<Activity className="h-3 w-3" />} label="ICU Peak" value={`${icu.predictedPeak}%`} alert={icu.riskLevel === "critical" || icu.riskLevel === "high"} />
              <MiniMetric icon={<TrendingUp className="h-3 w-3" />} label="24h Adm." value={String(admissions.totalPredicted)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MiniMetric icon={<AlertTriangle className="h-3 w-3" />} label="Surge" value={surge.riskLevel.toUpperCase()} alert={surge.riskLevel === "high"} />
              <MiniMetric icon={<Users className="h-3 w-3" />} label="Staff" value={`${staff.pressureScore}%`} alert={staff.pressureScore > 70} />
              <MiniMetric
                icon={<BedDouble className="h-3 w-3" />}
                label="7d Risk"
                value={occupancy.overloadRiskDay ? `Day ${occupancy.overloadRiskDay}` : "Safe"}
                alert={occupancy.overloadRiskDay !== null}
              />
            </div>

            {/* Surge triggers */}
            {surge.riskLevel !== "low" && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-[9px] text-muted-foreground">Surge triggers:</p>
                {surge.triggers.slice(0, 2).map((t, i) => (
                  <p key={i} className="text-[9px] text-warning truncate">• {t}</p>
                ))}
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Comparison table */}
      <GlassCard className="p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-foreground mb-3">District Comparison Matrix</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2 pr-4">District</th>
              <th className="text-right py-2 px-2">Beds</th>
              <th className="text-right py-2 px-2">Occ%</th>
              <th className="text-right py-2 px-2">ICU Peak</th>
              <th className="text-right py-2 px-2">24h Adm.</th>
              <th className="text-right py-2 px-2">Surge</th>
              <th className="text-right py-2 px-2">Staff</th>
              <th className="text-right py-2 px-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {districtData.map(({ district, cap, occupancyRate, icu, admissions, surge, staff, risk }) => (
              <tr key={district.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                <td className="py-2 pr-4 font-medium text-foreground">{district.name}</td>
                <td className="text-right py-2 px-2">{cap.totalBeds.toLocaleString()}</td>
                <td className={`text-right py-2 px-2 ${occupancyRate > 85 ? "text-destructive" : ""}`}>{occupancyRate}%</td>
                <td className={`text-right py-2 px-2 ${icu.predictedPeak > 85 ? "text-destructive" : ""}`}>{icu.predictedPeak}%</td>
                <td className="text-right py-2 px-2">{admissions.totalPredicted}</td>
                <td className={`text-right py-2 px-2 ${surge.riskLevel === "high" ? "text-destructive" : surge.riskLevel === "medium" ? "text-warning" : "text-success"}`}>
                  {surge.riskLevel}
                </td>
                <td className={`text-right py-2 px-2 ${staff.pressureScore > 70 ? "text-warning" : ""}`}>{staff.pressureScore}%</td>
                <td className={`text-right py-2 px-2 font-bold ${risk > 60 ? "text-destructive" : risk > 40 ? "text-warning" : "text-success"}`}>{risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

function MiniMetric({ icon, label, value, alert = false }: { icon: React.ReactNode; label: string; value: string; alert?: boolean }) {
  return (
    <div className={`glass rounded p-1.5 text-center ${alert ? "border border-destructive/30" : ""}`}>
      <div className={`flex justify-center mb-0.5 ${alert ? "text-destructive" : "text-primary"}`}>{icon}</div>
      <div className={`text-xs font-bold ${alert ? "text-destructive" : "text-foreground"}`}>{value}</div>
      <div className="text-[8px] text-muted-foreground">{label}</div>
    </div>
  );
}
