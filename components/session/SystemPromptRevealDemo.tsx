"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */

interface PromptSection {
  label: string;
  text: string;
  color: "violet" | "amber" | "teal" | "rose" | "blue";
  icon: string;
  what: string; // one-line explanation of what this section does
}

interface Scenario {
  id: string;
  name: string;
  product: string;
  systemPromptSections: PromptSection[];
  userMessage: string;
  aiReply: string;
  aiAvatar: string;
}

export interface SystemPromptRevealDemoProps {
  title?: string;
  caption?: string;
}

/* ─────────────────────────────────────────────────────────
   Scenarios
───────────────────────────────────────────────────────── */

const SCENARIOS: Scenario[] = [
  {
    id: "aria",
    name: "Aria",
    product: "StyleHub — Shopping Assistant",
    aiAvatar: "👗",
    userMessage: "What should I call you, and can you help me find a gift?",
    aiReply:
      "Hi! I'm Aria, your personal StyleHub stylist ✨ I'd love to help you find the perfect gift! Who is it for — and what's the budget?",
    systemPromptSections: [
      {
        label: "Role",
        icon: "🎭",
        color: "violet",
        text: "You are Aria, a friendly personal stylist for StyleHub, an online fashion store.",
        what: "Sets the AI's name and job",
      },
      {
        label: "Task",
        icon: "🎯",
        color: "teal",
        text: "Help users find clothing, accessories, and gifts. Ask clarifying questions to narrow options.",
        what: "Tells the AI what to do",
      },
      {
        label: "Rules",
        icon: "📏",
        color: "amber",
        text: "Keep responses friendly and brief. If asked about competitor stores, redirect to StyleHub's catalog.",
        what: "Gives the AI constraints to follow",
      },
      {
        label: "Format",
        icon: "📋",
        color: "blue",
        text: "Use plain text. Add one or two relevant emojis per reply. Never use markdown tables.",
        what: "Controls how the AI writes",
      },
    ],
  },
  {
    id: "medbot",
    name: "MediBot",
    product: "HealthFirst — Patient Information",
    aiAvatar: "🩺",
    userMessage: "What should I call you, and can you help me find a gift?",
    aiReply:
      "Hello, I'm MediBot, HealthFirst's health information assistant. I'm not able to assist with shopping — my purpose is to answer general health questions. For medical concerns, please consult a qualified healthcare professional.",
    systemPromptSections: [
      {
        label: "Role",
        icon: "🎭",
        color: "violet",
        text: "You are MediBot, a health information assistant for HealthFirst clinic.",
        what: "Sets the AI's name and job",
      },
      {
        label: "Task",
        icon: "🎯",
        color: "teal",
        text: "Answer general health and wellness questions. Provide factual, evidence-based information only.",
        what: "Tells the AI what to do",
      },
      {
        label: "Rules",
        icon: "📏",
        color: "amber",
        text: "Never give a personal medical diagnosis. Always recommend consulting a qualified doctor for symptoms. Do not discuss topics unrelated to health.",
        what: "Gives the AI constraints to follow",
      },
      {
        label: "Format",
        icon: "📋",
        color: "blue",
        text: "Use calm, professional language. Keep replies clear and concise. No emojis.",
        what: "Controls how the AI writes",
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   Color helpers
───────────────────────────────────────────────────────── */

const COLOR = {
  violet: {
    bg: "bg-violet-900/30",
    border: "border-violet-500/50",
    badge: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
    label: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-400",
    glow: "shadow-violet-500/20",
    bar: "bg-violet-500",
  },
  teal: {
    bg: "bg-teal-900/30",
    border: "border-teal-500/50",
    badge: "bg-teal-500/20 text-teal-700 dark:text-teal-300",
    label: "text-teal-700 dark:text-teal-300",
    dot: "bg-teal-400",
    glow: "shadow-teal-500/20",
    bar: "bg-teal-500",
  },
  amber: {
    bg: "bg-amber-900/30",
    border: "border-amber-500/50",
    badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    label: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
    bar: "bg-amber-500",
  },
  rose: {
    bg: "bg-rose-900/30",
    border: "border-rose-500/50",
    badge: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
    label: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-400",
    glow: "shadow-rose-500/20",
    bar: "bg-rose-500",
  },
  blue: {
    bg: "bg-blue-900/30",
    border: "border-blue-500/50",
    badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    label: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-400",
    glow: "shadow-blue-500/20",
    bar: "bg-blue-500",
  },
} as const;

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */

function ChatBubble({
  role,
  text,
  avatar,
}: {
  role: "user" | "ai";
  text: string;
  avatar?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0",
          role === "user"
            ? "bg-violet-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-950 dark:text-white"
        )}
      >
        {role === "user" ? "👤" : avatar}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-base md:text-lg leading-snug",
          role === "user"
            ? "bg-violet-600 text-white rounded-tr-sm"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-sm"
        )}
      >
        {text}
      </div>
    </div>
  );
}

function PromptSectionCard({
  section,
  highlighted,
  revealed,
  index,
}: {
  section: PromptSection;
  highlighted: boolean;
  revealed: boolean;
  index: number;
}) {
  const c = COLOR[section.color];
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: revealed ? 1 : 0.35, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className={cn(
        "rounded-xl border p-3 md:p-4 transition-all duration-300",
        c.bg,
        c.border,
        highlighted ? `shadow-lg ${c.glow}` : "shadow-none"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{section.icon}</span>
        <span className={cn("text-sm font-bold uppercase tracking-wide", c.label)}>
          {section.label}
        </span>
        {highlighted && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("ml-auto text-xs px-2 py-0.5 rounded-full font-medium", c.badge)}
          >
            {section.what}
          </motion.span>
        )}
      </div>
      <p className="text-gray-900 dark:text-gray-200 text-base md:text-lg leading-snug font-mono">
        {section.text}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Step definitions
───────────────────────────────────────────────────────── */

// step 0 = chat only
// step 1 = prompt revealed, no section highlighted
// step 2..5 = prompt revealed, section[step-2] highlighted
// step 6 = switch scenario

const STEP_LABELS = [
  "The Chat",
  "Peek Backstage",
  "Role — who the AI is",
  "Task — what it must do",
  "Rules — what it cannot do",
  "Format — how it writes",
  "Change the Prompt, Change the AI",
];

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */

export default function SystemPromptRevealDemo({
  title = "Every chat has a hidden opening act — the system prompt",
  caption = "Press Next to peek backstage and see the instructions shaping the AI's reply.",
}: SystemPromptRevealDemoProps) {
  const [step, setStep] = useState(0);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const prefersReduced = useReducedMotion();

  const totalSteps = STEP_LABELS.length; // 0..6
  const scenario = SCENARIOS[scenarioIdx];
  const showPrompt = step >= 1;
  const highlightedSection = step >= 2 && step <= 5 ? step - 2 : -1;
  const isFinalStep = step === totalSteps - 1;

  const prev = () => setStep((s) => Math.max(0, s - 1));
  const next = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      if (step + 1 === totalSteps - 1) {
        setScenarioIdx(1);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setScenarioIdx(0);
  };

  return (
    <div className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-xl overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 md:px-8 py-4 border-b border-gray-300/60 dark:border-gray-700/60 bg-gray-100/40 dark:bg-gray-800/40">
        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {title}
        </p>
      </div>

      {/* ── Step label strip ── */}
      <div className="px-5 md:px-8 py-3 border-b border-gray-300/40 dark:border-gray-700/40 bg-gray-100/20 dark:bg-gray-800/20 flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i <= step
                  ? "bg-violet-400 w-5"
                  : "bg-gray-600 w-2.5"
              )}
            />
          ))}
        </div>
        <span className="text-base md:text-lg font-semibold text-violet-700 dark:text-violet-300 ml-1">
          {STEP_LABELS[step]}
        </span>
        <span className="text-gray-600 dark:text-gray-500 text-sm ml-auto">
          {step + 1} / {totalSteps}
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="px-5 md:px-8 py-5 md:py-6 space-y-4">

        {/* Product label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={prefersReduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center gap-2"
          >
            <span className="text-xl">{scenario.aiAvatar}</span>
            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
              {scenario.product}
            </span>
            {isFinalStep && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium"
              >
                Different system prompt → different AI
              </motion.span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* System prompt (slides in) */}
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              key={`prompt-${scenario.id}`}
              initial={prefersReduced ? false : { opacity: 0, height: 0, y: -12 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100/60 dark:bg-gray-800/60 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-300/60 dark:border-gray-600/60 flex items-center gap-2 bg-gray-200/40 dark:bg-gray-700/40">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                  <span className="text-sm font-mono font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    system prompt
                  </span>
                  <span className="ml-auto text-xs text-gray-600 dark:text-gray-500">
                    Developer-written · User never sees this
                  </span>
                </div>
                <div className="p-3 md:p-4 space-y-2">
                  {scenario.systemPromptSections.map((sec, i) => (
                    <PromptSectionCard
                      key={sec.label}
                      section={sec}
                      highlighted={highlightedSection === i}
                      revealed={showPrompt}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat UI */}
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id + "-chat"}
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100/40 dark:bg-gray-800/40 overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-gray-300/60 dark:border-gray-700/60 bg-gray-200/30 dark:bg-gray-700/30 flex items-center gap-2">
              <span className="text-lg">{scenario.aiAvatar}</span>
              <span className="text-base font-semibold text-gray-900 dark:text-gray-200">
                {scenario.name}
              </span>
              {showPrompt && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-600 text-gray-600 dark:text-gray-400">
                  Reading system prompt…
                </span>
              )}
              <span className="ml-auto flex gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-gray-600 dark:text-gray-500">Online</span>
              </span>
            </div>
            <div className="p-4 md:p-5 space-y-4">
              <ChatBubble
                role="user"
                text={scenario.userMessage}
              />
              <ChatBubble
                role="ai"
                text={scenario.aiReply}
                avatar={scenario.aiAvatar}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step annotation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`annotation-${step}`}
            initial={prefersReduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-[2.5rem] flex items-center"
          >
            {step === 0 && (
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                A user asks an AI assistant a simple question. The AI replies with a clear name and purpose. But how did it know?
              </p>
            )}
            {step === 1 && (
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                <span className="text-violet-700 dark:text-violet-300 font-semibold">The system prompt</span> sits above every conversation. The developer writes it. The user never sees it. The AI reads it first — before the user types a single word.
              </p>
            )}
            {step === 2 && (
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                The <span className="text-violet-700 dark:text-violet-300 font-semibold">Role</span> section gives the AI its name, job title, and company — that is why it introduces itself as Aria, not "Assistant".
              </p>
            )}
            {step === 3 && (
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                The <span className="text-teal-700 dark:text-teal-300 font-semibold">Task</span> section tells the AI what it should help with — and signals it should ask clarifying questions rather than guess.
              </p>
            )}
            {step === 4 && (
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                The <span className="text-amber-700 dark:text-amber-300 font-semibold">Rules</span> section draws hard limits — if you ask Aria about a competing store, those rules redirect her back to StyleHub's catalog.
              </p>
            )}
            {step === 5 && (
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                The <span className="text-blue-700 dark:text-blue-300 font-semibold">Format</span> section controls writing style — the same AI model can be told to use emojis, avoid tables, or sound like a doctor, just from this one field.
              </p>
            )}
            {step === 6 && (
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                Same user message. Same underlying model. <span className="text-amber-700 dark:text-amber-300 font-semibold">Different system prompt → completely different AI.</span> MediBot refuses to help with shopping and redirects to health topics — exactly as its rules demand.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="px-5 md:px-8 py-4 border-t border-gray-300/60 dark:border-gray-700/60 bg-gray-100/20 dark:bg-gray-800/20 flex items-center gap-3">
        <button
          onClick={prev}
          disabled={step === 0}
          className="px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={next}
          disabled={step === totalSteps - 1}
          className="px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-base md:text-lg font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {step === 0
            ? "Peek Backstage →"
            : step === totalSteps - 2
            ? "See the Difference →"
            : "Next →"}
        </button>
        {step === totalSteps - 1 && (
          <button
            onClick={reset}
            className="px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        )}
        {caption && (
          <p className="ml-auto text-sm text-gray-600 dark:text-gray-500 hidden md:block text-right max-w-xs">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
