import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Play } from "lucide-react";
import { AnimatedMetricsStrip } from "@/components/landing/AnimatedMetricsStrip";
import { CapabilityCards } from "@/components/landing/CapabilityCards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedFlow Nexus — AI-Powered Hospital Intelligence for Tamil Nadu" },
      { name: "description", content: "AI-powered Central Nervous System for Tamil Nadu hospitals. Real-time capacity, workforce, and emergency intelligence across 38 districts." },
      { property: "og:title", content: "MedFlow Nexus — AI Hospital Intelligence" },
      { property: "og:description", content: "Central Nervous System for Tamil Nadu healthcare optimization." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(oklch(1_0_0/3%)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/3%)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,var(--neon-glow),transparent_70%)] opacity-30" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 glass-strong">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center glow-sm">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-bold neon-text">MedFlow</span>
              <span className="text-xs text-muted-foreground ml-1">NEXUS</span>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="glass rounded-lg px-4 py-2 text-sm font-medium text-primary hover:neon-border transition-all"
          >
            Launch Platform
          </Link>
        </nav>

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-4xl mx-auto">
          <div className="glass rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-6 animate-slide-down">
            🏥 Powering 1,264 Government Hospitals in Tamil Nadu
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-4">
            Med<span className="neon-text">Flow</span> Nexus
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            AI-Powered Central Nervous System for Tamil Nadu Hospitals.
            Real-time capacity prediction, workforce optimization, and emergency intelligence across 38 districts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:glow-lg transition-all duration-300"
            >
              Launch Platform <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3 font-semibold text-foreground hover:neon-border transition-all duration-300">
              <Play className="h-4 w-4 text-primary" /> View Intelligence Demo
            </button>
          </div>
        </section>

        {/* Metrics Strip */}
        <AnimatedMetricsStrip />

        {/* Capabilities */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">System Capabilities</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every module is backed by transparent data pipelines, visible model architectures, and real Tamil Nadu healthcare datasets.
            </p>
          </div>
          <CapabilityCards />
        </section>

        {/* Footer */}
        <footer className="glass-strong px-6 py-8 text-center">
          <p className="text-xs text-muted-foreground">
            MedFlow Nexus — Built for Tamil Nadu Directorate of Medical & Rural Health Services
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Data sources: HMIS India, NHP, TNHSP, DME Tamil Nadu
          </p>
        </footer>
      </div>
    </div>
  );
}
