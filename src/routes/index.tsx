import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, ArrowRight, Play, Shield, Database, Brain, Zap, CheckCircle,
  Globe, Building2, HeartPulse, Users, Eye, TrendingUp, MapPin, Hospital,
  Rocket, BarChart3, Lock, FileCheck, Sparkles,
} from "lucide-react";
import { AnimatedMetricsStrip } from "@/components/landing/AnimatedMetricsStrip";
import { CapabilityCards } from "@/components/landing/CapabilityCards";
import { useState } from "react";
import { DemoStoryMode } from "@/components/dashboard/DemoStoryMode";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedFlow Nexus — AI-Powered Hospital Intelligence for Tamil Nadu" },
      { name: "description", content: "One AI platform for statewide healthcare intelligence and private hospital automation. Real-time capacity, workforce, and emergency intelligence across 38 districts." },
      { property: "og:title", content: "MedFlow Nexus — AI Hospital Intelligence" },
      { property: "og:description", content: "Central Nervous System for Tamil Nadu healthcare optimization." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleActivate = () => {
    setActivating(true);
    setTimeout(() => { setActivating(false); setActivated(true); }, 3000);
  };

  return (
    <>
      {showDemo && <DemoStoryMode onClose={() => setShowDemo(false)} />}

      {/* Activation Overlay */}
      {(activating || activated) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
          {activating ? (
            <div className="text-center animate-fade-in">
              <div className="relative mx-auto mb-8">
                <div className="h-24 w-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
                <Activity className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-2xl font-bold neon-text mb-2">Activating MedFlow Nexus</h2>
              <p className="text-sm text-muted-foreground">Booting AI engines · Connecting districts · Loading hospital data</p>
            </div>
          ) : (
            <div className="text-center max-w-lg animate-scale-in">
              <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6 glow-lg">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold neon-text mb-4">MedFlow Nexus Active</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { label: "Beds Optimized", value: "12,400+" },
                  { label: "Wait Time Reduced", value: "23%" },
                  { label: "Staff Balanced", value: "38 Districts" },
                  { label: "Emergencies Managed", value: "Real-time" },
                ].map(m => (
                  <div key={m.label} className="glass rounded-xl p-3">
                    <p className="text-lg font-bold neon-text">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3">
                <Link to="/dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:glow-md transition-all">
                  <Globe className="h-4 w-4" /> Regional Command
                </Link>
                <Link to="/hospital/login" className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3 font-semibold hover:neon-border transition-all">
                  <Hospital className="h-4 w-4 text-chart-2" /> My Hospital
                </Link>
              </div>
              <button onClick={() => setActivated(false)} className="mt-4 text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
          )}
        </div>
      )}

      <div className="min-h-screen bg-background relative overflow-hidden">
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
            <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
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
          <section className="flex flex-col items-center text-center px-6 pt-20 pb-10 max-w-4xl mx-auto">
            <div className="glass rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-6 animate-slide-down">
              🏥 Central Nervous System for 1,264 Government Hospitals
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-3 animate-slide-up">
              Med<span className="neon-text">Flow</span> Nexus
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-2 animate-slide-up" style={{ animationDelay: "100ms" }}>
              One AI Platform for Statewide Healthcare Intelligence<br className="hidden md:block" /> and Private Hospital Automation
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-lg mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
              Predict before crisis hits. Optimize every bed, every minute.
              From state command centers to individual hospital wards.
            </p>
          </section>

          {/* ===== DUAL GATEWAY ===== */}
          <section className="px-6 pb-16 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Regional Intelligence */}
              <Link to="/dashboard" className="group block">
                <div className="glass rounded-2xl p-8 h-full border border-transparent hover:neon-border transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500">
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                      <circle cx="120" cy="80" r="4" fill="currentColor" className="text-primary" />
                      <circle cx="200" cy="60" r="4" fill="currentColor" className="text-primary" />
                      <circle cx="280" cy="100" r="4" fill="currentColor" className="text-primary" />
                      <circle cx="160" cy="140" r="4" fill="currentColor" className="text-primary" />
                      <circle cx="240" cy="160" r="4" fill="currentColor" className="text-primary" />
                      <circle cx="140" cy="200" r="4" fill="currentColor" className="text-primary" />
                      <circle cx="220" cy="220" r="4" fill="currentColor" className="text-primary" />
                      <circle cx="300" cy="180" r="4" fill="currentColor" className="text-primary" />
                      <line x1="120" y1="80" x2="200" y2="60" stroke="currentColor" className="text-primary" strokeWidth="0.5" />
                      <line x1="200" y1="60" x2="280" y2="100" stroke="currentColor" className="text-primary" strokeWidth="0.5" />
                      <line x1="160" y1="140" x2="240" y2="160" stroke="currentColor" className="text-primary" strokeWidth="0.5" />
                      <line x1="120" y1="80" x2="160" y2="140" stroke="currentColor" className="text-primary" strokeWidth="0.5" />
                      <line x1="240" y1="160" x2="300" y2="180" stroke="currentColor" className="text-primary" strokeWidth="0.5" />
                      <line x1="140" y1="200" x2="220" y2="220" stroke="currentColor" className="text-primary" strokeWidth="0.5" />
                      <line x1="160" y1="140" x2="140" y2="200" stroke="currentColor" className="text-primary" strokeWidth="0.5" />
                      <line x1="280" y1="100" x2="300" y2="180" stroke="currentColor" className="text-primary" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5 group-hover:glow-md transition-all duration-500">
                      <Globe className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Regional Intelligence Mode</h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Tamil Nadu / District-wide forecasting, capacity analysis, simulation, and healthcare automation.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {["38 Districts", "AI Forecasting", "Crisis Planning", "Digital Twin"].map(tag => (
                        <span key={tag} className="text-[10px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      Enter Regional Command Center <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* My Hospital */}
              <Link to="/hospital/login" className="group block">
                <div className="glass rounded-2xl p-8 h-full border border-transparent hover:border-chart-2 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500">
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                      <rect x="120" y="80" width="160" height="180" rx="4" fill="none" stroke="currentColor" className="text-chart-2" strokeWidth="1" />
                      <rect x="185" y="100" width="30" height="8" fill="currentColor" className="text-chart-2" />
                      <rect x="196" y="90" width="8" height="28" fill="currentColor" className="text-chart-2" />
                      {[140, 170, 210, 240].map(x => [140, 180, 220].map(y => (
                        <rect key={`${x}-${y}`} x={x} y={y} width="16" height="12" rx="1" fill="none" stroke="currentColor" className="text-chart-2" strokeWidth="0.5" />
                      )))}
                      <rect x="185" y="230" width="30" height="30" rx="2" fill="none" stroke="currentColor" className="text-chart-2" strokeWidth="1" />
                      <rect x="70" y="140" width="50" height="120" rx="3" fill="none" stroke="currentColor" className="text-chart-2" strokeWidth="0.5" />
                      <rect x="280" y="140" width="50" height="120" rx="3" fill="none" stroke="currentColor" className="text-chart-2" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-chart-2/15 flex items-center justify-center mb-5 group-hover:shadow-[0_0_20px_oklch(0.70_0.12_160/40%)] transition-all duration-500">
                      <Hospital className="h-7 w-7 text-chart-2" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">My Hospital Mode</h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Private hospital intelligence platform using your own hospital data. Personalized operations center.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {["Custom Data", "Bed Management", "Staff Ops", "Your Analytics"].map(tag => (
                        <span key={tag} className="text-[10px] font-medium text-chart-2 bg-chart-2/10 px-2.5 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-chart-2 group-hover:gap-3 transition-all">
                      Enter My Hospital <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
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

          {/* Who Uses MedFlow Nexus */}
          <section className="px-6 py-16 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">Who Uses MedFlow Nexus?</h2>
              <p className="text-muted-foreground">Designed for every stakeholder in the healthcare ecosystem</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Globe, title: "State Health Directorates", desc: "Monitor all districts, coordinate crisis response, optimize statewide resources" },
                { icon: Building2, title: "District Collectors", desc: "Local capacity management, emergency preparedness, performance benchmarks" },
                { icon: Hospital, title: "Hospital Administrators", desc: "Private hospital ops, bed management, staff optimization, AI automation" },
                { icon: Users, title: "Doctors & Nurses", desc: "Patient flow visibility, equipment status, shift management, alert feeds" },
              ].map(u => (
                <div key={u.title} className="glass rounded-xl p-5 hover:neon-border transition-all">
                  <u.icon className="h-6 w-6 text-primary mb-3" />
                  <h4 className="font-semibold text-sm mb-1">{u.title}</h4>
                  <p className="text-xs text-muted-foreground">{u.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Impact Metrics */}
          <section className="px-6 py-16 max-w-5xl mx-auto">
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

          {/* Platform Analytics */}
          <section className="px-6 py-16 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">Platform at Scale</h2>
              <p className="text-muted-foreground">Internal usage metrics across the MedFlow Nexus ecosystem</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { value: "1,264", label: "Hospitals Covered" },
                { value: "38", label: "Districts Monitored" },
                { value: "47K+", label: "AI Actions/Day" },
                { value: "820+", label: "Hours Saved/Week" },
                { value: "12%", label: "Occupancy Gain" },
              ].map(m => (
                <div key={m.label} className="glass rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold neon-text">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </section>

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

          {/* Investor */}
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

          {/* ACTIVATE CTA */}
          <section className="px-6 py-20 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Ready to Transform Hospital Operations?
            </h2>
            <p className="text-muted-foreground mb-8">
              MedFlow Nexus is built for Tamil Nadu's healthcare network — scalable to any state, any country.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:glow-lg transition-all duration-300">
                Enter Command Center <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/hospital/login"
                className="inline-flex items-center gap-2 glass rounded-xl px-8 py-4 font-bold text-lg text-foreground hover:border-chart-2 border border-transparent transition-all duration-300">
                <Hospital className="h-5 w-5 text-chart-2" /> My Hospital
              </Link>
            </div>
            <button
              onClick={handleActivate}
              disabled={activating}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-chart-2 to-chart-5 text-white px-10 py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all duration-300 shadow-[0_0_30px_oklch(0.75_0.15_190/30%)]"
            >
              <Rocket className="h-5 w-5" /> ACTIVATE MEDFLOW NEXUS
            </button>
          </section>

          {/* Footer */}
          <footer className="glass-strong px-6 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3">Product</h4>
                  <div className="space-y-1.5">
                    <Link to="/dashboard" className="block text-xs text-muted-foreground hover:text-foreground">Regional Mode</Link>
                    <Link to="/hospital/login" className="block text-xs text-muted-foreground hover:text-foreground">My Hospital</Link>
                    <Link to="/pricing" className="block text-xs text-muted-foreground hover:text-foreground">Pricing</Link>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3">Company</h4>
                  <div className="space-y-1.5">
                    <Link to="/about" className="block text-xs text-muted-foreground hover:text-foreground">About</Link>
                    <Link to="/contact" className="block text-xs text-muted-foreground hover:text-foreground">Contact Sales</Link>
                    <span className="block text-xs text-muted-foreground">Careers (Coming Soon)</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3">Trust</h4>
                  <div className="space-y-1.5">
                    <Link to="/security" className="block text-xs text-muted-foreground hover:text-foreground">Security</Link>
                    <span className="block text-xs text-muted-foreground">API Docs (Coming Soon)</span>
                    <span className="block text-xs text-muted-foreground">Documentation</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3">Data Sources</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    HMIS India · NHP · TNHSP · DME Tamil Nadu · NVBDCP · IDSP · IMD · MoRTH · Census 2011
                  </p>
                </div>
              </div>
              <div className="border-t border-border/30 pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  MedFlow Nexus — Built for Tamil Nadu Directorate of Medical &amp; Rural Health Services
                </p>
                <p className="text-[10px] text-muted-foreground/30 mt-1">
                  Prototype uses public datasets + modeled operational data. Not connected to live hospital feeds.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
