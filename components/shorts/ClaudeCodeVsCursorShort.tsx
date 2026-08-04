"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Step data ────────────────────────────────────────────────────────────────
// Claude Code and Cursor are both AI coding agents. Cursor is model-agnostic
// (it can run Claude, GPT, or Gemini models — verified via public model
// pickers), so "same brain" only holds when both are pointed at a Claude
// model — worded that way below, not as a universal claim. Step 2 shows the
// general concept that every agent runs on a system prompt (hidden
// instructions set before the user's first message) using a generic,
// illustrative example prompt — not a verbatim Claude Code or Cursor quote,
// and not a tool-vs-tool comparison. Both tools now run multi-agent setups:
// Claude Code's Task tool spawns subagents that
// share a task list and can message each other, while Cursor's parallel
// agents (docs.cursor.com/configuration/worktrees) each run isolated in their
// own git worktree and are merged back — not coordinated live like Claude
// Code's. Context compaction (fill → summarize → restart from summary) is
// real and documented for Claude Code; Cursor uses the same prompt-based
// summarization when running a Claude model (Cursor's trained
// self-summarization — cursor.com/blog/self-summarization — is specific to
// Cursor's own Composer model, not to Claude sessions run through Cursor, so
// it is intentionally NOT shown here as a Claude-vs-Claude difference).

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
    title: "Two tools, same possible brain",
    subtitle: "Cursor can run the same Claude models Claude Code uses",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "rules",
    title: "Every Agent Starts With a System Prompt",
    subtitle: "Hidden instructions set before you type anything",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "loop",
    title: "It's Not Just Prompt → Model → Code",
    subtitle:
      "Same idea in both Claude Code and Cursor — the exact toolset and setup just looks different in each",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "memory",
    title: "Context Fills Up — Then What?",
    subtitle: "",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "punchline",
    title: "Same model, different operating system",
    subtitle: "The model can match — the agent never does",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function HookVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4 w-full max-w-[320px] mx-auto">
      <div className="flex w-full items-center justify-center gap-3">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 rounded-xl border border-violet-400/40 bg-violet-500/15 px-3 py-2.5 text-center"
        >
          <p className="text-lg font-bold text-violet-100">Claude Code</p>
        </motion.div>
        <motion.div
          initial={reduced ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 rounded-xl border border-blue-400/40 bg-blue-500/15 px-3 py-2.5 text-center"
        >
          <p className="text-lg font-bold text-blue-100">Cursor</p>
        </motion.div>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.4, duration: 0.3 }}
        className="text-2xl text-white/60"
      >
        ↓&nbsp;&nbsp;↓
      </motion.div>

      <motion.div
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        animate={
          reduced
            ? { scale: 1, opacity: 1 }
            : { scale: [0, 1.08, 1, 1.06, 1], opacity: 1 }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : {
                delay: 0.6,
                duration: 2.4,
                times: [0, 0.2, 0.4, 0.7, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.4,
              }
        }
        className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400/60 bg-emerald-500/20"
      >
        <p className="text-base font-bold text-emerald-200">Claude</p>
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.1, duration: 0.35 }}
        className="text-center text-lg font-bold text-white leading-snug"
      >
        Same possible model underneath 🧠
      </motion.p>
    </div>
  );
}

interface CodeLine {
  text: string;
}

function TypedBlock({
  reduced,
  label,
  borderColor,
  labelColor,
  lines,
  startDelay = 0,
}: {
  reduced: boolean;
  label: string;
  borderColor: string;
  labelColor: string;
  lines: CodeLine[];
  startDelay?: number;
}) {
  return (
    <div className={cn("flex-1 rounded-xl border bg-slate-950 px-2.5 py-2.5", borderColor)}>
      <p className={cn("mb-1.5 text-base font-bold", labelColor)}>{label}</p>
      <div className="font-mono text-base leading-relaxed text-white/90">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={reduced ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : startDelay + i * 0.35, duration: 0.2 }}
          >
            {line.text}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

const SYSTEM_PROMPT_LINES: CodeLine[] = [
  { text: "You're an agentic coding assistant." },
  { text: "You have tools to read, edit, and run code" },
  { text: "in the user's project." },
  { text: "Follow their instructions, respect their" },
  { text: "existing code style, ask before doing" },
  { text: "anything destructive." },
];

function RulesVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 px-3 w-full max-w-[320px] mx-auto">
      <div className="w-full">
        <TypedBlock
          reduced={reduced}
          label="System Prompt"
          borderColor="border-blue-400/40"
          labelColor="text-blue-200"
          lines={SYSTEM_PROMPT_LINES}
        />
      </div>
    </div>
  );
}

function FlowArrow({
  reduced,
  delay = 0,
  color = "text-teal-300/70",
}: {
  reduced: boolean;
  delay?: number;
  color?: string;
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : delay, duration: 0.25 }}
      className={cn("text-lg leading-none", color)}
      aria-hidden
    >
      ↓
    </motion.div>
  );
}

const LOOP_NODES = ["Model", "Tool", "Subagent"];

function LoopVisual({ reduced }: { reduced: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % LOOP_NODES.length);
    }, 1300);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="flex flex-col items-center gap-3 px-4 w-full max-w-[320px] mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-teal-200/70">You</span>
        <span className="text-base text-teal-300/50">→</span>
        <motion.div
          animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 1.3, repeat: reduced ? 0 : Infinity, ease: "easeInOut" }}
          className="rounded-full border-2 border-teal-300/70 bg-teal-500/25 px-4 py-1.5"
        >
          <p className="text-lg font-bold text-teal-50">Agent</p>
        </motion.div>
      </div>

      <div className="flex w-full items-start justify-center gap-3">
        {LOOP_NODES.map((node, i) => {
          const active = reduced ? i === 0 : i === activeIndex;
          return (
            <div key={node} className="flex flex-1 flex-col items-center">
              <motion.div
                animate={{ scale: active ? 1.06 : 1, opacity: active ? 1 : 0.5 }}
                transition={{ duration: 0.35 }}
                className={cn(
                  "w-full rounded-lg border px-1.5 py-2.5 text-center",
                  active ? "border-teal-300/70 bg-teal-500/25" : "border-teal-400/20 bg-teal-500/5",
                )}
              >
                <p className={cn("text-base font-bold", active ? "text-teal-50" : "text-teal-200/50")}>
                  {node}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MemoryVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full rounded-lg border border-amber-300/50 bg-amber-500/20 px-3 py-2 text-center"
      >
        <p className="text-base font-bold text-amber-100">Conversation grows</p>
      </motion.div>

      <FlowArrow reduced={reduced} delay={0.25} color="text-amber-300/70" />

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.4, duration: 0.3 }}
        className="w-full rounded-lg border border-amber-300/40 bg-amber-500/15 px-3 py-2.5 space-y-1.5"
      >
        <p className="text-center text-base text-amber-100">Context window fills up</p>
        <div className="h-3 w-full overflow-hidden rounded-full bg-amber-500/15">
          <motion.div
            initial={reduced ? false : { width: "10%" }}
            animate={
              reduced
                ? { width: "45%" }
                : { width: ["10%", "95%", "45%", "45%", "10%"], scaleX: [1, 1, 0.6, 0.6, 1] }
            }
            transition={
              reduced
                ? { delay: 0.6, duration: 1.4, ease: "easeInOut" }
                : {
                    delay: 0.6,
                    duration: 2.6,
                    times: [0, 0.35, 0.55, 0.85, 1],
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.6,
                  }
            }
            className="h-full origin-left rounded-full bg-amber-400"
          />
        </div>
      </motion.div>

      <FlowArrow reduced={reduced} delay={0.85} color="text-amber-300/70" />

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.0, duration: 0.3 }}
        className="w-full rounded-lg border border-amber-300/40 bg-amber-500/15 px-3 py-2 text-center"
      >
        <p className="text-base text-amber-100">Compact: summarize what happened</p>
      </motion.div>

      <FlowArrow reduced={reduced} delay={1.15} color="text-amber-300/70" />

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.3, duration: 0.3 }}
        className="w-full rounded-lg border border-amber-300/50 bg-amber-500/20 px-3 py-2 text-center"
      >
        <p className="text-base text-amber-100">
          Continue from the summary, not the full history
        </p>
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.6, duration: 0.35 }}
        className="pt-1 text-center text-base text-white/60"
      >
      </motion.p>
    </div>
  );
}

function PunchlineVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { scale: 0.7, opacity: 0 }}
        animate={
          reduced
            ? { scale: 1, opacity: 1 }
            : { scale: [0.7, 1.1, 1, 1.06, 1], opacity: 1 }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : {
                duration: 2.2,
                times: [0, 0.25, 0.4, 0.7, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.5,
              }
        }
        className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-rose-400/60 bg-rose-500/20"
      >
        <p className="text-lg font-bold text-rose-100">🧠</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: [0, 1, 0.3, 1] }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : {
                delay: 0.7,
                duration: 1.6,
                times: [0, 0.3, 0.6, 1],
                repeat: Infinity,
                repeatDelay: 1,
              }
        }
        className="rounded-full border border-rose-300/50 bg-rose-500/15 px-3 py-1 text-base font-bold text-rose-200"
      >
        OS
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 1.6, duration: 0.4 }}
        className="text-center text-xl font-extrabold text-rose-100 leading-snug"
      >
        Same model. Different operating system.
      </motion.p>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: [1, 1.03, 1] }}
        transition={
          reduced
            ? { delay: 2, duration: 0.3 }
            : { delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        className="text-center text-lg font-bold text-emerald-300"
      >
        Follow for more! 🔥
      </motion.p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ClaudeCodeVsCursorShort() {
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
      case "rules":
        return <RulesVisual reduced={reducedMotion} />;
      case "loop":
        return <LoopVisual reduced={reducedMotion} />;
      case "memory":
        return <MemoryVisual reduced={reducedMotion} />;
      case "punchline":
        return <PunchlineVisual reduced={reducedMotion} />;
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
          Claude Code vs Cursor
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
      {step.subtitle && (
        <div className="px-5 pt-2 pb-2">
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
      )}

      {/* Controls + progress */}
      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label="Next step"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          {`Step ${stepIndex + 1} / ${STEPS.length} — tap Next`}
        </p>
      </div>
    </div>
  );
}
