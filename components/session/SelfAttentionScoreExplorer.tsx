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
    q: "Which noun am I glued to?",
    k: "I'm \"The\" — I mean one specific thing, not any random thing.",
    v: "If I'm blended in, I add \"that exact one\" flavor.",
    scores: [0.06, 0.42, 0.05, 0.1, 0.08, 0.29],
    summary: "Biggest weight on \"capital\" (42%) — finds the noun right after me.",
    outputBlend: "Mostly pulls in \"capital\" so my meaning locks onto that word.",
  },
  {
    q: "Which country — and which city — finish my meaning?",
    k: "I'm \"capital\" — the main city of a country.",
    v: "If I'm blended in, I add capital-city flavor.",
    scores: [0.07, 0.1, 0.06, 0.38, 0.05, 0.34],
    summary: "Strong pulls on \"Egypt\" (38%) and \"Cairo\" (34%).",
    outputBlend: "Mixes country + answer city into the capital idea.",
  },
  {
    q: "What two chunks does \"of\" connect?",
    k: "I'm \"of\" — a tiny word that links two ideas.",
    v: "If I'm blended in, I add \"belongs with\" flavor.",
    scores: [0.04, 0.3, 0.06, 0.42, 0.07, 0.11],
    summary: "Heavy on \"Egypt\" (42%) and \"capital\" (30%) — both sides of the phrase.",
    outputBlend: "Hooks country to the capital phrase.",
  },
  {
    q: "Which city is my capital here?",
    k: "I'm \"Egypt\" — the country.",
    v: "If I'm blended in, I add plain country meaning.",
    scores: [0.05, 0.28, 0.07, 0.08, 0.06, 0.46],
    summary: "Strongest on \"Cairo\" (46%), then \"capital\" (28%).",
    outputBlend: "Country meaning plus capital hint plus the city name.",
  },
  {
    q: "What two pieces am I saying match?",
    k: "I'm \"is\" — like an equals sign in words.",
    v: "If I'm blended in, I add \"these two line up\" flavor.",
    scores: [0.05, 0.34, 0.04, 0.18, 0.07, 0.32],
    summary: "Split between \"capital\" (34%) and \"Cairo\" (32%).",
    outputBlend: "Links the left phrase to the answer city.",
  },
  {
    q: "Which country names me?",
    k: "I'm \"Cairo\" — the city.",
    v: "If I'm blended in, I add city flavor.",
    scores: [0.05, 0.3, 0.05, 0.38, 0.07, 0.15],
    summary: "Strong pulls on \"Egypt\" (38%) and \"capital\" (30%).",
    outputBlend: "City identity wired to country + capital role.",
  },
];

export interface AttentionScoreRow {
  token: string;
  scores: number[];
}

export interface SelfAttentionScoreExplorerProps {
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

function strengthLabel(pct: number): "Strong" | "Moderate" | "Weak" {
  if (pct >= 30) return "Strong";
  if (pct >= 15) return "Moderate";
  return "Weak";
}

function barClassForPct(pct: number): string {
  if (pct >= 30) return "bg-blue-600 dark:bg-blue-400";
  if (pct >= 15) return "bg-amber-500 dark:bg-amber-400";
  return "bg-gray-400 dark:bg-gray-500";
}

function textClassForPct(pct: number): string {
  if (pct >= 30) return "text-blue-600 dark:text-blue-400";
  if (pct >= 15) return "text-amber-600 dark:text-amber-400";
  return "text-gray-500 dark:text-gray-400";
}

function rowToBarPct(scores: readonly number[], len: number): number[] {
  return Array.from({ length: len }, (_, j) => Math.round((scores[j] ?? 0) * 100));
}

export default function SelfAttentionScoreExplorer({
  title,
  caption,
  tokens: tokensProp,
  defaultSelected = 5,
  queries,
  attentionRows,
}: SelfAttentionScoreExplorerProps) {
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
            <div className="rounded-xl border-2 border-blue-400/70 bg-blue-500/10 p-5 dark:border-blue-500/50 dark:bg-blue-500/15 md:p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-base font-bold text-white dark:bg-blue-500 md:h-11 md:w-11 md:text-lg">
                  Q
                </span>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 md:text-lg">Query</span>
              </div>
              <p className="text-base font-medium leading-relaxed text-gray-800 md:text-lg dark:text-gray-100">
                {qkv.q}
              </p>
            </div>

            <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-500/10 p-5 dark:border-emerald-400/50 dark:bg-emerald-500/15 md:p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-base font-bold text-white dark:bg-emerald-500 md:h-11 md:w-11 md:text-lg">
                  K
                </span>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 md:text-lg">Key</span>
              </div>
              <p className="text-base font-medium leading-relaxed text-gray-800 md:text-lg dark:text-gray-100">
                {qkv.k}
              </p>
            </div>

            <div className="rounded-xl border-2 border-amber-500/70 bg-amber-400/15 p-5 dark:border-amber-400/55 dark:bg-amber-500/15 md:p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600 text-base font-bold text-white dark:bg-amber-500 md:h-11 md:w-11 md:text-lg">
                  V
                </span>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 md:text-lg">Value</span>
              </div>
              <p className="text-base font-medium leading-relaxed text-gray-800 md:text-lg dark:text-gray-100">
                {qkv.v}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="mb-4 text-balance text-base font-bold text-gray-900 dark:text-gray-100 md:text-lg">
              Q·K scores → softmax → attention weights (how much &ldquo;{selectedToken}&rdquo; attends to each token)
            </h3>
            <div className="space-y-4">
              {tokens.map((token, j) => {
                const pct = barPct[j] ?? 0;
                const tag = strengthLabel(pct);
                return (
                  <div key={`${token}-bar-${j}`} className="flex items-center gap-3 sm:gap-4">
                    <span className="w-24 shrink-0 text-right text-base font-bold text-gray-900 dark:text-gray-100 sm:w-28 md:text-lg">
                      {token}
                    </span>
                    <div className="relative h-7 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 md:h-8">
                      <div
                        className={cn("h-full rounded-full", barClassForPct(pct))}
                        style={{
                          width: `${pct}%`,
                          transition: "width 0.35s ease",
                        }}
                      />
                    </div>
                    <span className={cn("w-14 shrink-0 text-right text-base font-bold tabular-nums md:text-lg", textClassForPct(pct))}>
                      {pct}%
                    </span>
                    <span className="w-20 shrink-0 text-base font-bold text-gray-700 md:w-24 md:text-lg dark:text-gray-200">
                      {tag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={outputBoxClass}>
            <p className="text-base font-bold uppercase tracking-wide text-gray-800 md:text-lg dark:text-gray-200">
              OUTPUT FOR &ldquo;{tokenUpper}&rdquo;
            </p>
            <p className="mt-4 text-base font-bold uppercase tracking-wide text-gray-700 md:text-lg dark:text-gray-300">
              Real attention output (simplified)
            </p>
            <p className="mt-2 rounded-lg bg-gray-100 px-3 py-2.5 font-mono text-lg leading-relaxed text-gray-900 dark:bg-gray-900/70 dark:text-gray-100 md:px-4 md:py-3 md:text-2xl">
              {`z_${selectedToken} = ${attentionEquation}`}
            </p>
            <p className="mt-2 text-base font-medium leading-relaxed text-gray-800 md:text-lg dark:text-gray-200">
              Top contributors:{" "}
              {topContributors.map((item) => `${item.token} (${Math.round(item.score * 100)}%)`).join(", ")}
            </p>
            <p className="mt-3 text-base font-medium leading-relaxed text-gray-900 md:text-lg dark:text-gray-100">
              {qkv.summary}
            </p>
            <p className="mt-4 text-base font-bold leading-relaxed text-gray-950 md:text-lg dark:text-white">
              {qkv.outputBlend}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
