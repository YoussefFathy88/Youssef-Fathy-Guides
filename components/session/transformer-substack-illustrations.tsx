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
      <div className="text-xs font-medium text-slate-400 md:text-sm">{label}</div>
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
      <p className="mb-1 text-center text-xs text-slate-400 md:text-sm">
        Pulse follows data upward through one layer
      </p>
      {steps.map((id, idx) => (
        <motion.div
          key={id}
          className={cn(
            "rounded-lg border px-3 py-2 text-center text-xs font-semibold md:text-sm",
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
      <p className="mb-1 text-center text-xs text-slate-400 md:text-sm">
        Mask, cross-attend, FFN — residuals at each step
      </p>
      {steps.map((id, idx) => (
        <motion.div
          key={id}
          className={cn(
            "rounded-lg border px-3 py-2 text-center text-xs font-semibold md:text-sm",
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

/** Demo attention weights per query row (rows sum to ~1). */
const SELF_ATTN_TOKENS = ["The", "cat", "sat", "mat"] as const;
const SELF_ATTN_WEIGHTS: number[][] = [
  [0.42, 0.28, 0.18, 0.12],
  [0.18, 0.44, 0.22, 0.16],
  [0.12, 0.26, 0.36, 0.26],
  [0.1, 0.22, 0.3, 0.38],
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

  const vbW = 320;
  const vbH = 148;
  const cx = (i: number) => 40 + i * 80;
  const tokenY = 118;
  const queryY = 36;
  const row = SELF_ATTN_WEIGHTS[t] ?? SELF_ATTN_WEIGHTS[0];

  return (
    <div className="flex w-full flex-col items-center gap-4 py-1">
      <p className="text-center text-xs text-slate-300 md:text-sm">
        <span className="font-semibold text-[color:var(--purple)]">Q</span> at{" "}
        <span className="font-semibold text-white">{SELF_ATTN_TOKENS[t]}</span>
        <span className="text-slate-400"> — line thickness ≈ attention weight to each key</span>
      </p>

      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="h-auto w-full max-w-md text-[color:var(--purple)]"
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
          className="fill-[color:var(--purple)] text-[11px] font-bold"
        >
          Q
        </text>
        {SELF_ATTN_TOKENS.map((tok, j) => {
          const active = j === t;
          return (
            <g key={tok}>
              <rect
                x={cx(j) - 34}
                y={tokenY - 24}
                width={68}
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
                  "text-[13px] font-bold",
                  active ? "fill-white" : "fill-slate-200",
                )}
              >
                {tok}
              </text>
              <text
                x={cx(j)}
                y={tokenY + 12}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] tabular-nums md:text-[11px]"
              >
                K{j + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex w-full max-w-md flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-400 md:text-sm">
        {SELF_ATTN_TOKENS.map((tok, j) => (
          <span key={tok} className="tabular-nums">
            <span className="font-medium text-slate-200">{tok}</span>:{" "}
            {Math.round((row[j] ?? 0) * 100)}%
          </span>
        ))}
      </div>

      <p className="max-w-lg text-center text-xs leading-relaxed text-slate-300 md:text-sm">
        Scores are <strong className="text-white">Q · K</strong> (scaled);{" "}
        <strong className="text-white">softmax</strong> makes them positive weights that sum to 1; the new vector is that weighted
        sum of the <strong className="text-white">V</strong> vectors — one updated representation per position, in parallel for the
        whole sequence.
      </p>

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

function MultiHeadMini({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex gap-3">
        {[0, 1, 2].map((h) => (
          <div key={h} className="min-w-0 flex-1 space-y-2">
            <div className="text-center text-xs font-medium text-slate-400 md:text-sm">Head {h + 1}</div>
            <div className="flex h-10 overflow-hidden rounded-lg bg-white/[0.08]">
              <motion.div
                className="h-full min-h-0 w-full bg-[color:var(--purple)]/75"
                initial={reducedMotion ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : h * 0.12 }}
                style={{ transformOrigin: "bottom" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 md:text-sm">
        <span>concatenate</span>
        <span aria-hidden>→</span>
      </div>
      {barRow("Project back to model width", 88, "bg-[color:var(--purple)]/80", 0.35, reducedMotion)}
    </div>
  );
}

function FFNMini({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="space-y-3 py-2">
      {barRow("Linear up (e.g. 512)", 28, "bg-[color:var(--success)]/65", 0, reducedMotion)}
      {barRow("Hidden + activation (e.g. 2048)", 92, "bg-[color:var(--warning)]/70", 0.12, reducedMotion)}
      {barRow("Linear down (e.g. 512)", 28, "bg-[color:var(--success)]/65", 0.24, reducedMotion)}
      <p className="text-center text-xs text-slate-400 md:text-sm">
        Same MLP weights applied at every position independently
      </p>
    </div>
  );
}

function ResidualMini({ reducedMotion, multi }: { reducedMotion: boolean; multi?: boolean }) {
  return (
    <div className="space-y-3 py-2">
      {barRow("Sub-layer output", 55, "bg-[color:var(--purple)]/70", 0, reducedMotion)}
      {barRow("Skip — original input", 55, "bg-[color:var(--success)]/55", 0.1, reducedMotion)}
      {barRow("Add → LayerNorm → out", 80, "bg-[color:var(--primary)]/55", 0.22, reducedMotion)}
      <p className="text-center text-xs text-slate-400 md:text-sm">
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
      <p className="mb-1 text-center text-xs text-slate-400 md:text-sm">
        {label} — same block repeated {layerCount}×
      </p>
      {Array.from({ length: n }, (_, i) => (
        <motion.div
          key={i}
          className="rounded-lg border border-[color:var(--purple)]/30 bg-[color:var(--purple)]/10 px-3 py-2 text-center text-xs font-semibold text-[color:var(--purple)] md:text-sm"
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
  const n = 5;
  const [active, setActive] = useState(2);
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % n), 1600);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="space-y-4 py-2">
      <div className="mx-auto grid w-full max-w-[300px] grid-cols-5 gap-1.5 sm:max-w-[340px]">
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
                !allowed && "border-white/10 bg-white/[0.04]",
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
      <p className="text-center text-xs text-slate-400 md:text-sm">
        Rows = query position, columns = key position. Upper triangle blocked; row {active + 1} highlights allowed keys.
      </p>
    </div>
  );
}

function CrossAttentionMini({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="flex items-stretch justify-center gap-4 py-3 md:gap-6">
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3 rounded-xl border border-[color:var(--warning)]/35 bg-[color:var(--warning)]/10 p-4">
        <span className="text-xs font-bold uppercase tracking-wide text-[color:var(--warning)] md:text-sm">Decoder</span>
        <motion.div
          className="h-12 w-full max-w-[88px] rounded-lg bg-[color:var(--warning)]/45"
          animate={reducedMotion ? {} : { opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
        <span className="text-xs font-semibold text-[color:var(--warning)] md:text-sm">Q</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 px-1">
        <motion.svg
          width="44"
          height="56"
          viewBox="0 0 36 48"
          className="text-[color:var(--purple)]"
          aria-hidden
        >
          <motion.path
            d="M4 24 H28 M28 24 L22 18 M28 24 L22 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={reducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.55, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1.0, ease: "easeInOut" }
            }
          />
        </motion.svg>
        <span className="text-xs text-slate-400">attend</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3 rounded-xl border border-[color:var(--purple)]/35 bg-[color:var(--purple)]/10 p-4">
        <span className="text-xs font-bold uppercase tracking-wide text-[color:var(--purple)] md:text-sm">
          Encoder memory
        </span>
        <div className="flex h-12 w-full max-w-[100px] items-end justify-center gap-1">
          {[40, 65, 50, 72, 45].map((h, i) => (
            <motion.div
              key={i}
              className="w-2.5 rounded-t bg-[color:var(--purple)]/70"
              initial={reducedMotion ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : i * 0.08 }}
              style={{ height: `${h}%`, transformOrigin: "bottom" }}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-[color:var(--purple)] md:text-sm">K · V</span>
      </div>
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
