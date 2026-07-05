import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Map as MapIcon, Pill, Truck, ArrowLeft, AlertTriangle,
  Package, TrendingDown, Activity, Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { TN_DISTRICTS } from "@/data/districts";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/medicine-supply")({
  component: MedicineSupplyChain,
});

// Medicines tracked at the district network level
const MEDICINES = [
  "Paracetamol 500mg",
  "ORS Sachets",
  "Insulin (Regular)",
  "Amoxicillin 250mg",
  "COVID-19 Vaccine",
  "Anti-Rabies Vaccine",
  "Iron & Folic Acid",
] as const;
type Medicine = typeof MEDICINES[number];

// Deterministic pseudo-random from district id + medicine for stable demo values
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 0xffffffff;
}

interface DistrictStock {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  zone: string;
  stockPct: number;         // 0-100 % of buffer
  daysLeft: number;         // days of supply
  facilities: number;       // PHC+CHC+DH count
  dailyUsage: number;
}

function computeStock(medicine: Medicine, outbreak: boolean): DistrictStock[] {
  return TN_DISTRICTS.map(d => {
    const r = hash(d.id + medicine);
    let base = 30 + Math.round(r * 65); // 30-95%
    let usage = Math.round((d.population / 1_000_000) * (medicine === "ORS Sachets" ? 90 : 55));
    if (outbreak && (medicine === "Paracetamol 500mg" || medicine === "ORS Sachets")) {
      base = Math.max(5, base - 40);
      usage = Math.round(usage * 2.4);
    }
    const days = Math.max(1, Math.round((base / 100) * 14));
    return {
      id: d.id, name: d.name, lat: d.lat, lng: d.lng,
      population: d.population, zone: d.zone,
      stockPct: base, daysLeft: days,
      facilities: Math.max(3, Math.round(d.population / 250_000)),
      dailyUsage: usage,
    };
  });
}

function statusOf(pct: number) {
  if (pct < 25) return { label: "Critical", color: "hsl(0 75% 55%)", tw: "text-destructive bg-destructive/10" };
  if (pct < 50) return { label: "Low", color: "hsl(35 90% 55%)", tw: "text-chart-4 bg-chart-4/10" };
  if (pct < 75) return { label: "Moderate", color: "hsl(190 70% 55%)", tw: "text-primary bg-primary/10" };
  return { label: "Healthy", color: "hsl(160 65% 45%)", tw: "text-chart-2 bg-chart-2/10" };
}

// SVG viewbox projection of TN lat/lng
const BOUNDS = { minLat: 8.0, maxLat: 13.6, minLng: 76.5, maxLng: 80.5 };
const W = 500, H = 620;
function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y };
}

interface Transfer { from: string; to: string; item: string; qty: string; }

function MedicineSupplyChain() {
  const [medicine, setMedicine] = useState<Medicine>("Paracetamol 500mg");
  const [outbreak, setOutbreak] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const stocks = useMemo(() => computeStock(medicine, outbreak), [medicine, outbreak]);

  // Compute AI-suggested transfers: surplus (>75%) → critical (<30%), nearest pair per critical
  const transfers = useMemo<Transfer[]>(() => {
    const critical = stocks.filter(s => s.stockPct < 30);
    const surplus = stocks.filter(s => s.stockPct > 75);
    return critical.slice(0, 4).map(c => {
      let best = surplus[0]; let bestD = Infinity;
      for (const s of surplus) {
        const d = Math.hypot(s.lat - c.lat, s.lng - c.lng);
        if (d < bestD) { bestD = d; best = s; }
      }
      if (!best) return null;
      return {
        from: best.name, to: c.name, item: medicine,
        qty: `${Math.round(c.dailyUsage * 5)} units`,
      };
    }).filter(Boolean) as Transfer[];
  }, [stocks, medicine]);

  const summary = useMemo(() => {
    const critical = stocks.filter(s => s.stockPct < 25).length;
    const low = stocks.filter(s => s.stockPct >= 25 && s.stockPct < 50).length;
    const healthy = stocks.filter(s => s.stockPct >= 75).length;
    const avg = Math.round(stocks.reduce((a, s) => a + s.stockPct, 0) / stocks.length);
    return { critical, low, healthy, avg };
  }, [stocks]);

  const selectedStock = selected ? stocks.find(s => s.id === selected) : null;

  // Build transfer arcs from names → coords for animation overlay
  const transferArcs = transfers.map(t => {
    const from = stocks.find(s => s.name === t.from);
    const to = stocks.find(s => s.name === t.to);
    if (!from || !to) return null;
    const a = project(from.lat, from.lng);
    const b = project(to.lat, to.lng);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.25;
    return { a, b, mx, my, key: `${t.from}-${t.to}` };
  }).filter(Boolean) as { a: {x:number;y:number}; b:{x:number;y:number}; mx:number; my:number; key:string }[];

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
            <Link to="/hospital/medicine" className="flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Medicine Intelligence
            </Link>
            <span>/</span>
            <span className="text-foreground">Supply Chain Map</span>
          </div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-chart-2" /> Medicine Supply Chain — Tamil Nadu
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            District-level stock intelligence across {TN_DISTRICTS.length} districts · AI-driven redistribution
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={medicine}
            onChange={e => setMedicine(e.target.value as Medicine)}
            className="text-xs bg-muted/20 border border-border/50 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-chart-2/60"
          >
            {MEDICINES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button
            onClick={() => { setOutbreak(v => !v); toast(outbreak ? "Normal demand restored" : "Dengue outbreak simulated"); }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${outbreak ? "bg-destructive/15 border-destructive/40 text-destructive" : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"}`}
          >
            {outbreak ? "● Outbreak Mode" : "Simulate Outbreak"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Network Avg Stock", value: `${summary.avg}%`, color: summary.avg > 65 ? "text-chart-2" : summary.avg > 45 ? "text-chart-4" : "text-destructive", icon: Package },
          { label: "Critical Districts", value: summary.critical, color: summary.critical > 0 ? "text-destructive" : "text-chart-2", icon: AlertTriangle },
          { label: "Low Stock Districts", value: summary.low, color: summary.low > 2 ? "text-chart-4" : "text-chart-2", icon: TrendingDown },
          { label: "Redistribution Suggestions", value: transfers.length, color: "text-primary", icon: Truck },
        ].map(k => (
          <GlassCard key={k.label} className="p-4">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
              <k.icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Map + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-chart-2" /> District Stock Map · {medicine}
            </h3>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              {[
                { c: "hsl(160 65% 45%)", l: "Healthy" },
                { c: "hsl(190 70% 55%)", l: "Moderate" },
                { c: "hsl(35 90% 55%)", l: "Low" },
                { c: "hsl(0 75% 55%)", l: "Critical" },
              ].map(x => (
                <span key={x.l} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: x.c }} /> {x.l}
                </span>
              ))}
            </div>
          </div>

          <div className="relative w-full rounded-lg bg-gradient-to-br from-muted/10 to-transparent border border-border/30 overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 z" fill="hsl(190 70% 55%)" />
                </marker>
                <radialGradient id="glow">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* TN outline (approximate) */}
              <path
                d="M 180 40 L 230 30 L 270 55 L 310 90 L 355 130 L 395 180 L 420 240 L 435 310 L 425 380 L 400 450 L 360 510 L 310 555 L 260 585 L 210 595 L 165 580 L 130 545 L 105 490 L 90 425 L 85 360 L 95 290 L 115 220 L 140 155 L 165 95 Z"
                fill="hsl(220 30% 12%)"
                stroke="hsl(190 40% 30%)"
                strokeWidth="1"
                opacity="0.5"
              />

              {/* Transfer arcs */}
              {transferArcs.map(arc => (
                <g key={arc.key}>
                  <path
                    d={`M ${arc.a.x} ${arc.a.y} Q ${arc.mx} ${arc.my} ${arc.b.x} ${arc.b.y}`}
                    fill="none"
                    stroke="hsl(190 70% 55%)"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                    opacity="0.7"
                    markerEnd="url(#arrow)"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.2s" repeatCount="indefinite" />
                  </path>
                </g>
              ))}

              {/* District bubbles */}
              {stocks.map(s => {
                const { x, y } = project(s.lat, s.lng);
                const st = statusOf(s.stockPct);
                const r = 8 + (s.population / 1_000_000) * 1.2;
                const isSel = selected === s.id;
                return (
                  <g key={s.id} onClick={() => setSelected(s.id)} style={{ cursor: "pointer" }}>
                    {s.stockPct < 25 && (
                      <circle cx={x} cy={y} r={r + 6} fill={st.color} opacity="0.25">
                        <animate attributeName="r" values={`${r+4};${r+10};${r+4}`} dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.35;0.05;0.35" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={x} cy={y} r={r}
                      fill={st.color}
                      fillOpacity={isSel ? 0.9 : 0.65}
                      stroke={isSel ? "white" : st.color}
                      strokeWidth={isSel ? 2 : 1}
                    />
                    <text
                      x={x} y={y - r - 4}
                      textAnchor="middle"
                      className="fill-foreground"
                      style={{ fontSize: "9px", fontWeight: 600 }}
                    >
                      {s.name}
                    </text>
                    <text
                      x={x} y={y + 3}
                      textAnchor="middle"
                      fill="white"
                      style={{ fontSize: "8px", fontWeight: 700 }}
                    >
                      {s.stockPct}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Bubble size ∝ population · Click a district for facility-level details · Animated arcs show AI-recommended transfers
          </p>
        </GlassCard>

        {/* Side panel */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-2" />
              {selectedStock ? selectedStock.name : "District Details"}
            </h3>
            {selectedStock ? (
              <div className="space-y-3">
                {(() => {
                  const st = statusOf(selectedStock.stockPct);
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Stock Status</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${st.tw}`}>{st.label}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Buffer Level</span>
                          <span className="text-foreground font-semibold">{selectedStock.stockPct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                          <div className="h-full transition-all" style={{ width: `${selectedStock.stockPct}%`, background: st.color }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-muted/15 border border-border/30">
                          <div className="text-[10px] text-muted-foreground">Days Left</div>
                          <div className="text-foreground font-semibold">{selectedStock.daysLeft}d</div>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/15 border border-border/30">
                          <div className="text-[10px] text-muted-foreground">Daily Usage</div>
                          <div className="text-foreground font-semibold">{selectedStock.dailyUsage}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/15 border border-border/30">
                          <div className="text-[10px] text-muted-foreground">Facilities</div>
                          <div className="text-foreground font-semibold">{selectedStock.facilities}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/15 border border-border/30">
                          <div className="text-[10px] text-muted-foreground">Population</div>
                          <div className="text-foreground font-semibold">{(selectedStock.population / 1_000_000).toFixed(1)}M</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Click any district bubble on the map to inspect PHC/CHC facility count, buffer level, days of supply and daily consumption.</p>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-chart-2" /> AI Redistribution Plan
            </h3>
            {transfers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Network is balanced — no critical shortages detected.</p>
            ) : (
              <div className="space-y-2">
                {transfers.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-chart-2/20 bg-chart-2/5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                      <span>{t.from}</span>
                      <Truck className="h-3 w-3 text-chart-2" />
                      <span>{t.to}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t.item} · {t.qty}</div>
                    <div className="flex gap-1.5 mt-1.5">
                      <button
                        onClick={() => toast.success(`Transfer approved: ${t.from} → ${t.to}`)}
                        className="text-[10px] px-2 py-0.5 rounded bg-chart-2/20 text-chart-2 hover:bg-chart-2/30"
                      >Approve</button>
                      <button
                        onClick={() => toast("Dismissed")}
                        className="text-[10px] px-2 py-0.5 rounded bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      >Dismiss</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* District table */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Pill className="h-4 w-4 text-chart-2" /> District Stock Ledger · {medicine}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/40">
                <th className="py-2 font-medium">District</th>
                <th className="py-2 font-medium">Zone</th>
                <th className="py-2 font-medium text-right">Facilities</th>
                <th className="py-2 font-medium text-right">Daily Usage</th>
                <th className="py-2 font-medium text-right">Days Left</th>
                <th className="py-2 font-medium">Buffer</th>
                <th className="py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {stocks.sort((a, b) => a.stockPct - b.stockPct).map(s => {
                const st = statusOf(s.stockPct);
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={`border-b border-border/20 hover:bg-muted/10 cursor-pointer ${selected === s.id ? "bg-muted/15" : ""}`}
                  >
                    <td className="py-2 text-foreground font-medium">{s.name}</td>
                    <td className="py-2 text-muted-foreground capitalize">{s.zone}</td>
                    <td className="py-2 text-right text-foreground">{s.facilities}</td>
                    <td className="py-2 text-right text-foreground">{s.dailyUsage}</td>
                    <td className="py-2 text-right text-foreground">{s.daysLeft}d</td>
                    <td className="py-2 w-40">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full transition-all" style={{ width: `${s.stockPct}%`, background: st.color }} />
                        </div>
                        <span className="text-foreground text-[10px] tabular-nums w-8 text-right">{s.stockPct}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${st.tw}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-2">
        <Activity className="h-3 w-3 text-chart-2" />
        Live network map · {TN_DISTRICTS.length} districts · TN eHospital + PHC/CHC feeds · Redistribution engine v2.1
      </div>
    </div>
  );
}
