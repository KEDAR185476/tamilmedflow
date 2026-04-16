import { createFileRoute } from "@tanstack/react-router";
import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { GlassCard } from "@/components/layout/GlassCard";
import { getTransferRecommendations, getDistrictStress, type TransferRecommendation } from "@/services/capacityOperations";
import { ArrowRight, Truck, Users, Wind, HeartPulse, AlertTriangle, Shield, Navigation } from "lucide-react";

export const Route = createFileRoute("/dashboard/resource-routing")({
  component: ResourceRoutingPage,
});

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  ventilator: <Wind className="h-4 w-4" />,
  nurse: <Users className="h-4 w-4" />,
  oxygen: <HeartPulse className="h-4 w-4" />,
  ambulance: <Truck className="h-4 w-4" />,
  emergency_team: <AlertTriangle className="h-4 w-4" />,
  bed_capacity: <HeartPulse className="h-4 w-4" />,
};

function ResourceRoutingPage() {
  const { selectedDistrict, districtName } = useDistrictFilter();
  const transfers = getTransferRecommendations(selectedDistrict === "all" ? undefined : selectedDistrict);
  const stress = getDistrictStress();

  const critical = transfers.filter(t => t.urgency === "critical");
  const high = transfers.filter(t => t.urgency === "high");
  const medium = transfers.filter(t => t.urgency === "medium");

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Resource Routing Center
          </h1>
          <p className="text-sm text-muted-foreground">{districtName} — Smart resource movement</p>
        </div>
        <DistrictSelector />
      </div>

      {/* District stress overview */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Network Stress Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {stress.sort((a, b) => b.occupancyRate - a.occupancyRate).map(s => (
            <div key={s.district.id} className={`glass rounded-lg p-2.5 text-center border ${s.occupancyRate > 88 ? "border-destructive/30" : s.occupancyRate > 80 ? "border-warning/20" : "border-primary/10"}`}>
              <p className="text-[10px] font-medium text-foreground truncate">{s.district.name}</p>
              <div className={`text-lg font-bold tabular-nums ${s.occupancyRate > 88 ? "text-destructive" : s.occupancyRate > 80 ? "text-warning" : "text-success"}`}>
                {s.occupancyRate}%
              </div>
              <p className="text-[9px] text-muted-foreground">{s.availableBeds} beds free</p>
              <div className="mt-1 h-1 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full ${s.occupancyRate > 88 ? "bg-destructive" : s.occupancyRate > 80 ? "bg-warning" : "bg-primary"}`} style={{ width: `${s.occupancyRate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Transfer Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {critical.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Critical Transfers ({critical.length})
              </h3>
              <div className="space-y-2">
                {critical.map(t => <TransferCard key={t.id} transfer={t} />)}
              </div>
            </div>
          )}

          {high.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-warning mb-2">High Priority ({high.length})</h3>
              <div className="space-y-2">
                {high.map(t => <TransferCard key={t.id} transfer={t} />)}
              </div>
            </div>
          )}

          {medium.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-primary mb-2">Medium Priority ({medium.length})</h3>
              <div className="space-y-2">
                {medium.map(t => <TransferCard key={t.id} transfer={t} />)}
              </div>
            </div>
          )}

          {transfers.length === 0 && (
            <GlassCard className="p-6 text-center">
              <Shield className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm text-success font-semibold">All resources balanced</p>
              <p className="text-xs text-muted-foreground">No transfers needed at this time</p>
            </GlassCard>
          )}
        </div>

        {/* Resource type breakdown */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Transfers by Resource Type</h3>
          <div className="space-y-3">
            {["bed_capacity", "nurse", "ventilator", "ambulance", "oxygen", "emergency_team"].map(type => {
              const items = transfers.filter(t => t.resourceType === type);
              return (
                <div key={type} className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{RESOURCE_ICONS[type]}</span>
                      <span className="text-xs font-medium text-foreground capitalize">{type.replace("_", " ")}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{items.length} moves</span>
                  </div>
                  {items.length > 0 ? items.map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                      <span className="text-foreground">{t.from}</span>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="text-foreground">{t.to}</span>
                      <span className="ml-auto">×{t.quantity}</span>
                    </div>
                  )) : (
                    <p className="text-[10px] text-muted-foreground">No transfers needed</p>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function TransferCard({ transfer }: { transfer: TransferRecommendation }) {
  const urgencyColor = transfer.urgency === "critical" ? "border-l-destructive" : transfer.urgency === "high" ? "border-l-warning" : "border-l-primary";
  return (
    <GlassCard className={`p-3 border-l-2 ${urgencyColor}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-primary">{RESOURCE_ICONS[transfer.resourceType]}</span>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium text-foreground">{transfer.from}</span>
          <ArrowRight className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">{transfer.to}</span>
        </div>
        <span className="ml-auto text-xs font-bold text-primary">×{transfer.quantity}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">{transfer.reason}</p>
      <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
        <span className={`px-1 py-0.5 rounded ${transfer.urgency === "critical" ? "bg-destructive/20 text-destructive" : transfer.urgency === "high" ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"}`}>
          {transfer.urgency}
        </span>
        <span>Confidence: {transfer.confidence}%</span>
        <span className="capitalize">{transfer.resourceType.replace("_", " ")}</span>
      </div>
    </GlassCard>
  );
}
