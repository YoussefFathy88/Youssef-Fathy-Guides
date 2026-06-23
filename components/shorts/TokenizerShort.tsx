"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Step data ────────────────────────────────────────────────────────────────

const STEP_DURATION_MS = 3800;

interface Step {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeColor: string;
}

const STEPS: Step[] = [
  {
    id: "tokenByToken",
    title: "AI reads your prompt piece by piece",
    subtitle: "It never sees the whole sentence as raw letters",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "splitting",
    title: "Text splits into tokens",
    subtitle: "These pieces are called tokens",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "ids",
    title: "Every token maps to a number",
    subtitle: "The model only sees IDs from its vocabulary",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "vocabProblem",
    title: "A full-word dictionary explodes",
    subtitle: "Grammar forms and languages multiply entries",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "bpe",
    title: "BPE merges frequent pieces",
    subtitle: "Common chunks become tokens — rare words get split",
    accentColor: "text-indigo-300",
    badgeColor: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30",
  },
  {
    id: "contextWindow",
    title: "GPT-4 holds 128,000 tokens at once",
    subtitle: "Prompt and reply share this window",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

// ─── Shared example (cl100k_base / GPT-4 tokenizer) ───────────────────────────

const EXAMPLE_PROMPT = "How AI models works?";

interface ExampleToken {
  str: string;
  display: string;
  id: number;
  start: number;
  end: number;
}

/** Verified via js-tiktoken encodingForModel("gpt-4") */
const EXAMPLE_TOKENS: ExampleToken[] = [
  { str: "How",     display: "How",    id: 4438,  start: 0,  end: 3  },
  { str: " AI",     display: "AI",     id: 15592, start: 3,  end: 6  },
  { str: " models", display: "models", id: 4211,  start: 6,  end: 13 },
  { str: " works",  display: "works",  id: 4375,  start: 13, end: 19 },
  { str: "?",       display: "?",      id: 30,    start: 19, end: 20 },
];

const CONTEXT_WINDOW = 128_000;

// ─── Token color palette ──────────────────────────────────────────────────────

const TOKEN_CHIP_COLORS = [
  { bg: "bg-violet-500/25", text: "text-violet-200", border: "border-violet-400/40" },
  { bg: "bg-amber-500/25",  text: "text-amber-200",  border: "border-amber-400/40"  },
  { bg: "bg-teal-500/25",   text: "text-teal-200",   border: "border-teal-400/40"   },
  { bg: "bg-blue-500/25",   text: "text-blue-200",   border: "border-blue-400/40"   },
  { bg: "bg-rose-500/25",   text: "text-rose-200",   border: "border-rose-400/40"   },
  { bg: "bg-indigo-500/25", text: "text-indigo-200", border: "border-indigo-400/40" },
  { bg: "bg-emerald-500/25", text: "text-emerald-200", border: "border-emerald-400/40" },
];

function chipColor(i: number) {
  return TOKEN_CHIP_COLORS[i % TOKEN_CHIP_COLORS.length]!;
}

function TokenChip({
  label,
  color,
  className,
}: {
  label: string;
  color: (typeof TOKEN_CHIP_COLORS)[number];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-xl border px-4 py-2 font-mono text-lg font-semibold",
        color.bg,
        color.text,
        color.border,
        className,
      )}
    >
      {label}
    </span>
  );
}

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function TokenByTokenVisual({ reduced }: { reduced: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % EXAMPLE_TOKENS.length);
    }, 650);
    return () => clearInterval(timer);
  }, [reduced]);

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      <p className="text-center font-mono text-xl leading-relaxed">
        {EXAMPLE_TOKENS.map((tok, i) => {
          const isActive = i === active;
          return (
            <span key={tok.id} className="relative inline-block align-baseline">
              {isActive && (
                <motion.span
                  layoutId={reduced ? undefined : "token-highlight"}
                  className="absolute inset-0 rounded-md bg-violet-500/30 ring-2 ring-violet-400/60"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative inline-block px-0.5 py-0.5",
                  isActive ? "text-white" : "text-slate-400/50",
                )}
              >
                {EXAMPLE_PROMPT.slice(tok.start, tok.end)}
              </span>
            </span>
          );
        })}
      </p>
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.8 }}
        className="text-center text-base text-slate-400"
      >
        One piece at a time — not all at once
      </motion.p>
    </div>
  );
}

function SplittingVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-8 px-6">
      <p className="font-mono text-xl text-slate-300">&quot;{EXAMPLE_PROMPT}&quot;</p>
      <motion.div
        initial={reduced ? false : { opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.4 }}
        className="h-px w-32 bg-gradient-to-r from-transparent via-slate-500 to-transparent"
      />
      <div className="flex flex-wrap items-center justify-center gap-3">
        {EXAMPLE_TOKENS.map((tok, i) => {
          const color = chipColor(i);
          return (
            <motion.div
              key={tok.id}
              initial={reduced ? false : { opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: reduced ? 0 : 0.3 + i * 0.22,
                duration: 0.35,
                type: "spring",
                bounce: 0.4,
              }}
              className={cn(
                "rounded-xl border px-4 py-3 font-mono text-xl font-semibold",
                color.bg,
                color.text,
                color.border,
              )}
            >
              {tok.display}
            </motion.div>
          );
        })}
      </div>
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.2 }}
        className="text-center text-base text-slate-400"
      >
        {EXAMPLE_TOKENS.length} tokens — not {EXAMPLE_PROMPT.length} characters
      </motion.p>
    </div>
  );
}

function IdsVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4">
      <p className="text-base text-slate-400">Each token maps to one vocabulary row</p>
      <div className="flex w-full max-w-[320px] flex-col gap-3">
        {EXAMPLE_TOKENS.map((tok, i) => {
          const color = chipColor(i);
          return (
            <motion.div
              key={tok.id}
              initial={reduced ? false : { opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.28, duration: 0.4 }}
              className="flex items-center justify-between gap-3"
            >
              <TokenChip label={tok.display} color={color} />
              <span className="text-lg text-slate-500">→</span>
              <div className="text-right">
                <span className="font-mono text-xl font-bold text-slate-200">
                  {tok.id.toLocaleString()}
                </span>
                <p className="text-base text-slate-500">vocabulary</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const VOCAB_PROBLEM_ROWS = [
  {
    label: "Grammar forms",
    words: ["run", "ran", "running", "runs"],
    count: "4",
    caption: "dictionary rows for one verb — each form is separate",
  },
  {
    label: "Languages",
    words: ["Hello", "مرحبا"],
    count: "50,000+",
    caption: "entries if every language gets its own word list",
  },
];

function VocabProblemVisual({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState(0);
  const row = VOCAB_PROBLEM_ROWS[phase]!;

  const goPrev = () => setPhase(prev => Math.max(prev - 1, 0));
  const goNext = () => setPhase(prev => Math.min(prev + 1, VOCAB_PROBLEM_ROWS.length - 1));

  return (
    <div className="flex flex-col items-center gap-5 px-4">
      <motion.p
        key={row.count}
        initial={reduced ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="font-mono text-5xl font-bold text-blue-300"
      >
        {row.count}
      </motion.p>
      <p className="text-center text-base text-slate-400">{row.caption}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={row.label}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="flex w-full max-w-[320px] flex-col items-center gap-3"
        >
          <p className="text-base font-bold text-blue-200">{row.label}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {row.words.map(word => (
              <span
                key={word}
                className="inline-block rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-lg text-slate-200"
              >
                {word}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex w-full max-w-[280px] flex-col items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          {VOCAB_PROBLEM_ROWS.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setPhase(i)}
              aria-label={r.label}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === phase ? "w-5 bg-blue-300" : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={phase === 0}
            aria-label="Previous example"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-white transition",
              phase === 0 ? "bg-white/5 text-white/30" : "bg-white/10 hover:bg-white/20",
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="min-w-[7rem] text-center text-base font-medium text-slate-300">
            {phase + 1} / {VOCAB_PROBLEM_ROWS.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={phase === VOCAB_PROBLEM_ROWS.length - 1}
            aria-label="Next example"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-white transition",
              phase === VOCAB_PROBLEM_ROWS.length - 1
                ? "bg-white/5 text-white/30"
                : "bg-white/10 hover:bg-white/20",
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const BPE_WORD_PARTS = [
  { str: "un", display: "un", color: TOKEN_CHIP_COLORS[2]! },
  { str: "believ", display: "believ", color: TOKEN_CHIP_COLORS[0]! },
  { str: "able", display: "able", color: TOKEN_CHIP_COLORS[4]! },
];

function BpeVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4">
      <p className="font-mono text-lg text-slate-300">&quot;unbelievable&quot;</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {BPE_WORD_PARTS.map((part, i) => (
          <span key={part.str} className="flex items-center gap-2">
            <motion.span
              initial={reduced ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: reduced ? 0 : 0.2 + i * 0.2,
                type: "spring",
                bounce: 0.35,
              }}
            >
              <TokenChip label={part.display} color={part.color} />
            </motion.span>
            {i < BPE_WORD_PARTS.length - 1 && (
              <span className="text-base text-slate-500">+</span>
            )}
          </span>
        ))}
      </div>
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.9 }}
        className="text-center text-base text-slate-400"
      >
        Not every word is one token
      </motion.p>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.1 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {EXAMPLE_TOKENS.map((tok, i) => (
          <TokenChip key={tok.id} label={tok.display} color={chipColor(i)} className="px-3 py-1.5 text-base" />
        ))}
      </motion.div>
    </div>
  );
}

function ContextWindowVisual({ reduced }: { reduced: boolean }) {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setFill(100), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-6 px-6">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center"
      >
        <p className="font-mono text-5xl font-bold text-rose-300">128K</p>
        <p className="mt-1 text-base text-slate-400">tokens at once</p>
      </motion.div>

      <div className="w-full space-y-2">
        <div className="flex justify-between text-base text-slate-400">
          <span>Context window</span>
          <span>GPT-4 Turbo</span>
        </div>
        <div className="h-5 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
            initial={{ width: "0%" }}
            animate={{ width: `${fill}%` }}
            transition={{ duration: reduced ? 0 : 1.5, ease: "easeInOut", delay: 0.3 }}
          />
        </div>
        <p className="text-center text-base text-slate-400">
          {CONTEXT_WINDOW.toLocaleString()} tokens — prompt + reply share it
        </p>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.2, duration: 0.4 }}
        className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-center"
      >
        <p className="text-base text-rose-200">
          Roughly 75,000–100,000 words fit in one window
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TokenizerShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = STEPS[stepIndex]!;

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setStepIndex(prev => (prev + 1) % STEPS.length);
    setProgress(0);
  }, []);

  const goPrev = useCallback(() => {
    setStepIndex(prev => (prev - 1 + STEPS.length) % STEPS.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (tickRef.current) clearInterval(tickRef.current);

    if (!isPlaying) return;

    const tickMs = 50;
    tickRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + (tickMs / STEP_DURATION_MS) * 100, 100));
    }, tickMs);

    intervalRef.current = setInterval(() => {
      setStepIndex(prev => (prev + 1) % STEPS.length);
      setProgress(0);
    }, STEP_DURATION_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isPlaying, stepIndex]);

  useEffect(() => {
    setProgress(0);
  }, [stepIndex]);

  function renderVisual(id: string) {
    switch (id) {
      case "tokenByToken":  return <TokenByTokenVisual   reduced={reducedMotion} />;
      case "splitting":     return <SplittingVisual      reduced={reducedMotion} />;
      case "ids":           return <IdsVisual            reduced={reducedMotion} />;
      case "vocabProblem":  return <VocabProblemVisual   reduced={reducedMotion} />;
      case "bpe":           return <BpeVisual            reduced={reducedMotion} />;
      case "contextWindow": return <ContextWindowVisual  reduced={reducedMotion} />;
      default:              return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor,
          )}
        >
          Tokenization
        </span>

        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToStep(i)}
              aria-label={`Step ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === stepIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>

      <div className="px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={`title-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className={cn("text-2xl font-bold leading-tight", step.accentColor)}
          >
            {step.title}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`visual-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? {} : { opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            {renderVisual(step.id)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 pt-3 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`subtitle-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="rounded-xl bg-black/40 px-4 py-2.5 backdrop-blur-sm"
          >
            <p className="text-center text-base font-medium text-white">
              {step.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous step"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(p => !p)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="translate-x-0.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Next step"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white/70"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center text-xs font-medium uppercase tracking-widest text-white/40">
          {stepIndex + 1} / {STEPS.length}
        </p>
      </div>
    </div>
  );
}
