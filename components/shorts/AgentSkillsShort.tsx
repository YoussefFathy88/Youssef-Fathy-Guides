"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

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
    id: "folders",
    title: "Claude can have many skill folders",
    subtitle: "Scripts, frontend, and study — each one specialized",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "task",
    title: "You ask a tricky question",
    subtitle: "Claude checks each skill's short description",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "opens",
    title: "The study skill matches — it opens",
    subtitle: "Now its full instructions guide the answer",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "contrast",
    title: "Guessing versus checking",
    subtitle: "The skill's rule changes the final answer",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
  {
    id: "scale",
    title: "Only the matching skill ever fully loads",
    subtitle: "Add hundreds of skills, context stays small",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

const SKILL_FOLDERS = [
  {
    key: "scripts",
    tab: "Scripts",
    name: "youtube-scripts/",
    desc: "Write and format video scripts",
    color: "blue",
  },
  {
    key: "frontend",
    tab: "Frontend",
    name: "frontend/",
    desc: "Build and style React components",
    color: "violet",
  },
  {
    key: "study",
    tab: "Study",
    name: "study/",
    desc: "Verify facts before writing any claim",
    color: "amber",
  },
] as const;

const TAB_COLOR: Record<string, string> = {
  blue: "border-blue-400/50 bg-blue-500/15 text-blue-100",
  violet: "border-violet-400/50 bg-violet-500/15 text-violet-100",
  amber: "border-amber-400/50 bg-amber-500/15 text-amber-100",
};

function FoldersVisual({ reduced }: { reduced: boolean }) {
  const [active, setActive] = useState<string>("study");
  const folder = SKILL_FOLDERS.find(f => f.key === active)!;

  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[320px] mx-auto">
      <div className="flex justify-center gap-2">
        {SKILL_FOLDERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActive(f.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-base font-semibold transition",
              active === f.key
                ? TAB_COLOR[f.color]
                : "border-slate-600/50 bg-slate-800/40 text-slate-400",
            )}
          >
            {f.tab}
          </button>
        ))}
      </div>

      <motion.div
        key={folder.key}
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5">
          <span className="text-2xl">📁</span>
          <span className="font-mono text-lg font-bold text-amber-200">{folder.name}</span>
        </div>
        <div className="ml-5 flex items-center gap-3 rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-2.5">
          <span className="text-xl">📄</span>
          <div>
            <p className="font-mono text-base font-semibold text-slate-200">SKILL.md</p>
            <p className="text-base text-slate-400">{folder.desc}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TaskVisual({ reduced }: { reduced: boolean }) {
  const matches = [
    { name: "Scripts", match: false },
    { name: "Frontend", match: false },
    { name: "Study", match: true },
  ];
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-2.5 text-center"
      >
        <p className="text-base text-slate-400">You ask</p>
        <p className="text-lg font-semibold text-white">
          &ldquo;How many parameters does GPT-4 have?&rdquo;
        </p>
      </motion.div>

      <div className="flex w-full flex-col gap-2">
        {matches.map((m, i) => (
          <motion.div
            key={m.name}
            initial={reduced ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : 0.3 + i * 0.25, duration: 0.3 }}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-2.5",
              m.match
                ? "border-blue-400/50 bg-blue-500/15"
                : "border-slate-600/50 bg-slate-800/40",
            )}
          >
            <span className={cn("text-lg font-semibold", m.match ? "text-blue-100" : "text-slate-400")}>
              {m.name}
            </span>
            <span className={cn("text-xl", m.match ? "text-blue-200" : "text-slate-500")}>
              {m.match ? "✓ matches" : "✗"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OpensVisual({ reduced }: { reduced: boolean }) {
  const rules = [
    "Search a primary source before any claim",
    "Never answer from memory alone",
    "Soften or remove what can't be confirmed",
  ];
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-teal-400/50 bg-teal-500/10 px-4 py-2.5"
      >
        <p className="font-mono text-base font-bold text-teal-200">study/SKILL.md — now open</p>
      </motion.div>

      {rules.map((r, i) => (
        <motion.div
          key={r}
          initial={reduced ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : 0.3 + i * 0.25, duration: 0.3 }}
          className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-2.5"
        >
          <p className="text-base font-medium text-slate-100">{r}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ContrastVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3"
      >
        <p className="text-base font-bold uppercase tracking-widest text-rose-300 mb-1">
          Without the skill
        </p>
        <p className="text-base text-rose-100">Guesses a specific number from memory</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduced ? 0 : 0.3, duration: 0.35 }}
        className="rounded-xl border border-teal-400/50 bg-teal-500/15 px-4 py-3"
      >
        <p className="text-base font-bold uppercase tracking-widest text-teal-300 mb-1">
          With the skill
        </p>
        <p className="text-base text-teal-100">Says it&rsquo;s not publicly disclosed by OpenAI</p>
      </motion.div>
    </div>
  );
}

function ScaleVisual({ reduced }: { reduced: boolean }) {
  const skills = ["Scripts", "Frontend", "Study ✓", "Excel", "SQL", "+ 100s more"];
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <div className="flex flex-wrap justify-center gap-2">
        {skills.map((s, i) => (
          <motion.span
            key={s}
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.12, duration: 0.3, type: "spring", bounce: 0.4 }}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-base font-semibold",
              s === "Study ✓"
                ? "border-violet-400/60 bg-violet-500/25 text-violet-100"
                : "border-violet-400/40 bg-violet-500/15 text-violet-100",
            )}
          >
            {s}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.8, duration: 0.4 }}
        className="w-full rounded-2xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-center"
      >
        <p className="text-lg font-bold text-violet-100 leading-snug">
          Only Study opened in full
        </p>
        <p className="text-base text-violet-200/80 mt-1">
          So the context window stays small
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AgentSkillsShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex]!;

  const goToStep = useCallback((idx: number) => setStepIndex(idx), []);
  const goNext = useCallback(() => setStepIndex(prev => (prev + 1) % STEPS.length), []);
  const goPrev = useCallback(() => setStepIndex(prev => (prev - 1 + STEPS.length) % STEPS.length), []);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function renderVisual(id: string) {
    switch (id) {
      case "folders":  return <FoldersVisual  reduced={reducedMotion} />;
      case "task":     return <TaskVisual     reduced={reducedMotion} />;
      case "opens":    return <OpensVisual    reduced={reducedMotion} />;
      case "contrast": return <ContrastVisual reduced={reducedMotion} />;
      case "scale":    return <ScaleVisual    reduced={reducedMotion} />;
      default:         return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Badge + dots */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest", step.badgeColor)}>
          Agent Skills
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
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
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
      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-center gap-6">
          <button type="button" onClick={goPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous step">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label="Next step">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div className="h-full rounded-full bg-white/70" style={{ width: `${progress}%` }} />
        </div>

        <p className="text-center text-base font-medium uppercase tracking-widest text-white/50">
          Step {stepIndex + 1} / {STEPS.length} — tap Next
        </p>
      </div>
    </div>
  );
}
