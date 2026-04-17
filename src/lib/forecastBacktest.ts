/**
 * Lightweight JS forecasting + backtest utilities.
 * Implements:
 *   - Seasonal-naive (weekly) baseline
 *   - Holt-Winters additive (level + trend + weekly seasonality)
 *   - MAPE, RMSE, MAE on a held-out test window
 *
 * Pure functions, deterministic, no deps.
 */
import { HISTORICAL_ADMISSIONS, type AdmissionRecord } from "@/data/historicalAdmissions";

export type ForecastMethod = "holt-winters" | "seasonal-naive";

export interface ForecastPoint {
  day: number;
  date: string;
  actual: number | null;
  predicted: number;
  isTest: boolean;
}

export interface BacktestResult {
  method: ForecastMethod;
  horizonDays: number;
  trainSize: number;
  testSize: number;
  mape: number;   // %
  rmse: number;
  mae: number;
  series: ForecastPoint[];
  passes: boolean; // mape < 10
}

const SEASON = 7;

// ---------- Seasonal-Naive ----------
function seasonalNaive(train: number[], horizon: number): number[] {
  const out: number[] = [];
  for (let h = 0; h < horizon; h++) {
    const idx = train.length - SEASON + (h % SEASON);
    out.push(train[idx]);
  }
  return out;
}

// ---------- Holt-Winters Additive ----------
function holtWintersAdditive(
  series: number[],
  horizon: number,
  alpha = 0.35,
  beta = 0.05,
  gamma = 0.55
): number[] {
  const m = SEASON;
  if (series.length < m * 2) return seasonalNaive(series, horizon);

  // Initial level = mean of first season
  let level = series.slice(0, m).reduce((a, b) => a + b, 0) / m;
  // Initial trend = avg of (s[i+m]-s[i]) / m over first season
  let trend = 0;
  for (let i = 0; i < m; i++) trend += (series[i + m] - series[i]) / m;
  trend /= m;
  // Initial seasonal indices = first season - level
  const season: number[] = series.slice(0, m).map(v => v - level);

  for (let t = m; t < series.length; t++) {
    const prevLevel = level;
    const seasonalIdx = t % m;
    const s = season[seasonalIdx];
    level = alpha * (series[t] - s) + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    season[seasonalIdx] = gamma * (series[t] - level) + (1 - gamma) * s;
  }

  const out: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const seasonalIdx = (series.length + h - 1) % m;
    out.push(level + h * trend + season[seasonalIdx]);
  }
  return out;
}

// ---------- Metrics ----------
function metrics(actual: number[], predicted: number[]) {
  let absErr = 0, sqErr = 0, pctErr = 0, n = 0;
  for (let i = 0; i < actual.length; i++) {
    const a = actual[i], p = predicted[i];
    if (a === 0) continue;
    absErr += Math.abs(a - p);
    sqErr += (a - p) ** 2;
    pctErr += Math.abs((a - p) / a);
    n++;
  }
  return {
    mae: absErr / n,
    rmse: Math.sqrt(sqErr / n),
    mape: (pctErr / n) * 100,
  };
}

// ---------- Public API ----------
export function runBacktest(
  method: ForecastMethod,
  horizonDays: number,
  records: AdmissionRecord[] = HISTORICAL_ADMISSIONS
): BacktestResult {
  const values = records.map(r => r.admissions);
  const trainSize = values.length - horizonDays;
  const train = values.slice(0, trainSize);
  const testActual = values.slice(trainSize);

  const predicted =
    method === "holt-winters"
      ? holtWintersAdditive(train, horizonDays)
      : seasonalNaive(train, horizonDays);

  const m = metrics(testActual, predicted);

  // Build display series: last 28 train days + test window
  const tailStart = Math.max(0, trainSize - 28);
  const series: ForecastPoint[] = [];
  for (let i = tailStart; i < trainSize; i++) {
    series.push({
      day: i, date: records[i].date,
      actual: values[i], predicted: values[i], isTest: false,
    });
  }
  for (let i = 0; i < horizonDays; i++) {
    series.push({
      day: trainSize + i,
      date: records[trainSize + i].date,
      actual: testActual[i],
      predicted: Math.round(predicted[i]),
      isTest: true,
    });
  }

  return {
    method,
    horizonDays,
    trainSize,
    testSize: horizonDays,
    mape: +m.mape.toFixed(2),
    rmse: +m.rmse.toFixed(2),
    mae: +m.mae.toFixed(2),
    series,
    passes: m.mape < 10,
  };
}
