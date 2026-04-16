/**
 * Core data services for MedFlow Nexus
 * All services aggregate from the typed dataset layer.
 * No random values — all derived from documented data.
 */

import type { KPISummary } from "@/data/types";
import { getHospitalsByDistrict } from "@/data/hospitals";
import { STAFF_DATA } from "@/data/staff-equipment";
import { EQUIPMENT_DATA } from "@/data/staff-equipment";
import { DISEASE_DATA } from "@/data/diseases";
import { WEATHER_DATA } from "@/data/weather";
import { ACCIDENT_DATA } from "@/data/accidents";
import { TN_DISTRICTS } from "@/data/districts";

/** Get current month (1-indexed) */
function currentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Get aggregated hospital capacity for a district or all districts
 */
export function getHospitalCapacity(districtId?: string) {
  const hospitals = getHospitalsByDistrict(districtId);
  return {
    hospitals,
    totalBeds: hospitals.reduce((s, h) => s + h.totalBeds, 0),
    occupiedBeds: hospitals.reduce((s, h) => s + h.occupiedBeds, 0),
    icuTotal: hospitals.reduce((s, h) => s + h.icuBeds, 0),
    icuOccupied: hospitals.reduce((s, h) => s + h.icuOccupied, 0),
    ventilators: hospitals.reduce((s, h) => s + h.ventilators, 0),
    ventilatorsInUse: hospitals.reduce((s, h) => s + h.ventilatorsInUse, 0),
  };
}

/**
 * Get district-level aggregated metrics
 */
export function getDistrictMetrics(districtId: string) {
  const capacity = getHospitalCapacity(districtId);
  const staff = STAFF_DATA.find(s => s.district === districtId);
  const equipment = EQUIPMENT_DATA.find(e => e.district === districtId);
  const disease = DISEASE_DATA.filter(d => d.district === districtId && d.month === currentMonth())[0];
  const weather = WEATHER_DATA.filter(w => w.district === districtId && w.month === currentMonth())[0];
  const accident = ACCIDENT_DATA.find(a => a.district === districtId);
  const district = TN_DISTRICTS.find(d => d.id === districtId);

  return { capacity, staff, equipment, disease, weather, accident, district };
}

/**
 * Emergency risk index: composite score 0-100
 * Factors: occupancy pressure, accident rate, disease outbreak, weather risk
 */
export function getEmergencyRisk(districtId?: string): number {
  if (!districtId || districtId === "all") {
    const risks = TN_DISTRICTS.map(d => getEmergencyRisk(d.id));
    return Math.round(risks.reduce((s, r) => s + r, 0) / risks.length);
  }

  const capacity = getHospitalCapacity(districtId);
  const occupancyPressure = capacity.totalBeds > 0
    ? (capacity.occupiedBeds / capacity.totalBeds) * 40
    : 0;

  const accident = ACCIDENT_DATA.find(a => a.district === districtId);
  const accidentRisk = accident ? (accident.highwayRiskScore / 100) * 20 : 0;

  const disease = DISEASE_DATA.filter(d => d.district === districtId && d.month === currentMonth())[0];
  const diseaseRisk = disease ? (disease.monsoonRiskScore / 100) * 25 : 0;

  const weather = WEATHER_DATA.filter(w => w.district === districtId && w.month === currentMonth())[0];
  const weatherRisk = weather ? (weather.floodRisk / 100) * 15 : 0;

  return Math.min(100, Math.round(occupancyPressure + accidentRisk + diseaseRisk + weatherRisk));
}

/**
 * Weather impact on healthcare demand
 */
export function getWeatherImpact(districtId: string) {
  const monthly = WEATHER_DATA.filter(w => w.district === districtId);
  const current = monthly.find(w => w.month === currentMonth());
  return { monthly, current };
}

/**
 * Seasonal demand trends (disease + weather combined)
 */
export function getSeasonalDemand(districtId: string) {
  const diseases = DISEASE_DATA.filter(d => d.district === districtId);
  const weather = WEATHER_DATA.filter(w => w.district === districtId);

  return diseases.map(d => {
    const w = weather.find(ww => ww.month === d.month);
    return {
      month: d.month,
      dengueCases: d.dengueCases,
      feverCases: d.feverCases,
      monsoonRisk: d.monsoonRiskScore,
      rainfall: w?.rainfallMm ?? 0,
      temperature: w?.temperatureC ?? 30,
    };
  });
}

/**
 * Staff pressure index per district
 */
export function getStaffPressure(districtId?: string) {
  if (!districtId || districtId === "all") {
    return STAFF_DATA.map(s => ({
      district: s.district,
      shiftLoad: s.shiftLoad,
      fatigueRisk: s.fatigueRiskScore,
      vacancyRate: s.vacancyRate,
    }));
  }
  const staff = STAFF_DATA.find(s => s.district === districtId);
  return staff ? [{ district: staff.district, shiftLoad: staff.shiftLoad, fatigueRisk: staff.fatigueRiskScore, vacancyRate: staff.vacancyRate }] : [];
}

/**
 * Equipment demand and utilization
 */
export function getEquipmentDemand(districtId?: string) {
  if (!districtId || districtId === "all") return EQUIPMENT_DATA;
  const eq = EQUIPMENT_DATA.find(e => e.district === districtId);
  return eq ? [eq] : [];
}

/**
 * KPI Summary for dashboard header
 */
export function getKPISummary(districtId?: string): KPISummary {
  const capacity = getHospitalCapacity(districtId);
  const occupancyRate = capacity.totalBeds > 0
    ? Math.round((capacity.occupiedBeds / capacity.totalBeds) * 100)
    : 0;
  const icuRate = capacity.icuTotal > 0
    ? Math.round((capacity.icuOccupied / capacity.icuTotal) * 100)
    : 0;

  // Count districts with occupancy > 85%
  const highRiskDistricts = TN_DISTRICTS.filter(d => {
    if (districtId && districtId !== "all" && d.id !== districtId) return false;
    const cap = getHospitalCapacity(d.id);
    return cap.totalBeds > 0 && (cap.occupiedBeds / cap.totalBeds) > 0.85;
  }).length;

  // Staff availability index: inverse of avg shift load
  const relevantStaff = districtId && districtId !== "all"
    ? STAFF_DATA.filter(s => s.district === districtId)
    : STAFF_DATA;
  const avgShiftLoad = relevantStaff.length > 0
    ? relevantStaff.reduce((s, st) => s + st.shiftLoad, 0) / relevantStaff.length
    : 50;
  const staffAvailabilityIndex = Math.round(100 - avgShiftLoad);

  const emergencyRiskIndex = getEmergencyRisk(districtId);

  // Count outbreak alerts
  const month = currentMonth();
  const relevantDisease = districtId && districtId !== "all"
    ? DISEASE_DATA.filter(d => d.district === districtId && d.month === month)
    : DISEASE_DATA.filter(d => d.month === month);
  const activeAlerts = relevantDisease.filter(d => d.outbreakAlert).length;

  return {
    totalBeds: capacity.totalBeds,
    occupiedBeds: capacity.occupiedBeds,
    occupancyRate,
    icuTotal: capacity.icuTotal,
    icuOccupied: capacity.icuOccupied,
    icuRate,
    highRiskDistricts,
    staffAvailabilityIndex,
    emergencyRiskIndex,
    activeAlerts,
  };
}
