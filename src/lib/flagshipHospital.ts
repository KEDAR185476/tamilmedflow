/**
 * Flagship Hospital Digital Twin — Part R2
 * MedFlow General Hospital, Chennai · 300-bed multi-specialty
 * Rule-driven realistic operational state + scenario simulation + AI optimization.
 */

export type Dept =
  | "ICU" | "ER" | "General Medicine" | "Pulmonology"
  | "Cardiology" | "Surgery" | "Pediatrics";

export type WardStatus = "healthy" | "rising" | "overload";

export interface DeptState {
  name: Dept;
  beds: number;
  occupied: number;
  cleaning: number;
  blocked: number;
  ready: number;
  doctors: number;
  nurses: number;
  ventInUse: number;
  ventTotal: number;
  monitorsInUse: number;
  staffPressure: number; // 0-100
  status: WardStatus;
}

export interface FlagshipMetrics {
  occupancyPct: number;
  avgWaitMin: number;
  icuLoadPct: number;
  idleEquipment: number;
  delayedTransfers: number;
  staffImbalance: number;
  costSavedLakhs: number;
  optimizationScore: number;
}

export type ScenarioId =
  | "normal" | "evening-surge" | "icu-overload"
  | "dengue-rise" | "night-shortage" | "mass-casualty";

export interface Scenario {
  id: ScenarioId;
  name: string;
  description: string;
  context: string;
}

export const SCENARIOS: Scenario[] = [
  { id: "normal", name: "Normal Day", description: "Baseline weekday operations", context: "Routine OPD + scheduled admissions. Steady ICU. No acute pressure." },
  { id: "evening-surge", name: "Evening ER Surge", description: "6-9 PM admission spike", context: "Post-work injuries + traffic incidents drive 2× ER intake. Wait time climbing." },
  { id: "icu-overload", name: "ICU Overload", description: "Critical care saturation", context: "Multiple post-op + trauma cases. ICU at 95%. Ventilator demand peaking." },
  { id: "dengue-rise", name: "Dengue Seasonal Rise", description: "Monsoon-driven surge", context: "Pulmonology + General Medicine flooded with febrile cases. Platelet monitoring spikes." },
  { id: "night-shortage", name: "Night Shift Shortage", description: "Reduced staffing", context: "8 nurses on leave. Night shift running 30% understaffed in ER + ICU." },
  { id: "mass-casualty", name: "Major Accident Event", description: "Mass casualty inbound", context: "Bus accident on GST Road. 14 critical patients en route. ER + Surgery + ICU activated." },
];

export const HOSPITAL_PROFILE = {
  name: "MedFlow General Hospital",
  city: "Chennai",
  state: "Tamil Nadu",
  type: "300-Bed Multi-Specialty",
  established: "1998",
  beds: 300,
  doctors: 142,
  nurses: 318,
  specialists: 48,
};

const DEPT_BASE: Record<Dept, { beds: number; doctors: number; nurses: number; ventTotal: number }> = {
  "ICU": { beds: 20, doctors: 18, nurses: 64, ventTotal: 12 },
  "ER": { beds: 30, doctors: 22, nurses: 56, ventTotal: 4 },
  "General Medicine": { beds: 80, doctors: 32, nurses: 78, ventTotal: 0 },
  "Pulmonology": { beds: 25, doctors: 14, nurses: 32, ventTotal: 2 },
  "Cardiology": { beds: 40, doctors: 20, nurses: 38, ventTotal: 0 },
  "Surgery": { beds: 55, doctors: 24, nurses: 30, ventTotal: 0 },
  "Pediatrics": { beds: 50, doctors: 12, nurses: 20, ventTotal: 0 },
};

// Scenario multipliers — rule-driven, not random
const SCENARIO_PROFILE: Record<ScenarioId, Partial<Record<Dept, { occ: number; pressure: number; vent: number }>>> = {
  "normal": {
    "ICU": { occ: 0.65, pressure: 45, vent: 0.6 },
    "ER": { occ: 0.55, pressure: 50, vent: 0.4 },
    "General Medicine": { occ: 0.7, pressure: 40, vent: 0 },
    "Pulmonology": { occ: 0.6, pressure: 45, vent: 0.5 },
    "Cardiology": { occ: 0.68, pressure: 42, vent: 0 },
    "Surgery": { occ: 0.55, pressure: 38, vent: 0 },
    "Pediatrics": { occ: 0.5, pressure: 35, vent: 0 },
  },
  "evening-surge": {
    "ICU": { occ: 0.78, pressure: 65, vent: 0.75 },
    "ER": { occ: 0.95, pressure: 92, vent: 0.85 },
    "General Medicine": { occ: 0.82, pressure: 60, vent: 0 },
    "Pulmonology": { occ: 0.7, pressure: 55, vent: 0.6 },
    "Cardiology": { occ: 0.78, pressure: 60, vent: 0 },
    "Surgery": { occ: 0.7, pressure: 55, vent: 0 },
    "Pediatrics": { occ: 0.55, pressure: 40, vent: 0 },
  },
  "icu-overload": {
    "ICU": { occ: 0.95, pressure: 96, vent: 0.95 },
    "ER": { occ: 0.85, pressure: 80, vent: 0.7 },
    "General Medicine": { occ: 0.78, pressure: 60, vent: 0 },
    "Pulmonology": { occ: 0.72, pressure: 65, vent: 0.7 },
    "Cardiology": { occ: 0.85, pressure: 75, vent: 0 },
    "Surgery": { occ: 0.82, pressure: 78, vent: 0 },
    "Pediatrics": { occ: 0.5, pressure: 35, vent: 0 },
  },
  "dengue-rise": {
    "ICU": { occ: 0.78, pressure: 70, vent: 0.65 },
    "ER": { occ: 0.85, pressure: 80, vent: 0.55 },
    "General Medicine": { occ: 0.96, pressure: 90, vent: 0 },
    "Pulmonology": { occ: 0.94, pressure: 88, vent: 0.85 },
    "Cardiology": { occ: 0.6, pressure: 45, vent: 0 },
    "Surgery": { occ: 0.55, pressure: 40, vent: 0 },
    "Pediatrics": { occ: 0.88, pressure: 75, vent: 0 },
  },
  "night-shortage": {
    "ICU": { occ: 0.78, pressure: 90, vent: 0.7 },
    "ER": { occ: 0.85, pressure: 95, vent: 0.6 },
    "General Medicine": { occ: 0.72, pressure: 78, vent: 0 },
    "Pulmonology": { occ: 0.65, pressure: 70, vent: 0.5 },
    "Cardiology": { occ: 0.7, pressure: 72, vent: 0 },
    "Surgery": { occ: 0.6, pressure: 65, vent: 0 },
    "Pediatrics": { occ: 0.55, pressure: 60, vent: 0 },
  },
  "mass-casualty": {
    "ICU": { occ: 0.98, pressure: 98, vent: 1.0 },
    "ER": { occ: 1.0, pressure: 99, vent: 0.95 },
    "General Medicine": { occ: 0.85, pressure: 70, vent: 0 },
    "Pulmonology": { occ: 0.7, pressure: 60, vent: 0.6 },
    "Cardiology": { occ: 0.78, pressure: 70, vent: 0 },
    "Surgery": { occ: 0.96, pressure: 95, vent: 0 },
    "Pediatrics": { occ: 0.5, pressure: 35, vent: 0 },
  },
};

export function getDeptState(scenario: ScenarioId, optimized = false): DeptState[] {
  return (Object.keys(DEPT_BASE) as Dept[]).map(dept => {
    const base = DEPT_BASE[dept];
    const profile = SCENARIO_PROFILE[scenario][dept]!;

    // Optimization reduces pressure & redistributes
    const occMul = optimized ? 0.88 : 1;
    const pressureMul = optimized ? 0.7 : 1;

    const occupied = Math.round(base.beds * profile.occ * occMul);
    const cleaning = Math.round(base.beds * (optimized ? 0.04 : 0.06));
    const blocked = Math.round(base.beds * (optimized ? 0.02 : 0.05));
    const ready = Math.max(0, base.beds - occupied - cleaning - blocked);
    const ventInUse = Math.round(base.ventTotal * profile.vent * (optimized ? 0.85 : 1));
    const monitorsInUse = Math.round(base.beds * 0.6 * profile.occ);
    const pressure = Math.min(100, Math.round(profile.pressure * pressureMul));

    const status: WardStatus = pressure >= 80 ? "overload" : pressure >= 60 ? "rising" : "healthy";

    return {
      name: dept,
      beds: base.beds, occupied, cleaning, blocked, ready,
      doctors: base.doctors, nurses: base.nurses,
      ventInUse, ventTotal: base.ventTotal,
      monitorsInUse, staffPressure: pressure, status,
    };
  });
}

export function getFlagshipMetrics(scenario: ScenarioId, optimized = false): FlagshipMetrics {
  const depts = getDeptState(scenario, optimized);
  const totalBeds = depts.reduce((s, d) => s + d.beds, 0);
  const totalOcc = depts.reduce((s, d) => s + d.occupied, 0);
  const icu = depts.find(d => d.name === "ICU")!;
  const er = depts.find(d => d.name === "ER")!;

  const baseWait: Record<ScenarioId, number> = {
    "normal": 18, "evening-surge": 48, "icu-overload": 38,
    "dengue-rise": 42, "night-shortage": 55, "mass-casualty": 72,
  };
  const wait = optimized ? Math.round(baseWait[scenario] * 0.55) : baseWait[scenario];

  const idleEquipment = optimized ? 6 : 22;
  const delayedTransfers = optimized ? 3 : (scenario === "mass-casualty" ? 18 : 12);
  const imbalance = Math.round(depts.reduce((s, d) => s + Math.abs(d.staffPressure - 60), 0) / depts.length);
  const costSaved = optimized ? 8.4 + (scenario === "mass-casualty" ? 6 : 0) : 0;
  const score = optimized ? 91 : Math.max(35, 78 - depts.filter(d => d.status === "overload").length * 12);

  return {
    occupancyPct: Math.round((totalOcc / totalBeds) * 100),
    avgWaitMin: wait,
    icuLoadPct: Math.round((icu.occupied / icu.beds) * 100),
    idleEquipment, delayedTransfers, staffImbalance: imbalance,
    costSavedLakhs: costSaved, optimizationScore: score,
  };
}

export interface AIRecommendation {
  id: string;
  action: string;
  reason: string;
  urgency: "critical" | "high" | "medium";
  expectedGain: string;
  confidence: number;
  category: "beds" | "equipment" | "staff" | "flow";
}

export function getAIRecommendations(scenario: ScenarioId): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  if (scenario === "icu-overload" || scenario === "mass-casualty") {
    recs.push({
      id: "r1", action: "Redirect 2 idle ventilators from Pulmonology → ICU",
      reason: "ICU at 95%, ventilator demand peaking. Pulmonology has 2 spare units idle 4h+",
      urgency: "critical", expectedGain: "Frees ICU capacity for 2 critical patients",
      confidence: 94, category: "equipment",
    });
  }
  if (scenario === "evening-surge" || scenario === "mass-casualty") {
    recs.push({
      id: "r2", action: "Move 4 monitors from Ward B → ER triage",
      reason: "ER triage backlog growing. Ward B monitors idle since shift change",
      urgency: "high", expectedGain: "Reduces triage time by ~12 min per patient",
      confidence: 89, category: "equipment",
    });
  }
  if (scenario !== "normal") {
    recs.push({
      id: "r3", action: "Accelerate 8 discharge-ready patients in General Medicine",
      reason: "Pharmacy clearance + billing complete. Beds blocked unnecessarily",
      urgency: "high", expectedGain: "Frees 8 general beds within 90 min",
      confidence: 92, category: "flow",
    });
  }
  if (scenario === "evening-surge" || scenario === "night-shortage" || scenario === "mass-casualty") {
    recs.push({
      id: "r4", action: "Reassign 3 nurses from Pediatrics → ER",
      reason: "Pediatrics at 50% load, ER understaffed by 30% relative to demand",
      urgency: "high", expectedGain: "Improves ER nurse:patient ratio to safe 1:4",
      confidence: 87, category: "staff",
    });
  }
  if (scenario === "dengue-rise") {
    recs.push({
      id: "r5", action: "Open overflow beds in Cardiology for stable Pulmonology patients",
      reason: "Pulmonology at 94%, Cardiology at 60%. Dengue stable cases compatible",
      urgency: "high", expectedGain: "Adds 12-bed buffer for incoming febrile cases",
      confidence: 85, category: "beds",
    });
  }
  if (scenario === "night-shortage") {
    recs.push({
      id: "r6", action: "Activate float-pool nurses + on-call backup",
      reason: "8 nurses on leave, ER + ICU running critical staffing",
      urgency: "critical", expectedGain: "Restores safe staffing within 45 min",
      confidence: 91, category: "staff",
    });
  }
  recs.push({
    id: "r7", action: "Optimize OT scheduling — defer 3 elective surgeries by 2h",
    reason: "Surgery beds high. Defer non-urgent to absorb emergency intake",
    urgency: "medium", expectedGain: "Frees 3 post-op beds for trauma",
    confidence: 82, category: "flow",
  });

  return recs;
}

// 24-hour realistic operational signal — admissions follow real hospital rhythm
export function getOperationalRhythm(scenario: ScenarioId) {
  const surgeMul = scenario === "evening-surge" ? 1.6 : scenario === "mass-casualty" ? 1.9 : 1;
  return Array.from({ length: 24 }, (_, h) => {
    // OPD peak 10am, ER evening peak 7pm, discharges 11am-3pm
    const opd = h >= 9 && h <= 13 ? 18 - Math.abs(h - 11) * 3 : 4;
    const er = (h >= 17 && h <= 21 ? 14 - Math.abs(h - 19) * 2 : 5) * surgeMul;
    const discharges = h >= 11 && h <= 15 ? 12 - Math.abs(h - 13) * 2 : 3;
    const icuPressure = 55 + (h >= 18 || h <= 6 ? 15 : 5) + (scenario === "icu-overload" ? 25 : 0);
    return {
      hour: `${h.toString().padStart(2, "0")}:00`,
      admissions: Math.round(opd + er),
      discharges,
      icuLoad: Math.min(100, Math.round(icuPressure)),
    };
  });
}

// 90-day historical baseline
export function get90DayHistory() {
  return Array.from({ length: 90 }, (_, i) => {
    const day = i + 1;
    const weekend = (day % 7 === 0 || day % 7 === 6);
    const monsoon = day > 55; // dengue season ramp
    const occ = 72 + (weekend ? -6 : 4) + (monsoon ? 8 : 0) + Math.sin(i / 4) * 5;
    const adm = 58 + (weekend ? -10 : 6) + (monsoon ? 12 : 0) + Math.sin(i / 5) * 8;
    const icu = 68 + (monsoon ? 10 : 0) + Math.sin(i / 6) * 7;
    return {
      day: `D${day}`,
      occupancy: Math.min(98, Math.round(occ)),
      admissions: Math.round(adm),
      icuUsage: Math.min(98, Math.round(icu)),
    };
  });
}

export function getBeforeAfterComparison(scenario: ScenarioId) {
  const before = getFlagshipMetrics(scenario, false);
  const after = getFlagshipMetrics(scenario, true);
  return [
    { metric: "Occupancy %", before: before.occupancyPct, after: after.occupancyPct, unit: "%", improvement: "balanced" },
    { metric: "Avg Wait Time", before: before.avgWaitMin, after: after.avgWaitMin, unit: "min", improvement: "down" },
    { metric: "ICU Load", before: before.icuLoadPct, after: after.icuLoadPct, unit: "%", improvement: "down" },
    { metric: "Idle Equipment", before: before.idleEquipment, after: after.idleEquipment, unit: "units", improvement: "down" },
    { metric: "Delayed Transfers", before: before.delayedTransfers, after: after.delayedTransfers, unit: "", improvement: "down" },
    { metric: "Staff Imbalance", before: before.staffImbalance, after: after.staffImbalance, unit: "pts", improvement: "down" },
  ];
}
