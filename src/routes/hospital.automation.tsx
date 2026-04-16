import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Zap, Power, CheckCircle, AlertTriangle, Clock, Shield, Play, Pause,
  RotateCcw, BedDouble, Users, Wrench, Stethoscope, Bell, Settings2,
  TrendingUp, Eye, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import { loadHospitalData, saveHospitalData } from "@/lib/hospitalDataEngine";
import {
  loadAutomationState, saveAutomationState, evaluateRules, applyAutomation,
  type AutoMode, type AutoAction, type AutoRule,
} from "@/lib/hospitalAutomationEngine";
import { computeEfficiencyScore } from "@/lib/hospitalAIEngine";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/automation")({ component: HospitalAutomation });

const MODE_LABELS: Record<AutoMode, { label: string; desc: string; color: string }> = {
  auto: { label: "Full Auto", desc: "All rules execute instantly", color: "text-chart-2" },
  semi: { label: "Semi Auto", desc: "Critical actions need approval", color: "text-chart-4" },
  manual: { label: "Manual", desc: "All actions need approval", color: "text-muted-foreground" },
  emergency: { label: "Emergency", desc: "Override all — maximum response", color: "text-destructive" },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = { beds: BedDouble, staff: Users, equipment: Wrench, flow: Stethoscope, alert: Bell };

function HospitalAutomation() {
  const auth = getHospitalAuth();
  const tenantId = auth?.tenant?.id || "demo";
  const [hd, setHd] = useState(() => loadHospitalData(tenantId));
  const [autoState, setAutoState] = useState(() => loadAutomationState(tenantId));
  const [running, setRunning] = useState(false);
  const [activated, setActivated] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [tab, setTab] = useState<"dashboard" | "rules" | "feed" | "builder">("dashboard");

  const efficiency = computeEfficiencyScore(hd);

  function setMode(m: AutoMode) {
    const next = { ...autoState, mode: m };
    setAutoState(next);
    saveAutomationState(tenantId, next);
    toast.success(`Mode: ${MODE_LABELS[m].label}`);
  }

  function toggleRule(id: string) {
    const next = { ...autoState, rules: autoState.rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r) };
    setAutoState(next);
    saveAutomationState(tenantId, next);
  }

  function runEvaluation() {
    const triggered = evaluateRules(hd, autoState.rules);
    const next = {
      ...autoState,
      actions: [...triggered, ...autoState.actions].slice(0, 50),
      actionsToday: autoState.actionsToday + triggered.filter(a => a.status === "executed").length,
      timeSavedMin: autoState.timeSavedMin + triggered.length * 8,
    };
    setAutoState(next);
    saveAutomationState(tenantId, next);
    toast.success(`${triggered.length} rules triggered`);
  }

  function handleActionStatus(actionId: string, status: "executed" | "rejected" | "reverted") {
    const next = {
      ...autoState,
      actions: autoState.actions.map(a => a.id === actionId ? { ...a, status, executedBy: auth?.user?.name || "Admin" } : a),
      overridesToday: status === "rejected" || status === "reverted" ? autoState.overridesToday + 1 : autoState.overridesToday,
    };
    setAutoState(next);
    saveAutomationState(tenantId, next);
    toast.success(`Action ${status}`);
  }

  function handleActivate() {
    setRunning(true);
    setActivated(false);
    setTimeout(() => {
      const triggered = evaluateRules(hd, autoState.rules);
      const improved = applyAutomation(hd);
      saveHospitalData(tenantId, improved);
      setHd(improved);
      const next = {
        ...autoState,
        mode: "auto" as AutoMode,
        actions: [...triggered.map(a => ({ ...a, status: "executed" as const, executedBy: "Autonomous Engine" })), ...autoState.actions].slice(0, 50),
        actionsToday: autoState.actionsToday + triggered.length,
        timeSavedMin: autoState.timeSavedMin + triggered.length * 12,
        efficiencyGain: Math.min(35, autoState.efficiencyGain + 12),
      };
      setAutoState(next);
      saveAutomationState(tenantId, next);
      setRunning(false);
      setActivated(true);
      toast.success("Autonomous Hospital Mode — ACTIVE");
    }, 3000);
  }

  const tabs = [
    { key: "dashboard" as const, label: "Command Center", icon: Zap },
    { key: "rules" as const, label: "Rules Engine", icon: Settings2 },
    { key: "feed" as const, label: "Action Feed", icon: Clock },
    { key: "builder" as const, label: "Rule Builder", icon: TrendingUp },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-chart-2" /> Automation Control Center
          </h1>
          <p className="text-xs text-muted-foreground">Autonomous hospital operations engine</p>
        </div>
        <button onClick={handleActivate} disabled={running}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-chart-2 text-primary-foreground text-sm font-bold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all disabled:opacity-50">
          {running ? (
            <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Activating...</>
          ) : activated ? (
            <><CheckCircle className="h-4 w-4" /> AUTONOMOUS — ACTIVE</>
          ) : (
            <><Power className="h-4 w-4" /> ENABLE AUTONOMOUS HOSPITAL MODE</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${tab === t.key ? "bg-chart-2 text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* COMMAND CENTER */}
      {tab === "dashboard" && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Status", value: MODE_LABELS[autoState.mode].label, color: MODE_LABELS[autoState.mode].color },
              { label: "Active Rules", value: autoState.rules.filter(r => r.enabled).length.toString(), color: "text-chart-2" },
              { label: "Actions Today", value: autoState.actionsToday.toString(), color: "text-chart-2" },
              { label: "Time Saved", value: `${autoState.timeSavedMin}m`, color: "text-chart-4" },
              { label: "Efficiency Gain", value: `+${autoState.efficiencyGain}%`, color: "text-chart-2" },
              { label: "Overrides", value: autoState.overridesToday.toString(), color: "text-muted-foreground" },
            ].map(k => (
              <GlassCard key={k.label} className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{k.label}</p>
                <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
              </GlassCard>
            ))}
          </div>

          {/* Mode Selector */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Automation Mode</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(["auto", "semi", "manual", "emergency"] as AutoMode[]).map(m => {
                const info = MODE_LABELS[m];
                const active = autoState.mode === m;
                return (
                  <button key={m} onClick={() => setMode(m)}
                    className={`p-3 rounded-lg border text-left transition-all ${active ? "border-chart-2/50 bg-chart-2/10 shadow-[0_0_15px_oklch(0.70_0.12_160/20%)]" : "border-border bg-muted/20 hover:bg-muted/40"}`}>
                    <p className={`text-xs font-semibold ${active ? info.color : "text-muted-foreground"}`}>{info.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{info.desc}</p>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Category Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(["beds", "staff", "equipment", "flow", "alert"] as const).map(cat => {
              const Icon = CATEGORY_ICONS[cat];
              const catRules = autoState.rules.filter(r => r.category === cat);
              const active = catRules.filter(r => r.enabled).length;
              return (
                <GlassCard key={cat} className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-chart-2" />
                    <span className="text-xs font-medium text-foreground capitalize">{cat}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{active}/{catRules.length} rules active</p>
                </GlassCard>
              );
            })}
          </div>

          {/* Quick Action */}
          <div className="flex gap-2">
            <button onClick={runEvaluation} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-chart-2/20 border border-chart-2/30 text-chart-2 text-xs font-medium hover:bg-chart-2/30 transition-all">
              <Play className="h-3.5 w-3.5" /> Run Evaluation Now
            </button>
          </div>

          {/* Recent Actions */}
          {autoState.actions.length > 0 && (
            <GlassCard className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-chart-2" /> Recent Actions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {autoState.actions.slice(0, 8).map(a => {
                  const Icon = CATEGORY_ICONS[a.category] || Zap;
                  return (
                    <div key={a.id} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-muted/20">
                      <Icon className="h-3.5 w-3.5 text-chart-2 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium">{a.action}</p>
                        <p className="text-[10px] text-muted-foreground">{a.reason}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${a.status === "executed" ? "bg-chart-2/10 text-chart-2" : a.status === "pending" ? "bg-chart-4/10 text-chart-4" : "bg-destructive/10 text-destructive"}`}>{a.status}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* RULES ENGINE */}
      {tab === "rules" && (
        <div className="space-y-2">
          {autoState.rules.map(rule => {
            const Icon = CATEGORY_ICONS[rule.category] || Zap;
            const expanded = expandedRule === rule.id;
            return (
              <GlassCard key={rule.id} className={`p-0 overflow-hidden ${!rule.enabled ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedRule(expanded ? null : rule.id)}>
                  <button onClick={e => { e.stopPropagation(); toggleRule(rule.id); }}
                    className={`h-5 w-10 rounded-full relative transition-all ${rule.enabled ? "bg-chart-2" : "bg-muted"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition-all ${rule.enabled ? "left-5" : "left-0.5"}`} />
                  </button>
                  <Icon className="h-4 w-4 text-chart-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{rule.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">IF {rule.condition} → {rule.action}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${rule.priority === "critical" ? "bg-destructive/10 text-destructive" : rule.priority === "high" ? "bg-chart-4/10 text-chart-4" : "bg-muted text-muted-foreground"}`}>{rule.priority}</span>
                  {rule.requiresApproval && <Eye className="h-3 w-3 text-chart-4" />}
                  {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                </div>
                {expanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-border">
                    <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                      <div><span className="text-muted-foreground">Condition:</span> <span className="text-foreground">{rule.condition}</span></div>
                      <div><span className="text-muted-foreground">Action:</span> <span className="text-foreground">{rule.action}</span></div>
                      <div><span className="text-muted-foreground">Priority:</span> <span className="text-foreground capitalize">{rule.priority}</span></div>
                      <div><span className="text-muted-foreground">Approval:</span> <span className={rule.requiresApproval ? "text-chart-4" : "text-chart-2"}>{rule.requiresApproval ? "Required" : "Auto"}</span></div>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* ACTION FEED */}
      {tab === "feed" && (
        <div className="space-y-2">
          {autoState.actions.length === 0 ? (
            <GlassCard className="p-8 text-center text-muted-foreground text-sm">No actions yet. Run evaluation or enable autonomous mode.</GlassCard>
          ) : (
            autoState.actions.map(a => {
              const Icon = CATEGORY_ICONS[a.category] || Zap;
              return (
                <GlassCard key={a.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{a.ruleName}</p>
                      <p className="text-[10px] text-muted-foreground">{a.action}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{a.reason} · {new Date(a.timestamp).toLocaleTimeString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {a.status === "pending" && (
                        <>
                          <button onClick={() => handleActionStatus(a.id, "executed")} className="p-1 rounded hover:bg-chart-2/20 text-chart-2"><CheckCircle className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleActionStatus(a.id, "rejected")} className="p-1 rounded hover:bg-destructive/20 text-destructive"><XCircle className="h-3.5 w-3.5" /></button>
                        </>
                      )}
                      {a.status === "executed" && (
                        <button onClick={() => handleActionStatus(a.id, "reverted")} className="p-1 rounded hover:bg-chart-4/20 text-chart-4" title="Revert"><RotateCcw className="h-3 w-3" /></button>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${a.status === "executed" ? "bg-chart-2/10 text-chart-2" : a.status === "pending" ? "bg-chart-4/10 text-chart-4" : a.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{a.status}</span>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* RULE BUILDER */}
      {tab === "builder" && (
        <RuleBuilder onAdd={(rule) => {
          const next = { ...autoState, rules: [...autoState.rules, rule] };
          setAutoState(next);
          saveAutomationState(tenantId, next);
          toast.success("Rule added");
        }} />
      )}

      {/* Activated overlay */}
      {activated && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setActivated(false)}>
          <GlassCard glow className="p-8 max-w-lg text-center">
            <div className="h-16 w-16 rounded-full bg-chart-2/20 flex items-center justify-center mx-auto mb-4" style={{ boxShadow: "0 0 50px oklch(0.70 0.12 160 / 50%)" }}>
              <Zap className="h-8 w-8 text-chart-2" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Autonomous Hospital Mode — Active</h3>
            <p className="text-sm text-muted-foreground mb-4">All systems optimized. Beds freed, staff balanced, equipment redistributed, queues reduced.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {[
                { label: "Beds Freed", value: `+${Math.round(hd.liveOps.beds.vacant * 0.15)}` },
                { label: "Wait Time", value: `${hd.opsBaseline.avgWaitTime}m` },
                { label: "Staff Active", value: `${hd.liveOps.staff.onDutyDoctors + hd.liveOps.staff.onDutyNurses}` },
                { label: "Efficiency", value: `${computeEfficiencyScore(hd)}%` },
              ].map(m => (
                <div key={m.label} className="bg-muted/30 rounded-lg p-2">
                  <p className="text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-bold text-chart-2">{m.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function RuleBuilder({ onAdd }: { onAdd: (rule: AutoRule) => void }) {
  const [cond, setCond] = useState("");
  const [action, setAction] = useState("");
  const [cat, setCat] = useState<AutoRule["category"]>("beds");
  const [priority, setPriority] = useState<AutoRule["priority"]>("medium");
  const [approval, setApproval] = useState(false);

  const inputCls = "w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-chart-2 focus:ring-1 focus:ring-chart-2/30 transition-all";

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Settings2 className="h-4 w-4 text-chart-2" /> Create Automation Rule</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">IF (Condition)</label>
          <input value={cond} onChange={e => setCond(e.target.value)} placeholder="e.g. ICU > 90%" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">THEN (Action)</label>
          <input value={action} onChange={e => setAction(e.target.value)} placeholder="e.g. Reserve 3 beds + alert admin" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Category</label>
          <div className="flex gap-1">
            {(["beds", "staff", "equipment", "flow", "alert"] as const).map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${cat === c ? "bg-chart-2 text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
          <div className="flex gap-1">
            {(["low", "medium", "high", "critical"] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${priority === p ? "bg-chart-2 text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setApproval(!approval)} className={`h-5 w-10 rounded-full relative transition-all ${approval ? "bg-chart-2" : "bg-muted"}`}>
            <div className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition-all ${approval ? "left-5" : "left-0.5"}`} />
          </button>
          <span className="text-xs text-muted-foreground">Requires Approval</span>
        </div>
      </div>
      <button onClick={() => { if (cond && action) { onAdd({ id: crypto.randomUUID(), name: `Custom: ${cond}`, category: cat, condition: cond, action, priority, requiresApproval: approval, enabled: true }); setCond(""); setAction(""); } }}
        disabled={!cond || !action}
        className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-chart-2 text-primary-foreground text-xs font-medium hover:shadow-[0_0_20px_oklch(0.70_0.12_160/30%)] transition-all disabled:opacity-50">
        <Zap className="h-3.5 w-3.5" /> Add Rule
      </button>
    </GlassCard>
  );
}
