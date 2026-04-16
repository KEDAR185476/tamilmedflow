import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Play, Shield, Database, Brain, Zap, CheckCircle, Globe, Building2, HeartPulse, Users, Eye, TrendingUp } from "lucide-react";
import { AnimatedMetricsStrip } from "@/components/landing/AnimatedMetricsStrip";
import { CapabilityCards } from "@/components/landing/CapabilityCards";
import { useState } from "react";
import { DemoStoryMode } from "@/components/dashboard/DemoStoryMode";

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
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      {showDemo && <DemoStoryMode onClose={() => setShowDemo(false)} />}
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(oklch(1_0_0/3%)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/3%)_1px,transparent_1px)] bg-[size:60px_60px]" />
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
            <div className="flex items-center gap-3">
              <button onClick={() => setShowDemo(true)}
                className="glass rounded-lg px-3 py-2 text-xs font-medium text-primary hover:neon-border transition-all hidden sm:flex items-center gap-1.5">
                <Play className="h-3 w-3" /> Live Demo
              </button>
              <Link to="/dashboard" className="glass rounded-lg px-4 py-2 text-sm font-medium text-primary hover:neon-border transition-all">
                Launch Platform
              </Link>
            </div>
          </nav>

          {/* Hero */}
          <section className="flex flex-col items-center text-center px-6 pt-20 pb-12 max-w-4xl mx-auto">
            <div className="glass rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-6 animate-slide-down">
              🏥 Central Nervous System for 1,264 Government Hospitals
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-3 animate-slide-up">
              Med<span className="neon-text">Flow</span> Nexus
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-2 animate-slide-up" style={{ animationDelay: "100ms" }}>
              AI-Powered Central Nervous System for Hospitals
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-lg mb-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
              From bed allocation to crisis response—one intelligent platform.
              Predict before crisis hits. Optimize every bed, every minute.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <button onClick={() => setShowDemo(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:glow-lg transition-all duration-300">
                <Play className="h-4 w-4" /> Start Demo
              </button>
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3 font-semibold text-foreground hover:neon-border transition-all duration-300">
                Explore Platform <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#impact"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <TrendingUp className="h-4 w-4" /> View Impact
              </a>
            </div>
          </section>

          {/* Trust badges */}
          <section className="px-6 pb-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: Shield, label: "HIPAA-Ready Architecture" },
                { icon: Database, label: "9 Verified Data Sources" },
                { icon: Brain, label: "7 AI Models Active" },
                { icon: Zap, label: "< 50ms Inference" },
                { icon: CheckCircle, label: "IPHS Compliant" },
                { icon: Globe, label: "38 Districts Covered" },
                { icon: Eye, label: "Fully Transparent AI" },
              ].map(badge => (
                <div key={badge.label} className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <badge.icon className="h-3 w-3 text-primary" />
                  {badge.label}
                </div>
              ))}
            </div>
          </section>

          <AnimatedMetricsStrip />

          {/* Impact Metrics */}
          <section id="impact" className="px-6 py-16 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">Measurable Impact</h2>
              <p className="text-muted-foreground">Projected outcomes based on AI-optimized hospital operations</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "23%", label: "Reduction in Wait Times", icon: HeartPulse },
                { value: "18%", label: "Improved Bed Turnover", icon: Building2 },
                { value: "31%", label: "Faster Emergency Response", icon: Zap },
                { value: "15%", label: "Staff Burnout Reduction", icon: Users },
              ].map(metric => (
                <div key={metric.label} className="glass rounded-xl p-6 text-center hover:neon-border transition-all">
                  <metric.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-black neon-text">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>

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

          {/* Architecture */}
          <section className="px-6 py-16 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">Production Architecture</h2>
              <p className="text-muted-foreground">Enterprise-grade infrastructure ready for deployment</p>
            </div>
            <div className="glass rounded-2xl p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { layer: "Frontend", items: ["TanStack Start", "React 19", "Tailwind CSS 4", "Recharts"] },
                  { layer: "AI Engine", items: ["7 ML Models", "ARIMA Forecasting", "Gradient Boosting", "Rule Engine"] },
                  { layer: "Data Layer", items: ["PostgreSQL", "Redis Cache", "Real-time Sync", "ETL Pipeline"] },
                  { layer: "Security", items: ["JWT Auth", "Role-Based Access", "Audit Logging", "Encrypted Secrets"] },
                ].map(col => (
                  <div key={col.layer} className="text-center">
                    <h4 className="text-sm font-semibold text-primary mb-3">{col.layer}</h4>
                    {col.items.map(item => (
                      <p key={item} className="text-xs text-muted-foreground py-1 border-b border-border/30 last:border-0">{item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Investor metrics */}
          <section className="px-6 py-16 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">Market Opportunity</h2>
              <p className="text-muted-foreground">Healthcare IT market tailored for India's public hospital network</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "$4.2B", label: "India Healthcare IT Market (2025)", sub: "Growing 18% CAGR" },
                { value: "1,264", label: "TN Government Hospitals", sub: "Immediate addressable" },
                { value: "₹2.4Cr", label: "Annual Cost Savings / Hospital", sub: "Efficiency gains" },
                { value: "23,000+", label: "Government Hospitals in India", sub: "National expansion" },
              ].map(m => (
                <div key={m.label} className="glass rounded-xl p-5 text-center hover:neon-border transition-all">
                  <p className="text-2xl font-black neon-text">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{m.label}</p>
                  <p className="text-[10px] text-primary mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="px-6 py-20 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Ready to Transform Hospital Operations?
            </h2>
            <p className="text-muted-foreground mb-8">
              MedFlow Nexus is built for Tamil Nadu's healthcare network — scalable to any state, any country.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:glow-lg transition-all duration-300">
                Enter Command Center <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="glass-strong px-6 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              MedFlow Nexus — Built for Tamil Nadu Directorate of Medical &amp; Rural Health Services
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Data sources: HMIS India · NHP · TNHSP · DME Tamil Nadu · NVBDCP · IDSP · IMD · MoRTH · Census 2011
            </p>
            <p className="text-[10px] text-muted-foreground/30 mt-2">
              Prototype uses public datasets + modeled operational data. Not connected to live hospital feeds.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
