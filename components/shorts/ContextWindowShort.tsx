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
    id: "memory",
    title: "AI can't remember past its window",
    subtitle: "It only sees what fits in one request",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "budget",
    title: "Every token costs from the budget",
    subtitle: "Prompt, history, and reply all share it",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "cutoff",
    title: "Old messages get cut off first",
    subtitle: "Anything outside the window is forgotten",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "growth",
    title: "Context windows grew 20,000×",
    subtitle: "GPT-1 had 512 tokens. Some models now 10M.",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "scale",
    title: "1 million tokens ≈ 750,000 words",
    subtitle: "Modern models can read entire books at once",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function MemoryVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 w-full">
      <div className="w-full max-w-[300px] rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Context Window</p>
        {["Message 1", "Message 2", "Message 3", "Your question", "AI answer"].map((label, i) => (
          <motion.div
            key={label}
            initial={reduced ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.35 }}
            className="flex items-center gap-3"
          >
            <div className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
            <span className="text-base text-slate-200">{label}</span>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.2 }}
        className="text-base text-slate-400 text-center"
      >
        Everything inside ↑ is what the AI &ldquo;sees&rdquo;
      </motion.p>
    </div>
  );
}

function BudgetVisual({ reduced }: { reduced: boolean }) {
  const parts = [
    { label: "System prompt", pct: 15, color: "bg-violet-500" },
    { label: "Chat history", pct: 40, color: "bg-amber-500" },
    { label: "Your message", pct: 20, color: "bg-teal-500" },
    { label: "AI reply", pct: 25, color: "bg-blue-500" },
  ];
  return (
    <div className="flex flex-col gap-5 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-base text-slate-400 text-center">Token budget breakdown</p>
      <div className="flex h-8 w-full overflow-hidden rounded-full">
        {parts.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ width: "0%" }}
            animate={{ width: `${p.pct}%` }}
            transition={{ delay: reduced ? 0 : i * 0.25, duration: 0.5, ease: "easeOut" }}
            className={cn("h-full", p.color)}
          />
        ))}
      </div>
      <div className="space-y-2">
        {parts.map((p, i) => (
          <motion.div
            key={p.label}
            initial={reduced ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.25, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className={cn("h-3 w-3 rounded-full shrink-0", p.color)} />
            <span className="text-base text-slate-200">{p.label}</span>
            <span className="ml-auto text-base text-slate-400">{p.pct}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CutoffVisual({ reduced }: { reduced: boolean }) {
  const messages = [
    { label: "Day 1 chat", faded: true },
    { label: "Day 2 chat", faded: true },
    { label: "Day 3 chat", faded: false },
    { label: "Your question", faded: false },
  ];
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-base text-slate-400 text-center">Older context is forgotten first</p>
      {messages.map((msg, i) => (
        <motion.div
          key={msg.label}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: msg.faded ? 0.3 : 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.4 }}
          className={cn(
            "w-full rounded-xl border px-4 py-3 text-base font-medium",
            msg.faded
              ? "border-slate-700 bg-slate-800/50 text-slate-500 line-through"
              : "border-teal-500/40 bg-teal-500/15 text-teal-200",
          )}
        >
          {msg.label}
        </motion.div>
      ))}
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.4 }}
        className="text-sm text-slate-500 text-center"
      >
        Strikethrough = outside the window
      </motion.p>
    </div>
  );
}

function GrowthVisual({ reduced }: { reduced: boolean }) {
  const rows = [
    { model: "GPT-1 (2018)",      tokens: "512",   bar: 2 },
    { model: "GPT-4 (2023)",      tokens: "8K",    bar: 20 },
    { model: "GPT-4 Turbo",       tokens: "128K",  bar: 55 },
    { model: "Claude / Gemini",   tokens: "1M",    bar: 80 },
    { model: "Llama 4 Scout",     tokens: "10M",   bar: 100 },
  ];
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      {rows.map((row, i) => (
        <motion.div
          key={row.model}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.35 }}
          className="space-y-1"
        >
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">{row.model}</span>
            <span className="font-mono text-blue-300 font-semibold">{row.tokens}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              initial={{ width: "0%" }}
              animate={{ width: `${row.bar}%` }}
              transition={{ delay: reduced ? 0 : i * 0.2 + 0.2, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ScaleVisual({ reduced }: { reduced: boolean }) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFill(100), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 px-6 w-full">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center"
      >
        <p className="text-6xl font-bold font-mono text-rose-300">1M</p>
        <p className="mt-1 text-base text-slate-400">tokens</p>
      </motion.div>
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Context fill</span>
          <span>≈ 750K words</span>
        </div>
        <div className="h-5 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
            initial={{ width: "0%" }}
            animate={{ width: `${fill}%` }}
            transition={{ duration: reduced ? 0 : 1.5, ease: "easeInOut", delay: 0.3 }}
          />
        </div>
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.2, duration: 0.4 }}
        className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-center"
      >
        <p className="text-base text-rose-200">
          Roughly the whole Harry Potter series in one prompt
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ContextWindowShort() {
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
      case "memory": return <MemoryVisual reduced={reducedMotion} />;
      case "budget": return <BudgetVisual reduced={reducedMotion} />;
      case "cutoff": return <CutoffVisual reduced={reducedMotion} />;
      case "growth": return <GrowthVisual reduced={reducedMotion} />;
      case "scale":  return <ScaleVisual  reduced={reducedMotion} />;
      default:       return null;
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
          Context Window
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
