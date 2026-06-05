"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type AccentColor = "amber" | "teal" | "rose" | "violet" | "blue";

/** Shared running example — same article traced through every stage. */
const ARTICLE_URL = "https://techblog.com/how-attention-works";
const RAW_HTML =
  '<nav>Home</nav><ad>Buy now!</ad><p>Attention is the core mechanism of transformers.</p>';
const CLEAN_TEXT = "Attention is the core mechanism of transformers.";
const SAMPLE_TOKENS = ["Attention", "is", "the", "core", "mechanism", "of", "transform", "ers", "."];
const SAMPLE_IDS = [13746, 318, 262, 4755, 8932, 286, 6123, 364, 13];
const TARGET_TOKENS = ["is", "the", "core", "mechanism", "of", "transform", "ers", ".", "<|end|>"];
const TARGET_IDS = [318, 262, 4755, 8932, 286, 6123, 364, 13, 50256];

export type StageWalkthrough =
  | {
      mode: "text";
      beforeLabel?: string;
      afterLabel?: string;
      before: string;
      after: string;
    }
  | {
      mode: "token-grid";
      beforeLabel?: string;
      afterLabel?: string;
      beforeText?: string;
      tokens: string[];
      ids: number[];
    }
  | {
      mode: "chunk-split";
      streamTokens: string[];
      streamIds: number[];
      chunkIndex: number;
      chunkSize: number;
      totalChunks: string;
    }
  | {
      mode: "input-target";
      inputTokens: string[];
      inputIds: number[];
      targetTokens: string[];
      targetIds: number[];
      highlightPosition?: number;
    }
  | {
      mode: "filter-score";
      document: string;
      score: number;
      threshold: number;
    }
  | {
      mode: "language";
      document: string;
      detected: string;
    }
  | {
      mode: "dedup";
      document: string;
      hash: string;
      kept: boolean;
    }
  | {
      mode: "training-batch";
      batchSize: number;
      pair: {
        inputTokens: string[];
        inputIds: number[];
        targetTokens: string[];
        targetIds: number[];
      };
    }
  | {
      mode: "inference";
      question: string;
      answer: string;
    };

export interface CommonCrawlStage {
  id: string;
  number: number;
  label: string;
  phase: string;
  emoji: string;
  color: AccentColor;
  transform: string;
  walkthrough?: StageWalkthrough;
  verdict?: "pass" | "discard" | "neutral";
}

export interface CommonCrawlPreparationFlowProps {
  title?: string;
  caption?: string;
  stages?: CommonCrawlStage[];
  autoPlayIntervalMs?: number;
}

const ACCENT: Record<
  AccentColor,
  { pill: string; ring: string; bar: string; diagram: string; badge: string }
> = {
  amber: {
    pill: "border-amber-500/70 bg-amber-950/50 text-amber-100",
    ring: "ring-amber-500/35",
    bar: "bg-amber-500",
    diagram: "#f59e0b",
    badge: "bg-amber-500/20 text-amber-200",
  },
  teal: {
    pill: "border-teal-500/70 bg-teal-950/50 text-teal-100",
    ring: "ring-teal-500/35",
    bar: "bg-teal-500",
    diagram: "#14b8a6",
    badge: "bg-teal-500/20 text-teal-200",
  },
  rose: {
    pill: "border-rose-500/70 bg-rose-950/50 text-rose-100",
    ring: "ring-rose-500/35",
    bar: "bg-rose-500",
    diagram: "#f43f5e",
    badge: "bg-rose-500/20 text-rose-200",
  },
  violet: {
    pill: "border-violet-500/70 bg-violet-950/50 text-violet-100",
    ring: "ring-violet-500/35",
    bar: "bg-violet-500",
    diagram: "#8b5cf6",
    badge: "bg-violet-500/20 text-violet-200",
  },
  blue: {
    pill: "border-blue-500/70 bg-blue-950/50 text-blue-100",
    ring: "ring-blue-500/35",
    bar: "bg-blue-500",
    diagram: "#3b82f6",
    badge: "bg-blue-500/20 text-blue-200",
  },
};

const DEFAULT_STAGES: CommonCrawlStage[] = [
  {
    id: "website",
    number: 1,
    label: "Website exists on the internet",
    phase: "Source",
    emoji: "🌍",
    color: "amber",
    transform: "Raw HTML page on the internet",
    walkthrough: {
      mode: "text",
      beforeLabel: "Before",
      afterLabel: "After",
      before: "No copy in any dataset — the page is only on the publisher's server.",
      after: `URL: ${ARTICLE_URL}\n\n${RAW_HTML}`,
    },
    verdict: "neutral",
  },
  {
    id: "crawl",
    number: 2,
    label: "Common Crawl robot visits and saves",
    phase: "Crawl",
    emoji: "🤖",
    color: "amber",
    transform: "WARC archive file (HTML saved by crawler)",
    walkthrough: {
      mode: "text",
      beforeLabel: "Before",
      afterLabel: "After",
      before: `Crawler target:\n${ARTICLE_URL}`,
      after: `WARC record:\n  url: ${ARTICLE_URL}\n  timestamp: 2024-03-15T08:42:11Z\n  payload: ${RAW_HTML}`,
    },
    verdict: "pass",
  },
  {
    id: "extract",
    number: 3,
    label: "HTML extraction",
    phase: "Clean",
    emoji: "✂️",
    color: "teal",
    transform: "Clean plain text (HTML stripped)",
    walkthrough: {
      mode: "text",
      beforeLabel: "Before",
      afterLabel: "After",
      before: RAW_HTML,
      after: CLEAN_TEXT,
    },
    verdict: "pass",
  },
  {
    id: "quality",
    number: 4,
    label: "Quality filtering",
    phase: "Filter",
    emoji: "⭐",
    color: "rose",
    transform: "Filtered text (quality checked)",
    walkthrough: {
      mode: "filter-score",
      document: CLEAN_TEXT,
      score: 0.82,
      threshold: 0.5,
    },
    verdict: "pass",
  },
  {
    id: "language",
    number: 5,
    label: "Language detection",
    phase: "Filter",
    emoji: "🇬🇧",
    color: "rose",
    transform: "Filtered text (language confirmed)",
    walkthrough: {
      mode: "language",
      document: CLEAN_TEXT,
      detected: "English (en)",
    },
    verdict: "pass",
  },
  {
    id: "dedup",
    number: 6,
    label: "Deduplication",
    phase: "Filter",
    emoji: "🔍",
    color: "rose",
    transform: "Unique text (duplicates removed)",
    walkthrough: {
      mode: "dedup",
      document: CLEAN_TEXT,
      hash: "MinHash: a7f3…9c2e",
      kept: true,
    },
    verdict: "pass",
  },
  {
    id: "tokenize",
    number: 7,
    label: "Tokenization",
    phase: "Tokenize",
    emoji: "🔢",
    color: "violet",
    transform: "List of integer token IDs",
    walkthrough: {
      mode: "token-grid",
      beforeLabel: "Before",
      afterLabel: "After",
      beforeText: CLEAN_TEXT,
      tokens: SAMPLE_TOKENS,
      ids: SAMPLE_IDS,
    },
    verdict: "pass",
  },
  {
    id: "chunk",
    number: 8,
    label: "Chunking into sequences",
    phase: "Tokenize",
    emoji: "📦",
    color: "violet",
    transform: "Fixed-length sequences of 2,048 token IDs",
    walkthrough: {
      mode: "chunk-split",
      streamTokens: [...SAMPLE_TOKENS, "…", "billions", "more", "tokens", "…"],
      streamIds: [...SAMPLE_IDS, 999, 8888, 7777, 6666, 5555],
      chunkIndex: 1842,
      chunkSize: 2048,
      totalChunks: "millions",
    },
    verdict: "pass",
  },
  {
    id: "pairs",
    number: 9,
    label: "Training format — input / target pairs",
    phase: "Train prep",
    emoji: "↔️",
    color: "blue",
    transform: "(Input sequence, Target sequence) pairs",
    walkthrough: {
      mode: "input-target",
      inputTokens: SAMPLE_TOKENS,
      inputIds: SAMPLE_IDS,
      targetTokens: TARGET_TOKENS,
      targetIds: TARGET_IDS,
      highlightPosition: 3,
    },
    verdict: "pass",
  },
  {
    id: "train",
    number: 10,
    label: "Model training",
    phase: "Train",
    emoji: "🧠",
    color: "blue",
    transform: "Trained model weights",
    walkthrough: {
      mode: "training-batch",
      batchSize: 512,
      pair: {
        inputTokens: SAMPLE_TOKENS.slice(0, 6),
        inputIds: SAMPLE_IDS.slice(0, 6),
        targetTokens: TARGET_TOKENS.slice(0, 6),
        targetIds: TARGET_IDS.slice(0, 6),
      },
    },
    verdict: "pass",
  },
  {
    id: "user",
    number: 11,
    label: "User asks a question",
    phase: "Inference",
    emoji: "💬",
    color: "teal",
    transform: "Generated answer from learned weights",
    walkthrough: {
      mode: "inference",
      question: "What is the core mechanism of transformers?",
      answer:
        "Attention is the core mechanism — it lets each token weigh every other token when building its representation.",
    },
    verdict: "neutral",
  },
];

function TokenGrid({
  tokens,
  ids,
  label,
  highlightIndex,
  accent = "violet",
  size = "default",
}: {
  tokens: string[];
  ids: number[];
  label?: string;
  highlightIndex?: number;
  accent?: AccentColor;
  size?: "default" | "hero";
}) {
  const isHero = size === "hero";

  return (
    <div className="space-y-3">
      {label ? (
        <p
          className={cn(
            "font-bold text-gray-200",
            isHero ? "text-lg md:text-xl" : "text-base md:text-lg",
          )}
        >
          {label}
        </p>
      ) : null}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full gap-2.5 md:gap-3">
          {tokens.map((token, i) => {
            const highlighted = highlightIndex === i;
            return (
              <div
                key={`${token}-${i}`}
                className={cn(
                  "flex flex-col items-center rounded-xl border-2",
                  isHero
                    ? "min-w-[5.5rem] px-3 py-4 md:min-w-[6.5rem] md:px-4 md:py-5"
                    : "min-w-[5rem] px-2.5 py-3 md:min-w-[5.75rem] md:px-3 md:py-4",
                  highlighted
                    ? cn("border-amber-400 bg-amber-950/40 ring-2 ring-amber-500/40")
                    : "border-gray-600 bg-gray-900/80",
                )}
              >
                <span
                  className={cn(
                    "text-center font-semibold leading-tight text-white",
                    isHero ? "text-xl md:text-2xl" : "text-lg md:text-xl",
                  )}
                >
                  {token}
                </span>
                <span
                  className={cn(
                    "mt-2 font-mono font-bold",
                    isHero ? "text-lg md:text-xl" : "text-base md:text-lg",
                    highlighted
                      ? "text-amber-300"
                      : accent === "blue"
                        ? "text-blue-300"
                        : accent === "teal"
                          ? "text-teal-300"
                          : "text-violet-300",
                  )}
                >
                  {ids[i] ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BeforeAfterPanel({
  beforeLabel = "Before",
  afterLabel = "After",
  before,
  after,
}: {
  beforeLabel?: string;
  afterLabel?: string;
  before: ReactNode;
  after: ReactNode;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="rounded-2xl border-2 border-rose-500/35 bg-gray-950/90 p-6 md:p-8">
        <p className="text-lg font-bold uppercase tracking-wide text-rose-200 md:text-xl">{beforeLabel}</p>
        <div className="mt-5">{before}</div>
      </div>
      <div className="rounded-2xl border-2 border-teal-500/35 bg-gray-950/90 p-6 md:p-8">
        <p className="text-lg font-bold uppercase tracking-wide text-teal-200 md:text-xl">{afterLabel}</p>
        <div className="mt-5">{after}</div>
      </div>
    </div>
  );
}

function WalkthroughPanel({ walkthrough }: { walkthrough: StageWalkthrough }) {
  const textBody = "whitespace-pre-wrap break-words text-xl leading-relaxed text-gray-100 md:text-2xl";
  const monoBody = cn(textBody, "font-mono text-lg md:text-xl");

  if (walkthrough.mode === "text") {
    return (
      <BeforeAfterPanel
        beforeLabel={walkthrough.beforeLabel}
        afterLabel={walkthrough.afterLabel}
        before={<p className={monoBody}>{walkthrough.before}</p>}
        after={<p className={monoBody}>{walkthrough.after}</p>}
      />
    );
  }

  if (walkthrough.mode === "token-grid") {
    return (
      <BeforeAfterPanel
        beforeLabel={walkthrough.beforeLabel}
        afterLabel={walkthrough.afterLabel}
        before={<p className={textBody}>{walkthrough.beforeText}</p>}
        after={<TokenGrid tokens={walkthrough.tokens} ids={walkthrough.ids} accent="violet" size="hero" />}
      />
    );
  }

  if (walkthrough.mode === "chunk-split") {
    const previewLen = Math.min(6, walkthrough.streamTokens.length);
    return (
      <BeforeAfterPanel
        before={
          <>
            <p className={textBody}>All documents merged into one flat token stream.</p>
            <div className="mt-5">
              <TokenGrid
                tokens={walkthrough.streamTokens.slice(0, previewLen)}
                ids={walkthrough.streamIds.slice(0, previewLen)}
                accent="violet"
                size="hero"
              />
              <p className="mt-4 text-lg font-semibold text-gray-300 md:text-xl">… trillions more tokens …</p>
            </div>
          </>
        }
        after={
          <>
            <p className={textBody}>
              Sequence #{walkthrough.chunkIndex.toLocaleString()} · {walkthrough.chunkSize.toLocaleString()} tokens ·{" "}
              {walkthrough.totalChunks} of these
            </p>
            <div className="mt-5">
              <TokenGrid
                tokens={walkthrough.streamTokens.slice(0, previewLen)}
                ids={walkthrough.streamIds.slice(0, previewLen)}
                accent="violet"
                size="hero"
              />
              <p className="mt-4 text-lg font-semibold text-violet-200 md:text-xl">
                … + {(walkthrough.chunkSize - previewLen).toLocaleString()} more in this chunk
              </p>
            </div>
          </>
        }
      />
    );
  }

  if (walkthrough.mode === "input-target") {
    const hi = walkthrough.highlightPosition ?? 3;
    return (
      <BeforeAfterPanel
        before={
          <TokenGrid
            tokens={walkthrough.inputTokens}
            ids={walkthrough.inputIds}
            accent="blue"
            size="hero"
          />
        }
        after={
          <>
            <TokenGrid
              tokens={walkthrough.targetTokens}
              ids={walkthrough.targetIds}
              accent="teal"
              size="hero"
            />
            <p className="mt-5 text-lg leading-relaxed text-gray-200 md:text-xl">
              Shift +1 — after{" "}
              <span className="font-semibold text-white">
                {walkthrough.inputTokens.slice(0, hi + 1).join(" ")}
              </span>
              , predict{" "}
              <span className="font-bold text-teal-300">
                {walkthrough.targetTokens[hi]} (ID {walkthrough.targetIds[hi]})
              </span>
            </p>
          </>
        }
      />
    );
  }

  if (walkthrough.mode === "filter-score") {
    const pass = walkthrough.score > walkthrough.threshold;
    return (
      <BeforeAfterPanel
        before={<p className={textBody}>{walkthrough.document}</p>}
        after={
          <>
            <p className="text-4xl font-bold text-white md:text-5xl">{walkthrough.score.toFixed(2)}</p>
            <p className="mt-3 text-xl text-gray-200 md:text-2xl">
              Threshold {walkthrough.threshold} → {pass ? "✅ kept" : "❌ discarded"}
            </p>
          </>
        }
      />
    );
  }

  if (walkthrough.mode === "language") {
    return (
      <BeforeAfterPanel
        before={<p className={textBody}>{walkthrough.document}</p>}
        after={
          <>
            <p className="text-3xl font-bold text-white md:text-4xl">{walkthrough.detected}</p>
            <p className="mt-3 text-xl text-teal-300 md:text-2xl">✅ English — document kept</p>
          </>
        }
      />
    );
  }

  if (walkthrough.mode === "dedup") {
    return (
      <BeforeAfterPanel
        before={
          <>
            <p className={textBody}>{walkthrough.document}</p>
            <p className="mt-4 font-mono text-lg text-gray-300 md:text-xl">{walkthrough.hash}</p>
          </>
        }
        after={
          <p className={textBody}>
            {walkthrough.kept
              ? "✅ No near-duplicate found — document is unique and kept."
              : "❌ Near-duplicate of an earlier page — discarded."}
          </p>
        }
      />
    );
  }

  if (walkthrough.mode === "training-batch") {
    return (
      <BeforeAfterPanel
        before={
          <TokenGrid
            tokens={walkthrough.pair.inputTokens}
            ids={walkthrough.pair.inputIds}
            accent="blue"
            size="hero"
          />
        }
        after={
          <>
            <TokenGrid
              tokens={walkthrough.pair.targetTokens}
              ids={walkthrough.pair.targetIds}
              accent="teal"
              size="hero"
            />
            <p className="mt-5 text-lg text-gray-200 md:text-xl">
              × {walkthrough.batchSize} pairs per batch → predict, compare loss, update weights
            </p>
          </>
        }
      />
    );
  }

  return (
    <BeforeAfterPanel
      before={<p className={textBody}>{walkthrough.question}</p>}
      after={<p className={textBody}>{walkthrough.answer}</p>}
    />
  );
}

export default function CommonCrawlPreparationFlow({
  title = "Common Crawl — from one web page to trained weights",
  caption = "Step through all 10 preparation stages, then see how a user question uses the learned weights.",
  stages = DEFAULT_STAGES,
  autoPlayIntervalMs = 2800,
}: CommonCrawlPreparationFlowProps) {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stage = stages[current];
  const tone = ACCENT[stage.color];
  const isLast = current === stages.length - 1;

  const go = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(stages.length - 1, index)));
  }, [stages.length]);

  const stepForward = useCallback(() => {
    if (current < stages.length - 1) {
      go(current + 1);
    } else {
      setPlaying(false);
    }
  }, [current, stages.length, go]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(stepForward, autoPlayIntervalMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, current, stepForward, autoPlayIntervalMs]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-700 bg-gray-900 p-6 md:p-10"
      data-local-navigation="true"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-100 md:text-2xl">{title}</h2>
        {caption ? <p className="text-lg text-gray-300 md:text-xl">{caption}</p> : null}
      </div>

      {/* Progress strip */}
      <div className="mt-6 overflow-x-auto md:mt-8">
        <div className="flex min-w-max gap-2 pb-1">
          {stages.map((s, i) => {
            const isActive = i === current;
            const isPast = i < current;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  go(i);
                }}
                className={cn(
                  "flex min-w-[3.25rem] flex-col items-center rounded-xl border-2 px-2 py-2 transition md:min-w-[3.75rem] md:px-3 md:py-2.5",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                  isActive
                    ? cn("ring-2", ACCENT[s.color].pill, ACCENT[s.color].ring)
                    : isPast
                      ? "border-teal-600/50 bg-teal-950/30 text-teal-200"
                      : "border-gray-700 bg-gray-950/50 text-gray-400 hover:border-gray-600",
                )}
                aria-label={`Stage ${s.number}: ${s.label}`}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="text-base font-bold md:text-lg">{s.number}</span>
                <span className="mt-0.5 text-lg md:text-xl" aria-hidden>
                  {s.emoji}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-800">
          <motion.div
            className={cn("h-full rounded-full", tone.bar)}
            animate={{ width: `${((current + 1) / stages.length) * 100}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Active stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={reducedMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
          className="mt-6 space-y-5 md:mt-8 md:space-y-6"
        >
          <div className="flex flex-wrap items-start gap-4">
            <span className="text-4xl md:text-5xl" aria-hidden>
              {stage.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("rounded-full px-3 py-1 text-base font-bold md:text-lg", tone.badge)}>
                  Stage {stage.number} · {stage.phase}
                </span>
                {stage.verdict === "pass" ? (
                  <span className="text-xl font-bold text-emerald-400 md:text-2xl">✅ Pass</span>
                ) : null}
                {stage.verdict === "discard" ? (
                  <span className="text-xl font-bold text-rose-400 md:text-2xl">❌ Discard</span>
                ) : null}
              </div>
              <h3 className="mt-2 text-2xl font-bold text-white md:text-3xl">{stage.label}</h3>
            </div>
          </div>

          {stage.walkthrough ? <WalkthroughPanel walkthrough={stage.walkthrough} /> : null}

          <div className="rounded-2xl border-2 border-violet-500/40 bg-violet-950/25 p-6 md:p-8">
            <p className="text-lg font-bold uppercase tracking-wide text-violet-200 md:text-xl">
              Data at this stage
            </p>
            <p className="mt-3 text-2xl font-semibold text-white md:text-3xl">{stage.transform}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
        <button
          type="button"
          disabled={current === 0}
          onClick={() => {
            setPlaying(false);
            go(current - 1);
          }}
          className="flex min-h-11 items-center gap-2 rounded-xl border-2 border-gray-600 bg-gray-950 px-5 py-3 text-base font-bold text-gray-100 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30 md:min-h-12 md:px-6 md:text-lg"
        >
          ← Prev
        </button>

        <button
          type="button"
          onClick={() => {
            if (playing) {
              setPlaying(false);
            } else {
              if (isLast) go(0);
              setPlaying(true);
            }
          }}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition md:min-h-12 md:px-6 md:text-lg",
            playing
              ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
              : "bg-violet-600 text-white hover:bg-violet-500",
          )}
        >
          {playing ? "⏸ Pause" : isLast ? "↩ Replay" : "▶ Play"}
        </button>

        <button
          type="button"
          disabled={isLast}
          onClick={() => {
            setPlaying(false);
            stepForward();
          }}
          className="flex min-h-11 items-center gap-2 rounded-xl border-2 border-gray-600 bg-gray-950 px-5 py-3 text-base font-bold text-gray-100 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30 md:min-h-12 md:px-6 md:text-lg"
        >
          Next →
        </button>

        <span className="ml-auto text-base font-semibold text-gray-300 md:text-lg">
          Step {current + 1} of {stages.length}
        </span>
      </div>
    </motion.div>
  );
}
