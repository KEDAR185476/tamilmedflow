/**
 * Hospital History Engine — stores daily snapshots and provides trend data.
 * All data scoped by tenant_id in localStorage.
 */
import type { HospitalDataState } from "./hospitalDataEngine";

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  occupancy: number;
  icuUtilization: number;
  admissions: number;
  discharges: number;
  avgWaitTime: number;
  staffOnDuty: number;
  equipmentReady: number;
  alertCount: number;
  efficiencyScore: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

const HISTORY_PREFIX = "medflow_hospital_history_";

function historyKey(tenantId: string) {
  return HISTORY_PREFIX + tenantId;
}

export function loadHistory(tenantId: string): DailySnapshot[] {
  try {
    const raw = localStorage.getItem(historyKey(tenantId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHistory(tenantId: string, history: DailySnapshot[]): void {
  localStorage.setItem(historyKey(tenantId), JSON.stringify(history.slice(0, 365)));
}

export function recordSnapshot(tenantId: string, state: HospitalDataState, efficiencyScore: number): DailySnapshot {
  const today = new Date().toISOString().slice(0, 10);
  const { capacity, liveOps, staff, equipment } = state;

  const snapshot: DailySnapshot = {
    date: today,
    occupancy: Math.round((liveOps.beds.occupied / Math.max(1, capacity.totalBeds)) * 100),
    icuUtilization: Math.round((liveOps.equipment.ventilatorsInUse / Math.max(1, equipment.ventilators)) * 100),
    admissions: liveOps.admissions.todayAdmitted,
    discharges: state.opsBaseline.avgDailyDischarges,
    avgWaitTime: state.opsBaseline.avgWaitTime,
    staffOnDuty: liveOps.staff.onDutyDoctors + liveOps.staff.onDutyNurses,
    equipmentReady: equipment.ventilators + equipment.monitors - liveOps.equipment.maintenancePending,
    alertCount: (liveOps.admissions.erWaiting > 4 ? 1 : 0) + (liveOps.equipment.maintenancePending > 2 ? 1 : 0) + (liveOps.staff.absentCount > 2 ? 1 : 0),
    efficiencyScore,
  };

  const history = loadHistory(tenantId);
  const existingIdx = history.findIndex(s => s.date === today);
  if (existingIdx >= 0) {
    history[existingIdx] = snapshot;
  } else {
    history.unshift(snapshot);
  }
  saveHistory(tenantId, history);
  return snapshot;
}

/** Generate simulated historical data for demo purposes */
export function seedDemoHistory(tenantId: string, state: HospitalDataState): DailySnapshot[] {
  const existing = loadHistory(tenantId);
  if (existing.length >= 30) return existing;

  const { capacity, equipment } = state;
  const snapshots: DailySnapshot[] = [];
  const now = Date.now();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dayOfWeek = d.getDay();
    const weekFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1.0;
    const drift = Math.sin(i / 14) * 5;
    const improving = Math.max(0, (90 - i) * 0.15);

    snapshots.push({
      date: d.toISOString().slice(0, 10),
      occupancy: Math.round(Math.min(98, Math.max(55, 76 + drift * weekFactor + (Math.random() * 8 - 4)))),
      icuUtilization: Math.round(Math.min(100, Math.max(40, 68 + drift + (Math.random() * 10 - 5)))),
      admissions: Math.round(Math.max(10, 42 * weekFactor + (Math.random() * 10 - 5))),
      discharges: Math.round(Math.max(8, 38 * weekFactor + (Math.random() * 8 - 4))),
      avgWaitTime: Math.round(Math.max(10, 38 - improving + (Math.random() * 6 - 3))),
      staffOnDuty: Math.round(55 * weekFactor + (Math.random() * 6 - 3)),
      equipmentReady: Math.round((equipment.ventilators + equipment.monitors) * (0.88 + Math.random() * 0.1)),
      alertCount: Math.round(Math.max(0, 4 - improving * 0.3 + (Math.random() * 3 - 1))),
      efficiencyScore: Math.round(Math.min(98, Math.max(50, 68 + improving + (Math.random() * 6 - 3)))),
    });
  }

  saveHistory(tenantId, snapshots);
  return snapshots;
}

export function getTrend(snapshots: DailySnapshot[], key: keyof DailySnapshot, days: number): TrendPoint[] {
  const slice = snapshots.slice(0, days).reverse();
  return slice.map(s => ({ label: s.date.slice(5), value: s[key] as number }));
}

export function computeBenchmarks(snapshots: DailySnapshot[]) {
  if (snapshots.length < 2) return null;
  const recent = snapshots.slice(0, 7);
  const older = snapshots.slice(Math.max(0, snapshots.length - 14), snapshots.length - 7);
  if (!older.length) return null;

  const avg = (arr: DailySnapshot[], k: keyof DailySnapshot) =>
    arr.reduce((s, v) => s + (v[k] as number), 0) / arr.length;

  const occ = avg(recent, "occupancy") - avg(older, "occupancy");
  const wait = avg(recent, "avgWaitTime") - avg(older, "avgWaitTime");
  const eff = avg(recent, "efficiencyScore") - avg(older, "efficiencyScore");
  const alerts = avg(recent, "alertCount") - avg(older, "alertCount");

  return {
    occupancyChange: Math.round(occ * 10) / 10,
    waitTimeChange: Math.round(wait * 10) / 10,
    efficiencyChange: Math.round(eff * 10) / 10,
    alertChange: Math.round(alerts * 10) / 10,
  };
}
