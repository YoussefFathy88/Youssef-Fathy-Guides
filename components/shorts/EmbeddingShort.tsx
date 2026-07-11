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
    title: "Cosine similarity: the angle becomes a score",
    subtitle: "1 = same meaning · 0 = unrelated",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "apps",
    title: "Embeddings capture meaning",
    subtitle: "One idea behind search, RAG, and more",
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

const VEC_ORIGIN = { x: 36, y: 172 };

interface WordVector {
  text: string;
  tip: { x: number; y: number };
  group: "royalty" | "animal";
}

// Royalty vectors point the same way (small angle); animals point elsewhere.
const WORD_VECTORS: WordVector[] = [
  { text: "queen",  tip: { x: 115, y: 45 },  group: "royalty" },
  { text: "king",   tip: { x: 129, y: 61 },  group: "royalty" },
  { text: "prince", tip: { x: 85,  y: 62 },  group: "royalty" },
  { text: "cat",    tip: { x: 187, y: 105 }, group: "animal" },
  { text: "dog",    tip: { x: 213, y: 141 }, group: "animal" },
];

function MeaningVisual({ reduced }: { reduced: boolean }) {
  // Draw the line a touch short of the tip so the arrowhead clears the chip.
  const drawEnd = (tip: { x: number; y: number }) => ({
    x: VEC_ORIGIN.x + (tip.x - VEC_ORIGIN.x) * 0.86,
    y: VEC_ORIGIN.y + (tip.y - VEC_ORIGIN.y) * 0.86,
  });

  return (
    <div className="flex flex-col items-center gap-3 px-4 w-full">
      <p className="text-base text-slate-400 text-center">Each word is an arrow from the origin</p>

      <div className="relative w-full max-w-[300px] h-[200px] rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
        <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full">
          <defs>
            <marker id="arw-teal" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#2dd4bf" />
            </marker>
            <marker id="arw-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#fbbf24" />
            </marker>
          </defs>

          {/* Faint axes */}
          <line x1={VEC_ORIGIN.x} y1={VEC_ORIGIN.y} x2={290} y2={VEC_ORIGIN.y} stroke="#334155" strokeWidth={1.5} />
          <line x1={VEC_ORIGIN.x} y1={VEC_ORIGIN.y} x2={VEC_ORIGIN.x} y2={18} stroke="#334155" strokeWidth={1.5} />

          {/* Small-angle arc between king & queen */}
          <motion.path
            d="M69.4 132.2 A52 52 0 0 0 63.4 127.9"
            fill="none"
            stroke="#5eead4"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 1.1 }}
          />

          {/* Vectors */}
          {WORD_VECTORS.map((v, i) => {
            const end = drawEnd(v.tip);
            const isRoyalty = v.group === "royalty";
            return (
              <motion.line
                key={v.text}
                x1={VEC_ORIGIN.x}
                y1={VEC_ORIGIN.y}
                x2={end.x}
                y2={end.y}
                stroke={isRoyalty ? "#2dd4bf" : "#fbbf24"}
                strokeWidth={3}
                strokeLinecap="round"
                markerEnd={isRoyalty ? "url(#arw-teal)" : "url(#arw-amber)"}
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: reduced ? 0 : i * 0.22, duration: 0.45, ease: "easeOut" }}
              />
            );
          })}
        </svg>

        {/* Word chips at each arrow tip */}
        {WORD_VECTORS.map((v, i) => (
          <motion.span
            key={v.text}
            initial={reduced ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.22 + 0.3, duration: 0.3, type: "spring", bounce: 0.45 }}
            style={{ left: `${(v.tip.x / 300) * 100}%`, top: `${(v.tip.y / 200) * 100}%` }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2.5 py-1 text-base font-semibold",
              v.group === "royalty"
                ? "border-teal-400/50 bg-teal-500/25 text-teal-100"
                : "border-amber-400/50 bg-amber-500/25 text-amber-100",
            )}
          >
            {v.text}
          </motion.span>
        ))}
      </div>

      <motion.p
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.2 }}
        className="text-center text-base font-semibold text-teal-200"
      >
        Related words point the same way → small angle
      </motion.p>
    </div>
  );
}

function DistanceVisual({ reduced }: { reduced: boolean }) {
  const pairs = [
    { b: "cat",      label: "same direction", score: 0.91, color: "bg-teal-500" },
    { b: "car",      label: "wide angle",     score: 0.30, color: "bg-amber-500" },
    { b: "asteroid", label: "near 90°",       score: 0.08, color: "bg-rose-500" },
  ];

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      {/* Angle → score concept diagram */}
      <div className="relative w-full">
        <svg viewBox="0 0 280 96" className="w-full h-[96px]">
          <defs>
            <marker id="cs-arw" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#5eead4" />
            </marker>
          </defs>
          {/* two vectors with a small angle */}
          <motion.line
            x1={24} y1={84} x2={150} y2={20}
            stroke="#2dd4bf" strokeWidth={3} strokeLinecap="round" markerEnd="url(#cs-arw)"
            initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
          />
          <motion.line
            x1={24} y1={84} x2={168} y2={48}
            stroke="#2dd4bf" strokeWidth={3} strokeLinecap="round" markerEnd="url(#cs-arw)"
            initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: reduced ? 0 : 0.2, duration: 0.5 }}
          />
          {/* angle arc */}
          <motion.path
            d="M64 68 A46 46 0 0 1 76 56" fill="none" stroke="#5eead4" strokeWidth={2.5} strokeLinecap="round"
            initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 0.7 }}
          />
          <text x={84} y={66} fill="#99f6e4" fontSize={18} fontWeight={700}>θ</text>
        </svg>
        <p className="text-center text-base text-slate-300">
          <span className="font-bold text-teal-200">cos(θ)</span> — smaller angle, higher score
        </p>
      </div>

      {pairs.map((pair, i) => (
        <motion.div
          key={pair.b}
          initial={reduced ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : 0.6 + i * 0.3, duration: 0.4 }}
          className="space-y-1.5"
        >
          <div className="flex justify-between text-base">
            <span className="text-slate-200">
              <span className="text-blue-300 font-semibold">dog</span>
              {" "}vs{" "}
              <span className="text-blue-300 font-semibold">{pair.b}</span>
            </span>
            <span className="font-mono font-semibold text-teal-200">{pair.score.toFixed(2)}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className={cn("h-full rounded-full", pair.color)}
              initial={{ width: "0%" }}
              animate={{ width: `${pair.score * 100}%` }}
              transition={{ delay: reduced ? 0 : 0.6 + i * 0.3 + 0.2, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}

      <p className="text-center text-base text-slate-400">1 = same · 0 = unrelated · illustrative</p>
    </div>
  );
}

function AppsVisual({ reduced }: { reduced: boolean }) {
  const apps = [
    { name: "Semantic search", desc: "find by meaning" },
    { name: "LLMs", desc: "understand text" },
  ];

  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        className="w-full rounded-2xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-center"
      >
        <p className="text-lg font-bold text-rose-100 leading-snug">
          Similar meaning → similar vectors
        </p>
      </motion.div>

      <p className="text-base text-slate-400 text-center">That one idea powers…</p>

      <div className="grid grid-cols-2 gap-3 w-full">
        {apps.map((app, i) => (
          <motion.div
            key={app.name}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.3 + i * 0.15, duration: 0.35, type: "spring", bounce: 0.35 }}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-center"
          >
            <p className="text-base font-bold text-rose-100">{app.name}</p>
            <p className="text-base text-slate-400 leading-snug">{app.desc}</p>
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
      case "apps":     return <AppsVisual     reduced={reducedMotion} />;
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
