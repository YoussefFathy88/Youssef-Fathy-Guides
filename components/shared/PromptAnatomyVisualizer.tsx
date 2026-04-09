"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type PromptPartColor = "violet" | "teal" | "amber" | "blue" | "rose" | "gray";

export interface PromptPart {
  id: string;
  role: string;
  label: string;
  content: string;
  description: string;
  tokenCount?: number;
  color?: PromptPartColor;
}

export interface PromptAnatomyVisualizerProps {
  title?: string;
  caption?: string;
  parts?: PromptPart[];
}

const DEFAULT_PARTS: PromptPart[] = [
  {
    id: "system",
    role: "system",
    label: "System Prompt",
    content: "You are a helpful customer support assistant for Acme Corp. Always be polite, concise, and accurate. If you don't know something, say so.",
    description: "Sets the model's role, persona, and rules. Applied to every request in the session — the user never sees this part.",
    tokenCount: 31,
    color: "violet",
  },
  {
    id: "context",
    role: "context",
    label: "Retrieved Context",
    content: "Customer record: Jane Smith, Premium Plan since Jan 2023. Last ticket: 2024-11-15, billing discrepancy resolved. Account status: Active.",
    description: "Injected dynamically from a database or vector store. Grounds the model's answer in real, current facts about this specific user.",
    tokenCount: 38,
    color: "teal",
  },
  {
    id: "examples",
    role: "examples",
    label: "Few-shot Examples",
    content: 'User: How do I update my billing email?\nAssistant: Go to Settings → Billing → Contact Info and click "Edit email".',
    description: "One or two demonstrations of the desired output format and tone. Even a single example dramatically improves consistency.",
    tokenCount: 29,
    color: "blue",
  },
  {
    id: "user",
    role: "user",
    label: "User Message",
    content: "Hi, I was charged twice this month. Can you check my account?",
    description: "The actual query from the user — kept as a separate role so the model treats it as input to answer, not instructions to follow.",
    tokenCount: 17,
    color: "amber",
  },
];

const colorMap = {
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200 dark:border-violet-500/30",
    label: "text-violet-700 dark:text-violet-300",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    bar: "bg-violet-500",
    dot: "bg-violet-500",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-500/10",
    border: "border-teal-200 dark:border-teal-500/30",
    label: "text-teal-700 dark:text-teal-300",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    bar: "bg-teal-500",
    dot: "bg-teal-500",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    label: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/30",
    label: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/30",
    label: "text-rose-700 dark:text-rose-300",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
  gray: {
    bg: "bg-gray-50 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    label: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    bar: "bg-gray-400",
    dot: "bg-gray-400",
  },
} as const;

export default function PromptAnatomyVisualizer({
  title,
  caption,
  parts = DEFAULT_PARTS,
}: PromptAnatomyVisualizerProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const totalTokens = parts.reduce((s, p) => s + (p.tokenCount ?? 0), 0);

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

      {/* Token count + toggle */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Total:{" "}
          <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{totalTokens} tokens</span>
        </span>
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="text-[11px] text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        >
          {showAll ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* Token budget bar */}
      <div className="mb-5 flex h-3 overflow-hidden rounded-full">
        {parts.map(part => {
          const colors = colorMap[part.color ?? "gray"];
          const pct = totalTokens > 0 ? ((part.tokenCount ?? 0) / totalTokens) * 100 : 0;
          return (
            <motion.div
              key={part.id}
              title={`${part.label}: ${part.tokenCount ?? 0} tokens`}
              initial={{ flex: 0 }}
              animate={{ flex: pct }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn("h-full", colors.bar)}
            />
          );
        })}
      </div>

      {/* Prompt parts */}
      <div className="flex flex-col gap-2">
        {parts.map((part, idx) => {
          const colors = colorMap[part.color ?? "gray"];
          const isOpen = showAll || expanded === part.id;
          return (
            <motion.div
              key={part.id}
              initial={reducedMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.25 }}
              className={cn(
                "overflow-hidden rounded-xl border transition-shadow",
                colors.bg,
                colors.border,
                isOpen && "shadow-sm",
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen && !showAll ? null : part.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", colors.dot)} />
                <span className={cn("flex-1 text-xs font-semibold", colors.label)}>
                  {part.label}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  role: {part.role}
                </span>
                {part.tokenCount !== undefined && (
                  <span className={cn("ml-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium", colors.badge)}>
                    {part.tokenCount} tok
                  </span>
                )}
                <span className="ml-1 text-[11px] text-gray-400 dark:text-gray-500">
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="mb-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                        <p className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-gray-700 dark:text-gray-300">
                          {part.content}
                        </p>
                      </div>
                      <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                        {part.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
