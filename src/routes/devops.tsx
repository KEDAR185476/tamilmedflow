import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GitBranch, CheckCircle, ArrowRight, Server, Shield, Rocket, Clock, Activity, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/devops")({
  head: () => ({
    meta: [
      { title: "DevOps & Deployment — MedFlow Nexus" },
      { name: "description", content: "CI/CD pipeline, deployment environments, and infrastructure readiness." },
    ],
  }),
  component: DevOpsPage,
});

const pipelineSteps = [
  { label: "Git Push", icon: GitBranch, status: "complete", time: "0s" },
  { label: "Lint & Type Check", icon: CheckCircle, status: "complete", time: "12s" },
  { label: "Unit Tests", icon: CheckCircle, status: "complete", time: "28s" },
  { label: "Build", icon: Server, status: "complete", time: "45s" },
  { label: "Integration Tests", icon: CheckCircle, status: "complete", time: "1m 12s" },
  { label: "Security Scan", icon: Shield, status: "complete", time: "34s" },
  { label: "Deploy", icon: Rocket, status: "complete", time: "22s" },
  { label: "Health Check", icon: Activity, status: "complete", time: "8s" },
];

const environments = [
  { name: "Development", status: "active", version: "v3.8.2-dev", url: "dev.medflownexus.com", color: "text-blue-400" },
  { name: "Staging", status: "active", version: "v3.8.1", url: "staging.medflownexus.com", color: "text-amber-400" },
  { name: "Production", status: "active", version: "v3.8.0", url: "medflownexus.com", color: "text-green-400" },
];

function DevOpsPage() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => Math.min(s + 1, pipelineSteps.length)), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold neon-text">DevOps & Deployment</h1>
        </div>
        <p className="text-muted-foreground mb-12">Automated CI/CD pipeline with zero-downtime deployments</p>

        {/* CI/CD Pipeline */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">CI/CD Pipeline</h2>
          <div className="space-y-2">
            {pipelineSteps.map((step, i) => (
              <div key={step.label} className={`glass-card p-3 border transition-all duration-500 flex items-center gap-3 ${i < activeStep ? "border-green-500/30 opacity-100" : "border-border/30 opacity-40"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${i < activeStep ? "bg-green-500/20" : "bg-muted/50"}`}>
                  <step.icon className={`h-4 w-4 ${i < activeStep ? "text-green-400" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{step.label}</div>
                </div>
                <span className="text-xs text-muted-foreground">{step.time}</span>
                {i < activeStep && <CheckCircle className="h-4 w-4 text-green-400" />}
                {i < pipelineSteps.length - 1 && i < activeStep && <ArrowRight className="h-3 w-3 text-muted-foreground hidden sm:block" />}
              </div>
            ))}
          </div>
          {activeStep >= pipelineSteps.length && (
            <div className="mt-4 glass-card p-4 border border-green-500/30 bg-green-500/5 text-center animate-fade-in">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-green-400">Pipeline Complete — Total: 2m 41s</div>
            </div>
          )}
        </section>

        {/* Environments */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Environments</h2>
          <div className="grid gap-3">
            {environments.map(env => (
              <div key={env.name} className="glass-card p-4 border border-border/50 flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full bg-green-400 animate-pulse`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${env.color}`}>{env.name}</div>
                  <div className="text-xs text-muted-foreground">{env.url}</div>
                </div>
                <code className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">{env.version}</code>
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-medium">ACTIVE</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cloud Readiness */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Infrastructure Readiness</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              "Auto-Scaling", "Load Balancing", "CDN Caching", "SSL/TLS", "DDoS Protection", "Automated Backups",
              "Multi-Region", "Container Orchestration", "Zero-Downtime Deploy", "Rollback Ready", "Log Aggregation", "Alerting",
            ].map(badge => (
              <div key={badge} className="glass-card p-3 border border-border/50 flex items-center gap-2 text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
