import { createFileRoute } from "@tanstack/react-router";
import { WireframeZone } from "@/components/layout/WireframeZone";
import { Users, Clock, AlertTriangle, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/dashboard/workforce")({
  component: WorkforcePage,
});

function WorkforcePage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workforce Intelligence</h1>
        <p className="text-sm text-muted-foreground">Staff scheduling, fatigue monitoring, and skill-match allocation</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Staff Roster Table" subtitle="Doctors, nurses, technicians • Shift-wise" icon={<Users className="h-8 w-8" />} minHeight="300px" />
        <WireframeZone title="Shift Coverage Chart" subtitle="24-hour staffing levels by department" icon={<Clock className="h-8 w-8" />} minHeight="300px" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Fatigue Risk Monitor" subtitle="Consecutive hours, rest compliance" icon={<AlertTriangle className="h-8 w-8" />} minHeight="260px" />
        <WireframeZone title="Skill-Match Allocation" subtitle="Specialization vs demand heatmap" icon={<BarChart3 className="h-8 w-8" />} minHeight="260px" />
      </div>
    </div>
  );
}
