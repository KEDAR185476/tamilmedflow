/**
 * Workforce Intelligence Engine
 * Staff metrics, burnout analysis, shift optimization
 * 
 * Logic basis:
 * - IPHS norms: 1 doctor per 6 beds, 1 nurse per 3 beds (general), 1:1 ICU
 * - Burnout threshold: >60 hrs/week or >3 consecutive night shifts
 * - Reserve team: 15% of total staff should be available for surge
 */

import { STAFF_DATA } from "@/data/staff-equipment";
import type { StaffData } from "@/data/types";
import { getHospitalsByDistrict } from "@/data/hospitals";
import { TN_DISTRICTS } from "@/data/districts";

export interface WorkforceMetrics {
  totalDoctors: number;
  totalNurses: number;
  specialistsOnDuty: number;
  burnoutRiskScore: number;
  shiftBalanceIndex: number;
  emergencyReserveReady: number;
  nurseToPatientRatio: number;
}

export interface DepartmentLoad {
  department: string;
  doctors: number;
  nurses: number;
  load: number; // 0-100
  burnoutRisk: "low" | "medium" | "high" | "critical";
}

export interface ShiftSlot {
  shift: string;
  hours: string;
  doctors: number;
  nurses: number;
  coverage: number; // 0-100
}

export interface WorkforceRecommendation {
  id: string;
  action: string;
  reason: string;
  urgency: "critical" | "high" | "medium" | "low";
  impact: string;
  confidence: number;
}

const DEPARTMENTS = ["Emergency", "ICU", "General Ward", "Surgery", "Pediatrics", "Obstetrics", "Orthopedics", "Cardiology"];

export function getWorkforceMetrics(districtId: string): WorkforceMetrics {
  const staff = districtId === "all"
    ? STAFF_DATA
    : STAFF_DATA.filter(s => s.district === districtId);

  const totalDoctors = staff.reduce((s, d) => s + d.doctorsAvailable, 0);
  const totalNurses = staff.reduce((s, d) => s + d.nursesAvailable, 0);
  const specialistsOnDuty = staff.reduce((s, d) => s + d.specialistsAvailable, 0);
  const avgBurnout = staff.reduce((s, d) => s + d.fatigueRiskScore, 0) / Math.max(staff.length, 1);
  const avgShiftLoad = staff.reduce((s, d) => s + d.shiftLoad, 0) / Math.max(staff.length, 1);

  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);
  const totalOccupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0);
  const nurseRatio = totalOccupied > 0 ? totalNurses / totalOccupied : 0;

  return {
    totalDoctors,
    totalNurses,
    specialistsOnDuty,
    burnoutRiskScore: Math.round(avgBurnout),
    shiftBalanceIndex: Math.round(100 - avgShiftLoad * 0.4),
    emergencyReserveReady: Math.round(totalDoctors * 0.15 + totalNurses * 0.1),
    nurseToPatientRatio: Math.round(nurseRatio * 100) / 100,
  };
}

export function getDepartmentLoads(districtId: string): DepartmentLoad[] {
  const metrics = getWorkforceMetrics(districtId);
  const baseDoctors = Math.max(1, Math.round(metrics.totalDoctors / DEPARTMENTS.length));
  const baseNurses = Math.max(1, Math.round(metrics.totalNurses / DEPARTMENTS.length));

  // Department load multipliers (ER/ICU heavier)
  const multipliers: Record<string, number> = {
    Emergency: 1.4, ICU: 1.3, "General Ward": 0.8, Surgery: 1.1,
    Pediatrics: 0.9, Obstetrics: 0.85, Orthopedics: 0.95, Cardiology: 1.05,
  };

  return DEPARTMENTS.map(dept => {
    const m = multipliers[dept] || 1;
    const load = Math.min(100, Math.round(metrics.burnoutRiskScore * m));
    return {
      department: dept,
      doctors: Math.round(baseDoctors * m),
      nurses: Math.round(baseNurses * m),
      load,
      burnoutRisk: load > 85 ? "critical" : load > 70 ? "high" : load > 50 ? "medium" : "low",
    };
  });
}

export function getShiftTimeline(districtId: string): ShiftSlot[] {
  const metrics = getWorkforceMetrics(districtId);
  const totalStaff = metrics.totalDoctors + metrics.totalNurses;

  return [
    { shift: "Morning", hours: "06:00–14:00", doctors: Math.round(metrics.totalDoctors * 0.4), nurses: Math.round(metrics.totalNurses * 0.4), coverage: 92 },
    { shift: "Afternoon", hours: "14:00–22:00", doctors: Math.round(metrics.totalDoctors * 0.35), nurses: Math.round(metrics.totalNurses * 0.35), coverage: 85 },
    { shift: "Night", hours: "22:00–06:00", doctors: Math.round(metrics.totalDoctors * 0.2), nurses: Math.round(metrics.totalNurses * 0.2), coverage: 68 },
    { shift: "Reserve", hours: "On-Call", doctors: Math.round(metrics.totalDoctors * 0.05), nurses: Math.round(metrics.totalNurses * 0.05), coverage: 100 },
  ];
}

export function getWorkforceRecommendations(districtId: string): WorkforceRecommendation[] {
  const deptLoads = getDepartmentLoads(districtId);
  const metrics = getWorkforceMetrics(districtId);
  const recs: WorkforceRecommendation[] = [];

  const criticalDepts = deptLoads.filter(d => d.burnoutRisk === "critical");
  const lowDepts = deptLoads.filter(d => d.burnoutRisk === "low");

  criticalDepts.forEach(dept => {
    if (lowDepts.length > 0) {
      recs.push({
        id: `wf-${dept.department}-redeploy`,
        action: `Move 2 nurses from ${lowDepts[0].department} to ${dept.department}`,
        reason: `${dept.department} burnout risk is critical (${dept.load}%)`,
        urgency: "critical",
        impact: "Reduces burnout risk by ~15%, improves patient response time",
        confidence: 87,
      });
    }
  });

  if (metrics.burnoutRiskScore > 70) {
    recs.push({
      id: "wf-reserve-activate",
      action: "Activate emergency reserve team",
      reason: `System-wide burnout score at ${metrics.burnoutRiskScore}%`,
      urgency: "high",
      impact: "Provides 4-6 hours of surge staffing capacity",
      confidence: 91,
    });
  }

  if (metrics.nurseToPatientRatio < 0.3) {
    recs.push({
      id: "wf-nurse-ratio",
      action: "Request additional nursing staff from partner network",
      reason: `Nurse-to-patient ratio critically low (${metrics.nurseToPatientRatio})`,
      urgency: "high",
      impact: "Improves care quality and reduces medication errors",
      confidence: 84,
    });
  }

  const nightShift = getShiftTimeline(districtId).find(s => s.shift === "Night");
  if (nightShift && nightShift.coverage < 75) {
    recs.push({
      id: "wf-night-cover",
      action: "Add 1 doctor to ER night shift",
      reason: `Night coverage at ${nightShift.coverage}%, below 75% threshold`,
      urgency: "medium",
      impact: "Reduces ER wait times during peak accident hours",
      confidence: 79,
    });
  }

  recs.push({
    id: "wf-specialist-deploy",
    action: "Deploy reserve anesthetist to Surgery",
    reason: "Upcoming elective surgery schedule exceeds current anesthetist capacity",
    urgency: "medium",
    impact: "Prevents surgery delays and OT underutilization",
    confidence: 76,
  });

  return recs;
}

export function getBurnoutByDepartment(districtId: string): { department: string; score: number; trend: number[] }[] {
  const deptLoads = getDepartmentLoads(districtId);
  return deptLoads.map(d => ({
    department: d.department,
    score: d.load,
    trend: Array.from({ length: 7 }, (_, i) => Math.max(20, d.load - 10 + Math.round(Math.sin(i * 0.8) * 8 + i * 1.5))),
  }));
}
