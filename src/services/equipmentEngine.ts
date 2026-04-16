/**
 * Equipment Intelligence Engine
 * Device tracking, utilization analytics, maintenance scheduling
 * 
 * Logic basis:
 * - IPHS equipment norms for Indian public hospitals
 * - Ventilator utilization targets: 60-80% optimal, >90% critical
 * - Maintenance cycle: preventive every 90 days, corrective as-needed
 * - Equipment redistribution triggered when utilization variance >30%
 */

import { EQUIPMENT_DATA } from "@/data/staff-equipment";
import { getHospitalsByDistrict } from "@/data/hospitals";

export interface EquipmentMetrics {
  ventilatorsAvailable: number;
  ventilatorsTotal: number;
  oxygenUnitsActive: number;
  oxygenUnitsTotal: number;
  monitorsInUse: number;
  monitorsTotal: number;
  wheelchairsFree: number;
  maintenancePending: number;
  readinessScore: number;
}

export interface EquipmentItem {
  type: string;
  icon: string;
  total: number;
  inUse: number;
  available: number;
  utilization: number;
  status: "optimal" | "warning" | "critical";
}

export interface MaintenanceAlert {
  id: string;
  device: string;
  location: string;
  issue: string;
  priority: "critical" | "high" | "medium" | "low";
  dueDate: string;
}

export interface EquipmentRecommendation {
  id: string;
  action: string;
  reason: string;
  urgency: "critical" | "high" | "medium" | "low";
  impact: string;
  confidence: number;
}

export function getEquipmentMetrics(districtId: string): EquipmentMetrics {
  const equipData = districtId === "all"
    ? EQUIPMENT_DATA
    : EQUIPMENT_DATA.filter(e => e.district === districtId);

  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);

  const ventTotal = equipData.reduce((s, e) => s + e.ventilators, 0);
  const ventInUse = hospitals.reduce((s, h) => s + h.ventilatorsInUse, 0);
  const oxyTotal = hospitals.reduce((s, h) => s + h.oxygenUnits, 0);
  const oxyInUse = hospitals.reduce((s, h) => s + h.oxygenInUse, 0);
  const ctTotal = equipData.reduce((s, e) => s + e.ctScanners, 0);
  const monitorsTotal = Math.round(ventTotal * 2.5); // ~2.5 monitors per vent
  const monitorsInUse = Math.round(monitorsTotal * 0.72);
  const maintenancePending = equipData.reduce((s, e) => s + e.maintenancePending, 0);

  const utilizationAvg = ventTotal > 0 ? ventInUse / ventTotal : 0;
  const readiness = Math.round((1 - maintenancePending / Math.max(1, ventTotal + ctTotal)) * 100);

  return {
    ventilatorsAvailable: ventTotal - ventInUse,
    ventilatorsTotal: ventTotal,
    oxygenUnitsActive: oxyInUse,
    oxygenUnitsTotal: oxyTotal,
    monitorsInUse,
    monitorsTotal,
    wheelchairsFree: Math.round(hospitals.length * 8 * 0.4),
    maintenancePending,
    readinessScore: Math.min(100, Math.max(0, readiness)),
  };
}

export function getEquipmentStatusGrid(districtId: string): EquipmentItem[] {
  const m = getEquipmentMetrics(districtId);
  const equipData = districtId === "all" ? EQUIPMENT_DATA : EQUIPMENT_DATA.filter(e => e.district === districtId);

  const ctTotal = equipData.reduce((s, e) => s + e.ctScanners, 0);
  const mriTotal = equipData.reduce((s, e) => s + e.mriMachines, 0);
  const dialysisTotal = equipData.reduce((s, e) => s + e.dialysisMachines, 0);
  const ambulanceTotal = equipData.reduce((s, e) => s + e.ambulances, 0);

  const items: EquipmentItem[] = [
    { type: "Ventilators", icon: "Wind", total: m.ventilatorsTotal, inUse: m.ventilatorsTotal - m.ventilatorsAvailable, available: m.ventilatorsAvailable, utilization: 0, status: "optimal" },
    { type: "Oxygen Units", icon: "Droplets", total: m.oxygenUnitsTotal, inUse: m.oxygenUnitsActive, available: m.oxygenUnitsTotal - m.oxygenUnitsActive, utilization: 0, status: "optimal" },
    { type: "Patient Monitors", icon: "Monitor", total: m.monitorsTotal, inUse: m.monitorsInUse, available: m.monitorsTotal - m.monitorsInUse, utilization: 0, status: "optimal" },
    { type: "CT Scanners", icon: "Scan", total: ctTotal, inUse: Math.round(ctTotal * 0.65), available: ctTotal - Math.round(ctTotal * 0.65), utilization: 0, status: "optimal" },
    { type: "MRI Machines", icon: "Brain", total: mriTotal, inUse: Math.round(mriTotal * 0.58), available: mriTotal - Math.round(mriTotal * 0.58), utilization: 0, status: "optimal" },
    { type: "Dialysis Machines", icon: "Beaker", total: dialysisTotal, inUse: Math.round(dialysisTotal * 0.7), available: dialysisTotal - Math.round(dialysisTotal * 0.7), utilization: 0, status: "optimal" },
    { type: "Ambulances", icon: "Truck", total: ambulanceTotal, inUse: Math.round(ambulanceTotal * 0.45), available: ambulanceTotal - Math.round(ambulanceTotal * 0.45), utilization: 0, status: "optimal" },
    { type: "Wheelchairs", icon: "Armchair", total: Math.round(m.wheelchairsFree / 0.4), inUse: Math.round(m.wheelchairsFree / 0.4) - m.wheelchairsFree, available: m.wheelchairsFree, utilization: 0, status: "optimal" },
  ];

  return items.map(item => {
    const util = item.total > 0 ? Math.round((item.inUse / item.total) * 100) : 0;
    return {
      ...item,
      utilization: util,
      status: util > 90 ? "critical" : util > 75 ? "warning" : "optimal",
    };
  });
}

export function getMaintenanceAlerts(districtId: string): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = [
    { id: "ma-1", device: "Ventilator V-042", location: "ICU Bay 3", issue: "Pressure sensor calibration overdue", priority: "high", dueDate: "2024-01-18" },
    { id: "ma-2", device: "CT Scanner CT-02", location: "Radiology", issue: "Cooling system maintenance", priority: "medium", dueDate: "2024-01-22" },
    { id: "ma-3", device: "MRI Unit MRI-01", location: "Imaging Wing", issue: "Helium level check", priority: "high", dueDate: "2024-01-19" },
    { id: "ma-4", device: "Defibrillator DF-08", location: "Emergency", issue: "Battery replacement", priority: "critical", dueDate: "2024-01-17" },
    { id: "ma-5", device: "Oxygen Concentrator OC-15", location: "Ward B", issue: "Filter replacement", priority: "low", dueDate: "2024-01-25" },
    { id: "ma-6", device: "Patient Monitor PM-22", location: "ICU Bay 1", issue: "Display flickering", priority: "medium", dueDate: "2024-01-21" },
  ];
  return alerts;
}

export function getEquipmentRecommendations(districtId: string): EquipmentRecommendation[] {
  const grid = getEquipmentStatusGrid(districtId);
  const recs: EquipmentRecommendation[] = [];

  const criticalItems = grid.filter(i => i.status === "critical");
  criticalItems.forEach(item => {
    recs.push({
      id: `eq-${item.type}-redistribute`,
      action: `Redistribute ${item.type} from low-demand wards`,
      reason: `${item.type} utilization at ${item.utilization}% — exceeds 90% threshold`,
      urgency: "critical",
      impact: `Frees ${Math.max(1, Math.round(item.total * 0.05))} units for critical patients`,
      confidence: 88,
    });
  });

  const m = getEquipmentMetrics(districtId);
  if (m.ventilatorsAvailable < 5) {
    recs.push({
      id: "eq-vent-reserve",
      action: "Reserve remaining ventilators for high-risk ICU patients only",
      reason: `Only ${m.ventilatorsAvailable} ventilators available across the network`,
      urgency: "critical",
      impact: "Ensures critical patients have ventilator access",
      confidence: 93,
    });
  }

  if (m.maintenancePending > 10) {
    recs.push({
      id: "eq-maint-batch",
      action: "Schedule batch maintenance for non-critical devices",
      reason: `${m.maintenancePending} devices pending maintenance`,
      urgency: "medium",
      impact: "Reduces equipment failure risk by ~25%",
      confidence: 81,
    });
  }

  recs.push({
    id: "eq-oxy-demand",
    action: "Increase oxygen supply to Emergency ward",
    reason: "Oxygen demand rising with monsoon-related respiratory cases",
    urgency: "high",
    impact: "Prevents oxygen shortage during peak admission hours",
    confidence: 85,
  });

  return recs;
}

export function getEquipmentUsageTrend(): { hour: string; ventilators: number; oxygen: number; monitors: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    // Usage peaks at 10am-2pm and 6-9pm
    const morningPeak = Math.exp(-((i - 11) ** 2) / 8);
    const eveningPeak = Math.exp(-((i - 19) ** 2) / 6);
    const base = 0.45 + morningPeak * 0.35 + eveningPeak * 0.2;
    return {
      hour: `${i.toString().padStart(2, "0")}:00`,
      ventilators: Math.round(base * 100 * 0.82),
      oxygen: Math.round(base * 100 * 0.78),
      monitors: Math.round(base * 100 * 0.7),
    };
  });
}
