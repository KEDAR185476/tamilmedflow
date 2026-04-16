// API structure stub — will connect to FastAPI backend in Part 7
// Endpoints documented here for transparency

export const API_ENDPOINTS = {
  capacity: {
    beds: "/api/v1/capacity/beds",
    occupancy: "/api/v1/capacity/occupancy",
    prediction: "/api/v1/capacity/predict",
  },
  workforce: {
    staff: "/api/v1/workforce/staff",
    shifts: "/api/v1/workforce/shifts",
    fatigue: "/api/v1/workforce/fatigue",
  },
  equipment: {
    devices: "/api/v1/equipment/devices",
    maintenance: "/api/v1/equipment/maintenance",
    utilization: "/api/v1/equipment/utilization",
  },
  patients: {
    flow: "/api/v1/patients/flow",
    waitTimes: "/api/v1/patients/wait-times",
    admissions: "/api/v1/patients/admissions",
  },
  emergency: {
    alerts: "/api/v1/emergency/alerts",
    dispatch: "/api/v1/emergency/dispatch",
    surge: "/api/v1/emergency/surge",
  },
  simulation: {
    run: "/api/v1/simulation/run",
    scenarios: "/api/v1/simulation/scenarios",
  },
} as const;
