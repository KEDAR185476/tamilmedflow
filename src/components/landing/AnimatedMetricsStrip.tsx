const metrics = [
  { label: "Beds Monitored", value: "34,500+" },
  { label: "Districts Covered", value: "38" },
  { label: "AI Predictions/Day", value: "12,000+" },
  { label: "Patient Throughput", value: "2.1M/yr" },
  { label: "Avg Response Time", value: "< 4 min" },
  { label: "Equipment Units", value: "18,200" },
  { label: "Healthcare Workers", value: "92,000+" },
  { label: "Govt Hospitals", value: "1,264" },
];

export function AnimatedMetricsStrip() {
  const doubled = [...metrics, ...metrics];

  return (
    <div className="w-full overflow-hidden py-4 glass-strong">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {doubled.map((m, i) => (
          <div key={i} className="flex items-center gap-2 px-2">
            <span className="text-sm font-bold neon-text">{m.value}</span>
            <span className="text-xs text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
