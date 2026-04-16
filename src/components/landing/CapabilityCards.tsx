import { Brain, BedDouble, Users, Zap, Shield, BarChart3 } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";

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
];

export function CapabilityCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {capabilities.map((cap) => (
        <GlassCard key={cap.title} className="group hover:neon-border transition-all duration-500 animate-slide-up">
          <cap.icon className="h-8 w-8 text-primary mb-4 group-hover:animate-pulse-neon" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{cap.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
        </GlassCard>
      ))}
    </div>
  );
}
