/**
 * Patient Flow Intelligence Engine
 * Patient journey tracking, discharge optimization, intake briefings
 * 
 * Logic basis:
 * - Average ER-to-ward transfer: 45-90 mins (TN GH benchmark)
 * - Discharge delays: billing (35%), pharmacy (25%), doctor signoff (20%), transport (15%), paperwork (5%)
 * - Surgery no-show rate: ~8-12% in public hospitals
 * - Internal transport delay: 15-25 mins average
 */

import { getHospitalsByDistrict } from "@/data/hospitals";
import { TN_DISTRICTS } from "@/data/districts";

export interface PatientFlowMetrics {
  avgTransferTime: number;      // minutes
  pendingDischarges: number;
  internalQueueCount: number;
  otDelays: number;
  familyRequestVolume: number;
  flowEfficiencyScore: number;  // 0-100
}

export interface DischargeBottleneck {
  category: string;
  count: number;
  avgDelay: number; // minutes
  percentage: number;
  color: string;
}

export interface TransferQueueItem {
  id: string;
  patientId: string;
  from: string;
  to: string;
  reason: string;
  priority: "urgent" | "high" | "routine";
  waitTime: number; // minutes
  status: "pending" | "in-transit" | "completed";
}

export interface PatientFlowRecommendation {
  id: string;
  action: string;
  reason: string;
  urgency: "critical" | "high" | "medium" | "low";
  impact: string;
  confidence: number;
}

export interface IntakeBriefing {
  id: string;
  patientId: string;
  ageBand: string;
  gender: string;
  district: string;
  symptoms: string[];
  medicalHistory: string[];
  allergies: string[];
  vitals: { bp: string; pulse: number; spo2: number; temp: number };
  severityScore: number; // 1-10
  priorityLevel: "critical" | "high" | "medium" | "low";
  suggestedAction: string;
  admissionTime: string;
}

export interface PipelineStage {
  stage: string;
  count: number;
  avgTime: number; // minutes
  bottleneck: boolean;
}

export function getPatientFlowMetrics(districtId: string): PatientFlowMetrics {
  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);
  const totalOccupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0);
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
  const occupancy = totalBeds > 0 ? totalOccupied / totalBeds : 0;

  // Higher occupancy → longer transfers, more discharge delays
  const baseTransfer = 52; // minutes
  const transferMultiplier = 1 + (occupancy - 0.7) * 0.8;
  
  const pendingDischarges = Math.round(totalOccupied * 0.06);
  const internalQueue = Math.round(totalOccupied * 0.03);
  const otDelays = Math.round(hospitals.length * 0.8);

  return {
    avgTransferTime: Math.round(baseTransfer * transferMultiplier),
    pendingDischarges,
    internalQueueCount: internalQueue,
    otDelays,
    familyRequestVolume: Math.round(pendingDischarges * 2.3),
    flowEfficiencyScore: Math.round(100 - occupancy * 30 - (pendingDischarges / Math.max(1, totalOccupied)) * 200),
  };
}

export function getDischargeBottlenecks(districtId: string): DischargeBottleneck[] {
  const metrics = getPatientFlowMetrics(districtId);
  const total = metrics.pendingDischarges;

  return [
    { category: "Billing Pending", count: Math.round(total * 0.35), avgDelay: 95, percentage: 35, color: "hsl(0 80% 60%)" },
    { category: "Pharmacy Delay", count: Math.round(total * 0.25), avgDelay: 68, percentage: 25, color: "hsl(30 80% 55%)" },
    { category: "Doctor Signoff", count: Math.round(total * 0.20), avgDelay: 42, percentage: 20, color: "hsl(50 80% 50%)" },
    { category: "Transport Wait", count: Math.round(total * 0.15), avgDelay: 55, percentage: 15, color: "hsl(190 80% 50%)" },
    { category: "Paperwork Queue", count: Math.round(total * 0.05), avgDelay: 30, percentage: 5, color: "hsl(220 60% 60%)" },
  ];
}

export function getTransferQueue(districtId: string): TransferQueueItem[] {
  return [
    { id: "tf-1", patientId: "PT-4521", from: "Emergency", to: "ICU Bay 2", reason: "Respiratory distress escalation", priority: "urgent", waitTime: 8, status: "pending" },
    { id: "tf-2", patientId: "PT-4518", from: "General Ward A", to: "Cardiology", reason: "ECG anomaly detected", priority: "high", waitTime: 22, status: "pending" },
    { id: "tf-3", patientId: "PT-4510", from: "Surgery Recovery", to: "General Ward B", reason: "Post-op stable transfer", priority: "routine", waitTime: 35, status: "in-transit" },
    { id: "tf-4", patientId: "PT-4525", from: "Emergency", to: "Orthopedics", reason: "Fracture stabilization", priority: "high", waitTime: 15, status: "pending" },
    { id: "tf-5", patientId: "PT-4530", from: "ICU", to: "General Ward C", reason: "ICU step-down — stable 24hrs", priority: "routine", waitTime: 45, status: "pending" },
    { id: "tf-6", patientId: "PT-4533", from: "Triage", to: "Emergency", reason: "Accident victim — multiple trauma", priority: "urgent", waitTime: 3, status: "in-transit" },
  ];
}

export function getPatientPipeline(districtId: string): PipelineStage[] {
  const metrics = getPatientFlowMetrics(districtId);
  return [
    { stage: "Triage", count: Math.round(metrics.internalQueueCount * 0.3), avgTime: 12, bottleneck: false },
    { stage: "Registration", count: Math.round(metrics.internalQueueCount * 0.2), avgTime: 18, bottleneck: false },
    { stage: "Assessment", count: Math.round(metrics.internalQueueCount * 0.25), avgTime: 25, bottleneck: true },
    { stage: "Bed Assignment", count: Math.round(metrics.internalQueueCount * 0.15), avgTime: metrics.avgTransferTime, bottleneck: metrics.avgTransferTime > 60 },
    { stage: "Ward Transfer", count: Math.round(metrics.internalQueueCount * 0.1), avgTime: 15, bottleneck: false },
    { stage: "Treatment", count: Math.round(metrics.pendingDischarges * 3), avgTime: 0, bottleneck: false },
    { stage: "Discharge Ready", count: metrics.pendingDischarges, avgTime: 72, bottleneck: true },
  ];
}

export function getFlowRecommendations(districtId: string): PatientFlowRecommendation[] {
  const metrics = getPatientFlowMetrics(districtId);
  const bottlenecks = getDischargeBottlenecks(districtId);
  const recs: PatientFlowRecommendation[] = [];

  const billingPending = bottlenecks.find(b => b.category === "Billing Pending");
  if (billingPending && billingPending.count > 3) {
    recs.push({
      id: "pf-billing",
      action: `Fast-track ${billingPending.count} discharge-ready patients pending billing`,
      reason: `Billing delays blocking ${billingPending.count} beds, avg delay ${billingPending.avgDelay} mins`,
      urgency: "critical",
      impact: `Frees ${billingPending.count} beds within 30 minutes`,
      confidence: 92,
    });
  }

  if (metrics.otDelays > 2) {
    recs.push({
      id: "pf-ot-recovery",
      action: "Fill OT slot from cancellation with next-priority case",
      reason: `${metrics.otDelays} OT delays detected, 1 slot available from cancellation`,
      urgency: "high",
      impact: "Recovers ~45 mins of OT time, advances 1 surgical case",
      confidence: 84,
    });
  }

  if (metrics.avgTransferTime > 60) {
    recs.push({
      id: "pf-transport",
      action: "Dispatch additional transport team to reduce transfer delays",
      reason: `Avg transfer time ${metrics.avgTransferTime} mins, exceeds 60-min threshold`,
      urgency: "high",
      impact: "Reduces transfer wait by ~40%",
      confidence: 79,
    });
  }

  recs.push({
    id: "pf-discharge-batch",
    action: "Batch-process pharmacy clearances for discharge queue",
    reason: "Pharmacy processing individual cases, causing bottleneck",
    urgency: "medium",
    impact: "Reduces pharmacy delay from 68 to ~25 mins per patient",
    confidence: 86,
  });

  recs.push({
    id: "pf-ct-schedule",
    action: "Optimize CT scan scheduling to reduce transport delay",
    reason: "CT scan transport averaging 18 mins due to scheduling gaps",
    urgency: "low",
    impact: "Saves ~12 mins per scan transport, frees orderly staff",
    confidence: 73,
  });

  return recs;
}

export function getIntakeBriefings(districtId: string): IntakeBriefing[] {
  const districtName = districtId === "all" ? "Chennai" : TN_DISTRICTS.find(d => d.id === districtId)?.name ?? districtId;

  return [
    {
      id: "ib-1", patientId: "PT-4536", ageBand: "45-55", gender: "Male", district: districtName,
      symptoms: ["Chest pain", "Shortness of breath", "Diaphoresis"],
      medicalHistory: ["Hypertension (10 yrs)", "Type 2 Diabetes"], allergies: ["Penicillin"],
      vitals: { bp: "160/95", pulse: 108, spo2: 93, temp: 37.2 },
      severityScore: 8, priorityLevel: "critical",
      suggestedAction: "Immediate ECG + Troponin levels, Cardiology consult",
      admissionTime: "08:42",
    },
    {
      id: "ib-2", patientId: "PT-4537", ageBand: "25-35", gender: "Female", district: districtName,
      symptoms: ["High fever (4 days)", "Joint pain", "Rash"],
      medicalHistory: ["No significant history"], allergies: ["None known"],
      vitals: { bp: "110/72", pulse: 96, spo2: 97, temp: 39.4 },
      severityScore: 5, priorityLevel: "medium",
      suggestedAction: "Dengue NS1 antigen test, CBC with platelet count, IV fluids",
      admissionTime: "09:15",
    },
    {
      id: "ib-3", patientId: "PT-4538", ageBand: "65-75", gender: "Male", district: districtName,
      symptoms: ["Fracture right femur", "Road traffic accident", "Scalp laceration"],
      medicalHistory: ["Osteoporosis", "COPD"], allergies: ["Sulfa drugs"],
      vitals: { bp: "130/82", pulse: 92, spo2: 95, temp: 37.0 },
      severityScore: 7, priorityLevel: "high",
      suggestedAction: "X-ray pelvis + femur, Ortho consult, wound suturing, pain management",
      admissionTime: "07:58",
    },
    {
      id: "ib-4", patientId: "PT-4539", ageBand: "5-10", gender: "Female", district: districtName,
      symptoms: ["Persistent vomiting", "Abdominal pain", "Dehydration"],
      medicalHistory: ["Asthma (mild)"], allergies: ["Ibuprofen"],
      vitals: { bp: "90/60", pulse: 118, spo2: 98, temp: 38.1 },
      severityScore: 6, priorityLevel: "high",
      suggestedAction: "IV rehydration, USG abdomen, Pediatric assessment, stool sample",
      admissionTime: "10:05",
    },
    {
      id: "ib-5", patientId: "PT-4540", ageBand: "35-45", gender: "Male", district: districtName,
      symptoms: ["Laceration left arm", "Minor bleeding"],
      medicalHistory: ["None"], allergies: ["None known"],
      vitals: { bp: "122/78", pulse: 82, spo2: 99, temp: 36.8 },
      severityScore: 2, priorityLevel: "low",
      suggestedAction: "Clean wound, suturing, tetanus booster if due, discharge after observation",
      admissionTime: "10:30",
    },
  ];
}

export function getEfficiencyMetrics(districtId: string) {
  const flow = getPatientFlowMetrics(districtId);
  const hospitals = getHospitalsByDistrict(districtId === "all" ? undefined : districtId);
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
  const totalOccupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0);

  return {
    staffEfficiencyScore: 74,
    equipmentUtilization: 71,
    transferDelayPercent: Math.round((flow.avgTransferTime / 90) * 100),
    dischargeDelayPercent: Math.round((flow.pendingDischarges / Math.max(1, totalOccupied)) * 100 * 8),
    burnoutRiskTrend: [62, 65, 68, 71, 69, 73, 70],
    hiddenWasteIndex: Math.round(flow.pendingDischarges * 2.1 + flow.otDelays * 5 + flow.avgTransferTime * 0.3),
  };
}
