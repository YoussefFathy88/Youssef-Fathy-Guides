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
    title: "AI doesn't know your private files",
    subtitle: "It was trained on public data, not your docs",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "chunks",
    title: "First: chop docs into small chunks",
    subtitle: "Then turn each chunk into a vector",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "search",
    title: "Your question becomes a vector too",
    subtitle: "The system finds the closest matching chunks",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "compare",
    title: "Without RAG vs with RAG",
    subtitle: "Hallucinated guess vs grounded answer",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "scale",
    title: "Any knowledge base, any question",
    subtitle: "RAG powers ChatGPT, Notion AI, and more",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function ProblemVisual({ reduced }: { reduced: boolean }) {
  const docs = ["Q4 Report.pdf", "Company Policy.docx", "Customer Data.csv"];
  return (
    <div className="flex flex-col items-center gap-5 px-4 w-full">
      <div className="flex flex-col gap-3 w-full max-w-[300px]">
        {docs.map((doc, i) => (
          <motion.div
            key={doc}
            initial={reduced ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.25, duration: 0.4 }}
            className="flex items-center gap-3 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-base text-slate-200">{doc}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.0 }}
        className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-center w-full max-w-[300px]"
      >
        <p className="text-base text-violet-200">The AI has never seen these</p>
      </motion.div>
    </div>
  );
}

function ChunksVisual({ reduced }: { reduced: boolean }) {
  const chunks = [
    { text: "Revenue grew 12% in Q4…", vec: "[0.21, -0.84, …]", color: "border-amber-500/40 bg-amber-500/15 text-amber-200" },
    { text: "All employees must sign…", vec: "[0.57, 0.03, …]",  color: "border-teal-500/40 bg-teal-500/15 text-teal-200" },
    { text: "Customer #4821 purchased…", vec: "[-0.42, 0.76, …]", color: "border-blue-500/40 bg-blue-500/15 text-blue-200" },
  ];
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[340px] mx-auto">
      <p className="text-base text-slate-400 text-center">Chunk → Embed → Store in vector DB</p>
      {chunks.map((chunk, i) => (
        <motion.div
          key={chunk.text}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.4 }}
          className={cn("rounded-xl border p-3 space-y-1.5", chunk.color)}
        >
          <p className="text-base font-medium truncate">{chunk.text}</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">→</span>
            <span className="font-mono text-sm text-slate-300">{chunk.vec}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SearchVisual({ reduced }: { reduced: boolean }) {
  const results = [
    { text: "Revenue grew 12% in Q4…", score: 0.94, color: "border-teal-500/40 bg-teal-500/15 text-teal-200" },
    { text: "Total sales reached $4.2M…", score: 0.81, color: "border-teal-500/30 bg-teal-500/10 text-teal-300" },
    { text: "All employees must sign…",  score: 0.23, color: "border-slate-600/50 bg-slate-800/40 text-slate-500" },
  ];
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[340px] mx-auto">
      <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-2.5 text-center">
        <p className="text-sm text-slate-400">Query:</p>
        <p className="text-base font-semibold text-teal-200">&ldquo;What was Q4 revenue?&rdquo;</p>
      </div>
      <div className="space-y-2.5">
        {results.map((r, i) => (
          <motion.div
            key={r.text}
            initial={reduced ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.4 }}
            className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5", r.color)}
          >
            <span className="text-base flex-1 truncate">{r.text}</span>
            <span className="font-mono text-sm font-bold shrink-0">{r.score}</span>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.2 }}
        className="text-sm text-slate-500 text-center"
      >
        Top matches injected into the prompt
      </motion.p>
    </div>
  );
}

function CompareVisual({ reduced }: { reduced: boolean }) {
  const sides = [
    {
      label: "Without RAG",
      answer: "Q4 revenue was probably around $3M (not sure).",
      verdict: "❌ Hallucinated",
      color: "border-rose-500/40 bg-rose-500/10 text-rose-200",
      bar: 20,
      barColor: "bg-rose-500",
    },
    {
      label: "With RAG",
      answer: "Q4 revenue grew 12%, reaching $4.2M according to your report.",
      verdict: "✅ Grounded",
      color: "border-teal-500/40 bg-teal-500/10 text-teal-200",
      bar: 95,
      barColor: "bg-teal-500",
    },
  ];
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[340px] mx-auto">
      {sides.map((side, i) => (
        <motion.div
          key={side.label}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.5, duration: 0.4 }}
          className={cn("rounded-xl border p-4 space-y-2", side.color)}
        >
          <div className="flex items-center justify-between">
            <p className="text-base font-bold">{side.label}</p>
            <p className="text-base">{side.verdict}</p>
          </div>
          <p className="text-sm text-slate-300">{side.answer}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={cn("h-full rounded-full", side.barColor)}
              initial={{ width: "0%" }}
              animate={{ width: `${side.bar}%` }}
              transition={{ delay: reduced ? 0 : i * 0.5 + 0.3, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-right text-slate-400">Accuracy: {side.bar}%</p>
        </motion.div>
      ))}
    </div>
  );
}

function ScaleVisual({ reduced }: { reduced: boolean }) {
  const apps = [
    { name: "ChatGPT",    detail: "Searches your uploaded files", color: "border-teal-500/40 bg-teal-500/15 text-teal-200" },
    { name: "Notion AI",  detail: "Reads your workspace pages",   color: "border-violet-500/40 bg-violet-500/15 text-violet-200" },
    { name: "GitHub Copilot", detail: "Pulls in your codebase",   color: "border-blue-500/40 bg-blue-500/15 text-blue-200" },
    { name: "Your App",   detail: "Any data you index",           color: "border-rose-500/40 bg-rose-500/15 text-rose-200" },
  ];
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      {apps.map((app, i) => (
        <motion.div
          key={app.name}
          initial={reduced ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduced ? 0 : i * 0.25, duration: 0.35, type: "spring", bounce: 0.3 }}
          className={cn("flex items-center gap-4 rounded-xl border px-4 py-3", app.color)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold">{app.name}</p>
            <p className="text-sm text-slate-300">{app.detail}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RAGShort() {
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
      case "problem": return <ProblemVisual reduced={reducedMotion} />;
      case "chunks":  return <ChunksVisual  reduced={reducedMotion} />;
      case "search":  return <SearchVisual  reduced={reducedMotion} />;
      case "compare": return <CompareVisual reduced={reducedMotion} />;
      case "scale":   return <ScaleVisual   reduced={reducedMotion} />;
      default:        return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Badge + dots */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest", step.badgeColor)}>
          RAG
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
