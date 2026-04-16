import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { generateRecommendations, type Recommendation } from "@/services/recommendationEngine";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { Lightbulb, AlertTriangle, ArrowRight, Shield, Users, Wrench, BedDouble, Clock, Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard/recommendations")({
  component: RecommendationCenter,
});

function RecommendationCenter() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const recommendations = generateRecommendations(selectedDistrict);

  const critical = recommendations.filter(r => r.urgency === "critical");
  const high = recommendations.filter(r => r.urgency === "high");
  const medium = recommendations.filter(r => r.urgency === "medium");
  const low = recommendations.filter(r => r.urgency === "low");

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            AI Recommendation Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Explainable actions for {districtName} — every recommendation is traceable
          </p>
        </div>
        <DistrictSelector />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <UrgencyCard label="Critical" count={critical.length} color="destructive" />
        <UrgencyCard label="High" count={high.length} color="warning" />
        <UrgencyCard label="Medium" count={medium.length} color="primary" />
        <UrgencyCard label="Low" count={low.length} color="success" />
      </div>

      {/* Critical */}
      {critical.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Critical Actions ({critical.length})
          </h2>
          <div className="space-y-3">
            {critical.map(r => <RecommendationCard key={r.id} rec={r} />)}
          </div>
        </div>
      )}

      {/* High */}
      {high.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-warning mb-2">High Priority ({high.length})</h2>
          <div className="space-y-3">
            {high.map(r => <RecommendationCard key={r.id} rec={r} />)}
          </div>
        </div>
      )}

      {/* Medium */}
      {medium.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-primary mb-2">Medium Priority ({medium.length})</h2>
          <div className="space-y-3">
            {medium.map(r => <RecommendationCard key={r.id} rec={r} />)}
          </div>
        </div>
      )}

      {/* Low */}
      {low.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-success mb-2">Low Priority ({low.length})</h2>
          <div className="space-y-3">
            {low.map(r => <RecommendationCard key={r.id} rec={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}

const categoryIcons: Record<string, React.ReactNode> = {
  capacity: <BedDouble className="h-4 w-4" />,
  workforce: <Users className="h-4 w-4" />,
  equipment: <Wrench className="h-4 w-4" />,
  emergency: <AlertTriangle className="h-4 w-4" />,
  discharge: <Clock className="h-4 w-4" />,
  general: <Activity className="h-4 w-4" />,
};

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const urgencyStyles = {
    critical: "border-destructive/50 bg-destructive/5",
    high: "border-warning/30 bg-warning/5",
    medium: "border-primary/20",
    low: "border-success/20",
  };

  return (
    <GlassCard className={`p-4 border ${urgencyStyles[rec.urgency]}`}>
      <div className="flex items-start gap-3">
        <div className="text-primary mt-0.5">{categoryIcons[rec.category]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{rec.action}</h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
              rec.urgency === "critical" ? "bg-destructive/20 text-destructive" :
              rec.urgency === "high" ? "bg-warning/20 text-warning" :
              rec.urgency === "medium" ? "bg-primary/20 text-primary" :
              "bg-success/20 text-success"
            }`}>
              {rec.urgency.toUpperCase()}
            </span>
            <span className="text-[9px] glass rounded px-1.5 py-0.5 text-muted-foreground">{rec.category}</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground shrink-0 w-16">Reason:</span>
              <span className="text-foreground">{rec.reason}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground shrink-0 w-16">Impact:</span>
              <span className="text-foreground flex items-center gap-1">
                <ArrowRight className="h-3 w-3 text-primary" /> {rec.expectedImpact}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3 inline mr-0.5" />
                Confidence: {rec.confidence}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                Source: {rec.modelSource}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function UrgencyCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colorClass = color === "destructive" ? "text-destructive" : color === "warning" ? "text-warning" : color === "success" ? "text-success" : "text-primary";
  return (
    <GlassCard className="p-3 text-center">
      <div className={`text-2xl font-bold ${colorClass}`}>{count}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </GlassCard>
  );
}
