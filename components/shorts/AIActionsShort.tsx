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
    id: "alone",
    title: "Claude is just a model — it writes text",
    subtitle: "On its own it can't touch your code",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "tools",
    title: "Claude Code gives it coding tools",
    subtitle: "Read, Edit, Bash, Grep — and more",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "json",
    title: "It outputs a tool call, not a reply",
    subtitle: "Structured JSON saying which tool to run",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "loop",
    title: "The agent loop: ask, run, decide, repeat",
    subtitle: "Model and tool go back and forth until done",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function AloneVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 w-full">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-violet-500/40 bg-violet-500/15"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-300">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </motion.div>
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        {["Read your files", "Edit your code", "Run the tests", "Search the codebase"].map((action, i) => (
          <motion.div
            key={action}
            initial={reduced ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 0.3, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.35 }}
            className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5"
          >
            <span className="text-2xl">🚫</span>
            <span className="text-base text-slate-500 line-through">{action}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ToolsVisual({ reduced }: { reduced: boolean }) {
  const tools = [
    { icon: "📄", name: "Read", desc: "Open a file" },
    { icon: "✏️", name: "Edit", desc: "Change the code" },
    { icon: "💻", name: "Bash", desc: "Run commands & tests" },
    { icon: "🔍", name: "Grep", desc: "Search the codebase" },
  ];
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[330px] mx-auto">
      <p className="text-base text-slate-400 text-center">Tools Claude Code gives the model</p>
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.15, duration: 0.35, type: "spring", bounce: 0.3 }}
            className="flex flex-col items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-center"
          >
            <span className="text-2xl">{tool.icon}</span>
            <p className="font-mono text-base font-semibold text-amber-200">{tool.name}</p>
            <p className="text-base leading-snug text-slate-400">{tool.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function JsonVisual({ reduced }: { reduced: boolean }) {
  const lines = [
    { text: "{",                          indent: 0 },
    { text: '  "tool": "Read",',          indent: 1 },
    { text: '  "args": {',                indent: 1 },
    { text: '    "path": "auth.ts"',      indent: 2 },
    { text: "  }",                        indent: 1 },
    { text: "}",                          indent: 0 },
  ];
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full">
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 w-full max-w-[300px] text-center">
        <p className="text-base text-slate-300">You: <span className="text-teal-200 font-semibold">&ldquo;Fix the failing test in auth.ts&rdquo;</span></p>
      </div>
      <div className="w-full max-w-[300px] rounded-xl border border-slate-600 bg-slate-900 p-4 space-y-1">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Claude&apos;s output (not a reply)</p>
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.12, duration: 0.25 }}
            className="font-mono text-base text-teal-200"
            style={{ paddingLeft: line.indent * 16 }}
          >
            {line.text}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

type LoopPhase = "ask" | "run" | "result" | "decide";

function LoopVisual({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState<LoopPhase>("ask");

  const phases: { id: LoopPhase; label: string; icon: string; color: string }[] = [
    { id: "ask",    label: "Ask",    icon: "🧠", color: "teal" },
    { id: "run",    label: "Run",    icon: "⚙️", color: "amber" },
    { id: "result", label: "Result", icon: "📦", color: "violet" },
    { id: "decide", label: "Decide", icon: "🔁", color: "blue" },
  ];

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[330px] mx-auto">
      <p className="text-base text-slate-400 text-center leading-snug">
        &ldquo;Fix the failing test in auth.ts&rdquo;
      </p>

      {/* Phase tabs — one card visible at a time */}
      <div className="grid grid-cols-4 gap-1.5">
        {phases.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPhase(p.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl border py-2 px-1 text-sm font-bold transition",
              phase === p.id
                ? p.color === "teal"
                  ? "border-teal-400/50 bg-teal-500/20 text-teal-100"
                  : p.color === "amber"
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                    : p.color === "violet"
                      ? "border-violet-400/50 bg-violet-500/20 text-violet-100"
                      : "border-blue-400/50 bg-blue-500/20 text-blue-100"
                : "border-slate-600/60 bg-slate-800/50 text-slate-400 hover:text-slate-200",
            )}
          >
            <span className="text-base">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === "ask" && (
          <motion.div
            key="ask"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-teal-400/30 bg-teal-500/10 p-4 space-y-2"
          >
            <p className="text-base font-bold text-teal-200">🧠 The model decides: call a tool</p>
            <p className="font-mono text-base text-teal-100">Read( &ldquo;auth.ts&rdquo; )</p>
            <p className="text-base text-slate-300 leading-snug">The model only sends this request — it never runs code itself.</p>
          </motion.div>
        )}
        {phase === "run" && (
          <motion.div
            key="run"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 space-y-2"
          >
            <p className="text-base font-bold text-amber-200">⚙️ Claude Code executes it</p>
            <p className="text-base text-slate-100 leading-snug">Opens auth.ts and reads the file on disk.</p>
            <p className="text-base text-slate-300 leading-snug">This part is plain code — no model involved.</p>
          </motion.div>
        )}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-4 space-y-2"
          >
            <p className="text-base font-bold text-violet-200">📦 Result goes back to the model</p>
            <p className="text-base text-slate-100 leading-snug">File contents added to the conversation as text.</p>
            <p className="text-base text-slate-300 leading-snug">The model reads this like a message, not a file.</p>
          </motion.div>
        )}
        {phase === "decide" && (
          <motion.div
            key="decide"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 space-y-2"
          >
            <p className="text-base font-bold text-blue-200">🔁 The model decides what&apos;s next</p>
            <div className="flex items-center gap-2 rounded-lg border border-slate-600/60 bg-slate-900/60 px-3 py-2">
              <span className="text-lg">↩️</span>
              <p className="text-base text-slate-200 leading-snug">Still broken → asks for another tool</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-600/60 bg-slate-900/60 px-3 py-2">
              <span className="text-lg">✅</span>
              <p className="text-base text-slate-200 leading-snug">Fixed → writes the final reply to you</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AIActionsShort() {
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

  useEffect(() => { setProgress(0); }, [stepIndex]);

  function renderVisual(id: string) {
    switch (id) {
      case "alone":   return <AloneVisual   reduced={reducedMotion} />;
      case "tools":   return <ToolsVisual   reduced={reducedMotion} />;
      case "json":    return <JsonVisual    reduced={reducedMotion} />;
      case "loop":    return <LoopVisual    reduced={reducedMotion} />;
      default:        return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Badge + dots */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest", step.badgeColor)}>
          Claude Code
        </span>
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button key={i} type="button" onClick={() => goToStep(i)} aria-label={`Step ${i + 1}`}
              className={cn("h-1.5 rounded-full transition-all duration-300", i === stepIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50")} />
          ))}
        </div>
      </div>

      {/* Title */}
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

      {/* Animation zone */}
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

      {/* Subtitle */}
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

      {/* Controls */}
      <div className="px-5 pb-5 pt-2 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Previous step">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" onClick={() => setIsPlaying(p => !p)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:scale-105 transition"
            aria-label={isPlaying ? "Pause" : "Play"}>
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
          <button type="button" onClick={goNext}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Next step">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div className="h-full rounded-full bg-white/70" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-center text-xs font-medium text-white/40 tracking-widest uppercase">
          {stepIndex + 1} / {STEPS.length}
        </p>
      </div>
    </div>
  );
}
