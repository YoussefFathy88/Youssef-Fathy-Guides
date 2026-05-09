"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type EncoderIllustrationFocus =
  | "overview"
  | "self"
  | "heads"
  | "ffn"
  | "residual"
  | "layers";

export type DecoderIllustrationFocus =
  | "overview"
  | "masked"
  | "cross"
  | "ffn"
  | "residual"
  | "layers";

function usePulseIndex(len: number, reducedMotion: boolean, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion || len <= 1) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % len), ms);
    return () => window.clearInterval(t);
  }, [len, reducedMotion, ms]);
  return i;
}

function barRow(
  label: string,
  pct: number,
  tone: string,
  delay: number,
  reducedMotion: boolean,
) {
  return (
    <div className="space-y-1.5">
      <div className="text-base font-medium text-slate-300 md:text-lg">{label}</div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          className={cn("h-full rounded-full", tone)}
          initial={reducedMotion ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : delay }}
        />
      </div>
    </div>
  );
}

function OverviewEncoderMini({ reducedMotion }: { reducedMotion: boolean }) {
  const steps = ["in", "mha", "n1", "ffn", "n2"] as const;
  const i = usePulseIndex(steps.length, reducedMotion, 900);
  const labels: Record<string, string> = {
    in: "Input",
    mha: "Self-attn",
    n1: "Add+Norm",
    ffn: "FFN",
    n2: "Add+Norm",
  };
  return (
    <div className="flex flex-col-reverse items-stretch gap-2 py-2">
      <p className="mb-1 text-center text-base text-slate-300 md:text-lg">
        Pulse follows data upward through one layer
      </p>
      {steps.map((id, idx) => (
        <motion.div
          key={id}
          className={cn(
            "rounded-lg border px-3 py-2 text-center text-base font-semibold md:text-lg",
            id === "in" && "border-white/10 bg-white/[0.06] text-slate-200",
            id === "mha" &&
              "border-[color:var(--purple)]/25 bg-[color:var(--purple)]/12 text-[color:var(--purple)]",
            (id === "n1" || id === "n2") &&
              "border-[color:var(--success)]/25 bg-[color:var(--success)]/10 text-[color:var(--success)]",
            id === "ffn" &&
              "border-[color:var(--warning)]/25 bg-[color:var(--warning)]/12 text-[color:var(--warning)]",
          )}
          animate={{
            opacity: reducedMotion ? 1 : i === idx ? 1 : 0.38,
            scale: reducedMotion ? 1 : i === idx ? 1.02 : 1,
          }}
          transition={{ duration: 0.25 }}
        >
          {labels[id]}
        </motion.div>
      ))}
    </div>
  );
}

function OverviewDecoderMini({ reducedMotion }: { reducedMotion: boolean }) {
  const steps = ["in", "ms", "n1", "cr", "n2", "ffn", "n3"] as const;
  const i = usePulseIndex(steps.length, reducedMotion, 850);
  const labels: Record<string, string> = {
    in: "Input",
    ms: "Masked",
    n1: "+N",
    cr: "Cross",
    n2: "+N",
    ffn: "FFN",
    n3: "+N",
  };
  return (
    <div className="flex flex-col-reverse items-stretch gap-2 py-2">
      <p className="mb-1 text-center text-base text-slate-300 md:text-lg">
        Mask, cross-attend, FFN — residuals at each step
      </p>
      {steps.map((id, idx) => (
        <motion.div
          key={id}
          className={cn(
            "rounded-lg border px-3 py-2 text-center text-base font-semibold md:text-lg",
            id === "in" && "border-white/10 bg-white/[0.06] text-slate-200",
            (id === "ms" || id === "cr") &&
              "border-[color:var(--purple)]/25 bg-[color:var(--purple)]/12 text-[color:var(--purple)]",
            (id === "n1" || id === "n2" || id === "n3") &&
              "border-[color:var(--success)]/25 bg-[color:var(--success)]/10 text-[color:var(--success)]",
            id === "ffn" &&
              "border-[color:var(--warning)]/25 bg-[color:var(--warning)]/12 text-[color:var(--warning)]",
          )}
          animate={{
            opacity: reducedMotion ? 1 : i === idx ? 1 : 0.35,
            scale: reducedMotion ? 1 : i === idx ? 1.02 : 1,
          }}
          transition={{ duration: 0.22 }}
        >
          {labels[id]}
        </motion.div>
      ))}
    </div>
  );
}

/** Demo attention weights per query row (rows sum to 1) — matches SelfAttentionScoreExplorer Cairo built-in scores. */
const SELF_ATTN_TOKENS = ["The", "capital", "of", "Egypt", "is", "Cairo"] as const;
const SELF_ATTN_WEIGHTS: number[][] = [
  [0.06, 0.42, 0.05, 0.1, 0.08, 0.29],
  [0.07, 0.1, 0.06, 0.38, 0.05, 0.34],
  [0.04, 0.3, 0.06, 0.42, 0.07, 0.11],
  [0.05, 0.28, 0.07, 0.08, 0.06, 0.46],
  [0.05, 0.34, 0.04, 0.18, 0.07, 0.32],
  [0.05, 0.3, 0.05, 0.38, 0.07, 0.15],
];

function SelfAttentionMini({
  reducedMotion,
  onGoMultiHead,
}: {
  reducedMotion: boolean;
  onGoMultiHead?: () => void;
}) {
  const n = SELF_ATTN_TOKENS.length;
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setT((x) => (x + 1) % n), 2200);
    return () => window.clearInterval(id);
  }, [reducedMotion, n]);

  const vbW = 468;
  const vbH = 148;
  const cx = (i: number) => 36 + i * 72;
  const tokenY = 118;
  const queryY = 36;
  const row = SELF_ATTN_WEIGHTS[t] ?? SELF_ATTN_WEIGHTS[0];

  return (
    <div className="flex w-full flex-col items-center gap-4 py-1">
      <p className="text-center text-base text-slate-200 md:text-lg">
        <span className="font-semibold text-[color:var(--purple)]">Q</span> at{" "}
        <span className="font-semibold text-white">{SELF_ATTN_TOKENS[t]}</span>
        <span className="text-slate-400"> — line thickness ≈ attention weight to each key</span>
      </p>

      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="h-auto w-full max-w-[min(100%,468px)] text-[color:var(--purple)]"
        role="img"
        aria-label="Self-attention: query token connects to all key positions with varying strength"
      >
        <title>Self-attention schematic</title>
        {SELF_ATTN_TOKENS.map((_, j) => {
          const w = row[j] ?? 0;
          const sw = 1.2 + w * 9;
          const op = 0.18 + w * 0.82;
          return (
            <line
              key={j}
              x1={cx(t)}
              y1={queryY + 6}
              x2={cx(j)}
              y2={tokenY - 26}
              stroke="currentColor"
              strokeWidth={sw}
              strokeOpacity={op}
              strokeLinecap="round"
            />
          );
        })}
        <text
          x={cx(t)}
          y={queryY - 4}
          textAnchor="middle"
          className="fill-[color:var(--purple)] text-sm font-bold md:text-base"
        >
          Q
        </text>
        {SELF_ATTN_TOKENS.map((tok, j) => {
          const active = j === t;
          return (
            <g key={tok}>
              <rect
                x={cx(j) - 32}
                y={tokenY - 24}
                width={64}
                height={46}
                rx={12}
                className={
                  active
                    ? "fill-[color:var(--purple)]/90 stroke-[color:var(--purple)]"
                    : "fill-white/[0.08] stroke-white/15"
                }
                strokeWidth={active ? 2 : 1}
              />
              <text
                x={cx(j)}
                y={tokenY - 4}
                textAnchor="middle"
                className={cn(
                  "text-sm font-bold md:text-base",
                  active ? "fill-white" : "fill-slate-200",
                )}
              >
                {tok}
              </text>
              <text
                x={cx(j)}
                y={tokenY + 12}
                textAnchor="middle"
                className="fill-slate-300 text-sm tabular-nums md:text-base"
              >
                K{j + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex w-full max-w-md flex-wrap justify-center gap-x-4 gap-y-1 text-base text-slate-300 md:text-lg">
        {SELF_ATTN_TOKENS.map((tok, j) => (
          <span key={tok} className="tabular-nums">
            <span className="font-medium text-slate-200">{tok}</span>:{" "}
            {Math.round((row[j] ?? 0) * 100)}%
          </span>
        ))}
      </div>

      {onGoMultiHead ? (
        <button
          type="button"
          onClick={onGoMultiHead}
          className="text-sm font-semibold text-[color:var(--purple)] underline decoration-[color:var(--purple)]/50 hover:opacity-90"
        >
          Next: multi-head merge
        </button>
      ) : null}
    </div>
  );
}

const MULTI_HEAD_TOKENS = ["The", "capital", "of", "Egypt", "is", "Cairo"] as const;

const MULTI_HEAD_TOKEN_CHIPS: { readonly token: string; readonly chipClass: string }[] = [
  { token: "The", chipClass: "border-violet-400/50 bg-violet-500/18 text-violet-50" },
  {
    token: "capital",
    chipClass:
      "border-emerald-400/55 bg-emerald-500/22 text-emerald-50 ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-slate-950/80",
  },
  { token: "of", chipClass: "border-white/20 bg-white/[0.08] text-slate-100" },
  { token: "Egypt", chipClass: "border-amber-400/45 bg-amber-500/18 text-amber-50" },
  { token: "is", chipClass: "border-sky-400/45 bg-sky-500/18 text-sky-50" },
  { token: "Cairo", chipClass: "border-rose-400/45 bg-rose-500/18 text-rose-50" },
];

const MULTI_HEAD_SPECS = [
  {
    title: "Head 1 — grammar",
    barClass: "bg-violet-500",
    borderClass: "border-violet-500/35",
    titleClass: "text-violet-300",
    question: 'Which words connect to "capital" structurally?',
    weights: [55, 15, 20, 5, 3, 2] as const,
    footer: '"The" is the article that modifies "capital" — strong grammatical bond',
  },
  {
    title: "Head 2 — topic / meaning",
    barClass: "bg-emerald-500",
    borderClass: "border-emerald-500/35",
    titleClass: "text-emerald-300",
    question: "Which words share the same concept?",
    weights: [4, 10, 4, 44, 3, 35] as const,
    footer: 'Egypt + Cairo are geographically linked to "capital" — strong semantic match',
  },
  {
    title: "Head 3 — position / neighbors",
    barClass: "bg-amber-500",
    borderClass: "border-amber-500/35",
    titleClass: "text-amber-300",
    question: 'Which words sit close to "capital"?',
    weights: [18, 10, 52, 14, 4, 2] as const,
    footer: '"of" is right next to "capital" — positional proximity drives this head',
  },
] as const;

function MultiHeadMini({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div
      className="space-y-5 py-1"
      role="region"
      aria-label="Multi-head attention: three heads attending from the word capital"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-2.5">
        {MULTI_HEAD_TOKEN_CHIPS.map(({ token, chipClass }) => (
          <span
            key={token}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums md:text-base",
              chipClass,
            )}
          >
            {token}
          </span>
        ))}
      </div>

      <p className="text-center text-sm font-medium leading-snug text-slate-300 md:text-base">
        Each head looks at &ldquo;capital&rdquo; — but notices a different kind of relationship
      </p>

      <div className="grid gap-4 md:grid-cols-3 md:gap-3 lg:gap-4">
        {MULTI_HEAD_SPECS.map((head, headIdx) => (
          <div
            key={head.title}
            className={cn(
              "flex min-w-0 flex-col rounded-xl border bg-white/[0.03] p-4 shadow-sm md:p-5",
              head.borderClass,
            )}
          >
            <h4 className={cn("text-sm font-bold md:text-base", head.titleClass)}>{head.title}</h4>
            <p className="mt-2 text-base leading-relaxed text-slate-300 md:text-lg">{head.question}</p>

            <div className="mt-4 space-y-2.5">
              {MULTI_HEAD_TOKENS.map((tok, j) => {
                const pct = head.weights[j] ?? 0;
                return (
                  <div key={`${head.title}-${tok}`} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-right text-sm font-semibold text-slate-100 tabular-nums sm:w-16 md:text-base">
                      {tok}
                    </span>
                    <div className="relative h-6 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <motion.div
                        className={cn("h-full rounded-full", head.barClass)}
                        initial={reducedMotion ? false : { width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: reducedMotion ? 0 : 0.45,
                          delay: reducedMotion ? 0 : headIdx * 0.08 + j * 0.04,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right text-sm font-bold tabular-nums text-slate-100 md:text-base">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 border-t border-white/10 pt-3 text-base leading-relaxed text-slate-300 md:text-lg">
              {head.footer}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-4 md:px-5 md:py-5">
        <p className="text-center text-sm font-bold text-slate-100 md:text-base">
          Final vector for &ldquo;capital&rdquo; = blend of all 3 heads
        </p>
        <p className="mt-3 text-center text-base leading-relaxed text-slate-300 md:text-lg">
          Grammar head says → &ldquo;The&rdquo; modifies me · Topic head says → Egypt + Cairo define me · Position head
          says → &ldquo;of&rdquo; is my immediate neighbor
        </p>
      </div>

      <p className="text-center text-sm text-slate-400 md:text-base">
        Concatenate head outputs → linear projection → back to model width (same width as input).
      </p>
    </div>
  );
}

function FFNMini({ reducedMotion }: { reducedMotion: boolean }) {
  const unpackStory = `oh, Egypt + capital + Cairo →
this is a country,
it has a capital city,
that city is Cairo`;

  return (
    <div className="mx-auto max-w-xl space-y-4 py-2">
      <div className="rounded-xl border border-[color:var(--purple)]/35 bg-[color:var(--purple)]/10 px-4 py-3 md:px-5 md:py-4">
        <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--purple)] md:text-base">
          Attention output
        </p>
        <p className="mt-2 text-sm font-medium leading-snug text-slate-100 md:text-base">
          &ldquo;Egypt&rdquo; now knows it relates to capital and Cairo
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 px-4 py-3 md:px-5 md:py-4">
        <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--warning)] md:text-base">
          Feed-forward
        </p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-100 md:text-base">
          {unpackStory}
        </p>
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4">
        {barRow("Linear up (e.g. 512)", 28, "bg-[color:var(--success)]/65", 0, reducedMotion)}
        {barRow("Hidden + activation (e.g. 2048)", 92, "bg-[color:var(--warning)]/70", 0.12, reducedMotion)}
        {barRow("Linear down (e.g. 512)", 28, "bg-[color:var(--success)]/65", 0.24, reducedMotion)}
        <p className="text-center text-base text-slate-300 md:text-lg">
          Same weights at every position — each token gets its own pass after attention has mixed context in.
        </p>
      </div>
    </div>
  );
}

function ResidualMini({ reducedMotion, multi }: { reducedMotion: boolean; multi?: boolean }) {
  return (
    <div className="space-y-3 py-2">
      {barRow("Sub-layer output", 55, "bg-[color:var(--purple)]/70", 0, reducedMotion)}
      {barRow("Skip — original input", 55, "bg-[color:var(--success)]/55", 0.1, reducedMotion)}
      {barRow("Add → LayerNorm → out", 80, "bg-[color:var(--primary)]/55", 0.22, reducedMotion)}
      <p className="text-center text-base text-slate-300 md:text-lg">
        {multi
          ? "Each attention and FFN block in the decoder uses this wrap."
          : "Preserves a clean path if the sub-layer learns near-zero updates."}
      </p>
    </div>
  );
}

function LayersMini({
  layerCount,
  reducedMotion,
  label,
}: {
  layerCount: number;
  reducedMotion: boolean;
  label: string;
}) {
  const n = Math.min(Math.max(layerCount, 1), 12);
  return (
    <div className="flex flex-col-reverse items-stretch gap-2 py-2">
      <p className="mb-1 text-center text-base text-slate-300 md:text-lg">
        {label} — same block repeated {layerCount}×
      </p>
      {Array.from({ length: n }, (_, i) => (
        <motion.div
          key={i}
          className="rounded-lg border border-[color:var(--purple)]/30 bg-[color:var(--purple)]/10 px-3 py-2 text-center text-base font-semibold text-[color:var(--purple)] md:text-lg"
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25, delay: reducedMotion ? 0 : i * 0.06 }}
        >
          Layer {i + 1}
        </motion.div>
      ))}
    </div>
  );
}

function MaskedAttentionMini({ reducedMotion }: { reducedMotion: boolean }) {
  const decoderTokens = ["The", "capital", "of", "Egypt", "is"] as const;
  const blockedFutureToken = "Cairo";
  const n = decoderTokens.length;
  const [active, setActive] = useState(3);
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % n), 1600);
    return () => window.clearInterval(id);
  }, [reducedMotion, n]);

  const allowedPrefix = decoderTokens.slice(0, active + 1).join(" ");
  const blockedSuffix = blockedFutureToken;

  return (
    <div className="space-y-5 py-2">
      <div className="rounded-xl border border-[color:var(--purple)]/30 bg-[color:var(--purple)]/10 px-4 py-3 md:px-5 md:py-4">
        <p className="text-sm font-semibold text-slate-100 md:text-base">
          Example (decoder step): trying to predict next token after
        </p>
        <p className="mt-2 rounded-md bg-black/20 px-3 py-2 font-mono text-base text-white md:text-lg">
          The capital of Egypt is
        </p>
        <p className="mt-2 text-sm font-medium text-slate-300 md:text-base">
          Model should output: <span className="font-bold text-white">{blockedFutureToken}</span>
        </p>
      </div>

      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-2 grid grid-cols-5 gap-1.5">
          {decoderTokens.map((tok, i) => (
            <div
              key={`col-${tok}-${i}`}
              className={cn(
                "rounded-md border px-1.5 py-1 text-center text-base font-semibold md:text-lg",
                i <= active
                  ? "border-[color:var(--purple)]/40 bg-[color:var(--purple)]/12 text-slate-100"
                  : "border-white/10 bg-white/[0.03] text-slate-500",
              )}
            >
              {tok}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: n * n }, (_, idx) => {
            const row = Math.floor(idx / n);
            const col = idx % n;
            const allowed = col <= row;
            const lit = allowed && row === active;
            return (
              <div
                key={idx}
                className={cn(
                  "aspect-square rounded-md border",
                  !allowed && "border-white/10 bg-white/[0.03]",
                  allowed &&
                    !lit &&
                    "border-[color:var(--purple)]/25 bg-[color:var(--purple)]/12",
                  lit &&
                    "border-[color:var(--purple)]/50 bg-[color:var(--purple)]/35 ring-2 ring-[color:var(--primary)]/40",
                )}
              />
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm font-medium text-slate-300 md:text-base">
        Active query token: <span className="font-bold text-white">{decoderTokens[active]}</span>
      </p>
      <p className="text-center text-base leading-relaxed text-slate-300 md:text-lg">
        It can attend only to: <span className="font-mono text-slate-200">{allowedPrefix}</span> | blocked future:
        <span className="font-mono text-slate-300"> {blockedSuffix}</span>
      </p>
    </div>
  );
}

function CrossAttentionMini({ reducedMotion }: { reducedMotion: boolean }) {
  const sourceTokens = ["The", "capital", "of", "Egypt", "is", "Cairo"] as const;
  const decoderPrefix = ["The", "capital", "of", "Egypt", "is"] as const;
  const weights = [0.06, 0.28, 0.07, 0.41, 0.04, 0.14] as const;
  const activeSource = 3;

  return (
    <div className="space-y-5 py-2">
      <div className="rounded-xl border border-[color:var(--warning)]/35 bg-[color:var(--warning)]/10 px-4 py-3 md:px-5 md:py-4">
        <p className="text-base font-semibold text-slate-100 md:text-lg">Decoder has generated:</p>
        <p className="mt-2 rounded-md bg-black/20 px-3 py-2 font-mono text-lg text-white md:text-xl">
          {decoderPrefix.join(" ")}
        </p>
        <p className="mt-2 text-base text-slate-300 md:text-lg">
          To pick the next token, decoder asks encoder memory: <span className="font-semibold text-white">Which country are
          we talking about?</span>
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--purple)]/30 bg-[color:var(--purple)]/10 p-4 md:p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--purple)] md:text-base">
          Encoder memory (keys/values from source sentence)
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {sourceTokens.map((tok, i) => {
            const pct = Math.round(weights[i] * 100);
            return (
              <div key={tok} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-slate-100 md:text-lg">{tok}</span>
                  <span className="text-sm font-bold tabular-nums text-slate-300 md:text-base">{pct}%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      i === activeSource ? "bg-[color:var(--primary)]" : "bg-[color:var(--purple)]/75",
                    )}
                    initial={reducedMotion ? false : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : i * 0.06 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-base font-medium text-slate-200 md:text-xl">
        Highest cross-attention goes to <span className="font-bold text-white">Egypt (41%)</span> so the decoder stays
        grounded in the source and predicts <span className="font-bold text-white">Cairo</span>.
      </p>
    </div>
  );
}

export function EncoderIllustration({
  focus,
  layerCount,
  reducedMotion,
  onGoMultiHead,
}: {
  focus: EncoderIllustrationFocus;
  layerCount: number;
  reducedMotion: boolean;
  onGoMultiHead?: () => void;
}) {
  switch (focus) {
    case "overview":
      return <OverviewEncoderMini reducedMotion={reducedMotion} />;
    case "self":
      return <SelfAttentionMini reducedMotion={reducedMotion} onGoMultiHead={onGoMultiHead} />;
    case "heads":
      return <MultiHeadMini reducedMotion={reducedMotion} />;
    case "ffn":
      return <FFNMini reducedMotion={reducedMotion} />;
    case "residual":
      return <ResidualMini reducedMotion={reducedMotion} />;
    case "layers":
      return <LayersMini layerCount={layerCount} reducedMotion={reducedMotion} label="Encoder layers" />;
    default:
      return null;
  }
}

export function DecoderIllustration({
  focus,
  layerCount,
  reducedMotion,
}: {
  focus: DecoderIllustrationFocus;
  layerCount: number;
  reducedMotion: boolean;
}) {
  switch (focus) {
    case "overview":
      return <OverviewDecoderMini reducedMotion={reducedMotion} />;
    case "masked":
      return <MaskedAttentionMini reducedMotion={reducedMotion} />;
    case "cross":
      return <CrossAttentionMini reducedMotion={reducedMotion} />;
    case "ffn":
      return <FFNMini reducedMotion={reducedMotion} />;
    case "residual":
      return <ResidualMini reducedMotion={reducedMotion} multi />;
    case "layers":
      return <LayersMini layerCount={layerCount} reducedMotion={reducedMotion} label="Decoder layers" />;
    default:
      return null;
  }
}
