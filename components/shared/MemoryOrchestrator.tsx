"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const CUSTOMER_MESSAGE = "My payment failed again — this happened last month too.";

interface MemoryType {
  id: "incontext" | "episodic" | "semantic" | "procedural";
  label: string;
  emoji: string;
  color: "teal" | "amber" | "violet" | "gray";
  retrievedLabel: string;
  retrievedDetail: string;
  alwaysOn?: boolean; // procedural is always on
}

const MEMORY_TYPES: MemoryType[] = [
  {
    id: "incontext",
    label: "In-context",
    emoji: "💬",
    color: "teal",
    retrievedLabel: "Current conversation",
    retrievedDetail: "Session opened 2 min ago. User authenticated. Subscription: Pro.",
  },
  {
    id: "episodic",
    label: "Episodic",
    emoji: "📜",
    color: "amber",
    retrievedLabel: "Last month's ticket",
    retrievedDetail: "2025-03-01: Payment failed (duplicate charge €29.99). Refund issued in 3 days. Root cause: retry logic bug — now fixed.",
  },
  {
    id: "semantic",
    label: "Semantic",
    emoji: "🔍",
    color: "teal",
    retrievedLabel: "Payment retry policy",
    retrievedDetail: "If a charge fails twice in 30 days, auto-suspend is triggered after the second failure unless a refund was previously granted.",
  },
  {
    id: "procedural",
    label: "Procedural",
    emoji: "📋",
    color: "gray",
    retrievedLabel: "Escalation rules",
    retrievedDetail: "If recurring payment issue: (1) check history, (2) issue refund if ≤ 2 in 90 days, (3) escalate otherwise. Always offer email confirmation.",
    alwaysOn: true,
  },
];

const RESPONSES: Record<string, string> = {
  "incontext-episodic-semantic-procedural":
    "I can see this happened last month too — that duplicate charge was refunded within 3 days. Since our retry bug was fixed since then, this new failure may be a different issue. I'll issue a refund now and escalate to our payments team to investigate the root cause. You'll receive an email confirmation shortly.",
  "incontext-episodic-procedural":
    "I can see from last month that you had a similar issue. I'll issue a refund and follow up with our team. However, I don't have the exact policy details, so I'll need to check before confirming the refund amount.",
  "incontext-semantic-procedural":
    "I can see this is a recurring payment failure. Per our policy, if this is your second failure in 30 days, I need to check whether an auto-suspension is pending. Could you confirm if last month's charge was also for this subscription?",
  "incontext-procedural":
    "I can handle this payment issue for you. Could you describe what happened previously? I don't have records of past interactions, so I'll need you to re-explain the situation.",
  "episodic-semantic-procedural":
    "Based on our records, this happened last month and matches your history. I can proceed with a refund per policy. (Note: I don't have your current session context, so I cannot verify your account in real-time.)",
  "episodic-procedural":
    "I found a note from last month about a similar payment failure. I'll apply our standard process. Please confirm your account details so I can proceed.",
  "semantic-procedural":
    "Per our payment policy, I can assist with this failure. Could you provide more context about when this happened before? I don't have access to past interaction records.",
  "procedural":
    "I can help with payment issues. Could you describe the problem in detail? I don't have any context about your account history or the current conversation context.",
};

function getResponse(enabledIds: Set<string>): string {
  // Build key from sorted active memory types
  const key = MEMORY_TYPES
    .filter(m => enabledIds.has(m.id))
    .map(m => m.id)
    .join("-");
  return RESPONSES[key] ?? RESPONSES["procedural"];
}

const colorMap = {
  teal:   { dot: "bg-teal-500", light: "bg-teal-50 dark:bg-teal-500/10", border: "border-teal-200 dark:border-teal-500/30", text: "text-teal-700 dark:text-teal-300", badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300" },
  amber:  { dot: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
  violet: { dot: "bg-violet-500", light: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/30", text: "text-violet-700 dark:text-violet-300", badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" },
  gray:   { dot: "bg-gray-400", light: "bg-gray-50 dark:bg-gray-800/60", border: "border-gray-200 dark:border-gray-700", text: "text-gray-600 dark:text-gray-400", badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
};

export interface MemoryOrchestratorProps {
  title?:   string;
  caption?: string;
}

export default function MemoryOrchestrator({
  title   = "Toggle memory types ON/OFF — watch how the agent response changes",
  caption = "All four memory types are active by default. Disable each one to see what the agent loses.",
}: MemoryOrchestratorProps) {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState<Set<string>>(
    new Set(MEMORY_TYPES.map(m => m.id)),
  );
  const [played, setPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [retrievedIds, setRetrievedIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPlayed(false);
    setRetrievedIds(new Set());
  }

  function run() {
    setPlaying(true);
    setRetrievedIds(new Set());
    setPlayed(false);

    const memoriesToRetrieve = MEMORY_TYPES.filter(
      m => enabled.has(m.id) && !m.alwaysOn,
    );

    // Sequentially "retrieve" each enabled memory
    memoriesToRetrieve.forEach((m, i) => {
      setTimeout(() => {
        setRetrievedIds(prev => new Set([...prev, m.id]));
      }, (i + 1) * (reducedMotion ? 80 : 500));
    });

    setTimeout(
      () => {
        setPlayed(true);
        setPlaying(false);
      },
      (memoriesToRetrieve.length + 1) * (reducedMotion ? 80 : 500) + (reducedMotion ? 100 : 400),
    );
  }

  const response = getResponse(enabled);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        {/* Customer message */}
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900/60">
          <span className="mt-0.5 text-lg">👤</span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Customer message</p>
            <p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{CUSTOMER_MESSAGE}</p>
          </div>
        </div>

        {/* Memory type toggles */}
        <div className="grid gap-3 sm:grid-cols-2">
          {MEMORY_TYPES.map(mem => {
            const isOn = enabled.has(mem.id);
            const isRetrieved = retrievedIds.has(mem.id);
            const tone = colorMap[mem.color];

            return (
              <motion.div
                key={mem.id}
                animate={
                  isRetrieved && !reducedMotion
                    ? { scale: [1, 1.03, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.35 }}
                className={cn(
                  "relative overflow-hidden rounded-xl border p-3 transition-all",
                  isOn ? cn(tone.light, tone.border) : "border-gray-200 bg-white opacity-50 dark:border-gray-700 dark:bg-gray-900/40",
                )}
              >
                {/* Retrieved pulse overlay */}
                <AnimatePresence>
                  {isRetrieved && (
                    <motion.div
                      initial={{ opacity: 0.6, scale: 0.9 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className={cn("absolute inset-0 rounded-xl", tone.dot, "opacity-20")}
                    />
                  )}
                </AnimatePresence>

                <div className="flex items-start gap-3">
                  <span className="text-xl">{mem.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs font-bold", isOn ? tone.text : "text-gray-400")}>
                        {mem.label}
                      </p>
                      {mem.alwaysOn ? (
                        <span className="text-[10px] text-gray-400">always on</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggle(mem.id)}
                          disabled={playing}
                          className={cn(
                            "relative h-5 w-10 rounded-full transition-colors duration-200",
                            isOn ? tone.dot : "bg-gray-300 dark:bg-gray-600",
                            playing && "cursor-not-allowed opacity-60",
                          )}
                          aria-label={`Toggle ${mem.label} memory`}
                          aria-checked={isOn}
                          role="switch"
                        >
                          <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow"
                            style={{ left: isOn ? "calc(100% - 18px)" : "2px" }}
                          />
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {isOn && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                            {mem.retrievedLabel}
                          </p>
                          {isRetrieved && (
                            <motion.p
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn("mt-1.5 rounded-lg px-2 py-1.5 text-[11px] leading-relaxed", tone.badge)}
                            >
                              ✅ {mem.retrievedDetail}
                            </motion.p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Run button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={playing}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              "bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300",
              playing && "cursor-not-allowed opacity-60",
            )}
          >
            {playing ? "⏳ Retrieving memories…" : played ? "▶ Run again" : "▶ Send message"}
          </button>
          {played && (
            <button
              type="button"
              onClick={() => {
                setEnabled(new Set(MEMORY_TYPES.map(m => m.id)));
                setPlayed(false);
                setRetrievedIds(new Set());
              }}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
            >
              Reset all
            </button>
          )}
        </div>

        {/* Agent response */}
        <AnimatePresence mode="wait">
          {played && (
            <motion.div
              key={[...enabled].sort().join("-")}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">🤖</span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">Agent response</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {response}
                  </p>
                </div>
              </div>

              {enabled.size < MEMORY_TYPES.length && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  ⚠️ {MEMORY_TYPES.length - enabled.size} memory type{MEMORY_TYPES.length - enabled.size > 1 ? "s" : ""} disabled —{" "}
                  enable all for the most complete, grounded response.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
