import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { useState } from "react";
import {
  FileBarChart, Download, FileText, BarChart3, Calendar,
  CheckCircle, Clock, TrendingUp, Users, BedDouble, Siren, MapPin,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/reports")({
  component: ReportsPage,
});

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  formats: string[];
  lastGenerated: string;
  frequency: string;
}

const REPORTS: Report[] = [
  { id: "daily-occ", name: "Daily Occupancy Report", description: "Bed occupancy, turnover, and availability across all wards", category: "Operations", icon: <BedDouble className="h-4 w-4" />, formats: ["PDF", "CSV"], lastGenerated: "Today 06:00", frequency: "Daily" },
  { id: "icu-util", name: "ICU Utilization Report", description: "ICU bed usage, ventilator hours, critical patient census", category: "Critical Care", icon: <TrendingUp className="h-4 w-4" />, formats: ["PDF", "CSV", "Excel"], lastGenerated: "Today 06:00", frequency: "Daily" },
  { id: "workforce-eff", name: "Workforce Efficiency Report", description: "Staff utilization, burnout index, nurse-patient ratios by ward", category: "Workforce", icon: <Users className="h-4 w-4" />, formats: ["PDF", "Excel"], lastGenerated: "Yesterday", frequency: "Weekly" },
  { id: "emergency-inc", name: "Emergency Incident Report", description: "Surge events, trauma admissions, response times, outcomes", category: "Emergency", icon: <Siren className="h-4 w-4" />, formats: ["PDF"], lastGenerated: "2024-12-28", frequency: "On-demand" },
  { id: "district-comp", name: "District Comparison Report", description: "Cross-district capacity, disease burden, resource distribution", category: "Analytics", icon: <MapPin className="h-4 w-4" />, formats: ["PDF", "CSV", "Excel"], lastGenerated: "2024-12-25", frequency: "Monthly" },
  { id: "exec-summary", name: "Monthly Executive Summary", description: "KPIs, AI recommendations acted on, efficiency gains, forecasts", category: "Executive", icon: <FileBarChart className="h-4 w-4" />, formats: ["PDF"], lastGenerated: "2024-12-01", frequency: "Monthly" },
];

function ReportsPage() {
  const { districtName } = useDistrictFilter();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const handleGenerate = (reportId: string) => {
    setGenerating(reportId);
    setTimeout(() => {
      setGenerating(null);
      setGenerated(prev => new Set(prev).add(reportId));
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-primary" />
            Reports &amp; Export Hub
          </h1>
          <p className="text-sm text-muted-foreground">Generate, preview, and export operational reports — {districtName}</p>
        </div>
        <div className="glass rounded-lg px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> Last batch: Today 06:00 AM
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Reports Available", value: REPORTS.length, icon: FileText },
          { label: "Scheduled Reports", value: 3, icon: Calendar },
          { label: "Exports This Month", value: 24, icon: Download },
          { label: "Automated Runs", value: 18, icon: CheckCircle },
        ].map(s => (
          <GlassCard key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid gap-4">
        {REPORTS.map(report => (
          <GlassCard key={report.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {report.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{report.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{report.category}</span>
                    <span>{report.frequency}</span>
                    <span>Last: {report.lastGenerated}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {report.formats.map(fmt => (
                  <span key={fmt} className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground">{fmt}</span>
                ))}
                <button
                  onClick={() => handleGenerate(report.id)}
                  disabled={generating === report.id}
                  className="ml-2 flex items-center gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {generating === report.id ? (
                    <><span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Generating...</>
                  ) : generated.has(report.id) ? (
                    <><CheckCircle className="h-3 w-3" /> Download</>
                  ) : (
                    <><Download className="h-3 w-3" /> Generate</>
                  )}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Export note */}
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Export Architecture</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Reports are generated from the same transparent data pipelines visible in the Data Transparency Center.
              PDF exports include data provenance, model versions, and confidence intervals.
              Scheduled reports auto-deliver via <code className="text-primary">/api/reports/export</code> endpoint.
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              Note: In prototype mode, reports generate from local processed datasets. Production will integrate hospital HMIS feeds.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
