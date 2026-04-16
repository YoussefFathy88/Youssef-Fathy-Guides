"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_TOKENS = ["The", "capital", "of", "Egypt", "is", "Cairo"] as const;

/** Legacy MDX example — map to built-in Cairo dataset so the session stays consistent. */
const LEGACY_CAT_TOKENS = ["The", "cat", "sat", "on", "the", "mat"] as const;

const CAIRO_TOKEN_DETAILS: ReadonlyArray<{
  q: string;
  k: string;
  v: string;
  scores: readonly number[];
  summary: string;
  outputBlend: string;
}> = [
  {
    q: "Which noun or concept follows this article?",
    k: "I am a definite article — I mark the next noun as specific and unique",
    v: "I contribute: definiteness, uniqueness, 'the one and only'",
    scores: [0.06, 0.42, 0.05, 0.1, 0.08, 0.29],
    summary:
      '"The" attends most to "capital" (42%) — it needs to know which specific noun it introduces.',
    outputBlend:
      'Blended vector carries: definiteness from "The" + geographic concept from "capital" + city name from "Cairo"',
  },
  {
    q: "What country do I belong to? What city am I equal to?",
    k: "I am a geographic noun — I represent a seat-of-government concept",
    v: "I contribute: political center, main city, seat-of-government meaning",
    scores: [0.07, 0.1, 0.06, 0.38, 0.05, 0.34],
    summary:
      '"capital" attends most to "Egypt" (38%) and "Cairo" (34%) — anchoring itself to its country and its answer.',
    outputBlend:
      'Blended vector carries: capital-city concept from "capital" + country identity from "Egypt" + answer from "Cairo"',
  },
  {
    q: "What two things am I linking — what is the owner and what is owned?",
    k: "I am a preposition — I signal a belonging or possession relationship",
    v: "I contribute: possession link, the 'belongs-to' relationship signal",
    scores: [0.04, 0.3, 0.06, 0.42, 0.07, 0.11],
    summary:
      '"of" attends most to "Egypt" (42%) and "capital" (30%) — it needs both sides of the relationship it expresses.',
    outputBlend:
      'Blended vector carries: relational signal from "of" + country from "Egypt" + subject from "capital"',
  },
  {
    q: "What is my capital city? How do I fit into this sentence?",
    k: "I am a country proper noun — I represent a nation in North Africa",
    v: "I contribute: Egypt as a country, North Africa, Arab world context",
    scores: [0.05, 0.28, 0.07, 0.08, 0.06, 0.46],
    summary:
      '"Egypt" attends most to "Cairo" (46%) and "capital" (28%) — confirming Cairo as its capital.',
    outputBlend:
      'Blended vector carries: country identity from "Egypt" + capital relationship from "capital" + city answer from "Cairo"',
  },
  {
    q: "What subject and what predicate am I connecting as equal?",
    k: "I am a copula verb — I assert that two things are identical or equivalent",
    v: "I contribute: the equality assertion, present-tense state, identity link",
    scores: [0.05, 0.34, 0.04, 0.18, 0.07, 0.32],
    summary:
      '"is" attends most to "capital" (34%) and "Cairo" (32%) — the two things it declares equal.',
    outputBlend:
      'Blended vector carries: equality signal from "is" + left-side subject from "capital" + right-side answer from "Cairo"',
  },
  {
    q: "What place am I? Whose capital am I? What country owns me?",
    k: "I am a city proper noun — I represent the capital city of Egypt",
    v: "I contribute: Cairo as a city, capital status, Egyptian identity",
    scores: [0.05, 0.3, 0.05, 0.38, 0.07, 0.15],
    summary:
      '"Cairo" attends most to "Egypt" (38%) and "capital" (30%) — grounding itself as Egypt\'s capital.',
    outputBlend:
      'Blended vector carries: city identity from "Cairo" + country context from "Egypt" + role from "capital"',
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
  /** Used when `tokens` is not the Cairo (or legacy cat) sentence. */
  queries?: string[];
  attentionRows?: AttentionScoreRow[];
}

function isCairoTokens(tokens: readonly string[]): boolean {
  if (tokens.length !== DEFAULT_TOKENS.length) return false;
  return DEFAULT_TOKENS.every((t, i) => tokens[i] === t);
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

  const cairoBuiltin =
    rawTokens.length === 0 ||
    isCairoTokens(rawTokens) ||
    isLegacyCatTokens(rawTokens);

  const tokens = cairoBuiltin ? [...DEFAULT_TOKENS] : rawTokens;

  const legacyOk =
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
      cairoBuiltin ? CAIRO_TOKEN_DETAILS[initialIndex]!.scores : legacyOk ? attentionRows![initialIndex].scores : [],
      tokens.length,
    ),
  );

  const qkv = cairoBuiltin
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
        const row = cairoBuiltin
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
    [displayIdx, qkvPhase, qkv, cairoBuiltin, legacyOk, attentionRows, tokens.length],
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
    if (!cairoBuiltin && !legacyOk) {
      setBarPct(tokens.map(() => 0));
    }
  }, [cairoBuiltin, legacyOk, tokens]);

  const selectedToken = tokens[displayIdx] ?? "";
  const tokenUpper = selectedToken.toUpperCase();

  const qkvCardClass = cn(
    "grid gap-3 sm:grid-cols-3",
    qkvPhase === "exit" && "pointer-events-none opacity-0 -translate-y-1.5 transition-[opacity,transform] duration-150 ease-out",
    qkvPhase === "enter" && "opacity-0 -translate-y-1.5",
    qkvPhase === "idle" && "opacity-100 translate-y-0 transition-[opacity,transform] duration-200 ease-out",
  );

  const outputBoxClass = cn(
    "mt-6 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-600 dark:bg-gray-800/80",
    qkvPhase === "exit" && "pointer-events-none opacity-0 -translate-y-1.5 transition-[opacity,transform] duration-150 ease-out",
    qkvPhase === "enter" && "opacity-0 -translate-y-1.5",
    qkvPhase === "idle" && "opacity-100 translate-y-0 transition-[opacity,transform] duration-200 ease-out",
  );

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/40">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tokens.map((token, i) => {
          const isSelected = i === displayIdx;
          return (
            <button
              key={`${token}-${i}`}
              type="button"
              onClick={() => selectToken(i)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors md:text-sm",
                isSelected
                  ? "border-2 border-blue-600 bg-blue-500/15 text-blue-700 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-200"
                  : "border border-gray-300 bg-transparent text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500",
              )}
            >
              {token}
            </button>
          );
        })}
      </div>

      {!qkv && (
        <p className="mt-4 text-xs text-amber-800 dark:text-amber-200">
          Pass matching <code>queries</code> and <code>attentionRows</code> for your tokens, or use the default Cairo
          sentence.
        </p>
      )}

      {qkv && (
        <>
          <div className={cn("mt-6", qkvCardClass)}>
            <div className="rounded-xl border-2 border-blue-400/70 bg-blue-500/10 p-4 dark:border-blue-500/50 dark:bg-blue-500/15">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
                  Q
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Query</span>
              </div>
              <p className="text-sm leading-snug text-gray-800 dark:text-gray-200">{qkv.q}</p>
            </div>

            <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-500/10 p-4 dark:border-emerald-400/50 dark:bg-emerald-500/15">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold text-white dark:bg-emerald-500">
                  K
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Key</span>
              </div>
              <p className="text-sm leading-snug text-gray-800 dark:text-gray-200">{qkv.k}</p>
            </div>

            <div className="rounded-xl border-2 border-amber-500/70 bg-amber-400/15 p-4 dark:border-amber-400/55 dark:bg-amber-500/15">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-600 text-xs font-bold text-white dark:bg-amber-500">
                  V
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Value</span>
              </div>
              <p className="text-sm leading-snug text-gray-800 dark:text-gray-200">{qkv.v}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              Q·K scores → softmax → attention weights (how much &ldquo;{selectedToken}&rdquo; attends to each token)
            </h3>
            <div className="space-y-2.5">
              {tokens.map((token, j) => {
                const pct = barPct[j] ?? 0;
                const tag = strengthLabel(pct);
                return (
                  <div key={`${token}-bar-${j}`} className="flex items-center gap-2 sm:gap-3">
                    <span className="w-16 shrink-0 text-right text-xs font-medium text-gray-700 dark:text-gray-300 sm:w-20">
                      {token}
                    </span>
                    <div className="relative h-5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={cn("h-full rounded-full", barClassForPct(pct))}
                        style={{
                          width: `${pct}%`,
                          transition: "width 0.35s ease",
                        }}
                      />
                    </div>
                    <span className={cn("w-10 shrink-0 text-right text-xs font-semibold", textClassForPct(pct))}>
                      {pct}%
                    </span>
                    <span className="w-16 shrink-0 text-[11px] font-medium text-gray-500 dark:text-gray-400">{tag}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={outputBoxClass}>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              OUTPUT FOR &ldquo;{tokenUpper}&rdquo;
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200">{qkv.summary}</p>
            <p className="mt-3 text-sm font-bold text-gray-900 dark:text-gray-100">{qkv.outputBlend}</p>
          </div>
        </>
      )}
    </div>
  );
}
