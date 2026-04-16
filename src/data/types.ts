/**
 * Tamil Nadu District Data Types
 * All types used across the MedFlow Nexus data layer.
 * Every dataset is strongly typed and documented.
 */

export interface District {
  id: string;
  name: string;
  population: number;
  urbanRatio: number;         // 0-1, fraction of urban population
  seniorPopulationRatio: number; // 0-1, fraction aged 60+
  lat: number;
  lng: number;
  zone: "north" | "south" | "central" | "west";
}

export interface HospitalData {
  id: string;
  district: string;
  hospitalName: string;
  hospitalType: "GH" | "DH" | "MCH" | "PHC" | "CHC" | "Private";
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  icuOccupied: number;
  ventilators: number;
  ventilatorsInUse: number;
  oxygenUnits: number;
  oxygenInUse: number;
}

export interface DiseaseData {
  district: string;
  month: number; // 1-12
  dengueCases: number;
  malariaCase: number;
  feverCases: number;
  covidCases: number;
  monsoonRiskScore: number; // 0-100
  outbreakAlert: boolean;
}

export interface AccidentData {
  district: string;
  avgDailyAccidents: number;
  highwayRiskScore: number;     // 0-100
  festivalRiskMultiplier: number; // 1.0-2.5
  nhCorridor: string | null;     // e.g. "NH-44 Chennai-Trichy"
  monthlyTrend: number[];        // 12 values, index 0 = Jan
}

export interface WeatherData {
  district: string;
  month: number;
  rainfallMm: number;
  humidity: number;          // 0-100
  temperatureC: number;
  monsoonPhase: "pre" | "active" | "post" | "dry";
  floodRisk: number;        // 0-100
}

export interface StaffData {
  district: string;
  doctorsAvailable: number;
  nursesAvailable: number;
  specialistsAvailable: number;
  paramedics: number;
  shiftLoad: number;            // 0-100, current pressure
  fatigueRiskScore: number;     // 0-100
  vacancyRate: number;          // 0-1
}

export interface EquipmentData {
  district: string;
  ventilators: number;
  ctScanners: number;
  mriMachines: number;
  xrayUnits: number;
  dialysisMachines: number;
  ambulances: number;
  utilizationRate: number;    // 0-1
  maintenancePending: number; // count of devices needing service
}

export interface DataSourceEntry {
  id: string;
  name: string;
  sourceType: "government" | "state" | "derived" | "simulated";
  officialUrl: string;
  lastUpdated: string;
  usageInPlatform: string;
  reliabilityScore: number; // 1-5
  status: "live" | "static" | "processed";
  description: string;
}

export interface KPISummary {
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  icuTotal: number;
  icuOccupied: number;
  icuRate: number;
  highRiskDistricts: number;
  staffAvailabilityIndex: number;
  emergencyRiskIndex: number;
  activeAlerts: number;
}

export interface SimulationTick {
  timestamp: number;
  district: string;
  occupiedBeds: number;
  icuOccupied: number;
  erAdmissions: number;
  alertLevel: "normal" | "elevated" | "critical";
}
