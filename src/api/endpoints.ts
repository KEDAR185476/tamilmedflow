/**
 * MedFlow Nexus — Complete API Endpoint Registry
 * Production-ready endpoint structure for FastAPI / Express backend integration
 */

export const API_ENDPOINTS = {
  // Authentication & Authorization
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    profile: "/api/auth/profile",
    roles: "/api/auth/roles",
    sessions: "/api/auth/sessions",
  },
  // Capacity Operations
  capacity: {
    overview: "/api/v1/capacity/overview",
    beds: "/api/v1/capacity/beds",
    occupancy: "/api/v1/capacity/occupancy",
    prediction: "/api/v1/capacity/predict",
    districts: "/api/v1/capacity/districts",
    admissionQueue: "/api/v1/capacity/admission-queue",
  },
  beds: {
    available: "/api/v1/beds/available",
    assign: "/api/v1/beds/assign",
    release: "/api/v1/beds/release",
    transfer: "/api/v1/beds/transfer",
  },
  icu: {
    status: "/api/v1/icu/status",
    ventilators: "/api/v1/icu/ventilators",
    forecast: "/api/v1/icu/forecast",
  },
  // Workforce Intelligence
  workforce: {
    overview: "/api/v1/workforce/overview",
    staff: "/api/v1/workforce/staff",
    shifts: "/api/v1/workforce/shifts",
    fatigue: "/api/v1/workforce/fatigue",
    burnout: "/api/v1/workforce/burnout",
    deploy: "/api/v1/workforce/deploy",
  },
  // Equipment Intelligence
  equipment: {
    status: "/api/v1/equipment/status",
    devices: "/api/v1/equipment/devices",
    maintenance: "/api/v1/equipment/maintenance",
    utilization: "/api/v1/equipment/utilization",
    redistribute: "/api/v1/equipment/redistribute",
  },
  // Patient Flow
  patientFlow: {
    overview: "/api/v1/patientflow/overview",
    discharge: "/api/v1/discharge/pending",
    transfers: "/api/v1/patientflow/transfers",
    intake: "/api/v1/intake/briefings",
    efficiency: "/api/v1/efficiency/overview",
  },
  patients: {
    flow: "/api/v1/patients/flow",
    waitTimes: "/api/v1/patients/wait-times",
    admissions: "/api/v1/patients/admissions",
  },
  // AI & Forecasting
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
    confidence: "/api/v1/ai/confidence",
  },
  // Emergency & Crisis
  emergency: {
    status: "/api/v1/emergency/status",
    alerts: "/api/v1/emergency/alerts",
    dispatch: "/api/v1/emergency/dispatch",
    surge: "/api/v1/emergency/surge",
  },
  // Simulation & Digital Twin
  simulation: {
    run: "/api/v1/simulation/run",
    scenarios: "/api/v1/simulation/scenarios",
  },
  crisis: {
    twin: "/api/v1/twin/state",
    readiness: "/api/v1/crisis/readiness",
    impact: "/api/v1/impact/analyze",
  },
  // Routing
  routing: {
    recommendations: "/api/v1/routing/recommendations",
    transfers: "/api/v1/routing/transfers",
    ambulances: "/api/v1/routing/ambulances",
  },
  // Reports & Export
  reports: {
    export: "/api/v1/reports/export",
    list: "/api/v1/reports/list",
    generate: "/api/v1/reports/generate",
    schedule: "/api/v1/reports/schedule",
  },
  // System & Admin
  system: {
    health: "/api/v1/system/health",
    metrics: "/api/v1/system/metrics",
    audit: "/api/v1/system/audit",
    config: "/api/v1/system/config",
  },
} as const;
