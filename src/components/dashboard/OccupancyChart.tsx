import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getHospitalCapacity } from "@/services/dataService";
import { TN_DISTRICTS } from "@/data/districts";
import { GlassCard } from "@/components/layout/GlassCard";

export function OccupancyByDistrictChart() {
  const { selectedDistrict } = useDistrictFilter();

  const data = TN_DISTRICTS
    .filter(d => selectedDistrict === "all" || d.id === selectedDistrict)
    .map(d => {
      const cap = getHospitalCapacity(d.id);
      const rate = cap.totalBeds > 0 ? Math.round((cap.occupiedBeds / cap.totalBeds) * 100) : 0;
      return { name: d.name.slice(0, 8), fullName: d.name, rate, beds: cap.totalBeds, occupied: cap.occupiedBeds };
    })
    .sort((a, b) => b.rate - a.rate);

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Occupancy by District</h3>
      <p className="text-xs text-muted-foreground mb-4">Source: HMIS India + TN Health Dept</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} width={55} />
          <Tooltip
            contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }}
            labelStyle={{ color: "oklch(0.95 0.01 250)" }}
            formatter={(value: any, _: any, entry: any) => [
              `${value}% (${entry.payload.occupied}/${entry.payload.beds} beds)`,
              "Occupancy"
            ]}
          />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.rate > 90 ? "oklch(0.65 0.2 25)" : entry.rate > 80 ? "oklch(0.80 0.15 85)" : "oklch(0.75 0.15 190)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
