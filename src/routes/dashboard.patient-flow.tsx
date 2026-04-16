import { createFileRoute } from "@tanstack/react-router";
import { WireframeZone } from "@/components/layout/WireframeZone";
import { GitBranch, Clock, BarChart3, ArrowRightLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard/patient-flow")({
  component: PatientFlowPage,
});

function PatientFlowPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patient Flow</h1>
        <p className="text-sm text-muted-foreground">Admission-to-discharge tracking and bottleneck detection</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Patient Flow Sankey Diagram" subtitle="ER → Triage → Ward → Discharge pipeline" icon={<GitBranch className="h-8 w-8" />} minHeight="320px" />
        <WireframeZone title="Wait Time Monitor" subtitle="Real-time queue depth by department" icon={<Clock className="h-8 w-8" />} minHeight="320px" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Admission/Discharge Chart" subtitle="Daily trends with seasonal overlay" icon={<BarChart3 className="h-8 w-8" />} minHeight="260px" />
        <WireframeZone title="Transfer Coordination" subtitle="Inter-facility patient movement tracker" icon={<ArrowRightLeft className="h-8 w-8" />} minHeight="260px" />
      </div>
    </div>
  );
}
