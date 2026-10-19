"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface MacroPipelineBlock {
  id: string;
  label: string;
  sublabel?: string;
  emoji?: string;
  color?: "gray" | "violet" | "blue" | "teal" | "amber" | "rose" | "indigo" | "cyan";
}

export interface MacroPipelineStep {
  id: string;
  label: string;
  description: string;
  highlightBlocks: string[];
}

export interface MacroPipelineProps {
  blocks: MacroPipelineBlock[];
  steps?: MacroPipelineStep[];
  title?: string;
  caption?: string;
  hasLoop?: boolean;
}

const colorMap = {
  gray: {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    accent: "bg-slate-500",
    text: "text-slate-700 dark:text-slate-300",
    glow: "shadow-[0_0_15px_rgba(148,163,184,0.1)]"
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    accent: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.15)]"
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    accent: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]"
  },
  teal: {
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    accent: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-300",
    glow: "shadow-[0_0_15px_rgba(20,184,166,0.15)]"
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    accent: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]"
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    accent: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]"
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    accent: "bg-indigo-500",
    text: "text-indigo-700 dark:text-indigo-300",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.15)]"
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    accent: "bg-cyan-500",
    text: "text-cyan-700 dark:text-cyan-300",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]"
  }
} as const;

export default function MacroPipeline({
  blocks,
  steps,
  title,
  caption,
  hasLoop = false
}: MacroPipelineProps) {
  const reducedMotion = useReducedMotion();
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loopHeight, setLoopHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setLoopHeight(containerRef.current.offsetHeight);
    }
  }, [blocks]);

  const activeStep = steps?.[activeStepIdx];
  const highlightedBlocks = activeStep?.highlightBlocks ?? [];

  return (
    <div className="surface-panel w-full p-8 md:p-10">
      {(title || caption) && (
        <div className="mb-8 space-y-2">
          {title && <h2 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">{title}</h2>}
          {caption && <p className="text-lg text-slate-600 dark:text-slate-400">{caption}</p>}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        {/* The Pipeline */}
        <div ref={containerRef} className="relative flex flex-col items-center gap-2">
          {blocks.map((block, i) => {
            const tone = colorMap[block.color ?? "gray"];
            const isHighlighted = highlightedBlocks.includes(block.id);
            const isActive = highlightedBlocks.length > 0 ? isHighlighted : true;

            return (
              <div key={block.id} className="flex flex-col items-center w-full">
                <motion.div
                  layout
                  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.3,
                    scale: isHighlighted ? 1.02 : 1,
                    y: 0 
                  }}
                  className={cn(
                    "relative w-full max-w-lg rounded-2xl border bg-gray-900/[0.04] dark:bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300",
                    isHighlighted ? "border-gray-300 dark:border-white/40 ring-1 ring-gray-300 dark:ring-white/20" : tone.border,
                    isHighlighted && tone.glow
                  )}
                >
                  <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl overflow-hidden">
                    <div className={cn("h-full w-full", tone.accent)} />
                  </div>
                  
                  <div className="flex items-center gap-5 pl-4">
                    {block.emoji && (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-900/[0.04] dark:bg-white/5 text-3xl shadow-inner ring-1 ring-gray-200 dark:ring-white/10">
                        {block.emoji}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight">{block.label}</h3>
                      {block.sublabel && (
                        <p className={cn("mt-1 text-base font-medium", tone.text)}>
                          {block.sublabel}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {i < blocks.length - 1 && (
                  <div className="flex flex-col items-center py-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-white/20">
                      <path d="M12 4V20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loop Arrow */}
          {hasLoop && loopHeight > 0 && (
            <div className="absolute -right-6 top-8 bottom-8 w-12 pointer-events-none">
              <svg 
                width="48" 
                height={loopHeight - 64} 
                viewBox={`0 0 48 ${loopHeight - 64}`} 
                fill="none" 
                className="overflow-visible"
              >
                <path
                  d={`M 0,0 C 60,0 60,${loopHeight - 64} 0,${loopHeight - 64}`}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
                {/* Arrowheads */}
                <path d="M -4,8 L 0,0 L 4,8" fill="rgba(255,255,255,0.15)" />
                <path 
                  d="M -4,-8 L 0,0 L 4,-8" 
                  fill="rgba(255,255,255,0.15)" 
                  transform={`translate(0, ${loopHeight - 64})`} 
                />
              </svg>
              <div className="absolute top-1/2 left-8 -translate-y-1/2 rotate-90 whitespace-nowrap bg-[color:var(--surface-strong)] px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-white/40 ring-1 ring-gray-200 dark:ring-white/5">
                Loop Context
              </div>
            </div>
          )}
        </div>

        {/* Narrative Steps */}
        {steps && steps.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/[0.04] p-7 backdrop-blur-xl shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-white/30">
                  Phase {activeStepIdx + 1} / {steps.length}
                </span>
                <div className="flex gap-1.5">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "h-1.5 w-5 rounded-full transition-all duration-300",
                        idx === activeStepIdx ? "bg-violet-500 w-8 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "bg-gray-900/[0.07] dark:bg-white/10"
                      )}
                    />
                  ))}
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">{activeStep?.label}</h4>
              <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                {activeStep?.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
                disabled={activeStepIdx === 0}
                className="flex-1 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 py-4 font-bold text-gray-950 dark:text-white transition hover:bg-gray-900/[0.07] dark:hover:bg-white/10 disabled:opacity-20 active:scale-95"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (activeStepIdx === steps.length - 1) {
                    setActiveStepIdx(0);
                  } else {
                    setActiveStepIdx(prev => prev + 1);
                  }
                }}
                className="flex-[2] rounded-2xl bg-violet-600 py-4 font-bold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 hover:shadow-violet-900/40 active:scale-95"
              >
                {activeStepIdx === steps.length - 1 ? "Restart Walkthrough" : "Next Phase"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
