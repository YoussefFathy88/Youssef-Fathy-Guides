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
    id: "folder",
    title: "A skill is just a folder",
    subtitle: "One SKILL.md file, plus optional scripts",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "metadata",
    title: "Claude reads only the name first",
    subtitle: "Just name + description at startup — tiny",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "trigger",
    title: "Full guide loads when it fits the task",
    subtitle: "Matching task → Claude opens the whole file",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "tiers",
    title: "Load only what the task needs",
    subtitle: "Progressive disclosure — three levels of detail",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "scale",
    title: "A generalist becomes a specialist",
    subtitle: "Add hundreds of skills, keep context small",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function FolderVisual({ reduced }: { reduced: boolean }) {
  const files = [
    { name: "SKILL.md", desc: "Instructions + metadata", icon: "📄", main: true },
    { name: "reference.md", desc: "Extra detail, loaded later", icon: "📑", main: false },
    { name: "fill_form.py", desc: "A script Claude can run", icon: "🐍", main: false },
  ];
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5"
      >
        <span className="text-2xl">📁</span>
        <span className="font-mono text-lg font-bold text-amber-200">pdf-skill/</span>
      </motion.div>

      {files.map((f, i) => (
        <motion.div
          key={f.name}
          initial={reduced ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : 0.25 + i * 0.25, duration: 0.35 }}
          className={cn(
            "ml-5 flex items-center gap-3 rounded-xl border px-4 py-2.5",
            f.main
              ? "border-amber-400/50 bg-amber-500/15"
              : "border-slate-600/50 bg-slate-800/50",
          )}
        >
          <span className="text-xl">{f.icon}</span>
          <div>
            <p className={cn("font-mono text-base font-semibold", f.main ? "text-amber-100" : "text-slate-200")}>
              {f.name}
            </p>
            <p className="text-base text-slate-400">{f.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MetadataVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-slate-600 bg-slate-900 p-4 space-y-1"
      >
        <p className="text-base font-bold uppercase tracking-widest text-slate-500 mb-2">
          SKILL.md — top of file
        </p>
        <p className="font-mono text-base text-slate-500">---</p>
        <p className="font-mono text-base text-violet-200">
          name: <span className="text-violet-50">pdf-skill</span>
        </p>
        <p className="font-mono text-base text-violet-200">
          description: <span className="text-violet-50">fill PDF forms…</span>
        </p>
        <p className="font-mono text-base text-slate-500">---</p>
        <p className="font-mono text-base text-slate-600 line-through">…the rest stays closed…</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 0.4, type: "spring", bounce: 0.4 }}
        className="self-center rounded-full border border-violet-400/40 bg-violet-500/15 px-4 py-1.5 text-base font-bold text-violet-100"
      >
        Only ~50 tokens loaded at startup
      </motion.div>
    </div>
  );
}

function TriggerVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-2.5 text-center"
      >
        <p className="text-base text-slate-400">You ask</p>
        <p className="text-lg font-semibold text-white">&ldquo;Fill out this PDF form&rdquo;</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.35 }}
        className="text-2xl text-teal-300"
      >
        ↓ matches the description
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 0.6, type: "spring", bounce: 0.35 }}
        className="w-full rounded-xl border border-teal-400/50 bg-teal-500/15 px-4 py-3 text-center"
      >
        <p className="text-lg font-bold text-teal-100">Claude opens the full SKILL.md</p>
        <p className="text-base text-teal-200/80 mt-1">~500 tokens — now in context</p>
      </motion.div>
    </div>
  );
}

function TiersVisual({ reduced }: { reduced: boolean }) {
  const tiers = [
    { label: "Name + description", when: "Always", tokens: "~50", width: 14, color: "bg-violet-500" },
    { label: "Full SKILL.md", when: "When task matches", tokens: "~500", width: 45, color: "bg-teal-500" },
    { label: "Scripts & references", when: "Only if needed", tokens: "2,000+", width: 92, color: "bg-blue-500" },
  ];
  return (
    <div className="flex flex-col gap-3.5 px-4 w-full max-w-[330px] mx-auto">
      {tiers.map((t, i) => (
        <motion.div
          key={t.label}
          initial={reduced ? false : { opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.35 }}
          className="space-y-1.5"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold text-white">{t.label}</span>
            <span className="font-mono text-base text-blue-200">{t.tokens}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className={cn("h-full rounded-full", t.color)}
              initial={{ width: "0%" }}
              animate={{ width: `${t.width}%` }}
              transition={{ delay: reduced ? 0 : i * 0.3 + 0.15, duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-base text-slate-400">{t.when}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ScaleVisual({ reduced }: { reduced: boolean }) {
  const skills = ["PDF forms", "Brand decks", "Excel", "SQL", "Testing", "+ 100s more"];
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <div className="flex flex-wrap justify-center gap-2">
        {skills.map((s, i) => (
          <motion.span
            key={s}
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.12, duration: 0.3, type: "spring", bounce: 0.4 }}
            className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-1.5 text-base font-semibold text-rose-100"
          >
            {s}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.8, duration: 0.4 }}
        className="w-full rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-center"
      >
        <p className="text-lg font-bold text-rose-100 leading-snug">
          Each loads only when relevant
        </p>
        <p className="text-base text-rose-200/80 mt-1">
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
      case "folder":   return <FolderVisual   reduced={reducedMotion} />;
      case "metadata": return <MetadataVisual reduced={reducedMotion} />;
      case "trigger":  return <TriggerVisual  reduced={reducedMotion} />;
      case "tiers":    return <TiersVisual    reduced={reducedMotion} />;
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
