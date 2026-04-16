import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Lock, Eye, Database, Users, FileCheck, Server, CheckCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Compliance — MedFlow Nexus" },
      { name: "description", content: "Enterprise-grade security architecture for healthcare data protection." },
    ],
  }),
  component: SecurityPage,
});

const badges = [
  { icon: Lock, title: "Multi-Tenant Isolation", desc: "Each hospital's data is cryptographically scoped by tenant ID. No cross-tenant data leakage is architecturally possible." },
  { icon: Users, title: "Role-Based Access Control", desc: "Granular permissions — Super Admin, Admin, Doctor, Nurse, Operator, Viewer. Every action is permission-gated." },
  { icon: Eye, title: "Explainable AI", desc: "Every recommendation shows its reasoning, confidence score, data source, and model version. No black-box decisions." },
  { icon: FileCheck, title: "Audit Logging", desc: "Complete trail of who changed what, when, and why. Immutable logs for compliance reviews." },
  { icon: Database, title: "Secure Data Separation", desc: "Regional intelligence and hospital-specific data never mix. Clear architectural boundaries between modes." },
  { icon: Server, title: "Scalable Cloud Architecture", desc: "Production-ready infrastructure with PostgreSQL, Redis caching, and edge deployment. Designed for 10,000+ concurrent users." },
];

function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center glow-sm">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Security & Compliance</h1>
            <p className="text-sm text-muted-foreground">Enterprise-grade protection for healthcare data</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mb-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            MedFlow Nexus is built with healthcare-grade security from day one. Our architecture follows HIPAA-ready patterns,
            IPHS compliance requirements, and modern zero-trust principles. Every layer — from data storage to AI inference — is
            designed for auditability, transparency, and patient data protection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {badges.map(b => (
            <div key={b.title} className="glass rounded-xl p-6 hover:neon-border transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Compliance Readiness</h2>
          <p className="text-sm text-muted-foreground mb-6">Architecture validated against key healthcare standards</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["HIPAA Ready", "IPHS Compliant", "NABH Framework", "ISO 27001 Patterns", "GDPR Aligned", "SOC 2 Architecture"].map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 glass rounded-full px-4 py-2 text-xs font-medium text-primary">
                <CheckCircle className="h-3 w-3" /> {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
