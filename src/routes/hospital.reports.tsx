import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart, Download, TrendingUp, BedDouble, Users, Wrench } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData, exportToCSV } from "@/lib/hospitalDataEngine";
import { computeEfficiencyScore } from "@/lib/hospitalAIEngine";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/reports")({ component: HospitalReports });

function HospitalReports() {
  const auth = getHospitalAuth();
  const hd = loadHospitalData(auth?.tenant?.id || "demo");
  const eff = computeEfficiencyScore(hd);
  const occRate = Math.round((hd.liveOps.beds.occupied / Math.max(1, hd.capacity.totalBeds)) * 100);

  const reports = [
    { title: "Daily Operations Summary", desc: "Beds, staff, equipment, and patient flow snapshot", icon: TrendingUp },
    { title: "Capacity Report", desc: "Ward-wise occupancy and bed utilization", icon: BedDouble },
    { title: "Workforce Report", desc: "Staff availability, burnout risk, and shift analysis", icon: Users },
    { title: "Equipment Status", desc: "Device utilization and maintenance schedule", icon: Wrench },
  ];

  function handleExport(name: string) {
    exportToCSV([{ report: name, occupancy: occRate, efficiency: eff, beds: hd.capacity.totalBeds, staff: hd.staff.doctors + hd.staff.nurses, timestamp: new Date().toISOString() }], `${name.toLowerCase().replace(/\s/g, "_")}.csv`);
    toast.success(`${name} exported`);
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><FileBarChart className="h-5 w-5 text-chart-2" /> Reports Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => (
          <GlassCard key={r.title} className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
              <r.icon className="h-5 w-5 text-chart-2" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              <button onClick={() => handleExport(r.title)} className="mt-2 flex items-center gap-1.5 text-xs text-chart-2 hover:underline">
                <Download className="h-3 w-3" /> Export CSV
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
