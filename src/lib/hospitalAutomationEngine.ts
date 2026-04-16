/**
 * Hospital Automation Engine — rule-based automation system
 * Monitors hospital data and generates/executes automated actions.
 */
import type { HospitalDataState } from "./hospitalDataEngine";

export type AutoMode = "auto" | "semi" | "manual" | "emergency";

export interface AutoRule {
  id: string;
  name: string;
  category: "beds" | "staff" | "equipment" | "flow" | "alert";
  condition: string;
  action: string;
  priority: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  enabled: boolean;
}

export interface AutoAction {
  id: string;
  ruleId: string;
  ruleName: string;
  category: string;
  action: string;
  reason: string;
  timestamp: string;
  status: "pending" | "executed" | "rejected" | "reverted";
  executedBy: string;
}

export interface AutomationState {
  mode: AutoMode;
  rules: AutoRule[];
  actions: AutoAction[];
  actionsToday: number;
  timeSavedMin: number;
  efficiencyGain: number;
  overridesToday: number;
}

const STORAGE_KEY = "medflow_automation_";

export function getDefaultRules(): AutoRule[] {
  return [
    { id: "r1", name: "Discharge Acceleration", category: "beds", condition: "Occupancy > 90%", action: "Trigger discharge fast-track for ready patients", priority: "high", requiresApproval: false, enabled: true },
    { id: "r2", name: "ICU Surge Reserve", category: "beds", condition: "ICU load > 85%", action: "Reserve 3 surge ICU beds + alert admin", priority: "critical", requiresApproval: true, enabled: true },
    { id: "r3", name: "ER Bed Allocation", category: "beds", condition: "ER queue > 5 patients", action: "Allocate next available general beds to ER", priority: "high", requiresApproval: false, enabled: true },
    { id: "r4", name: "Isolation Hold", category: "beds", condition: "Infection risk detected", action: "Hold isolation beds, restrict ward transfers", priority: "critical", requiresApproval: true, enabled: true },
    { id: "r5", name: "Nurse Redistribution", category: "staff", condition: "Nurse:patient ratio < 1:4", action: "Notify supervisor + suggest reassignment", priority: "high", requiresApproval: false, enabled: true },
    { id: "r6", name: "Burnout Rotation", category: "staff", condition: "Burnout risk > 60%", action: "Rotate overloaded staff to next shift", priority: "medium", requiresApproval: true, enabled: true },
    { id: "r7", name: "Emergency Reserve Call", category: "staff", condition: "Emergency mode active", action: "Call reserve team + extend shifts", priority: "critical", requiresApproval: false, enabled: true },
    { id: "r8", name: "Ventilator Priority", category: "equipment", condition: "Ventilators available < 3", action: "Reserve for ICU only, restrict general use", priority: "critical", requiresApproval: false, enabled: true },
    { id: "r9", name: "Idle Monitor Realloc", category: "equipment", condition: "Monitor idle in ward > 2hrs", action: "Suggest movement to ER/ICU", priority: "low", requiresApproval: true, enabled: true },
    { id: "r10", name: "Maintenance Scheduling", category: "equipment", condition: "Maintenance pending > 3 devices", action: "Schedule after off-peak hours", priority: "medium", requiresApproval: false, enabled: true },
    { id: "r11", name: "Discharge Task Force", category: "flow", condition: "Discharge ready > 5 patients", action: "Alert discharge coordinator + billing team", priority: "high", requiresApproval: false, enabled: true },
    { id: "r12", name: "Transfer Escalation", category: "flow", condition: "Transfer delay > 20 min", action: "Notify transport team + escalate", priority: "medium", requiresApproval: false, enabled: true },
    { id: "r13", name: "Pharmacy Bottleneck", category: "flow", condition: "Pharmacy delays > 3 patients", action: "Escalate to pharmacy head + open backup counter", priority: "high", requiresApproval: false, enabled: true },
    { id: "r14", name: "OT Slot Recovery", category: "flow", condition: "Cancelled surgery slot detected", action: "Offer slot to next waitlisted patient", priority: "medium", requiresApproval: true, enabled: true },
  ];
}

export function loadAutomationState(tenantId: string): AutomationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + tenantId);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { mode: "semi", rules: getDefaultRules(), actions: [], actionsToday: 0, timeSavedMin: 0, efficiencyGain: 0, overridesToday: 0 };
}

export function saveAutomationState(tenantId: string, state: AutomationState) {
  localStorage.setItem(STORAGE_KEY + tenantId, JSON.stringify(state));
}

export function evaluateRules(state: HospitalDataState, rules: AutoRule[]): AutoAction[] {
  const triggered: AutoAction[] = [];
  const { capacity, liveOps, staff, equipment } = state;
  const occRate = (liveOps.beds.occupied / Math.max(1, capacity.totalBeds)) * 100;
  const icuRate = (liveOps.equipment.ventilatorsInUse / Math.max(1, equipment.ventilators)) * 100;
  const nurseRatio = liveOps.staff.onDutyNurses / Math.max(1, liveOps.beds.occupied);
  const burnout = Math.min(100, Math.round(((staff.doctors - liveOps.staff.onDutyDoctors + liveOps.staff.absentCount) / Math.max(1, staff.doctors)) * 100 + liveOps.staff.leaveCount * 3));
  const ventFree = equipment.ventilators - liveOps.equipment.ventilatorsInUse;
  const now = new Date().toISOString();

  const checks: { ruleId: string; triggered: boolean; reason: string }[] = [
    { ruleId: "r1", triggered: occRate > 90, reason: `Occupancy at ${Math.round(occRate)}%` },
    { ruleId: "r2", triggered: icuRate > 85, reason: `ICU load at ${Math.round(icuRate)}%` },
    { ruleId: "r3", triggered: liveOps.admissions.erWaiting > 5, reason: `${liveOps.admissions.erWaiting} patients waiting in ER` },
    { ruleId: "r5", triggered: nurseRatio < 0.25, reason: `Nurse ratio at ${nurseRatio.toFixed(2)}` },
    { ruleId: "r6", triggered: burnout > 60, reason: `Burnout risk at ${burnout}%` },
    { ruleId: "r8", triggered: ventFree < 3, reason: `Only ${ventFree} ventilators available` },
    { ruleId: "r10", triggered: liveOps.equipment.maintenancePending > 3, reason: `${liveOps.equipment.maintenancePending} devices pending maintenance` },
    { ruleId: "r11", triggered: liveOps.patientFlow.dischargeReady > 5, reason: `${liveOps.patientFlow.dischargeReady} patients discharge-ready` },
    { ruleId: "r12", triggered: liveOps.patientFlow.transferPending > 2, reason: `${liveOps.patientFlow.transferPending} transfers delayed` },
    { ruleId: "r13", triggered: liveOps.patientFlow.pharmacyDelays > 3, reason: `${liveOps.patientFlow.pharmacyDelays} pharmacy delays` },
  ];

  for (const check of checks) {
    if (!check.triggered) continue;
    const rule = rules.find(r => r.id === check.ruleId && r.enabled);
    if (!rule) continue;
    triggered.push({
      id: crypto.randomUUID(),
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      action: rule.action,
      reason: check.reason,
      timestamp: now,
      status: rule.requiresApproval ? "pending" : "executed",
      executedBy: rule.requiresApproval ? "" : "Automation Engine",
    });
  }
  return triggered;
}

export function applyAutomation(state: HospitalDataState): HospitalDataState {
  return {
    ...state,
    liveOps: {
      beds: {
        occupied: Math.round(state.liveOps.beds.occupied * 0.9),
        vacant: state.liveOps.beds.vacant + Math.round(state.liveOps.beds.occupied * 0.1),
        underCleaning: Math.max(1, state.liveOps.beds.underCleaning - 2),
        blocked: Math.max(0, state.liveOps.beds.blocked - 1),
      },
      admissions: { ...state.liveOps.admissions, erWaiting: Math.max(1, state.liveOps.admissions.erWaiting - 4) },
      staff: {
        onDutyDoctors: Math.min(state.staff.doctors, state.liveOps.staff.onDutyDoctors + 4),
        onDutyNurses: Math.min(state.staff.nurses, state.liveOps.staff.onDutyNurses + 8),
        leaveCount: state.liveOps.staff.leaveCount,
        absentCount: Math.max(0, state.liveOps.staff.absentCount - 1),
      },
      equipment: { ...state.liveOps.equipment, maintenancePending: Math.max(0, state.liveOps.equipment.maintenancePending - 2) },
      patientFlow: {
        dischargeReady: Math.max(2, state.liveOps.patientFlow.dischargeReady - 7),
        transferPending: Math.max(1, state.liveOps.patientFlow.transferPending - 2),
        pharmacyDelays: Math.max(0, state.liveOps.patientFlow.pharmacyDelays - 4),
        billingPending: Math.max(1, state.liveOps.patientFlow.billingPending - 4),
      },
    },
    opsBaseline: { ...state.opsBaseline, avgWaitTime: Math.max(10, state.opsBaseline.avgWaitTime - 15) },
  };
}
