---
name: AI Intelligence Layer
description: 9 AI models, forecast engine, recommendation engine, transparency center
type: feature
---

## AI Models (src/data/ai-models.ts)
- Admission Forecast (XGBoost), ICU Demand (XGBoost), Bed Occupancy (Prophet)
- Emergency Surge (XGBoost), Staff Pressure (Rule-Based), Equipment Demand (Rule-Based)
- Discharge Delay (XGBoost, experimental), Recommendation Engine (Constraint-Logic)
- Adaptive RL (placeholder)

## Services
- src/services/forecastEngine.ts — All 7 forecast functions with confidence intervals
- src/services/recommendationEngine.ts — Constraint-logic recommendations with explainability

## Routes (Part 3)
- /dashboard/forecast — Forecast Intelligence Dashboard
- /dashboard/ai-transparency — AI Transparency Lab (model cards)
- /dashboard/recommendations — Recommendation Center
- /dashboard/district-predictions — District Prediction View

## Rules
- All outputs show: model type, confidence, assumptions, input datasets, explainability
- No black-box AI — every recommendation traceable to threshold breach
- Synthetic data labeled: "Modeled using public indicators + logical assumptions"
