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
    id: "problem",
    title: "Words mean nothing to math",
    subtitle: "Computers need numbers, not letters",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "vector",
    title: "Each word becomes a list of numbers",
    subtitle: "Called a vector — hundreds of values",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "meaning",
    title: "Similar words land close together",
    subtitle: '"king" and "queen" are neighbors in space',
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "distance",
    title: "Distance measures how related they are",
    subtitle: "Closer = more similar meaning",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "scale",
    title: "OpenAI uses up to 3,072 numbers per word",
    subtitle: "One point in 3,072-dimensional space",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function ProblemVisual({ reduced }: { reduced: boolean }) {
  const words = ["hello", "cat", "Paris", "happy"];
  const crosses = ["✗", "✗", "✗", "✗"];
  return (
    <div className="flex flex-col items-center gap-5 px-6 w-full">
      <p className="text-base text-slate-400 text-center">A computer sees this…</p>
      <div className="flex flex-wrap justify-center gap-3">
        {words.map((word, i) => (
          <motion.div
            key={word}
            initial={reduced ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.3, type: "spring", bounce: 0.4 }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5"
          >
            <span className="text-xl font-semibold text-slate-200">&ldquo;{word}&rdquo;</span>
            <span className="text-lg text-rose-400">{crosses[i]}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.0 }}
        className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-center"
      >
        <p className="text-base text-violet-200">…and can&apos;t compute anything with it</p>
      </motion.div>
    </div>
  );
}

function VectorVisual({ reduced }: { reduced: boolean }) {
  const nums = [0.21, -0.84, 0.57, 0.03, -0.42, 0.76, -0.19, 0.61];
  return (
    <div className="flex flex-col items-center gap-5 px-6 w-full">
      <div className="flex items-center gap-3">
        <span className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-5 py-2.5 text-xl font-bold text-amber-200">
          &ldquo;cat&rdquo;
        </span>
        <span className="text-2xl text-slate-400">→</span>
        <span className="text-base text-slate-400">numbers</span>
      </div>
      <div className="grid grid-cols-4 gap-2 w-full max-w-[300px]">
        {nums.map((n, i) => (
          <motion.div
            key={i}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.1, duration: 0.3 }}
            className={cn(
              "rounded-lg border px-2 py-2 text-center font-mono text-sm font-semibold",
              n > 0
                ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                : "border-slate-600/60 bg-slate-800/50 text-slate-400",
            )}
          >
            {n.toFixed(2)}
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.0 }}
        className="text-base text-slate-400 text-center"
      >
        …and up to 3,072 more values
      </motion.p>
    </div>
  );
}

function MeaningVisual({ reduced }: { reduced: boolean }) {
  // Simplified 2D "space" showing clusters
  const groups = [
    {
      label: "Royalty",
      words: [
        { text: "king",  x: 30, y: 28 },
        { text: "queen", x: 50, y: 22 },
        { text: "prince",x: 40, y: 45 },
      ],
      color: "bg-teal-500/25 text-teal-200 border-teal-400/40",
    },
    {
      label: "Animals",
      words: [
        { text: "cat", x: 68, y: 30 },
        { text: "dog", x: 80, y: 50 },
      ],
      color: "bg-amber-500/25 text-amber-200 border-amber-400/40",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-3 px-4 w-full">
      <p className="text-base text-slate-400 text-center">Words plotted in vector space</p>
      <div className="relative w-full max-w-[300px] h-[150px] rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
        {groups.map(group =>
          group.words.map((word, wi) => (
            <motion.span
              key={word.text}
              initial={reduced ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduced ? 0 : wi * 0.25 + groups.indexOf(group) * 0.5, duration: 0.35, type: "spring", bounce: 0.45 }}
              style={{ left: `${word.x}%`, top: `${word.y}%` }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2.5 py-1 text-base font-semibold",
                group.color,
              )}
            >
              {word.text}
            </motion.span>
          ))
        )}
        {/* Group labels */}
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.2 }}
          className="absolute bottom-2 left-3 text-xs text-teal-400 font-semibold"
        >
          Royalty cluster
        </motion.p>
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.4 }}
          className="absolute bottom-2 right-3 text-xs text-amber-400 font-semibold"
        >
          Animal cluster
        </motion.p>
      </div>
    </div>
  );
}

function DistanceVisual({ reduced }: { reduced: boolean }) {
  const pairs = [
    { a: "dog", b: "cat",      dist: "Very close",  bar: 88, color: "bg-teal-500" },
    { a: "dog", b: "car",      dist: "Far apart",   bar: 28, color: "bg-amber-500" },
    { a: "dog", b: "asteroid", dist: "Very far",    bar: 8,  color: "bg-rose-500" },
  ];
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-base text-slate-400 text-center">Similarity between &ldquo;dog&rdquo; and…</p>
      {pairs.map((pair, i) => (
        <motion.div
          key={pair.b}
          initial={reduced ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.35, duration: 0.4 }}
          className="space-y-1.5"
        >
          <div className="flex justify-between text-base">
            <span className="text-slate-200">
              <span className="text-blue-300 font-semibold">dog</span>
              {" "}vs{" "}
              <span className="text-blue-300 font-semibold">{pair.b}</span>
            </span>
            <span className="text-slate-400">{pair.dist}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className={cn("h-full rounded-full", pair.color)}
              initial={{ width: "0%" }}
              animate={{ width: `${pair.bar}%` }}
              transition={{ delay: reduced ? 0 : i * 0.35 + 0.2, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ScaleVisual({ reduced }: { reduced: boolean }) {
  const dims = [
    { label: "text-embedding-3-small", dims: 1536, color: "from-rose-600 to-rose-400", bar: 50 },
    { label: "text-embedding-3-large", dims: 3072, color: "from-rose-700 to-rose-500", bar: 100 },
  ];
  return (
    <div className="flex flex-col items-center gap-6 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center"
      >
        <p className="text-5xl font-bold font-mono text-rose-300">3,072</p>
        <p className="mt-1 text-base text-slate-400">dimensions per word</p>
      </motion.div>
      <div className="w-full space-y-4">
        {dims.map((d, i) => (
          <motion.div
            key={d.label}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.4, duration: 0.35 }}
            className="space-y-1.5"
          >
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 truncate pr-2">{d.label}</span>
              <span className="font-mono text-rose-300 font-semibold shrink-0">{d.dims.toLocaleString()}d</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", d.color)}
                initial={{ width: "0%" }}
                animate={{ width: `${d.bar}%` }}
                transition={{ delay: reduced ? 0 : i * 0.4 + 0.2, duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EmbeddingShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = STEPS[stepIndex];

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
      case "problem":  return <ProblemVisual  reduced={reducedMotion} />;
      case "vector":   return <VectorVisual   reduced={reducedMotion} />;
      case "meaning":  return <MeaningVisual  reduced={reducedMotion} />;
      case "distance": return <DistanceVisual reduced={reducedMotion} />;
      case "scale":    return <ScaleVisual    reduced={reducedMotion} />;
      default:         return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── Topic badge + step dots ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor,
          )}
        >
          Embeddings
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
                i === stepIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Title ───────────────────────────────────────────────────────────── */}
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

      {/* ── Animation zone ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
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

      {/* ── Subtitle strip ──────────────────────────────────────────────────── */}
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
            <p className="text-center text-base font-medium text-white">{step.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Controls + progress bar ──────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-2 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Previous step"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(p => !p)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:scale-105 transition"
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
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
        <p className="text-center text-xs font-medium text-white/40 tracking-widest uppercase">
          {stepIndex + 1} / {STEPS.length}
        </p>
      </div>
    </div>
  );
}
