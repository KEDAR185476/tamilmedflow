/**
 * AI Recommendation Engine — MedFlow Nexus
 *
 * Constraint-logic engine that evaluates all forecast outputs against
 * Indian Public Health Standards (IPHS) and WHO guidelines to generate
 * explainable, actionable recommendations.
 *
 * Every recommendation shows: reason, expected impact, urgency, confidence.
 * No black-box outputs.
 */

import { getAllForecasts } from "./forecastEngine";
import { getHospitalCapacity, getEmergencyRisk } from "./dataService";
import { TN_DISTRICTS } from "@/data/districts";

export interface Recommendation {
  id: string;
  action: string;
  reason: string;
  expectedImpact: string;
  urgency: "critical" | "high" | "medium" | "low";
  confidence: number;         // 0-100
  modelSource: string;        // which model triggered this
  district: string;
  category: "capacity" | "workforce" | "equipment" | "emergency" | "discharge" | "general";
  timestamp: number;
}

/**
 * Generate all recommendations for a district based on current data + forecasts
 */
export function generateRecommendations(districtId: string): Recommendation[] {
  const forecasts = getAllForecasts(districtId);
  const cap = getHospitalCapacity(districtId === "all" ? undefined : districtId);
  const recommendations: Recommendation[] = [];
  const ts = Date.now();
  let idx = 0;

  const occupancyRate = cap.totalBeds > 0 ? cap.occupiedBeds / cap.totalBeds : 0;
  const icuRate = cap.icuTotal > 0 ? cap.icuOccupied / cap.icuTotal : 0;
  const districtLabel = districtId === "all"
    ? "Tamil Nadu Network"
    : TN_DISTRICTS.find(d => d.id === districtId)?.name ?? districtId;

  // ─── Capacity Recommendations ──────────────────────────────────

  if (occupancyRate > 0.90) {
    recommendations.push({
      id: `rec-${idx++}`,
      action: `Fast-track ${Math.round(cap.occupiedBeds * 0.03)} discharge-ready patients in ${districtLabel}`,
      reason: `Bed occupancy at ${Math.round(occupancyRate * 100)}% — exceeds 90% IPHS threshold`,
      expectedImpact: `Free ${Math.round(cap.occupiedBeds * 0.03)} beds within 2-4 hours`,
      urgency: occupancyRate > 0.95 ? "critical" : "high",
      confidence: 88,
      modelSource: "Bed Occupancy Predictor + Discharge Delay Model",
      district: districtId,
      category: "capacity",
      timestamp: ts,
    });
  }

  if (forecasts.occupancy.overloadRiskDay !== null) {
    recommendations.push({
      id: `rec-${idx++}`,
      action: `Reserve ${Math.round(cap.totalBeds * 0.05)} surge beds — overload predicted Day ${forecasts.occupancy.overloadRiskDay}`,
      reason: `Occupancy forecast shows >95% by Day ${forecasts.occupancy.overloadRiskDay}`,
      expectedImpact: "Prevent bed shortage for incoming admissions",
      urgency: forecasts.occupancy.overloadRiskDay <= 2 ? "critical" : "high",
      confidence: 82,
      modelSource: "Bed Occupancy Predictor (Prophet time-series)",
      district: districtId,
      category: "capacity",
      timestamp: ts,
    });
  }

  // ─── ICU Recommendations ───────────────────────────────────────

  if (icuRate > 0.85) {
    recommendations.push({
      id: `rec-${idx++}`,
      action: `Activate ICU surge protocol — convert ${Math.round(cap.icuTotal * 0.1)} HDU beds to ICU`,
      reason: `ICU occupancy at ${Math.round(icuRate * 100)}%, peak predicted at ${forecasts.icu.predictedPeak}%`,
      expectedImpact: `Add ${Math.round(cap.icuTotal * 0.1)} ICU beds from HDU conversion`,
      urgency: icuRate > 0.92 ? "critical" : "high",
      confidence: 78,
      modelSource: "ICU Demand Predictor (XGBoost)",
      district: districtId,
      category: "capacity",
      timestamp: ts,
    });
  }

  // ─── Workforce Recommendations ─────────────────────────────────

  if (forecasts.staffPressure.pressureScore > 65) {
    const nursesToMove = Math.round(cap.icuOccupied * 0.05);
    recommendations.push({
      id: `rec-${idx++}`,
      action: `Move ${Math.max(2, nursesToMove)} nurses to ICU/ER — staff pressure at ${forecasts.staffPressure.pressureScore}%`,
      reason: `Staff pressure score exceeds WHO safe threshold (65). Top factor: ${forecasts.staffPressure.breakdown[0]?.factor}`,
      expectedImpact: "Reduce nurse-patient ratio in critical care from 1:4 to 1:3",
      urgency: forecasts.staffPressure.pressureScore > 80 ? "critical" : "high",
      confidence: 72,
      modelSource: "Staff Pressure Predictor (Rule-Based, WHO-calibrated)",
      district: districtId,
      category: "workforce",
      timestamp: ts,
    });
  }

  if (forecasts.staffPressure.shortageRisk === "critical") {
    recommendations.push({
      id: `rec-${idx++}`,
      action: "Trigger reserve emergency medical team call-in",
      reason: `Staff shortage risk is CRITICAL in ${districtLabel}. Vacancy rate and shift fatigue both elevated.`,
      expectedImpact: "Additional 8-12 staff available within 2 hours from reserve roster",
      urgency: "critical",
      confidence: 70,
      modelSource: "Staff Pressure Predictor",
      district: districtId,
      category: "workforce",
      timestamp: ts,
    });
  }

  // ─── Emergency Recommendations ─────────────────────────────────

  if (forecasts.surge.riskLevel === "high") {
    recommendations.push({
      id: `rec-${idx++}`,
      action: `Reserve ${Math.round(cap.totalBeds * 0.04)} ER beds — high surge probability (${forecasts.surge.probability}%)`,
      reason: forecasts.surge.triggers.join("; "),
      expectedImpact: "Pre-positioned capacity for incoming trauma/emergency cases",
      urgency: "high",
      confidence: 75,
      modelSource: "Emergency Surge Predictor (XGBoost)",
      district: districtId,
      category: "emergency",
      timestamp: ts,
    });
  }

  if (forecasts.surge.probability > 50) {
    recommendations.push({
      id: `rec-${idx++}`,
      action: "Redirect non-critical ambulances to nearby partner hospitals",
      reason: `Surge probability ${forecasts.surge.probability}% — preserve ER capacity for critical cases`,
      expectedImpact: "Reduce ER load by 15-20% through diversion protocol",
      urgency: "medium",
      confidence: 70,
      modelSource: "Emergency Surge Predictor",
      district: districtId,
      category: "emergency",
      timestamp: ts,
    });
  }

  // ─── Equipment Recommendations ─────────────────────────────────

  const ventGap = forecasts.equipment.surplusDeficit.find(s => s.type === "Ventilators");
  if (ventGap && ventGap.gap < 0) {
    recommendations.push({
      id: `rec-${idx++}`,
      action: `Request ${Math.abs(ventGap.gap)} additional ventilators from district pool`,
      reason: `Ventilator deficit: ${ventGap.current} available vs ${ventGap.needed} projected demand`,
      expectedImpact: "Prevent ventilator shortage during ICU peak hours",
      urgency: Math.abs(ventGap.gap) > 10 ? "critical" : "high",
      confidence: 70,
      modelSource: "Equipment Demand Predictor (Rule-Based)",
      district: districtId,
      category: "equipment",
      timestamp: ts,
    });
  }

  // ─── Discharge Recommendations ─────────────────────────────────

  if (forecasts.dischargeDelay.avgDelayHours > 3.5) {
    recommendations.push({
      id: `rec-${idx++}`,
      action: `Expedite billing for ${forecasts.dischargeDelay.patientsAffected} discharge-ready patients`,
      reason: `Avg discharge delay: ${forecasts.dischargeDelay.avgDelayHours}h. Top bottleneck: ${forecasts.dischargeDelay.topBottlenecks[0]?.cause}`,
      expectedImpact: `Free ${forecasts.dischargeDelay.patientsAffected} beds by reducing delay 40%`,
      urgency: occupancyRate > 0.90 ? "high" : "medium",
      confidence: 68,
      modelSource: "Discharge Delay Risk Predictor (XGBoost, experimental)",
      district: districtId,
      category: "discharge",
      timestamp: ts,
    });
  }

  // ─── General: always produce at least one low-priority rec ─────

  if (recommendations.length === 0) {
    recommendations.push({
      id: `rec-${idx++}`,
      action: "All systems nominal — continue routine monitoring",
      reason: "All metrics within safe thresholds. No immediate action required.",
      expectedImpact: "Maintain current operational status",
      urgency: "low",
      confidence: 90,
      modelSource: "AI Recommendation Engine (Constraint-Logic)",
      district: districtId,
      category: "general",
      timestamp: ts,
    });
  }

  // Sort by urgency
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
}
