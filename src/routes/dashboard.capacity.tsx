import { createFileRoute } from "@tanstack/react-router";
import { WireframeZone } from "@/components/layout/WireframeZone";
import { BedDouble, BarChart3, Brain, Map } from "lucide-react";

export const Route = createFileRoute("/dashboard/capacity")({
  component: CapacityPage,
});

function CapacityPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Capacity Intelligence</h1>
        <p className="text-sm text-muted-foreground">Real-time bed management across Tamil Nadu government hospitals</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Bed Grid — District-wise Occupancy" subtitle="38 districts • Color-coded by load level" icon={<BedDouble className="h-8 w-8" />} minHeight="300px" />
        <WireframeZone title="Occupancy Trend Chart" subtitle="7-day trend • HMIS data source" icon={<BarChart3 className="h-8 w-8" />} minHeight="300px" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="AI Bed Demand Prediction" subtitle="Prophet + LSTM model • 72-hour forecast" icon={<Brain className="h-8 w-8" />} minHeight="280px" />
        <WireframeZone title="Overflow Routing Map" subtitle="Inter-hospital transfer recommendations" icon={<Map className="h-8 w-8" />} minHeight="280px" />
      </div>
    </div>
  );
}
