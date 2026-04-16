import { createFileRoute } from "@tanstack/react-router";
import { WireframeZone } from "@/components/layout/WireframeZone";
import { AlertTriangle, Map, Truck, Radio } from "lucide-react";

export const Route = createFileRoute("/dashboard/emergency")({
  component: EmergencyPage,
});

function EmergencyPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
          Emergency Mode
        </h1>
        <p className="text-sm text-muted-foreground">Surge protocol activation and real-time emergency dispatch</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Active Alert Panel" subtitle="Severity levels • Monsoon / Accident / Epidemic" icon={<AlertTriangle className="h-8 w-8" />} minHeight="300px" className="border-destructive/30" />
        <WireframeZone title="Surge Map — NH Corridors" subtitle="Chennai-Trichy, Salem-Coimbatore accident hotspots" icon={<Map className="h-8 w-8" />} minHeight="300px" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Resource Dispatch Console" subtitle="Ambulance, blood bank, ventilator routing" icon={<Truck className="h-8 w-8" />} minHeight="260px" />
        <WireframeZone title="Communication Hub" subtitle="Inter-hospital comms, DM office alerts" icon={<Radio className="h-8 w-8" />} minHeight="260px" />
      </div>
    </div>
  );
}
