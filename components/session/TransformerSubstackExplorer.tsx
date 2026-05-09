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
  /** Hide explanatory paragraphs; keep just pills + animated diagrams. */
  minimal?: boolean;
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
    body: "Data moves downward: self-attention mixes tokens, then a feed-forward network refines each token. Residual paths add each sub-layer’s input back before normalization.",
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
    body: "The same MLP runs at each position: widen (e.g. 512→2048), nonlinearity, then project back. It refines each token after attention has mixed neighbor information into its vector.",
  },
  residual: {
    headline: "Residual + layer norm",
    body: "The sub-layer’s output is added to its input (skip connection), then layer norm evens out scale. That add is your safety net: the “socializing” (self-attention) and “thinking” (feed-forward) steps only nudge the vector—they can’t silently rewrite a token’s meaning in one hop because the original signal is always mixed back in. The shortcut also keeps gradients healthy across deep stacks.",
  },
  layers: {
    headline: "Stacked layers",
    body: "The full block repeats many times. Deeper layers build richer contextual representations; hyperparameter N is model-specific.",
  },
};

/** Short real-world hooks for the footer under each focused encoder topic. */
const ENCODER_ANALOGY: Record<EncoderFocus, string> = {
  overview: "",
  self: 'Think of a **socialization phase**: every word mingles in the room, hears what every other word is “saying,” then each word updates its own takeaway before moving on.',
  heads: "Like a **committee of specialists**: several readers each notice something different (grammar, who did what, tone), then they **merge notes** into one combined view.",
  ffn: "It’s like **blowing up a small photo onto a big screen** to fix details, then **shrinking it back** — widen, refine with dense layers, compress to model width.",
  residual:
    "**Residual — your safety net.** By **adding the original input back in**, you make sure the **socializing** (attention) or **thinking** (feed-forward) didn’t accidentally change the word’s meaning too much—then **layer norm** keeps scale tidy, like straightening the picture after each edit.",
  layers:
    "Like **multiple editing passes** on the same document: each stacked layer is another full read that sharpens meaning while still grounded in what came before.",
};

/** Short real-world hooks for the footer under each focused decoder topic. */
const DECODER_ANALOGY: Record<DecoderFocus, string> = {
  overview: "",
  masked:
    "Like **typing a message without scrolling ahead**: you only see words you’ve already written—no peeking at the future text you haven’t produced yet.",
  cross:
    "Like **working from notes while you speak**: the decoder’s draft keeps **glancing back** at the encoder’s page (source memory) so answers stay tied to what was actually said.",
  ffn: "Same idea as the encoder: **widen** each token’s vector, **refine** with rich computation, then **project back** to the usual width.",
  residual:
    "**Residual — your safety net** here too: **add** the vector from before the sub-layer back in so **socializing** (masked attention), **checking the book** (cross-attention), or **thinking** (FFN) can’t rewrite meaning too aggressively in one step—then **normalize** to keep depth stable.",
  layers:
    "Same as the encoder: **depth** means more passes of mask → cross-attend → refine, each time reusing the same block pattern end to end.",
};

const DECODER_DETAIL: Record<DecoderFocus, { headline: string; body: string }> = {
  overview: {
    headline: "One decoder layer",
    body: "Like the encoder, but with masked self-attention (no peeking at future tokens) and cross-attention into the encoder memory before the feed-forward.",
  },
  masked: {
    headline: "Masked self-attention",
    body: "Example: with prefix `The capital of Egypt is`, the query at `is` can read only `The capital of Egypt is` and cannot read future token `Cairo`. That no-peek rule is the mask.",
  },
  cross: {
    headline: "Cross-attention",
    body: "Concrete example: decoder has `The capital of Egypt is` and asks encoder memory for source facts. Cross-attention reads encoder keys/values from `The capital of Egypt is Cairo`, gives highest weight to `Egypt`, and that grounding helps output `Cairo` next.",
  },
  ffn: {
    headline: "Feed-forward",
    body: "Same per-position MLP as the encoder: widen → nonlinear layers → project back. Runs after masked self-attention and cross-attention have updated each position.",
  },
  residual: {
    headline: "Residual + layer norm",
    body: "Same add-and-norm wrap after masked attention, cross-attention, and FFN. The residual add is still your safety net: “socializing” (masked self-attention), consulting the source (cross-attention), and “thinking” (FFN) apply on top of what came in, so one sub-layer can’t drag the representation too far before the next norm step.",
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
  ffn: {
    label: "③ Feed-forward network",
    sub: "512 → 2048 → 512 · same MLP weights at every position.",
    tone: "amber",
  },
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
  ffn: {
    label: "⑤ Feed-forward network",
    sub: "512 → 2048 → 512 · per token, same pattern as the encoder.",
    tone: "amber",
  },
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

/** Renders `**phrase**` in analogy copy as bold. */
function AnalogyText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-slate-200">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

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
  const activeBorder =
    accent === "amber"
      ? "border border-[color:var(--warning)] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
      : "border border-[color:var(--primary)] shadow-[0_0_15px_rgba(139,92,246,0.2)]";
  
  return cn(
    "w-full rounded-xl bg-[color:var(--surface-strong)] text-left font-semibold text-slate-100 transition-all",
    "border-l-4", // Thicker left accent for clearer visualization
    stackToneAccentClass(tone),
    large ? "px-5 py-4 text-base md:text-lg" : "px-4 py-3 text-base md:px-5 md:py-3.5",
    active ? activeBorder : "border border-white/10 opacity-[0.93] hover:border-white/20 hover:opacity-100",
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
  hideText = false,
}: {
  title: string;
  sub: string;
  body: string;
  tone: BlockTone;
  accent: "violet" | "amber";
  children: ReactNode;
  tip?: ReactNode;
  hideText?: boolean;
}) {
  const activeBorder =
    accent === "amber"
      ? "border-[color:var(--warning)] shadow-[0_0_20px_rgba(245,158,11,0.15)]"
      : "border-[color:var(--primary)] shadow-[0_0_20px_rgba(139,92,246,0.15)]";
      
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-[color:var(--surface-strong)]",
        activeBorder,
      )}
    >
      <div className="flex gap-0">
        <div className={cn("w-1 shrink-0 opacity-90", toneAccentBarClass(tone))} aria-hidden />
        <div className="min-w-0 flex-1 space-y-5 px-5 py-6 md:px-7 md:py-7">
          {!hideText ? (
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">{title}</h3>
              <p className="mt-2 text-base font-medium leading-relaxed text-slate-200 md:text-lg">{sub}</p>
              {body.trim() !== sub.trim() ? (
                <p className="mt-3 text-base font-medium leading-relaxed text-slate-200 md:text-lg">{body}</p>
              ) : null}
            </div>
          ) : null}
          <div className="min-h-[280px] rounded-xl border border-white/10 bg-white/[0.04] px-4 py-6 md:min-h-[340px] md:px-6 md:py-8">
            {children}
          </div>
          {!hideText ? tip : null}
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
  minimal = false,
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
    encFocus !== "overview" && ENCODER_ANALOGY[encFocus] ? (
      <p className="border-t border-white/10 pt-5 text-base font-medium leading-relaxed text-slate-300 md:text-lg">
        <span className="font-bold text-slate-200">Real-world analogy. </span>
        <AnalogyText text={ENCODER_ANALOGY[encFocus]} />
      </p>
    ) : null;

  const decoderTip =
    decFocus !== "overview" && DECODER_ANALOGY[decFocus] ? (
      <p className="border-t border-white/10 pt-5 text-base font-medium leading-relaxed text-slate-300 md:text-lg">
        <span className="font-bold text-slate-200">Real-world analogy. </span>
        <AnalogyText text={DECODER_ANALOGY[decFocus]} />
      </p>
    ) : null;

  const pillIdle =
    "bg-white/[0.05] text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-white/15";
  const pillActiveEncoder =
    "bg-[color:var(--purple)]/14 text-[color:var(--purple)] ring-1 ring-[color:var(--purple)]/30";
  const pillActiveDecoder =
    "bg-[color:var(--warning)]/14 text-[color:var(--warning)] ring-1 ring-[color:var(--warning)]/30";

  return (
    <div className="surface-panel w-full p-8 md:p-10">
      {!minimal ? (
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold text-white md:text-xl">{title ?? defaultTitle}</h2>
          <p className="text-base font-medium text-slate-300 md:text-lg">{caption ?? defaultCaption}</p>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-3">
        {variant === "encoder"
          ? ENCODER_PILLS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFocusEncoder(p.id)}
                className={cn(
                  "rounded-full px-4 py-2.5 text-base font-bold transition-colors md:px-5 md:py-3 md:text-lg",
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
                  "rounded-full px-4 py-2.5 text-base font-bold transition-colors md:px-5 md:py-3 md:text-lg",
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
                    hideText={minimal}
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
                  hideText={minimal}
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

function ArrowDown({ large }: { large?: boolean }) {
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
          d="M10 2V12M6 8l4 4 4-4"
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
    { id: "input", label: "Input vectors", sub: "one per token · 512-dim", tone: "gray", focus: "overview" },
    { id: "mha", label: "① Self-attention", sub: "every token ↔ every token", tone: "violet", focus: "self" },
    { id: "norm1", label: "② Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "ffn", label: "③ Feed-forward", sub: "512 → 2048 → 512 · per token", tone: "amber", focus: "ffn" },
    { id: "norm2", label: "④ Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "output", label: "Encoder output", sub: "context-aware state", tone: "gray", focus: "overview" },
  ];

  return (
    <div className="flex flex-col">
      {blocks.map((b, idx) => (
        <div key={b.id}>
          <motion.button
            type="button"
            layout={!reducedMotion}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (b.id === "mha") setFocus("self");
              else if (b.id === "ffn") setFocus("ffn");
              else if (b.id === "norm1" || b.id === "norm2") setFocus("residual");
              else if (b.id === "input" || b.id === "output") setFocus("overview");
            }}
            className={stackBlockClass(b.tone, !!encHighlight[b.id] || encFocus === b.focus, accent, !!large)}
          >
            <span className="block">{b.label}</span>
            <span
              className={cn(
                "mt-1 block font-normal text-slate-400",
                large ? "text-base md:text-lg" : "text-base font-medium md:text-lg",
              )}
            >
              {b.sub}
            </span>
          </motion.button>
          {idx < blocks.length - 1 && <ArrowDown large={large} />}
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
    { id: "input", label: "Input (shifted right)", sub: "decoder positions · 512-dim", tone: "gray", focus: "overview" },
    { id: "masked", label: "① Masked self-attention", sub: "only past tokens — no future peek", tone: "violet", focus: "masked" },
    { id: "n1", label: "② Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "cross", label: "③ Cross-attention", sub: "Q from decoder · K,V from encoder", tone: "violet", focus: "cross" },
    { id: "n2", label: "④ Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "ffn", label: "⑤ Feed-forward", sub: "512 → 2048 → 512 · per token", tone: "amber", focus: "ffn" },
    { id: "n3", label: "⑥ Add & Layer Norm", sub: "+ residual", tone: "teal", focus: "residual" },
    { id: "output", label: "Decoder output", sub: "to linear & softmax", tone: "gray", focus: "overview" },
  ];

  return (
    <div className="flex flex-col">
      {blocks.map((b, idx) => (
        <div key={b.id}>
          <motion.button
            type="button"
            layout={!reducedMotion}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
                large ? "text-base md:text-lg" : "text-base font-medium md:text-lg",
              )}
            >
              {b.sub}
            </span>
          </motion.button>
          {idx < blocks.length - 1 && <ArrowDown large={large} />}
        </div>
      ))}
    </div>
  );
}
