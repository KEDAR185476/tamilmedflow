import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Play, MapPin, Hospital, Database, Brain, Zap, BarChart3, FileCheck, TrendingUp, Rocket, CheckCircle, Activity, X } from "lucide-react";

export const Route = createFileRoute("/judge-mode")({
  head: () => ({
    meta: [
      { title: "Judge Mode — MedFlow Nexus Live Demo" },
      { name: "description", content: "Guided 8-scene demonstration of MedFlow Nexus capabilities." },
    ],
  }),
  component: JudgeModePage,
});

interface Scene {
  title: string;
  subtitle: string;
  icon: typeof MapPin;
  color: string;
  details: string[];
  linkLabel: string;
  linkTo: string;
}

const scenes: Scene[] = [
  { title: "Tamil Nadu Under Stress", subtitle: "38 districts, 45,000+ beds, monsoon surge approaching", icon: MapPin, color: "text-red-400",
    details: ["Real-time district occupancy map active", "Disease risk scores rising in 12 districts", "Accident corridors on NH-44 flagged", "ICU load crossing 85% in 6 districts"],
    linkLabel: "View Regional Dashboard", linkTo: "/dashboard" },
  { title: "Hospital Logs In", subtitle: "Private hospital accesses secure workspace", icon: Hospital, color: "text-blue-400",
    details: ["Multi-tenant auth with role-based access", "Isolated data environment — zero cross-tenant leakage", "Onboarding wizard captures hospital profile", "Dashboard personalised for 200-bed facility"],
    linkLabel: "Try Hospital Login", linkTo: "/hospital/login" },
  { title: "Own Data Loaded", subtitle: "Hospital inputs real operational numbers", icon: Database, color: "text-green-400",
    details: ["Bed capacity, staff counts, equipment status entered", "Live ops: 152 occupied, 38 vacant, 6 cleaning", "Historical snapshots auto-generated", "All data scoped by tenant ID"],
    linkLabel: "View Data Center", linkTo: "/hospital/data" },
  { title: "AI Predicts Overload", subtitle: "Models detect approaching capacity crisis", icon: Brain, color: "text-amber-400",
    details: ["Admission forecast: +22% in next 48h", "ICU surge probability: 34%", "Staff burnout risk: HIGH in night shift", "Discharge bottleneck: 12 patients delayed"],
    linkLabel: "View AI Dashboard", linkTo: "/hospital" },
  { title: "Automation Activates", subtitle: "Rules engine triggers corrective actions", icon: Zap, color: "text-purple-400",
    details: ["14 automation rules evaluated", "Bed allocation optimised — 8 freed", "Staff redistribution triggered", "Equipment reallocation completed"],
    linkLabel: "View Automation", linkTo: "/hospital/automation" },
  { title: "Simulation Proves Gains", subtitle: "What-if analysis validates approach", icon: BarChart3, color: "text-cyan-400",
    details: ["Monsoon surge scenario simulated", "Without MedFlow: 96% peak occupancy", "With MedFlow: 82% peak occupancy", "14% improvement demonstrated"],
    linkLabel: "View Simulation", linkTo: "/dashboard/simulation" },
  { title: "Reports Exported", subtitle: "Executive summaries ready for stakeholders", icon: FileCheck, color: "text-emerald-400",
    details: ["PDF executive report generated", "CSV data export available", "Audit trail complete", "Compliance documentation ready"],
    linkLabel: "View Reports", linkTo: "/hospital/reports" },
  { title: "Business Scalability", subtitle: "Platform ready for 1,000+ hospitals", icon: TrendingUp, color: "text-pink-400",
    details: ["Multi-tenant architecture proven", "Edge-deployed for global latency", "AI models retrain per-tenant", "Revenue: SaaS + Enterprise + Government"],
    linkLabel: "View Business Plan", linkTo: "/business" },
];

function JudgeModePage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const navigate = useNavigate();

  const scene = scenes[currentScene];
  const progress = ((currentScene + 1) / scenes.length) * 100;

  const handleDeploy = useCallback(() => {
    setDeploying(true);
    setTimeout(() => { setDeploying(false); setDeployed(true); }, 3500);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Deploy Overlay */}
      {(deploying || deployed) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
          {deploying ? (
            <div className="text-center animate-fade-in">
              <div className="relative mx-auto mb-8">
                <div className="h-24 w-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
                <Rocket className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-2xl font-bold neon-text mb-2">Deploying MedFlow Nexus</h2>
              <p className="text-sm text-muted-foreground">Services starting · Models loading · Health checks passing</p>
            </div>
          ) : (
            <div className="text-center animate-fade-in max-w-lg px-6">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold neon-text mb-3">MedFlow Nexus Ready</h2>
              <div className="grid grid-cols-2 gap-3 my-8">
                {[
                  { label: "Technically Scalable", icon: Activity },
                  { label: "AI Powered", icon: Brain },
                  { label: "Multi-Market Fit", icon: TrendingUp },
                  { label: "Hospital Ready", icon: Hospital },
                ].map(b => (
                  <div key={b.label} className="glass-card p-3 border border-green-500/30 flex items-center gap-2 text-xs">
                    <b.icon className="h-4 w-4 text-green-400" />
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-6">All systems operational · AI engines active · Multi-tenant ready</p>
              <button onClick={() => setDeployed(false)} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Continue Exploring
              </button>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Exit
          </Link>
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Judge Mode</span>
            <span className="text-xs text-muted-foreground">Scene {currentScene + 1}/{scenes.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-muted mb-10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Scene Card */}
        <div className="glass-card p-8 border border-border/50 mb-8 animate-fade-in" key={currentScene}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center ${scene.color}`}>
              <scene.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Scene {currentScene + 1}</div>
              <h2 className="text-xl font-bold">{scene.title}</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{scene.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {scene.details.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>

          <Link to={scene.linkTo as any} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
            {scene.linkLabel} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScene(s => Math.max(0, s - 1))}
            disabled={currentScene === 0}
            className="px-4 py-2 rounded-lg glass-card border border-border/50 text-sm disabled:opacity-30 hover:border-primary/50 transition-colors"
          >
            ← Previous
          </button>

          {currentScene === scenes.length - 1 ? (
            <button
              onClick={handleDeploy}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 neon-glow"
            >
              <Rocket className="h-4 w-4" /> DEPLOY MEDFLOW NEXUS
            </button>
          ) : (
            <button
              onClick={() => setCurrentScene(s => Math.min(scenes.length - 1, s + 1))}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Next Scene →
            </button>
          )}
        </div>

        {/* Scene dots */}
        <div className="flex justify-center gap-2 mt-8">
          {scenes.map((_, i) => (
            <button key={i} onClick={() => setCurrentScene(i)} className={`h-2 rounded-full transition-all ${i === currentScene ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
