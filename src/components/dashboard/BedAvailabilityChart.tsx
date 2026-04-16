import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getHospitalCapacity } from "@/services/dataService";
import { GlassCard } from "@/components/layout/GlassCard";

/**
 * Bed Availability Trend — 7-day projection
 * Rule: Gradual daily change based on admission/discharge cycle
 * Weekdays: higher occupancy; Weekends: slight discharge surplus
 */
export function BedAvailabilityChart() {
  const { selectedDistrict } = useDistrictFilter();
  const capacity = getHospitalCapacity(selectedDistrict === "all" ? undefined : selectedDistrict);

  const today = new Date();
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 6 + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekends slightly lower occupancy (more discharges, fewer elective)
    const occupancyShift = isWeekend ? -0.03 : 0.01;
    const dayFactor = 1 + occupancyShift + (i - 3) * 0.005; // slight upward trend
    const occupied = Math.round(capacity.occupiedBeds * Math.min(1, Math.max(0.7, dayFactor)));
    const available = capacity.totalBeds - occupied;

    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      available,
      occupied,
      total: capacity.totalBeds,
    };
  });

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Bed Availability — 7 Day Trend</h3>
      <p className="text-xs text-muted-foreground mb-4">Rule: Weekday pressure + weekend discharge cycle</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
          <XAxis dataKey="day" tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} />
          <YAxis tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }} />
          <Line type="monotone" dataKey="available" stroke="oklch(0.72 0.17 155)" strokeWidth={2} name="Available Beds" />
          <Line type="monotone" dataKey="occupied" stroke="oklch(0.65 0.2 25)" strokeWidth={2} name="Occupied Beds" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
