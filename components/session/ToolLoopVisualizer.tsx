"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/* ─── Tool definitions ──────────────────────────────────────────────────── */

const TOOLS = [
  {
    id: "create_task",
    icon: "✏️",
    name: "create_task",
    what: "Create a new task",
    color: {
      ring: "ring-violet-400/60",
      bg: "bg-violet-500/15 border-violet-400/40",
      label: "text-violet-200",
      glow: "shadow-[0_0_28px_4px_rgba(139,92,246,0.45)]",
      dot: "bg-violet-400",
    },
  },
  {
    id: "update_task",
    icon: "🔄",
    name: "update_task",
    what: "Change status or priority",
    color: {
      ring: "ring-amber-400/60",
      bg: "bg-amber-500/15 border-amber-400/40",
      label: "text-amber-200",
      glow: "shadow-[0_0_28px_4px_rgba(245,158,11,0.35)]",
      dot: "bg-amber-400",
    },
  },
  {
    id: "list_tasks",
    icon: "📋",
    name: "list_tasks",
    what: "Fetch tasks with filters",
    color: {
      ring: "ring-sky-400/60",
      bg: "bg-sky-500/15 border-sky-400/40",
      label: "text-sky-200",
      glow: "shadow-[0_0_28px_4px_rgba(56,189,248,0.35)]",
      dot: "bg-sky-400",
    },
  },
];

/* ─── Step visuals map ──────────────────────────────────────────────────── */

type StepVisual = "register" | "decide" | "execute" | "return" | "answer";

/* ─── Sub-visuals ───────────────────────────────────────────────────────── */

function ToolCard({
  tool,
  active,
  faded,
  delay = 0,
}: {
  tool: (typeof TOOLS)[0];
  active: boolean;
  faded: boolean;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: faded ? 0.28 : 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        "rounded-2xl border-2 px-5 py-4 flex items-center gap-4 transition-all duration-300",
        active
          ? cn(tool.color.bg, "ring-2", tool.color.ring, tool.color.glow)
          : "border-gray-700/60 bg-gray-900/60",
      )}
    >
      <span className="text-3xl md:text-4xl shrink-0">{tool.icon}</span>
      <div className="min-w-0">
        <p
          className={cn(
            "font-mono text-base md:text-lg font-bold leading-tight",
            active ? tool.color.label : "text-gray-300",
          )}
        >
          {tool.name}
        </p>
        <p className="text-base md:text-lg text-gray-400 mt-0.5 leading-snug">
          {tool.what}
        </p>
      </div>
      {active && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn("ml-auto h-3 w-3 rounded-full shrink-0", tool.color.dot)}
        />
      )}
    </motion.div>
  );
}

function UserBubble({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-start gap-3"
    >
      <span className="text-2xl md:text-3xl shrink-0 mt-0.5">👤</span>
      <div className="rounded-2xl rounded-tl-sm border border-gray-600 bg-gray-800/80 px-5 py-3 max-w-xl">
        <p className="text-lg md:text-xl text-gray-100 leading-snug">{message}</p>
      </div>
    </motion.div>
  );
}

function ModelBubble({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex items-start gap-3 justify-end"
    >
      <div className="rounded-2xl rounded-tr-sm border border-violet-500/40 bg-violet-500/10 px-5 py-3 max-w-2xl">
        <p className="text-lg md:text-xl text-violet-100 leading-snug">{content}</p>
      </div>
      <span className="text-2xl md:text-3xl shrink-0 mt-0.5">🤖</span>
    </motion.div>
  );
}

function FlowArrow({
  label,
  dir = "down",
  color = "text-gray-400",
}: {
  label?: string;
  dir?: "down" | "right";
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className={cn(
        "flex items-center justify-center gap-2 py-1",
        dir === "down" ? "flex-col" : "flex-row",
        color,
      )}
    >
      {label && <span className="text-base md:text-lg font-semibold">{label}</span>}
      <span className="text-2xl md:text-3xl">{dir === "down" ? "↓" : "→"}</span>
    </motion.div>
  );
}

/* ─── Step visual renderers ─────────────────────────────────────────────── */

function VisualRegister({ message }: { message: string }) {
  return (
    <div className="space-y-4">
      <UserBubble message={message} />
      <FlowArrow label="You send your message + 3 tools" color="text-teal-400" />
      <div className="grid gap-3 md:grid-cols-3">
        {TOOLS.map((t, i) => (
          <ToolCard key={t.id} tool={t} active={false} faded={false} delay={i * 0.12} />
        ))}
      </div>
    </div>
  );
}

function VisualDecide({ message }: { message: string }) {
  return (
    <div className="space-y-4">
      <UserBubble message={message} />
      <div className="flex items-center justify-center gap-3">
        <span className="text-3xl md:text-4xl">🤖</span>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="text-lg md:text-xl font-semibold text-violet-300"
        >
          Model picks the right tool…
        </motion.div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {TOOLS.map((t) => (
          <ToolCard
            key={t.id}
            tool={t}
            active={t.id === "create_task"}
            faded={t.id !== "create_task"}
          />
        ))}
      </div>
    </div>
  );
}

function VisualExecute() {
  return (
    <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <ToolCard tool={TOOLS[0]} active={true} faded={false} />
      <FlowArrow label="your code runs it" dir="right" color="text-amber-400" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 px-5 py-4 flex items-center gap-3"
      >
        <span className="text-3xl md:text-4xl">⚙️</span>
        <p className="text-lg md:text-xl font-bold text-amber-200">Your app</p>
      </motion.div>
      <FlowArrow label="writes to" dir="right" color="text-gray-400" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.35 }}
        className="rounded-2xl border-2 border-gray-600 bg-gray-900/80 px-5 py-4 flex items-center gap-3"
      >
        <span className="text-3xl md:text-4xl">🗄️</span>
        <div>
          <p className="text-lg md:text-xl font-bold text-gray-100">Database</p>
          <p className="text-base md:text-lg text-gray-400">Model never touches it</p>
        </div>
      </motion.div>
    </div>
  );
}

function VisualReturn() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 px-5 py-4 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl">✅</span>
          <p className="text-lg md:text-xl font-bold text-emerald-200">Task saved to database</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {[
            { label: "title", value: "Review PRs before Friday" },
            { label: "priority", value: "high" },
            { label: "status", value: "todo" },
            { label: "due", value: "Fri 22 May 2026" },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-emerald-700/40 bg-gray-900/60 px-4 py-3">
              <p className="text-base font-semibold text-gray-400 uppercase tracking-wide">{row.label}</p>
              <p className="text-base md:text-lg text-gray-100 mt-0.5 leading-snug">{row.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <FlowArrow label="You send this back to the model" color="text-teal-400" />
      <div className="flex items-center justify-center gap-3">
        <span className="text-3xl md:text-4xl">🤖</span>
        <p className="text-lg md:text-xl text-gray-300">Model now sees the real record</p>
      </div>
    </div>
  );
}

function VisualAnswer() {
  return (
    <div className="space-y-4">
      <ModelBubble content='Done! I created "Review PRs before Friday" — high priority, due Friday 22 May. Want me to assign it or add subtasks?' />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="rounded-2xl border border-violet-500/30 bg-violet-950/25 px-5 py-4 space-y-3"
      >
        <p className="text-base md:text-lg font-bold uppercase tracking-widest text-violet-300">
          Why this works
        </p>
        {[
          "Grounded in the real task ID and status",
          "Can now call update_task or list_tasks next",
          "The loop continues for multi-step agents",
        ].map((point) => (
          <div key={point} className="flex items-start gap-3">
            <span className="text-lg md:text-xl text-violet-400 shrink-0 mt-0.5">→</span>
            <p className="text-lg md:text-xl text-gray-200 leading-snug">{point}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Step config ───────────────────────────────────────────────────────── */

interface ToolStep {
  id: string;
  visual: StepVisual;
  actor: "user" | "model" | "your-code";
  label: string;
  detail: string;
}

const DEFAULT_STEPS: ToolStep[] = [
  {
    id: "register",
    visual: "register",
    actor: "user",
    label: "Your app gives the model a toolbox",
    detail:
      "Tools are just descriptions — a name, what it does, and what inputs it needs. Your app sends these with every request. The model reads them to know what actions are possible.",
  },
  {
    id: "decide",
    visual: "decide",
    actor: "model",
    label: "Model picks the right tool",
    detail:
      "The model reads the user message and the available tools, then selects the one that matches the intent. It extracts the arguments from natural language automatically.",
  },
  {
    id: "execute",
    visual: "execute",
    actor: "your-code",
    label: "Your code runs the action",
    detail:
      "The model never touches your database. It requests the action — your application reads the request and executes it. You control the logic, security, and side effects.",
  },
  {
    id: "return",
    visual: "return",
    actor: "user",
    label: "The real result goes back to the model",
    detail:
      "Your app appends the saved database record to the conversation and makes a second API call. The model now sees what actually happened — not what it guessed.",
  },
  {
    id: "answer",
    visual: "answer",
    actor: "model",
    label: "Model responds grounded in real data",
    detail:
      "With the actual record in context, the model gives a confident, specific answer. From here it can call more tools — the loop repeats for multi-step agents.",
  },
];

const ACTOR_META = {
  user: { label: "YOU", icon: "👤", badge: "bg-gray-700/80 text-gray-200 border-gray-600" },
  model: { label: "MODEL", icon: "🤖", badge: "bg-violet-500/20 text-violet-200 border-violet-500/40" },
  "your-code": {
    label: "YOUR CODE",
    icon: "⚙️",
    badge: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  },
} as const;

const DOT_COLOR = {
  user: { active: "bg-gray-300", idle: "bg-gray-600" },
  model: { active: "bg-violet-400", idle: "bg-violet-800" },
  "your-code": { active: "bg-amber-400", idle: "bg-amber-800" },
} as const;

/* ─── Main component ────────────────────────────────────────────────────── */

export interface ToolLoopVisualizerProps {
  title?: string;
  userMessage?: string;
  steps?: ToolStep[];
}

export default function ToolLoopVisualizer({
  title = "The tool-use loop — the model requests, your code executes, state changes",
  userMessage = "Create a task: Review PRs before Friday, high priority",
  steps = DEFAULT_STEPS,
}: ToolLoopVisualizerProps) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[current];
  const isLast = current === steps.length - 1;

  const go = useCallback(
    (next: number) => {
      setDirection(next > current ? 1 : -1);
      setCurrent(next);
    },
    [current],
  );

  const stepForward = useCallback(() => {
    if (current < steps.length - 1) {
      go(current + 1);
    } else {
      setPlaying(false);
    }
  }, [current, steps.length, go]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(stepForward, 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, current, stepForward]);

  const actor = ACTOR_META[step.actor];

  const slideVariants = {
    enter: (d: number) => ({
      x: reduced ? 0 : d * 32,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: reduced ? 0 : d * -32,
      opacity: 0,
    }),
  };

  function renderVisual(visual: StepVisual) {
    switch (visual) {
      case "register":
        return <VisualRegister message={userMessage} />;
      case "decide":
        return <VisualDecide message={userMessage} />;
      case "execute":
        return <VisualExecute />;
      case "return":
        return <VisualReturn />;
      case "answer":
        return <VisualAnswer />;
    }
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full rounded-2xl border border-white/10 bg-gray-950/70 p-6 md:p-8 space-y-5"
    >
      {title && (
        <h3 className="text-xl md:text-2xl font-semibold text-gray-100 leading-snug">{title}</h3>
      )}

      {/* Step dots + counter + controls */}
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => {
          const dot = DOT_COLOR[s.actor];
          const isCurrent = i === current;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => { setPlaying(false); go(i); }}
              className={cn(
                "h-3 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
                isCurrent
                  ? cn("w-8 ring-2 ring-offset-1 ring-offset-gray-950", dot.active)
                  : cn("w-3 opacity-50 hover:opacity-80", dot.idle),
              )}
            />
          );
        })}
        <span className="ml-2 font-mono text-base md:text-lg font-semibold text-gray-400">
          {current + 1} / {steps.length}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={current === 0}
          onClick={() => { setPlaying(false); go(current - 1); }}
          className="flex min-h-[3rem] items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3 text-base md:text-lg font-medium text-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Prev
        </button>

        <button
          type="button"
          disabled={isLast && !playing}
          onClick={() => { setPlaying(false); stepForward(); }}
          className="flex min-h-[3rem] items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3 text-base md:text-lg font-medium text-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Step →
        </button>

        <button
          type="button"
          onClick={() => {
            if (playing) {
              setPlaying(false);
            } else {
              if (isLast) go(0);
              setPlaying(true);
            }
          }}
          className={cn(
            "flex min-h-[3rem] items-center gap-2 rounded-xl px-5 py-3 text-base md:text-lg font-semibold transition",
            playing
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
              : "bg-violet-600 text-white hover:bg-violet-700",
          )}
        >
          {playing ? "⏸ Pause" : isLast ? "↩ Replay" : "▶ Play"}
        </button>

        </div>
      </div>

      {/* Actor badge + step label */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-base md:text-lg font-bold uppercase tracking-wider",
            actor.badge,
          )}
        >
          <span className="text-xl md:text-2xl leading-none">{actor.icon}</span>
          {actor.label}
        </span>
        <span className="text-xl md:text-2xl font-semibold text-gray-100 leading-snug">
          {step.label}
        </span>
      </div>

      {/* Visual panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gray-900/60">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="p-5 md:p-6"
          >
            {renderVisual(step.visual)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Detail */}
      <p className="text-lg md:text-xl text-gray-200 leading-relaxed">{step.detail}</p>

    </motion.div>
  );
}
