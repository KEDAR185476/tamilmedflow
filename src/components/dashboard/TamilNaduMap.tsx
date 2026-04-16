/**
 * Tamil Nadu Hospital Network Map — Enhanced with route lines and transfer suggestions
 */

import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getHospitalCapacity, getEmergencyRisk } from "@/services/dataService";
import { TN_DISTRICTS } from "@/data/districts";
import { GlassCard } from "@/components/layout/GlassCard";

function getOccupancyColor(rate: number): string {
  if (rate > 90) return "oklch(0.65 0.2 25)";
  if (rate > 80) return "oklch(0.80 0.15 85)";
  if (rate > 65) return "oklch(0.75 0.15 190)";
  return "oklch(0.72 0.17 155)";
}

const DISTRICT_POSITIONS: Record<string, { x: number; y: number }> = {
  chennai: { x: 78, y: 28 },
  tiruvallur: { x: 70, y: 22 },
  kancheepuram: { x: 72, y: 35 },
  vellore: { x: 60, y: 18 },
  salem: { x: 45, y: 30 },
  erode: { x: 35, y: 32 },
  coimbatore: { x: 25, y: 40 },
  tiruchirappalli: { x: 55, y: 48 },
  thanjavur: { x: 65, y: 52 },
  madurai: { x: 50, y: 65 },
  tirunelveli: { x: 42, y: 82 },
  thoothukudi: { x: 55, y: 85 },
};

// Network route connections (major highway corridors)
const ROUTES: [string, string][] = [
  ["chennai", "vellore"],
  ["chennai", "tiruvallur"],
  ["chennai", "kancheepuram"],
  ["vellore", "salem"],
  ["salem", "erode"],
  ["erode", "coimbatore"],
  ["salem", "tiruchirappalli"],
  ["tiruchirappalli", "thanjavur"],
  ["tiruchirappalli", "madurai"],
  ["madurai", "tirunelveli"],
  ["tirunelveli", "thoothukudi"],
  ["kancheepuram", "tiruchirappalli"],
  ["coimbatore", "madurai"],
];

export function TamilNaduMap() {
  const { selectedDistrict, setSelectedDistrict } = useDistrictFilter();

  // Pre-compute district data
  const districtData = TN_DISTRICTS.map(d => {
    const cap = getHospitalCapacity(d.id);
    const rate = cap.totalBeds > 0 ? (cap.occupiedBeds / cap.totalBeds) * 100 : 0;
    const risk = getEmergencyRisk(d.id);
    const available = cap.totalBeds - cap.occupiedBeds;
    return { ...d, rate, risk, available, cap };
  });

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Tamil Nadu Hospital Network</h3>
      <p className="text-xs text-muted-foreground mb-3">Occupancy heat • Emergency status • Click to filter</p>
      <div className="relative w-full" style={{ paddingBottom: "120%" }}>
        <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full">
          {/* TN outline */}
          <path
            d="M55,5 L75,10 L82,20 L85,35 L78,45 L72,55 L65,60 L60,70 L55,80 L50,90 L45,95 L38,100 L35,90 L40,80 L38,70 L30,60 L20,50 L18,40 L25,30 L35,20 L45,12 Z"
            fill="oklch(0.18 0.02 260)"
            stroke="oklch(0.75 0.15 190 / 30%)"
            strokeWidth="0.5"
          />

          {/* Route lines */}
          {ROUTES.map(([from, to]) => {
            const p1 = DISTRICT_POSITIONS[from];
            const p2 = DISTRICT_POSITIONS[to];
            if (!p1 || !p2) return null;
            const d1 = districtData.find(d => d.id === from);
            const d2 = districtData.find(d => d.id === to);
            // Highlight routes between overloaded and underloaded districts
            const isTransferRoute = (d1 && d2) && ((d1.rate > 88 && d2.rate < 75) || (d2.rate > 88 && d1.rate < 75));
            return (
              <line
                key={`${from}-${to}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={isTransferRoute ? "oklch(0.75 0.15 190 / 60%)" : "oklch(1 0 0 / 8%)"}
                strokeWidth={isTransferRoute ? 0.8 : 0.4}
                strokeDasharray={isTransferRoute ? "" : "1 1"}
              >
                {isTransferRoute && (
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                )}
              </line>
            );
          })}

          {/* District markers */}
          {districtData.map(d => {
            const pos = DISTRICT_POSITIONS[d.id];
            if (!pos) return null;
            const isSelected = selectedDistrict === d.id;
            const color = getOccupancyColor(d.rate);
            const nodeSize = isSelected ? 4.5 : Math.max(2.5, Math.min(4, d.cap.totalBeds / 800));

            return (
              <g key={d.id} onClick={() => setSelectedDistrict(d.id)} className="cursor-pointer">
                {/* Pulse for high-risk */}
                {d.risk > 55 && (
                  <circle cx={pos.x} cy={pos.y} r={nodeSize + 2} fill={color} opacity={0.15}>
                    <animate attributeName="r" values={`${nodeSize + 1};${nodeSize + 4};${nodeSize + 1}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Selection ring */}
                {isSelected && (
                  <circle cx={pos.x} cy={pos.y} r={nodeSize + 1.5} fill="none" stroke="white" strokeWidth="0.5" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Main node */}
                <circle cx={pos.x} cy={pos.y} r={nodeSize} fill={color} stroke={isSelected ? "white" : "none"} strokeWidth={0.5} />
                {/* Label */}
                <text x={pos.x} y={pos.y - nodeSize - 2} textAnchor="middle" fill="oklch(0.9 0.01 250)" fontSize="2.4" fontWeight={isSelected ? "bold" : "normal"}>
                  {d.name.length > 8 ? d.name.slice(0, 7) + "." : d.name}
                </text>
                {/* Stats below */}
                <text x={pos.x} y={pos.y + nodeSize + 3.5} textAnchor="middle" fill={color} fontSize="2" fontWeight="bold">
                  {Math.round(d.rate)}%
                </text>
                <text x={pos.x} y={pos.y + nodeSize + 6} textAnchor="middle" fill="oklch(0.65 0.02 250)" fontSize="1.6">
                  {d.available} free
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 justify-center flex-wrap">
        {[
          { color: "oklch(0.72 0.17 155)", label: "<65% Safe" },
          { color: "oklch(0.75 0.15 190)", label: "65-80% Moderate" },
          { color: "oklch(0.80 0.15 85)", label: "80-90% Elevated" },
          { color: "oklch(0.65 0.2 25)", label: ">90% Critical" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
            <span className="text-[9px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-4 bg-primary rounded" />
          <span className="text-[9px] text-muted-foreground">Transfer route</span>
        </div>
      </div>
    </GlassCard>
  );
}
