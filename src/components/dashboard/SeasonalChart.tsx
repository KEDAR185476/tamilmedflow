import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getSeasonalDemand } from "@/services/dataService";
import { GlassCard } from "@/components/layout/GlassCard";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function SeasonalAdmissionChart() {
  const { selectedDistrict } = useDistrictFilter();
  const districtId = selectedDistrict === "all" ? "chennai" : selectedDistrict;
  const demand = getSeasonalDemand(districtId);

  const data = demand.map(d => ({
    month: MONTH_LABELS[d.month - 1],
    dengue: d.dengueCases,
    fever: d.feverCases,
    rainfall: d.rainfall,
  }));

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Seasonal Admission Trend</h3>
      <p className="text-xs text-muted-foreground mb-4">Source: NVBDCP + IMD | District: {districtId}</p>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
          <XAxis dataKey="month" tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} />
          <YAxis tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }} />
          <Legend />
          <Area type="monotone" dataKey="dengue" fill="oklch(0.75 0.15 190 / 30%)" stroke="oklch(0.75 0.15 190)" name="Dengue Cases" />
          <Area type="monotone" dataKey="fever" fill="oklch(0.80 0.15 85 / 20%)" stroke="oklch(0.80 0.15 85)" name="Fever Cases" />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
