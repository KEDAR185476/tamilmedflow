import { useState, useEffect, useCallback } from "react";
import { X, Play, Pause, SkipForward, ChevronRight, Zap, CheckCircle } from "lucide-react";

interface DemoScene {
  id: number;
  title: string;
  description: string;
  metric?: { label: string; before: string; after: string };
  status: "pending" | "active" | "complete";
}

const SCENES: Omit<DemoScene, "status">[] = [
  { id: 1, title: "Network Under Pressure", description: "Tamil Nadu hospital network: 1,264 facilities across 38 districts reporting high occupancy.", metric: { label: "Network Load", before: "Normal", after: "Elevated" } },
  { id: 2, title: "Chennai Occupancy Spike", description: "Chennai district occupancy rises to 94%. ICU utilization crosses critical threshold.", metric: { label: "Occupancy", before: "78%", after: "94%" } },
  { id: 3, title: "Accident Surge Detected", description: "AI detects accident surge on Chennai-Madurai corridor. 12 incoming trauma cases predicted.", metric: { label: "Incoming Cases", before: "0", after: "12" } },
  { id: 4, title: "AI Predicts Demand", description: "Forecast engine projects 18 additional admissions in next 6 hours. ICU demand +40%.", metric: { label: "Predicted Admissions", before: "6/hr", after: "18/6hr" } },
  { id: 5, title: "Beds Auto-Reserved", description: "System reserves 10 trauma beds and 4 ICU beds. Elective admissions paused temporarily.", metric: { label: "Beds Reserved", before: "0", after: "14" } },
  { id: 6, title: "Staff Rebalanced", description: "2 nurses redeployed to ER. Reserve trauma surgeon activated. Burnout risk mitigated.", metric: { label: "ER Staff", before: "4", after: "7" } },
  { id: 7, title: "ICU Load Redistributed", description: "3 stable ICU patients transferred to step-down. Ventilator allocation optimized.", metric: { label: "ICU Available", before: "2", after: "6" } },
  { id: 8, title: "Wait Time Drops", description: "Average ER wait time reduced from 45 to 18 minutes. Patient flow optimized.", metric: { label: "Wait Time", before: "45 min", after: "18 min" } },
  { id: 9, title: "System Stabilized", description: "All KPIs green. Network balanced. Emergency readiness restored. Lives protected.", metric: { label: "System Status", before: "Critical", after: "Optimal" } },
];

export function DemoStoryMode({ onClose }: { onClose: () => void }) {
  const [scenes, setScenes] = useState<DemoScene[]>(
    SCENES.map(s => ({ ...s, status: "pending" as const }))
  );
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  const advanceScene = useCallback(() => {
    if (currentScene >= SCENES.length - 1) {
      setScenes(prev => prev.map(s => ({ ...s, status: "complete" })));
      setShowSummary(true);
      setIsPlaying(false);
      return;
    }
    setScenes(prev => prev.map((s, i) =>
      i === currentScene ? { ...s, status: "complete" } :
      i === currentScene + 1 ? { ...s, status: "active" } : s
    ));
    setCurrentScene(prev => prev + 1);
  }, [currentScene]);

  useEffect(() => {
    if (!isPlaying || showSummary) return;
    // Mark first scene as active on start
    if (currentScene === 0 && scenes[0].status === "pending") {
      setScenes(prev => prev.map((s, i) => i === 0 ? { ...s, status: "active" } : s));
    }
    const timer = setTimeout(advanceScene, 3500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentScene, showSummary, advanceScene, scenes]);

  const progress = ((currentScene + (showSummary ? 1 : 0)) / SCENES.length) * 100;
  const active = scenes[currentScene];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">LIVE DEMO</span>
          <span className="text-xs text-muted-foreground">Scene {currentScene + 1} of {SCENES.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="glass rounded-lg p-2 text-foreground hover:text-primary transition-colors">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={advanceScene} className="glass rounded-lg p-2 text-foreground hover:text-primary transition-colors" disabled={showSummary}>
            <SkipForward className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="glass rounded-lg p-2 text-foreground hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {showSummary ? (
          <div className="max-w-2xl w-full text-center animate-slide-up">
            <div className="h-16 w-16 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4">System Optimized Successfully</h2>
            <p className="text-muted-foreground mb-8">MedFlow Nexus resolved the crisis in under 3 minutes.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Wait Time", value: "-60%", color: "text-success" },
                { label: "Beds Freed", value: "+14", color: "text-primary" },
                { label: "Staff Balanced", value: "✓", color: "text-success" },
                { label: "ICU Stabilized", value: "✓", color: "text-success" },
              ].map(m => (
                <div key={m.label} className="glass rounded-xl p-4">
                  <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:glow-lg transition-all">
              Explore Platform <ChevronRight className="h-4 w-4 inline ml-1" />
            </button>
          </div>
        ) : active ? (
          <div className="max-w-xl w-full text-center" key={active.id}>
            <div className="animate-slide-up">
              <div className="glass rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-6 inline-block">
                Scene {active.id} of {SCENES.length}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">{active.title}</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{active.description}</p>
              {active.metric && (
                <div className="glass rounded-2xl p-6 inline-flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Before</p>
                    <p className="text-xl font-bold text-destructive">{active.metric.before}</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-primary" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">After</p>
                    <p className="text-xl font-bold text-success">{active.metric.after}</p>
                  </div>
                  <div className="text-left border-l border-border/30 pl-6">
                    <p className="text-xs text-muted-foreground">{active.metric.label}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Scene dots */}
      <div className="flex items-center justify-center gap-2 pb-6">
        {scenes.map((s, i) => (
          <button key={s.id} onClick={() => { setCurrentScene(i); setScenes(prev => prev.map((sc, j) => ({ ...sc, status: j < i ? "complete" : j === i ? "active" : "pending" }))); setShowSummary(false); }}
            className={`h-2 rounded-full transition-all duration-300 ${s.status === "active" ? "w-8 bg-primary" : s.status === "complete" ? "w-2 bg-success" : "w-2 bg-muted"}`} />
        ))}
      </div>
    </div>
  );
}
