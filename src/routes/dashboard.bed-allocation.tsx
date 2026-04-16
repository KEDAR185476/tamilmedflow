import { createFileRoute } from "@tanstack/react-router";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { GlassCard } from "@/components/layout/GlassCard";
import {
  getAdmissionQueue, getAvailableBeds, getAIBedAssignments,
} from "@/services/capacityOperations";
import {
  BedDouble, Users, ArrowRight, Shield, Clock, AlertTriangle, CheckCircle, Wifi,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/bed-allocation")({
  component: BedAllocationPage,
});

function BedAllocationPage() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const dId = selectedDistrict === "all" ? undefined : selectedDistrict;
  const queue = getAdmissionQueue(dId);
  const beds = getAvailableBeds(dId);
  const assignments = getAIBedAssignments(dId);

  const availableBeds = beds.filter(b => b.status === "available");
  const cleaningBeds = beds.filter(b => b.status === "cleaning");
  const reservedBeds = beds.filter(b => b.status === "reserved");

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BedDouble className="h-6 w-6 text-primary" />
            Bed Allocation Command
          </h1>
          <p className="text-sm text-muted-foreground">{districtName} — AI-powered bed assignment</p>
        </div>
        <DistrictSelector />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard icon={<Users className="h-4 w-4" />} label="In Queue" value={queue.length} />
        <SummaryCard icon={<BedDouble className="h-4 w-4" />} label="Available" value={availableBeds.length} good />
        <SummaryCard icon={<Clock className="h-4 w-4" />} label="Cleaning" value={cleaningBeds.length} />
        <SummaryCard icon={<Shield className="h-4 w-4" />} label="Reserved" value={reservedBeds.length} />
        <SummaryCard icon={<CheckCircle className="h-4 w-4" />} label="AI Matched" value={assignments.length} good />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Patient Queue */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Incoming Patients ({queue.length})
          </h3>
          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {queue.map(p => {
              const matched = assignments.find(a => a.patientId === p.id);
              return (
                <div key={p.id} className={`glass rounded-lg p-3 border ${matched ? "border-success/30" : p.severity === "critical" ? "border-destructive/30" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{p.id}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        p.severity === "critical" ? "bg-destructive/20 text-destructive" :
                        p.severity === "severe" ? "bg-warning/20 text-warning" :
                        p.severity === "moderate" ? "bg-primary/20 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>{p.severity}</span>
                      {p.icuNeed && <span className="text-[8px] px-1 py-0.5 rounded bg-destructive/20 text-destructive">ICU</span>}
                      {p.oxygenNeed && <span className="text-[8px] px-1 py-0.5 rounded bg-warning/20 text-warning">O₂</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">ETA: {p.etaMinutes}m</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 text-[10px] text-muted-foreground">
                    <span>Dept: {p.department}</span>
                    <span>Age: {p.ageBand}</span>
                    <span>From: {p.sourceDistrict}</span>
                    <span>Time: {p.arrivalTime}</span>
                  </div>
                  {matched && (
                    <div className="mt-2 pt-2 border-t border-success/20">
                      <div className="flex items-center gap-1.5 text-[10px] text-success">
                        <CheckCircle className="h-3 w-3" />
                        <span className="font-medium">AI Match: {matched.bedId}</span>
                        <span className="text-muted-foreground ml-1">({matched.confidence}% confidence)</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{matched.reason}</p>
                      <p className="text-[9px] text-success">Wait reduction: ~{matched.waitReduction}min</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Available Beds */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-primary" /> Available Beds ({beds.length})
          </h3>
          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {beds.map(b => {
              const matched = assignments.find(a => a.bedId === b.id);
              return (
                <div key={b.id} className={`glass rounded-lg p-3 border ${matched ? "border-success/30" : b.status === "available" ? "border-primary/10" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{b.bedNumber}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{b.ward}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{b.hospitalName}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {b.equipment.map(e => (
                      <span key={e} className="text-[8px] glass rounded px-1 py-0.5 text-muted-foreground">{e}</span>
                    ))}
                    {b.isolationCapable && <span className="text-[8px] px-1 py-0.5 rounded bg-chart-4/20 text-chart-4">Isolation</span>}
                  </div>
                  {b.status === "cleaning" && (
                    <p className="text-[9px] text-warning mt-1">Cleaning ETA: {b.cleaningEtaMin}min</p>
                  )}
                  {matched && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-success">
                      <ArrowRight className="h-3 w-3" />
                      <span>Assigned to {matched.patientId}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* AI Assignment Summary */}
      {assignments.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            AI Bed Assignment Summary ({assignments.length} matches)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {assignments.map(a => (
              <div key={`${a.patientId}-${a.bedId}`} className="glass rounded-lg p-3 border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-foreground">{a.patientId}</span>
                  <ArrowRight className="h-3 w-3 text-success" />
                  <span className="text-xs font-bold text-success">{a.bedId}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{a.reason}</p>
                <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                  <span>Confidence: {a.confidence}%</span>
                  <span>Wait ↓ {a.waitReduction}m</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, good }: { icon: React.ReactNode; label: string; value: number; good?: boolean }) {
  return (
    <GlassCard className="p-3 text-center">
      <div className={`flex justify-center mb-0.5 ${good ? "text-success" : "text-primary"}`}>{icon}</div>
      <div className={`text-xl font-bold ${good ? "text-success" : "text-foreground"}`}>{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </GlassCard>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-success/20 text-success",
    cleaning: "bg-warning/20 text-warning",
    reserved: "bg-chart-4/20 text-chart-4",
    maintenance: "bg-destructive/20 text-destructive",
  };
  return <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}>{status}</span>;
}
