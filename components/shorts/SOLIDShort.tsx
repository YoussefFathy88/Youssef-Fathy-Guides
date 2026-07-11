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
    id: "hook",
    title: "One change breaks ten classes — why?",
    subtitle: "Tight coupling — classes do too much",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
  {
    id: "srp",
    title: "S: One class, one job only",
    subtitle: "Single Responsibility — User saves, Mailer sends",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "oc_lsp",
    title: "O & L: Extend, don't break",
    subtitle: "Open/Closed + Liskov — add features without rewriting",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "id",
    title: "I & D: Small interfaces, swap freely",
    subtitle: "Interface Segregation + Dependency Inversion",
    accentColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
  {
    id: "result",
    title: "SOLID code changes in one place",
    subtitle: "Each principle cuts the blast radius of a change",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

const COUPLED_NODES = [
  { id: "UserService", x: "50%", y: "15%", isHub: true },
  { id: "DB", x: "15%", y: "42%" },
  { id: "Email", x: "85%", y: "42%" },
  { id: "Auth", x: "15%", y: "68%" },
  { id: "Log", x: "50%", y: "75%" },
  { id: "PDF", x: "85%", y: "68%" },
];

function HookVisual({ reduced }: { reduced: boolean }) {
  const [triggered, setTriggered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-base text-slate-400 text-center">
        One fat class — everything depends on it
      </p>

      {/* Node graph */}
      <div className="relative w-full h-44">
        {/* Edges */}
        {COUPLED_NODES.slice(1).map((node) => (
          <svg
            key={node.id}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <line
              x1="50%"
              y1="20%"
              x2={node.x}
              y2={node.y}
              stroke={triggered ? "#f87171" : "#475569"}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
        ))}

        {/* Nodes */}
        {COUPLED_NODES.map((node, i) => (
          <motion.div
            key={node.id}
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: triggered && !node.isHub ? [1, 1.15, 1] : 1,
            }}
            transition={{
              delay: reduced ? 0 : i * 0.1,
              duration: 0.3,
              ...(triggered && !node.isHub
                ? { duration: 0.4, delay: 0.2 + i * 0.07 }
                : {}),
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: node.x, top: node.y }}
          >
            <div
              className={cn(
                "rounded-xl border px-2.5 py-1.5 text-sm font-bold whitespace-nowrap",
                node.isHub
                  ? "border-rose-400/60 bg-rose-500/25 text-rose-100"
                  : triggered
                    ? "border-orange-400/60 bg-orange-500/20 text-orange-200"
                    : "border-slate-500/40 bg-slate-800/60 text-slate-200",
              )}
            >
              {node.id}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={() => setTriggered((t) => !t)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "w-full rounded-xl border px-4 py-2.5 text-base font-semibold transition",
          triggered
            ? "border-rose-400/60 bg-rose-500/20 text-rose-100"
            : "border-slate-500/40 bg-slate-700/50 text-slate-200",
        )}
      >
        {triggered ? "💥 Ripple! Tap to reset" : "Tap to change UserService"}
      </motion.button>
    </div>
  );
}

const SRP_BEFORE = ["saveUser()", "sendEmail()", "generatePDF()", "logAction()", "authenticate()"];
const SRP_AFTER = [
  { cls: "User", methods: ["save()", "find()"], color: "border-violet-400/50 bg-violet-500/15 text-violet-100" },
  { cls: "Mailer", methods: ["send()"], color: "border-teal-400/50 bg-teal-500/15 text-teal-100" },
  { cls: "Auth", methods: ["login()"], color: "border-amber-400/50 bg-amber-500/15 text-amber-100" },
];

function SrpVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      {/* Before */}
      <div>
        <p className="text-base font-bold uppercase tracking-wide text-slate-400 mb-2">
          ✗ Before — one class does everything
        </p>
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 space-y-1">
          <p className="text-base font-bold text-rose-200">UserService</p>
          {SRP_BEFORE.map((m, i) => (
            <motion.p
              key={m}
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.08, duration: 0.25 }}
              className="text-base font-mono text-rose-300/80"
            >
              · {m}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center text-slate-500">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* After */}
      <div>
        <p className="text-base font-bold uppercase tracking-wide text-slate-400 mb-2">
          ✓ After — split by responsibility
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SRP_AFTER.map((cls, i) => (
            <motion.div
              key={cls.cls}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.45 + i * 0.15, duration: 0.3 }}
              className={cn("rounded-xl border px-2 py-2.5 text-center", cls.color)}
            >
              <p className="text-base font-bold">{cls.cls}</p>
              {cls.methods.map((m) => (
                <p key={m} className="text-xs font-mono opacity-70 mt-0.5">{m}</p>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const OC_LSP_ROWS = [
  {
    principle: "Open/Closed",
    letter: "O",
    rule: "Open to extend, closed to modify",
    before: "Edit existing class to add shape",
    after: "extend Shape → add Circle class",
    beforeColor: "text-rose-300",
    afterColor: "text-emerald-300",
  },
  {
    principle: "Liskov",
    letter: "L",
    rule: "Subclass must honour the parent contract",
    before: "Square breaks Rectangle behaviour",
    after: "Square → own class, no inheritance",
    beforeColor: "text-rose-300",
    afterColor: "text-emerald-300",
  },
];

function OcLspVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      {OC_LSP_ROWS.map((row, i) => (
        <motion.div
          key={row.letter}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.4 }}
          className="rounded-2xl border border-slate-600/40 bg-slate-800/50 px-3 py-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/25 text-base font-extrabold text-blue-200">
              {row.letter}
            </span>
            <p className="text-base font-bold text-blue-100">{row.principle}</p>
          </div>
          <p className="text-base text-slate-300 italic">&ldquo;{row.rule}&rdquo;</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-400 mb-0.5">✗ Bad</p>
              <p className={cn("text-sm leading-tight", row.beforeColor)}>{row.before}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-400 mb-0.5">✓ Good</p>
              <p className={cn("text-sm leading-tight", row.afterColor)}>{row.after}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const FAT_INTERFACE_METHODS = ["save()", "send()", "log()", "export()"];
const SMALL_INTERFACES = [
  { name: "Saveable", methods: ["save()"], color: "border-emerald-400/50 bg-emerald-500/15 text-emerald-100" },
  { name: "Sender", methods: ["send()"], color: "border-violet-400/50 bg-violet-500/15 text-violet-100" },
  { name: "Logger", methods: ["log()"], color: "border-amber-400/50 bg-amber-500/15 text-amber-100" },
  { name: "Exporter", methods: ["export()"], color: "border-teal-400/50 bg-teal-500/15 text-teal-100" },
];

function IdVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      {/* ISP */}
      <div>
        <p className="text-base font-bold text-slate-400 mb-2 uppercase tracking-wide">
          I — Interface Segregation
        </p>
        <div className="flex items-center gap-3">
          {/* Fat interface */}
          <div className="flex-1 rounded-xl border border-rose-500/40 bg-rose-500/10 px-2 py-2.5">
            <p className="text-xs font-bold text-rose-300 mb-1.5 uppercase tracking-wide">✗ Fat</p>
            {FAT_INTERFACE_METHODS.map((m, i) => (
              <motion.p
                key={m}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduced ? 0 : i * 0.07 }}
                className="text-sm font-mono text-rose-200/80"
              >
                {m}
              </motion.p>
            ))}
          </div>

          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-500 shrink-0" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>

          {/* Small interfaces */}
          <div className="flex-1 grid grid-cols-2 gap-1.5">
            {SMALL_INTERFACES.map((iface, i) => (
              <motion.div
                key={iface.name}
                initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduced ? 0 : 0.35 + i * 0.1, duration: 0.25 }}
                className={cn("rounded-lg border px-1.5 py-1.5 text-center", iface.color)}
              >
                <p className="text-xs font-bold">{iface.name}</p>
                <p className="text-xs font-mono opacity-70">{iface.methods[0]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* DIP */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.75, duration: 0.4 }}
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 space-y-2"
      >
        <p className="text-base font-bold text-emerald-200 uppercase tracking-wide">
          D — Dependency Inversion
        </p>
        <div className="space-y-1.5">
          <p className="text-base text-slate-300">Depend on the <span className="font-bold text-emerald-300">interface</span>, not the class</p>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-slate-500/40 bg-slate-800/60 px-2.5 py-1.5">
              <p className="text-sm font-mono text-slate-200">OrderService</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1.5">
              <p className="text-sm font-mono text-emerald-200">IEmailSender</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Swap any implementation — no rewrite</p>
        </div>
      </motion.div>
    </div>
  );
}

const RESULT_STATS = [
  { label: "Classes changed", value: "1", color: "border-amber-400/50 bg-amber-500/15 text-amber-100" },
  { label: "Tests broken", value: "0", color: "border-emerald-400/50 bg-emerald-500/15 text-emerald-100" },
  { label: "Regressions", value: "0", color: "border-emerald-400/50 bg-emerald-500/15 text-emerald-100" },
];

const PRINCIPLE_CHIPS = [
  { letter: "S", name: "Single Responsibility", color: "bg-violet-500/20 border-violet-400/40 text-violet-200" },
  { letter: "O", name: "Open/Closed", color: "bg-blue-500/20 border-blue-400/40 text-blue-200" },
  { letter: "L", name: "Liskov Substitution", color: "bg-sky-500/20 border-sky-400/40 text-sky-200" },
  { letter: "I", name: "Interface Segregation", color: "bg-teal-500/20 border-teal-400/40 text-teal-200" },
  { letter: "D", name: "Dependency Inversion", color: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200" },
];

function ResultVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[320px] mx-auto">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        {RESULT_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.18, duration: 0.35, type: "spring", bounce: 0.4 }}
            className={cn("rounded-2xl border px-2 py-3 text-center", stat.color)}
          >
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-xs font-semibold leading-tight mt-1 opacity-80">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Principle chips */}
      <div>
        <p className="text-base font-bold uppercase tracking-wide text-slate-400 mb-2">
          The five principles
        </p>
        <div className="space-y-1.5">
          {PRINCIPLE_CHIPS.map((p, i) => (
            <motion.div
              key={p.letter}
              initial={reduced ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduced ? 0 : 0.55 + i * 0.1, duration: 0.3 }}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-1.5",
                p.color,
              )}
            >
              <span className="text-lg font-extrabold w-5 text-center">{p.letter}</span>
              <span className="text-base font-semibold">{p.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SOLIDShort() {
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
      case "hook":   return <HookVisual   reduced={reducedMotion} />;
      case "srp":    return <SrpVisual    reduced={reducedMotion} />;
      case "oc_lsp": return <OcLspVisual  reduced={reducedMotion} />;
      case "id":     return <IdVisual     reduced={reducedMotion} />;
      case "result": return <ResultVisual reduced={reducedMotion} />;
      default:       return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Badge + step dots */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor,
          )}
        >
          SOLID
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
                i === stepIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
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

      {/* Subtitle strip */}
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
            <p className="text-center text-base font-medium text-white">
              {step.subtitle}
            </p>
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
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center text-base font-medium uppercase tracking-widest text-white/50">
          Step {stepIndex + 1} / {STEPS.length} — tap Next
        </p>
      </div>
    </div>
  );
}
