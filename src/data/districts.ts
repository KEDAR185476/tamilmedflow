/**
 * Tamil Nadu District Master Data
 * Source: Census 2011 projections + Tamil Nadu Planning Commission estimates
 * Population figures are approximate 2024 projections based on Census growth rates
 * Coordinates are district headquarters
 */

import type { District } from "./types";

export const TN_DISTRICTS: District[] = [
  // --- NORTH ZONE ---
  { id: "chennai", name: "Chennai", population: 11500000, urbanRatio: 0.95, seniorPopulationRatio: 0.11, lat: 13.0827, lng: 80.2707, zone: "north" },
  { id: "vellore", name: "Vellore", population: 3980000, urbanRatio: 0.35, seniorPopulationRatio: 0.10, lat: 12.9165, lng: 79.1325, zone: "north" },
  { id: "kancheepuram", name: "Kancheepuram", population: 3998000, urbanRatio: 0.52, seniorPopulationRatio: 0.09, lat: 12.8342, lng: 79.7036, zone: "north" },
  { id: "tiruvallur", name: "Tiruvallur", population: 3728000, urbanRatio: 0.58, seniorPopulationRatio: 0.08, lat: 13.1431, lng: 79.9087, zone: "north" },

  // --- CENTRAL ZONE ---
  { id: "tiruchirappalli", name: "Tiruchirappalli", population: 2722000, urbanRatio: 0.42, seniorPopulationRatio: 0.11, lat: 10.7905, lng: 78.7047, zone: "central" },
  { id: "thanjavur", name: "Thanjavur", population: 2405000, urbanRatio: 0.30, seniorPopulationRatio: 0.13, lat: 10.7870, lng: 79.1378, zone: "central" },
  { id: "salem", name: "Salem", population: 3482000, urbanRatio: 0.38, seniorPopulationRatio: 0.10, lat: 11.6643, lng: 78.1460, zone: "central" },
  { id: "erode", name: "Erode", population: 2259000, urbanRatio: 0.37, seniorPopulationRatio: 0.11, lat: 11.3410, lng: 77.7172, zone: "central" },

  // --- SOUTH ZONE ---
  { id: "madurai", name: "Madurai", population: 3038000, urbanRatio: 0.55, seniorPopulationRatio: 0.10, lat: 9.9252, lng: 78.1198, zone: "south" },
  { id: "tirunelveli", name: "Tirunelveli", population: 3077000, urbanRatio: 0.32, seniorPopulationRatio: 0.12, lat: 8.7139, lng: 77.7567, zone: "south" },
  { id: "thoothukudi", name: "Thoothukudi", population: 1750000, urbanRatio: 0.38, seniorPopulationRatio: 0.10, lat: 8.7642, lng: 78.1348, zone: "south" },

  // --- WEST ZONE ---
  { id: "coimbatore", name: "Coimbatore", population: 3458000, urbanRatio: 0.65, seniorPopulationRatio: 0.11, lat: 11.0168, lng: 76.9558, zone: "west" },
];

/**
 * Subset of key districts for primary UI display
 * Full 38-district data can be expanded in future from Census/HMIS
 */
export const KEY_DISTRICT_IDS = TN_DISTRICTS.map(d => d.id);

export function getDistrict(id: string): District | undefined {
  return TN_DISTRICTS.find(d => d.id === id);
}
