"use client";

import { Fragment, useState } from "react";

type DemoPhase = "data-preparation" | "training" | "inference";

const TOKENS = ["In", "Egypt", "there", "are", "pyramids", "and", "the", "capital", "city", "is"] as const;
const ALL_TOKENS = [...TOKENS, "Cairo"] as const;
const TARGETS = ["Egypt", "there", "are", "pyramids", "and", "the", "capital", "city", "is", "Cairo"] as const;
const TRAIN_PREDS = ["Egypt", "there", "are", "pyramids", "and", "the", "capital", "city", "is", "Paris"] as const;
const TRAIN_OK = [true, true, true, true, true, true, true, true, true, false] as const;

/** Illustrative Egypt-signal % inside hₜ after reading TOKENS[i]. null = Egypt not yet encountered. */
const EGYPT_PCT: (number | null)[] = [null, 100, 72, 48, 28, 12, 8, 5, 3, 1];

// ── colour helpers ────────────────────────────────────────────────────────────

function boxClasses(pct: number | null) {
  if (pct === null) return "border-gray-300 dark:border-zinc-700 bg-gray-100/60 dark:bg-zinc-800/60";
  if (pct >= 70) return "border-amber-400 bg-amber-500/20";
  if (pct >= 30) return "border-amber-600 bg-amber-700/15";
  if (pct >= 8) return "border-rose-700 bg-rose-800/20";
  return "border-rose-900 bg-rose-950/40";
}

function pctTextCls(pct: number | null) {
  if (pct === null) return "text-zinc-600";
  if (pct >= 70) return "text-amber-700 dark:text-amber-300";
  if (pct >= 30) return "text-amber-500";
  if (pct >= 8) return "text-rose-700 dark:text-rose-400";
  return "text-rose-600";
}

// ── Shared nav row ────────────────────────────────────────────────────────────

function NavRow({
  step,
  total,
  onPrev,
  onNext,
}: {
  step: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 pt-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={step === 0}
          className="rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 transition-all disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={step === total - 1}
          className="rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 transition-all disabled:opacity-40"
        >
          Next →
        </button>
      </div>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {step + 1} / {total}
      </span>
    </div>
  );
}

// ── Phase 1: Data Preparation ─────────────────────────────────────────────────

function DataPrepPhase() {
  const [idx, setIdx] = useState(0);

  return (
    <div className="space-y-5">
      {/* Raw text */}
      <div className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-5 py-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">Raw text</p>
        <p className="font-mono text-lg text-zinc-900 dark:text-zinc-100">
          In <span className="font-bold text-amber-700 dark:text-amber-300">Egypt</span> there are pyramids and the capital city is Cairo.
        </p>
      </div>

      {/* Token pills — teal = current input, amber = next target */}
      <div className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-900/70 px-5 py-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">
          Tokens &nbsp;·&nbsp;
          <span className="text-teal-700 dark:text-teal-400">input xₜ</span>
          &nbsp;·&nbsp;
          <span className="text-amber-700 dark:text-amber-400">target (next)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_TOKENS.map((tok, i) => (
            <span
              key={`pill-${i}`}
              className={[
                "rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold transition-all duration-300",
                i === idx
                  ? "border-teal-400 bg-teal-900/50 text-teal-800 dark:text-teal-200 shadow-[0_0_8px_rgba(45,212,191,0.3)]"
                  : i === idx + 1
                    ? "border-amber-400 bg-amber-900/30 text-amber-800 dark:text-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.25)]"
                    : "border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
              ].join(" ")}
            >
              {tok}
            </span>
          ))}
        </div>
      </div>

      {/* Input / Target pair cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-teal-700/60 bg-teal-950/20 px-5 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-teal-500">Input xₜ</p>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-teal-400 bg-teal-900/40 px-4 py-2 font-mono text-2xl font-bold text-teal-800 dark:text-teal-200">
              {ALL_TOKENS[idx]}
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-500">→ RNN</span>
          </div>
        </div>
        <div className="rounded-xl border border-amber-700/60 bg-amber-950/10 px-5 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-amber-500">Target (next token)</p>
          <span className="rounded-lg border border-amber-400 bg-amber-900/30 px-4 py-2 font-mono text-2xl font-bold text-amber-800 dark:text-amber-200">
            {ALL_TOKENS[idx + 1] ?? "⟨end⟩"}
          </span>
        </div>
      </div>

      <NavRow
        step={idx}
        total={TOKENS.length}
        onPrev={() => setIdx((p) => Math.max(p - 1, 0))}
        onNext={() => setIdx((p) => Math.min(p + 1, TOKENS.length - 1))}
      />
    </div>
  );
}

// ── Phase 2: Training ─────────────────────────────────────────────────────────

function TrainingPhase() {
  const [step, setStep] = useState(0);
  const correct = TRAIN_OK[step];

  return (
    <div className="space-y-5">
      {/* Unrolled chain — scrollable */}
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-900/70 p-4">
        <div className="flex min-w-max items-start gap-0">
          {/* h₀ initial state */}
          <div className="flex flex-col items-center">
            {/* spacer: aligns h₀ centre with RNN-cell row (pred 48px + gap 8px + half-cell 28px = 84px; minus own half 28px = 56px) */}
            <div className="h-14" />
            <div
              className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 border-dashed text-sm font-semibold transition-all duration-300 ${
                step === 0 ? "border-amber-400 text-amber-700 dark:text-amber-300" : "border-gray-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-500"
              }`}
            >
              h₀
            </div>
          </div>

          {/* arrow: h₀ → RNN₁ */}
          <div className="mt-[5.25rem] px-1 text-base font-bold text-amber-500/60">→</div>

          {TOKENS.map((token, i) => {
            const isActive = i === step;
            const isPast = i < step;
            const pred = TRAIN_PREDS[i];
            const ok = TRAIN_OK[i];

            return (
              <Fragment key={`tr-${i}`}>
                <div className="flex flex-col items-center">
                  {/* Prediction badge */}
                  <div
                    className={`mb-1 flex h-12 w-20 flex-col items-center justify-center rounded-lg border transition-all duration-300 ${
                      isActive
                        ? ok
                          ? "border-emerald-600/60 bg-emerald-950/30"
                          : "border-rose-600/60 bg-rose-950/30"
                        : "border-transparent"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <span
                          className={`font-mono text-sm font-bold ${ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
                        >
                          {pred}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${ok ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {ok ? "✓ correct" : "✗ wrong"}
                        </span>
                      </>
                    ) : (
                      <span className={`text-sm ${ok ? "text-emerald-600" : "text-rose-600"}`}>
                        {ok ? "✓" : "✗"}
                      </span>
                    )}
                  </div>

                  {/* connector ↑ */}
                  <div
                    className={`h-2 w-px transition-all duration-300 ${
                      isActive || isPast ? "bg-zinc-600" : "bg-gray-100 dark:bg-zinc-800"
                    }`}
                  />

                  {/* RNN cell */}
                  <div
                    className={`flex h-14 w-20 flex-col items-center justify-center rounded-xl border-2 font-bold transition-all duration-300 ${
                      isActive
                        ? "border-teal-400 bg-teal-900/40 text-teal-800 dark:text-teal-200 shadow-[0_0_16px_rgba(45,212,191,0.3)]"
                        : isPast
                          ? "border-gray-300 dark:border-zinc-600 bg-gray-100/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 opacity-70"
                          : "border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-zinc-600 opacity-40"
                    }`}
                  >
                    <span className="text-sm">RNN</span>
                    <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-500">{i + 1}</span>
                  </div>

                  {/* connector ↓ */}
                  <div
                    className={`h-2 w-px transition-all duration-300 ${
                      isActive || isPast ? "bg-zinc-600" : "bg-gray-100 dark:bg-zinc-800"
                    }`}
                  />

                  {/* Input token */}
                  <div
                    className={`flex h-9 min-w-[5rem] items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "border-teal-600 bg-teal-950/50 text-teal-800 dark:text-teal-100"
                        : isPast
                          ? "border-gray-300 dark:border-zinc-600 bg-gray-100/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 opacity-70"
                          : "border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-zinc-600 opacity-40"
                    }`}
                  >
                    {token}
                  </div>
                </div>

                {/* h-state arrow between columns */}
                {i < TOKENS.length - 1 && (
                  <div
                    className={`mt-[5.25rem] flex flex-col items-center px-0.5 transition-all duration-300 ${
                      i < step ? "text-amber-700 dark:text-amber-400" : "text-zinc-700"
                    }`}
                  >
                    <span className="text-sm leading-none">→</span>
                    <span className="font-mono text-[10px] font-semibold">h{i + 1}</span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Active step detail card */}
      <div
        className={`rounded-xl border px-5 py-4 transition-all duration-300 ${
          correct ? "border-emerald-700/40 bg-emerald-950/15" : "border-rose-600/50 bg-rose-950/20"
        }`}
      >
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">Input</p>
            <p className="mt-1 font-mono text-xl font-bold text-teal-700 dark:text-teal-300">{TOKENS[step]}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">Hidden state</p>
            <p className="mt-1 font-mono text-xl font-bold text-amber-700 dark:text-amber-400">h{step + 1}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">Predicted</p>
            <p
              className={`mt-1 font-mono text-xl font-bold ${correct ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
            >
              {TRAIN_PREDS[step]}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">Target</p>
            <p className="mt-1 font-mono text-xl font-bold text-zinc-900 dark:text-zinc-200">{TARGETS[step]}</p>
          </div>
        </div>
        {!correct && (
          <p className="mt-3 rounded-lg border border-rose-700/40 bg-rose-950/30 px-3 py-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
            ❌ &quot;Egypt&quot; has faded — model predicts Paris instead of Cairo
          </p>
        )}
      </div>

      <NavRow
        step={step}
        total={TOKENS.length}
        onPrev={() => setStep((p) => Math.max(p - 1, 0))}
        onNext={() => setStep((p) => Math.min(p + 1, TOKENS.length - 1))}
      />
    </div>
  );
}

// ── Phase 3: Inference ────────────────────────────────────────────────────────

function InferencePhase() {
  const [stepIdx, setStepIdx] = useState(0);
  const isFailure = stepIdx === TOKENS.length - 1;
  const egyptPct = EGYPT_PCT[stepIdx] ?? 0;
  const restPct = Math.max(0, 100 - egyptPct);

  return (
    <div className="space-y-5">
      {/* Token column strip */}
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-900/70 p-4">
        <div className="flex min-w-max items-start gap-0">
          {TOKENS.map((word, i) => {
            const ret = EGYPT_PCT[i];
            const isActive = i === stepIdx;
            const processed = i <= stepIdx;

            return (
              <Fragment key={`inf-${i}`}>
                {/* Clickable column */}
                <button
                  type="button"
                  onClick={() => setStepIdx(i)}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all duration-200 hover:bg-gray-100/40 dark:hover:bg-zinc-800/40"
                >
                  {/* Word label */}
                  <span
                    className={`font-mono text-base font-bold transition-all duration-300 ${
                      isActive
                        ? word === "Egypt"
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-500"
                    }`}
                  >
                    {word}
                  </span>

                  {/* RNN box — background tint reflects Egypt% */}
                  <div
                    className={[
                      "flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 transition-all duration-500",
                      processed ? boxClasses(ret) : "border-gray-200 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-900/40 opacity-30",
                      isActive && !isFailure
                        ? "ring-2 ring-teal-400/50 shadow-[0_0_16px_rgba(45,212,191,0.25)]"
                        : "",
                      isFailure && isActive
                        ? "border-rose-500 bg-rose-950/50 ring-2 ring-rose-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        : "",
                    ].join(" ")}
                  >
                    <span className="text-xs text-zinc-600 dark:text-zinc-500">RNN</span>
                    {processed && (
                      <span className={`mt-0.5 text-2xl font-bold leading-none ${pctTextCls(ret)}`}>
                        {ret === null ? "—" : `${ret}%`}
                      </span>
                    )}
                  </div>

                  {/* h-label */}
                  <span
                    className={`font-mono text-sm font-semibold transition-all duration-300 ${
                      isActive ? "text-teal-700 dark:text-teal-400" : processed ? "text-teal-700" : "text-zinc-700"
                    }`}
                  >
                    h{i + 1}
                  </span>
                </button>

                {/* Arrow to next column */}
                {i < TOKENS.length - 1 && (
                  <div
                    className={`mt-[4.5rem] flex flex-col items-center transition-colors duration-300 ${
                      i < stepIdx ? "text-amber-700 dark:text-amber-400" : "text-zinc-700"
                    }`}
                  >
                    <span className="text-base font-bold">→</span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Egypt vs rest bar */}
      <div className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-900/70 p-4">
        <div className="mb-2 flex justify-between text-sm font-bold">
          <span className="text-amber-700 dark:text-amber-300">Egypt signal: {egyptPct}%</span>
          <span className="text-teal-700 dark:text-teal-300">Other context: {restPct}%</span>
        </div>
        <div className="flex h-12 w-full overflow-hidden rounded-lg border border-gray-300 dark:border-zinc-700">
          <div
            className={`flex items-center justify-center text-sm font-bold text-zinc-900 transition-all duration-500 ${
              egyptPct > 50
                ? "bg-amber-400"
                : egyptPct > 20
                  ? "bg-amber-600"
                  : egyptPct > 5
                    ? "bg-rose-600"
                    : "bg-rose-900"
            }`}
            style={{ width: `${egyptPct}%` }}
          >
            {egyptPct > 15 ? `Egypt ${egyptPct}%` : ""}
          </div>
          <div
            className="flex items-center justify-center bg-teal-700/80 text-sm font-medium text-teal-800 dark:text-teal-50 transition-all duration-500"
            style={{ width: `${restPct}%` }}
          >
            {restPct > 15 ? `other ${restPct}%` : ""}
          </div>
        </div>
      </div>

      {/* Status card */}
      <div
        className={`rounded-xl border px-5 py-4 transition-all duration-300 ${
          isFailure ? "border-rose-500 bg-rose-950/30" : "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
        }`}
      >
        {isFailure ? (
          <div className="flex items-center gap-4">
            <span className="text-4xl">❌</span>
            <div>
              <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
                Vanishing Memory — Egypt only {egyptPct}% retained
              </p>
              <p className="mt-0.5 text-sm text-rose-700 dark:text-rose-400">
                Predicted:{" "}
                <span className="font-mono font-bold">Paris</span> — should be{" "}
                <span className="font-mono font-bold">Cairo</span>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-base font-semibold text-teal-700 dark:text-teal-300">
              Reading: <span className="font-mono">&quot;{TOKENS[stepIdx]}&quot;</span> → h{stepIdx + 1}
            </p>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Egypt in h{stepIdx + 1}:{" "}
              <span className={`font-mono text-base font-bold ${pctTextCls(EGYPT_PCT[stepIdx])}`}>
                {EGYPT_PCT[stepIdx] === null ? "not seen yet" : `${EGYPT_PCT[stepIdx]}%`}
              </span>
            </p>
          </div>
        )}
      </div>

      <NavRow
        step={stepIdx}
        total={TOKENS.length}
        onPrev={() => setStepIdx((p) => Math.max(p - 1, 0))}
        onNext={() => setStepIdx((p) => Math.min(p + 1, TOKENS.length - 1))}
      />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

const TABS: { id: DemoPhase; label: string; activeClass: string }[] = [
  {
    id: "data-preparation",
    label: "1 — Data Prep",
    activeClass: "border-violet-500 bg-violet-950 text-violet-800 dark:text-violet-200",
  },
  {
    id: "training",
    label: "2 — Training",
    activeClass: "border-teal-500 bg-teal-950 text-teal-800 dark:text-teal-200",
  },
  {
    id: "inference",
    label: "3 — Inference",
    activeClass: "border-rose-500 bg-rose-950 text-rose-800 dark:text-rose-200",
  },
];

export function RNNAutocompleteDemo() {
  const [phase, setPhase] = useState<DemoPhase>("data-preparation");

  return (
    <section className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-zinc-900 dark:text-zinc-100 sm:p-6">
      {/* Phase switcher tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map(({ id, label, activeClass }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPhase(id)}
            className={[
              "rounded-md border px-4 py-2 text-sm font-semibold transition-all duration-200",
              phase === id ? activeClass : "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {phase === "data-preparation" && <DataPrepPhase />}
      {phase === "training" && <TrainingPhase />}
      {phase === "inference" && <InferencePhase />}
    </section>
  );
}

export default RNNAutocompleteDemo;
