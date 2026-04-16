import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Hospital, Globe, Users, TrendingUp, CheckCircle, Zap, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Business Readiness — MedFlow Nexus" },
      { name: "description", content: "Market fit, revenue models, and customer segments for MedFlow Nexus." },
    ],
  }),
  component: BusinessPage,
});

const customers = [
  { icon: Hospital, title: "Private Hospitals", desc: "Single hospitals seeking operational automation, AI dashboards, and real-time bed management.", tam: "12,000+ hospitals" },
  { icon: Building2, title: "Hospital Chains", desc: "Multi-location networks needing centralized analytics, cross-facility optimization, and unified reporting.", tam: "500+ chains" },
  { icon: Globe, title: "Government Networks", desc: "State health departments monitoring district-level capacity, disease patterns, and emergency readiness.", tam: "36 states/UTs" },
  { icon: Users, title: "Smart Cities", desc: "Urban governance platforms integrating healthcare intelligence into smart city dashboards.", tam: "100+ smart cities" },
];

const revenue = [
  { plan: "SaaS Subscription", desc: "Monthly/annual per-hospital licensing with tiered feature access", range: "₹15K–₹2L/month" },
  { plan: "Enterprise Contracts", desc: "Custom deployment for hospital chains with SLA guarantees and dedicated support", range: "₹25L–₹1Cr/year" },
  { plan: "Government Licensing", desc: "State-wide deployment contracts with training, support, and data integration", range: "₹50L–₹5Cr/year" },
  { plan: "Analytics Add-ons", desc: "Premium AI modules — advanced forecasting, simulation lab, learning engine", range: "₹5K–₹50K/month" },
];

const metrics = [
  { label: "Total Addressable Market", value: "₹8,500 Cr", sub: "India healthcare IT" },
  { label: "Serviceable Market", value: "₹1,200 Cr", sub: "Tamil Nadu + South India" },
  { label: "Year 1 Target", value: "₹2.4 Cr", sub: "50 hospitals" },
  { label: "Year 3 Projection", value: "₹18 Cr", sub: "500 hospitals + 2 state contracts" },
];

function BusinessPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold neon-text">Business Readiness</h1>
        </div>
        <p className="text-muted-foreground mb-12">Multi-market fit with clear revenue paths and scalable customer segments</p>

        {/* Market Metrics */}
        <section className="mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="glass-card p-4 border border-border/50 text-center">
                <div className="text-xl font-bold text-primary">{m.value}</div>
                <div className="text-xs font-medium mt-1">{m.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Segments */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Customer Segments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customers.map(c => (
              <div key={c.title} className="glass-card p-5 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <c.icon className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">{c.title}</div>
                    <div className="text-[10px] text-primary/70">{c.tam}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Revenue Models */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Revenue Models</h2>
          <div className="space-y-3">
            {revenue.map(r => (
              <div key={r.plan} className="glass-card p-4 border border-border/50 flex items-center gap-4">
                <Zap className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{r.plan}</div>
                  <div className="text-xs text-muted-foreground">{r.desc}</div>
                </div>
                <span className="text-xs text-primary font-medium whitespace-nowrap">{r.range}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Competitive Advantages */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Competitive Advantages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Dual-mode: Regional + Hospital in one platform",
              "India-first with Tamil Nadu deep context",
              "Explainable AI — no black-box decisions",
              "Self-improving — learns from hospital usage",
              "No-code automation rules engine",
              "Production-grade multi-tenant architecture",
            ].map(adv => (
              <div key={adv} className="glass-card p-3 border border-border/50 flex items-center gap-2 text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
