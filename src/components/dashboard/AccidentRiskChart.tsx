import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ACCIDENT_DATA } from "@/data/accidents";
import { TN_DISTRICTS } from "@/data/districts";
import { GlassCard } from "@/components/layout/GlassCard";

export function AccidentRiskChart() {
  const data = ACCIDENT_DATA
    .map(a => {
      const d = TN_DISTRICTS.find(dd => dd.id === a.district);
      return {
        name: d?.name.slice(0, 8) ?? a.district,
        risk: a.highwayRiskScore,
        accidents: a.avgDailyAccidents,
        corridor: a.nhCorridor ?? "No major NH",
      };
    })
    .sort((a, b) => b.risk - a.risk);

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Road Accident Risk by District</h3>
      <p className="text-xs text-muted-foreground mb-4">Source: MoRTH + TN Police | NH corridor risk scores</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }} width={55} />
          <Tooltip
            contentStyle={{ background: "oklch(0.17 0.02 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }}
            formatter={(value: any, _: any, entry: any) => [
              `Score: ${value} | Avg ${entry.payload.accidents}/day`,
              entry.payload.corridor
            ]}
          />
          <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.risk > 70 ? "oklch(0.65 0.2 25)" : entry.risk > 55 ? "oklch(0.80 0.15 85)" : "oklch(0.72 0.17 155)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
