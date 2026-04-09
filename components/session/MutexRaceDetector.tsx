"use client";

import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";

export interface MutexRaceDetectorProps {
  title?: string;
  caption?: string;
}

// Execution steps per thread
const STEPS = ["LOAD counter → reg", "INC  reg", "STORE reg → counter"] as const;
type StepIdx = 0 | 1 | 2;

interface ThreadState {
  pc: StepIdx | null; // current instruction (null = not started / done)
  reg: number;        // local register
  done: boolean;
  blocked: boolean;   // waiting for mutex
}

interface SimState {
  counter: number;
  mutex: "free" | "a" | "b"; // who holds the lock
  a: ThreadState;
  b: ThreadState;
  execTrace: string[]; // human-readable trace
  final: number | null;
}

// Build a full execution trace for no-lock mode at interleave point P
// P = 0: switch after A's step 0
// P = 1: switch after A's step 1
// P = 2: A runs to completion first
function simulateNoLock(interleave: number): { final: number; trace: string[] } {
  const trace: string[] = [];
  let counter = 0;
  let regA = 0, regB = 0;

  // Thread A up to interleave point
  for (let s = 0; s <= interleave; s++) {
    if (s === 0) { regA = counter; trace.push(`A: LOAD counter(${counter}) → regA=${regA}`); }
    else if (s === 1) { regA++; trace.push(`A: INC regA → regA=${regA}`); }
    else if (s === 2) { counter = regA; trace.push(`A: STORE regA(${regA}) → counter=${counter}`); }
  }

  if (interleave < 2) trace.push("--- context switch → Thread B ---");

  // Thread B runs fully
  regB = counter; trace.push(`B: LOAD counter(${counter}) → regB=${regB}`);
  regB++;          trace.push(`B: INC regB → regB=${regB}`);
  counter = regB;  trace.push(`B: STORE regB(${regB}) → counter=${counter}`);

  if (interleave < 2) trace.push("--- context switch → Thread A ---");

  // Thread A continues after interleave point
  for (let s = interleave + 1; s <= 2; s++) {
    if (s === 1) { regA++; trace.push(`A: INC regA → regA=${regA}`); }
    else if (s === 2) { counter = regA; trace.push(`A: STORE regA(${regA}) → counter=${counter}`); }
  }

  return { final: counter, trace };
}

function simulateMutex(): { final: number; trace: string[] } {
  const trace: string[] = [];
  let counter = 0;
  let regA = 0, regB = 0;

  trace.push("A: ACQUIRE mutex (granted)");
  regA = counter; trace.push(`A: LOAD counter(${counter}) → regA=${regA}`);
  regA++;          trace.push(`A: INC regA → regA=${regA}`);
  counter = regA;  trace.push(`A: STORE regA(${regA}) → counter=${counter}`);
  trace.push("A: RELEASE mutex");
  trace.push("B: ACQUIRE mutex (granted)");
  regB = counter; trace.push(`B: LOAD counter(${counter}) → regB=${regB}`);
  regB++;          trace.push(`B: INC regB → regB=${regB}`);
  counter = regB;  trace.push(`B: STORE regB(${regB}) → counter=${counter}`);
  trace.push("B: RELEASE mutex");

  return { final: counter, trace };
}

// Run 100 no-lock simulations with random interleave points
function run100NoLock(): Record<number, number> {
  const hist: Record<number, number> = {};
  for (let i = 0; i < 100; i++) {
    const p = Math.floor(Math.random() * 3) as 0 | 1 | 2;
    const { final } = simulateNoLock(p);
    hist[final] = (hist[final] ?? 0) + 1;
  }
  return hist;
}

// ─── Step-by-step interactive simulation ────────────────────────────────────

type ExecLine = { owner: "A" | "B" | "sys"; text: string; isSwitch?: boolean; isBad?: boolean; isGood?: boolean };

function buildSteps(interleave: number, useMutex: boolean): ExecLine[] {
  if (useMutex) {
    return [
      { owner: "A",   text: "ACQUIRE mutex (granted)" },
      { owner: "A",   text: "LOAD counter → regA = 0" },
      { owner: "A",   text: "INC  regA → regA = 1" },
      { owner: "A",   text: "STORE regA → counter = 1", isGood: true },
      { owner: "A",   text: "RELEASE mutex" },
      { owner: "B",   text: "ACQUIRE mutex (granted)" },
      { owner: "B",   text: "LOAD counter → regB = 1" },
      { owner: "B",   text: "INC  regB → regB = 2" },
      { owner: "B",   text: "STORE regB → counter = 2", isGood: true },
      { owner: "B",   text: "RELEASE mutex" },
    ];
  }

  const lines: ExecLine[] = [];
  // Thread A up to interleave
  const aLoaded = 0;
  const aInced = 1;
  for (let s = 0; s <= interleave; s++) {
    if (s === 0) lines.push({ owner: "A", text: `LOAD counter → regA = ${aLoaded}` });
    if (s === 1) lines.push({ owner: "A", text: `INC  regA → regA = ${aInced}` });
    if (s === 2) lines.push({ owner: "A", text: `STORE regA → counter = 1`, isGood: interleave === 2 });
  }

  if (interleave < 2) {
    lines.push({ owner: "sys", text: "⚡ Context switch", isSwitch: true });
  }

  // Thread B
  const bLoadVal = interleave === 2 ? 1 : 0;
  lines.push({ owner: "B", text: `LOAD counter → regB = ${bLoadVal}` });
  lines.push({ owner: "B", text: `INC  regB → regB = ${bLoadVal + 1}` });
  lines.push({ owner: "B", text: `STORE regB → counter = ${bLoadVal + 1}`, isBad: interleave < 2, isGood: interleave === 2 });

  if (interleave < 2) {
    lines.push({ owner: "sys", text: "⚡ Context switch", isSwitch: true });
    // Thread A remaining
    if (interleave < 1) lines.push({ owner: "A", text: "INC  regA → regA = 1" });
    lines.push({ owner: "A", text: "STORE regA → counter = 1", isBad: true });
  }

  return lines;
}

const INTERLEAVE_LABELS = [
  "After A's LOAD (race!)",
  "After A's INC  (race!)",
  "After A's STORE (safe)",
];

export default function MutexRaceDetector({ title, caption }: MutexRaceDetectorProps) {
  const [useMutex, setUseMutex] = useState(false);
  const [interleave, setInterleave] = useState<0 | 1 | 2>(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showHistogram, setShowHistogram] = useState(false);
  const [histogram, setHistogram] = useState<Record<number, number> | null>(null);

  const steps = buildSteps(interleave, useMutex);
  const isLast = currentStep >= steps.length - 1;

  const finalCounter = (() => {
    if (!isLast) return null;
    if (useMutex) return 2;
    return interleave === 2 ? 2 : 1;
  })();

  const aSteps = steps.filter(s => s.owner === "A");
  const bSteps = steps.filter(s => s.owner === "B");

  const handleRun100 = useCallback(() => {
    let hist: Record<number, number>;
    if (useMutex) {
      hist = { 2: 100 };
    } else {
      hist = run100NoLock();
    }
    setHistogram(hist);
    setShowHistogram(true);
  }, [useMutex]);

  const reset = () => { setCurrentStep(-1); setShowHistogram(false); setHistogram(null); };

  const maxHistVal = histogram ? Math.max(...Object.values(histogram)) : 1;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Mode toggle */}
      <div className="mb-5 flex items-center gap-3">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Mode:</span>
        <button
          type="button"
          onClick={() => { setUseMutex(false); reset(); }}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition",
            !useMutex
              ? "border-rose-300 bg-rose-600 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
          )}
        >
          🔓 No Lock
        </button>
        <button
          type="button"
          onClick={() => { setUseMutex(true); reset(); }}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition",
            useMutex
              ? "border-teal-300 bg-teal-600 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
          )}
        >
          🔒 Enable Mutex
        </button>
      </div>

      {/* Interleave slider (no-lock only) */}
      {!useMutex && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Inject context switch: <span className="font-semibold text-rose-600 dark:text-rose-400">{INTERLEAVE_LABELS[interleave]}</span>
          </p>
          <div className="flex gap-1.5">
            {([0, 1, 2] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => { setInterleave(p); reset(); }}
                className={cn(
                  "flex-1 rounded-lg border py-1.5 text-[11px] font-medium transition",
                  p === interleave
                    ? p < 2
                      ? "border-rose-300 bg-rose-600 text-white"
                      : "border-teal-300 bg-teal-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
                )}
              >
                {INTERLEAVE_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main simulation area */}
      <div className="grid grid-cols-3 gap-3">
        {/* Thread A */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
          <p className="mb-2 text-[11px] font-bold text-blue-700 dark:text-blue-300">Thread A</p>
          <div className="space-y-1">
            {STEPS.map((s, i) => {
              const done = steps
                .slice(0, currentStep + 1)
                .some(l => l.owner === "A" && l.text.startsWith(s.split(" ")[0]));
              const active = currentStep >= 0 && steps[currentStep]?.owner === "A" &&
                steps[currentStep]?.text.startsWith(s.split(" ")[0]);
              return (
                <div key={i} className={cn(
                  "rounded px-2 py-1 font-mono text-[10px] transition-all",
                  active ? "bg-blue-500 text-white" : done ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200" : "text-gray-500 dark:text-gray-500",
                )}>
                  {s}
                </div>
              );
            })}
            {useMutex && (
              <div className={cn(
                "mt-1 rounded px-2 py-1 text-[10px] font-mono transition-all",
                steps[currentStep]?.owner === "A" && steps[currentStep]?.text.includes("ACQUIRE")
                  ? "bg-blue-500 text-white"
                  : "text-gray-400",
              )}>
                🔒 mutex
              </div>
            )}
          </div>
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Shared Counter
          </p>
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl font-bold transition-all duration-500",
            finalCounter === 2
              ? "border-teal-400 bg-teal-100 text-teal-700 dark:border-teal-500 dark:bg-teal-900/40 dark:text-teal-300"
              : finalCounter === 1
              ? "border-rose-400 bg-rose-100 text-rose-700 dark:border-rose-500 dark:bg-rose-900/40 dark:text-rose-300"
              : "border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200",
          )}>
            {finalCounter ?? "?"}
          </div>
          {finalCounter !== null && (
            <p className={cn(
              "text-center text-[11px] font-semibold",
              finalCounter === 2 ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400",
            )}>
              {finalCounter === 2 ? "✓ Correct!" : "✗ Race condition!"}
            </p>
          )}
          {currentStep >= 0 && !isLast && (
            <p className="text-center text-[10px] text-gray-400">Expected: 2</p>
          )}
        </div>

        {/* Thread B */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
          <p className="mb-2 text-[11px] font-bold text-amber-700 dark:text-amber-300">Thread B</p>
          <div className="space-y-1">
            {STEPS.map((s, i) => {
              const done = steps
                .slice(0, currentStep + 1)
                .some(l => l.owner === "B" && l.text.startsWith(s.split(" ")[0]));
              const active = currentStep >= 0 && steps[currentStep]?.owner === "B" &&
                steps[currentStep]?.text.startsWith(s.split(" ")[0]);
              const isBlocked = useMutex && steps[currentStep]?.owner === "A" && !isLast;
              return (
                <div key={i} className={cn(
                  "rounded px-2 py-1 font-mono text-[10px] transition-all",
                  isBlocked && !done ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600" :
                  active ? "bg-amber-500 text-white" : done ? "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200" : "text-gray-500 dark:text-gray-500",
                )}>
                  {isBlocked && !done && s === STEPS[0] ? "🔒 BLOCKED" : s}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Execution trace */}
      {currentStep >= 0 && (
        <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400">Execution trace</p>
          {steps.slice(0, currentStep + 1).map((line, i) => (
            <div
              key={i}
              className={cn(
                "mb-0.5 rounded px-2 py-0.5 font-mono text-[11px]",
                line.isSwitch ? "bg-rose-100 font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                  : line.isBad ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                  : line.isGood ? "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"
                  : line.owner === "A" ? "text-blue-700 dark:text-blue-300"
                  : "text-amber-700 dark:text-amber-300",
              )}
            >
              {line.text}
            </div>
          ))}
        </div>
      )}

      {/* Histogram */}
      {showHistogram && histogram && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-3 text-[11px] font-medium text-gray-600 dark:text-gray-400">
            100-run histogram — final counter value:
          </p>
          <div className="flex items-end gap-6">
            {[1, 2].map(val => {
              const count = histogram[val] ?? 0;
              const pct = count / maxHistVal;
              return (
                <div key={val} className="flex flex-1 flex-col items-center gap-1">
                  <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{count}×</span>
                  <div className="w-full rounded-t" style={{ height: `${Math.max(4, pct * 80)}px`, backgroundColor: val === 2 ? "#14b8a6" : "#f43f5e" }} />
                  <span className={cn("font-mono text-sm font-bold", val === 2 ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400")}>
                    {val}
                  </span>
                  <span className="text-[10px] text-gray-400">{val === 2 ? "correct" : "race bug"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] text-gray-400 dark:text-gray-500">
          {currentStep + 1}/{steps.length}
        </span>
        <button
          type="button"
          disabled={currentStep <= -1}
          onClick={() => setCurrentStep(s => Math.max(-1, s - 1))}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          Step →
        </button>
        <button
          type="button"
          onClick={handleRun100}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          📊 Run 100×
        </button>
        {currentStep >= 0 && (
          <button
            type="button"
            onClick={reset}
            className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            ↩ Reset
          </button>
        )}
      </div>
    </div>
  );
}
