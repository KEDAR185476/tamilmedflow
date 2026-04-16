import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getHospitalCapacity } from "@/services/dataService";
import { GlassCard } from "@/components/layout/GlassCard";

/**
 * ICU Load Trend — simulated 24-hour trend
 * Rule: ICU occupancy follows time-of-day admission curve
 * Peak: 10am-2pm (post-surgery), 7pm-11pm (ER admissions)
 */
const HOURLY_ICU_PATTERN = [
  0.82, 0.80, 0.78, 0.76, 0.75, 0.76, 0.78, 0.82, 0.86, 0.90,
  0.93, 0.95, 0.94, 0.92, 0.90, 0.88, 0.87, 0.88, 0.91, 0.93,
  0.92, 0.90, 0.87, 0.84,
];

export function ICULoadChart() {
  const { selectedDistrict } = useDistrictFilter();
  const capacity = getHospitalCapacity(selectedDistrict === "all" ? undefined : selectedDistrict);

  const data = HOURLY_ICU_PATTERN.map((rate, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    icuOccupied: Math.round(capacity.icuTotal * rate),
    icuTotal: capacity.icuTotal,
    rate: Math.round(rate * 100),
  }));

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">ICU Load — 24hr Trend</h3>
      <p className="text-xs text-muted-foreground mb-4">Pattern: Post-surgical + ER admission curves</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
          <XAxis dataKey="hour" tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 10 }} interval={3} />
          <YAxis tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }}
            formatter={(value: any, name: any) => [
              name === "rate" ? `${value}%` : value,
              name === "rate" ? "ICU Rate" : "ICU Beds Used"
            ]}
          />
          <Legend />
          <Line type="monotone" dataKey="icuOccupied" stroke="oklch(0.65 0.2 25)" strokeWidth={2} dot={false} name="ICU Beds Used" />
          <Line type="monotone" dataKey="icuTotal" stroke="oklch(1 0 0 / 20%)" strokeWidth={1} strokeDasharray="5 5" dot={false} name="ICU Capacity" />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
