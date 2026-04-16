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

function useCountUp(target: number, duration = 1600) {
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
    <section className="px-6 lg:px-10 py-12 max-w-6xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-1">Live Snapshot</p>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Tamil Nadu Health Network
          </h2>
        </div>
        <p className="text-[10px] text-muted-foreground/50 hidden sm:block">
          Sources: HMIS · NHP · TNHSP · DME
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border/50 rounded-xl overflow-hidden border border-border/50">
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
      className="bg-card/20 hover:bg-card/40 transition-colors p-4 text-center relative"
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground/50 mx-auto mb-2" />

      <div className="flex items-center justify-center gap-1">
        <span className="text-xl font-semibold text-foreground tabular-nums tracking-tight">
          {formatNumber(current)}
        </span>
        {metric.suffix && (
          <span className="text-[10px] text-muted-foreground font-medium">{metric.suffix}</span>
        )}
        {metric.trend && (
          <TrendingUp
            className={`h-3 w-3 ml-0.5 ${
              metric.trend === "up" ? "text-success" : "text-success rotate-180"
            }`}
          />
        )}
      </div>

      <p className="text-[10px] text-muted-foreground mt-1">{metric.label}</p>

      {(metric.suffix === " Live" || metric.suffix === " Active") && (
        <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-success/60 animate-pulse" />
      )}
    </div>
  );
}
