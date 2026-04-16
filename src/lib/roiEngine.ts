/**
 * ROI Intelligence Engine — Part R3
 * Cost savings, efficiency scoring, purchase avoidance, throughput gains.
 * All values modeled estimates based on Indian private hospital benchmarks.
 */

export interface ROIMetrics {
  monthlySavingsLakhs: number;
  idleReductionPct: number;
  bedUtilGainPct: number;
  waitTimeReductionPct: number;
  staffEfficiencyGainPct: number;
  equipmentAvoidedLakhs: number;
  emergencyReadinessGainPct: number;
  annualROIPct: number;
}

export interface SavingsBreakdown {
  category: string;
  monthly: number; // ₹ lakhs
  description: string;
  icon: string;
}

export interface EfficiencyScore {
  factor: string;
  score: number; // 0-100
  weight: number;
}

export interface PurchaseAvoided {
  asset: string;
  count: number;
  unitCost: number; // ₹ lakhs
  totalAvoided: number; // ₹ lakhs
  reason: string;
}

export interface ThroughputGain {
  metric: string;
  before: number;
  after: number;
  unit: string;
  delta: string;
}

export interface AIValueLine {
  id: string;
  text: string;
  valueLakhs: number;
  category: "equipment" | "beds" | "staff" | "flow" | "prediction";
}

export function getROIMetrics(activated: boolean): ROIMetrics {
  if (!activated) {
    return {
      monthlySavingsLakhs: 0,
      idleReductionPct: 0,
      bedUtilGainPct: 0,
      waitTimeReductionPct: 0,
      staffEfficiencyGainPct: 0,
      equipmentAvoidedLakhs: 0,
      emergencyReadinessGainPct: 0,
      annualROIPct: 0,
    };
  }
  return {
    monthlySavingsLakhs: 18.6,
    idleReductionPct: 62,
    bedUtilGainPct: 22,
    waitTimeReductionPct: 45,
    staffEfficiencyGainPct: 18,
    equipmentAvoidedLakhs: 84,
    emergencyReadinessGainPct: 35,
    annualROIPct: 312,
  };
}

export function getSavingsBreakdown(): SavingsBreakdown[] {
  return [
    { category: "Bed Turnover Acceleration", monthly: 4.8, description: "Faster discharge cycle frees revenue-generating bed-days", icon: "Bed" },
    { category: "Overtime Reduction", monthly: 3.6, description: "Smarter shift balancing cuts overtime payouts", icon: "Users" },
    { category: "Idle Equipment Recovery", monthly: 2.9, description: "Reallocated assets replace rental & deferred purchases", icon: "Wrench" },
    { category: "ER Bottleneck Reduction", monthly: 2.4, description: "Fewer escalations to higher-cost care pathways", icon: "AlertTriangle" },
    { category: "Discharge Cycle Speed", monthly: 1.9, description: "Pharmacy + billing automation removes blocked beds", icon: "TrendingUp" },
    { category: "OT Utilization Gain", monthly: 2.1, description: "Better scheduling adds 1-2 surgeries per OT per week", icon: "Activity" },
    { category: "Avoided Capital Spend", monthly: 0.9, description: "Optimized assets defer ₹84L annual purchase plan", icon: "IndianRupee" },
  ];
}

export function getEfficiencyScores(activated: boolean): EfficiencyScore[] {
  const baseline = [
    { factor: "Bed Utilization", baseline: 64, weight: 20 },
    { factor: "Equipment Utilization", baseline: 58, weight: 20 },
    { factor: "Staffing Balance", baseline: 62, weight: 15 },
    { factor: "Discharge Speed", baseline: 55, weight: 15 },
    { factor: "Queue Efficiency", baseline: 60, weight: 15 },
    { factor: "Reserve Readiness", baseline: 70, weight: 15 },
  ];
  return baseline.map(b => ({
    factor: b.factor,
    score: activated ? Math.min(96, b.baseline + 24 + Math.random() * 4) : b.baseline,
    weight: b.weight,
  }));
}

export function getOverallScore(scores: EfficiencyScore[]): number {
  const totalWeight = scores.reduce((s, x) => s + x.weight, 0);
  return Math.round(scores.reduce((s, x) => s + (x.score * x.weight), 0) / totalWeight);
}

export function getScoreGrade(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Elite", color: "emerald" };
  if (score >= 75) return { label: "Strong", color: "cyan" };
  if (score >= 60) return { label: "Moderate", color: "amber" };
  return { label: "Needs Attention", color: "red" };
}

export function getPurchaseAvoidance(): PurchaseAvoided[] {
  return [
    { asset: "Ventilators", count: 3, unitCost: 8, totalAvoided: 24, reason: "Idle units in Pulmonology redirected to ICU demand" },
    { asset: "Patient Monitors", count: 6, unitCost: 1.4, totalAvoided: 8.4, reason: "Cross-ward monitor sharing eliminated redundant procurement" },
    { asset: "Temporary Beds", count: 8, unitCost: 0.8, totalAvoided: 6.4, reason: "Faster discharge cycle freed permanent beds" },
    { asset: "Infusion Pumps", count: 5, unitCost: 0.6, totalAvoided: 3, reason: "Idle pump pool covered ICU surge demand" },
    { asset: "Wheelchairs", count: 4, unitCost: 0.15, totalAvoided: 0.6, reason: "Centralized tracking reduced shrinkage estimates" },
    { asset: "Overtime Hours (annual)", count: 2400, unitCost: 0.018, totalAvoided: 42, reason: "AI shift rebalancing cut OT by 32%" },
  ];
}

export function getThroughputGains(): ThroughputGain[] {
  return [
    { metric: "Patients Served / Day", before: 248, after: 296, unit: "", delta: "+19%" },
    { metric: "Admissions Processed / Hr", before: 8.2, after: 12.4, unit: "", delta: "+51%" },
    { metric: "Avg Discharge Time", before: 4.2, after: 2.1, unit: "h", delta: "-50%" },
    { metric: "ER Wait Queue", before: 22, after: 9, unit: "patients", delta: "-59%" },
    { metric: "ICU Turnover Rate", before: 1.8, after: 2.4, unit: "/bed/wk", delta: "+33%" },
    { metric: "OT Utilization", before: 58, after: 78, unit: "%", delta: "+34%" },
  ];
}

export function getSavingsTrend() {
  // 12 months of progressive savings
  return Array.from({ length: 12 }, (_, i) => {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i];
    const ramp = Math.min(1, (i + 1) / 6); // ramp up over 6 months
    return {
      month,
      savings: Math.round((6 + i * 1.8 + Math.sin(i / 2) * 1.5) * ramp * 10) / 10,
      avoided: Math.round((4 + i * 1.2) * ramp * 10) / 10,
      cumulative: Math.round((i + 1) * 12 * ramp * 10) / 10,
    };
  });
}

export function getUtilizationCurve() {
  return Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    baseline: 62,
    optimized: Math.min(89, 64 + i * 2.2),
  }));
}

export function getDeptEfficiency() {
  return [
    { dept: "ICU", baseline: 68, optimized: 91 },
    { dept: "ER", baseline: 58, optimized: 88 },
    { dept: "Gen Med", baseline: 65, optimized: 84 },
    { dept: "Pulmonology", baseline: 60, optimized: 87 },
    { dept: "Cardiology", baseline: 70, optimized: 89 },
    { dept: "Surgery", baseline: 62, optimized: 85 },
    { dept: "Pediatrics", baseline: 64, optimized: 82 },
  ];
}

export function getROIProjection() {
  // 24 months ROI curve
  return Array.from({ length: 24 }, (_, i) => {
    const month = i + 1;
    const investment = 24; // ₹L upfront platform cost
    const cumulative = Math.round((month * 14 - investment) * 10) / 10;
    return {
      month: `M${month}`,
      cumulative,
      breakeven: 0,
    };
  });
}

export function getCostAvoidanceBreakdown() {
  const data = getPurchaseAvoidance();
  return data.map(d => ({ name: d.asset, value: d.totalAvoided }));
}

export function getAIValueLines(): AIValueLine[] {
  return [
    { id: "v1", text: "Reallocated 18 idle assets to high-demand departments", valueLakhs: 6.2, category: "equipment" },
    { id: "v2", text: "Freed 12 beds through discharge acceleration this month", valueLakhs: 4.8, category: "beds" },
    { id: "v3", text: "Reduced overtime by 32% via predictive shift planning", valueLakhs: 3.6, category: "staff" },
    { id: "v4", text: "Predicted ICU stress 2h early — prevented overload event", valueLakhs: 2.4, category: "prediction" },
    { id: "v5", text: "Cleared pharmacy bottleneck — 8 discharges accelerated", valueLakhs: 1.9, category: "flow" },
    { id: "v6", text: "Deferred ₹24L ventilator purchase via cross-ward sharing", valueLakhs: 24, category: "equipment" },
    { id: "v7", text: "Cut ER triage time by 12 min/patient via monitor relocation", valueLakhs: 1.5, category: "flow" },
  ];
}

export interface InvestorMetric {
  label: string;
  value: string;
  sub: string;
}

export function getInvestorMetrics(): InvestorMetric[] {
  return [
    { label: "India Private Hospitals TAM", value: "₹4,800 Cr", sub: "12,400+ multi-specialty hospitals" },
    { label: "Government Network SAM", value: "₹1,200 Cr", sub: "AIIMS + state govt networks" },
    { label: "Avg SaaS ACV", value: "₹18 L", sub: "Per 200-bed hospital / year" },
    { label: "Multi-Hospital Scale", value: "1000+", sub: "Hospitals supportable per region cluster" },
    { label: "Year 3 Revenue Target", value: "₹62 Cr", sub: "344 paying hospitals · 12% TN share" },
    { label: "Gross Margin", value: "82%", sub: "SaaS infra + AI inference" },
  ];
}
