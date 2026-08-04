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
    title: "One prompt, two totally different jobs",
    subtitle: "Same AI... two totally different ideas. 🤔",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "intro",
    title: "The answer is one parameter",
    subtitle: "Controls how the model picks its next word",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "low",
    title: "Low Temperature",
    subtitle: "Nearly the same answer every time",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "high",
    title: "High Temperature",
    subtitle: "Wide distribution → every word is possible",
    accentColor: "text-orange-300",
    badgeColor: "bg-orange-500/20 text-orange-200 border-orange-500/30",
  },
];

// ─── Distribution data — illustrative only ───────────────────────────────────
// Low temp: sharply peaked on the top candidate.
// High temp: near-flat, every candidate has a real chance.
const LOW_DIST = [1.0, 0.05, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01];
const HIGH_DIST = [0.6, 0.55, 0.5, 0.45, 0.4, 0.38, 0.35, 0.3];

// ─── Shared sub-components ────────────────────────────────────────────────────

/** Semi-circular gauge, range 0–2. Needle + color sweep blue → orange. */
function ArcDial({ value, reduced }: { value: number; reduced: boolean }) {
  const size = 128;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const radius = size / 2 - 16;
  const clamped = Math.max(0, Math.min(2, value));
  const t = clamped / 2;
  const rotationDeg = -90 + t * 180;

  const r = Math.round(59 + (249 - 59) * t);
  const g = Math.round(130 + (115 - 130) * t);
  const b = Math.round(246 + (22 - 246) * t);
  const color = `rgb(${r}, ${g}, ${b})`;

  const startX = cx - radius;
  const endX = cx + radius;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size / 2 + 22}
        viewBox={`0 0 ${size} ${size / 2 + 22}`}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      >
        <path
          d={`M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${cy}`}
          stroke="#334155"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <motion.line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - (radius - 6)}
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={reduced ? false : { rotate: -90 }}
          animate={{ rotate: rotationDeg }}
          transition={{ type: "spring", stiffness: 70, damping: 11 }}
        />
        <circle cx={cx} cy={cy} r="6" fill={color} />
      </svg>
      <p className="font-mono text-lg font-bold" style={{ color }}>
        T = {clamped.toFixed(1)}
      </p>
    </div>
  );
}

/** 8-bar distribution chart. Animates to new heights when data changes. */
function DistributionChart({
  data,
  initialData,
  colorClass,
  reduced,
}: {
  data: number[];
  initialData?: number[];
  colorClass: string;
  reduced: boolean;
}) {
  return (
    <div className="flex h-24 w-full max-w-[280px] items-end gap-1.5 mx-auto">
      {data.map((h, i) => (
        <motion.div
          key={i}
          className={cn("flex-1 rounded-t-md", colorClass)}
          initial={
            reduced ? false : { height: `${(initialData?.[i] ?? 0) * 100}%` }
          }
          animate={{ height: `${h * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: reduced ? 0 : i * 0.05 }}
        />
      ))}
    </div>
  );
}

interface BadgeItem {
  icon: string;
  label: string;
}

const BADGE_COLOR_MAP: Record<string, string> = {
  blue: "border-blue-400/40 bg-blue-500/20 text-blue-200",
  orange: "border-orange-400/40 bg-orange-500/20 text-orange-200",
};

/** Row of pill badges, staggered fade/slide-in. */
function BadgeRow({
  items,
  color,
  reduced,
}: {
  items: BadgeItem[];
  color: "blue" | "orange";
  reduced: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item, i) => (
        <motion.span
          key={item.label}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.12, duration: 0.3 }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-base font-semibold",
            BADGE_COLOR_MAP[color],
          )}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </motion.span>
      ))}
    </div>
  );
}

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
        <p className="text-lg font-semibold text-white">Tell me a new AI concept</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-2">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : 0.25, duration: 0.35 }}
          className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-2.5 py-2 flex flex-col gap-1.5"
        >
          <p className="text-base font-bold text-blue-200">Response 1</p>
          <p className="text-base font-semibold leading-snug bg-gradient-to-r from-blue-300 via-violet-300 to-orange-300 bg-clip-text text-transparent">
            Temperature shapes how bold each reply feels.
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : 0.45, duration: 0.35 }}
          className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-2.5 py-2 flex flex-col gap-1.5"
        >
          <p className="text-base font-semibold leading-snug text-teal-100">
            Temperature shapes tone and risk, kind of, in every reply.
          </p>
          <span className="self-start mt-1 rounded-full border border-teal-400/40 bg-teal-500/20 px-2 py-0.5 text-base font-bold text-teal-200">
            Tokens
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function IntroVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 w-full max-w-[320px] mx-auto">
      <motion.h3
        initial={reduced ? false : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
        className="text-4xl font-extrabold text-white text-center"
      >
        Temperature
      </motion.h3>
      <ArcDial value={1} reduced={reduced} />
    </div>
  );
}

function LowVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 px-4 w-full max-w-[320px] mx-auto rounded-2xl bg-blue-500/5 py-3">
      <div className="flex items-center justify-between">
        <ArcDial value={0} reduced={reduced} />
        <div className="text-right">
          <p className="text-base text-slate-300">The model is</p>
          <p className="text-lg font-bold text-blue-200 leading-tight">
            focused and precise
          </p>
        </div>
      </div>

      <DistributionChart data={LOW_DIST} colorClass="bg-blue-500" reduced={reduced} />

      <p className="text-center text-base text-slate-400">
        Narrow distribution → same answer every time
      </p>

      <BadgeRow
        color="blue"
        reduced={reduced}
        items={[
          { icon: "💻", label: "Code" },
          { icon: "🔢", label: "Math" },
          { icon: "📋", label: "Facts" },
        ]}
      />
    </div>
  );
}

function HighVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 px-4 w-full max-w-[320px] mx-auto rounded-2xl bg-orange-500/5 py-3">
      <div className="flex items-center justify-between">
        <ArcDial value={1.5} reduced={reduced} />
        <div className="text-right">
          <p className="text-base text-slate-300">The model</p>
          <p className="text-lg font-bold text-orange-200 leading-tight">
            experiments and creates
          </p>
        </div>
      </div>

      <DistributionChart
        data={HIGH_DIST}
        initialData={LOW_DIST}
        colorClass="bg-orange-500"
        reduced={reduced}
      />

      <p className="text-center text-base text-slate-400">
        Wide distribution → every word is possible
      </p>

      <BadgeRow
        color="orange"
        reduced={reduced}
        items={[
          { icon: "✍️", label: "Stories" },
          { icon: "💡", label: "Ideas" },
          { icon: "🎨", label: "Creative" },
        ]}
      />
    </div>
  );
}

function CheatsheetVisual({ reduced }: { reduced: boolean }) {
  const rows = [
    { icon: "💻", label: "Code / Math / Facts", value: "T = 0 - 0.3", color: "blue" as const },
    { icon: "✉️", label: "Emails / Summaries", value: "T = 0.7", color: "amber" as const },
    { icon: "🎨", label: "Stories / Brainstorm", value: "T = 1.5+", color: "orange" as const },
  ];

  const rowColor: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    orange: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  };

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      {rows.map((row, i) => (
        <motion.div
          key={row.label}
          initial={reduced ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.35 }}
          className={cn(
            "rounded-xl border px-3 py-2.5 flex items-center justify-between gap-3",
            rowColor[row.color],
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{row.icon}</span>
            <span className="text-base font-semibold text-white">{row.label}</span>
          </div>
          <span className="font-mono text-lg font-bold">{row.value}</span>
        </motion.div>
      ))}

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: 1, scale: [1, 1.03, 1] }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : { delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        className="text-center text-lg font-bold text-emerald-300"
      >
        Subscribe for more! 🔥
      </motion.p>
      <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20l-7-7 7-7" />
          <path d="M20 12H4" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TemperatureShort() {
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
      case "hook":       return <HookVisual       reduced={reducedMotion} />;
      case "intro":      return <IntroVisual      reduced={reducedMotion} />;
      case "low":        return <LowVisual         reduced={reducedMotion} />;
      case "high":       return <HighVisual        reduced={reducedMotion} />;
      case "cheatsheet": return <CheatsheetVisual  reduced={reducedMotion} />;
      default:           return null;
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
          Temperature
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
