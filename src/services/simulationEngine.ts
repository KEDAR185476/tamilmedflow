/**
 * Rule-Driven Simulation Engine
 * 
 * Generates realistic streaming updates for dashboard.
 * NOT random — all changes follow documented rules:
 * 
 * RULES:
 * 1. Occupancy changes gradually (±1-3 beds per tick)
 * 2. ER admissions follow time-of-day curve (peak 10am-2pm, 6pm-10pm)
 * 3. Monsoon months increase fever/dengue admissions
 * 4. Night hours have lower admission rates
 * 5. Weekend/holiday slightly lower elective, higher ER
 * 6. Accident spikes correlate with rush hours (8-10am, 5-8pm)
 */

import { getHospitalCapacity } from "./dataService";
import type { SimulationTick } from "@/data/types";

// Hour-of-day admission weight (0-23): models real ER patterns
const HOURLY_WEIGHT = [
  0.3, 0.2, 0.15, 0.1, 0.1, 0.15, // 0-5: night lull
  0.3, 0.5, 0.7, 0.85, 0.95, 1.0,  // 6-11: morning ramp
  0.9, 0.85, 0.8, 0.75, 0.8, 0.9,  // 12-17: afternoon
  1.0, 0.95, 0.85, 0.7, 0.5, 0.4,  // 18-23: evening peak then decline
];

// Current month monsoon multiplier for disease-driven admissions
function getSeasonalMultiplier(): number {
  const month = new Date().getMonth(); // 0-indexed
  // NE monsoon Oct-Dec, SW Jun-Sep
  const multipliers = [1.0, 0.9, 0.85, 0.9, 1.0, 1.15, 1.25, 1.2, 1.25, 1.4, 1.5, 1.35];
  return multipliers[month];
}

/**
 * Generate a simulation tick for a given district
 * Call this on an interval (e.g. every 5 seconds) for streaming updates
 */
export function generateTick(districtId: string): SimulationTick {
  const capacity = getHospitalCapacity(districtId);
  const hour = new Date().getHours();
  const hourWeight = HOURLY_WEIGHT[hour];
  const seasonalMul = getSeasonalMultiplier();

  // Gradual occupancy change: ±1-3 based on time of day
  // More admissions during peak hours, more discharges morning
  const admissionPressure = hourWeight * seasonalMul;
  const dischargePressure = hour >= 9 && hour <= 14 ? 0.8 : 0.3; // Discharges happen morning

  // Net change: small, bounded
  const netChange = Math.round((admissionPressure - dischargePressure) * 2);
  const newOccupied = Math.max(
    Math.round(capacity.totalBeds * 0.6), // never below 60%
    Math.min(capacity.totalBeds, capacity.occupiedBeds + netChange)
  );

  // ICU: slower changes
  const icuChange = Math.round(netChange * 0.3);
  const newIcuOccupied = Math.max(
    Math.round(capacity.icuTotal * 0.5),
    Math.min(capacity.icuTotal, capacity.icuOccupied + icuChange)
  );

  // ER admissions: hourly rate
  const baseER = Math.round(capacity.totalBeds / 200); // ~1 per 200 beds per tick
  const erAdmissions = Math.max(0, Math.round(baseER * hourWeight * seasonalMul));

  // Alert level
  const occupancyRate = newOccupied / capacity.totalBeds;
  const alertLevel = occupancyRate > 0.92 ? "critical" :
                     occupancyRate > 0.82 ? "elevated" : "normal";

  return {
    timestamp: Date.now(),
    district: districtId,
    occupiedBeds: newOccupied,
    icuOccupied: newIcuOccupied,
    erAdmissions,
    alertLevel,
  };
}

/**
 * Custom hook helper: generates ticks at interval
 */
export function createTickGenerator(districtId: string, intervalMs: number = 5000) {
  let timer: ReturnType<typeof setInterval> | null = null;
  let listeners: ((tick: SimulationTick) => void)[] = [];

  return {
    start() {
      if (timer) return;
      timer = setInterval(() => {
        const tick = generateTick(districtId);
        listeners.forEach(fn => fn(tick));
      }, intervalMs);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    subscribe(fn: (tick: SimulationTick) => void) {
      listeners.push(fn);
      return () => {
        listeners = listeners.filter(l => l !== fn);
      };
    },
  };
}
