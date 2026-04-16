import { createFileRoute } from "@tanstack/react-router";
import { WireframeZone } from "@/components/layout/WireframeZone";
import { Wrench, Clock, BarChart3, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard/equipment")({
  component: EquipmentPage,
});

function EquipmentPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipment Intelligence</h1>
        <p className="text-sm text-muted-foreground">Device tracking, maintenance scheduling, and utilization analytics</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Device Inventory List" subtitle="Ventilators, CT/MRI, monitors • Status tracking" icon={<Wrench className="h-8 w-8" />} minHeight="300px" />
        <WireframeZone title="Maintenance Timeline" subtitle="Preventive & corrective schedules" icon={<Clock className="h-8 w-8" />} minHeight="300px" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Utilization Analytics" subtitle="Usage hours vs capacity per device type" icon={<BarChart3 className="h-8 w-8" />} minHeight="260px" />
        <WireframeZone title="Failure Prediction" subtitle="ML-based predictive maintenance alerts" icon={<AlertTriangle className="h-8 w-8" />} minHeight="260px" />
      </div>
    </div>
  );
}
