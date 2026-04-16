/**
 * Road Accident Data — Tamil Nadu
 * 
 * DATA ASSUMPTIONS:
 * - TN consistently ranks among top 3 states for road accidents in India
 * - NH-44 (Chennai-Bangalore), NH-45 (Chennai-Trichy), NH-7 corridors are high-risk
 * - Festival periods (Pongal Jan, Deepavali Oct-Nov) see 20-40% surge
 * - Weekend/holiday multiplier applied
 * 
 * Sources referenced:
 * - MoRTH (Ministry of Road Transport) Annual Reports
 * - TN Police Department accident statistics
 * - NCRB (National Crime Records Bureau) data
 * - https://morth.nic.in/road-accident-in-india
 */

import type { AccidentData } from "./types";

export const ACCIDENT_DATA: AccidentData[] = [
  {
    district: "chennai",
    avgDailyAccidents: 28,
    highwayRiskScore: 72,
    festivalRiskMultiplier: 1.4,
    nhCorridor: "NH-44 Chennai-Bangalore, NH-45 Chennai-Trichy",
    // Monthly trend: Jan-Dec (Pongal spike Jan, Deepavali spike Oct-Nov)
    monthlyTrend: [32, 26, 25, 24, 23, 25, 27, 26, 28, 34, 35, 30],
  },
  {
    district: "coimbatore",
    avgDailyAccidents: 18,
    highwayRiskScore: 68,
    festivalRiskMultiplier: 1.3,
    nhCorridor: "NH-544 Coimbatore-Salem",
    monthlyTrend: [20, 16, 15, 14, 15, 17, 18, 17, 19, 22, 23, 20],
  },
  {
    district: "madurai",
    avgDailyAccidents: 15,
    highwayRiskScore: 65,
    festivalRiskMultiplier: 1.5,
    nhCorridor: "NH-44 Madurai-Tirunelveli",
    monthlyTrend: [18, 14, 13, 12, 13, 14, 15, 14, 16, 19, 20, 17],
  },
  {
    district: "tiruchirappalli",
    avgDailyAccidents: 14,
    highwayRiskScore: 70,
    festivalRiskMultiplier: 1.3,
    nhCorridor: "NH-45 Trichy-Chennai, NH-44 Trichy-Madurai",
    monthlyTrend: [16, 13, 12, 11, 12, 13, 14, 13, 15, 17, 18, 15],
  },
  {
    district: "salem",
    avgDailyAccidents: 16,
    highwayRiskScore: 78,
    festivalRiskMultiplier: 1.4,
    nhCorridor: "NH-544 Salem-Coimbatore, NH-44 Salem-Bangalore",
    monthlyTrend: [19, 15, 14, 13, 14, 15, 16, 15, 17, 20, 21, 18],
  },
  {
    district: "tirunelveli",
    avgDailyAccidents: 10,
    highwayRiskScore: 55,
    festivalRiskMultiplier: 1.3,
    nhCorridor: "NH-44 Tirunelveli-Kanyakumari",
    monthlyTrend: [12, 9, 8, 8, 9, 10, 10, 9, 11, 13, 13, 11],
  },
  {
    district: "vellore",
    avgDailyAccidents: 12,
    highwayRiskScore: 66,
    festivalRiskMultiplier: 1.2,
    nhCorridor: "NH-44 Vellore-Chennai",
    monthlyTrend: [14, 11, 10, 10, 11, 12, 12, 11, 13, 15, 15, 13],
  },
  {
    district: "erode",
    avgDailyAccidents: 11,
    highwayRiskScore: 62,
    festivalRiskMultiplier: 1.3,
    nhCorridor: "NH-544 Erode-Salem",
    monthlyTrend: [13, 10, 9, 9, 10, 11, 11, 10, 12, 14, 14, 12],
  },
  {
    district: "thanjavur",
    avgDailyAccidents: 9,
    highwayRiskScore: 50,
    festivalRiskMultiplier: 1.4,
    nhCorridor: null,
    monthlyTrend: [11, 8, 7, 7, 8, 9, 9, 8, 10, 12, 12, 10],
  },
  {
    district: "thoothukudi",
    avgDailyAccidents: 7,
    highwayRiskScore: 45,
    festivalRiskMultiplier: 1.2,
    nhCorridor: null,
    monthlyTrend: [8, 6, 6, 5, 6, 7, 7, 6, 8, 9, 9, 8],
  },
  {
    district: "kancheepuram",
    avgDailyAccidents: 13,
    highwayRiskScore: 64,
    festivalRiskMultiplier: 1.3,
    nhCorridor: "NH-45 towards Villupuram",
    monthlyTrend: [15, 12, 11, 11, 12, 13, 13, 12, 14, 16, 16, 14],
  },
  {
    district: "tiruvallur",
    avgDailyAccidents: 14,
    highwayRiskScore: 70,
    festivalRiskMultiplier: 1.3,
    nhCorridor: "NH-44 towards Bangalore, NH-5 towards AP",
    monthlyTrend: [16, 13, 12, 12, 13, 14, 14, 13, 15, 17, 17, 15],
  },
];

export function getAccidentByDistrict(districtId: string): AccidentData | undefined {
  return ACCIDENT_DATA.find(d => d.district === districtId);
}
