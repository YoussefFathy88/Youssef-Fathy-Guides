"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SchemaField {
  key: string;
  type: string;
  tool?: string;
  description?: string;
  color?: string;
}

export interface SchemaConstraintVisualizerProps {
  title?: string;
  systemPrompt?: string;
  userMessage?: string;
  plainTextOutput?: string;
  schemaName?: string;
  schemaFields?: SchemaField[];
  structuredExample?: Record<string, string>;
}

type PromptTab = "system" | "user" | "combined";
type Phase = "prompt" | "free" | "structured";

const DEFAULT_SYSTEM_PROMPT = `You are an AI task management assistant (like Jira with a brain).
You help teams create, update, prioritize, and complete tasks from natural language.
Extract a clear title, priority, due date, and status from each request.
Respond in the user's language; stay concise and actionable.`;

const DEFAULT_USER_MESSAGE =
  "Create a task: Record a YouTube session on our AI task management lab — it should cover schema constraints, the orchestrator pipeline, and tool use. It's critical task for the customer.";

const DEFAULT_PLAIN_OUTPUT =
  "Love that topic! I've noted you want to record a session on the AI task management lab. Friday works — I'd mark it high priority since it's coming up. Want me to break it into subtasks (schema slide, orchestrator demo, tool loop)? Just say the word!";

const DEFAULT_SCHEMA_FIELDS: SchemaField[] = [
  {
    key: "tool",
    type: '"create_task" | "update_task" | "list_tasks"',
    description: "Action to perform",
    color: "text-cyan-700 dark:text-cyan-400",
  },
  { key: "title", type: "string", description: "Task title", color: "text-teal-700 dark:text-teal-400" },
  {
    key: "priority",
    type: '"low" | "medium" | "high"',
    description: "Urgency level",
    color: "text-amber-700 dark:text-amber-400",
  },
  {
    key: "status",
    type: '"todo" | "in_progress" | "done"',
    description: "Current state",
    color: "text-rose-700 dark:text-rose-400",
  },
];

const DEFAULT_STRUCTURED: Record<string, string> = {
  title: '"Record AI task lab session"',
  tool: '"create_task"',
  priority: '"high"',
  status: '"todo"',
};

const PHASES: { id: Phase; label: string; activeClass: string }[] = [
  { id: "prompt", label: "1 · What the model sees", activeClass: "bg-teal-600 text-white shadow" },
  { id: "free", label: "2 · Free-text reply", activeClass: "bg-gray-600 text-gray-950 dark:text-white shadow" },
  { id: "structured", label: "3 · Schema reply", activeClass: "bg-violet-600 text-white shadow" },
];

const PROMPT_TABS: { id: PromptTab; label: string }[] = [
  { id: "system", label: "System prompt" },
  { id: "user", label: "User prompt" },
  { id: "combined", label: "Combined" },
];

function buildCombinedPrompt(system: string, user: string) {
  return `[SYSTEM]\n${system}\n\n[USER]\n${user}`;
}

function TabPill({
  active,
  onClick,
  children,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  activeClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-5 py-3 md:px-6 md:py-3.5 font-mono text-base md:text-lg font-semibold transition-all duration-200",
        active
          ? activeClass ?? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
      )}
    >
      {children}
    </button>
  );
}

function PromptTabs({
  systemPrompt,
  userMessage,
  promptTab,
  onTabChange,
}: {
  systemPrompt: string;
  userMessage: string;
  promptTab: PromptTab;
  onTabChange: (tab: PromptTab) => void;
}) {
  const combined = buildCombinedPrompt(systemPrompt, userMessage);
  const content =
    promptTab === "system"
      ? systemPrompt
      : promptTab === "user"
        ? userMessage
        : combined;

  return (
    <div className="rounded-xl border border-teal-600/30 bg-teal-950/15 p-5 md:p-6 space-y-4">
      <p className="text-lg md:text-xl text-gray-900 dark:text-gray-200 leading-relaxed">
        System rules plus the user&apos;s request are sent together on every call.
      </p>

      <div
        className="flex flex-wrap items-center gap-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1.5"
        role="tablist"
        aria-label="Prompt assembly"
      >
        {PROMPT_TABS.map((tab) => (
          <TabPill
            key={tab.id}
            active={promptTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            activeClass="bg-teal-600 text-white shadow"
          >
            {tab.label}
          </TabPill>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={promptTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-lg border p-4 md:p-5",
            promptTab === "combined"
              ? "border-teal-500/40 bg-white dark:bg-gray-950"
              : promptTab === "system"
                ? "border-violet-500/40 bg-violet-950/25"
                : "border-teal-500/40 bg-teal-950/25",
          )}
        >
          {promptTab === "combined" && (
            <p className="font-mono text-base md:text-lg font-bold text-teal-800 dark:text-teal-200 mb-3">
              → messages sent to the provider
            </p>
          )}
          <pre className="whitespace-pre-wrap font-mono text-base md:text-lg text-gray-900 dark:text-gray-100 leading-snug">
            {content}
          </pre>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SchemaConstraintVisualizer({
  title = "Schema constraints lock the output shape — every response is directly parseable",
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  userMessage = DEFAULT_USER_MESSAGE,
  plainTextOutput = DEFAULT_PLAIN_OUTPUT,
  schemaName = "TaskSchema",
  schemaFields = DEFAULT_SCHEMA_FIELDS,
  structuredExample = DEFAULT_STRUCTURED,
}: SchemaConstraintVisualizerProps) {
  const prefersReduced = useReducedMotion();
  const [promptTab, setPromptTab] = useState<PromptTab>("user");
  const [phase, setPhase] = useState<Phase>("prompt");

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-950/60 p-6 md:p-8 space-y-5">
      {title && (
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">{title}</h3>
      )}

      {/* Step-through: prompt in → free-text out → schema-constrained out */}
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1.5 w-fit"
        role="tablist"
        aria-label="Schema constraint steps"
      >
        {PHASES.map((p) => (
          <TabPill
            key={p.id}
            active={phase === p.id}
            onClick={() => setPhase(p.id)}
            activeClass={p.activeClass}
          >
            {p.label}
          </TabPill>
        ))}
      </div>

      {phase === "prompt" && (
        <PromptTabs
          systemPrompt={systemPrompt}
          userMessage={userMessage}
          promptTab={promptTab}
          onTabChange={setPromptTab}
        />
      )}

      {phase === "free" && (
        <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-gray-200">
              Unstructured — shape varies
            </span>
            <span className="rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-3 py-1 font-mono text-base text-gray-700 dark:text-gray-300">
              text/plain
            </span>
          </div>

          <div className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 p-5 md:p-6">
            <pre className="whitespace-pre-wrap font-mono text-lg md:text-xl text-gray-900 dark:text-gray-100 leading-relaxed">
              {plainTextOutput}
            </pre>
          </div>

          <p className="text-lg md:text-xl text-amber-800 dark:text-amber-200 leading-relaxed">
            ⚠️ Friendly prose — no guaranteed fields. Cannot reliably parse, store, or chain.
          </p>
        </div>
      )}

      {phase === "structured" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            <div className="rounded-xl border border-violet-700/40 bg-violet-950/20 p-5 md:p-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <span className="font-mono text-lg md:text-xl font-bold text-violet-800 dark:text-violet-200">
                  {schemaName}
                </span>
                <span className="rounded-full border border-violet-600/50 bg-violet-950/50 px-3 py-1 font-mono text-base text-violet-800 dark:text-violet-200">
                  the contract
                </span>
              </div>
              {schemaFields.map((f) => (
                <div
                  key={f.key}
                  className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-base md:text-lg"
                >
                  <span className={cn("font-semibold", f.color ?? "text-teal-700 dark:text-teal-400")}>{f.key}</span>
                  <span className="text-gray-600 dark:text-gray-500">:</span>
                  <span className="text-gray-700 dark:text-gray-300">{f.type}</span>
                  {f.description && (
                    <span className="text-gray-600 dark:text-gray-400 w-full">// {f.description}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-violet-400/60 bg-white dark:bg-gray-950 p-5 md:p-6 space-y-2 shadow-[0_0_32px_-8px_rgba(167,139,250,0.5)]">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-violet-800 dark:text-violet-200">
                  Reply — shape guaranteed
                </span>
                <span className="rounded-full border border-violet-600/50 bg-violet-950/50 px-3 py-1 font-mono text-base text-violet-800 dark:text-violet-200">
                  application/json
                </span>
              </div>
              <span className="font-mono text-lg md:text-xl text-gray-600 dark:text-gray-400">{"{"}</span>
              {schemaFields.map((f, i) => (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: prefersReduced ? 0 : i * 0.07,
                    duration: prefersReduced ? 0 : 0.25,
                  }}
                  className="flex flex-wrap gap-x-1 gap-y-0.5 font-mono text-lg md:text-xl pl-4 md:pl-5"
                >
                  <span className={cn("font-semibold", f.color ?? "text-teal-700 dark:text-teal-400")}>
                    &quot;{f.key}&quot;
                  </span>
                  <span className="text-gray-600 dark:text-gray-500">:</span>
                  <span className="text-gray-900 dark:text-gray-100">{structuredExample[f.key] ?? '"…"'}</span>
                  {i < schemaFields.length - 1 && <span className="text-gray-600 dark:text-gray-500">,</span>}
                </motion.div>
              ))}
              <span className="font-mono text-lg md:text-xl text-gray-600 dark:text-gray-400">{"}"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-violet-500/25 bg-violet-950/20 px-5 py-4 md:px-6 flex items-start gap-4">
            <span className="text-2xl md:text-3xl shrink-0" aria-hidden>
              🔒
            </span>
            <p className="text-lg md:text-xl text-violet-800 dark:text-violet-100 leading-relaxed">
              <span className="font-semibold">A JSON Schema is a contract</span> — it tells the model
              exactly what fields to return. Your orchestrator validates the response, then{" "}
              <span className="font-mono text-violet-800 dark:text-violet-200">execute_ai_action</span> writes the task row
              without guessing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
