import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, Users, Activity, AlertTriangle, ShieldAlert, HeartPulse } from "lucide-react";
import { KPICard } from "@/components/layout/KPICard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { getKPISummary } from "@/services/dataService";
import { TamilNaduMap } from "@/components/dashboard/TamilNaduMap";
import { OccupancyByDistrictChart } from "@/components/dashboard/OccupancyChart";
import { ICULoadChart } from "@/components/dashboard/ICULoadChart";
import { SeasonalAdmissionChart } from "@/components/dashboard/SeasonalChart";
import { BedAvailabilityChart } from "@/components/dashboard/BedAvailabilityChart";
import { GlassCard } from "@/components/layout/GlassCard";
import { MasterOptimize } from "@/components/dashboard/MasterOptimize";
import { LiveScenarios } from "@/components/dashboard/LiveScenarios";
import { useState } from "react";
import { DemoStoryMode } from "@/components/dashboard/DemoStoryMode";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const kpi = getKPISummary(selectedDistrict === "all" ? undefined : selectedDistrict);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      {showDemo && <DemoStoryMode onClose={() => setShowDemo(false)} />}
      <div className="space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Command Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{districtName} · Real-time Healthcare Intelligence</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDemo(true)}
              className="px-3 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground border border-border/50 hover:border-border hover:text-foreground transition-all flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> Demo
            </button>
            <DistrictSelector />
          </div>
        </div>

        {/* Master Optimize */}
        <MasterOptimize />

        {/* KPI Row — asymmetric: 2 large + 4 regular */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <KPICard
            icon={<BedDouble className="h-4 w-4" />}
            title="Total Beds"
            value={kpi.totalBeds.toLocaleString()}
            trend={`${kpi.occupancyRate}% occupied`}
            trendUp={kpi.occupancyRate < 85}
            size="large"
            className="lg:col-span-2"
          />
          <KPICard icon={<HeartPulse className="h-4 w-4" />} title="ICU Usage" value={`${kpi.icuOccupied}/${kpi.icuTotal}`} trend={`${kpi.icuRate}% utilized`} trendUp={kpi.icuRate < 85} />
          <KPICard icon={<AlertTriangle className="h-4 w-4" />} title="High Risk" value={kpi.highRiskDistricts.toString()} trend={kpi.highRiskDistricts > 3 ? "Elevated" : "Normal"} trendUp={kpi.highRiskDistricts <= 3} />
          <KPICard icon={<Users className="h-4 w-4" />} title="Staff Index" value={`${kpi.staffAvailabilityIndex}%`} trend={kpi.staffAvailabilityIndex > 20 ? "Adequate" : "Critical"} trendUp={kpi.staffAvailabilityIndex > 20} />
          <KPICard icon={<ShieldAlert className="h-4 w-4" />} title="Emergency" value={`${kpi.emergencyRiskIndex}`} trend={kpi.emergencyRiskIndex > 60 ? "High" : "Moderate"} trendUp={kpi.emergencyRiskIndex < 60} />
        </div>

        {/* Live Scenarios */}
        <LiveScenarios />

        {/* Main grid: Map + Charts — asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <TamilNaduMap />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <OccupancyByDistrictChart />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ICULoadChart />
              <BedAvailabilityChart />
            </div>
          </div>
        </div>

        {/* Seasonal + Data sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SeasonalAdmissionChart />
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="text-xs font-medium text-foreground mb-3 tracking-tight">Data Sources</h3>
            <div className="space-y-2 text-[11px] text-muted-foreground">
              {[
                { name: "HMIS India", status: "Static", color: "bg-success/60" },
                { name: "NHP / CBHI", status: "Static", color: "bg-success/60" },
                { name: "TN Health Dept", status: "Static", color: "bg-success/60" },
                { name: "NVBDCP (Disease)", status: "Processed", color: "bg-primary/60" },
                { name: "IMD (Weather)", status: "Processed", color: "bg-primary/60" },
                { name: "MoRTH (Accidents)", status: "Static", color: "bg-success/60" },
                { name: "Simulation Engine", status: "Simulated", color: "bg-warning/60" },
              ].map(src => (
                <div key={src.name} className="flex items-center justify-between">
                  <span>{src.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${src.color}`} />
                    {src.status}
                  </span>
                </div>
              ))}
              <p className="pt-2 border-t border-border/50 mt-2 text-muted-foreground/60">All assumptions documented. See Data Transparency Center.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
