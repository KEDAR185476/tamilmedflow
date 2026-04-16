// Insurance & Government Scheme Intelligence Engine
// Sources are real Indian / Tamil Nadu public health schemes.
// All eligibility evaluations are heuristic — final approval requires manual verification.

export type ConfidenceLabel =
  | "Likely Eligible"
  | "Possible Match"
  | "Needs Verification"
  | "Not Enough Data"
  | "No Current Match Found";

export interface PatientProfile {
  name: string;
  age: number | "";
  gender: "Male" | "Female" | "Other" | "";
  state: string;
  district: string;
  occupation: "Formal Employee" | "Informal Worker" | "Government Employee" | "Self-Employed" | "Unemployed" | "Student" | "Retired" | "";
  incomeCategory: "Below 1L" | "1L–3L" | "3L–8L" | "8L+" | "";
  bplCardHolder: boolean;
  hasInsurance: boolean;
  employerCovered: boolean;
  diagnosis: string;
  treatmentType: "Outpatient" | "Hospitalization" | "Surgery" | "Maternity" | "Critical Care" | "Diagnostic" | "";
  hospitalizationRequired: boolean;
}

export interface SchemeMatch {
  id: string;
  name: string;
  authority: string;
  confidence: number;            // 0–100
  label: ConfidenceLabel;
  coverageType: string;
  benefitRange: string;
  whyEligible: string[];
  whyNotEligible?: string[];
  applyAt: string;
  documentsRequired: string[];
  source: string;
}

export interface DocumentItem {
  name: string;
  status: "Available" | "Missing" | "Need Verification";
  required: boolean;
  note?: string;
}

export interface CoverageEstimate {
  outOfPocketReductionPct: number;   // 0–100
  estimatedCoverageINR: number;      // upper bound from matched schemes
  approvalReadinessPct: number;      // doc completeness
  schemeConfidenceAvg: number;       // avg confidence of top matches
  primaryRecommendation: string;
}

export interface InsuranceResult {
  privateInsurance: {
    status: "covered" | "self-pay" | "needs-verification";
    notes: string[];
  };
  schemes: SchemeMatch[];
  documents: DocumentItem[];
  coverage: CoverageEstimate;
  aiNotes: string[];
  generatedAt: string;
}

// ============= REAL SCHEME REGISTRY =============
// Public information sourced from official portals as of last review.
// Always verify on the official source before clinical/financial action.

const SCHEMES = [
  {
    id: "pmjay",
    name: "Ayushman Bharat — PM-JAY",
    authority: "National Health Authority, Government of India",
    coverageType: "Cashless secondary & tertiary hospitalization",
    benefitRange: "Up to ₹5,00,000 per family per year",
    applyAt: "Empanelled hospital Pradhan Mantri Arogya Mitra desk or pmjay.gov.in",
    documentsRequired: ["Aadhaar", "Ration Card", "PMJAY/Ayushman Card", "SECC/eligibility proof"],
    source: "https://pmjay.gov.in",
  },
  {
    id: "cmchis",
    name: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
    authority: "Government of Tamil Nadu",
    coverageType: "Cashless treatment for listed procedures at empanelled hospitals",
    benefitRange: "Up to ₹5,00,000 per family per year (₹1.5L base + top-ups)",
    applyAt: "cmchistn.com or empanelled hospital insurance desk",
    documentsRequired: ["CMCHIS Card / Family Card", "Aadhaar", "Income Certificate"],
    source: "https://www.cmchistn.com",
  },
  {
    id: "esi",
    name: "Employees' State Insurance (ESI)",
    authority: "ESIC, Ministry of Labour & Employment",
    coverageType: "Medical care for insured workers and dependants",
    benefitRange: "Full medical care + cash benefits (no monetary cap on treatment)",
    applyAt: "ESIC dispensary or esic.in (employer-mediated)",
    documentsRequired: ["ESI Pehchan Card", "Aadhaar", "Employer Certificate"],
    source: "https://www.esic.gov.in",
  },
  {
    id: "cghs",
    name: "Central Government Health Scheme (CGHS)",
    authority: "Ministry of Health & Family Welfare, GoI",
    coverageType: "Comprehensive medical care for central govt employees, pensioners, dependants",
    benefitRange: "Cashless at empanelled hospitals, OPD/IPD covered",
    applyAt: "CGHS Wellness Centre or cghs.gov.in",
    documentsRequired: ["CGHS Card", "Service ID / Pension Order", "Aadhaar"],
    source: "https://cghs.gov.in",
  },
  {
    id: "jsy",
    name: "Janani Suraksha Yojana (JSY)",
    authority: "National Health Mission, GoI",
    coverageType: "Cash assistance for institutional delivery",
    benefitRange: "₹700 (urban) – ₹1,400 (rural) per delivery in LPS states; varies by category",
    applyAt: "Public health facility / ANM",
    documentsRequired: ["Aadhaar", "JSY/MCP Card", "Bank Account proof"],
    source: "https://nhm.gov.in",
  },
  {
    id: "rbsk",
    name: "Rashtriya Bal Swasthya Karyakram (RBSK)",
    authority: "National Health Mission, GoI",
    coverageType: "Free health screening & treatment for children 0–18",
    benefitRange: "Free screening, referral & tertiary care for 4Ds (defects, diseases, deficiencies, developmental delays)",
    applyAt: "Government hospital or school health team",
    documentsRequired: ["Aadhaar / Birth Certificate", "School ID (if applicable)"],
    source: "https://nhm.gov.in/rbsk",
  },
  {
    id: "scsupport",
    name: "Tamil Nadu Senior Citizen Health Support",
    authority: "Government of Tamil Nadu — Social Welfare",
    coverageType: "Subsidised treatment & priority care for citizens 60+",
    benefitRange: "Varies by district program — hospitalization & medication subsidies",
    applyAt: "District Social Welfare Office or empanelled hospital",
    documentsRequired: ["Aadhaar", "Senior Citizen ID / Age proof", "Income Certificate"],
    source: "https://www.tn.gov.in",
  },
] as const;

// ============= ELIGIBILITY EVALUATION =============

function labelFromScore(score: number): ConfidenceLabel {
  if (score >= 75) return "Likely Eligible";
  if (score >= 50) return "Possible Match";
  if (score >= 25) return "Needs Verification";
  if (score > 0) return "Not Enough Data";
  return "No Current Match Found";
}

function evalScheme(p: PatientProfile, schemeId: typeof SCHEMES[number]["id"]): { score: number; reasons: string[]; blockers: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 0;

  switch (schemeId) {
    case "pmjay": {
      if (p.bplCardHolder) { score += 45; reasons.push("Holds BPL/ration card — primary PM-JAY eligibility signal"); }
      if (p.incomeCategory === "Below 1L" || p.incomeCategory === "1L–3L") { score += 25; reasons.push(`Income bracket ${p.incomeCategory} aligns with SECC deprivation criteria`); }
      if (p.hospitalizationRequired) { score += 15; reasons.push("Hospitalization required — PM-JAY covers secondary/tertiary care"); }
      if (p.treatmentType === "Surgery" || p.treatmentType === "Critical Care") { score += 10; reasons.push("Treatment type covered under listed PM-JAY procedures"); }
      if (!p.bplCardHolder && p.incomeCategory === "8L+") { blockers.push("High income bracket without BPL — unlikely to qualify"); score = Math.min(score, 15); }
      break;
    }
    case "cmchis": {
      if (p.state.toLowerCase().includes("tamil")) { score += 35; reasons.push("Resident of Tamil Nadu — state scheme applies"); }
      if (p.incomeCategory === "Below 1L" || p.incomeCategory === "1L–3L") { score += 30; reasons.push(`Annual family income ${p.incomeCategory} meets CMCHIS ceiling (≤ ₹1.2L)`); }
      else if (p.incomeCategory === "3L–8L") { score += 10; reasons.push("Income near upper threshold — verification recommended"); }
      if (p.hospitalizationRequired) { score += 15; reasons.push("CMCHIS covers cashless hospitalization for listed procedures"); }
      if (p.bplCardHolder) { score += 10; reasons.push("Family card holder strengthens eligibility"); }
      if (!p.state.toLowerCase().includes("tamil")) { blockers.push("Out-of-state resident — CMCHIS typically restricted to TN residents"); score = Math.min(score, 10); }
      break;
    }
    case "esi": {
      if (p.occupation === "Formal Employee") { score += 50; reasons.push("Formal employment status — primary ESI criterion"); }
      if (p.employerCovered) { score += 30; reasons.push("Employer-covered — likely already enrolled in ESI"); }
      if (p.incomeCategory === "1L–3L" || p.incomeCategory === "3L–8L") { score += 15; reasons.push("Wage bracket within ESI coverage threshold (≤ ₹21,000/month)"); }
      if (p.occupation === "Self-Employed" || p.occupation === "Unemployed" || p.occupation === "Retired") {
        blockers.push(`Occupation '${p.occupation}' is outside ESI scope`); score = Math.min(score, 5);
      }
      break;
    }
    case "cghs": {
      if (p.occupation === "Government Employee" || p.occupation === "Retired") {
        score += 60; reasons.push("Central/state govt employee or pensioner — CGHS primary cohort");
      }
      if (p.employerCovered) { score += 20; reasons.push("Confirmed employer health coverage"); }
      if (p.occupation && p.occupation !== "Government Employee" && p.occupation !== "Retired") {
        blockers.push("CGHS limited to central govt employees, pensioners and dependants"); score = Math.min(score, 5);
      }
      break;
    }
    case "jsy": {
      if (p.gender === "Female" && p.treatmentType === "Maternity") { score += 60; reasons.push("Maternity case — JSY covers institutional delivery"); }
      if (p.bplCardHolder || p.incomeCategory === "Below 1L") { score += 25; reasons.push("BPL / low-income — JSY cash assistance applies"); }
      if (p.gender !== "Female" || p.treatmentType !== "Maternity") {
        blockers.push("JSY applies only to maternity cases"); score = Math.min(score, 0);
      }
      break;
    }
    case "rbsk": {
      if (typeof p.age === "number" && p.age <= 18) { score += 60; reasons.push("Patient is a minor (≤ 18) — RBSK covers paediatric care"); }
      if (p.hospitalizationRequired) { score += 15; reasons.push("Tertiary referral may be supported under RBSK"); }
      if (typeof p.age === "number" && p.age > 18) { blockers.push("RBSK age limit exceeded"); score = 0; }
      break;
    }
    case "scsupport": {
      if (typeof p.age === "number" && p.age >= 60) { score += 50; reasons.push("Senior citizen (60+) — TN senior support applies"); }
      if (p.state.toLowerCase().includes("tamil")) { score += 25; reasons.push("Tamil Nadu resident"); }
      if (p.incomeCategory === "Below 1L" || p.incomeCategory === "1L–3L") { score += 15; reasons.push("Income within subsidy threshold"); }
      if (typeof p.age === "number" && p.age < 60) { blockers.push("Below 60 — not a senior citizen scheme target"); score = 0; }
      break;
    }
  }

  return { score: Math.min(100, score), reasons, blockers };
}

// ============= DOCUMENTS =============

function buildDocChecklist(p: PatientProfile, matched: SchemeMatch[]): DocumentItem[] {
  const docs = new Map<string, DocumentItem>();
  const required = new Set<string>(["Aadhaar"]);

  matched.forEach(m => m.documentsRequired.forEach(d => required.add(d)));

  // Heuristic availability
  const guess = (name: string): DocumentItem["status"] => {
    if (name === "Aadhaar") return "Available";
    if (name.includes("Ration") || name.includes("Family Card")) return p.bplCardHolder ? "Available" : "Missing";
    if (name.includes("Insurance") || name.includes("Policy")) return p.hasInsurance ? "Need Verification" : "Missing";
    if (name.includes("ESI")) return p.occupation === "Formal Employee" ? "Need Verification" : "Missing";
    if (name.includes("CGHS")) return p.occupation === "Government Employee" || p.occupation === "Retired" ? "Need Verification" : "Missing";
    if (name.includes("Income")) return p.incomeCategory ? "Need Verification" : "Missing";
    if (name.includes("Employer") || name.includes("Service ID")) return p.employerCovered ? "Need Verification" : "Missing";
    return "Missing";
  };

  required.forEach(name => {
    docs.set(name, { name, status: guess(name), required: true });
  });

  // Always-recommended supportive docs
  ["Referral Letter"].forEach(name => {
    if (!docs.has(name)) docs.set(name, { name, status: "Missing", required: false, note: "Recommended for inter-facility cases" });
  });

  return Array.from(docs.values()).sort((a, b) => Number(b.required) - Number(a.required));
}

// ============= MAIN ENGINE =============

export function checkInsurance(profile: PatientProfile): InsuranceResult {
  // Evaluate all schemes
  const schemes: SchemeMatch[] = SCHEMES.map(s => {
    const { score, reasons, blockers } = evalScheme(profile, s.id);
    return {
      id: s.id, name: s.name, authority: s.authority,
      coverageType: s.coverageType, benefitRange: s.benefitRange,
      applyAt: s.applyAt, documentsRequired: [...s.documentsRequired],
      source: s.source,
      confidence: score,
      label: labelFromScore(score),
      whyEligible: reasons,
      whyNotEligible: blockers.length ? blockers : undefined,
    };
  })
  .filter(s => s.confidence > 0)
  .sort((a, b) => b.confidence - a.confidence);

  // Private insurance branch
  const privateInsurance = (() => {
    if (profile.hasInsurance) {
      return {
        status: "needs-verification" as const,
        notes: [
          "Cashless treatment possible at network hospitals",
          "Pre-authorization likely required before admission",
          "Verify policy validity and sum insured with insurer",
          "Confirm hospital is on insurer network panel",
        ],
      };
    }
    if (profile.employerCovered) {
      return {
        status: "covered" as const,
        notes: [
          "Employer group cover detected — contact HR for policy details",
          "Cashless via TPA likely available",
          "Pre-auth required for planned procedures",
        ],
      };
    }
    return {
      status: "self-pay" as const,
      notes: [
        "No private cover indicated — patient is self-pay by default",
        "Government scheme options should be prioritised",
        "Financial counseling recommended before billing",
      ],
    };
  })();

  // Documents
  const documents = buildDocChecklist(profile, schemes);

  // Coverage estimate
  const top = schemes.slice(0, 3);
  const avgConf = top.length ? Math.round(top.reduce((s, x) => s + x.confidence, 0) / top.length) : 0;

  const benefitNumber = (b: string) => {
    const m = b.match(/₹\s*([\d,.]+)\s*([LlKk])?/);
    if (!m) return 0;
    const n = parseFloat(m[1].replace(/,/g, ""));
    const unit = (m[2] || "").toLowerCase();
    if (unit === "l") return n * 1e5;
    if (unit === "k") return n * 1e3;
    return n;
  };
  const estimatedCoverageINR = top.reduce((acc, s) => Math.max(acc, benefitNumber(s.benefitRange)), 0);

  const requiredDocs = documents.filter(d => d.required);
  const ready = requiredDocs.filter(d => d.status === "Available").length;
  const approvalReadinessPct = requiredDocs.length ? Math.round((ready / requiredDocs.length) * 100) : 0;

  const oop = privateInsurance.status === "covered" ? 75
    : avgConf >= 75 ? 70
    : avgConf >= 50 ? 50
    : avgConf >= 25 ? 25
    : 0;

  const primaryRecommendation = top[0]
    ? `Pursue ${top[0].name} (${top[0].label.toLowerCase()}). Verify documents at ${top[0].applyAt}.`
    : "No confident scheme match — refer patient to financial counselor for self-pay planning.";

  // AI notes
  const aiNotes: string[] = [];
  if (top[0]?.id === "pmjay" && !profile.bplCardHolder) aiNotes.push("Verify BPL / SECC status to confirm Ayushman eligibility.");
  if (top[0]?.id === "cmchis" && !documents.find(d => d.name.includes("Family Card") && d.status === "Available")) aiNotes.push("CMCHIS family card required — initiate enrolment if missing.");
  if (privateInsurance.status === "needs-verification") aiNotes.push("Contact insurance desk for pre-auth immediately to avoid admission delays.");
  if (documents.some(d => d.required && d.status === "Missing")) aiNotes.push("Critical documents missing — approval will be blocked until completed.");
  if (!top.length) aiNotes.push("Consider financial counselor support — no scheme confidently matched.");
  if (profile.hospitalizationRequired && approvalReadinessPct < 60) aiNotes.push("Approval readiness below 60% — escalate to hospital social worker.");

  return {
    privateInsurance,
    schemes,
    documents,
    coverage: {
      outOfPocketReductionPct: oop,
      estimatedCoverageINR,
      approvalReadinessPct,
      schemeConfidenceAvg: avgConf,
      primaryRecommendation,
    },
    aiNotes,
    generatedAt: new Date().toISOString(),
  };
}

export const SCHEME_REGISTRY = SCHEMES;
export const EMPTY_PROFILE: PatientProfile = {
  name: "", age: "", gender: "", state: "Tamil Nadu", district: "",
  occupation: "", incomeCategory: "", bplCardHolder: false,
  hasInsurance: false, employerCovered: false,
  diagnosis: "", treatmentType: "", hospitalizationRequired: false,
};

export const SAMPLE_PROFILE: PatientProfile = {
  name: "Lakshmi R.", age: 58, gender: "Female",
  state: "Tamil Nadu", district: "Madurai",
  occupation: "Informal Worker", incomeCategory: "Below 1L",
  bplCardHolder: true, hasInsurance: false, employerCovered: false,
  diagnosis: "Coronary artery disease", treatmentType: "Surgery",
  hospitalizationRequired: true,
};
