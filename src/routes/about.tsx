import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Target, Heart, Globe, Lightbulb, Users, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MedFlow Nexus" },
      { name: "description", content: "MedFlow Nexus — AI-powered healthcare intelligence for Tamil Nadu and beyond." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-3">About MedFlow Nexus</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
          We're building the central nervous system for healthcare operations — starting with Tamil Nadu's 1,264 government hospitals.
        </p>

        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Our Mission</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every year, thousands of patients in India face preventable delays — overcrowded wards, understaffed ERs,
            idle equipment in one hospital while another runs short. MedFlow Nexus exists to solve this systemic inefficiency
            using AI-powered predictive intelligence, transparent automation, and hospital-specific continuous learning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Globe, title: "Regional Intelligence", desc: "State-wide visibility across 38 districts with real-time capacity, workforce, and emergency monitoring." },
            { icon: Heart, title: "Hospital Automation", desc: "Each hospital gets its own AI-powered operations center that learns and improves from its own data." },
            { icon: Lightbulb, title: "Explainable AI", desc: "Every recommendation shows why it was made, what data backs it, and its confidence level. No black boxes." },
            { icon: Users, title: "Built for Everyone", desc: "From government health directors to ward nurses — role-based access ensures the right tools for every user." },
          ].map(c => (
            <div key={c.title} className="glass rounded-xl p-6">
              <c.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { layer: "Frontend", items: ["React 19", "TanStack Start", "Tailwind CSS 4", "Recharts"] },
              { layer: "AI Engine", items: ["7 ML Models", "ARIMA Forecasting", "Gradient Boosting", "Rule Engine"] },
              { layer: "Data", items: ["9 Public Datasets", "PostgreSQL", "Real-time Sync", "ETL Pipeline"] },
              { layer: "Security", items: ["JWT Auth", "RBAC", "Audit Logs", "Tenant Isolation"] },
            ].map(col => (
              <div key={col.layer}>
                <h4 className="text-xs font-semibold text-primary mb-2">{col.layer}</h4>
                {col.items.map(i => <p key={i} className="text-xs text-muted-foreground py-1">{i}</p>)}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center glass rounded-2xl p-8">
          <p className="text-sm text-muted-foreground mb-4">Interested in partnering or deploying MedFlow Nexus?</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:glow-md transition-all">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
