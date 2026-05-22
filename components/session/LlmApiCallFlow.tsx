"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface ApiExample {
  input: string;
  output: string;
}

export interface LlmApiCallFlowProps {
  title?: string;
  examples?: ApiExample[];
}

const DEFAULT_EXAMPLES: ApiExample[] = [
  {
    input: "Summarise my open tasks for today",
    output:
      "Here are your open tasks for today: finish the Q2 report, review the PRs from Sarah, and prepare the client demo slides. You also have a 3pm standup.",
  },
  {
    input: "Which tasks are overdue?",
    output:
      "You have 3 overdue tasks: Update database schema (2 days ago), Send invoice to Acme Corp (yesterday), and Fix login bug on mobile (3 days ago).",
  },
  {
    input: "Create a task to review PRs before Friday",
    output:
      "Sure! I've added 'Review PRs before Friday' to your task list. Would you like to set a priority level or assign it to someone?",
  },
];

const PARAMS = [
  { key: "model", value: '"claude-3-5-sonnet"', color: "text-violet-400" },
  { key: "max_tokens", value: "1024", color: "text-amber-400" },
  { key: "messages", value: "[{ role: 'user', content: … }]", color: "text-teal-400" },
];

export default function LlmApiCallFlow({
  title = "Traditional LLM API call — same structure every time, unstructured text out",
  examples = DEFAULT_EXAMPLES,
}: LlmApiCallFlowProps) {
  const prefersReduced = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "sending" | "receiving" | "done">("idle");
  const [autoPlay, setAutoPlay] = useState(true);

  const advance = useCallback(() => {
    setPhase("sending");
    const t1 = setTimeout(() => setPhase("receiving"), prefersReduced ? 0 : 800);
    const t2 = setTimeout(() => setPhase("done"), prefersReduced ? 0 : 1600);
    const t3 = setTimeout(() => {
      setActiveIdx((i) => (i + 1) % examples.length);
      setPhase("idle");
    }, prefersReduced ? 100 : 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [examples.length, prefersReduced]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(advance, 1200);
    return () => clearTimeout(timer);
  }, [autoPlay, activeIdx, advance]);

  const current = examples[activeIdx];

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-950/60 p-8 md:p-10 space-y-8">
      {title && (
        <h3 className="text-xl md:text-2xl font-semibold text-gray-100 leading-snug">{title}</h3>
      )}

      {/* Three-lane flow */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3 md:gap-4">
        {/* Input */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 md:p-6 space-y-3 min-h-[160px] flex flex-col justify-between">
          <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-gray-300">
            User Input
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIdx + "-in"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-lg md:text-xl text-gray-100 leading-relaxed"
            >
              {current.input}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Arrow 1 */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={
              phase === "sending"
                ? { x: [0, 6, 0], opacity: [1, 0.6, 1] }
                : { x: 0, opacity: 1 }
            }
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
              <motion.path
                d="M0 8 L24 8"
                stroke={phase === "sending" ? "#a78bfa" : "#4b5563"}
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ pathLength: phase === "sending" ? [0, 1] : 1 }}
                transition={{ duration: 0.5 }}
              />
              <path d="M20 4 L28 8 L20 12" stroke={phase === "sending" ? "#a78bfa" : "#4b5563"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </motion.div>
        </div>

        {/* LLM API box */}
        <div
          className={cn(
            "rounded-xl border p-5 md:p-6 space-y-4 transition-colors duration-500",
            phase === "sending" || phase === "receiving"
              ? "border-violet-500/60 bg-violet-950/40"
              : "border-violet-700/30 bg-violet-950/20"
          )}
        >
          <div className="flex items-center gap-3">
            <motion.span
              animate={
                phase === "sending" || phase === "receiving"
                  ? { rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.8, repeat: phase === "receiving" ? Infinity : 0 }}
              className="text-3xl md:text-4xl"
            >
              🤖
            </motion.span>
            <span className="font-mono text-lg md:text-xl font-bold text-violet-200">LLM API</span>
          </div>
          <div className="space-y-2">
            {PARAMS.map((p) => (
              <div key={p.key} className="flex flex-wrap gap-x-1 gap-y-0.5 font-mono text-base md:text-lg leading-relaxed">
                <span className="text-gray-300">{p.key}:</span>
                <span className={p.color}>{p.value}</span>
              </div>
            ))}
          </div>
          {(phase === "sending" || phase === "receiving") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-1 pt-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Arrow 2 */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={
              phase === "receiving"
                ? { x: [0, 6, 0], opacity: [1, 0.6, 1] }
                : { x: 0, opacity: 1 }
            }
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
              <motion.path
                d="M0 8 L24 8"
                stroke={phase === "receiving" || phase === "done" ? "#2dd4bf" : "#4b5563"}
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ pathLength: phase === "receiving" ? [0, 1] : 1 }}
                transition={{ duration: 0.5 }}
              />
              <path d="M20 4 L28 8 L20 12" stroke={phase === "receiving" || phase === "done" ? "#2dd4bf" : "#4b5563"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </motion.div>
        </div>

        {/* Output */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 md:p-6 space-y-3 min-h-[160px] flex flex-col justify-between">
          <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-gray-300">
            Text Output
          </span>
          <AnimatePresence mode="wait">
            {phase === "done" || phase === "idle" ? (
              <motion.p
                key={activeIdx + "-out"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-lg md:text-xl text-teal-100 leading-relaxed"
              >
                {current.output}
              </motion.p>
            ) : (
              <motion.p
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg md:text-xl text-gray-400 italic"
              >
                Generating…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cycle indicators */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2.5">
          {examples.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setAutoPlay(false);
                setActiveIdx(i);
                setPhase("done");
              }}
              className={cn(
                "h-3 rounded-full transition-all duration-300",
                i === activeIdx ? "w-8 bg-violet-400" : "w-3 bg-gray-700 hover:bg-gray-500"
              )}
              aria-label={`Example ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setAutoPlay((v) => !v)}
          className="font-mono text-base md:text-lg text-gray-300 hover:text-gray-100 transition-colors py-2 px-3"
        >
          {autoPlay ? "⏸ pause" : "▶ play"}
        </button>
      </div>

      {/* Key insight chip */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-5 py-4 md:px-6 md:py-5 flex items-start gap-4">
        <span className="text-2xl md:text-3xl shrink-0">⚠️</span>
        <p className="text-lg md:text-xl text-amber-100 leading-relaxed">
          <span className="font-semibold">Same call shape every time</span> — but the output is unstructured plain text. Every response has a different format. You cannot reliably parse it, store it, or act on it programmatically.
        </p>
      </div>
    </div>
  );
}
