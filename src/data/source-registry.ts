/**
 * Data Source Registry — Transparency Center
 * Every dataset used in MedFlow Nexus is documented here with source,
 * reliability, and usage information.
 */

import type { DataSourceEntry } from "./types";

export const DATA_SOURCES: DataSourceEntry[] = [
  {
    id: "hmis",
    name: "Health Management Information System (HMIS)",
    sourceType: "government",
    officialUrl: "https://hmis.nhp.gov.in",
    lastUpdated: "2024-12-31",
    usageInPlatform: "Hospital bed counts, occupancy rates, facility-level capacity",
    reliabilityScore: 5,
    status: "static",
    description: "National MIS for public health facilities. Quarterly reporting by all government hospitals. Data processed for TN district-level aggregation.",
  },
  {
    id: "nhp",
    name: "National Health Profile (NHP/CBHI)",
    sourceType: "government",
    officialUrl: "https://cbhidghs.nic.in/index1.php?lang=1&level=2&sublinkid=88&lid=1138",
    lastUpdated: "2023-12-31",
    usageInPlatform: "Doctor-patient ratios, infrastructure benchmarks, state health indicators",
    reliabilityScore: 5,
    status: "static",
    description: "Annual compendium of health statistics published by Central Bureau of Health Intelligence. Used for benchmarking and workforce planning.",
  },
  {
    id: "tnhealth",
    name: "TN Directorate of Medical & Rural Health Services",
    sourceType: "state",
    officialUrl: "https://www.tnhealth.tn.gov.in",
    lastUpdated: "2024-06-30",
    usageInPlatform: "Hospital listings, bed distributions, staff postings, district health infrastructure",
    reliabilityScore: 4,
    status: "static",
    description: "Official TN health department data. Covers government hospitals, PHCs, CHCs across all 38 districts.",
  },
  {
    id: "nvbdcp",
    name: "National Vector Borne Disease Control Programme",
    sourceType: "government",
    officialUrl: "https://nvbdcp.gov.in/",
    lastUpdated: "2024-11-30",
    usageInPlatform: "Dengue case counts, malaria incidence, seasonal disease trends",
    reliabilityScore: 4,
    status: "processed",
    description: "Weekly and monthly disease surveillance data. TN district data extracted and processed for seasonal trend modeling.",
  },
  {
    id: "idsp",
    name: "Integrated Disease Surveillance Programme (IDSP)",
    sourceType: "government",
    officialUrl: "https://idsp.nic.in/",
    lastUpdated: "2024-12-15",
    usageInPlatform: "Outbreak alerts, fever trends, disease surveillance signals",
    reliabilityScore: 4,
    status: "processed",
    description: "Weekly disease outbreak reports. Used for fever trend analysis and outbreak alert generation.",
  },
  {
    id: "imd",
    name: "India Meteorological Department (IMD)",
    sourceType: "government",
    officialUrl: "https://mausam.imd.gov.in/",
    lastUpdated: "2024-12-31",
    usageInPlatform: "Rainfall, temperature, humidity, monsoon phase, flood risk assessment",
    reliabilityScore: 5,
    status: "processed",
    description: "Climatological normals and real-time weather data. 30-year averages used for seasonal demand modeling.",
  },
  {
    id: "morth",
    name: "Ministry of Road Transport & Highways",
    sourceType: "government",
    officialUrl: "https://morth.nic.in/road-accident-in-india",
    lastUpdated: "2023-12-31",
    usageInPlatform: "Road accident rates, highway corridor risk scores, festival surge multipliers",
    reliabilityScore: 5,
    status: "static",
    description: "Annual road accident statistics of India. TN district data cross-referenced with TN Police records.",
  },
  {
    id: "census",
    name: "Census of India 2011 (Projected to 2024)",
    sourceType: "government",
    officialUrl: "https://censusindia.gov.in/",
    lastUpdated: "2024-01-01",
    usageInPlatform: "District population, urban ratio, age distribution, demographic baselines",
    reliabilityScore: 4,
    status: "processed",
    description: "2011 Census figures projected to 2024 using Registrar General growth rates. Used as population denominator for all per-capita metrics.",
  },
  {
    id: "simulation",
    name: "MedFlow Nexus Simulation Engine",
    sourceType: "simulated",
    officialUrl: "",
    lastUpdated: new Date().toISOString().split("T")[0],
    usageInPlatform: "Real-time bed occupancy updates, ER admission ticks, streaming dashboard data",
    reliabilityScore: 3,
    status: "processed",
    description: "Rule-driven simulation that models gradual occupancy changes, seasonal disease surges, and accident-driven ER spikes. Not random — all variations follow documented rules.",
  },
];

export function getDataSource(id: string): DataSourceEntry | undefined {
  return DATA_SOURCES.find(s => s.id === id);
}
