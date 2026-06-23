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
    title: "AI can't do anything alone",
    subtitle: "It only generates text — nothing more",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "tools",
    title: "You give it a list of tools",
    subtitle: "Search, send email, run code, call an API",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "json",
    title: "It outputs a tool call, not an answer",
    subtitle: "A JSON saying which tool to run and how",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "execute",
    title: "Your app runs the tool, not the AI",
    subtitle: "The result is sent back so AI can continue",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "chain",
    title: "Chain tools = autonomous agents",
    subtitle: "Search → read → write → reply, automatically",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
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
        {["Browse the web", "Send an email", "Run code", "Read files"].map((action, i) => (
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
    { icon: "🔍", name: "web_search",   desc: "Search the internet" },
    { icon: "📧", name: "send_email",   desc: "Send an email" },
    { icon: "💻", name: "run_code",     desc: "Execute Python" },
    { icon: "📁", name: "read_file",    desc: "Read a document" },
  ];
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-base text-slate-400 text-center">Tools you register for the AI</p>
      {tools.map((tool, i) => (
        <motion.div
          key={tool.name}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.35, type: "spring", bounce: 0.3 }}
          className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
        >
          <span className="text-2xl">{tool.icon}</span>
          <div>
            <p className="font-mono text-base font-semibold text-amber-200">{tool.name}</p>
            <p className="text-sm text-slate-400">{tool.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function JsonVisual({ reduced }: { reduced: boolean }) {
  const lines = [
    { text: "{",                              indent: 0 },
    { text: '  "tool": "web_search",',        indent: 1 },
    { text: '  "args": {',                    indent: 1 },
    { text: '    "query": "AAPL stock price"', indent: 2 },
    { text: "  }",                            indent: 1 },
    { text: "}",                              indent: 0 },
  ];
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full">
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 w-full max-w-[300px] text-center">
        <p className="text-base text-slate-300">User: <span className="text-teal-200 font-semibold">&ldquo;What&apos;s Apple&apos;s stock price?&rdquo;</span></p>
      </div>
      <div className="w-full max-w-[300px] rounded-xl border border-slate-600 bg-slate-900 p-4 space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">AI output (not an answer)</p>
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

function ExecuteVisual({ reduced }: { reduced: boolean }) {
  const steps = [
    { from: "AI",       arrow: "→", to: "App",     label: "Tool call JSON",      color: "text-teal-300" },
    { from: "App",      arrow: "→", to: "API",     label: "Calls web_search()",  color: "text-amber-300" },
    { from: "API",      arrow: "→", to: "App",     label: "$182.43",             color: "text-blue-300" },
    { from: "App",      arrow: "→", to: "AI",      label: "Result injected",     color: "text-violet-300" },
    { from: "AI",       arrow: "→", to: "User",    label: "\"Apple is $182.43\"", color: "text-rose-300" },
  ];
  return (
    <div className="flex flex-col gap-2.5 px-4 w-full max-w-[320px] mx-auto">
      {steps.map((s, i) => (
        <motion.div
          key={i}
          initial={reduced ? false : { opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.22, duration: 0.35 }}
          className="flex items-center gap-2"
        >
          <span className="w-10 shrink-0 rounded-lg bg-slate-800 px-1.5 py-1 text-center text-sm font-bold text-slate-300">{s.from}</span>
          <span className={cn("text-lg", s.color)}>{s.arrow}</span>
          <span className="w-10 shrink-0 rounded-lg bg-slate-800 px-1.5 py-1 text-center text-sm font-bold text-slate-300">{s.to}</span>
          <span className={cn("flex-1 text-base", s.color)}>{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ChainVisual({ reduced }: { reduced: boolean }) {
  const chain = [
    { step: "1", icon: "🔍", label: "Search for flights", color: "border-violet-500/40 bg-violet-500/15 text-violet-200" },
    { step: "2", icon: "📅", label: "Check calendar",     color: "border-amber-500/40 bg-amber-500/15 text-amber-200" },
    { step: "3", icon: "✈️", label: "Book the flight",    color: "border-teal-500/40 bg-teal-500/15 text-teal-200" },
    { step: "4", icon: "📧", label: "Send confirmation",  color: "border-blue-500/40 bg-blue-500/15 text-blue-200" },
  ];
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[300px] mx-auto">
      <p className="text-base text-slate-400 text-center">
        &ldquo;Book me a flight to Paris next Friday&rdquo;
      </p>
      {chain.map((c, i) => (
        <div key={c.step} className="flex flex-col items-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.35, type: "spring", bounce: 0.35 }}
            className={cn("flex items-center gap-3 w-full rounded-xl border px-4 py-2.5", c.color)}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">{c.step}</span>
            <span className="text-lg">{c.icon}</span>
            <span className="text-base font-medium">{c.label}</span>
          </motion.div>
          {i < chain.length - 1 && (
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : i * 0.3 + 0.2 }}
              className="h-3 w-px bg-white/20"
            />
          )}
        </div>
      ))}
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
      case "execute": return <ExecuteVisual reduced={reducedMotion} />;
      case "chain":   return <ChainVisual   reduced={reducedMotion} />;
      default:        return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Badge + dots */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest", step.badgeColor)}>
          AI Actions
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
