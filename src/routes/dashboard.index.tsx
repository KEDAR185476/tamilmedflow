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

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const kpi = getKPISummary(selectedDistrict === "all" ? undefined : selectedDistrict);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
          <p className="text-sm text-muted-foreground">{districtName} — Real-time Healthcare Intelligence</p>
        </div>
        <DistrictSelector />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard icon={<BedDouble className="h-5 w-5" />} title="Total Beds" value={kpi.totalBeds.toLocaleString()} trend={`${kpi.occupancyRate}% occupied`} trendUp={kpi.occupancyRate < 85} />
        <KPICard icon={<HeartPulse className="h-5 w-5" />} title="ICU Usage" value={`${kpi.icuOccupied}/${kpi.icuTotal}`} trend={`${kpi.icuRate}% utilized`} trendUp={kpi.icuRate < 85} />
        <KPICard icon={<AlertTriangle className="h-5 w-5" />} title="High Risk Districts" value={kpi.highRiskDistricts.toString()} trend={kpi.highRiskDistricts > 3 ? "Elevated" : "Normal"} trendUp={kpi.highRiskDistricts <= 3} />
        <KPICard icon={<Users className="h-5 w-5" />} title="Staff Index" value={`${kpi.staffAvailabilityIndex}%`} trend={kpi.staffAvailabilityIndex > 20 ? "Adequate" : "Critical"} trendUp={kpi.staffAvailabilityIndex > 20} />
        <KPICard icon={<ShieldAlert className="h-5 w-5" />} title="Emergency Risk" value={`${kpi.emergencyRiskIndex}`} trend={kpi.emergencyRiskIndex > 60 ? "High" : "Moderate"} trendUp={kpi.emergencyRiskIndex < 60} />
        <KPICard icon={<Activity className="h-5 w-5" />} title="Active Alerts" value={kpi.activeAlerts.toString()} trend={kpi.activeAlerts > 0 ? `${kpi.activeAlerts} outbreak` : "Clear"} trendUp={kpi.activeAlerts === 0} />
      </div>

      {/* Main grid: Map + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TamilNaduMap />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <OccupancyByDistrictChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ICULoadChart />
            <BedAvailabilityChart />
          </div>
        </div>
      </div>

      {/* Seasonal + Data source info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeasonalAdmissionChart />
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Data Sources Active</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>HMIS India</span><span className="text-success">● Static</span></div>
            <div className="flex justify-between"><span>NHP / CBHI</span><span className="text-success">● Static</span></div>
            <div className="flex justify-between"><span>TN Health Dept</span><span className="text-success">● Static</span></div>
            <div className="flex justify-between"><span>NVBDCP (Disease)</span><span className="text-primary">● Processed</span></div>
            <div className="flex justify-between"><span>IMD (Weather)</span><span className="text-primary">● Processed</span></div>
            <div className="flex justify-between"><span>MoRTH (Accidents)</span><span className="text-success">● Static</span></div>
            <div className="flex justify-between"><span>Simulation Engine</span><span className="text-warning">● Simulated</span></div>
            <p className="pt-2 border-t border-border mt-2">All data assumptions documented in code. See Data Transparency Center for full registry.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
