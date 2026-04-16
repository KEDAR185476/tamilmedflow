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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/97 backdrop-blur-xl">
          {activating ? (
            <div className="text-center animate-fade-in">
              <div className="relative mx-auto mb-8">
                <div className="h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
                <Activity className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Deploying MedFlow Nexus</h2>
              <p className="text-xs text-muted-foreground">Connecting services · Loading models · Verifying health</p>
            </div>
          ) : (
            <div className="text-center max-w-md animate-scale-in">
              <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-5">Systems Online</h2>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { label: "Beds Optimized", value: "12,400+" },
                  { label: "Wait Time Reduced", value: "23%" },
                  { label: "Districts Active", value: "38" },
                  { label: "Response Time", value: "< 4 min" },
                ].map(m => (
                  <div key={m.label} className="border border-border rounded-lg p-3 bg-card/50">
                    <p className="text-lg font-semibold text-foreground">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Link to="/dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  <Globe className="h-3.5 w-3.5" /> Regional
                </Link>
                <Link to="/hospital/login" className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  <Hospital className="h-3.5 w-3.5" /> Hospital
                </Link>
              </div>
              <button onClick={() => setActivated(false)} className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors">Dismiss</button>
            </div>
          )}
        </div>
      )}

      <div className="min-h-screen bg-background relative">
        {/* Subtle gradient — not a grid */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Nav — clean, minimal */}
          <nav className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold text-foreground tracking-tight">MedFlow</span>
                <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase">Nexus</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
              <Link to="/architecture" className="hover:text-foreground transition-colors">Architecture</Link>
              <Link to="/api-docs" className="hover:text-foreground transition-colors">API</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDemo(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all">
                <Play className="h-3 w-3" /> Demo
              </button>
              <Link to="/dashboard" className="px-4 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Launch →
              </Link>
            </div>
          </nav>

          {/* Hero — asymmetric, editorial */}
          <section className="px-6 lg:px-10 pt-20 pb-12 max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium text-primary border border-primary/20 bg-primary/5 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Serving 1,264 Government Hospitals
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-5">
                Healthcare intelligence<br />
                <span className="text-primary">for Tamil Nadu</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
                Predict capacity crises before they hit. Optimize every bed, every shift, every ambulance — from state command centers to individual hospital wards.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/dashboard"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  <Globe className="h-4 w-4" /> Regional Command
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/hospital/login"
                  className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  <Hospital className="h-4 w-4" /> My Hospital
                </Link>
                <Link to="/judge-demo"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <Sparkles className="h-3.5 w-3.5" /> Judge Demo Mode
                </Link>
                <Link to="/judge-mode"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Play className="h-3 w-3" /> Quick tour
                </Link>
              </div>
            </div>
          </section>

          {/* Trust strip — horizontal, not pills */}
          <section className="px-6 lg:px-10 pb-8 max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
              {[
                "HIPAA-Ready Architecture",
                "9 Verified Data Sources",
                "7 AI Models Active",
                "< 50ms Inference",
                "IPHS Compliant",
                "Fully Transparent AI",
              ].map(label => (
                <span key={label} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-primary/50" />
                  {label}
                </span>
              ))}
            </div>
          </section>

          {/* Metrics */}
          <AnimatedMetricsStrip />

          {/* Dual Gateway — asymmetric sizing */}
          <section className="px-6 lg:px-10 py-16 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Regional — takes 3 cols */}
              <Link to="/dashboard" className="group md:col-span-3 block">
                <div className="h-full rounded-xl border border-border bg-card/30 p-7 transition-all duration-200 hover:border-primary/30 hover:bg-card/50">
                  <div className="flex items-start justify-between mb-8">
                    <div className="h-10 w-10 rounded-lg bg-primary/8 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">Regional Intelligence Mode</h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-md leading-relaxed">
                    District-wide forecasting, capacity analysis, simulation, and statewide healthcare automation across 38 districts.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["38 Districts", "AI Forecasting", "Crisis Planning", "Digital Twin"].map(tag => (
                      <span key={tag} className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>

              {/* Hospital — takes 2 cols */}
              <Link to="/hospital/login" className="group md:col-span-2 block">
                <div className="h-full rounded-xl border border-border bg-card/30 p-7 transition-all duration-200 hover:border-chart-2/30 hover:bg-card/50">
                  <div className="flex items-start justify-between mb-8">
                    <div className="h-10 w-10 rounded-lg bg-chart-2/8 flex items-center justify-center">
                      <Hospital className="h-5 w-5 text-chart-2" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-chart-2 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">My Hospital Mode</h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    Private hospital intelligence using your own data. Personalized operations center.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Custom Data", "Bed Mgmt", "Staff Ops", "Analytics"].map(tag => (
                      <span key={tag} className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Stakeholders — staggered, not uniform grid */}
          <section className="px-6 lg:px-10 py-16 max-w-6xl mx-auto">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2">Stakeholders</p>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">Who uses MedFlow Nexus</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/50 rounded-xl overflow-hidden border border-border/50">
              {[
                { icon: Globe, title: "State Health Directorates", desc: "Monitor all districts, coordinate crisis response, optimize statewide resources" },
                { icon: Building2, title: "District Collectors", desc: "Local capacity management, emergency preparedness, performance benchmarks" },
                { icon: Hospital, title: "Hospital Administrators", desc: "Private hospital ops, bed management, staff optimization, AI automation" },
                { icon: Users, title: "Doctors & Nurses", desc: "Patient flow visibility, equipment status, shift management, alert feeds" },
              ].map(u => (
                <div key={u.title} className="bg-card/30 p-5 hover:bg-card/50 transition-colors">
                  <u.icon className="h-4 w-4 text-muted-foreground mb-3" />
                  <h4 className="font-medium text-sm text-foreground mb-1 tracking-tight">{u.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Impact — hero metric + supporting */}
          <section className="px-6 lg:px-10 py-16 max-w-6xl mx-auto">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2">Projected Impact</p>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">Measurable outcomes from AI-optimized operations</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { value: "23%", label: "Wait time reduction", icon: HeartPulse, accent: true },
                { value: "18%", label: "Bed turnover improvement", icon: Building2, accent: false },
                { value: "31%", label: "Faster emergency response", icon: Zap, accent: false },
                { value: "15%", label: "Staff burnout reduction", icon: Users, accent: false },
              ].map((metric, i) => (
                <div key={metric.label}
                  className={`rounded-xl border p-5 transition-colors ${
                    metric.accent
                      ? "border-primary/20 bg-primary/[0.04]"
                      : "border-border bg-card/30 hover:bg-card/50"
                  }`}
                >
                  <metric.icon className={`h-4 w-4 mb-3 ${metric.accent ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-3xl font-bold tracking-tight ${metric.accent ? "text-primary" : "text-foreground"}`}>{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Capabilities */}
          <section className="px-6 lg:px-10 py-16 max-w-6xl mx-auto">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2">Capabilities</p>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">Every module backed by transparent data pipelines</h2>
            </div>
            <CapabilityCards />
          </section>

          {/* Architecture — compact table, not cards */}
          <section className="px-6 lg:px-10 py-16 max-w-6xl mx-auto">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2">Stack</p>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">Production architecture</h2>
              </div>
              <Link to="/architecture" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Full details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              {[
                { layer: "Frontend", tech: "TanStack Start · React 19 · Tailwind CSS 4 · Recharts" },
                { layer: "AI Engine", tech: "7 ML Models · ARIMA Forecasting · Gradient Boosting · Rule Engine" },
                { layer: "Data Layer", tech: "PostgreSQL · Redis Cache · Real-time Sync · ETL Pipeline" },
                { layer: "Security", tech: "JWT Auth · Role-Based Access · Audit Logging · Encrypted Secrets" },
              ].map((row, i) => (
                <div key={row.layer} className={`flex items-center gap-6 px-5 py-3.5 ${i < 3 ? "border-b border-border" : ""} bg-card/20 hover:bg-card/40 transition-colors`}>
                  <span className="text-xs font-medium text-foreground w-24 shrink-0">{row.layer}</span>
                  <span className="text-xs text-muted-foreground">{row.tech}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Market — varied layout */}
          <section className="px-6 lg:px-10 py-16 max-w-6xl mx-auto">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2">Opportunity</p>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">Market readiness</h2>
              </div>
              <Link to="/business" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Business plan <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4 sm:col-span-2 lg:col-span-1 rounded-xl border border-primary/20 bg-primary/[0.04] p-5">
                <p className="text-3xl font-bold text-primary tracking-tight">$4.2B</p>
                <p className="text-xs text-muted-foreground mt-1">India Healthcare IT Market</p>
                <p className="text-[10px] text-primary/60 mt-0.5">Growing 18% CAGR</p>
              </div>
              {[
                { value: "1,264", label: "TN Govt Hospitals", sub: "Immediate addressable" },
                { value: "₹2.4Cr", label: "Cost Savings / Hospital", sub: "Annual efficiency gains" },
                { value: "23,000+", label: "Govt Hospitals in India", sub: "National expansion" },
              ].map(m => (
                <div key={m.label} className="rounded-xl border border-border bg-card/30 p-5 hover:bg-card/50 transition-colors">
                  <p className="text-2xl font-bold text-foreground tracking-tight">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="px-6 lg:px-10 py-20 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-3">
              Ready to transform hospital operations?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
              Built for Tamil Nadu's healthcare network. Scalable to any state, any country.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
                Enter Command Center <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/hospital/login"
                className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-accent transition-colors">
                <Hospital className="h-4 w-4" /> My Hospital
              </Link>
            </div>
            <button
              onClick={handleActivate}
              disabled={activating}
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Rocket className="h-4 w-4" /> Deploy MedFlow Nexus
            </button>
          </section>

          {/* Footer — clean, editorial */}
          <footer className="border-t border-border/30 px-6 lg:px-10 py-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">Product</h4>
                  <div className="space-y-2">
                    <Link to="/dashboard" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Regional Mode</Link>
                    <Link to="/hospital/login" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">My Hospital</Link>
                    <Link to="/pricing" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">Company</h4>
                  <div className="space-y-2">
                    <Link to="/about" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">About</Link>
                    <Link to="/contact" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Contact Sales</Link>
                    <span className="block text-[13px] text-muted-foreground/50">Careers</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">Resources</h4>
                  <div className="space-y-2">
                    <Link to="/security" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Security</Link>
                    <Link to="/api-docs" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">API Docs</Link>
                    <Link to="/architecture" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">Architecture</Link>
                    <Link to="/devops" className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">DevOps</Link>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">Data Sources</h4>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                    HMIS India · NHP · TNHSP · DME Tamil Nadu · NVBDCP · IDSP · IMD · MoRTH · Census 2011
                  </p>
                </div>
              </div>
              <div className="border-t border-border/20 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground/50">
                  MedFlow Nexus — Built for Tamil Nadu Directorate of Medical & Rural Health Services
                </p>
                <p className="text-[10px] text-muted-foreground/30">
                  Prototype · Public datasets + modeled operational data
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
