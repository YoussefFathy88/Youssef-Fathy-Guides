"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "agent";
  text: string;
  /** Optional injected context card — shows as a pill before the agent message */
  context?: string;
  delay?: number;
}

export interface ChatScenario {
  label: string;
  description: string;
  color: "violet" | "teal" | "amber" | "gray";
  messages: ChatMessage[];
}

export interface ChatReplayProps {
  title?: string;
  caption?: string;
  scenarios?: [ChatScenario, ChatScenario];
  leftLabel?: string;
  rightLabel?: string;
}

const defaultScenarios: [ChatScenario, ChatScenario] = [
  {
    label: "No episodic memory",
    description: "Every session starts blank — the agent has no record of past interactions.",
    color: "gray",
    messages: [
      { role: "user",  text: "Hi, I had a billing issue last Tuesday. Is it resolved?" },
      { role: "agent", text: "Hello! I don't have any record of a previous interaction with you. Could you please describe the billing issue you're referring to?" },
      { role: "user",  text: "I already explained it last time! It was a duplicate charge." },
      { role: "agent", text: "I apologize for the inconvenience. I don't have access to previous conversations. Could you re-explain the duplicate charge details so I can help you today?" },
    ],
  },
  {
    label: "With episodic memory",
    description: "Past sessions are stored and retrieved — the agent knows what happened before.",
    color: "teal",
    messages: [
      { role: "user",  text: "Hi, I had a billing issue last Tuesday. Is it resolved?", delay: 0 },
      {
        role: "agent",
        text: "Hi! I can see from our last session on Tuesday that you reported a duplicate charge of €29.99. Our billing team processed the refund — it should appear within 3–5 business days. Is that the issue you're checking on?",
        context: "📜 Retrieved: Tuesday session — user reported duplicate charge €29.99, escalated to billing team",
        delay: 800,
      },
      { role: "user",  text: "Yes! That's exactly it. When will I see the refund?", delay: 1600 },
      { role: "agent", text: "The refund was initiated on Tuesday afternoon. Based on your bank's typical processing time, you should see it by Friday. Would you like me to send you a confirmation email?", delay: 2400 },
    ],
  },
];

const colorMap = {
  teal:   { dot: "bg-teal-500", bubble: "bg-teal-500 text-white dark:bg-teal-400", ring: "ring-teal-400/40" },
  violet: { dot: "bg-violet-500", bubble: "bg-violet-500 text-white dark:bg-violet-400", ring: "ring-violet-400/40" },
  amber:  { dot: "bg-amber-500", bubble: "bg-amber-500 text-white dark:bg-amber-400", ring: "ring-amber-400/40" },
  gray:   { dot: "bg-gray-400", bubble: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200", ring: "ring-gray-300/40" },
};

function ChatPanel({ scenario, isActive }: { scenario: ChatScenario; isActive: boolean }) {
  const reducedMotion = useReducedMotion();
  const tone = colorMap[scenario.color];

  return (
    <div className="flex flex-col gap-2">
      {scenario.messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 0 }}
          transition={{ duration: 0.3, delay: reducedMotion ? 0 : i * 0.12 }}
          className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}
        >
          {/* Context card — injected memory */}
          {msg.context && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.4, scale: 1 }}
              transition={{ duration: 0.25, delay: reducedMotion ? 0 : i * 0.12 - 0.05 }}
              className="flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-[11px] text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
            >
              <span>{msg.context}</span>
            </motion.div>
          )}

          {/* Message bubble */}
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug",
              msg.role === "user"
                ? "rounded-br-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                : cn("rounded-bl-md", tone.bubble),
            )}
          >
            {msg.text}
          </div>

          <span className="text-[10px] text-gray-400">
            {msg.role === "user" ? "Customer" : "Support agent"}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default function ChatReplay({
  title     = "Support agent without vs with episodic memory",
  caption   = "Toggle between the two scenarios to see how memory changes the conversation.",
  scenarios = defaultScenarios,
}: ChatReplayProps) {
  const reducedMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeSide, setActiveSide] = useState<0 | 1>(0);

  const activeScenario = scenarios[activeSide];
  const tone = colorMap[activeScenario.color];

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

        {/* Toggle tabs */}
        <div className="relative inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
          <motion.div
            layout
            layoutId="chat-tab-pill"
            className={cn(
              "absolute top-1 bottom-1 rounded-full",
              activeSide === 0
                ? "bg-gray-400 dark:bg-gray-500"
                : "bg-teal-500 dark:bg-teal-400",
            )}
            style={{
              left: activeSide === 0 ? "4px" : "50%",
              width: "calc(50% - 4px)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          {scenarios.map((sc, i) => (
            <button
              key={sc.label}
              type="button"
              onClick={() => setActiveSide(i as 0 | 1)}
              className={cn(
                "relative z-10 min-w-[160px] rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200",
                activeSide === i ? "text-white dark:text-gray-950" : "text-gray-500 dark:text-gray-400",
              )}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Scenario description */}
        <p className={cn("text-xs", activeSide === 1 ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400")}>
          {activeScenario.description}
        </p>

        {/* Chat panel */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSide}
            initial={reducedMotion ? false : { opacity: 0, x: activeSide === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: activeSide === 0 ? 20 : -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60"
          >
            <ChatPanel scenario={activeScenario} isActive />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
