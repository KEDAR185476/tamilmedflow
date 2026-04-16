import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getImpactAnalyses } from "@/services/crisisEngine";

export const Route = createFileRoute("/dashboard/impact")({
  component: ImpactPage,
});

function ImpactPage() {
  const { selectedDistrict } = useDistrictFilter();
  const analyses = getImpactAnalyses(selectedDistrict);

  const changeColor = (before: number, after: number, lowerBetter: boolean) => {
    const improved = lowerBetter ? after < before : after > before;
    return improved ? "text-emerald-400" : "text-red-400";
  };

  const changeIcon = (before: number, after: number, lowerBetter: boolean) => {
    const improved = lowerBetter ? after < before : after > before;
    return improved ? <TrendingDown className="h-3 w-3 text-emerald-400" /> : <TrendingUp className="h-3 w-3 text-red-400" />;
  };

  const pctChange = (before: number, after: number) => {
    const change = ((after - before) / before) * 100;
    return `${change > 0 ? "+" : ""}${Math.round(change)}%`;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Decision Impact Analyzer</h1>
        <p className="text-sm text-muted-foreground">Before vs after comparison — quantify the impact of operational decisions</p>
      </div>

      <div className="space-y-6">
        {analyses.map((a, idx) => (
          <GlassCard key={idx}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/15 text-primary">{a.category}</span>
              <h3 className="text-sm font-semibold text-foreground">{a.action}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
              {/* Before */}
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                <p className="text-[10px] font-bold text-red-400 uppercase mb-3">Before</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Wait Time", value: `${a.before.waitTime}m` },
                    { label: "Occupancy", value: `${a.before.occupancy}%` },
                    { label: "Mortality Risk", value: `${a.before.mortalityProxy}%` },
                    { label: "Response", value: `${a.before.responseTime}m` },
                    { label: "Throughput", value: `${a.before.throughput}/hr` },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <p className="text-lg font-bold text-foreground">{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1">
                <ArrowRight className="h-6 w-6 text-primary" />
                <span className="text-[9px] text-primary font-medium">IMPACT</span>
              </div>

              {/* After */}
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                <p className="text-[10px] font-bold text-emerald-400 uppercase mb-3">After</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Wait Time", before: a.before.waitTime, after: a.after.waitTime, lowerBetter: true, unit: "m" },
                    { label: "Occupancy", before: a.before.occupancy, after: a.after.occupancy, lowerBetter: true, unit: "%" },
                    { label: "Mortality Risk", before: a.before.mortalityProxy, after: a.after.mortalityProxy, lowerBetter: true, unit: "%" },
                    { label: "Response", before: a.before.responseTime, after: a.after.responseTime, lowerBetter: true, unit: "m" },
                    { label: "Throughput", before: a.before.throughput, after: a.after.throughput, lowerBetter: false, unit: "/hr" },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <p className={`text-lg font-bold ${changeColor(m.before, m.after, m.lowerBetter)}`}>{m.after}{m.unit}</p>
                        {changeIcon(m.before, m.after, m.lowerBetter)}
                      </div>
                      <p className="text-[9px] text-muted-foreground">
                        {m.label} <span className={changeColor(m.before, m.after, m.lowerBetter)}>{pctChange(m.before, m.after)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
