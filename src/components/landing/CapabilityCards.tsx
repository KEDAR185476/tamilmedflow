import { Brain, BedDouble, Users, Zap, Shield, BarChart3, Pill } from "lucide-react";

const capabilities = [
  {
    icon: Brain,
    title: "AI-Powered Forecasting",
    desc: "LSTM & Prophet models trained on HMIS Tamil Nadu data predict bed demand, patient surges, and resource bottlenecks 72 hours ahead.",
  },
  {
    icon: BedDouble,
    title: "Capacity Intelligence",
    desc: "Real-time bed occupancy across 38 districts. Automated overflow routing between GH Chennai, RGGGH, and district hospitals.",
  },
  {
    icon: Users,
    title: "Workforce Optimization",
    desc: "Shift scheduling, fatigue tracking, and skill-match allocation for 92,000+ healthcare workers across Tamil Nadu.",
  },
  {
    icon: Zap,
    title: "Emergency Command",
    desc: "Surge protocol activation for monsoon floods, road accidents on NH corridors, and epidemic outbreaks with real-time dispatch.",
  },
  {
    icon: Shield,
    title: "Digital Twin Simulation",
    desc: "Monte Carlo simulations model 'what-if' scenarios: pandemic waves, new hospital commissioning, staff reallocation impacts.",
  },
  {
    icon: BarChart3,
    title: "Transparent Data Pipeline",
    desc: "Every prediction shows its training data source, model architecture, confidence intervals, and API endpoint — no black boxes.",
  },
  {
    icon: Pill,
    title: "Medicine Intelligence",
    desc: "AI-powered monitoring and forecasting of medicine inventory across PHCs and CHCs to prevent shortages and improve healthcare delivery.",
  },
];

export function CapabilityCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50 rounded-xl overflow-hidden border border-border/50">
      {capabilities.map((cap) => (
        <div key={cap.title} className="bg-card/20 p-6 hover:bg-card/40 transition-colors">
          <cap.icon className="h-4 w-4 text-muted-foreground mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-2 tracking-tight">{cap.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
        </div>
      ))}
    </div>
  );
}
