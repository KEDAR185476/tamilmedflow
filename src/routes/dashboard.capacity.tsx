import { createFileRoute } from "@tanstack/react-router";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { OccupancyByDistrictChart } from "@/components/dashboard/OccupancyChart";
import { ICULoadChart } from "@/components/dashboard/ICULoadChart";
import { BedAvailabilityChart } from "@/components/dashboard/BedAvailabilityChart";
import { AccidentRiskChart } from "@/components/dashboard/AccidentRiskChart";
import { StaffPressureChart } from "@/components/dashboard/StaffPressureChart";
import { KPICard } from "@/components/layout/KPICard";
import { getKPISummary } from "@/services/dataService";
import { BedDouble, HeartPulse, AlertTriangle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/capacity")({
  component: CapacityPage,
});

function CapacityPage() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const kpi = getKPISummary(selectedDistrict === "all" ? undefined : selectedDistrict);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Capacity Intelligence</h1>
          <p className="text-sm text-muted-foreground">{districtName} — Real-time bed management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<BedDouble className="h-5 w-5" />} title="Total Beds" value={kpi.totalBeds.toLocaleString()} trend={`${kpi.occupancyRate}% occupied`} trendUp={kpi.occupancyRate < 85} />
        <KPICard icon={<HeartPulse className="h-5 w-5" />} title="ICU Beds" value={`${kpi.icuOccupied}/${kpi.icuTotal}`} trend={`${kpi.icuRate}% utilized`} trendUp={kpi.icuRate < 85} />
        <KPICard icon={<AlertTriangle className="h-5 w-5" />} title="High Risk" value={`${kpi.highRiskDistricts} districts`} trend={kpi.highRiskDistricts > 3 ? "Action needed" : "Stable"} trendUp={kpi.highRiskDistricts <= 3} />
        <KPICard icon={<TrendingUp className="h-5 w-5" />} title="Occupancy Rate" value={`${kpi.occupancyRate}%`} trend="Network-wide" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyByDistrictChart />
        <ICULoadChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BedAvailabilityChart />
        <AccidentRiskChart />
      </div>
      <StaffPressureChart />
    </div>
  );
}
