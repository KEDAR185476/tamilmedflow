/**
 * Hospital Multi-Tenant Auth State Management
 * Production-ready architecture with local state for demo
 */

export type HospitalRole =
  | "super_admin"
  | "operations_manager"
  | "doctor"
  | "nurse_supervisor"
  | "equipment_manager"
  | "emergency_coordinator"
  | "analyst_viewer";

export interface HospitalTenant {
  id: string;
  name: string;
  type: string;
  registrationId: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  state: string;
  beds?: number;
  website?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface HospitalUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: HospitalRole;
  isActive: boolean;
  lastLogin: string;
}

export interface OnboardingData {
  brandColor: string;
  hospitalSize: "small" | "medium" | "large" | "enterprise";
  totalBeds: number;
  icuBeds: number;
  wardsCount: number;
  operationTheaters: number;
  ambulanceCount: number;
  doctors: number;
  nurses: number;
  specialists: number;
  shifts: number;
  ventilators: number;
  monitors: number;
  oxygenUnits: number;
  wheelchairs: number;
}

export interface AuditEntry {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  detail: string;
  timestamp: string;
}

const STORAGE_KEY = "medflow_hospital_auth";

export function getHospitalAuth(): { tenant: HospitalTenant; user: HospitalUser; onboarding?: OnboardingData } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setHospitalAuth(data: { tenant: HospitalTenant; user: HospitalUser; onboarding?: OnboardingData }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearHospitalAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function createTenantId(name: string, city: string): string {
  return `tenant_${name.toLowerCase().replace(/[^a-z0-9]/g, "")}_${city.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

export const ROLE_LABELS: Record<HospitalRole, string> = {
  super_admin: "Super Hospital Admin",
  operations_manager: "Operations Manager",
  doctor: "Doctor",
  nurse_supervisor: "Nurse Supervisor",
  equipment_manager: "Equipment Manager",
  emergency_coordinator: "Emergency Coordinator",
  analyst_viewer: "Analyst Viewer",
};

export const ROLE_PERMISSIONS: Record<HospitalRole, string[]> = {
  super_admin: ["*"],
  operations_manager: ["beds", "staff", "dashboard", "reports", "equipment"],
  doctor: ["intake", "patient_flow", "dashboard"],
  nurse_supervisor: ["staffing", "workforce", "dashboard"],
  equipment_manager: ["equipment", "dashboard"],
  emergency_coordinator: ["emergency", "surge", "dashboard"],
  analyst_viewer: ["dashboard"],
};

export const HOSPITAL_TYPES = [
  "Government Hospital",
  "Private Hospital",
  "Trust Hospital",
  "Medical College Hospital",
  "Clinic",
  "Specialty Hospital",
];
