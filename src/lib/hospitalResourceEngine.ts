/**
 * Hospital Resource Optimization Engine — Part R1
 * Dynamic equipment reallocation, demand/supply matching, emergency reserves.
 * Tenant-scoped, deterministic per session.
 */

export type Department =
  | "ICU" | "ER" | "Pulmonology" | "General Medicine"
  | "Cardiology" | "Surgery" | "Pediatrics";

export type EquipmentType =
  | "Ventilator" | "Monitor" | "Oxygen Unit" | "Wheelchair"
  | "Infusion Pump" | "ECG Unit" | "Suction Unit" | "Stretcher";

export type AssetStatus = "in-use" | "idle" | "maintenance" | "reserved";
export type Priority = "critical" | "high" | "medium" | "low";

export interface Asset {
  id: string;
  type: EquipmentType;
  department: Department;
  status: AssetStatus;
  idleHours: number;
  patientSeverity: "critical" | "stable" | "none";
  maintenanceOk: boolean;
}

export interface DepartmentDemand {
  department: Department;
  beds: { total: number; occupied: number };
  ventilators: { needed: number; available: number };
  monitors: { needed: number; available: number };
  oxygen: { needed: number; available: number };
  shortageScore: number; // 0-100
}

export interface ReallocationMove {
  id: string;
  assetId: string;
  type: EquipmentType;
  from: Department;
  to: Department;
  idleHours: number;
  priority: Priority;
  reason: string;
  impact: string;
}

export interface ReserveLevel {
  department: Department;
  type: EquipmentType;
  threshold: number;
  current: number;
  status: "green" | "yellow" | "red";
}

const DEPARTMENTS: Department[] = [
  "ICU", "ER", "Pulmonology", "General Medicine", "Cardiology", "Surgery", "Pediatrics",
];

const DEPT_BED_CAPACITY: Record<Department, number> = {
  "ICU": 20, "ER": 30, "Pulmonology": 25, "General Medicine": 80,
  "Cardiology": 40, "Surgery": 55, "Pediatrics": 50,
};

// Compatibility — where a vent/monitor "should" prioritize going
const VENT_PRIORITY: Record<Department, number> = {
  "ICU": 100, "ER": 90, "Pulmonology": 80, "Surgery": 60,
  "Cardiology": 50, "General Medicine": 25, "Pediatrics": 40,
};

// Seeded pseudo-random for stable per-session data
let seed = 42;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

function buildAssets(): Asset[] {
  seed = 42; // reset for determinism
  const assets: Asset[] = [];
  const counts: Record<EquipmentType, number> = {
    "Ventilator": 18, "Monitor": 45, "Oxygen Unit": 60, "Wheelchair": 22,
    "Infusion Pump": 35, "ECG Unit": 14, "Suction Unit": 16, "Stretcher": 20,
  };
  let n = 1;
  (Object.keys(counts) as EquipmentType[]).forEach(type => {
    for (let i = 0; i < counts[type]; i++) {
      const dept = pick(DEPARTMENTS);
      const r = rand();
      const status: AssetStatus =
        r < 0.62 ? "in-use" : r < 0.88 ? "idle" : r < 0.96 ? "maintenance" : "reserved";
      const idleHours = status === "idle" ? Math.round(rand() * 10 + 1) : 0;
      const sev: Asset["patientSeverity"] =
        status === "in-use" ? (rand() < 0.35 ? "critical" : "stable") : "none";
      assets.push({
        id: `${type.slice(0, 3).toUpperCase()}-${String(n).padStart(3, "0")}`,
        type, department: dept, status, idleHours,
        patientSeverity: sev,
        maintenanceOk: status !== "maintenance",
      });
      n++;
    }
  });
  return assets;
}

let _assets: Asset[] | null = null;
export function getAssets(): Asset[] {
  if (!_assets) _assets = buildAssets();
  return _assets;
}

export function applyOptimization() {
  const assets = getAssets();
  // Move idle vents/monitors from low-priority depts to ICU/ER
  const moves = getReallocationMoves().slice(0, 8);
  moves.forEach(m => {
    const a = assets.find(x => x.id === m.assetId);
    if (a) { a.department = m.to; a.status = "in-use"; a.idleHours = 0; }
  });
}

export function getOverviewMetrics() {
  const assets = getAssets();
  const total = assets.length;
  const inUse = assets.filter(a => a.status === "in-use").length;
  const idle = assets.filter(a => a.status === "idle").length;
  const utilization = Math.round((inUse / total) * 100);
  const moves = getReallocationMoves();
  const reserves = getReserveLevels();
  const reserveOk = reserves.filter(r => r.status !== "red").length;
  const reserveReadiness = Math.round((reserveOk / reserves.length) * 100);
  const costSaved = idle * 4200 + moves.length * 18000; // ₹ estimate
  const throughputGain = Math.min(42, Math.round(idle * 0.8 + moves.length * 1.6));
  const optimizationScore = Math.min(98,
    Math.round(utilization * 0.5 + reserveReadiness * 0.3 + (100 - idle * 2) * 0.2)
  );
  return {
    total, inUse, idle, utilization,
    opportunities: moves.length,
    reserveReadiness,
    costSaved,
    throughputGain,
    optimizationScore,
  };
}

export function getDepartmentDemand(): DepartmentDemand[] {
  const assets = getAssets();
  return DEPARTMENTS.map(dept => {
    const deptAssets = assets.filter(a => a.department === dept);
    const ventAvail = deptAssets.filter(a => a.type === "Ventilator" && a.status === "idle").length;
    const monAvail = deptAssets.filter(a => a.type === "Monitor" && a.status === "idle").length;
    const oxyAvail = deptAssets.filter(a => a.type === "Oxygen Unit" && a.status === "idle").length;
    const beds = DEPT_BED_CAPACITY[dept];
    // demand profile by department type
    const demandMul = dept === "ICU" ? 1.4 : dept === "ER" ? 1.3 : dept === "Pulmonology" ? 1.1 : 0.6;
    const ventNeed = Math.round(beds * 0.18 * demandMul);
    const monNeed = Math.round(beds * 0.35 * demandMul);
    const oxyNeed = Math.round(beds * 0.4 * demandMul);
    const occupied = Math.round(beds * (0.55 + (rand() - 0.5) * 0.3));
    const shortage =
      Math.max(0, ventNeed - ventAvail) * 6 +
      Math.max(0, monNeed - monAvail) * 2 +
      Math.max(0, oxyNeed - oxyAvail) * 1.5;
    return {
      department: dept,
      beds: { total: beds, occupied: Math.min(beds, occupied) },
      ventilators: { needed: ventNeed, available: ventAvail },
      monitors: { needed: monNeed, available: monAvail },
      oxygen: { needed: oxyNeed, available: oxyAvail },
      shortageScore: Math.min(100, Math.round(shortage)),
    };
  });
}

export function getIdleAssets(): Asset[] {
  return getAssets()
    .filter(a => a.status === "idle")
    .sort((a, b) => b.idleHours - a.idleHours);
}

export function getReallocationMoves(): ReallocationMove[] {
  const assets = getAssets();
  const idle = assets.filter(a => a.status === "idle" && a.maintenanceOk);
  const moves: ReallocationMove[] = [];

  idle.forEach(a => {
    const fromPri = a.type === "Ventilator" ? VENT_PRIORITY[a.department] : 50;
    let to: Department | null = null;
    let priority: Priority = "low";
    let reason = "";

    if (a.type === "Ventilator") {
      if (fromPri < 60 && a.idleHours >= 2) {
        to = a.idleHours >= 5 ? "ICU" : "ER";
        priority = a.idleHours >= 5 ? "critical" : "high";
        reason = `Idle ${a.idleHours}h in low-priority ward`;
      }
    } else if (a.type === "Monitor" && a.idleHours >= 2) {
      to = pick(["ICU", "ER", "Cardiology"]);
      priority = a.idleHours >= 4 ? "high" : "medium";
      reason = `Monitor unused ${a.idleHours}h`;
    } else if (a.type === "Oxygen Unit" && a.idleHours >= 3) {
      to = "Pulmonology";
      priority = "high";
      reason = `Oxygen unit idle — Pulmonology demand rising`;
    } else if (a.type === "Wheelchair" && a.idleHours >= 2 && a.department !== "ER") {
      to = "ER";
      priority = "medium";
      reason = `Wheelchair idle — needed at ER intake`;
    } else if (a.type === "Infusion Pump" && a.idleHours >= 3) {
      to = "ICU";
      priority = "medium";
      reason = `Infusion pump idle — ICU demand`;
    }

    if (to && to !== a.department) {
      moves.push({
        id: `mv-${a.id}`,
        assetId: a.id, type: a.type,
        from: a.department, to, idleHours: a.idleHours,
        priority, reason,
        impact: priority === "critical"
          ? "Prevents ICU shortage in next 2h"
          : priority === "high"
          ? "Reduces wait time by ~12 min"
          : "Improves utilization by ~3%",
      });
    }
  });

  return moves
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 24);
}

export function getReserveLevels(): ReserveLevel[] {
  const assets = getAssets();
  const reserves: { dept: Department; type: EquipmentType; threshold: number }[] = [
    { dept: "ICU", type: "Ventilator", threshold: 2 },
    { dept: "ER", type: "Monitor", threshold: 4 },
    { dept: "ICU", type: "Oxygen Unit", threshold: 6 },
    { dept: "ER", type: "Stretcher", threshold: 5 },
    { dept: "Pulmonology", type: "Oxygen Unit", threshold: 4 },
    { dept: "ICU", type: "Infusion Pump", threshold: 3 },
    { dept: "ER", type: "Wheelchair", threshold: 3 },
    { dept: "Surgery", type: "Suction Unit", threshold: 2 },
  ];

  return reserves.map(r => {
    const current = assets.filter(a =>
      a.department === r.dept && a.type === r.type &&
      (a.status === "idle" || a.status === "reserved")
    ).length;
    const ratio = current / r.threshold;
    const status: ReserveLevel["status"] = ratio >= 1 ? "green" : ratio >= 0.5 ? "yellow" : "red";
    return { department: r.dept, type: r.type, threshold: r.threshold, current, status };
  });
}

export function getUtilizationTrend() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    utilization: Math.round(58 + Math.sin(i / 3.5) * 12 + (i > 18 || i < 6 ? -8 : 6)),
    optimized: Math.round(72 + Math.sin(i / 3.5) * 8 + (i > 18 || i < 6 ? -4 : 4)),
  }));
}

export function getIdleByDepartment() {
  const assets = getAssets();
  return DEPARTMENTS.map(d => ({
    department: d,
    idle: assets.filter(a => a.department === d && a.status === "idle").length,
    inUse: assets.filter(a => a.department === d && a.status === "in-use").length,
  }));
}

export function getSavingsTrend() {
  return Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    saved: Math.round(40 + i * 18 + rand() * 20),
    avoided: Math.round(80 + i * 24 + rand() * 30),
  }));
}

export function getOptimizationScoreTrend() {
  return Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    score: Math.min(96, Math.round(62 + i * 2.4 + Math.sin(i) * 3)),
  }));
}

export function getLiveAlerts() {
  const moves = getReallocationMoves();
  const reserves = getReserveLevels();
  const lowReserves = reserves.filter(r => r.status === "red");
  const alerts: { id: string; type: "info" | "warn" | "critical" | "success"; text: string; time: string }[] = [];

  moves.slice(0, 3).forEach((m, i) => {
    alerts.push({
      id: `al-mv-${i}`,
      type: m.priority === "critical" ? "critical" : "warn",
      text: `Move ${m.assetId} (${m.type}) → ${m.to} — ${m.reason}`,
      time: `${i + 2}m ago`,
    });
  });
  lowReserves.forEach((r, i) => {
    alerts.push({
      id: `al-res-${i}`,
      type: "critical",
      text: `${r.type} reserve below threshold in ${r.department} (${r.current}/${r.threshold})`,
      time: `${i * 3 + 4}m ago`,
    });
  });
  alerts.push({
    id: "al-success", type: "success",
    text: "5 assets optimized successfully in last hour", time: "12m ago",
  });
  return alerts.slice(0, 8);
}
