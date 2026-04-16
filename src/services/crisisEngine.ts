/**
 * Emergency & Crisis Intelligence Engine
 * 
 * Logic basis:
 * - NDMA (National Disaster Management Authority) response protocols
 * - Tamil Nadu SDMA guidelines for hospital surge management
 * - IPHS emergency preparedness benchmarks
 * - NH accident corridor data from NHAI/NCRB patterns
 */

import { getHospitalsByDistrict } from "@/data/hospitals";
import { STAFF_DATA, EQUIPMENT_DATA } from "@/data/staff-equipment";
import { TN_DISTRICTS } from "@/data/districts";
import { ACCIDENT_DATA } from "@/data/accidents";

export type EmergencyLevel = "normal" | "alert" | "emergency" | "critical";

export interface EmergencyMetrics {
  riskLevel: EmergencyLevel;
  incomingCasualties: number;
  bedsReserved: number;
  icuReadiness: number;
  traumaTeamStatus: "standby" | "activated" | "deployed";
  ambulanceLoad: number;
  responseETA: number; // minutes
}

export interface EmergencyAlert {
  id: string;
  time: string;
  message: string;
  severity: "critical" | "high" | "medium" | "info";
  district: string;
  type: "accident" | "outbreak" | "weather" | "capacity" | "equipment" | "staff";
}

export interface SurgeAllocation {
  resource: string;
  current: number;
  needed: number;
  gap: number;
  action: string;
}

export interface EmergencyRecommendation {
  id: string;
  action: string;
  reason: string;
  urgency: "critical" | "high" | "medium";
  impact: string;
  confidence: number;
}

export interface CrisisMetrics {
  surgeReadinessScore: number;
  backupCapacity: number;
  reserveStaff: number;
  equipmentBufferDays: number;
  riskyDistricts: number;
  recoveryTimeEstimate: number; // hours
}

export interface ScenarioResult {
  projectedAdmissions: number;
  occupancyPercent: number;
  icuLoad: number;
  waitTime: number;
  staffPressure: number;
  shortageAlerts: string[];
  surgeForecast: { hour: number; admissions: number; occupancy: number }[];
}

export interface ImpactAnalysis {
  action: string;
  category: string;
  before: { waitTime: number; occupancy: number; mortalityProxy: number; responseTime: number; throughput: number };
  after: { waitTime: number; occupancy: number; mortalityProxy: number; responseTime: number; throughput: number };
}

export interface TwinWard {
  name: string;
  beds: number;
  occupied: number;
  staff: number;
  equipment: number;
  status: "normal" | "stressed" | "critical";
  patients: { id: string; severity: "low" | "medium" | "high" | "critical" }[];
}

export function getEmergencyMetrics(districtId: string): EmergencyMetrics {
  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
  const occupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0);
  const icuTotal = hospitals.reduce((s, h) => s + h.icuBeds, 0);
  const icuOcc = hospitals.reduce((s, h) => s + h.icuOccupied, 0);
  const occupancy = totalBeds > 0 ? occupied / totalBeds : 0;
  const icuRate = icuTotal > 0 ? icuOcc / icuTotal : 0;

  const accidentData = districtId === "all" ? ACCIDENT_DATA : ACCIDENT_DATA.filter(a => a.district === districtId);
  const avgAccidents = accidentData.reduce((s, a) => s + a.avgDailyAccidents, 0);

  const riskLevel: EmergencyLevel = occupancy > 0.92 || icuRate > 0.9 ? "critical" :
    occupancy > 0.85 ? "emergency" : occupancy > 0.78 ? "alert" : "normal";

  return {
    riskLevel,
    incomingCasualties: Math.round(avgAccidents * 0.3),
    bedsReserved: Math.round((totalBeds - occupied) * 0.4),
    icuReadiness: Math.round((1 - icuRate) * 100),
    traumaTeamStatus: riskLevel === "critical" ? "deployed" : riskLevel === "emergency" ? "activated" : "standby",
    ambulanceLoad: Math.round(occupancy * 80 + avgAccidents * 2),
    responseETA: Math.round(15 + occupancy * 20),
  };
}

export function getEmergencyAlerts(districtId: string): EmergencyAlert[] {
  const metrics = getEmergencyMetrics(districtId);
  const districtName = districtId === "all" ? "Tamil Nadu" : TN_DISTRICTS.find(d => d.id === districtId)?.name ?? districtId;

  const alerts: EmergencyAlert[] = [
    { id: "ea-1", time: "2 min ago", message: `ICU stress ${metrics.riskLevel} in ${districtName} — ${metrics.icuReadiness}% readiness`, severity: metrics.icuReadiness < 15 ? "critical" : "high", district: districtName, type: "capacity" },
    { id: "ea-2", time: "8 min ago", message: `Major accident risk elevated on NH-44 Chennai-Trichy corridor`, severity: "high", district: "Chennai", type: "accident" },
    { id: "ea-3", time: "15 min ago", message: `Dengue cases rising in Madurai cluster — 23% above weekly average`, severity: "medium", district: "Madurai", type: "outbreak" },
    { id: "ea-4", time: "22 min ago", message: `Reserve oxygen threshold crossed in ${districtName}`, severity: metrics.riskLevel === "critical" ? "critical" : "medium", district: districtName, type: "equipment" },
    { id: "ea-5", time: "35 min ago", message: `Emergency team activated successfully — Trauma Bay ready`, severity: "info", district: districtName, type: "staff" },
    { id: "ea-6", time: "42 min ago", message: `12 beds freed after discharge batch — capacity improved`, severity: "info", district: districtName, type: "capacity" },
    { id: "ea-7", time: "1 hr ago", message: `Heavy rainfall warning — IMD alert for coastal ${districtName}`, severity: "medium", district: districtName, type: "weather" },
    { id: "ea-8", time: "1.5 hr ago", message: `Coimbatore has 14 available trauma beds — overflow partner ready`, severity: "info", district: "Coimbatore", type: "capacity" },
  ];
  return alerts;
}

export function getSurgeAllocations(districtId: string): SurgeAllocation[] {
  const metrics = getEmergencyMetrics(districtId);
  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
  const ventTotal = hospitals.reduce((s, h) => s + h.ventilators, 0);

  return [
    { resource: "Trauma Beds", current: metrics.bedsReserved, needed: Math.round(metrics.incomingCasualties * 1.5), gap: Math.max(0, Math.round(metrics.incomingCasualties * 1.5) - metrics.bedsReserved), action: "Reserve additional beds from General Ward" },
    { resource: "ICU Beds", current: Math.round(totalBeds * 0.05), needed: Math.round(metrics.incomingCasualties * 0.3), gap: Math.max(0, Math.round(metrics.incomingCasualties * 0.3) - Math.round(totalBeds * 0.05)), action: "Activate surge ICU protocol" },
    { resource: "Ventilators", current: Math.round(ventTotal * 0.15), needed: Math.round(metrics.incomingCasualties * 0.2), gap: 0, action: "Redistribute from low-demand wards" },
    { resource: "Trauma Surgeons", current: 4, needed: Math.round(metrics.incomingCasualties * 0.15) + 2, gap: Math.max(0, Math.round(metrics.incomingCasualties * 0.15) - 2), action: "Call in off-duty specialists" },
    { resource: "Ambulances", current: 8, needed: Math.round(metrics.incomingCasualties * 0.5), gap: Math.max(0, Math.round(metrics.incomingCasualties * 0.5) - 8), action: "Request partner fleet from nearby district" },
    { resource: "Blood Units", current: 45, needed: Math.round(metrics.incomingCasualties * 2), gap: Math.max(0, Math.round(metrics.incomingCasualties * 2) - 45), action: "Activate blood bank emergency protocol" },
  ];
}

export function getEmergencyRecommendations(districtId: string): EmergencyRecommendation[] {
  const metrics = getEmergencyMetrics(districtId);
  const recs: EmergencyRecommendation[] = [];

  if (metrics.riskLevel === "critical" || metrics.riskLevel === "emergency") {
    recs.push({ id: "er-1", action: "Activate reserve trauma team immediately", reason: `Emergency risk at ${metrics.riskLevel} level`, urgency: "critical", impact: "Adds 6 trauma-ready staff within 30 minutes", confidence: 94 });
    recs.push({ id: "er-2", action: `Reserve ${metrics.bedsReserved + 10} ER beds — delay elective admissions`, reason: "Incoming casualty estimate requires surge capacity", urgency: "critical", impact: `Frees ${metrics.bedsReserved + 10} beds for emergency use`, confidence: 91 });
  }

  recs.push({ id: "er-3", action: "Redirect ambulances to Coimbatore overflow partner", reason: "Chennai corridor approaching saturation", urgency: "high", impact: "Distributes load across network, reduces wait by 40%", confidence: 87 });
  recs.push({ id: "er-4", action: "Pre-position oxygen cylinders in ER staging area", reason: "Respiratory cases trending up with seasonal shift", urgency: "medium", impact: "Eliminates 15-min supply delay during critical window", confidence: 82 });
  recs.push({ id: "er-5", action: "Dispatch additional blood bank unit to Trauma Bay", reason: "Accident corridor risk elevated, estimated need for surgical intervention", urgency: "high", impact: "Ensures Type O availability for first 8 patients", confidence: 85 });

  return recs;
}

export function getCrisisMetrics(districtId: string): CrisisMetrics {
  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
  const occupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0);
  const staff = districtId === "all" ? STAFF_DATA : STAFF_DATA.filter(s => s.district === districtId);
  const equip = districtId === "all" ? EQUIPMENT_DATA : EQUIPMENT_DATA.filter(e => e.district === districtId);

  const backupBeds = totalBeds - occupied;
  const reserveStaff = staff.reduce((s, d) => s + Math.round((d.doctorsAvailable + d.nursesAvailable) * 0.15), 0);
  const maintenancePending = equip.reduce((s, e) => s + e.maintenancePending, 0);
  const ventTotal = equip.reduce((s, e) => s + e.ventilators, 0);
  const bufferDays = ventTotal > 0 ? Math.round((ventTotal - maintenancePending) / Math.max(1, ventTotal) * 14) : 0;

  const riskyDistricts = TN_DISTRICTS.filter(d => {
    const h = getHospitalsByDistrict(d.id);
    const occ = h.reduce((s, x) => s + x.occupiedBeds, 0) / Math.max(1, h.reduce((s, x) => s + x.totalBeds, 0));
    return occ > 0.85;
  }).length;

  return {
    surgeReadinessScore: Math.round(Math.min(100, (backupBeds / Math.max(1, totalBeds)) * 200 + reserveStaff * 0.5)),
    backupCapacity: backupBeds,
    reserveStaff,
    equipmentBufferDays: bufferDays,
    riskyDistricts,
    recoveryTimeEstimate: Math.round(24 + riskyDistricts * 6 + (1 - backupBeds / Math.max(1, totalBeds)) * 48),
  };
}

export function runScenarioSimulation(params: {
  scenario: string;
  severity: number; // 1-10
  duration: number; // hours
  districtId: string;
  staffPercent: number;
  bedPercent: number;
  equipmentPercent: number;
}): ScenarioResult {
  const hospitals = getHospitalsByDistrict(params.districtId === "all" ? undefined : params.districtId);
  const totalBeds = Math.round(hospitals.reduce((s, h) => s + h.totalBeds, 0) * (params.bedPercent / 100));
  const occupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0);
  const icuTotal = hospitals.reduce((s, h) => s + h.icuBeds, 0);

  // Scenario multipliers
  const scenarioMultipliers: Record<string, number> = {
    "highway-accident": 1.5,
    "dengue-outbreak": 1.3,
    "festival-overload": 1.4,
    "icu-crisis": 1.6,
    "nurse-shortage": 1.2,
    "chennai-flood": 1.8,
    "oxygen-shortage": 1.4,
  };

  const mult = (scenarioMultipliers[params.scenario] || 1.3) * (params.severity / 5);
  const surgeAdmissions = Math.round(totalBeds * 0.02 * mult * params.duration);
  const projectedOccupied = Math.min(totalBeds, occupied + surgeAdmissions);
  const occupancyPct = Math.round((projectedOccupied / Math.max(1, totalBeds)) * 100);
  const icuLoad = Math.min(100, Math.round((occupancyPct * 0.9 + params.severity * 3)));
  const staffPressure = Math.round(100 - params.staffPercent + params.severity * 5);

  const shortages: string[] = [];
  if (occupancyPct > 90) shortages.push("Bed shortage imminent");
  if (icuLoad > 85) shortages.push("ICU capacity critical");
  if (params.staffPercent < 70) shortages.push("Staff shortage — activate reserves");
  if (params.equipmentPercent < 60) shortages.push("Equipment readiness below threshold");
  if (params.severity > 7) shortages.push("Mass casualty protocol recommended");

  const surgeForecast = Array.from({ length: Math.min(48, params.duration) }, (_, i) => {
    const peakFactor = Math.exp(-((i - params.duration * 0.3) ** 2) / (params.duration * 2));
    const hourlyAdmissions = Math.round(surgeAdmissions / params.duration * (0.5 + peakFactor));
    const runningOcc = Math.min(100, Math.round(((occupied + hourlyAdmissions * (i + 1) * 0.3) / totalBeds) * 100));
    return { hour: i, admissions: hourlyAdmissions, occupancy: runningOcc };
  });

  return {
    projectedAdmissions: surgeAdmissions,
    occupancyPercent: occupancyPct,
    icuLoad,
    waitTime: Math.round(15 + occupancyPct * 0.8 + params.severity * 3),
    staffPressure: Math.min(100, staffPressure),
    shortageAlerts: shortages,
    surgeForecast,
  };
}

export function getDigitalTwinWards(districtId: string): TwinWard[] {
  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
  const occupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0);
  const ratio = totalBeds > 0 ? occupied / totalBeds : 0;

  const wards: TwinWard[] = [
    { name: "Emergency", beds: Math.round(totalBeds * 0.08), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "ICU", beds: Math.round(totalBeds * 0.06), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "General Ward A", beds: Math.round(totalBeds * 0.2), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "General Ward B", beds: Math.round(totalBeds * 0.18), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "Surgery", beds: Math.round(totalBeds * 0.1), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "Pediatrics", beds: Math.round(totalBeds * 0.08), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "Obstetrics", beds: Math.round(totalBeds * 0.07), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "Orthopedics", beds: Math.round(totalBeds * 0.08), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "Cardiology", beds: Math.round(totalBeds * 0.06), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
    { name: "Isolation", beds: Math.round(totalBeds * 0.04), occupied: 0, staff: 0, equipment: 0, status: "normal", patients: [] },
  ];

  // Distribute occupancy realistically
  const occupancyWeights = [1.3, 1.4, 0.9, 0.85, 1.0, 0.8, 0.75, 0.95, 1.05, 0.6];
  const severities: ("low" | "medium" | "high" | "critical")[] = ["low", "medium", "high", "critical"];

  return wards.map((w, i) => {
    const wardOcc = Math.min(w.beds, Math.round(w.beds * ratio * occupancyWeights[i]));
    const wardStatus = wardOcc / w.beds > 0.9 ? "critical" : wardOcc / w.beds > 0.75 ? "stressed" : "normal";
    const patients = Array.from({ length: Math.min(8, wardOcc) }, (_, j) => ({
      id: `P-${w.name.substring(0, 2).toUpperCase()}${j + 1}`,
      severity: severities[Math.min(3, Math.floor(Math.random() * (i < 2 ? 4 : 3)))] as "low" | "medium" | "high" | "critical",
    }));

    return {
      ...w,
      occupied: wardOcc,
      staff: Math.round(wardOcc / 3) + 2,
      equipment: Math.round(wardOcc / 4) + 1,
      status: wardStatus,
      patients,
    };
  });
}

export function getImpactAnalyses(districtId: string): ImpactAnalysis[] {
  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
  const occupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0);
  const occRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  return [
    {
      action: "Add 5 nurses to high-load departments",
      category: "Staffing",
      before: { waitTime: 48, occupancy: occRate, mortalityProxy: 3.2, responseTime: 22, throughput: 85 },
      after: { waitTime: 35, occupancy: occRate - 2, mortalityProxy: 2.8, responseTime: 16, throughput: 94 },
    },
    {
      action: "Reserve 12 beds for emergency intake",
      category: "Capacity",
      before: { waitTime: 48, occupancy: occRate, mortalityProxy: 3.2, responseTime: 22, throughput: 85 },
      after: { waitTime: 30, occupancy: occRate + 3, mortalityProxy: 2.4, responseTime: 12, throughput: 92 },
    },
    {
      action: "Open temporary 20-bed ward",
      category: "Capacity",
      before: { waitTime: 48, occupancy: occRate, mortalityProxy: 3.2, responseTime: 22, throughput: 85 },
      after: { waitTime: 25, occupancy: Math.round(occupied / (totalBeds + 20) * 100), mortalityProxy: 2.1, responseTime: 14, throughput: 98 },
    },
    {
      action: "Reroute ambulances to partner hospitals",
      category: "Routing",
      before: { waitTime: 48, occupancy: occRate, mortalityProxy: 3.2, responseTime: 22, throughput: 85 },
      after: { waitTime: 20, occupancy: occRate - 5, mortalityProxy: 2.5, responseTime: 18, throughput: 90 },
    },
    {
      action: "Accelerate discharge for 8 ready patients",
      category: "Flow",
      before: { waitTime: 48, occupancy: occRate, mortalityProxy: 3.2, responseTime: 22, throughput: 85 },
      after: { waitTime: 32, occupancy: occRate - 4, mortalityProxy: 2.9, responseTime: 19, throughput: 93 },
    },
  ];
}
