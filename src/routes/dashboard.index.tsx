import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, Users, Activity, AlertTriangle, Map, Bell, Brain, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/layout/KPICard";
import { WireframeZone } from "@/components/layout/WireframeZone";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
        <p className="text-sm text-muted-foreground">Tamil Nadu Healthcare Intelligence — Real-time Overview</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<BedDouble className="h-5 w-5" />} title="Total Beds" value="34,512" trend="92% occupied" trendUp={false} />
        <KPICard icon={<Users className="h-5 w-5" />} title="Active Staff" value="12,847" trend="+3.2% this shift" trendUp={true} />
        <KPICard icon={<Activity className="h-5 w-5" />} title="Patient Flow" value="4,231" trend="Incoming today" />
        <KPICard icon={<AlertTriangle className="h-5 w-5" />} title="Active Alerts" value="7" trend="2 critical" trendUp={false} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center: Map */}
        <div className="lg:col-span-2">
          <WireframeZone
            title="Tamil Nadu District Map — Coming in Part 2"
            subtitle="38 districts • Real-time bed occupancy heatmap • Hospital locations"
            icon={<Map className="h-10 w-10" />}
            minHeight="360px"
          />
        </div>

        {/* Side: Alerts */}
        <WireframeZone
          title="Live Alerts Feed"
          subtitle="Critical alerts • Surge warnings • Equipment failures"
          icon={<Bell className="h-8 w-8" />}
          minHeight="360px"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WireframeZone
          title="Bed Occupancy Trend"
          subtitle="24-hour rolling chart — Recharts"
          icon={<BarChart3 className="h-8 w-8" />}
        />
        <WireframeZone
          title="Patient Admission Forecast"
          subtitle="LSTM model prediction — 72hr ahead"
          icon={<Brain className="h-8 w-8" />}
        />
        <WireframeZone
          title="AI Recommendation Feed"
          subtitle="Resource allocation • Discharge suggestions • Routing"
          icon={<Activity className="h-8 w-8" />}
        />
      </div>
    </div>
  );
}
