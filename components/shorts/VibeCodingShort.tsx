"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Step data ────────────────────────────────────────────────────────────────

interface Step {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeColor: string;
}

const STEPS: Step[] = [
  {
    id: "hook",
    title: "Same prompt. Two different developers.",
    subtitle: "\"Build me a login system\" — then everything diverges",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "vibe",
    title: "Vibe coding: never look at the code",
    subtitle: "Karpathy's term, Feb 2025 — accept it and move on",
    accentColor: "text-pink-300",
    badgeColor: "bg-pink-500/20 text-pink-200 border-pink-500/30",
  },
  {
    id: "engineering",
    title: "AI engineering: every step checked",
    subtitle: "The human plans, reviews, and owns the result",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "contrast",
    title: "Right tool, right context",
    subtitle: "Neither one is always the correct choice",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "rule",
    title: "Throwaway? Vibe. Must last? Engineer.",
    subtitle: "Pick the discipline that matches the stakes",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function HookVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-3 py-2.5"
      >
        <p className="text-base font-bold text-violet-200 mb-0.5">Prompt</p>
        <p className="text-lg font-semibold text-white">Build me a login system</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-2">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : 0.25, duration: 0.35 }}
          className="rounded-xl border border-pink-500/30 bg-pink-500/10 px-2.5 py-2 flex flex-col gap-1.5"
        >
          <p className="text-base font-bold text-pink-200">Dev A</p>
          <p className="text-base font-semibold leading-snug text-white">
            Accepts every suggestion. Ships in 10 minutes.
          </p>
          <span className="self-start mt-1 rounded-full border border-pink-400/40 bg-pink-500/20 px-2 py-0.5 text-base font-bold text-pink-200">
            Vibe coding
          </span>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : 0.45, duration: 0.35 }}
          className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-2.5 py-2 flex flex-col gap-1.5"
        >
          <p className="text-base font-bold text-teal-200">Dev B</p>
          <p className="text-base font-semibold leading-snug text-white">
            Reads the diff. Runs the tests. Ships in an hour.
          </p>
          <span className="self-start mt-1 rounded-full border border-teal-400/40 bg-teal-500/20 px-2 py-0.5 text-base font-bold text-teal-200">
            AI engineering
          </span>
        </motion.div>
      </div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.75, duration: 0.35 }}
        className="text-center text-lg font-bold text-white"
      >
        Same feature. Who regrets it later? 🤔
      </motion.p>
    </div>
  );
}

function VibeVisual({ reduced }: { reduced: boolean }) {
  const lines = [
    { text: "+ const login = (u, p) => {", ok: true },
    { text: "+   return db.query(u + p)", ok: false },
    { text: "+ }", ok: true },
    { text: "+ // looks good, ship it", ok: true },
  ];

  return (
    <div className="flex flex-col gap-2.5 px-4 w-full max-w-[320px] mx-auto rounded-2xl bg-pink-500/5 py-3">
      <div className="rounded-xl border border-pink-500/30 bg-slate-950 px-3 py-2.5 font-mono text-base">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.2 }}
            className={cn("leading-relaxed", line.ok ? "text-emerald-400" : "text-emerald-400")}
          >
            {line.text}
          </motion.p>
        ))}
        <motion.span
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.3, duration: 0.2 }}
          className="inline-block rounded bg-pink-500/30 px-2 py-0.5 text-base font-bold text-pink-200"
        >
          auto-accepted ✓
        </motion.span>
      </div>

      <p className="text-center text-base text-slate-400">
        No diff read. No test run. Merged.
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {["⚡ Fast", "🎲 No review", "🧩 Grows on its own"].map((label, i) => (
          <motion.span
            key={label}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 1.6 + i * 0.15, duration: 0.3 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-pink-400/40 bg-pink-500/20 px-3 py-1.5 text-base font-semibold text-pink-200"
          >
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

const ENGINEERING_NODES = ["Plan", "Implement", "Review", "Test", "Ship"];
const ENGINEERING_STEP_MS = 500;
const ENGINEERING_HOLD_MS = 1200;
const ENGINEERING_CYCLE_MS =
  ENGINEERING_NODES.length * ENGINEERING_STEP_MS + ENGINEERING_HOLD_MS;

function EngineeringVisual({ reduced }: { reduced: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, ENGINEERING_STEP_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const elapsed = (tick * ENGINEERING_STEP_MS) % ENGINEERING_CYCLE_MS;
  const activeCount = reduced
    ? ENGINEERING_NODES.length
    : Math.min(Math.floor(elapsed / ENGINEERING_STEP_MS) + 1, ENGINEERING_NODES.length);

  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[320px] mx-auto rounded-2xl bg-teal-500/5 py-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-teal-500/20" />
        {ENGINEERING_NODES.map((node, i) => {
          const active = i < activeCount;
          return (
            <div key={node} className="relative z-10 flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  opacity: active ? 1 : 0.3,
                  scale: active ? 1 : 0.85,
                  backgroundColor: active ? "rgba(20,184,166,0.9)" : "rgba(20,184,166,0.15)",
                }}
                transition={{ duration: 0.3 }}
                className="h-4 w-4 rounded-full border-2 border-teal-300"
              />
              <span className="text-base font-bold text-teal-100">{node}</span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-base text-slate-400">
        Every step checked before the next one starts
      </p>
    </div>
  );
}

function ContrastVisual({ reduced }: { reduced: boolean }) {
  const columns = [
    {
      header: "Vibe Coding",
      color: "pink" as const,
      items: ["🧪 Prototype", "🎨 Weekend project", "🗑️ Throwaway script"],
    },
    {
      header: "AI Engineering",
      color: "teal" as const,
      items: ["🏢 Production", "👥 Client work", "💰 Real money or data"],
    },
  ];

  const colorMap: Record<string, string> = {
    pink: "border-pink-500/30 bg-pink-500/10 text-pink-200",
    teal: "border-teal-500/30 bg-teal-500/10 text-teal-200",
  };

  return (
    <div className="grid grid-cols-2 gap-2.5 px-3 w-full max-w-[320px] mx-auto">
      {columns.map((col, colIdx) => (
        <div
          key={col.header}
          className={cn("flex flex-col gap-1.5 rounded-xl border px-2.5 py-2.5", colorMap[col.color])}
        >
          <p className="text-base font-bold text-white text-center">{col.header}</p>
          {col.items.map((item, i) => (
            <motion.p
              key={item}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : colIdx * 0.15 + i * 0.2, duration: 0.3 }}
              className="text-base font-medium text-white leading-snug"
            >
              {item}
            </motion.p>
          ))}
        </div>
      ))}
    </div>
  );
}

function RuleVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4 w-full max-w-[320px] mx-auto">
      <motion.p
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center text-xl font-extrabold text-pink-300 leading-snug"
      >
        If you&apos;ll throw it away — Vibe.
      </motion.p>
      <motion.p
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.6, duration: 0.4 }}
        className="text-center text-xl font-extrabold text-teal-300 leading-snug"
      >
        If it has to last — Engineer.
      </motion.p>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={
          reduced ? { opacity: 1 } : { opacity: 1, scale: [1, 1.03, 1] }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : { delay: 1.3, duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        className="text-center text-lg font-bold text-emerald-300"
      >
        Follow for more! 🔥
      </motion.p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VibeCodingShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex]!;

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((prev) => (prev + 1) % STEPS.length);
  }, []);

  const goPrev = useCallback(() => {
    setStepIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
  }, []);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function renderVisual(id: string) {
    switch (id) {
      case "hook":
        return <HookVisual reduced={reducedMotion} />;
      case "vibe":
        return <VibeVisual reduced={reducedMotion} />;
      case "engineering":
        return <EngineeringVisual reduced={reducedMotion} />;
      case "contrast":
        return <ContrastVisual reduced={reducedMotion} />;
      case "rule":
        return <RuleVisual reduced={reducedMotion} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header: badge + step dots */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor,
          )}
        >
          Vibe vs Engineering
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

      {/* Title */}
      <div className="px-5 pb-3">
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

      {/* Animation zone */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`visual-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? {} : { opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {renderVisual(step.id)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtitle strip */}
      <div className="px-5 pt-2 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`subtitle-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="rounded-xl bg-black/40 px-4 py-2.5 backdrop-blur-sm"
          >
            <p className="text-center text-base font-medium text-white">{step.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls + progress */}
      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label="Next"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white/70"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        <p className="text-center text-base font-medium uppercase tracking-widest text-white/50">
          Step {stepIndex + 1} / {STEPS.length} — tap Next
        </p>
      </div>
    </div>
  );
}
