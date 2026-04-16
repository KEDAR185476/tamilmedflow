import { createFileRoute } from "@tanstack/react-router";
import { DATA_SOURCES } from "@/data/source-registry";
import { GlassCard } from "@/components/layout/GlassCard";
import { Database, ExternalLink, Star } from "lucide-react";

export const Route = createFileRoute("/dashboard/data-transparency")({
  component: DataTransparencyPage,
});

function DataTransparencyPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          Data Transparency Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Every dataset used in MedFlow Nexus is documented here with source, reliability, and usage.
        </p>
      </div>

      <div className="grid gap-4">
        {DATA_SOURCES.map(source => (
          <GlassCard key={source.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold text-foreground">{source.name}</h3>
                  <StatusBadge status={source.status} />
                  <TypeBadge type={source.sourceType} />
                </div>
                <p className="text-sm text-muted-foreground mb-3">{source.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Usage: </span>
                    <span className="text-foreground">{source.usageInPlatform}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated: </span>
                    <span className="text-foreground">{source.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < source.reliabilityScore ? "text-warning fill-warning" : "text-muted-foreground/30"}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">Reliability</span>
                </div>
                {source.officialUrl && (
                  <a
                    href={source.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Official Source
                  </a>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    live: "bg-success/20 text-success",
    static: "bg-primary/20 text-primary",
    processed: "bg-warning/20 text-warning",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    government: "bg-primary/10 text-primary",
    state: "bg-chart-2/20 text-chart-2",
    derived: "bg-warning/10 text-warning",
    simulated: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[type] ?? "bg-muted text-muted-foreground"}`}>
      {type}
    </span>
  );
}
