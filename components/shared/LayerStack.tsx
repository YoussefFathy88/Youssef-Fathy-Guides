"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface StackLayer {
  id: string;
  label: string;
  sublabel?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
  detail: string;
}

export interface LayerStackProps {
  layers: StackLayer[];
  title?: string;
  caption?: string;
  direction?: "top-to-bottom" | "bottom-to-top";
}

const colorMap = {
  violet: {
    bg: "bg-violet-500/90 hover:bg-violet-500",
    activeBg: "bg-violet-500",
    text: "text-white",
    sub: "text-violet-100",
    detail: "bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-500/10 dark:border-violet-500/30 dark:text-violet-200",
    dot: "bg-violet-400",
    arrowColor: "#8b5cf6",
  },
  teal: {
    bg: "bg-teal-500/90 hover:bg-teal-500",
    activeBg: "bg-teal-500",
    text: "text-white",
    sub: "text-teal-100",
    detail: "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-500/10 dark:border-teal-500/30 dark:text-teal-200",
    dot: "bg-teal-400",
    arrowColor: "#14b8a6",
  },
  amber: {
    bg: "bg-amber-500/90 hover:bg-amber-500",
    activeBg: "bg-amber-500",
    text: "text-white",
    sub: "text-amber-100",
    detail: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200",
    dot: "bg-amber-400",
    arrowColor: "#f59e0b",
  },
  blue: {
    bg: "bg-blue-500/90 hover:bg-blue-500",
    activeBg: "bg-blue-500",
    text: "text-white",
    sub: "text-blue-100",
    detail: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-200",
    dot: "bg-blue-400",
    arrowColor: "#3b82f6",
  },
  rose: {
    bg: "bg-rose-500/90 hover:bg-rose-500",
    activeBg: "bg-rose-500",
    text: "text-white",
    sub: "text-rose-100",
    detail: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-200",
    dot: "bg-rose-400",
    arrowColor: "#f43f5e",
  },
  gray: {
    bg: "bg-gray-400/90 hover:bg-gray-500",
    activeBg: "bg-gray-500",
    text: "text-white",
    sub: "text-gray-100",
    detail: "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300",
    dot: "bg-gray-300",
    arrowColor: "#94a3b8",
  },
} as const;

export default function LayerStack({
  layers,
  title,
  caption,
  direction = "top-to-bottom",
}: LayerStackProps) {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);

  const displayLayers = direction === "bottom-to-top" ? [...layers].reverse() : layers;

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

      {/* Direction indicator */}
      <div className="mb-3 flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          {direction === "top-to-bottom" ? (
            <path d="M6 1 L6 11 M2 7 L6 11 L10 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M6 11 L6 1 M2 5 L6 1 L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
        <span>Data flows {direction === "top-to-bottom" ? "downward" : "upward"} — click a layer to expand</span>
      </div>

      <div className="space-y-1.5">
        {displayLayers.map((layer, i) => {
          const tone = colorMap[layer.color ?? "violet"];
          const isActive = activeId === layer.id;
          const origIndex = direction === "bottom-to-top" ? layers.length - 1 - i : i;

          return (
            <motion.div
              key={layer.id}
              initial={reducedMotion ? false : { opacity: 0, scaleY: 0.6, originY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.28, delay: origIndex * 0.06, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setActiveId(isActive ? null : layer.id)}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-left transition-all duration-200",
                  isActive ? tone.activeBg : tone.bg,
                  "shadow-sm hover:shadow-md",
                )}
                aria-expanded={isActive}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Layer number badge */}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                      {origIndex + 1}
                    </span>
                    <div>
                      <p className={cn("text-sm font-semibold", tone.text)}>{layer.label}</p>
                      {layer.sublabel && (
                        <p className={cn("text-[11px]", tone.sub)}>{layer.sublabel}</p>
                      )}
                    </div>
                  </div>
                  {/* Expand chevron */}
                  <motion.svg
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0 text-white/70"
                  >
                    <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </div>
              </button>

              {/* Detail panel */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className={cn(
                        "rounded-b-xl border border-t-0 px-4 py-3 text-sm leading-relaxed",
                        tone.detail,
                      )}
                    >
                      {layer.detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Animated data packet */}
      {!reducedMotion && (
        <div className="mt-4 flex justify-center">
          <DataPacket count={Math.min(layers.length, 5)} direction={direction} />
        </div>
      )}
    </motion.div>
  );
}

function DataPacket({ count, direction }: { count: number; direction: "top-to-bottom" | "bottom-to-top" }) {
  return (
    <div className="flex items-center gap-1 opacity-40">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-violet-400 dark:bg-violet-500"
          animate={{
            y: direction === "top-to-bottom" ? [0, 6, 0] : [0, -6, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.4,
            delay: i * 0.18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
