/**
 * Seasonal Disease Data — Tamil Nadu
 * 
 * DATA ASSUMPTIONS:
 * - Dengue peaks during Oct-Dec (NE monsoon) and Jun-Jul (SW monsoon tail)
 * - Malaria cases are lower in TN compared to eastern states
 * - Fever/viral illness tracks with monsoon + post-monsoon
 * - COVID remains endemic at low baseline levels (2024-25 pattern)
 * 
 * Sources referenced:
 * - IDSP (Integrated Disease Surveillance Programme) weekly reports
 * - TN State Disease Surveillance Unit bulletins
 * - NVBDCP (National Vector Borne Disease Control Programme) data
 * - https://nvbdcp.gov.in/
 */

import type { DiseaseData } from "./types";
import { TN_DISTRICTS } from "./districts";

// Monsoon risk by month (1-indexed): NE monsoon Oct-Dec, SW monsoon Jun-Sep
const MONSOON_RISK_BY_MONTH = [15, 10, 8, 12, 20, 45, 55, 50, 55, 70, 85, 75];

// District-specific dengue multiplier (Chennai highest due to urban density)
const DENGUE_MULTIPLIER: Record<string, number> = {
  chennai: 2.8, coimbatore: 1.4, madurai: 1.6, tiruchirappalli: 1.3,
  tirunelveli: 1.1, salem: 1.0, erode: 0.9, vellore: 1.2,
  thanjavur: 1.1, thoothukudi: 0.8, kancheepuram: 1.5, tiruvallur: 1.4,
};

/**
 * Generate disease data for all districts across 12 months
 * Values are rule-driven, not random
 */
export function generateDiseaseData(): DiseaseData[] {
  const data: DiseaseData[] = [];

  for (const district of TN_DISTRICTS) {
    const multiplier = DENGUE_MULTIPLIER[district.id] ?? 1.0;

    for (let month = 1; month <= 12; month++) {
      const monsoonRisk = MONSOON_RISK_BY_MONTH[month - 1];
      // Dengue baseline 20-80/month/district, scaled by monsoon and district factor
      const baseDengue = 25 + (monsoonRisk / 100) * 120;
      const dengueCases = Math.round(baseDengue * multiplier);

      // Malaria: low in TN, slight rise in monsoon
      const malariaCase = Math.round((5 + monsoonRisk * 0.15) * (district.urbanRatio > 0.5 ? 0.6 : 1.2));

      // Fever: broad viral illness, tracks monsoon + temperature
      const feverCases = Math.round((200 + monsoonRisk * 8) * multiplier * (district.population / 3000000));

      // COVID: low endemic baseline, slight winter bump
      const covidBase = district.population / 500000;
      const covidCases = Math.round(covidBase * (month >= 11 || month <= 2 ? 1.5 : 1.0));

      const outbreakAlert = dengueCases > 120 || feverCases > 600;

      data.push({
        district: district.id,
        month,
        dengueCases,
        malariaCase,
        feverCases,
        covidCases,
        monsoonRiskScore: monsoonRisk,
        outbreakAlert,
      });
    }
  }

  return data;
}

export const DISEASE_DATA = generateDiseaseData();

export function getDiseaseByDistrict(districtId: string, month?: number): DiseaseData[] {
  let filtered = DISEASE_DATA.filter(d => d.district === districtId);
  if (month) filtered = filtered.filter(d => d.month === month);
  return filtered;
}
