import { createFileRoute } from "@tanstack/react-router";
import { WireframeZone } from "@/components/layout/WireframeZone";
import { FileBarChart, Download, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/dashboard/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Generated analytics, export center, and compliance reports</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WireframeZone title="Report Library" subtitle="Daily, weekly, monthly reports • Filterable" icon={<FileBarChart className="h-8 w-8" />} minHeight="300px" />
        <WireframeZone title="Analytics Summary" subtitle="KPI trends, district comparisons, model accuracy" icon={<BarChart3 className="h-8 w-8" />} minHeight="300px" />
      </div>
      <WireframeZone title="Export Center" subtitle="PDF, CSV, Excel export • Scheduled report delivery" icon={<Download className="h-8 w-8" />} minHeight="180px" />
    </div>
  );
}
