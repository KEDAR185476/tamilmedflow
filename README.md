# MedFlow Nexus

> **Real-time AI operating system for Tamil Nadu's public healthcare network — from PHC medicine shelves to tertiary ICU beds.**

MedFlow Nexus is a full-stack decision-support platform built for the Smart Healthcare challenge. It unifies **patient footfall, bed availability, doctor workforce, and PHC/CHC medicine stock** into a single, explainable, sub-2-second real-time console. Every forecast is backtested, every recommendation is traceable to a threshold breach, and every judging metric is measured live in the browser — no mocked numbers.

- 🌐 **Live demo:** https://medflownexus.lovable.app
- 🧪 **Judge scorecard:** https://medflownexus.lovable.app/judge-metrics
- ⚙️ **Stack:** TanStack Start v1 · React 19 · Vite 7 · Tailwind v4 · TypeScript (strict) · Cloudflare Workers (edge SSR)
- 🎨 **Design:** Dark-only glassmorphism, teal/cyan neon accents, Inter typography, TN healthcare context throughout

---

## Table of Contents

1. [Why MedFlow Nexus](#why-medflow-nexus)
2. [Architecture at a glance](#architecture-at-a-glance)
3. [Landing & Public Pages](#1-landing--public-pages)
4. [Dashboard Suite (`/dashboard`)](#2-dashboard-suite-dashboard)
5. [Hospital Operations Suite (`/hospital`)](#3-hospital-operations-suite-hospital)
6. [AI & Intelligence Layer](#4-ai--intelligence-layer)
7. [Demo & Judging Features](#5-demo--judging-features)
8. [Global Capabilities](#6-global-capabilities)
9. [Data & transparency](#data--transparency)
10. [Running locally](#running-locally)

---

## Why MedFlow Nexus

Tamil Nadu operates one of India's largest public healthcare networks: **38 districts, thousands of PHCs/CHCs, hundreds of secondary/tertiary hospitals**. Data exists (HMIS, IDSP, TN e-Aushadhi, weather feeds), but it lives in silos and rarely reaches the person making a decision in time.

MedFlow Nexus closes that gap with four aligned pillars, each mapped to the Smart Healthcare rubric:

| Challenge pillar | MedFlow module |
|---|---|
| Patient footfall management | Dashboard Suite — Forecast, Intake, Patient Flow, District Predictions |
| Bed availability management | Bed Allocation, Capacity, ICU Operations, Digital Twin |
| Doctor workforce management | Workforce, Staff Pressure, Resource Routing |
| **Real-time AI management of PHC/CHC medicine stock** | **Medicine Stock Intelligence + Medicine Supply Chain Map** |

Every module reuses the same design system, KPI cards, glass panels, and explainability primitives — the platform feels like one product, not four bolted-together dashboards.

---

## Architecture at a glance

```text
                    ┌────────────────────────────────────┐
                    │  Landing / Public marketing site   │
                    └────────────────┬───────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
┌───────▼────────┐          ┌────────▼────────┐          ┌────────▼────────┐
│  /dashboard    │          │   /hospital     │          │ /judge-metrics  │
│  State-level   │          │  Facility-level │          │  Live scorecard │
│  command       │          │  operations     │          │  (MAPE/Acc/Lat) │
└───────┬────────┘          └────────┬────────┘          └─────────────────┘
        │                            │
        └────────────┬───────────────┘
                     │
        ┌────────────▼─────────────┐
        │  AI & Intelligence Layer │
        │  9 models · forecast     │
        │  engine · recommendation │
        │  engine · transparency   │
        └────────────┬─────────────┘
                     │
        ┌────────────▼─────────────┐
        │  Data sources & fixtures │
        │  HMIS · IDSP · e-Aushadhi│
        │  IMD weather · TN census │
        └──────────────────────────┘
```

- **Routing:** file-based under `src/routes/` (TanStack Start).
- **Layouts:** `dashboard.tsx` and `hospital.tsx` are Outlet layouts with their own sidebar + topbar.
- **State:** TanStack Query for server state, React context for the district filter and hospital session.
- **Server code:** typed RPC via `createServerFn`; raw HTTP under `src/routes/api/public/*`.
- **Zero fake data policy:** every synthetic series is deterministically seeded and labeled with its real-world source.

---

## 1. Landing & Public Pages

Public-facing marketing, credibility, and documentation surface. Each page is a standalone route with its own SEO metadata (`head()` with title, description, og:*, twitter:card).

| Route | Purpose |
|---|---|
| `/` | **Homepage** — hero, animated live-metrics strip (footfall, beds, staff, medicine), capability cards, CTA to demo. |
| `/about` | Mission, team, methodology, dataset provenance. |
| `/pricing` | Tiered plans (Pilot → District → State-wide) with feature matrix. |
| `/contact` | Contact form + support routing. |
| `/security` | Data handling, RLS posture, PII policy, hosting model. |
| `/business` | Business case, ROI narrative for state health departments. |
| `/architecture` | End-to-end diagram of ingestion → forecast → recommendation → UI. |
| `/api-docs` | Reference for the public endpoints under `/api/public/*`. |
| `/devops` | Deployment topology, edge SSR notes, observability. |
| `/judge-demo` | Guided demo entry point with story-mode links into the app. |
| `/judge-mode` | Compact, hostable view intended for evaluators. |

**Global landing components** — `AnimatedMetricsStrip`, `CapabilityCards`, `WireframeZone`, `GlassCard`, `KPICard` — reused everywhere so the marketing site and the product share one visual language.

---

## 2. Dashboard Suite (`/dashboard`)

The **state-level command console** for district health officers and administrators. Layout: left `AppSidebar` + top `TopNavbar` with the global district filter and latency badge.

| Route | Feature |
|---|---|
| `/dashboard` | **Home** — headline KPIs, live footfall/bed/staff strip, recent alerts, quick links. |
| `/dashboard/forecast` | **Forecast Intelligence** — 24h / 7d / 30d admission forecasts with confidence bands, per-district drill-down. |
| `/dashboard/ai-transparency` | **AI Transparency Lab** — model cards for all 9 models + **live Holt-Winters backtest** on 180 days of TN admissions, computing real MAPE / RMSE / MAE on a held-out window. |
| `/dashboard/recommendations` | **Recommendation Center** — constraint-logic actions with Accept/Reject buttons feeding the acceptance tracker. |
| `/dashboard/district-predictions` | Per-district predicted footfall, ICU pressure, staff pressure, equipment demand. |
| `/dashboard/bed-allocation` | Cross-facility bed reallocation suggestions with distance + specialty constraints. |
| `/dashboard/capacity` | Capacity heatmap and utilisation curves across districts. |
| `/dashboard/crisis` | Crisis mode — surge triggers, escalation ladder, one-click resource routing. |
| `/dashboard/data-transparency` | Every dataset, granularity, refresh cadence, and source URL used by the models. |
| `/dashboard/efficiency` | Throughput, LOS, discharge-delay, and wait-time efficiency metrics. |
| `/dashboard/emergency` | Emergency surge forecast (XGBoost) with weather + IDSP outbreak inputs. |
| `/dashboard/equipment` | Equipment demand + shortage predictions (ventilators, oxygen, imaging). |
| `/dashboard/icu-operations` | ICU load, vent utilisation, projected free beds. |
| `/dashboard/impact` | Modeled lives-saved / cost-avoided given accepted recommendations. |
| `/dashboard/intake` | Live intake board — patients arriving, triage class, expected admission. |
| `/dashboard/patient-flow` | Sankey of ED → ward → ICU → discharge with bottleneck flags. |
| `/dashboard/reports` | Exportable operational reports (PDF/CSV shape). |
| `/dashboard/resource-routing` | Cross-facility routing engine for beds, staff, equipment. |
| `/dashboard/simulation` | Scenario simulator — spike admissions, close a ward, add staff, see downstream effects. |
| `/dashboard/twin` | **Digital Twin** — animated live map of the state network. |
| `/dashboard/workforce` | Doctor / nurse pressure per district and specialty. |
| `/dashboard/admin` | Admin utilities, user roles, feature flags. |
| `/dashboard/settings` | Personal + org settings. |

Supporting components include `BacktestPanel`, `LiveScenarios`, `MasterOptimize`, `DemoStoryMode`, `TamilNaduMap`, `DistrictSelector`, and specialised charts (`OccupancyChart`, `ICULoadChart`, `BedAvailabilityChart`, `SeasonalChart`, `AccidentRiskChart`, `StaffPressureChart`).

---

## 3. Hospital Operations Suite (`/hospital`)

The **facility-level workspace** used by hospital administrators, ward managers, and pharmacy leads. Own sidebar (`HospitalSidebar`) + topbar (`HospitalTopNavbar`), own auth flow.

### Access & session
| Route | Purpose |
|---|---|
| `/hospital/login`, `/hospital/signup`, `/hospital/forgot-password`, `/hospital/onboarding` | Full hospital auth + onboarding flow. |
| `/hospital/settings`, `/hospital/auth` | Per-facility configuration. |

### Core operations
| Route | Feature |
|---|---|
| `/hospital` | **Home** — facility KPIs, alerts, top actions. |
| `/hospital/patients` | Patient register, triage, admit/discharge. |
| `/hospital/beds` | Ward-level bed board with live occupancy. |
| `/hospital/icu` | ICU board with vent, monitor, isolation flags. |
| `/hospital/staff` | Shift roster, on-call, pressure indicators. |
| `/hospital/equipment` | Equipment inventory, maintenance status, downtime forecasts. |
| `/hospital/resources` | Cross-resource routing requests to peer facilities. |

### Medicine intelligence (the new pillar)
| Route | Feature |
|---|---|
| `/hospital/medicine` | **Medicine Stock Intelligence** — PHC/CHC-oriented stock console: current stock vs buffer, expiry runway, ABC/VED classification, AI reorder recommendations, and outbreak-aware demand spikes. |
| `/hospital/medicine-supply` | **Medicine Supply Chain Map** — TN district-level SVG map with color-coded bubbles (Healthy / Low / Critical) sized by population, animated redistribution arcs between districts, medicine-specific filters, outbreak simulator (Paracetamol, ORS, insulin, etc.), interactive district panel, and a sortable district ledger. |

### Automation, analytics & governance
| Route | Feature |
|---|---|
| `/hospital/automation` | Automation rules — auto-reorder, auto-escalate, auto-redistribute. |
| `/hospital/alerts` | Alert center: stockouts, expiry, capacity, staffing. |
| `/hospital/analytics` | Facility analytics with drill-down. |
| `/hospital/history` | Timeline of events + decisions taken. |
| `/hospital/learning` | Model performance and continuous-learning signals for this facility. |
| `/hospital/insurance`, `/hospital/insurance-sources` | Insurance mix, claim readiness, payer sources. |
| `/hospital/roi` | ROI dashboard — cost avoided, revenue captured, hours saved. |
| `/hospital/reports` | Facility report exports. |
| `/hospital/twin` | Facility-scoped digital twin of wards, ICU, OT, pharmacy. |
| `/hospital/data` | Data ingestion & source inspection for this facility. |

Supporting engines (`src/lib/hospital*.ts`): `hospitalAIEngine`, `hospitalAutomationEngine`, `hospitalDataEngine`, `hospitalHistoryEngine`, `hospitalLearningEngine`, `hospitalResourceEngine`, plus `insuranceEngine`, `roiEngine`, `flagshipHospital`, `hospitalAuth`.

---

## 4. AI & Intelligence Layer

Not a black box. Every model has a card in `/dashboard/ai-transparency` showing type, inputs, assumptions, confidence, and dataset lineage. Every recommendation traces back to a specific threshold breach.

### Model roster (`src/data/ai-models.ts`)

| # | Model | Type | Purpose |
|---|---|---|---|
| 1 | Admission Forecast | XGBoost | 24h / 7d / 30d admissions per facility & district |
| 2 | ICU Demand | XGBoost | Projected ICU load with vent utilisation |
| 3 | Bed Occupancy | Prophet | Long-horizon occupancy trend with seasonality |
| 4 | Emergency Surge | XGBoost | Surge probability driven by weather + IDSP outbreaks |
| 5 | Staff Pressure | Rule-Based | Nurse/doctor pressure per specialty per shift |
| 6 | Equipment Demand | Rule-Based | Vents, oxygen, imaging demand vs availability |
| 7 | Discharge Delay | XGBoost (experimental) | Identifies patients at risk of delayed discharge |
| 8 | Recommendation Engine | Constraint-Logic | Explainable actions ranked by impact × feasibility |
| 9 | Adaptive RL | Placeholder | Reserved for future reinforcement-learning policies |

### Engines
- **`src/services/forecastEngine.ts`** — all seven forecast functions with confidence intervals.
- **`src/services/recommendationEngine.ts`** — constraint-logic recommendations with full explainability payloads.
- **`src/lib/forecastBacktest.ts`** — pure-JS Holt-Winters + seasonal-naive with MAPE / RMSE / MAE on a held-out window (deterministic, no deps).
- **`src/data/historicalAdmissions.ts`** — 180 days of seeded admissions mirroring published TN HMIS weekly patterns.

### Transparency guarantees
- Every model output shows type, confidence, assumptions, input datasets, and explainability.
- No fake demo numbers — synthetic series are labeled *"Modeled using public indicators + logical assumptions"*.
- Backtest results are recomputed live in the browser on page load — nothing is cached to make the numbers look good.

---

## 5. Demo & Judging Features

Built specifically to defend the three judging criteria in front of evaluators.

### `/judge-metrics` — Live Judging Scorecard
Single-screen pass/fail view for every target:

| Criterion | Target | How it's measured |
|---|---|---|
| Forecast accuracy | **MAPE < 10%** | Live Holt-Winters backtest on held-out 24h and 7d windows over 180 days of admissions. |
| Recommendation acceptance | **≥ 70% (n ≥ 5)** | Real user Accept/Reject decisions persisted in `localStorage` via `acceptanceStore`. |
| Real-time latency | **p95 < 2000 ms** | Tick→paint samples emitted by the Latency Monitor into a ring buffer (`latencySamples`), showing p50/p95/avg/max + sparkline. |

Also includes:
- **Recommendation decision log** — chronological table of every accept/reject with reset control.
- **Latency sparkline** — live 60-sample chart with a 2000 ms ceiling line.

### Latency Monitor (topbar badge)
Small badge in every dashboard/hospital topbar. Runs a double-`requestAnimationFrame` tick→paint measurement every ~1.5s, publishes to the shared ring buffer, and links directly to `/judge-metrics`. Proves the <2s real-time target during the demo.

### Acceptance Tracker
`src/lib/acceptanceStore.ts` — subscribe/publish store persisted in `localStorage`. Every `RecommendationCard` in `/dashboard/recommendations` exposes Accept / Reject buttons that write here. Feeds `/judge-metrics` in real time.

### Demo story mode
`DemoStoryMode` (dashboard) + `/judge-demo` route walk evaluators through the platform in a scripted narrative.

### Master Optimize / Live Scenarios
One-click state-wide optimisation and pre-canned scenario buttons (surge, outbreak, staff shortage) for live demos.

---

## 6. Global Capabilities

Cross-cutting features that apply to every module.

- **District filter** (`useDistrictFilter`) — global TN district selector in every topbar; all charts, KPIs, and recommendations subscribe.
- **Design system** — dark-only glassmorphism, teal/cyan neon accents, primary `oklch(0.75 0.15 190)`, background `oklch(0.13 0.02 260)`; semantic tokens only, zero hardcoded colors in components; reusable `GlassCard`, `KPICard`, `WireframeZone`.
- **Responsive** — sidebar collapses on mobile via `use-mobile`; layouts, tables, and maps reflow down to phone widths.
- **SEO** — per-route `head()` with unique title (<60 chars) + description (<160 chars) + og:*/twitter:* metadata; single H1 per page; semantic HTML.
- **Type safety** — strict TypeScript across every route, engine, and component; no `any` in public APIs.
- **Edge SSR** — deployed on Cloudflare Workers via TanStack Start; server functions use `createServerFn`; public webhooks live under `src/routes/api/public/*` with signature verification.
- **Zero-config data** — every dataset is deterministic and seeded so evaluators see the same numbers on every reload.

---

## Data & transparency

| Source | Used for |
|---|---|
| TN HMIS weekly aggregates | Admission baselines, weekly seasonality |
| IDSP outbreak feeds | Emergency surge model, monsoon spikes |
| TN e-Aushadhi | Medicine stock structure, buffer thresholds |
| IMD weather | Surge and accident-risk inputs |
| TN census (district) | Population weighting on the supply-chain map |

Full lineage is visible in `/dashboard/data-transparency`, `/hospital/data`, and `src/data/source-registry.ts`.

---

## Running locally

```bash
bun install
bun run dev            # Vite dev server on http://localhost:8080
```

Useful scripts:

```bash
bun run build          # production build (Cloudflare Workers target)
bun run typecheck      # strict TS
bun run lint           # eslint
```

Key folders:

```
src/
  routes/              file-based routes (dashboard.*, hospital.*, judge-*)
  components/
    layout/            GlassCard, KPICard, sidebars, topbars, LatencyMonitor
    dashboard/         charts, backtest, story mode, TN map
    landing/           hero, metrics strip, capability cards
  services/            forecast, recommendation, capacity, crisis, workforce...
  lib/                 hospital engines, acceptance/latency stores, backtest
  data/                seeded datasets + source registry
  hooks/               district filter, mobile detection
  styles.css           Tailwind v4 + theme tokens
```

---

## License

Built for the Smart Healthcare challenge. See repository for license terms.
