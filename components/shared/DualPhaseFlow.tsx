"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface PhaseStep {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

export interface StoredArtifact {
  label: string;
  sublabel?: string;
  icon?: string;
}

export interface PhaseConfig {
  label: string;
  frequency: string;
  frequencyDetail?: string;
  color: "violet" | "teal" | "amber" | "blue" | "rose" | "gray";
  steps: PhaseStep[];
}

export interface DualPhaseFlowProps {
  title?: string;
  caption?: string;
  leftPhase: PhaseConfig;
  rightPhase: PhaseConfig;
  artifact: StoredArtifact;
}

const colorTokens = {
  violet: {
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    freq: "bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-500/10 dark:border-violet-500/30 dark:text-violet-400",
    stepBg: "bg-violet-50 dark:bg-violet-500/10",
    stepBorder: "border-violet-200 dark:border-violet-500/30",
    stepText: "text-violet-600 dark:text-violet-400",
    arrow: "#8b5cf6",
    arrowBg: "bg-violet-100 dark:bg-violet-500/20",
    panel: "border-violet-200 dark:border-violet-500/20",
    panelBg: "bg-violet-50/30 dark:bg-violet-500/5",
    dot: "#8b5cf6",
  },
  teal: {
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    freq: "bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-500/10 dark:border-teal-500/30 dark:text-teal-400",
    stepBg: "bg-teal-50 dark:bg-teal-500/10",
    stepBorder: "border-teal-200 dark:border-teal-500/30",
    stepText: "text-teal-600 dark:text-teal-400",
    arrow: "#14b8a6",
    arrowBg: "bg-teal-100 dark:bg-teal-500/20",
    panel: "border-teal-200 dark:border-teal-500/20",
    panelBg: "bg-teal-50/30 dark:bg-teal-500/5",
    dot: "#14b8a6",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    freq: "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400",
    stepBg: "bg-amber-50 dark:bg-amber-500/10",
    stepBorder: "border-amber-200 dark:border-amber-500/30",
    stepText: "text-amber-600 dark:text-amber-400",
    arrow: "#f59e0b",
    arrowBg: "bg-amber-100 dark:bg-amber-500/20",
    panel: "border-amber-200 dark:border-amber-500/20",
    panelBg: "bg-amber-50/30 dark:bg-amber-500/5",
    dot: "#f59e0b",
  },
  blue: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    freq: "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400",
    stepBg: "bg-blue-50 dark:bg-blue-500/10",
    stepBorder: "border-blue-200 dark:border-blue-500/30",
    stepText: "text-blue-600 dark:text-blue-400",
    arrow: "#3b82f6",
    arrowBg: "bg-blue-100 dark:bg-blue-500/20",
    panel: "border-blue-200 dark:border-blue-500/20",
    panelBg: "bg-blue-50/30 dark:bg-blue-500/5",
    dot: "#3b82f6",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    freq: "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400",
    stepBg: "bg-rose-50 dark:bg-rose-500/10",
    stepBorder: "border-rose-200 dark:border-rose-500/30",
    stepText: "text-rose-600 dark:text-rose-400",
    arrow: "#f43f5e",
    arrowBg: "bg-rose-100 dark:bg-rose-500/20",
    panel: "border-rose-200 dark:border-rose-500/20",
    panelBg: "bg-rose-50/30 dark:bg-rose-500/5",
    dot: "#f43f5e",
  },
  gray: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    freq: "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400",
    stepBg: "bg-gray-50 dark:bg-gray-800",
    stepBorder: "border-gray-200 dark:border-gray-700",
    stepText: "text-gray-600 dark:text-gray-400",
    arrow: "#94a3b8",
    arrowBg: "bg-gray-100 dark:bg-gray-700",
    panel: "border-gray-200 dark:border-gray-700",
    panelBg: "bg-gray-50/50 dark:bg-gray-800/30",
    dot: "#94a3b8",
  },
} as const;

function DownArrow({ color, delay, reducedMotion }: { color: string; delay: number; reducedMotion: boolean | null }) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      style={{ transformOrigin: "top" }}
      className="flex flex-col items-center py-0.5"
      aria-hidden="true"
    >
      <div className="h-4 w-px" style={{ background: `${color}55` }} />
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1L5 5L9 1" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

function PhaseColumn({
  phase,
  side,
  reducedMotion,
}: {
  phase: PhaseConfig;
  side: "left" | "right";
  reducedMotion: boolean | null;
}) {
  const tone = colorTokens[phase.color];
  const fromX = side === "left" ? -16 : 16;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0">
      {/* Phase header */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, x: fromX }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-3 space-y-1.5"
      >
        <span
          className={cn(
            "inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider",
            tone.badge,
          )}
        >
          {phase.label}
        </span>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium",
            tone.freq,
          )}
        >
          <span className="text-base leading-none">{phase.frequency.includes("once") ? "⏱" : "⚡"}</span>
          <span className="leading-snug">{phase.frequency}</span>
        </div>
        {phase.frequencyDetail && (
          <p className="text-[11px] leading-snug text-gray-500 dark:text-gray-400">{phase.frequencyDetail}</p>
        )}
      </motion.div>

      {/* Steps */}
      <div className="flex flex-col">
        {phase.steps.map((step, i) => (
          <div key={step.id} className="flex flex-col">
            {/* Step card */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, x: fromX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.08 + i * 0.07, ease: "easeOut" }}
              className={cn(
                "rounded-xl border px-3 py-2.5",
                tone.stepBg,
                tone.stepBorder,
              )}
            >
              <div className="flex min-w-0 items-start gap-2">
                {step.icon && (
                  <span className="mt-0.5 shrink-0 text-sm leading-none">{step.icon}</span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{step.label}</p>
                  {step.sublabel && (
                    <p className={cn("mt-0.5 text-[11px] leading-snug", tone.stepText)}>
                      {step.sublabel}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Down arrow between steps (not after last) */}
            {i < phase.steps.length - 1 && (
              <DownArrow
                color={tone.dot}
                delay={0.1 + i * 0.07}
                reducedMotion={reducedMotion}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArtifactBridge({
  artifact,
  leftColor,
  rightColor,
  reducedMotion,
}: {
  artifact: StoredArtifact;
  leftColor: string;
  rightColor: string;
  reducedMotion: boolean | null;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-0 px-1" style={{ width: 96 }}>
      {/* Horizontal arrow from left → artifact */}
      <div className="flex w-full items-center" style={{ marginTop: 72 }}>
        <div className="h-px flex-1" style={{ background: `${colorTokens[leftColor as keyof typeof colorTokens]?.dot}55` }} />
        <svg width="8" height="10" viewBox="0 0 8 10" fill="none" className="shrink-0">
          <path d="M1 1L7 5L1 9" stroke={colorTokens[leftColor as keyof typeof colorTokens]?.dot ?? "#8b5cf6"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Artifact card */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white px-2 py-3 text-center shadow-sm dark:border-gray-600 dark:bg-gray-900"
      >
        {artifact.icon && (
          <div className="mb-1 text-xl leading-none">{artifact.icon}</div>
        )}
        <p className="text-[11px] font-bold leading-snug text-gray-800 dark:text-gray-200">
          {artifact.label}
        </p>
        {artifact.sublabel && (
          <p className="mt-0.5 text-[10px] leading-snug text-gray-500 dark:text-gray-400">
            {artifact.sublabel}
          </p>
        )}
        {/* "Stored" badge */}
        <div className="mt-1.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          stored
        </div>
      </motion.div>

      {/* Horizontal arrow from artifact → right */}
      <div className="flex w-full items-center">
        <div className="h-px flex-1" style={{ background: `${colorTokens[rightColor as keyof typeof colorTokens]?.dot}55` }} />
        <svg width="8" height="10" viewBox="0 0 8 10" fill="none" className="shrink-0">
          <path d="M1 1L7 5L1 9" stroke={colorTokens[rightColor as keyof typeof colorTokens]?.dot ?? "#14b8a6"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export default function DualPhaseFlow({
  title,
  caption,
  leftPhase,
  rightPhase,
  artifact,
}: DualPhaseFlowProps) {
  const reducedMotion = useReducedMotion();
  const leftTone = colorTokens[leftPhase.color];
  const rightTone = colorTokens[rightPhase.color];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Two-panel layout */}
      <div
        className="relative rounded-xl border bg-white dark:bg-gray-900/60"
        style={{
          borderColor: "#e5e7eb",
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.10) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {/* Panel backgrounds */}
        <div className="pointer-events-none absolute inset-0 flex overflow-hidden rounded-xl">
          <div className={cn("flex-1 opacity-40", leftTone.panelBg)} style={{ borderRight: `1px dashed ${leftTone.dot}30` }} />
          <div style={{ width: 96 }} />
          <div className={cn("flex-1 opacity-40", rightTone.panelBg)} />
        </div>

        {/* Content */}
        <div className="relative flex gap-0 p-5">
          <PhaseColumn phase={leftPhase} side="left" reducedMotion={reducedMotion} />
          <ArtifactBridge
            artifact={artifact}
            leftColor={leftPhase.color}
            rightColor={rightPhase.color}
            reducedMotion={reducedMotion}
          />
          <PhaseColumn phase={rightPhase} side="right" reducedMotion={reducedMotion} />
        </div>
      </div>
    </motion.div>
  );
}
