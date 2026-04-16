import { createFileRoute } from "@tanstack/react-router";
import { WireframeZone } from "@/components/layout/WireframeZone";
import { FlaskConical, SlidersHorizontal, BarChart3, Layers } from "lucide-react";

export const Route = createFileRoute("/dashboard/simulation")({
  component: SimulationPage,
});

function SimulationPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Simulation Lab</h1>
        <p className="text-sm text-muted-foreground">Digital twin simulations and what-if scenario modeling</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Parameter Controls" subtitle="Adjust patient surge, staff levels, bed count" icon={<SlidersHorizontal className="h-8 w-8" />} minHeight="300px" />
        <WireframeZone title="Simulation Output" subtitle="Monte Carlo results, confidence bands" icon={<BarChart3 className="h-8 w-8" />} minHeight="300px" />
      </div>
      <WireframeZone title="Scenario Cards" subtitle="Pre-built scenarios: Pandemic Wave, New Hospital, Monsoon Surge, Staff Reallocation" icon={<Layers className="h-8 w-8" />} minHeight="220px" />
    </div>
  );
}
