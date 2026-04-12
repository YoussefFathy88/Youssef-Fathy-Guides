"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DecoderIllustration, EncoderIllustration } from "./transformer-substack-illustrations";

export type TransformerSubstackVariant = "encoder" | "decoder";

export interface TransformerSubstackExplorerProps {
  variant: TransformerSubstackVariant;
  title?: string;
  caption?: string;
  /** How many identical layers are stacked (shown in the “layers” focus). */
  layerCount?: number;
}

type EncoderFocus = "overview" | "self" | "heads" | "ffn" | "residual" | "layers";
type DecoderFocus = "overview" | "masked" | "cross" | "ffn" | "residual" | "layers";

const ENCODER_PILLS: { id: EncoderFocus; label: string }[] = [
  { id: "overview", label: "Full encoder" },
  { id: "self", label: "Self-attention" },
  { id: "heads", label: "Multi-head" },
  { id: "ffn", label: "Feed-forward" },
  { id: "residual", label: "Residual + norm" },
  { id: "layers", label: "× layers" },
];

const DECODER_PILLS: { id: DecoderFocus; label: string }[] = [
  { id: "overview", label: "Full decoder" },
  { id: "masked", label: "Masked self-attn" },
  { id: "cross", label: "Cross-attention" },
  { id: "ffn", label: "Feed-forward" },
  { id: "residual", label: "Residual + norm" },
  { id: "layers", label: "× layers" },
];

const ENCODER_DETAIL: Record<EncoderFocus, { headline: string; body: string }> = {
  overview: {
    headline: "One encoder layer",
    body: "Data moves upward: self-attention mixes tokens, then a feed-forward network refines each token. Residual paths add each sub-layer’s input back before normalization.",
  },
  self: {
    headline: "Self-attention",
    body: "Each token builds Q, K, and V. Scores pair every query with every key; softmax weights blend values so each position pulls in context from the whole sequence.",
  },
  heads: {
    headline: "Multi-head",
    body: "Several attention heads run in parallel on different subspaces, then merge. Each head can specialize in a different kind of relationship.",
  },
  ffn: {
    headline: "Feed-forward",
    body: "The same MLP is applied independently at each position: widen (e.g. 512→2048), nonlinearity, then project back. This refines each token after mixing.",
  },
  residual: {
    headline: "Residual + layer norm",
    body: "The sub-layer's input is added to its output, then normalized. Shortcuts keep gradients healthy and let the block learn small corrections on top of what came in.",
  },
  layers: {
    headline: "Stacked layers",
    body: "The full block repeats many times. Deeper layers build richer contextual representations; hyperparameter N is model-specific.",
  },
};

const DECODER_DETAIL: Record<DecoderFocus, { headline: string; body: string }> = {
  overview: {
    headline: "One decoder layer",
    body: "Like the encoder, but with masked self-attention (no peeking at future tokens) and cross-attention into the encoder memory before the feed-forward.",
  },
  masked: {
    headline: "Masked self-attention",
    body: "When generating left-to-right, each position may only attend to earlier positions. Future tokens are masked out so the model cannot cheat.",
  },
  cross: {
    headline: "Cross-attention",
    body: "Queries come from the decoder; keys and values come from the encoder output. This is how generation stays grounded in the source sentence.",
  },
  ffn: {
    headline: "Feed-forward",
    body: "Same per-position MLP idea as the encoder: refine the representation after attention has run.",
  },
  residual: {
    headline: "Residual + layer norm",
    body: "Each attention and FFN sub-layer uses add-and-norm around it, just like the encoder, so signals stay stable across depth.",
  },
  layers: {
    headline: "Stacked layers",
    body: "Decoder blocks repeat for the same reason as the encoder: depth trades compute for expressiveness. N matches the encoder stack in the classic design.",
  },
};

const ENCODER_FOCUS_CARD: Record<
  Exclude<EncoderFocus, "overview">,
  { label: string; sub: string; tone: BlockTone }
> = {
  self: { label: "① Self-attention", sub: "Every token attends to every other token in the sequence.", tone: "violet" },
  heads: {
    label: "Multi-head self-attention",
    sub: "Several heads in parallel, then concatenate and project back to the model width.",
    tone: "violet",
  },
  ffn: { label: "③ Feed-forward network", sub: "512 → 2048 → 512, applied independently at each position.", tone: "amber" },
  residual: {
    label: "② / ④ Add & Layer Norm",
    sub: "After each sub-layer: add the residual (skip) input, then normalize.",
    tone: "teal",
  },
  layers: {
    label: "Stack depth",
    sub: "The same encoder block is repeated end to end.",
    tone: "gray",
  },
};

const DECODER_FOCUS_CARD: Record<
  Exclude<DecoderFocus, "overview">,
  { label: string; sub: string; tone: BlockTone }
> = {
  masked: {
    label: "① Masked self-attention",
    sub: "Only past and current positions — no peeking at future tokens.",
    tone: "violet",
  },
  cross: {
    label: "③ Cross-attention",
    sub: "Queries from the decoder; keys and values from the encoder memory.",
    tone: "violet",
  },
  ffn: { label: "⑤ Feed-forward network", sub: "512 → 2048 → 512 · per token.", tone: "amber" },
  residual: {
    label: "② / ④ / ⑥ Add & Layer Norm",
    sub: "Residual add + layer norm after each sub-layer.",
    tone: "teal",
  },
  layers: {
    label: "Stack depth",
    sub: "The same decoder block repeats for the full stack.",
    tone: "gray",
  },
};

type BlockTone = "gray" | "violet" | "teal" | "amber";

/** Left accent matches site tokens: --purple, --success, --warning, slate. */
function stackToneAccentClass(tone: BlockTone): string {
  return tone === "gray"
    ? "border-l-slate-500"
    : tone === "violet"
      ? "border-l-[color:var(--purple)]"
      : tone === "teal"
        ? "border-l-[color:var(--success)]"
        : "border-l-[color:var(--warning)]";
}

function toneAccentBarClass(tone: BlockTone): string {
  return tone === "gray"
    ? "bg-slate-500"
    : tone === "violet"
      ? "bg-[color:var(--purple)]"
      : tone === "teal"
        ? "bg-[color:var(--success)]"
        : "bg-[color:var(--warning)]";
}

function stackBlockClass(
  tone: BlockTone,
  active: boolean,
  accent: "violet" | "amber",
  large: boolean,
): string {
  const ring =
    accent === "amber"
      ? "ring-2 ring-[color:var(--warning)]/55 ring-offset-2 ring-offset-[color:var(--background-elevated)]"
      : "ring-2 ring-[color:var(--primary)]/55 ring-offset-2 ring-offset-[color:var(--background-elevated)]";
  return cn(
    "w-full rounded-xl border border-white/10 bg-[color:var(--surface-strong)] text-left font-semibold text-slate-100 transition-all",
    "border-l-2",
    stackToneAccentClass(tone),
    large ? "px-5 py-4 text-base" : "px-3 py-2.5 text-sm",
    active ? ring : "opacity-[0.93] hover:border-white/[0.14] hover:opacity-100",
  );
}

function FocusedBlockHero({
  title,
  sub,
  body,
  tone,
  accent,
  children,
  tip,
}: {
  title: string;
  sub: string;
  body: string;
  tone: BlockTone;
  accent: "violet" | "amber";
  children: ReactNode;
  tip?: ReactNode;
}) {
  const ring =
    accent === "amber"
      ? "ring-[color:var(--warning)]/35 ring-offset-2 ring-offset-[color:var(--background-elevated)]"
      : "ring-[color:var(--primary)]/35 ring-offset-2 ring-offset-[color:var(--background-elevated)]";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--surface-strong)] shadow-[0_24px_60px_-40px_rgba(0,0,0,0.65)]",
        "ring-1",
        ring,
      )}
    >
      <div className="flex gap-0">
        <div className={cn("w-1 shrink-0 opacity-90", toneAccentBarClass(tone))} aria-hidden />
        <div className="min-w-0 flex-1 space-y-5 px-5 py-6 md:px-7 md:py-7">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 md:text-base">{sub}</p>
            {body.trim() !== sub.trim() ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">{body}</p>
            ) : null}
          </div>
          <div className="min-h-[280px] rounded-xl border border-white/10 bg-white/[0.04] px-4 py-6 md:min-h-[340px] md:px-6 md:py-8">
            {children}
          </div>
          {tip}
        </div>
      </div>
    </div>
  );
}

export default function TransformerSubstackExplorer({
  variant,
  title,
  caption,
  layerCount = 6,
}: TransformerSubstackExplorerProps) {
  const reducedMotion = useReducedMotion();
  const [encFocus, setEncFocus] = useState<EncoderFocus>("overview");
  const [decFocus, setDecFocus] = useState<DecoderFocus>("overview");

  const detail = variant === "encoder" ? ENCODER_DETAIL[encFocus] : DECODER_DETAIL[decFocus];
  const detailBody =
    variant === "encoder" && encFocus === "layers"
      ? `The full block repeats ${layerCount} times in the classic paper setup (N is model-specific).`
      : variant === "decoder" && decFocus === "layers"
        ? `The decoder stack is usually the same depth as the encoder — often ${layerCount} layers in the original design.`
        : detail.body;

  const setFocusEncoder = useCallback((id: EncoderFocus) => setEncFocus(id), []);
  const setFocusDecoder = useCallback((id: DecoderFocus) => setDecFocus(id), []);

  const encHighlight = useMemo(() => {
    const m: Partial<Record<string, boolean>> = {};
    if (encFocus === "overview" || encFocus === "layers") return m;
    if (encFocus === "self" || encFocus === "heads") m.mha = true;
    if (encFocus === "ffn") m.ffn = true;
    if (encFocus === "residual") {
      m.norm1 = true;
      m.norm2 = true;
    }
    return m;
  }, [encFocus]);

  const decHighlight = useMemo(() => {
    const m: Partial<Record<string, boolean>> = {};
    if (decFocus === "overview" || decFocus === "layers") return m;
    if (decFocus === "masked") m.masked = true;
    if (decFocus === "cross") m.cross = true;
    if (decFocus === "ffn") m.ffn = true;
    if (decFocus === "residual") {
      m.n1 = true;
      m.n2 = true;
      m.n3 = true;
    }
    return m;
  }, [decFocus]);

  const defaultTitle =
    variant === "encoder" ? "Encoder block — one layer" : "Decoder block — one layer";
  const defaultCaption =
    variant === "encoder"
      ? "Pick a topic to zoom in, or Full encoder to see the whole stack. Tap a block to jump."
      : "Pick a topic to zoom in, or Full decoder to see the whole stack. Tap a block to jump.";

  const encoderTip =
    encFocus === "self" || encFocus === "heads" ? (
      <p className="text-sm text-slate-400">
        For live Q/K/V scores on a sentence, use the self-attention explorer later on this page.
      </p>
    ) : null;

  const decoderTip =
    decFocus === "masked" || decFocus === "cross" ? (
      <p className="text-sm text-slate-400">
        For full attention weights on a sentence, use the self-attention explorer later on this page.
      </p>
    ) : null;

  const pillIdle =
    "bg-white/[0.05] text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-white/15";
  const pillActiveEncoder =
    "bg-[color:var(--purple)]/14 text-[color:var(--purple)] ring-1 ring-[color:var(--purple)]/30";
  const pillActiveDecoder =
    "bg-[color:var(--warning)]/14 text-[color:var(--warning)] ring-1 ring-[color:var(--warning)]/30";

  return (
    <div className="surface-panel w-full p-5 md:p-6">
      <div className="mb-4 space-y-1">
        <h2 className="text-base font-medium text-white md:text-lg">{title ?? defaultTitle}</h2>
        <p className="text-sm text-slate-400">{caption ?? defaultCaption}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {variant === "encoder"
          ? ENCODER_PILLS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFocusEncoder(p.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors md:text-sm",
                  encFocus === p.id ? pillActiveEncoder : pillIdle,
                )}
              >
                {p.label === "× layers" ? `× ${layerCount} layers` : p.label}
              </button>
            ))
          : DECODER_PILLS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFocusDecoder(p.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors md:text-sm",
                  decFocus === p.id ? pillActiveDecoder : pillIdle,
                )}
              >
                {p.label === "× layers" ? `× ${layerCount} layers` : p.label}
              </button>
            ))}
      </div>

      <AnimatePresence mode="wait">
        {variant === "encoder" ? (
          encFocus === "overview" ? (
            <motion.div
              key="enc-overview"
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="surface-panel w-full p-5 md:p-6"
            >
              <EncoderStack
                encHighlight={encHighlight}
                encFocus={encFocus}
                setFocus={setFocusEncoder}
                reducedMotion={!!reducedMotion}
                large
                accent="violet"
              />
            </motion.div>
          ) : (
            <motion.div
              key={`enc-${encFocus}`}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {(() => {
                const card = ENCODER_FOCUS_CARD[encFocus];
                return (
                  <FocusedBlockHero
                    title={card.label}
                    sub={card.sub}
                    body={detailBody}
                    tone={card.tone}
                    accent="violet"
                    tip={encoderTip}
                  >
                    <EncoderIllustration
                      focus={encFocus}
                      layerCount={layerCount}
                      reducedMotion={!!reducedMotion}
                      onGoMultiHead={() => setEncFocus("heads")}
                    />
                  </FocusedBlockHero>
                );
              })()}
            </motion.div>
          )
        ) : decFocus === "overview" ? (
          <motion.div
            key="dec-overview"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="surface-panel w-full p-5 md:p-6"
          >
            <DecoderStack
              decHighlight={decHighlight}
              decFocus={decFocus}
              setFocus={setFocusDecoder}
              reducedMotion={!!reducedMotion}
              large
              accent="amber"
            />
          </motion.div>
        ) : (
          <motion.div
            key={`dec-${decFocus}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const card = DECODER_FOCUS_CARD[decFocus];
              return (
                <FocusedBlockHero
                  title={card.label}
                  sub={card.sub}
                  body={detailBody}
                  tone={card.tone}
                  accent="amber"
                  tip={decoderTip}
                >
                  <DecoderIllustration focus={decFocus} layerCount={layerCount} reducedMotion={!!reducedMotion} />
                </FocusedBlockHero>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowUp({ large }: { large?: boolean }) {
  const s = large ? 24 : 20;
  return (
    <div
      className={cn(
        "flex items-center justify-center text-[color:var(--success)]/75",
        large ? "h-7" : "h-5",
      )}
    >
      <svg width={s} height={large ? 18 : 14} viewBox="0 0 20 14" fill="none" aria-hidden>
        <path
          d="M10 12V2M6 6l4-4 4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function EncoderStack({
  encHighlight,
  encFocus,
  setFocus,
  reducedMotion,
  large,
  accent,
}: {
  encHighlight: Partial<Record<string, boolean>>;
  encFocus: EncoderFocus;
  setFocus: (f: EncoderFocus) => void;
  reducedMotion: boolean;
  large?: boolean;
  accent: "violet" | "amber";
}) {
  const blocks: { id: string; label: string; sub: string; tone: BlockTone; focus: EncoderFocus }[] = [
    { id: "norm2", label: "④ Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "ffn", label: "③ Feed-forward", sub: "512 → 2048 → 512 · per token", tone: "amber", focus: "ffn" },
    { id: "norm1", label: "② Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "mha", label: "① Self-attention", sub: "every token ↔ every token", tone: "violet", focus: "self" },
    { id: "input", label: "Input vectors", sub: "one per token · 512-dim", tone: "gray", focus: "overview" },
  ];

  return (
    <div className="flex flex-col-reverse">
      {blocks.map((b, idx) => (
        <div key={b.id}>
          <motion.button
            type="button"
            layout={!reducedMotion}
            onClick={() => {
              if (b.id === "mha") setFocus("self");
              else if (b.id === "ffn") setFocus("ffn");
              else if (b.id === "norm1" || b.id === "norm2") setFocus("residual");
              else if (b.id === "input") setFocus("overview");
            }}
            className={stackBlockClass(b.tone, !!encHighlight[b.id] || encFocus === b.focus, accent, !!large)}
          >
            <span className="block">{b.label}</span>
            <span
              className={cn(
                "mt-1 block font-normal text-slate-400",
                large ? "text-sm md:text-base" : "text-[11px]",
              )}
            >
              {b.sub}
            </span>
          </motion.button>
          {idx < blocks.length - 1 && <ArrowUp large={large} />}
        </div>
      ))}
    </div>
  );
}

function DecoderStack({
  decHighlight,
  decFocus,
  setFocus,
  reducedMotion,
  large,
  accent,
}: {
  decHighlight: Partial<Record<string, boolean>>;
  decFocus: DecoderFocus;
  setFocus: (f: DecoderFocus) => void;
  reducedMotion: boolean;
  large?: boolean;
  accent: "violet" | "amber";
}) {
  const blocks: { id: string; label: string; sub: string; tone: BlockTone; focus: DecoderFocus }[] = [
    { id: "n3", label: "⑥ Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "ffn", label: "⑤ Feed-forward", sub: "512 → 2048 → 512 · per token", tone: "amber", focus: "ffn" },
    { id: "n2", label: "④ Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "cross", label: "③ Cross-attention", sub: "Q from decoder · K,V from encoder", tone: "violet", focus: "cross" },
    { id: "n1", label: "② Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "masked", label: "① Masked self-attention", sub: "only past tokens — no future peek", tone: "violet", focus: "masked" },
    { id: "input", label: "Input (shifted right)", sub: "decoder positions · 512-dim", tone: "gray", focus: "overview" },
  ];

  return (
    <div className="flex flex-col-reverse">
      {blocks.map((b, idx) => (
        <div key={b.id}>
          <motion.button
            type="button"
            layout={!reducedMotion}
            onClick={() => {
              if (b.id === "masked") setFocus("masked");
              else if (b.id === "cross") setFocus("cross");
              else if (b.id === "ffn") setFocus("ffn");
              else if (b.id.startsWith("n")) setFocus("residual");
              else setFocus("overview");
            }}
            className={stackBlockClass(b.tone, !!decHighlight[b.id] || decFocus === b.focus, accent, !!large)}
          >
            <span className="block">{b.label}</span>
            <span
              className={cn(
                "mt-1 block font-normal text-slate-400",
                large ? "text-sm md:text-base" : "text-[11px]",
              )}
            >
              {b.sub}
            </span>
          </motion.button>
          {idx < blocks.length - 1 && <ArrowUp large={large} />}
        </div>
      ))}
    </div>
  );
}
