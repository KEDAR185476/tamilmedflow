import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Calendar, BarChart3, Activity, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, RefreshCw } from "lucide-react";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";
import { computeEfficiencyScore } from "@/lib/hospitalAIEngine";
import { loadHistory, seedDemoHistory, getTrend, computeBenchmarks, type DailySnapshot } from "@/lib/hospitalHistoryEngine";

export const Route = createFileRoute("/hospital/history")({ component: HistoryPage });

function HistoryPage() {
  const session = getHospitalAuth();
  const tenantId = session?.tenant?.id || "demo";
  const state = loadHospitalData(tenantId);
  const eff = computeEfficiencyScore(state);

  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [range, setRange] = useState<string>("30");

  useEffect(() => {
    let h = loadHistory(tenantId);
    if (h.length < 10) h = seedDemoHistory(tenantId, state);
    setSnapshots(h);
  }, [tenantId]);

  const days = Number(range);
  const benchmarks = useMemo(() => computeBenchmarks(snapshots), [snapshots]);
  const occTrend = useMemo(() => getTrend(snapshots, "occupancy", days), [snapshots, days]);
  const waitTrend = useMemo(() => getTrend(snapshots, "avgWaitTime", days), [snapshots, days]);
  const admTrend = useMemo(() => getTrend(snapshots, "admissions", days), [snapshots, days]);
  const effTrend = useMemo(() => getTrend(snapshots, "efficiencyScore", days), [snapshots, days]);
  const icuTrend = useMemo(() => getTrend(snapshots, "icuUtilization", days), [snapshots, days]);
  const staffTrend = useMemo(() => getTrend(snapshots, "staffOnDuty", days), [snapshots, days]);

  const handleRefresh = () => {
    const h = seedDemoHistory(tenantId, state);
    setSnapshots(h);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historical Trends</h1>
          <p className="text-muted-foreground text-sm">{snapshots.length} days of operational data stored</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-32 bg-card border-border/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
        </div>
      </div>

      {/* Benchmarks */}
      {benchmarks && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BenchmarkCard label="Occupancy Δ" value={benchmarks.occupancyChange} unit="%" invertGood />
          <BenchmarkCard label="Wait Time Δ" value={benchmarks.waitTimeChange} unit=" min" invertGood />
          <BenchmarkCard label="Efficiency Δ" value={benchmarks.efficiencyChange} unit="%" />
          <BenchmarkCard label="Alerts Δ" value={benchmarks.alertChange} unit="" invertGood />
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="occupancy">
        <TabsList className="bg-card/50">
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="wait">Wait Time</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="icu">ICU Load</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>
        <TabsContent value="occupancy"><MiniChart data={occTrend} color="var(--chart-1)" label="Occupancy %" /></TabsContent>
        <TabsContent value="wait"><MiniChart data={waitTrend} color="var(--chart-3)" label="Avg Wait (min)" /></TabsContent>
        <TabsContent value="admissions"><MiniChart data={admTrend} color="var(--chart-2)" label="Admissions" /></TabsContent>
        <TabsContent value="icu"><MiniChart data={icuTrend} color="var(--chart-5)" label="ICU Utilization %" /></TabsContent>
        <TabsContent value="staff"><MiniChart data={staffTrend} color="var(--chart-4)" label="Staff On Duty" /></TabsContent>
        <TabsContent value="efficiency"><MiniChart data={effTrend} color="var(--chart-2)" label="Efficiency Score" /></TabsContent>
      </Tabs>

      {/* Raw Data Table */}
      <Card className="bg-card/60 backdrop-blur border-border/30">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" /> Daily Snapshots</CardTitle></CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Occ%</TableHead>
                  <TableHead>ICU%</TableHead>
                  <TableHead>Adm</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Eff</TableHead>
                  <TableHead>Alerts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.slice(0, days).map(s => (
                  <TableRow key={s.date}>
                    <TableCell className="font-mono text-xs">{s.date}</TableCell>
                    <TableCell><Badge variant={s.occupancy > 85 ? "destructive" : "secondary"} className="text-xs">{s.occupancy}%</Badge></TableCell>
                    <TableCell>{s.icuUtilization}%</TableCell>
                    <TableCell>{s.admissions}</TableCell>
                    <TableCell>{s.avgWaitTime}m</TableCell>
                    <TableCell>{s.staffOnDuty}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{s.efficiencyScore}</Badge></TableCell>
                    <TableCell>{s.alertCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BenchmarkCard({ label, value, unit, invertGood }: { label: string; value: number; unit: string; invertGood?: boolean }) {
  const good = invertGood ? value < 0 : value > 0;
  const neutral = value === 0;
  return (
    <Card className="bg-card/60 backdrop-blur border-border/30">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <div className="flex items-center gap-2">
          {neutral ? <Minus className="h-4 w-4 text-muted-foreground" /> : good ? <ArrowUpRight className="h-4 w-4 text-emerald-400" /> : <ArrowDownRight className="h-4 w-4 text-red-400" />}
          <span className={`text-lg font-bold ${neutral ? "text-muted-foreground" : good ? "text-emerald-400" : "text-red-400"}`}>
            {value > 0 ? "+" : ""}{value}{unit}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">vs previous period</p>
      </CardContent>
    </Card>
  );
}

function MiniChart({ data, color, label }: { data: { label: string; value: number }[]; color: string; label: string }) {
  if (!data.length) return <p className="text-muted-foreground text-sm p-4">No data for this range</p>;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  return (
    <Card className="bg-card/60 backdrop-blur border-border/30">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-3">{label}</p>
        <div className="flex items-end gap-[2px] h-32">
          {data.map((d, i) => {
            const h = ((d.value - min) / range) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                <div className="absolute -top-6 hidden group-hover:block bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                  {d.label}: {d.value}
                </div>
                <div
                  className="w-full rounded-t-sm transition-all duration-300 opacity-80 hover:opacity-100"
                  style={{ height: `${Math.max(4, h)}%`, backgroundColor: color }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
          <span>{data[0]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
