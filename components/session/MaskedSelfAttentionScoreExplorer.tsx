"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_TOKENS = ["The", "capital", "of", "Egypt", "is", "Cairo"] as const;

/** Short sentence for teaching Q/K/V — same pattern as encoder mini self-attention diagram. */
const TEACHING_SIMPLE_TOKENS = ["The", "cat", "sat"] as const;

/** Legacy MDX example — map to built-in Cairo dataset so the session stays consistent. */
const LEGACY_CAT_TOKENS = ["The", "cat", "sat", "on", "the", "mat"] as const;

const TEACHING_SIMPLE_DETAILS: ReadonlyArray<{
  q: string;
  k: string;
  v: string;
  scores: readonly number[];
  summary: string;
  outputBlend: string;
}> = [
  {
    q: "Which word am I pointing at?",
    k: "I'm \"The\" — one specific thing.",
    v: "If I'm blended in, I add \"that exact one\" flavor.",
    scores: [0.08, 0.72, 0.2],
    summary: "Biggest weight on \"cat\" (72%).",
    outputBlend: "Mostly pulls in \"cat\" — the noun I introduce.",
  },
  {
    q: "What happened to me?",
    k: "I'm \"cat\" — the animal.",
    v: "If I'm blended in, I add cat-as-subject flavor.",
    scores: [0.12, 0.1, 0.78],
    summary: "Biggest weight on \"sat\" (78%).",
    outputBlend: "Mostly pulls in \"sat\" — the action.",
  },
  {
    q: "Who did it?",
    k: "I'm \"sat\" — the sitting action.",
    v: "If I'm blended in, I add action flavor.",
    scores: [0.1, 0.68, 0.22],
    summary: "Biggest weight on \"cat\" (68%).",
    outputBlend: "Mostly pulls in \"cat\" — the actor.",
  },
];

const CAIRO_TOKEN_DETAILS: ReadonlyArray<{
  q: string;
  k: string;
  v: string;
  scores: readonly number[];
  summary: string;
  outputBlend: string;
}> = [
  {
    q: "What came before me? Nothing.",
    k: "I'm \"The\" — I mean one specific thing.",
    v: "If I'm blended in, I add \"that exact one\" flavor.",
    scores: [1.0, 0, 0, 0, 0, 0],
    summary: "Can only attend to itself (100%). Future tokens are masked out.",
    outputBlend: "Outputs only \"The\" meaning since it cannot look ahead.",
  },
  {
    q: "What context modifies me?",
    k: "I'm \"capital\" — the main city.",
    v: "If I'm blended in, I add capital-city flavor.",
    scores: [0.41, 0.59, 0, 0, 0, 0],
    summary: "Attends to past context \"The\" (41%) and itself (59%).",
    outputBlend: "Mixes \"The\" and \"capital\" into a specific capital concept.",
  },
  {
    q: "What am I connecting?",
    k: "I'm \"of\" — a tiny linking word.",
    v: "If I'm blended in, I add \"belongs with\" flavor.",
    scores: [0.10, 0.75, 0.15, 0, 0, 0],
    summary: "Heavy focus on \"capital\" (75%) as it's the preceding noun.",
    outputBlend: "Hooks the preceding phrase, looking for the object.",
  },
  {
    q: "What is my role here?",
    k: "I'm \"Egypt\" — the country.",
    v: "If I'm blended in, I add country meaning.",
    scores: [0.10, 0.58, 0.15, 0.17, 0, 0],
    summary: "Strong focus on \"capital\" (58%) to understand its context.",
    outputBlend: "Understands it is the \"capital of Egypt\" specifically.",
  },
  {
    q: "What two pieces am I saying match?",
    k: "I'm \"is\" — like an equals sign.",
    v: "If I'm blended in, I add \"these line up\" flavor.",
    scores: [0.07, 0.50, 0.06, 0.26, 0.11, 0],
    summary: "Looks back at \"capital\" (50%) and \"Egypt\" (26%).",
    outputBlend: "Summarizes the left side of the equation to predict the answer.",
  },
  {
    q: "Which country names me?",
    k: "I'm \"Cairo\" — the city.",
    v: "If I'm blended in, I add city flavor.",
    scores: [0.05, 0.3, 0.05, 0.38, 0.07, 0.15],
    summary: "Can finally see the full context, strong pull on \"Egypt\" (38%) and \"capital\" (30%).",
    outputBlend: "City identity wired to the full sentence context.",
  },
];

export interface AttentionScoreRow {
  token: string;
  scores: number[];
}

export interface MaskedSelfAttentionScoreExplorerProps {
  title?: string;
  caption?: string;
  tokens?: string[];
  defaultSelected?: number;
  /** Used when `tokens` is not a built-in Cairo, teaching-simple, or legacy cat sentence. */
  queries?: string[];
  attentionRows?: AttentionScoreRow[];
}

function isCairoTokens(tokens: readonly string[]): boolean {
  if (tokens.length !== DEFAULT_TOKENS.length) return false;
  return DEFAULT_TOKENS.every((t, i) => tokens[i] === t);
}

function isTeachingSimpleTokens(tokens: readonly string[]): boolean {
  if (tokens.length !== TEACHING_SIMPLE_TOKENS.length) return false;
  return TEACHING_SIMPLE_TOKENS.every((t, i) => tokens[i] === t);
}

function isLegacyCatTokens(tokens: readonly string[]): boolean {
  if (tokens.length !== LEGACY_CAT_TOKENS.length) return false;
  return LEGACY_CAT_TOKENS.every((t, i) => tokens[i] === t);
}

function strengthLabel(pct: number): "Strong" | "Moderate" | "Weak" | "Masked" {
  if (pct === 0) return "Masked";
  if (pct >= 30) return "Strong";
  if (pct >= 15) return "Moderate";
  return "Weak";
}

function barClassForPct(pct: number): string {
  if (pct === 0) return "bg-gray-200 dark:bg-gray-800 opacity-30";
  if (pct >= 30) return "bg-blue-600 dark:bg-blue-400";
  if (pct >= 15) return "bg-amber-500 dark:bg-amber-400";
  return "bg-gray-400 dark:bg-gray-500";
}

function textClassForPct(pct: number): string {
  if (pct === 0) return "text-gray-400 dark:text-gray-600";
  if (pct >= 30) return "text-blue-600 dark:text-blue-400";
  if (pct >= 15) return "text-amber-600 dark:text-amber-400";
  return "text-gray-500 dark:text-gray-400";
}

function rowToBarPct(scores: readonly number[], len: number): number[] {
  return Array.from({ length: len }, (_, j) => Math.round((scores[j] ?? 0) * 100));
}

export default function MaskedSelfAttentionScoreExplorer({
  title = "Masked Self-Attention (Decoder)",
  caption = "In a decoder, tokens can only attend to past tokens. Future tokens are masked out to 0%.",
  tokens: tokensProp,
  defaultSelected = 4,
  queries,
  attentionRows,
}: MaskedSelfAttentionScoreExplorerProps) {
  const rawTokens = useMemo(() => (tokensProp?.length ? [...tokensProp] : [...DEFAULT_TOKENS]), [tokensProp]);

  const teachingBuiltin = isTeachingSimpleTokens(rawTokens);

  const cairoBuiltin =
    !teachingBuiltin &&
    (rawTokens.length === 0 ||
      isCairoTokens(rawTokens) ||
      isLegacyCatTokens(rawTokens));

  const tokens = teachingBuiltin
    ? [...TEACHING_SIMPLE_TOKENS]
    : cairoBuiltin
      ? [...DEFAULT_TOKENS]
      : rawTokens;

  const legacyOk =
    !teachingBuiltin &&
    !cairoBuiltin &&
    !!attentionRows &&
    !!queries &&
    attentionRows.length === tokens.length &&
    queries.length === tokens.length &&
    attentionRows.every((r) => r.scores.length === tokens.length);

  const initialIndex = cairoBuiltin
    ? Math.min(5, tokens.length - 1)
    : Math.min(Math.max(0, defaultSelected), tokens.length - 1);

  const [displayIdx, setDisplayIdx] = useState(initialIndex);
  const [qkvPhase, setQkvPhase] = useState<"idle" | "exit" | "enter">("idle");
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [barPct, setBarPct] = useState<number[]>(() =>
    rowToBarPct(
      teachingBuiltin
        ? TEACHING_SIMPLE_DETAILS[initialIndex]!.scores
        : cairoBuiltin
          ? CAIRO_TOKEN_DETAILS[initialIndex]!.scores
          : legacyOk
            ? attentionRows![initialIndex].scores
            : [],
      tokens.length,
    ),
  );

  const qkv = teachingBuiltin
    ? TEACHING_SIMPLE_DETAILS[displayIdx]
    : cairoBuiltin
    ? CAIRO_TOKEN_DETAILS[displayIdx]
    : legacyOk
      ? {
          q: queries![displayIdx] ?? "",
          k: "What this token advertises to others (its key vector).",
          v: "What meaning this token contributes when blended (its value vector).",
          scores: attentionRows![displayIdx].scores,
          summary: (() => {
            const scores = attentionRows![displayIdx].scores;
            const top = scores
              .map((s, j) => ({ s, j }))
              .filter(({ j }) => j !== displayIdx)
              .sort((a, b) => b.s - a.s)
              .slice(0, 2)
              .map(({ j }) => `"${tokens[j]}"`)
              .join(" and ");
            return `“${tokens[displayIdx]}” attends most to ${top} — capturing the relationships that matter most in context.`;
          })(),
          outputBlend: "A context-aware vector blending information from the attended tokens (simplified view).",
        }
      : null;

  const selectToken = useCallback(
    (i: number) => {
      if (i === displayIdx || qkvPhase !== "idle" || !qkv) return;

      setQkvPhase("exit");
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

      exitTimerRef.current = setTimeout(() => {
        exitTimerRef.current = null;
        const row = teachingBuiltin
          ? TEACHING_SIMPLE_DETAILS[i]!
          : cairoBuiltin
            ? CAIRO_TOKEN_DETAILS[i]!
            : legacyOk
              ? attentionRows![i]
              : null;
        if (row) {
          setBarPct(rowToBarPct(row.scores, tokens.length));
        }
        setDisplayIdx(i);
        setQkvPhase("enter");
      }, 150);
    },
    [displayIdx, qkvPhase, qkv, teachingBuiltin, cairoBuiltin, legacyOk, attentionRows, tokens.length],
  );

  useLayoutEffect(() => {
    if (qkvPhase !== "enter") return;
    let id2: number | undefined;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setQkvPhase("idle"));
    });
    return () => {
      cancelAnimationFrame(id1);
      if (id2 !== undefined) cancelAnimationFrame(id2);
    };
  }, [qkvPhase]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!teachingBuiltin && !cairoBuiltin && !legacyOk) {
      setBarPct(tokens.map(() => 0));
    }
  }, [teachingBuiltin, cairoBuiltin, legacyOk, tokens]);

  const selectedToken = tokens[displayIdx] ?? "";
  const tokenUpper = selectedToken.toUpperCase();
  const attentionEquation = useMemo(() => {
    if (!qkv) return "";
    return tokens
      .map((token, i) => `${(qkv.scores[i] ?? 0).toFixed(2)}·V_${token}`)
      .join(" + ");
  }, [qkv, tokens]);

  const topContributors = useMemo(() => {
    if (!qkv) return [];
    return qkv.scores
      .map((score, i) => ({ token: tokens[i] ?? "", score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [qkv, tokens]);

  const qkvCardClass = cn(
    "grid gap-4 sm:grid-cols-3 md:gap-5",
    qkvPhase === "exit" && "pointer-events-none opacity-0 -translate-y-1.5 transition-[opacity,transform] duration-150 ease-out",
    qkvPhase === "enter" && "opacity-0 -translate-y-1.5",
    qkvPhase === "idle" && "opacity-100 translate-y-0 transition-[opacity,transform] duration-200 ease-out",
  );

  const outputBoxClass = cn(
    "mt-8 rounded-xl border-2 border-gray-200 bg-white/90 p-6 dark:border-gray-600 dark:bg-gray-800/90 md:p-8",
    qkvPhase === "exit" && "pointer-events-none opacity-0 -translate-y-1.5 transition-[opacity,transform] duration-150 ease-out",
    qkvPhase === "enter" && "opacity-0 -translate-y-1.5",
    qkvPhase === "idle" && "opacity-100 translate-y-0 transition-[opacity,transform] duration-200 ease-out",
  );

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-10 dark:border-gray-700 dark:bg-gray-900/40">
      {(title || caption) && (
        <div className="mb-6 space-y-2">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 md:text-xl dark:text-gray-100">
              {title}
            </h2>
          )}
          {caption && (
            <p className="text-base font-medium leading-relaxed text-gray-700 md:text-lg dark:text-gray-200">
              {caption}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 md:gap-4">
        {tokens.map((token, i) => {
          const isSelected = i === displayIdx;
          return (
            <button
              key={`${token}-${i}`}
              type="button"
              onClick={() => selectToken(i)}
              className={cn(
                "rounded-full px-4 py-2.5 text-base font-bold transition-colors md:px-6 md:py-3 md:text-lg",
                isSelected
                  ? "border-2 border-blue-600 bg-blue-500/15 text-blue-800 shadow-sm dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-100"
                  : "border-2 border-gray-300 bg-transparent text-gray-800 hover:border-gray-400 dark:border-gray-500 dark:text-gray-200 dark:hover:border-gray-400",
              )}
            >
              {token}
            </button>
          );
        })}
      </div>

      {qkv ? (
        <>
          <div className={cn("mt-8", qkvCardClass)}>
            <div className="rounded-xl border-2 border-blue-400/70 bg-blue-500/10 p-6 dark:border-blue-500/50 dark:bg-blue-500/15 md:p-8 flex flex-col gap-4 min-h-[160px]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white dark:bg-blue-500 shadow-lg">
                  Q
                </span>
                <span className="text-base font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Query</span>
              </div>
              <p className="text-xl font-bold leading-tight text-gray-900 dark:text-white md:text-2xl">
                {qkv.q}
              </p>
            </div>

            <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-500/10 p-6 dark:border-emerald-400/50 dark:bg-emerald-500/15 md:p-8 flex flex-col gap-4 min-h-[160px]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-lg font-black text-white dark:bg-emerald-500 shadow-lg">
                  K
                </span>
                <span className="text-base font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Key</span>
              </div>
              <p className="text-xl font-bold leading-tight text-gray-900 dark:text-white md:text-2xl">
                {qkv.k}
              </p>
            </div>

            <div className="rounded-xl border-2 border-amber-500/70 bg-amber-400/15 p-6 dark:border-amber-400/55 dark:bg-amber-500/15 md:p-8 flex flex-col gap-4 min-h-[160px]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600 text-lg font-black text-white dark:bg-amber-500 shadow-lg">
                  V
                </span>
                <span className="text-base font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Value</span>
              </div>
              <p className="text-xl font-bold leading-tight text-gray-900 dark:text-white md:text-2xl">
                {qkv.v}
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="mb-6 text-balance text-xl font-black text-gray-900 dark:text-gray-100 md:text-2xl uppercase tracking-tight">
              Q·K scores → softmax → attention weights
            </h3>
            <div className="space-y-6">
              {tokens.map((token, j) => {
                const pct = barPct[j] ?? 0;
                const tag = strengthLabel(pct);
                return (
                  <div key={`${token}-bar-${j}`} className="flex items-center gap-4 sm:gap-6">
                    <span className="w-28 shrink-0 text-right text-xl font-black text-gray-900 dark:text-gray-100 sm:w-32 md:text-2xl">
                      {token}
                    </span>
                    <div className="relative h-9 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 md:h-10">
                      <div
                        className={cn("h-full rounded-full", barClassForPct(pct))}
                        style={{
                          width: `${pct}%`,
                          transition: "width 0.35s ease",
                        }}
                      />
                    </div>
                    <span className={cn("w-20 shrink-0 text-right text-xl font-black tabular-nums md:text-2xl", textClassForPct(pct))}>
                      {pct}%
                    </span>
                    <span className="w-24 shrink-0 text-lg font-black text-gray-700 md:w-32 md:text-xl dark:text-gray-300 uppercase">
                      {tag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={outputBoxClass}>
            <p className="text-base font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Attention Output (Masked)
            </p>
            <p className="rounded-xl bg-gray-100 px-6 py-6 font-mono text-lg leading-relaxed text-gray-900 dark:bg-gray-900 dark:text-gray-100 md:text-2xl shadow-inner border border-gray-200 dark:border-gray-700">
              {`z_${selectedToken} = ${attentionEquation.split(" + ").filter(term => !term.startsWith("0.00")).join(" + ") || "0.00"}`}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
