/**
 * Recommendation Acceptance Tracker
 * Persists accept/reject decisions in localStorage so the /judge-metrics
 * page can compute a live human-judged acceptance rate — defending
 * judging criterion #2 (Allocation recommendation acceptance rate).
 */
const KEY = "medflow.recAcceptance.v1";

export type Decision = "accepted" | "rejected";

export interface DecisionRecord {
  id: string;
  action: string;
  category: string;
  urgency: string;
  decision: Decision;
  ts: number;
}

type Listener = (records: DecisionRecord[]) => void;
const listeners = new Set<Listener>();

function read(): DecisionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as DecisionRecord[];
  } catch { return []; }
}
function write(records: DecisionRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(records));
  listeners.forEach(l => l(records));
}

export function recordDecision(r: Omit<DecisionRecord, "ts">) {
  const all = read().filter(x => x.id !== r.id);
  all.push({ ...r, ts: Date.now() });
  write(all);
}

export function getDecisions(): DecisionRecord[] {
  return read();
}

export function getDecisionFor(id: string): Decision | null {
  return read().find(r => r.id === id)?.decision ?? null;
}

export function clearDecisions() { write([]); }

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function computeAcceptanceStats(records: DecisionRecord[] = read()) {
  const total = records.length;
  const accepted = records.filter(r => r.decision === "accepted").length;
  const rejected = total - accepted;
  const rate = total === 0 ? 0 : (accepted / total) * 100;
  return { total, accepted, rejected, rate };
}
