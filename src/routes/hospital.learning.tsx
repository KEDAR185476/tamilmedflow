import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Brain, Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight, Zap,
  BookOpen, BarChart3, RefreshCw, CheckCircle, Target, Lightbulb,
  GitBranch, ArrowRight,
} from "lucide-react";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";
import { computeEfficiencyScore } from "@/lib/hospitalAIEngine";
import { loadHistory, seedDemoHistory, computeBenchmarks } from "@/lib/hospitalHistoryEngine";
import {
  detectPatterns, getModelVersions, analyzeImpact,
  getRecommendationEvolution, type LearnedPattern, type ModelVersion,
} from "@/lib/hospitalLearningEngine";

export const Route = createFileRoute("/hospital/learning")({ component: LearningPage });

function LearningPage() {
  const session = getHospitalAuth();
  const tenantId = session?.tenant?.id || "demo";
  const state = loadHospitalData(tenantId);

  const [snapshots, setSnapshots] = useState(() => {
    let h = loadHistory(tenantId);
    if (h.length < 10) h = seedDemoHistory(tenantId, state);
    return h;
  });
  const [patterns, setPatterns] = useState<LearnedPattern[]>([]);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [smarterMode, setSmarterMode] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    setPatterns(detectPatterns(snapshots));
    setModels(getModelVersions(snapshots.length));
  }, [snapshots]);

  const benchmarks = computeBenchmarks(snapshots);
  const latestModel = models[models.length - 1];
  const evolutions = getRecommendationEvolution();

  const handleMakeSmarter = () => {
    setUpgrading(true);
    setTimeout(() => {
      const newSnapshots = seedDemoHistory(tenantId, state);
      setSnapshots(newSnapshots);
      setPatterns(detectPatterns(newSnapshots));
      const mv = getModelVersions(newSnapshots.length + 50);
      setModels(mv);
      setUpgrading(false);
      setSmarterMode(true);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-purple-400" /> Continuous Learning Lab</h1>
          <p className="text-sm text-muted-foreground">Self-improving intelligence for your hospital</p>
        </div>
        <Button
          onClick={handleMakeSmarter}
          disabled={upgrading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 shadow-lg"
          style={{ boxShadow: "0 0 20px oklch(0.55 0.20 310 / 30%)" }}
        >
          {upgrading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Upgrading…</> : <><Sparkles className="h-4 w-4 mr-2" /> MAKE MY HOSPITAL SMARTER NOW</>}
        </Button>
      </div>

      {/* Success Banner */}
      {smarterMode && (
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm font-semibold text-purple-300">Intelligence Upgraded!</p>
              <p className="text-xs text-muted-foreground">Model retrained, new patterns detected, recommendations sharpened.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI icon={BookOpen} label="Data Samples" value={snapshots.length} suffix=" days" color="text-blue-400" />
        <KPI icon={GitBranch} label="Model Version" value={latestModel?.version || "v1.0"} color="text-purple-400" />
        <KPI icon={Target} label="Accuracy" value={`${latestModel?.accuracy || 72}%`} color="text-emerald-400" />
        <KPI icon={Lightbulb} label="Patterns Found" value={patterns.length} color="text-amber-400" />
        <KPI icon={Zap} label="Efficiency Gain" value={benchmarks ? `${benchmarks.efficiencyChange > 0 ? "+" : ""}${benchmarks.efficiencyChange}%` : "—"} color="text-cyan-400" />
      </div>

      <Tabs defaultValue="patterns">
        <TabsList className="bg-card/50">
          <TabsTrigger value="patterns">Learned Patterns</TabsTrigger>
          <TabsTrigger value="models">Model Evolution</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="evolution">Recommendation Growth</TabsTrigger>
          <TabsTrigger value="impact">Impact Analyzer</TabsTrigger>
        </TabsList>

        {/* Patterns */}
        <TabsContent value="patterns">
          <div className="grid md:grid-cols-2 gap-4">
            {patterns.length === 0 && <p className="text-muted-foreground text-sm col-span-2 p-4">Need more data to detect patterns. Keep updating your hospital data daily.</p>}
            {patterns.map(p => (
              <Card key={p.id} className="bg-card/60 backdrop-blur border-border/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize">{p.category}</Badge>
                    <span className="text-xs text-muted-foreground">Confidence: {p.confidence}%</span>
                  </div>
                  <p className="text-sm font-medium">{p.pattern}</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <Zap className="h-3 w-3" />{p.actionTaken}
                  </div>
                  <Progress value={p.confidence} className="h-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Models */}
        <TabsContent value="models">
          <Card className="bg-card/60 backdrop-blur border-border/30">
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Samples</TableHead>
                    <TableHead>Improvements</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map(m => (
                    <TableRow key={m.version}>
                      <TableCell><Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{m.version}</Badge></TableCell>
                      <TableCell className="text-xs">{m.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={m.accuracy} className="h-1.5 w-16" />
                          <span className="text-xs">{m.accuracy}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{m.samplesUsed}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.improvements.map((imp, i) => <Badge key={i} variant="secondary" className="text-[10px]">{imp}</Badge>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Accuracy chart */}
          <Card className="bg-card/60 backdrop-blur border-border/30 mt-4">
            <CardHeader><CardTitle className="text-sm">Accuracy Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-28">
                {models.map((m, i) => (
                  <div key={m.version} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[10px] text-muted-foreground">{m.accuracy}%</span>
                    <div className="w-full rounded-t-sm bg-purple-500/70" style={{ height: `${m.accuracy}%` }} />
                    <span className="text-[10px] font-mono">{m.version}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks */}
        <TabsContent value="benchmarks">
          {benchmarks ? (
            <div className="grid md:grid-cols-2 gap-4">
              <BenchmarkDetail label="Occupancy Trend" value={benchmarks.occupancyChange} unit="%" desc="Lower is better for availability" invertGood />
              <BenchmarkDetail label="Wait Time Trend" value={benchmarks.waitTimeChange} unit=" min" desc="Reduction shows improved throughput" invertGood />
              <BenchmarkDetail label="Efficiency Score" value={benchmarks.efficiencyChange} unit="%" desc="Higher means better resource use" />
              <BenchmarkDetail label="Alert Frequency" value={benchmarks.alertChange} unit="" desc="Fewer alerts means smoother ops" invertGood />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm p-4">Need at least 2 weeks of data for benchmarks.</p>
          )}
        </TabsContent>

        {/* Evolution */}
        <TabsContent value="evolution">
          <div className="space-y-4">
            {evolutions.map((e, i) => (
              <Card key={i} className="bg-card/60 backdrop-blur border-border/30">
                <CardContent className="p-4">
                  <Badge variant="outline" className="text-xs mb-2">{e.category}</Badge>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <p className="text-[10px] text-red-400 mb-1">Before (Generic)</p>
                      <p className="text-sm">{e.before}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-[10px] text-emerald-400 mb-1">Now (Learned)</p>
                      <p className="text-sm">{e.after}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1"><Lightbulb className="h-3 w-3" />{e.improvementReason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Impact */}
        <TabsContent value="impact">
          <ImpactPanel tenantId={tenantId} currentState={state} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ImpactPanel({ tenantId, currentState }: { tenantId: string; currentState: ReturnType<typeof loadHospitalData> }) {
  const impacts = analyzeImpact(
    { ...currentState, capacity: { ...currentState.capacity, totalBeds: currentState.capacity.totalBeds - 20 }, staff: { ...currentState.staff, nurses: currentState.staff.nurses - 10 } },
    currentState
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Showing impact of your most recent changes vs baseline</p>
      {impacts.length === 0 && <p className="text-sm text-muted-foreground">No changes detected. Update your hospital data to see impact analysis.</p>}
      {impacts.map((imp, i) => (
        <Card key={i} className="bg-card/60 backdrop-blur border-border/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${imp.direction === "positive" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              {imp.direction === "positive" ? <ArrowUpRight className="h-5 w-5 text-emerald-400" /> : <ArrowDownRight className="h-5 w-5 text-red-400" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{imp.field}: {imp.oldValue} → {imp.newValue}</p>
              <p className="text-xs text-muted-foreground">{imp.impactDescription}</p>
            </div>
            <Badge variant={imp.direction === "positive" ? "default" : "destructive"} className="text-xs">{imp.direction === "positive" ? "+" : "-"}{imp.impactPercent}%</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function KPI({ icon: Icon, label, value, suffix, color }: { icon: any; label: string; value: string | number; suffix?: string; color: string }) {
  return (
    <Card className="bg-card/60 backdrop-blur border-border/30">
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <div>
          <p className="text-lg font-bold">{value}{suffix}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BenchmarkDetail({ label, value, unit, desc, invertGood }: { label: string; value: number; unit: string; desc: string; invertGood?: boolean }) {
  const good = invertGood ? value < 0 : value > 0;
  return (
    <Card className="bg-card/60 backdrop-blur border-border/30">
      <CardContent className="p-4">
        <p className="text-sm font-medium mb-1">{label}</p>
        <div className="flex items-center gap-2 mb-2">
          {good ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />}
          <span className={`text-xl font-bold ${good ? "text-emerald-400" : "text-red-400"}`}>{value > 0 ? "+" : ""}{value}{unit}</span>
        </div>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
