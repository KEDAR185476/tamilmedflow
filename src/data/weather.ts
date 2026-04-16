/**
 * Weather Impact Data — Tamil Nadu
 * 
 * DATA ASSUMPTIONS:
 * - NE monsoon (Oct-Dec) is primary rain season for TN
 * - SW monsoon (Jun-Sep) brings moderate rainfall to western districts
 * - Chennai flood risk highest during Nov-Dec
 * - Temperature peaks Apr-May (38-42°C in interior districts)
 * 
 * Sources referenced:
 * - IMD (India Meteorological Department) climatological normals
 * - https://mausam.imd.gov.in/
 * - TN State Disaster Management Authority
 */

import type { WeatherData } from "./types";
import { TN_DISTRICTS } from "./districts";

// Monthly rainfall normals (mm) - Chennai pattern (NE monsoon dominant)
const COASTAL_RAINFALL = [25, 10, 8, 15, 40, 50, 85, 110, 120, 250, 350, 180];
const INTERIOR_RAINFALL = [10, 5, 8, 25, 45, 55, 65, 70, 95, 180, 200, 80];
const WESTERN_RAINFALL = [8, 5, 12, 40, 70, 120, 160, 140, 130, 200, 160, 50];

// Temperature by month (°C average) - interior gets hotter
const COASTAL_TEMP = [25, 27, 29, 32, 34, 33, 31, 30, 30, 29, 27, 25];
const INTERIOR_TEMP = [24, 27, 30, 34, 37, 35, 32, 31, 31, 29, 26, 24];

function getMonsoonPhase(month: number): "pre" | "active" | "post" | "dry" {
  if (month >= 10 && month <= 12) return "active";   // NE monsoon
  if (month >= 6 && month <= 9) return "active";      // SW monsoon (partial)
  if (month >= 1 && month <= 2) return "post";
  return "dry";
}

function getFloodRisk(rainfall: number, urbanRatio: number): number {
  // Urban areas flood more easily due to poor drainage
  const baseRisk = Math.min(100, (rainfall / 400) * 100);
  return Math.round(baseRisk * (1 + urbanRatio * 0.5));
}

export function generateWeatherData(): WeatherData[] {
  const data: WeatherData[] = [];

  for (const district of TN_DISTRICTS) {
    const isCoastal = ["chennai", "kancheepuram", "tiruvallur", "thoothukudi"].includes(district.id);
    const isWestern = ["coimbatore", "erode"].includes(district.id);
    const rainfallPattern = isCoastal ? COASTAL_RAINFALL : isWestern ? WESTERN_RAINFALL : INTERIOR_RAINFALL;
    const tempPattern = isCoastal ? COASTAL_TEMP : INTERIOR_TEMP;

    for (let month = 1; month <= 12; month++) {
      const rainfall = rainfallPattern[month - 1];
      const temperature = tempPattern[month - 1];
      const humidity = Math.round(55 + (rainfall / 350) * 35 + (isCoastal ? 10 : 0));

      data.push({
        district: district.id,
        month,
        rainfallMm: rainfall,
        humidity: Math.min(95, humidity),
        temperatureC: temperature,
        monsoonPhase: getMonsoonPhase(month),
        floodRisk: getFloodRisk(rainfall, district.urbanRatio),
      });
    }
  }

  return data;
}

export const WEATHER_DATA = generateWeatherData();

export function getWeatherByDistrict(districtId: string, month?: number): WeatherData[] {
  let filtered = WEATHER_DATA.filter(d => d.district === districtId);
  if (month) filtered = filtered.filter(d => d.month === month);
  return filtered;
}
