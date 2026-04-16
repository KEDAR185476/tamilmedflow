import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, ArrowRight, Building2, Hospital, Globe, Shield } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — MedFlow Nexus" },
      { name: "description", content: "Flexible plans for hospitals, networks, and government healthcare systems." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Starter Hospital",
    price: "₹15,000",
    period: "/month",
    desc: "For individual hospitals getting started with AI operations",
    color: "text-primary",
    features: ["Single hospital workspace", "Bed & capacity intelligence", "Staff management", "Equipment tracking", "Basic AI recommendations", "CSV import/export", "Email support"],
  },
  {
    name: "Growth Network",
    price: "₹45,000",
    period: "/month",
    desc: "For hospital chains and multi-facility networks",
    color: "text-chart-2",
    popular: true,
    features: ["Up to 10 hospitals", "All Starter features", "Cross-facility analytics", "Automation engine", "Continuous learning AI", "Historical trend analysis", "Priority support", "Custom branding"],
  },
  {
    name: "Enterprise Chain",
    price: "₹1,20,000",
    period: "/month",
    desc: "For large hospital groups with advanced needs",
    color: "text-chart-3",
    features: ["Unlimited hospitals", "All Growth features", "Digital twin simulation", "Custom AI model training", "API access", "SSO & advanced RBAC", "Dedicated account manager", "SLA guarantee"],
  },
  {
    name: "Government Command",
    price: "Custom",
    period: "",
    desc: "For state and national healthcare directorates",
    color: "text-chart-5",
    features: ["Full regional intelligence", "38-district monitoring", "Crisis command center", "Legislative compliance", "Tender-ready documentation", "On-premise option", "Government SLA", "Training & onboarding"],
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Choose the plan that fits your healthcare organization. All plans include a 14-day free trial.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {plans.map(plan => (
            <div key={plan.name} className={`glass rounded-2xl p-6 flex flex-col relative ${plan.popular ? "neon-border" : "border border-border/30"}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
              )}
              <h3 className={`text-lg font-bold ${plan.color}`}>{plan.name}</h3>
              <div className="mt-3 mb-2">
                <span className="text-3xl font-black text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{plan.desc}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${plan.popular ? "bg-primary text-primary-foreground hover:glow-md" : "glass hover:neon-border"}`}>
                {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
              </button>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Need a custom solution?</h2>
          <p className="text-sm text-muted-foreground mb-4">We work with healthcare organizations of all sizes. Let's discuss your needs.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:glow-md transition-all">
            Contact Sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
