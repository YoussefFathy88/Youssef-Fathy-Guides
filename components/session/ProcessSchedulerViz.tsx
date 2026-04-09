"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

export type SchedulerAlgorithm = "FIFO" | "SJF" | "RoundRobin" | "Priority";

export interface SchedulerProcess {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  color: string;
}

export interface ProcessSchedulerVizProps {
  title?: string;
  caption?: string;
  processes?: SchedulerProcess[];
  defaultAlgorithm?: SchedulerAlgorithm;
  quantum?: number;
}

const DEFAULT_PROCESSES: SchedulerProcess[] = [
  { id: "P1", name: "P1", arrivalTime: 0, burstTime: 6, priority: 3, color: "bg-violet-500" },
  { id: "P2", name: "P2", arrivalTime: 1, burstTime: 4, priority: 1, color: "bg-teal-500" },
  { id: "P3", name: "P3", arrivalTime: 2, burstTime: 2, priority: 4, color: "bg-amber-500" },
  { id: "P4", name: "P4", arrivalTime: 3, burstTime: 3, priority: 2, color: "bg-rose-500" },
];

// ─────────── Scheduling algorithms ───────────────────────────────────────────

function computeFIFO(procs: SchedulerProcess[]): (string | null)[] {
  const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const sched: (string | null)[] = [];
  let t = 0;
  for (const p of sorted) {
    while (t < p.arrivalTime) { sched.push(null); t++; }
    for (let i = 0; i < p.burstTime; i++) { sched.push(p.id); t++; }
  }
  return sched;
}

function computeSJF(procs: SchedulerProcess[]): (string | null)[] {
  const sched: (string | null)[] = [];
  const done = new Set<string>();
  let t = 0;
  while (done.size < procs.length) {
    const avail = procs.filter(p => p.arrivalTime <= t && !done.has(p.id));
    if (avail.length === 0) { sched.push(null); t++; continue; }
    avail.sort((a, b) => a.burstTime - b.burstTime);
    const p = avail[0];
    for (let i = 0; i < p.burstTime; i++) { sched.push(p.id); t++; }
    done.add(p.id);
  }
  return sched;
}

function computeRoundRobin(procs: SchedulerProcess[], quantum: number): (string | null)[] {
  const sched: (string | null)[] = [];
  const rem = procs.map(p => ({ ...p, rem: p.burstTime }));
  const queue: string[] = [];
  const enqueued = new Set<string>();
  let t = 0;

  const enqueueArrivals = () => {
    for (const p of rem) {
      if (p.arrivalTime <= t && !enqueued.has(p.id) && p.rem > 0) {
        queue.push(p.id);
        enqueued.add(p.id);
      }
    }
  };

  enqueueArrivals();

  while (rem.some(p => p.rem > 0)) {
    if (queue.length === 0) { sched.push(null); t++; enqueueArrivals(); continue; }
    const id = queue.shift()!;
    const p = rem.find(x => x.id === id)!;
    const slice = Math.min(quantum, p.rem);
    for (let i = 0; i < slice; i++) { sched.push(p.id); t++; enqueueArrivals(); }
    p.rem -= slice;
    if (p.rem > 0) queue.push(p.id);
  }
  return sched;
}

function computePriority(procs: SchedulerProcess[]): (string | null)[] {
  const sched: (string | null)[] = [];
  const done = new Set<string>();
  let t = 0;
  while (done.size < procs.length) {
    const avail = procs.filter(p => p.arrivalTime <= t && !done.has(p.id));
    if (avail.length === 0) { sched.push(null); t++; continue; }
    avail.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
    const p = avail[0];
    for (let i = 0; i < p.burstTime; i++) { sched.push(p.id); t++; }
    done.add(p.id);
  }
  return sched;
}

function buildSchedule(procs: SchedulerProcess[], algo: SchedulerAlgorithm, quantum: number): (string | null)[] {
  switch (algo) {
    case "FIFO":       return computeFIFO(procs);
    case "SJF":        return computeSJF(procs);
    case "RoundRobin": return computeRoundRobin(procs, quantum);
    case "Priority":   return computePriority(procs);
  }
}

// ─────────── Metrics ──────────────────────────────────────────────────────────

interface Metrics {
  avgWait: number;
  avgTurnaround: number;
  cpuUtil: number;
  contextSwitches: number[];
}

function computeMetrics(procs: SchedulerProcess[], sched: (string | null)[]): Metrics {
  const wait: Record<string, number> = {};
  const turnaround: Record<string, number> = {};
  const contextSwitches: number[] = [];
  let lastId: string | null = undefined as unknown as string | null;

  for (let t = 0; t < sched.length; t++) {
    const cur = sched[t];
    if (cur !== lastId && lastId !== undefined) {
      if (cur !== null) contextSwitches.push(t);
    }
    lastId = cur;
  }

  for (const p of procs) {
    const start = sched.indexOf(p.id);
    const end = sched.lastIndexOf(p.id) + 1;
    if (start === -1) continue;
    turnaround[p.id] = end - p.arrivalTime;
    wait[p.id] = turnaround[p.id] - p.burstTime;
  }

  const vals = Object.values(turnaround);
  const wVals = Object.values(wait);
  const busy = sched.filter(Boolean).length;

  return {
    avgWait: wVals.length ? wVals.reduce((s, v) => s + v, 0) / wVals.length : 0,
    avgTurnaround: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0,
    cpuUtil: sched.length ? (busy / sched.length) * 100 : 0,
    contextSwitches,
  };
}

// ─────────── Component ───────────────────────────────────────────────────────

const ALGORITHMS: SchedulerAlgorithm[] = ["FIFO", "SJF", "RoundRobin", "Priority"];

const ALGO_LABELS: Record<SchedulerAlgorithm, string> = {
  FIFO: "FIFO",
  SJF: "SJF",
  RoundRobin: "Round Robin",
  Priority: "Priority",
};

const ALGO_DESC: Record<SchedulerAlgorithm, string> = {
  FIFO: "First In, First Out — run in arrival order, no preemption.",
  SJF: "Shortest Job First — pick the shortest available burst, no preemption.",
  RoundRobin: "Rotate through all ready processes with a fixed quantum.",
  Priority: "Highest priority (lowest number) runs first, no preemption.",
};

const CELL_W = 28;
const ROW_H = 28;

export default function ProcessSchedulerViz({
  title,
  caption,
  processes = DEFAULT_PROCESSES,
  defaultAlgorithm = "FIFO",
  quantum = 2,
}: ProcessSchedulerVizProps) {
  const [algo, setAlgo] = useState<SchedulerAlgorithm>(defaultAlgorithm);
  const [schedule, setSchedule] = useState<(string | null)[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ avgWait: 0, avgTurnaround: 0, cpuUtil: 0, contextSwitches: [] });
  const [currentT, setCurrentT] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const procMap = Object.fromEntries(processes.map(p => [p.id, p]));

  // Recompute when algo changes
  useEffect(() => {
    const s = buildSchedule(processes, algo, quantum);
    setSchedule(s);
    setMetrics(computeMetrics(processes, s));
    setCurrentT(-1);
    setIsPlaying(false);
  }, [algo, processes, quantum]);

  const stepForward = useCallback(() => {
    setCurrentT(t => {
      if (t >= schedule.length - 1) { setIsPlaying(false); return t; }
      return t + 1;
    });
  }, [schedule.length]);

  useEffect(() => {
    if (!isPlaying) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(stepForward, 600);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, stepForward]);

  const isLast = currentT >= schedule.length - 1;

  // Color lookup with fallback
  function cellBg(pid: string | null, t: number): string {
    if (pid === null) return "bg-gray-100 dark:bg-gray-800";
    const p = procMap[pid];
    const isCurrent = t === currentT;
    if (!p) return "bg-gray-300";
    if (isCurrent) return `${p.color} ring-2 ring-white dark:ring-gray-900 ring-inset`;
    return `${p.color} opacity-80`;
  }

  const maxT = schedule.length;
  const timeLabels = Array.from({ length: Math.ceil(maxT / 2) + 1 }, (_, i) => i * 2);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Algorithm tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {ALGORITHMS.map(a => (
          <button
            key={a}
            type="button"
            onClick={() => setAlgo(a)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              a === algo
                ? "border-violet-300 bg-violet-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
            )}
          >
            {ALGO_LABELS[a]}
          </button>
        ))}
      </div>
      <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">{ALGO_DESC[algo]}{algo === "RoundRobin" ? ` Quantum = ${quantum}.` : ""}</p>

      {/* Gantt timeline */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="p-3" style={{ minWidth: `${maxT * CELL_W + 80}px` }}>

          {/* Time axis */}
          <div className="mb-1 flex" style={{ paddingLeft: 64 }}>
            {timeLabels.map(t => (
              <div key={t} className="text-center text-[9px] text-gray-400 dark:text-gray-500" style={{ width: CELL_W * 2, flexShrink: 0 }}>
                {t}
              </div>
            ))}
          </div>

          {/* Process rows */}
          {processes.map(proc => (
            <div key={proc.id} className="mb-1 flex items-center gap-2">
              <div className="flex w-14 shrink-0 items-center gap-1.5">
                <div className={cn("h-3 w-3 shrink-0 rounded-full", proc.color)} />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{proc.name}</span>
              </div>
              <div className="flex">
                {schedule.map((pid, t) => {
                  const isActive = pid === proc.id;
                  const isCur = t === currentT;
                  const isCs = metrics.contextSwitches.includes(t);
                  return (
                    <div
                      key={t}
                      className="relative shrink-0"
                      style={{ width: CELL_W, height: ROW_H }}
                    >
                      {/* Context switch line */}
                      {isCs && (
                        <div className="absolute inset-y-0 left-0 z-10 w-px bg-rose-500/70" />
                      )}
                      {isActive ? (
                        <div className={cn(
                          "absolute inset-0.5 rounded-sm text-white transition-all duration-200",
                          proc.color,
                          isCur && currentT >= 0 && "ring-2 ring-white dark:ring-gray-900 ring-inset brightness-110",
                        )} />
                      ) : (
                        <div className={cn(
                          "absolute inset-0.5 rounded-sm",
                          "bg-gray-100 dark:bg-gray-800",
                          isCur && pid !== null && currentT >= 0 && "bg-gray-200",
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Time cursor */}
          {currentT >= 0 && (
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-gray-900/30 dark:bg-white/30"
              style={{ left: 64 + (currentT + 0.5) * CELL_W }}
            />
          )}

          {/* CPU Idle row */}
          <div className="mt-1 flex items-center gap-2">
            <div className="w-14 shrink-0 text-[10px] text-gray-400">Idle</div>
            <div className="flex">
              {schedule.map((pid, t) => (
                <div
                  key={t}
                  className="shrink-0 text-center"
                  style={{ width: CELL_W, height: 12 }}
                >
                  {pid === null && (
                    <div className="mx-0.5 h-full rounded-sm bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      {schedule.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Avg Wait Time", value: `${metrics.avgWait.toFixed(1)} units`, color: "text-violet-600 dark:text-violet-400" },
            { label: "Avg Turnaround", value: `${metrics.avgTurnaround.toFixed(1)} units`, color: "text-teal-600 dark:text-teal-400" },
            { label: "CPU Utilization", value: `${metrics.cpuUtil.toFixed(0)}%`, color: "text-amber-600 dark:text-amber-400" },
            { label: "Context Switches", value: `${metrics.contextSwitches.length}`, color: "text-rose-600 dark:text-rose-400" },
          ].map(m => (
            <div key={m.label} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{m.label}</p>
              <p className={cn("text-sm font-bold", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Process legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {processes.map(p => (
          <div key={p.id} className="flex items-center gap-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-sm", p.color)} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {p.name} (arr={p.arrivalTime}, burst={p.burstTime}{p.priority !== undefined ? `, pri=${p.priority}` : ""})
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-0.5 rounded-full bg-rose-500/70" />
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Context switch</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2">
        <span className="mr-1 text-[11px] text-gray-400 dark:text-gray-500">
          t = {Math.max(0, currentT)} / {schedule.length}
        </span>
        <button
          type="button"
          disabled={currentT <= -1}
          onClick={() => { setIsPlaying(false); setCurrentT(t => Math.max(-1, t - 1)); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => { setIsPlaying(false); stepForward(); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          Step →
        </button>
        <button
          type="button"
          onClick={() => {
            if (isPlaying) { setIsPlaying(false); }
            else { if (isLast) setCurrentT(-1); setIsPlaying(true); }
          }}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
            isPlaying
              ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              : "bg-violet-600 text-white hover:bg-violet-700",
          )}
        >
          {isPlaying ? "⏸ Pause" : isLast ? "↩ Replay" : "▶ Play"}
        </button>
      </div>
    </div>
  );
}
