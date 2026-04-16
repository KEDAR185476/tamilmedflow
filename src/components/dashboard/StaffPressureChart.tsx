import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { STAFF_DATA } from "@/data/staff-equipment";
import { TN_DISTRICTS } from "@/data/districts";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { GlassCard } from "@/components/layout/GlassCard";

export function StaffPressureChart() {
  const { selectedDistrict } = useDistrictFilter();

  const data = STAFF_DATA
    .filter(s => selectedDistrict === "all" || s.district === selectedDistrict)
    .map(s => {
      const d = TN_DISTRICTS.find(dd => dd.id === s.district);
      return {
        name: d?.name.slice(0, 8) ?? s.district,
        shiftLoad: s.shiftLoad,
        fatigue: s.fatigueRiskScore,
        vacancy: Math.round(s.vacancyRate * 100),
      };
    })
    .sort((a, b) => b.fatigue - a.fatigue);

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Staff Pressure Score</h3>
      <p className="text-xs text-muted-foreground mb-4">Source: NHP + TN MRHS Recruitment Board</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} width={55} />
          <Tooltip
            contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }}
            formatter={(value: any, name: any) => [
              `${value}%`,
              name === "fatigue" ? "Fatigue Risk" : "Shift Load"
            ]}
          />
          <Bar dataKey="fatigue" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fatigue > 85 ? "oklch(0.65 0.2 25)" : entry.fatigue > 70 ? "oklch(0.80 0.15 85)" : "oklch(0.75 0.15 190)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
