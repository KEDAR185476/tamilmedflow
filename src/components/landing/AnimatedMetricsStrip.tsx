import { useState, useEffect, useRef } from "react";
import { MapPin, Hospital, BedDouble, Siren, Database, Brain, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Districts Covered", value: 38, suffix: "", icon: MapPin, trend: null },
  { label: "Govt Hospitals Indexed", value: 1264, suffix: "", icon: Hospital, trend: null },
  { label: "Beds Monitored", value: 34500, suffix: "+", icon: BedDouble, trend: "up" as const },
  { label: "Avg Emergency Response", value: 3.8, suffix: " min", icon: Siren, trend: "down" as const },
  { label: "Verified Data Sources", value: 9, suffix: " Active", icon: Database, trend: null },
  { label: "AI Models Running", value: 7, suffix: " Live", icon: Brain, trend: null },
];

function useCountUp(target: number, duration = 1800) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const isDecimal = target % 1 !== 0;
          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(isDecimal ? +(target * eased).toFixed(1) : Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { current, ref };
}

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-IN");
  return String(n);
}

export function AnimatedMetricsStrip() {
  return (
    <section className="w-full px-6 py-12 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Tamil Nadu Health Network <span className="neon-text">Live Snapshot</span>
        </h2>
        <p className="text-[11px] text-muted-foreground mt-1">
          Last Updated: Live Simulation · Official Sources (HMIS, NHP, TNHSP, DME)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>
    </section>
  );
}

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
  const { current, ref } = useCountUp(metric.value);
  const Icon = metric.icon;

  return (
    <div
      ref={ref}
      className="group glass-card rounded-xl p-4 border border-border/40 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_oklch(0.75_0.15_190/12%)] text-center relative overflow-hidden"
    >
      {/* Soft glow bg */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,var(--neon-glow),transparent_70%)]" />

      <div className="relative z-10">
        <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <div className="flex items-center justify-center gap-1">
          <span className="text-xl font-bold neon-text tabular-nums">
            {formatNumber(current)}
          </span>
          {metric.suffix && (
            <span className="text-xs text-primary/70 font-medium">{metric.suffix}</span>
          )}
          {metric.trend && (
            <TrendingUp
              className={`h-3 w-3 ml-0.5 ${
                metric.trend === "up" ? "text-green-400" : "text-green-400 rotate-180"
              }`}
            />
          )}
        </div>

        <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">{metric.label}</p>

        {/* Live pulse dot for live metrics */}
        {(metric.suffix === " Live" || metric.suffix === " Active") && (
          <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}
