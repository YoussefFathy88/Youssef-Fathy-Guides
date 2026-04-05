"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface EmbeddingSearchStage {
  id: string;
  label: string;
  description: string;
}

export interface EmbeddingSearchCategory {
  id: string;
  label: string;
  centroidLabel: string;
  color: "blue" | "amber" | "red" | "teal" | "violet";
  icon: string;
}

export interface EmbeddingSearchSimulatorProps {
  title: string;
  caption: string;
  placeholder: string;
  presets: string[];
  categories: EmbeddingSearchCategory[];
  stages: EmbeddingSearchStage[];
}

const colorMap = {
  blue: {
    bar: "bg-blue-500",
    glow: "ring-blue-400",
    card: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  amber: {
    bar: "bg-amber-500",
    glow: "ring-amber-400",
    card: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  red: {
    bar: "bg-red-500",
    glow: "ring-red-400",
    card: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-300",
  },
  teal: {
    bar: "bg-teal-500",
    glow: "ring-teal-400",
    card: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
  },
  violet: {
    bar: "bg-violet-500",
    glow: "ring-violet-400",
    card: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
  },
} as const;

const presetWinners: Record<string, string> = {
  "can't log in after resetting my password": "auth",
  "my invoice shows the wrong amount": "billing",
  "the app crashes when i open the dashboard": "bugs",
  "how do i add a new team member?": "account",
  "i was charged twice this month": "billing",
  "export to csv is not working": "data",
  "forgot my two-factor auth device": "auth",
};

const VECTOR_HEIGHTS: Record<string, readonly string[]> = {
  auth: ["h-10", "h-5", "h-14", "h-8", "h-12", "h-6", "h-11", "h-7"],
  billing: ["h-7", "h-12", "h-6", "h-14", "h-5", "h-10", "h-8", "h-9"],
  bugs: ["h-6", "h-9", "h-5", "h-11", "h-14", "h-7", "h-10", "h-8"],
  account: ["h-11", "h-6", "h-10", "h-7", "h-12", "h-5", "h-9", "h-14"],
  data: ["h-8", "h-14", "h-7", "h-6", "h-10", "h-12", "h-5", "h-11"],
};

const BAR_STAGGER_MS = 120;
const BAR_FILL_MS = 500;

function normalizeInput(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/\s+/g, " ");
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededUnit(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297 + 233280) * 10000;
  return x - Math.floor(x);
}

function pickWinnerCategoryId(input: string, categories: EmbeddingSearchCategory[]): string {
  const n = normalizeInput(input);
  if (presetWinners[n]) return presetWinners[n];

  if (/\b(log|password|login|access|locked|auth|mfa|2fa|two-factor|unlock)\b/i.test(input)) {
    return "auth";
  }
  if (/\b(charge|invoice|bill|payment|refund|subscription)\b/i.test(input)) {
    return "billing";
  }
  if (/\b(crash|error|broken|not working|bug|fail|fails)\b/i.test(input)) {
    return "bugs";
  }
  if (/\b(user|team|member|invite|role|permission)\b/i.test(input)) {
    return "account";
  }
  if (/\b(export|csv|download|report|import|sync)\b/i.test(input)) {
    return "data";
  }
  return "bugs";
}

function buildScores(
  input: string,
  winnerId: string,
  categories: EmbeddingSearchCategory[],
): { id: string; score: number }[] {
  const seed = hashString(normalizeInput(input));
  const others = categories.filter((c) => c.id !== winnerId);
  const secondIdx = Math.floor(seededUnit(seed, 1) * others.length);
  const secondId = others[secondIdx]?.id ?? others[0]?.id;

  const rest = categories.map((c, i) => {
    if (c.id === winnerId || c.id === secondId) return { id: c.id, score: 0 };
    const score = 0.08 + seededUnit(seed, 30 + i) * (0.35 - 0.08);
    return { id: c.id, score };
  });

  let secondScore = 0.45 + seededUnit(seed, 88) * (0.65 - 0.45);
  const maxRest = Math.max(0, ...rest.map((r) => r.score));
  secondScore = Math.max(secondScore, maxRest + 0.04);
  secondScore = Math.min(secondScore, 0.65);

  let winnerScore = 0.72 + seededUnit(seed, 99) * (0.91 - 0.72);
  winnerScore = Math.max(winnerScore, secondScore + 0.07);
  winnerScore = Math.min(winnerScore, 0.91);

  return categories.map((c, i) => {
    if (c.id === winnerId) return { id: c.id, score: Math.round(winnerScore * 100) / 100 };
    if (c.id === secondId) return { id: c.id, score: Math.round(secondScore * 100) / 100 };
    const r = rest.find((x) => x.id === c.id);
    const score = r?.score ?? 0.2;
    return { id: c.id, score: Math.round(score * 100) / 100 };
  });
}

function formatVectorPreview(seed: number) {
  const parts = [0, 1, 2, 3].map((j) => (0.1 + seededUnit(seed, 40 + j) * 0.89).toFixed(2));
  return `[${parts.join(", ")}, …]`;
}

type RunPhase = "idle" | "stepping" | "complete";

export default function EmbeddingSearchSimulator({
  title,
  caption,
  placeholder,
  presets,
  categories,
  stages,
}: EmbeddingSearchSimulatorProps) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [activeStageIndex, setActiveStageIndex] = useState<number>(-1);
  const [tokens, setTokens] = useState<string[]>([]);
  const [visibleTokenCount, setVisibleTokenCount] = useState(0);
  const [showVector, setShowVector] = useState(false);
  const [barFill, setBarFill] = useState(false);
  const [showScoreLabels, setShowScoreLabels] = useState(false);
  const [winnerPulse, setWinnerPulse] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState<{ id: string; score: number }[] | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [vectorPreview, setVectorPreview] = useState("");
  const [vectorHeightsKey, setVectorHeightsKey] = useState<string>("bugs");
  const [stepBusy, setStepBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const tokenTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTokenTimers = useCallback(() => {
    tokenTimersRef.current.forEach(clearTimeout);
    tokenTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTokenTimers();
  }, [clearTokenTimers]);

  useEffect(() => {
    if (phase === "idle") {
      inputRef.current?.focus();
    }
  }, [phase]);

  /** Stage 1 — stagger token chips when entering step 0 */
  useEffect(() => {
    if (phase !== "stepping" || activeStageIndex !== 0 || tokens.length === 0) {
      return;
    }
    clearTokenTimers();
    setStepBusy(true);
    setVisibleTokenCount(0);
    tokens.forEach((_, idx) => {
      const id = setTimeout(() => setVisibleTokenCount(idx + 1), idx * 80);
      tokenTimersRef.current.push(id);
    });
    const lastDelay = Math.max(0, (tokens.length - 1) * 80) + 450;
    const doneId = setTimeout(() => setStepBusy(false), lastDelay);
    tokenTimersRef.current.push(doneId);
    return () => clearTokenTimers();
  }, [phase, activeStageIndex, tokens, clearTokenTimers]);

  /** Stage 3 — fill similarity bars when entering step 2 */
  useEffect(() => {
    if (phase !== "stepping" || activeStageIndex !== 2) {
      return;
    }
    setStepBusy(true);
    setShowScoreLabels(false);
    setWinnerPulse(false);
    const raf = requestAnimationFrame(() => setBarFill(true));
    const n = categories.length;
    const lastBarStart = Math.max(0, n - 1) * BAR_STAGGER_MS;
    const settleMs = lastBarStart + BAR_FILL_MS + 80;
    const t = window.setTimeout(() => {
      setShowScoreLabels(true);
      setWinnerPulse(true);
      setStepBusy(false);
    }, settleMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [phase, activeStageIndex, categories.length]);

  const winnerCategory = useMemo(
    () => categories.find((c) => c.id === winnerId) ?? null,
    [categories, winnerId],
  );

  const scoreById = useMemo(() => {
    const m = new Map<string, number>();
    scores?.forEach((s) => m.set(s.id, s.score));
    return m;
  }, [scores]);

  const reset = useCallback(() => {
    clearTokenTimers();
    setPhase("idle");
    setActiveStageIndex(-1);
    setTokens([]);
    setVisibleTokenCount(0);
    setShowVector(false);
    setBarFill(false);
    setShowScoreLabels(false);
    setWinnerPulse(false);
    setShowResult(false);
    setScores(null);
    setWinnerId(null);
    setText("");
    setVectorPreview("");
    setVectorHeightsKey("bugs");
    setStepBusy(false);
  }, [clearTokenTimers]);

  const onPreset = (p: string) => {
    setText(p);
  };

  const inWalkthrough = phase === "stepping" || phase === "complete";

  const onRoute = () => {
    const trimmed = text.trim();
    if (!trimmed || stages.length < 4) return;

    clearTokenTimers();
    const words = trimmed.split(/\s+/).filter(Boolean).slice(0, 8);
    const win = pickWinnerCategoryId(trimmed, categories);
    const built = buildScores(trimmed, win, categories);
    const seed = hashString(normalizeInput(trimmed));

    setTokens(words);
    setVisibleTokenCount(0);
    setShowVector(false);
    setBarFill(false);
    setShowScoreLabels(false);
    setWinnerPulse(false);
    setShowResult(false);
    setScores(built);
    setWinnerId(win);
    setVectorPreview(formatVectorPreview(seed));
    setVectorHeightsKey(win);
    setStepBusy(false);
    setPhase("stepping");
    setActiveStageIndex(0);
  };

  const onNextStep = () => {
    if (phase !== "stepping" || stepBusy) return;

    if (activeStageIndex === 0) {
      clearTokenTimers();
      setActiveStageIndex(1);
      setShowVector(true);
      return;
    }

    if (activeStageIndex === 1) {
      setBarFill(false);
      setActiveStageIndex(2);
      return;
    }

    if (activeStageIndex === 2) {
      setWinnerPulse(false);
      setActiveStageIndex(3);
      setShowResult(true);
      setPhase("complete");
    }
  };

  const readyLabel = "Ready — enter a ticket description";
  const stageMeta =
    activeStageIndex >= 0 && stages[activeStageIndex]
      ? { label: stages[activeStageIndex].label, description: stages[activeStageIndex].description }
      : { label: readyLabel, description: "" };

  const heights = VECTOR_HEIGHTS[vectorHeightsKey] ?? VECTOR_HEIGHTS.bugs;

  const showNextButton = phase === "stepping" && activeStageIndex >= 0 && activeStageIndex < 3;
  const nextLabel =
    activeStageIndex === 2 ? "See routing result →" : activeStageIndex === 1 ? "Next: compare to categories →" : "Next: embed into vector →";

  return (
    <div className="w-full space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">{title}</h3>
        {caption ? (
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{caption}</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900/40 sm:p-7">
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            disabled={inWalkthrough}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 shadow-sm outline-none transition-all duration-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
            aria-label="Ticket description"
          />
          <div className="flex flex-wrap gap-2.5">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                disabled={inWalkthrough}
                onClick={() => onPreset(p)}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-left text-sm leading-snug text-gray-700 transition-all duration-300 hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-violet-500/50 dark:hover:bg-violet-950/30"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              disabled={!text.trim() || inWalkthrough}
              onClick={onRoute}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-base font-semibold text-white transition-all duration-300 hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
            >
              Start walkthrough →
            </button>
          </div>
        </div>

        {/* Stage stepper */}
        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {stages.slice(0, 4).map((st, i) => {
              const done =
                phase === "complete" || (phase === "stepping" && activeStageIndex > i);
              const active = phase === "stepping" && activeStageIndex === i;
              const pending = !done && !active;
              return (
                <div key={st.id} className="flex min-w-0 flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500",
                        done &&
                          "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500",
                        active &&
                          "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500",
                        pending && "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-950",
                      )}
                      aria-hidden
                    >
                      {done ? "✓" : active ? i + 1 : ""}
                    </div>
                  </div>
                  {i < 3 ? (
                    <div
                      className={cn(
                        "mx-0.5 h-0.5 min-w-[12px] flex-1 transition-all duration-500 sm:mx-1",
                        phase === "complete" || (phase === "stepping" && activeStageIndex > i)
                          ? "bg-violet-500"
                          : "bg-gray-200 dark:bg-gray-600",
                      )}
                      aria-hidden
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-5 min-h-[4.5rem]">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{stageMeta.label}</p>
            {stageMeta.description ? (
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {stageMeta.description}
              </p>
            ) : null}
            {phase === "stepping" && activeStageIndex === 0 && stepBusy ? (
              <p className="mt-2 text-sm font-medium text-violet-600 dark:text-violet-400">Tokenizing…</p>
            ) : null}
            {phase === "stepping" && activeStageIndex === 2 && stepBusy ? (
              <p className="mt-2 text-sm font-medium text-violet-600 dark:text-violet-400">Scoring categories…</p>
            ) : null}
          </div>

          {showNextButton ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Step through each stage to see what the router does at each point.
              </p>
              <button
                type="button"
                disabled={stepBusy}
                onClick={onNextStep}
                className="shrink-0 rounded-xl border border-violet-300 bg-violet-50 px-5 py-2.5 text-base font-semibold text-violet-800 transition-all duration-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-500/40 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-900/40"
              >
                {nextLabel}
              </button>
            </div>
          ) : null}
        </div>

        {/* Token / vector visualization */}
        <div className="mt-4 min-h-[4.5rem]">
          {activeStageIndex >= 0 && !showVector && tokens.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {tokens.map((tok, i) => (
                <span
                  key={`${tok}-${i}`}
                  className={cn(
                    "inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 font-mono text-sm text-violet-800 transition-all duration-500 ease-out dark:border-violet-500/40 dark:bg-violet-950/50 dark:text-violet-200",
                    i < visibleTokenCount ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                  )}
                >
                  {tok}
                </span>
              ))}
              {visibleTokenCount > 0 ? (
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {tokens.length} token{tokens.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          ) : null}

          {showVector ? (
            <div className="space-y-3 transition-all duration-500">
              <div className="flex h-[4.5rem] items-end justify-stretch gap-1.5 sm:gap-2">
                {heights.map((hClass, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-sm bg-violet-500 transition-all duration-500",
                      hClass,
                      "origin-bottom scale-y-100",
                    )}
                  />
                ))}
              </div>
              <p className="break-words font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Vector: {vectorPreview} (1536 dimensions)
              </p>
            </div>
          ) : null}
        </div>

        {/* Category bars */}
        <ul className="mt-7 space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-600 dark:bg-gray-950/60 sm:p-6">
          {categories.map((cat, rowIdx) => {
            const sc = scoreById.get(cat.id) ?? 0;
            const pct = phase === "idle" ? 0 : barFill ? Math.round(sc * 100) : 0;
            const colors = colorMap[cat.color];
            return (
              <li
                key={cat.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                  <span className="text-2xl leading-none" aria-hidden>
                    {cat.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {cat.label}
                      </span>
                      {showResult && winnerId === cat.id ? (
                        <span
                          className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                          aria-label="Routed category"
                        >
                          ✓ Routed
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-snug text-gray-600 dark:text-gray-400">
                      {cat.centroidLabel}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-md">
                  <div className="relative h-4 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        colors.bar,
                        winnerPulse && winnerId === cat.id && "shadow-md",
                        winnerPulse && winnerId === cat.id && `ring-2 ${colors.glow} ring-offset-2 ring-offset-white dark:ring-offset-gray-950`,
                      )}
                      style={{
                        width: `${pct}%`,
                        transitionDelay: barFill ? `${rowIdx * BAR_STAGGER_MS}ms` : "0ms",
                      }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-gray-800 dark:text-gray-200">
                    {showScoreLabels ? sc.toFixed(2) : "—"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div
          className={cn(
            "mt-5 overflow-hidden transition-all duration-500",
            showResult && winnerCategory ? "max-h-52 translate-y-0 opacity-100" : "max-h-0 translate-y-2 opacity-0",
          )}
        >
          {winnerCategory ? (
            <div
              className={cn(
                "flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between",
                colorMap[winnerCategory.color].card,
                "border-gray-200 dark:border-gray-600",
              )}
            >
              <p className={cn("text-base font-semibold leading-snug", colorMap[winnerCategory.color].text)}>
                <span className="mr-2" aria-hidden>
                  ✅
                </span>
                Routed to: {winnerCategory.icon} {winnerCategory.label}
              </p>
              <button
                type="button"
                onClick={reset}
                className="shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-all duration-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Try another ticket →
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
