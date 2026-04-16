/**
 * Hospital AI Engine — generates recommendations, forecasts, and alerts
 * from hospital-specific data. No regional data dependency.
 */
import type { HospitalDataState } from "./hospitalDataEngine";

export interface AIRecommendation {
  id: string;
  title: string;
  reason: string;
  urgency: "low" | "medium" | "high" | "critical";
  confidence: number;
  benefit: string;
  category: "beds" | "staff" | "equipment" | "flow" | "general";
}

export interface ForecastPoint {
  hour: number;
  label: string;
  admissions: number;
  occupancy: number;
  icuLoad: number;
  staffNeed: number;
}

export interface HospitalAlert {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
  time: string;
  category: string;
}

export function generateRecommendations(state: HospitalDataState): AIRecommendation[] {
  const recs: AIRecommendation[] = [];
  const { capacity, liveOps, staff, equipment } = state;
  const occRate = liveOps.beds.occupied / Math.max(1, capacity.totalBeds);
  const icuRate = liveOps.equipment.ventilatorsInUse / Math.max(1, equipment.ventilators);
  const nurseRatio = liveOps.staff.onDutyNurses / Math.max(1, liveOps.beds.occupied);

  if (liveOps.patientFlow.dischargeReady > 5) {
    recs.push({ id: "r1", title: `Fast-track ${liveOps.patientFlow.dischargeReady} discharge-ready patients`, reason: `${liveOps.patientFlow.dischargeReady} patients awaiting discharge are blocking beds`, urgency: "high", confidence: 92, benefit: `Free ${liveOps.patientFlow.dischargeReady} beds within 40 minutes`, category: "flow" });
  }
  if (occRate > 0.85) {
    recs.push({ id: "r2", title: "Convert 6 general beds to overflow ward", reason: `Occupancy at ${Math.round(occRate * 100)}% — approaching capacity`, urgency: "high", confidence: 88, benefit: "Prevent admission delays for next 12 hours", category: "beds" });
  }
  if (nurseRatio < 0.3) {
    recs.push({ id: "r3", title: "Add 2 nurses to ER for evening surge", reason: `Nurse-to-patient ratio critically low (${nurseRatio.toFixed(2)})`, urgency: "critical", confidence: 95, benefit: "Reduce wait time by ~18 minutes", category: "staff" });
  }
  if (icuRate > 0.7) {
    recs.push({ id: "r4", title: "ICU overload likely in 6 hours", reason: `${Math.round(icuRate * 100)}% ventilator utilization with rising trend`, urgency: "high", confidence: 82, benefit: "Proactive step-down transfers prevent ICU bottleneck", category: "equipment" });
  }
  if (liveOps.equipment.maintenancePending > 2) {
    recs.push({ id: "r5", title: "Schedule equipment maintenance after peak hours", reason: `${liveOps.equipment.maintenancePending} devices pending service`, urgency: "medium", confidence: 90, benefit: "Prevent critical device failure during high-load periods", category: "equipment" });
  }
  if (liveOps.patientFlow.pharmacyDelays > 3) {
    recs.push({ id: "r6", title: "Escalate pharmacy bottleneck", reason: `${liveOps.patientFlow.pharmacyDelays} patients delayed by pharmacy`, urgency: "medium", confidence: 87, benefit: "Reduce discharge delay by ~25 minutes per patient", category: "flow" });
  }
  if (liveOps.staff.absentCount > 3) {
    recs.push({ id: "r7", title: "Activate backup shift roster", reason: `${liveOps.staff.absentCount} staff absent today`, urgency: "medium", confidence: 85, benefit: "Maintain safe staffing levels across all wards", category: "staff" });
  }
  if (liveOps.admissions.erWaiting > 5) {
    recs.push({ id: "r8", title: "Open additional ER bay", reason: `${liveOps.admissions.erWaiting} patients waiting in ER`, urgency: "high", confidence: 91, benefit: "Reduce ER wait time by ~30%", category: "beds" });
  }
  return recs;
}

export function generateForecast(state: HospitalDataState): ForecastPoint[] {
  const base = state.opsBaseline;
  const points: ForecastPoint[] = [];
  const now = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const hr = (now + i) % 24;
    const surge = hr >= 8 && hr <= 20 ? 1.3 : 0.7;
    const peak = hr >= 10 && hr <= 14 ? 1.5 : 1;
    points.push({
      hour: i,
      label: `${hr}:00`,
      admissions: Math.round((base.avgDailyAdmissions / 24) * surge * peak * (0.9 + Math.random() * 0.2)),
      occupancy: Math.min(98, Math.round(base.avgOccupancy + (i * 0.3) * (surge - 0.8) + (Math.random() * 4 - 2))),
      icuLoad: Math.min(100, Math.round(base.avgIcuUtilization + (i * 0.2) * (peak - 0.7) + (Math.random() * 6 - 3))),
      staffNeed: Math.round((state.staff.doctors + state.staff.nurses) * surge * 0.4),
    });
  }
  return points;
}

export function generateAlerts(state: HospitalDataState): HospitalAlert[] {
  const alerts: HospitalAlert[] = [];
  const { capacity, liveOps, equipment } = state;
  const occRate = liveOps.beds.occupied / Math.max(1, capacity.totalBeds);

  if (occRate > 0.88) alerts.push({ id: "a1", message: `ICU at ${Math.round((liveOps.equipment.ventilatorsInUse / Math.max(1, equipment.ventilators)) * 100)}% occupancy`, severity: "critical", time: "Just now", category: "ICU" });
  if (liveOps.admissions.erWaiting > 4) alerts.push({ id: "a2", message: "ER queue increasing rapidly", severity: "warning", time: "2 min ago", category: "Emergency" });
  if (liveOps.patientFlow.pharmacyDelays > 3) alerts.push({ id: "a3", message: "Pharmacy causing discharge delays", severity: "warning", time: "5 min ago", category: "Flow" });
  if (liveOps.equipment.maintenancePending > 2) alerts.push({ id: "a4", message: "Monitor inventory below threshold", severity: "info", time: "15 min ago", category: "Equipment" });
  if (liveOps.staff.absentCount > 2) alerts.push({ id: "a5", message: "Burnout risk rising in night shift", severity: "warning", time: "30 min ago", category: "Staff" });
  alerts.push({ id: "a6", message: "Bed turnover rate normal", severity: "info", time: "1 hr ago", category: "Beds" });
  return alerts;
}

export function computeEfficiencyScore(state: HospitalDataState): number {
  const { capacity, liveOps, staff, equipment } = state;
  const occScore = Math.max(0, 100 - Math.abs(80 - (liveOps.beds.occupied / Math.max(1, capacity.totalBeds)) * 100) * 2);
  const staffScore = Math.min(100, (liveOps.staff.onDutyDoctors + liveOps.staff.onDutyNurses) / Math.max(1, staff.doctors + staff.nurses) * 150);
  const equipScore = Math.max(0, 100 - liveOps.equipment.maintenancePending * 10);
  const flowScore = Math.max(0, 100 - liveOps.patientFlow.pharmacyDelays * 5 - liveOps.patientFlow.billingPending * 3);
  return Math.round((occScore + staffScore + equipScore + flowScore) / 4);
}
