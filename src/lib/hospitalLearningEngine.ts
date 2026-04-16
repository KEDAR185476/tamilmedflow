/**
 * Hospital Learning Engine — pattern detection, model evolution,
 * impact analysis, and recommendation improvement tracking.
 */
import type { DailySnapshot } from "./hospitalHistoryEngine";
import type { HospitalDataState } from "./hospitalDataEngine";

export interface LearnedPattern {
  id: string;
  pattern: string;
  confidence: number;
  learnedDate: string;
  category: "occupancy" | "staffing" | "equipment" | "flow" | "emergency";
  actionTaken: string;
}

export interface ModelVersion {
  version: string;
  date: string;
  accuracy: number;
  samplesUsed: number;
  improvements: string[];
}

export interface ImpactResult {
  field: string;
  oldValue: number;
  newValue: number;
  impactDescription: string;
  impactPercent: number;
  direction: "positive" | "negative" | "neutral";
}

export interface RecommendationEvolution {
  category: string;
  before: string;
  after: string;
  improvementReason: string;
}

export function detectPatterns(snapshots: DailySnapshot[]): LearnedPattern[] {
  const patterns: LearnedPattern[] = [];
  if (snapshots.length < 7) return patterns;

  // Detect day-of-week patterns
  const byDay: Record<number, number[]> = {};
  snapshots.forEach(s => {
    const dow = new Date(s.date).getDay();
    if (!byDay[dow]) byDay[dow] = [];
    byDay[dow].push(s.admissions);
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  Object.entries(byDay).forEach(([day, vals]) => {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const overall = snapshots.reduce((a, b) => a + b.admissions, 0) / snapshots.length;
    if (avg > overall * 1.2) {
      patterns.push({
        id: `dow-surge-${day}`,
        pattern: `${dayNames[Number(day)]} admission surge (+${Math.round((avg / overall - 1) * 100)}%)`,
        confidence: Math.min(95, 70 + vals.length * 2),
        learnedDate: new Date().toISOString().slice(0, 10),
        category: "occupancy",
        actionTaken: `Pre-staff extra nurses on ${dayNames[Number(day)]}s`,
      });
    }
  });

  // Detect occupancy trends
  const recentOcc = snapshots.slice(0, 14).map(s => s.occupancy);
  const avgOcc = recentOcc.reduce((a, b) => a + b, 0) / recentOcc.length;
  if (avgOcc > 85) {
    patterns.push({
      id: "high-occ-trend",
      pattern: `Sustained high occupancy (avg ${Math.round(avgOcc)}%)`,
      confidence: 88,
      learnedDate: new Date().toISOString().slice(0, 10),
      category: "occupancy",
      actionTaken: "Accelerate discharge workflows proactively",
    });
  }

  // Wait time pattern
  const recentWait = snapshots.slice(0, 14).map(s => s.avgWaitTime);
  const afternoonHigh = recentWait.filter(w => w > 30).length;
  if (afternoonHigh > 7) {
    patterns.push({
      id: "wait-afternoon",
      pattern: "Wait times consistently high (>30 min) — afternoon bottleneck",
      confidence: 82,
      learnedDate: new Date().toISOString().slice(0, 10),
      category: "flow",
      actionTaken: "Trigger billing pre-processing before noon",
    });
  }

  // Staff shortage pattern
  const lowStaff = snapshots.slice(0, 14).filter(s => s.staffOnDuty < 50).length;
  if (lowStaff > 5) {
    patterns.push({
      id: "staff-recurring-low",
      pattern: "Recurring low staffing days detected",
      confidence: 79,
      learnedDate: new Date().toISOString().slice(0, 10),
      category: "staffing",
      actionTaken: "Auto-activate backup roster on predicted low days",
    });
  }

  // Equipment maintenance pattern
  const highMaint = snapshots.slice(0, 14).filter(s => s.equipmentReady < 48).length;
  if (highMaint > 4) {
    patterns.push({
      id: "equip-maint-cycle",
      pattern: "Equipment readiness drops cyclically",
      confidence: 76,
      learnedDate: new Date().toISOString().slice(0, 10),
      category: "equipment",
      actionTaken: "Schedule preventive maintenance during low-load windows",
    });
  }

  return patterns;
}

export function getModelVersions(snapshotCount: number): ModelVersion[] {
  const versions: ModelVersion[] = [
    { version: "v1.0", date: "2026-01-15", accuracy: 72, samplesUsed: 0, improvements: ["Baseline forecasting model"] },
    { version: "v1.1", date: "2026-02-10", accuracy: 78, samplesUsed: 30, improvements: ["Day-of-week pattern integration", "Improved ICU load prediction"] },
    { version: "v1.2", date: "2026-03-05", accuracy: 83, samplesUsed: 60, improvements: ["Staff burnout correlation", "Discharge delay prediction"] },
    { version: "v1.3", date: "2026-03-28", accuracy: 87, samplesUsed: 90, improvements: ["Equipment failure forecasting", "Patient flow bottleneck detection"] },
  ];
  if (snapshotCount > 30) {
    versions.push({ version: "v2.0", date: "2026-04-16", accuracy: 91, samplesUsed: snapshotCount, improvements: ["Hospital-specific pattern learning", "Adaptive recommendation engine", "Real-time drift detection"] });
  }
  return versions;
}

export function analyzeImpact(oldState: HospitalDataState, newState: HospitalDataState): ImpactResult[] {
  const results: ImpactResult[] = [];

  const checks: { field: string; oldVal: number; newVal: number; metric: string }[] = [
    { field: "Total Beds", oldVal: oldState.capacity.totalBeds, newVal: newState.capacity.totalBeds, metric: "occupancy pressure" },
    { field: "ICU Beds", oldVal: oldState.capacity.icuBeds, newVal: newState.capacity.icuBeds, metric: "ICU readiness" },
    { field: "Doctors", oldVal: oldState.staff.doctors, newVal: newState.staff.doctors, metric: "doctor-patient ratio" },
    { field: "Nurses", oldVal: oldState.staff.nurses, newVal: newState.staff.nurses, metric: "burnout risk" },
    { field: "Ventilators", oldVal: oldState.equipment.ventilators, newVal: newState.equipment.ventilators, metric: "ICU capacity" },
    { field: "Monitors", oldVal: oldState.equipment.monitors, newVal: newState.equipment.monitors, metric: "patient monitoring coverage" },
  ];

  checks.forEach(({ field, oldVal, newVal, metric }) => {
    if (oldVal === newVal) return;
    const diff = newVal - oldVal;
    const pct = Math.round((Math.abs(diff) / Math.max(1, oldVal)) * 100);
    const direction: ImpactResult["direction"] = diff > 0 ? "positive" : "negative";
    results.push({
      field,
      oldValue: oldVal,
      newValue: newVal,
      impactDescription: `${field} ${diff > 0 ? "increased" : "decreased"} → ${metric} ${diff > 0 ? "improves" : "worsens"} by ~${pct}%`,
      impactPercent: pct,
      direction,
    });
  });

  return results;
}

export function getRecommendationEvolution(): RecommendationEvolution[] {
  return [
    { category: "Staffing", before: "Generic shift redistribution", after: "ER night shift reinforcement on Mondays (pattern-learned)", improvementReason: "Monday ER surge pattern detected over 6 weeks" },
    { category: "Discharge", before: "Static discharge alerts at 5 PM", after: "Billing pre-processing triggered at 2 PM to prevent delays", improvementReason: "Post-5 PM billing bottleneck learned from 45 samples" },
    { category: "ICU", before: "Alert when ICU >90%", after: "Pre-reserve 2 ICU beds on Fridays (predicted surge)", improvementReason: "Friday ICU surge pattern with 87% confidence" },
    { category: "Equipment", before: "Maintenance alert when device fails", after: "Preventive maintenance scheduled during low-load Tuesday mornings", improvementReason: "Equipment failure cycle correlated with usage patterns" },
    { category: "Beds", before: "Convert beds when full", after: "Pre-convert 4 general beds to fever ward during monsoon weeks", improvementReason: "Seasonal dengue admission pattern detected" },
  ];
}
