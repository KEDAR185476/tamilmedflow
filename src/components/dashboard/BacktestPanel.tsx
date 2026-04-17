import { useMemo, useState } from "react";
import { GlassCard } from "@/components/layout/GlassCard";
import { runBacktest, type ForecastMethod } from "@/lib/forecastBacktest";
import { DATASET_META, HISTORICAL_ADMISSIONS } from "@/data/historicalAdmissions";
import {
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceArea,
} from "recharts";
import { Activity, CheckCircle2, XCircle, Database, Target, TrendingUp } from "lucide-react";

const HORIZONS = [
  { label: "24-hour (1 day)", value: 1 },
  { label: "7-day", value: 7 },
  { label: "14-day", value: 14 },
];

const METHODS: { label: string; value: ForecastMethod; desc: string }[] = [
  { label: "Holt-Winters", value: "holt-winters", desc: "Triple exponential smoothing (level + trend + weekly season)" },
  { label: "Seasonal-Naive", value: "seasonal-naive", desc: "Repeat last week — baseline benchmark" },
];

export function BacktestPanel() {
  const [method, setMethod] = useState<ForecastMethod>("holt-winters");
  const [horizon, setHorizon] = useState(7);

  const result = useMemo(() => runBacktest(method, horizon), [method, horizon]);

  const chartData = result.series.map(p => ({
    date: p.date.slice(5),
    actual: p.actual,
    predicted: p.isTest ? p.predicted : null,
    fit: !p.isTest ? p.predicted : null,
  }));

  const testStartLabel = result.series.find(p => p.isTest)?.date.slice(5);
  const testEndLabel = result.series[result.series.length - 1]?.date.slice(5);

  return (
    <GlassCard className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Model Accuracy & Backtest
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Real MAPE/RMSE measured on a held-out test window — defends the &lt;10% MAPE target.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          result.passes ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
        }`}>
          {result.passes ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          MAPE {result.mape}% — Target &lt; 10% {result.passes ? "PASS" : "FAIL"}
        </div>
      </div>

      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Forecast Method</label>
          <div className="flex gap-2 mt-1">
            {METHODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={`px-3 py-1.5 rounded-md text-xs border transition ${
                  method === m.value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {METHODS.find(m => m.value === method)?.desc}
          </p>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Test Horizon</label>
          <div className="flex gap-2 mt-1">
            {HORIZONS.map(h => (
              <button
                key={h.value}
                onClick={() => setHorizon(h.value)}
                className={`px-3 py-1.5 rounded-md text-xs border transition ${
                  horizon === h.value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Metric icon={<Target className="h-3.5 w-3.5" />} label="MAPE" value={`${result.mape}%`}
          good={result.passes} hint="Mean Abs. % Error" />
        <Metric icon={<TrendingUp className="h-3.5 w-3.5" />} label="RMSE" value={result.rmse.toFixed(1)}
          hint="Root Mean Sq. Error" />
        <Metric icon={<TrendingUp className="h-3.5 w-3.5" />} label="MAE" value={result.mae.toFixed(1)}
          hint="Mean Abs. Error" />
        <Metric icon={<Database className="h-3.5 w-3.5" />} label="Train / Test"
          value={`${result.trainSize} / ${result.testSize}`} hint="Days" />
      </div>

      {/* Chart */}
      <div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
            <XAxis dataKey="date" tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 10 }} />
            <YAxis tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.17 0.02 260)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: 8, fontSize: 12,
              }}
              labelStyle={{ color: "oklch(0.95 0.01 250)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {testStartLabel && testEndLabel && (
              <ReferenceArea x1={testStartLabel} x2={testEndLabel}
                fill="oklch(0.75 0.15 190)" fillOpacity={0.06} />
            )}
            <Line type="monotone" dataKey="actual" name="Actual"
              stroke="oklch(0.85 0.02 250)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fit" name="Fit (train)"
              stroke="oklch(0.55 0.05 250)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
            <Line type="monotone" dataKey="predicted" name="Forecast (test)"
              stroke="oklch(0.75 0.15 190)" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-muted-foreground text-center -mt-1">
          Shaded region = held-out test window (model never saw these days)
        </p>
      </div>

      {/* Dataset footer */}
      <div className="border-t border-border/40 pt-3 grid sm:grid-cols-2 gap-2 text-[10px] text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground/80">Dataset:</span> {DATASET_META.name}
        </div>
        <div>
          <span className="font-semibold text-foreground/80">Range:</span>{" "}
          {DATASET_META.startDate} → {DATASET_META.endDate} ({DATASET_META.rows} days)
        </div>
        <div>
          <span className="font-semibold text-foreground/80">Source:</span> {DATASET_META.source}
        </div>
        <div>
          <span className="font-semibold text-foreground/80">Mean admissions/day:</span>{" "}
          {Math.round(HISTORICAL_ADMISSIONS.reduce((a, b) => a + b.admissions, 0) / HISTORICAL_ADMISSIONS.length)}
        </div>
      </div>
    </GlassCard>
  );
}

function Metric({ icon, label, value, hint, good }: {
  icon: React.ReactNode; label: string; value: string; hint?: string; good?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-2.5 ${
      good === true ? "border-success/40 bg-success/5"
      : good === false ? "border-destructive/40 bg-destructive/5"
      : "border-border/50 bg-background/30"
    }`}>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="text-lg font-bold text-foreground mt-0.5">{value}</div>
      {hint && <div className="text-[9px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
