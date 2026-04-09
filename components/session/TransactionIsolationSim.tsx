"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export type IsolationLevel = "ReadUncommitted" | "ReadCommitted" | "RepeatableRead" | "Serializable";

export interface TransactionIsolationSimProps {
  title?: string;
  caption?: string;
  defaultLevel?: IsolationLevel;
}

// ── Scenario data ─────────────────────────────────────────────────────────────
// The table: accounts(id, name, balance)
// T1 reads row 1 three times. T2 updates row 1 (uncommitted during T1's second read, committed before T1's third read).

interface Row { id: number; name: string; balance: number }

const INITIAL_ROWS: Row[] = [
  { id: 1, name: "Alice", balance: 1000 },
  { id: 2, name: "Bob",   balance: 500  },
  { id: 3, name: "Carol", balance: 750  },
];

interface Step {
  idx: number;
  tx: "T1" | "T2";
  sql: string;
  // row highlighted in the table
  affectsRow?: number;
  // what each level sees when this is a READ by T1
  readResult?: Record<IsolationLevel, number | "blocked" | "—">;
  // anomaly triggered AT this step per level
  anomaly?: Partial<Record<IsolationLevel, { name: string; desc: string }>>;
  isBlocked?: Partial<Record<IsolationLevel, boolean>>;
  // committed db value after this step
  commitValue?: number; // if T2 writes or commits
}

const STEPS: Step[] = [
  {
    idx: 0, tx: "T1", sql: "BEGIN TRANSACTION",
  },
  {
    idx: 1, tx: "T1",
    sql: "SELECT balance FROM accounts WHERE id = 1",
    affectsRow: 1,
    readResult: { ReadUncommitted: 1000, ReadCommitted: 1000, RepeatableRead: 1000, Serializable: 1000 },
  },
  {
    idx: 2, tx: "T2", sql: "BEGIN TRANSACTION",
  },
  {
    idx: 3, tx: "T2",
    sql: "UPDATE accounts SET balance = 900 WHERE id = 1",
    affectsRow: 1,
    commitValue: 900, // dirty value (uncommitted)
    isBlocked: { Serializable: true },
  },
  {
    idx: 4, tx: "T1",
    sql: "SELECT balance FROM accounts WHERE id = 1",
    affectsRow: 1,
    readResult: { ReadUncommitted: 900, ReadCommitted: 1000, RepeatableRead: 1000, Serializable: 1000 },
    anomaly: {
      ReadUncommitted: { name: "Dirty Read", desc: "T1 reads T2's uncommitted change. If T2 rolls back, T1 has seen data that never existed." },
    },
  },
  {
    idx: 5, tx: "T2",
    sql: "COMMIT",
    commitValue: 900, // now committed
  },
  {
    idx: 6, tx: "T1",
    sql: "SELECT balance FROM accounts WHERE id = 1",
    affectsRow: 1,
    readResult: { ReadUncommitted: 900, ReadCommitted: 900, RepeatableRead: 1000, Serializable: 1000 },
    anomaly: {
      ReadCommitted: { name: "Non-Repeatable Read", desc: "T1 re-reads the same row and gets a different value because T2 committed between the two reads." },
    },
  },
  {
    idx: 7, tx: "T1", sql: "COMMIT",
  },
];

// For Serializable: T2's UPDATE is blocked until T1 commits.
// After T1 commits (step 7), T2 runs and commits → balance=900.

// ── Isolation level metadata ──────────────────────────────────────────────────

const LEVEL_INFO: Record<IsolationLevel, { label: string; color: string; border: string; text: string; desc: string }> = {
  ReadUncommitted: { label: "Read Uncommitted", color: "bg-rose-100 dark:bg-rose-900/30",    border: "border-rose-300 dark:border-rose-700",    text: "text-rose-700 dark:text-rose-300",    desc: "Can read uncommitted changes from other transactions." },
  ReadCommitted:   { label: "Read Committed",   color: "bg-amber-100 dark:bg-amber-900/30",  border: "border-amber-300 dark:border-amber-700",  text: "text-amber-700 dark:text-amber-300",  desc: "Only reads committed data, but the same row can return different values within a transaction." },
  RepeatableRead:  { label: "Repeatable Read",  color: "bg-blue-100 dark:bg-blue-900/30",    border: "border-blue-300 dark:border-blue-700",    text: "text-blue-700 dark:text-blue-300",    desc: "All reads within a transaction see a consistent snapshot. No dirty or non-repeatable reads." },
  Serializable:    { label: "Serializable",     color: "bg-teal-100 dark:bg-teal-900/30",    border: "border-teal-300 dark:border-teal-700",    text: "text-teal-700 dark:text-teal-300",    desc: "Transactions execute as if they were serial. Conflicting transactions are blocked." },
};

// ── Anomaly prevention table ──────────────────────────────────────────────────

const ANOMALY_TABLE: { anomaly: string; prevents: Record<IsolationLevel, boolean> }[] = [
  { anomaly: "Dirty Read",          prevents: { ReadUncommitted: false, ReadCommitted: true,  RepeatableRead: true,  Serializable: true  } },
  { anomaly: "Non-Repeatable Read", prevents: { ReadUncommitted: false, ReadCommitted: false, RepeatableRead: true,  Serializable: true  } },
  { anomaly: "Phantom Read",        prevents: { ReadUncommitted: false, ReadCommitted: false, RepeatableRead: false, Serializable: true  } },
];

const LEVELS: IsolationLevel[] = ["ReadUncommitted", "ReadCommitted", "RepeatableRead", "Serializable"];

export default function TransactionIsolationSim({
  title,
  caption,
  defaultLevel = "ReadCommitted",
}: TransactionIsolationSimProps) {
  const [level, setLevel] = useState<IsolationLevel>(defaultLevel);
  const [stepIdx, setStepIdx] = useState(-1);

  const info = LEVEL_INFO[level];
  const currentStep = stepIdx >= 0 ? STEPS[stepIdx] : null;

  // Compute visible DB balance at current step
  function getBalance(rowId: number): { value: number; dirty: boolean } {
    let committed = INITIAL_ROWS.find(r => r.id === rowId)!.balance;
    let dirty = false;
    let t2CommittedWrite = false;

    for (let i = 0; i <= stepIdx; i++) {
      const s = STEPS[i];
      if (s.commitValue !== undefined && s.tx === "T2") {
        if (i === 3) {
          // step 3: T2 writes 900, uncommitted
          dirty = true;
        }
        if (i === 5) {
          // step 5: T2 commits
          committed = s.commitValue;
          dirty = false;
          t2CommittedWrite = true;
        }
      }
    }

    // For Serializable, T2's write (step 3) is blocked until T1 commits (step 7+)
    if (level === "Serializable" && stepIdx < 7) {
      dirty = false;
    }

    return { value: committed, dirty };
  }

  // What T1 actually reads at a given step
  function getReadValue(step: Step): string {
    if (!step.readResult) return "—";
    const v = step.readResult[level];
    if (v === "blocked") return "⏳ blocked";
    if (v === "—") return "—";
    return String(v);
  }

  const anomaly = currentStep?.anomaly?.[level];
  const isBlocked = currentStep?.isBlocked?.[level];

  function stepLabel(s: Step): string {
    if (s.readResult) return getReadValue(s);
    return "";
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Isolation level selector */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {LEVELS.map(l => (
          <button
            key={l}
            type="button"
            onClick={() => { setLevel(l); setStepIdx(-1); }}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              l === level
                ? `${LEVEL_INFO[l].color} ${LEVEL_INFO[l].border} ${LEVEL_INFO[l].text} border`
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
            )}
          >
            {LEVEL_INFO[l].label}
          </button>
        ))}
      </div>

      <p className="mb-5 text-[11px] text-gray-500 dark:text-gray-400">{info.desc}</p>

      {/* Main grid: T1 | Table | T2 */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">

        {/* T1 column */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="mb-2 text-[11px] font-bold text-blue-700 dark:text-blue-300">Transaction T1</p>
          <div className="space-y-1.5">
            {STEPS.filter(s => s.tx === "T1").map(s => {
              const isActive = stepIdx === s.idx;
              const isPast   = stepIdx > s.idx;
              return (
                <div
                  key={s.idx}
                  className={cn(
                    "rounded-lg px-2 py-1.5 font-mono text-[10px] leading-snug transition-all",
                    isActive ? "bg-blue-600 text-white shadow" :
                    isPast   ? "bg-blue-200 text-blue-800 dark:bg-blue-800/60 dark:text-blue-200" :
                               "text-gray-400 dark:text-gray-600",
                  )}
                >
                  <div className="font-medium">{s.sql}</div>
                  {isPast && s.readResult && (
                    <div className={cn("mt-0.5 text-[9px]", isPast && !isActive ? "opacity-80" : "")}>
                      → <span className="font-bold">{stepLabel(s)}</span>
                    </div>
                  )}
                  {isActive && s.readResult && (
                    <div className="mt-0.5 text-[9px] font-bold">
                      → {getReadValue(s)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Table */}
        <div className="flex flex-col gap-2" style={{ minWidth: 160 }}>
          <p className="text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400">accounts</p>
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-0 border-b border-gray-200 dark:border-gray-700">
              {["id", "name", "balance"].map(h => (
                <div key={h} className="py-1 px-2 text-center text-[9px] font-bold uppercase text-gray-400">{h}</div>
              ))}
            </div>
            {/* Rows */}
            {INITIAL_ROWS.map(row => {
              const { value: bal, dirty } = getBalance(row.id);
              const isAffected = currentStep?.affectsRow === row.id;
              return (
                <div
                  key={row.id}
                  className={cn(
                    "grid grid-cols-3 gap-0 border-b border-gray-100 dark:border-gray-800 transition-all",
                    isAffected && dirty && level === "ReadUncommitted" ? "bg-rose-100 dark:bg-rose-900/30" :
                    isAffected ? "bg-amber-50 dark:bg-amber-900/20" : "",
                  )}
                >
                  <div className="py-1.5 px-2 text-center font-mono text-[10px] text-gray-500">{row.id}</div>
                  <div className="py-1.5 px-2 text-center text-[10px] text-gray-700 dark:text-gray-300">{row.name}</div>
                  <div className={cn("py-1.5 px-2 text-center font-mono text-[10px] font-bold",
                    isAffected && dirty && level === "ReadUncommitted" ? "text-rose-700 dark:text-rose-400" :
                    isAffected ? "text-amber-700 dark:text-amber-400" : "text-gray-700 dark:text-gray-300",
                  )}>
                    {/* Show dirty value only for ReadUncommitted when T2 has written but not committed */}
                    {(() => {
                      if (row.id !== 1) return row.balance;
                      const uncommittedStep = STEPS[3]; // T2 writes 900
                      const committedStep   = STEPS[5]; // T2 commits
                      const t2Wrote = stepIdx >= 3;
                      const t2Committed = stepIdx >= 5;

                      if (level === "ReadUncommitted" && t2Wrote && !t2Committed) return "900*";
                      if (level !== "Serializable" && t2Committed) return 900;
                      if (level === "Serializable" && t2Committed && stepIdx >= 7) return 900;
                      return 1000;
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-[9px] text-gray-400 dark:text-gray-600">* = uncommitted</p>
        </div>

        {/* T2 column */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="mb-2 text-[11px] font-bold text-amber-700 dark:text-amber-300">Transaction T2</p>
          <div className="space-y-1.5">
            {STEPS.filter(s => s.tx === "T2").map(s => {
              const isActive = stepIdx === s.idx;
              const isPast   = stepIdx > s.idx;
              const blocked  = s.isBlocked?.[level] && !isPast;
              // For Serializable, T2's write is blocked until T1 commits (step 7)
              const actuallyBlocked = level === "Serializable" && s.idx === 3 && stepIdx === 3;

              return (
                <div
                  key={s.idx}
                  className={cn(
                    "rounded-lg px-2 py-1.5 font-mono text-[10px] leading-snug transition-all",
                    actuallyBlocked ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600" :
                    isActive ? "bg-amber-500 text-white shadow" :
                    isPast   ? "bg-amber-200 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200" :
                               "text-gray-400 dark:text-gray-600",
                  )}
                >
                  {actuallyBlocked
                    ? <span>⏳ WAITING for T1 lock…</span>
                    : <span>{s.sql}</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Anomaly banner */}
      {anomaly && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 dark:border-rose-700 dark:bg-rose-900/30">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-xs font-bold text-rose-700 dark:text-rose-300">{anomaly.name} detected!</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-rose-600 dark:text-rose-400">{anomaly.desc}</p>
          </div>
        </div>
      )}
      {isBlocked && level === "Serializable" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-teal-300 bg-teal-50 p-3 dark:border-teal-700 dark:bg-teal-900/30">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-xs font-bold text-teal-700 dark:text-teal-300">Serializable: T2 is blocked</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-teal-600 dark:text-teal-400">
              T2 cannot acquire the write lock while T1 holds a read lock. T2 will execute only after T1 commits.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[11px] text-gray-400">{stepIdx + 1}/{STEPS.length}</span>
        <button
          type="button"
          disabled={stepIdx <= -1}
          onClick={() => setStepIdx(s => Math.max(-1, s - 1))}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={stepIdx >= STEPS.length - 1}
          onClick={() => setStepIdx(s => Math.min(STEPS.length - 1, s + 1))}
          className="flex h-8 items-center gap-1 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-30"
        >
          Next Step →
        </button>
        <button
          type="button"
          onClick={() => setStepIdx(-1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ↩ Reset
        </button>
      </div>

      {/* Anomaly prevention summary table */}
      <div className="mt-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Anomaly prevention summary
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-3 py-2 text-left font-medium text-gray-400">Anomaly</th>
                {LEVELS.map(l => (
                  <th key={l} className={cn("px-2 py-2 text-center font-medium", l === level ? LEVEL_INFO[l].text : "text-gray-400")}>
                    {LEVEL_INFO[l].label.replace("Read ", "").replace("Repeatable Read", "Rep.Read")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ANOMALY_TABLE.map(row => (
                <tr key={row.anomaly} className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{row.anomaly}</td>
                  {LEVELS.map(l => (
                    <td key={l} className={cn("px-2 py-1.5 text-center", l === level ? "font-bold" : "")}>
                      {row.prevents[l]
                        ? <span className="text-teal-500">✓</span>
                        : <span className="text-rose-500">✗</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
