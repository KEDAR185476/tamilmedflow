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
    burnout: "/api/v1/workforce/burnout",
    overview: "/api/v1/workforce/overview",
  },
  equipment: {
    devices: "/api/v1/equipment/devices",
    maintenance: "/api/v1/equipment/maintenance",
    utilization: "/api/v1/equipment/utilization",
    status: "/api/v1/equipment/status",
  },
  patientFlow: {
    overview: "/api/v1/patientflow/overview",
    discharge: "/api/v1/discharge/pending",
    transfers: "/api/v1/patientflow/transfers",
    intake: "/api/v1/intake/briefings",
    efficiency: "/api/v1/efficiency/overview",
  },
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
  // Part 4: Capacity Operations
  capacityOps: {
    overview: "/api/v1/capacity/overview",
    districts: "/api/v1/capacity/districts",
    bedsAvailable: "/api/v1/beds/available",
    icuStatus: "/api/v1/icu/status",
    routingRecommendations: "/api/v1/routing/recommendations",
    admissionQueue: "/api/v1/capacity/admission-queue",
  },
  // Part 3: AI Intelligence Layer
  forecast: {
    admissions: "/api/v1/forecast/admissions",
    icu: "/api/v1/forecast/icu",
    occupancy: "/api/v1/predict/occupancy",
    surge: "/api/v1/predict/surge",
  },
  ai: {
    recommendations: "/api/v1/recommendations",
    modelsStatus: "/api/v1/models/status",
    datasetsList: "/api/v1/datasets/list",
  },
} as const;
