/**
 * Tamil Nadu District Map — Stylized SVG
 * Shows occupancy heat, emergency alerts, and capacity stress
 * District positions are approximate for visual layout
 */

import { useDistrictFilter } from "@/hooks/useDistrictFilter";
import { getHospitalCapacity, getEmergencyRisk } from "@/services/dataService";
import { TN_DISTRICTS } from "@/data/districts";
import { GlassCard } from "@/components/layout/GlassCard";

function getOccupancyColor(rate: number): string {
  if (rate > 90) return "oklch(0.65 0.2 25)";     // red - critical
  if (rate > 80) return "oklch(0.80 0.15 85)";    // amber - elevated
  if (rate > 65) return "oklch(0.75 0.15 190)";   // teal - moderate
  return "oklch(0.72 0.17 155)";                    // green - safe
}

// Approximate pixel positions for TN district map layout (normalized 0-100)
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

export function TamilNaduMap() {
  const { selectedDistrict, setSelectedDistrict } = useDistrictFilter();

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Tamil Nadu — District Health Map</h3>
      <p className="text-xs text-muted-foreground mb-4">Occupancy heat overlay | Click district to filter</p>
      <div className="relative w-full" style={{ paddingBottom: "120%" }}>
        <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full">
          {/* TN outline approximation */}
          <path
            d="M55,5 L75,10 L82,20 L85,35 L78,45 L72,55 L65,60 L60,70 L55,80 L50,90 L45,95 L38,100 L35,90 L40,80 L38,70 L30,60 L20,50 L18,40 L25,30 L35,20 L45,12 Z"
            fill="oklch(0.18 0.02 260)"
            stroke="oklch(0.75 0.15 190 / 30%)"
            strokeWidth="0.5"
          />

          {/* District markers */}
          {TN_DISTRICTS.map(d => {
            const pos = DISTRICT_POSITIONS[d.id];
            if (!pos) return null;
            const cap = getHospitalCapacity(d.id);
            const rate = cap.totalBeds > 0 ? (cap.occupiedBeds / cap.totalBeds) * 100 : 0;
            const risk = getEmergencyRisk(d.id);
            const isSelected = selectedDistrict === d.id;
            const color = getOccupancyColor(rate);

            return (
              <g key={d.id} onClick={() => setSelectedDistrict(d.id)} className="cursor-pointer">
                {/* Glow effect for high-risk */}
                {risk > 60 && (
                  <circle cx={pos.x} cy={pos.y} r={5} fill={color} opacity={0.2}>
                    <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Main dot */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isSelected ? 4 : 3}
                  fill={color}
                  stroke={isSelected ? "white" : "none"}
                  strokeWidth={isSelected ? 1 : 0}
                />
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y - 5}
                  textAnchor="middle"
                  fill="oklch(0.85 0.01 250)"
                  fontSize="2.5"
                  fontWeight={isSelected ? "bold" : "normal"}
                >
                  {d.name.slice(0, 6)}
                </text>
                {/* Occupancy % */}
                <text
                  x={pos.x}
                  y={pos.y + 7}
                  textAnchor="middle"
                  fill={color}
                  fontSize="2"
                >
                  {Math.round(rate)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-center">
        {[
          { color: "oklch(0.72 0.17 155)", label: "<65%" },
          { color: "oklch(0.75 0.15 190)", label: "65-80%" },
          { color: "oklch(0.80 0.15 85)", label: "80-90%" },
          { color: "oklch(0.65 0.2 25)", label: ">90%" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
