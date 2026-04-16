/**
 * Hospital Data Engine — localStorage-based data persistence for My Hospital Mode
 * All data scoped by tenant_id. No dependency on regional datasets.
 */

export interface HospitalCapacity {
  totalBeds: number;
  generalBeds: number;
  icuBeds: number;
  hduBeds: number;
  isolationBeds: number;
  operationTheaters: number;
  ambulances: number;
  floors: number;
  wardsCount: number;
}

export interface HospitalStaff {
  doctors: number;
  nurses: number;
  specialists: number;
  adminStaff: number;
  supportStaff: number;
  shiftModel: 2 | 3;
}

export interface HospitalEquipment {
  ventilators: number;
  monitors: number;
  oxygenUnits: number;
  wheelchairs: number;
  infusionPumps: number;
  portableBeds: number;
}

export interface HospitalOpsBaseline {
  avgDailyAdmissions: number;
  avgDailyDischarges: number;
  avgWaitTime: number;
  avgIcuUtilization: number;
  avgOccupancy: number;
}

export interface HospitalLiveOps {
  beds: { occupied: number; vacant: number; underCleaning: number; blocked: number };
  admissions: { todayAdmitted: number; erWaiting: number; surgeryScheduled: number; icuPending: number };
  staff: { onDutyDoctors: number; onDutyNurses: number; leaveCount: number; absentCount: number };
  equipment: { ventilatorsInUse: number; monitorsInUse: number; oxygenActive: number; maintenancePending: number };
  patientFlow: { dischargeReady: number; transferPending: number; pharmacyDelays: number; billingPending: number };
}

export interface HospitalProfile {
  name: string;
  type: string;
  district: string;
  address: string;
  contact: string;
  departments: string;
  specialties: string;
  emergencyLevel: string;
  workingHours: string;
}

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  user: string;
  field: string;
  section: string;
  oldValue: string;
  newValue: string;
}

export interface HospitalDataState {
  capacity: HospitalCapacity;
  staff: HospitalStaff;
  equipment: HospitalEquipment;
  opsBaseline: HospitalOpsBaseline;
  liveOps: HospitalLiveOps;
  profile: HospitalProfile;
  changeLog: ChangeLogEntry[];
  setupComplete: boolean;
  lastSynced: string | null;
}

const STORAGE_PREFIX = "medflow_hospital_data_";

function getKey(tenantId: string) { return STORAGE_PREFIX + tenantId; }

export function getDefaultState(): HospitalDataState {
  return {
    capacity: { totalBeds: 200, generalBeds: 120, icuBeds: 20, hduBeds: 15, isolationBeds: 10, operationTheaters: 4, ambulances: 5, floors: 4, wardsCount: 6 },
    staff: { doctors: 30, nurses: 80, specialists: 12, adminStaff: 15, supportStaff: 25, shiftModel: 3 },
    equipment: { ventilators: 15, monitors: 40, oxygenUnits: 50, wheelchairs: 20, infusionPumps: 30, portableBeds: 10 },
    opsBaseline: { avgDailyAdmissions: 45, avgDailyDischarges: 40, avgWaitTime: 35, avgIcuUtilization: 72, avgOccupancy: 78 },
    liveOps: {
      beds: { occupied: 152, vacant: 38, underCleaning: 6, blocked: 4 },
      admissions: { todayAdmitted: 28, erWaiting: 7, surgeryScheduled: 5, icuPending: 3 },
      staff: { onDutyDoctors: 18, onDutyNurses: 45, leaveCount: 4, absentCount: 2 },
      equipment: { ventilatorsInUse: 9, monitorsInUse: 28, oxygenActive: 35, maintenancePending: 3 },
      patientFlow: { dischargeReady: 12, transferPending: 4, pharmacyDelays: 6, billingPending: 8 },
    },
    profile: { name: "", type: "", district: "", address: "", contact: "", departments: "General Medicine, Surgery, Pediatrics, OB-GYN, Orthopedics", specialties: "Cardiology, Neurology, Nephrology", emergencyLevel: "Level II", workingHours: "24/7" },
    changeLog: [],
    setupComplete: false,
    lastSynced: null,
  };
}

export function loadHospitalData(tenantId: string): HospitalDataState {
  try {
    const raw = localStorage.getItem(getKey(tenantId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefaultState();
}

export function saveHospitalData(tenantId: string, state: HospitalDataState): void {
  state.lastSynced = new Date().toISOString();
  localStorage.setItem(getKey(tenantId), JSON.stringify(state));
}

export function addChangeLog(state: HospitalDataState, user: string, section: string, field: string, oldVal: string, newVal: string): HospitalDataState {
  return {
    ...state,
    changeLog: [
      { id: crypto.randomUUID(), timestamp: new Date().toISOString(), user, section, field, oldValue: oldVal, newValue: newVal },
      ...state.changeLog.slice(0, 99),
    ],
  };
}

// Validation
export interface ValidationError { field: string; message: string }

export function validateLiveOps(state: HospitalDataState): ValidationError[] {
  const errors: ValidationError[] = [];
  const { capacity, liveOps, staff, equipment } = state;
  const totalBedOps = liveOps.beds.occupied + liveOps.beds.vacant + liveOps.beds.underCleaning + liveOps.beds.blocked;
  if (totalBedOps > capacity.totalBeds) errors.push({ field: "beds", message: `Bed totals (${totalBedOps}) exceed capacity (${capacity.totalBeds})` });
  if (liveOps.staff.onDutyDoctors > staff.doctors) errors.push({ field: "onDutyDoctors", message: `On-duty doctors exceed total doctors (${staff.doctors})` });
  if (liveOps.staff.onDutyNurses > staff.nurses) errors.push({ field: "onDutyNurses", message: `On-duty nurses exceed total nurses (${staff.nurses})` });
  if (liveOps.equipment.ventilatorsInUse > equipment.ventilators) errors.push({ field: "ventilatorsInUse", message: `Ventilators in use exceed total (${equipment.ventilators})` });
  if (liveOps.equipment.monitorsInUse > equipment.monitors) errors.push({ field: "monitorsInUse", message: `Monitors in use exceed total (${equipment.monitors})` });
  if (liveOps.equipment.oxygenActive > equipment.oxygenUnits) errors.push({ field: "oxygenActive", message: `Oxygen units active exceed total (${equipment.oxygenUnits})` });
  return errors;
}

// CSV Export
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(r => keys.map(k => String(r[k] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// CSV Import
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ""; });
    return row;
  });
}
