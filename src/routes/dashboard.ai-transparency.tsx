import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { AI_MODELS, type AIModelDefinition } from "@/data/ai-models";
import { DATA_SOURCES } from "@/data/source-registry";
import { Brain, Eye, Database, CheckCircle, AlertTriangle, Clock, FlaskConical, Cpu } from "lucide-react";

export const Route = createFileRoute("/dashboard/ai-transparency")({
  component: AITransparencyLab,
});

function AITransparencyLab() {
  const activeModels = AI_MODELS.filter(m => m.status === "active");
  const experimentalModels = AI_MODELS.filter(m => m.status === "experimental");
  const placeholderModels = AI_MODELS.filter(m => m.status === "placeholder");

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          AI Transparency Lab
        </h1>
        <p className="text-sm text-muted-foreground">
          Full visibility into every AI model — architecture, training data, accuracy, and explainability
        </p>
      </div>

      {/* Honesty banner */}
      <div className="neon-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">🔍 Transparency Commitment</h3>
        <p className="text-xs text-muted-foreground">
          MedFlow Nexus uses <strong>no black-box AI</strong>. Every prediction shows its input data, model type, confidence score,
          and reasoning. Prototype currently uses rule-based engines with public datasets. Production would deploy trained ML models
          with hospital-partner EHR data. All synthetic/modeled data is explicitly labeled.
        </p>
      </div>

      {/* Model summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Brain className="h-4 w-4" />} label="Active Models" value={activeModels.length} />
        <StatCard icon={<FlaskConical className="h-4 w-4" />} label="Experimental" value={experimentalModels.length} />
        <StatCard icon={<Cpu className="h-4 w-4" />} label="Placeholder" value={placeholderModels.length} />
        <StatCard icon={<Database className="h-4 w-4" />} label="Data Sources" value={DATA_SOURCES.length} />
      </div>

      {/* Active Models */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" /> Active Models
        </h2>
        <div className="space-y-4">
          {activeModels.map(m => <ModelCard key={m.id} model={m} />)}
        </div>
      </div>

      {/* Experimental */}
      {experimentalModels.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" /> Experimental Models
          </h2>
          <div className="space-y-4">
            {experimentalModels.map(m => <ModelCard key={m.id} model={m} />)}
          </div>
        </div>
      )}

      {/* Placeholder */}
      {placeholderModels.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" /> Placeholder / Future
          </h2>
          <div className="space-y-4">
            {placeholderModels.map(m => <ModelCard key={m.id} model={m} />)}
          </div>
        </div>
      )}

      {/* Training Data Sources */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" /> Training Data Sources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DATA_SOURCES.map(src => (
            <GlassCard key={src.id} className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{src.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  src.sourceType === "government" ? "bg-success/20 text-success" :
                  src.sourceType === "state" ? "bg-primary/20 text-primary" :
                  src.sourceType === "simulated" ? "bg-warning/20 text-warning" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {src.sourceType}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">{src.description.slice(0, 120)}...</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Updated: {src.lastUpdated}</span>
                <span>Reliability: {"★".repeat(src.reliabilityScore)}{"☆".repeat(5 - src.reliabilityScore)}</span>
              </div>
              {src.officialUrl && (
                <a href={src.officialUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline mt-1 block">
                  {src.officialUrl}
                </a>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelCard({ model }: { model: AIModelDefinition }) {
  const statusColor = model.status === "active" ? "text-success" : model.status === "experimental" ? "text-warning" : "text-muted-foreground";
  const typeColors: Record<string, string> = {
    "XGBoost": "bg-chart-1/20 text-chart-1",
    "Prophet": "bg-chart-2/20 text-chart-2",
    "LSTM": "bg-chart-4/20 text-chart-4",
    "Rule-Based": "bg-chart-3/20 text-chart-3",
    "Constraint-Logic": "bg-primary/20 text-primary",
    "RL-Placeholder": "bg-muted text-muted-foreground",
  };

  return (
    <GlassCard className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">{model.name}</h3>
          <p className="text-[10px] text-muted-foreground">{model.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[model.modelType] ?? "bg-muted text-muted-foreground"}`}>
            {model.modelType}
          </span>
          <span className={`text-[10px] ${statusColor}`}>v{model.version}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <MiniStat label="Accuracy" value={model.accuracyEstimate > 0 ? `${model.accuracyEstimate}%` : "N/A"} />
        <MiniStat label="Confidence" value={model.confidenceLevel} />
        <MiniStat label="Sample Rows" value={model.sampleRowCount > 0 ? model.sampleRowCount.toLocaleString() : "N/A"} />
        <MiniStat label="Last Trained" value={model.lastTrainedDate} />
      </div>

      {/* Features */}
      <div className="mb-2">
        <p className="text-[10px] text-muted-foreground font-medium mb-1">Input Features ({model.features.length}):</p>
        <div className="flex flex-wrap gap-1">
          {model.features.map(f => (
            <span key={f} className="text-[9px] glass rounded px-1.5 py-0.5 text-muted-foreground">{f}</span>
          ))}
        </div>
      </div>

      {/* Training data sources */}
      <div className="mb-2">
        <p className="text-[10px] text-muted-foreground font-medium mb-1">Training Data Sources:</p>
        <ul className="space-y-0.5">
          {model.trainingDataSources.map((s, i) => (
            <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
              <span className="text-primary">•</span> {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Explainability */}
      <details>
        <summary className="text-[10px] text-primary cursor-pointer hover:underline">Explainability Notes</summary>
        <p className="text-[10px] text-muted-foreground mt-1 glass rounded p-2">{model.explainabilityNotes}</p>
      </details>
    </GlassCard>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <GlassCard className="p-3 text-center">
      <div className="flex justify-center mb-1 text-primary">{icon}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </GlassCard>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded p-2 text-center">
      <div className="text-xs font-semibold text-foreground">{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </div>
  );
}
