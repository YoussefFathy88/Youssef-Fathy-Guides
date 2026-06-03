"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback, type ReactNode } from "react";
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
type OutputMode = "free" | "structured";

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
    color: "text-cyan-400",
  },
  { key: "title", type: "string", description: "Task title", color: "text-teal-400" },
  {
    key: "priority",
    type: '"low" | "medium" | "high"',
    description: "Urgency level",
    color: "text-amber-400",
  },
  {
    key: "status",
    type: '"todo" | "in_progress" | "done"',
    description: "Current state",
    color: "text-rose-400",
  },
];
  
const DEFAULT_STRUCTURED: Record<string, string> = {
  title: '"Record session: AI task management lab"',
  tool: '"create_task"',
  priority: '"high"',
  status: '"todo"',
};

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
          ? activeClass ?? "bg-gray-700 text-gray-100 shadow"
          : "text-gray-400 hover:text-gray-200",
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
    <div className="rounded-xl border border-teal-600/30 bg-teal-950/15 p-6 md:p-7 space-y-5">
      <div className="space-y-2">
        <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-teal-200">
          Task manager — what the model sees
        </span>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
          System rules plus the user&apos;s request are sent together on every call.
        </p>
      </div>

      <div
        className="flex flex-wrap items-center gap-1.5 rounded-full border border-gray-700 bg-gray-900 p-1.5"
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
            "rounded-lg border p-5 md:p-6",
            promptTab === "combined"
              ? "border-teal-500/40 bg-gray-950"
              : promptTab === "system"
                ? "border-violet-500/40 bg-violet-950/25"
                : "border-teal-500/40 bg-teal-950/25",
          )}
        >
          {promptTab === "combined" && (
            <p className="font-mono text-base md:text-lg font-bold text-teal-200 mb-3">
              → messages sent to the provider
            </p>
          )}
          <pre className="whitespace-pre-wrap font-mono text-base md:text-lg text-gray-100 leading-relaxed">
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
  const [mode, setMode] = useState<OutputMode>("free");
  const [snap, setSnap] = useState(false);

  const switchToStructured = useCallback(() => {
    setMode("structured");
    setSnap(true);
    const t = setTimeout(() => setSnap(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-950/60 p-8 md:p-10 space-y-8">
      {title && (
        <h3 className="text-xl md:text-2xl font-semibold text-gray-100 leading-snug">{title}</h3>
      )}

      <PromptTabs
        systemPrompt={systemPrompt}
        userMessage={userMessage}
        promptTab={promptTab}
        onTabChange={setPromptTab}
      />

      {/* Output mode toggle */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
            Model response for this same prompt
          </p>
          <div className="flex items-center gap-1.5 rounded-full border border-gray-700 bg-gray-900 p-1.5">
            <TabPill active={mode === "free"} onClick={() => setMode("free")}>
              Free text
            </TabPill>
            <TabPill
              active={mode === "structured"}
              onClick={switchToStructured}
              activeClass="bg-violet-600 text-white shadow"
            >
              Structured output
            </TabPill>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {/* Free text */}
          <div
            className={cn(
              "rounded-xl border p-6 md:p-7 space-y-4 transition-all duration-500 flex flex-col",
              mode === "free"
                ? "border-gray-600 bg-gray-900"
                : "border-gray-800 bg-gray-900/40 opacity-50",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-gray-200">
                Unstructured — shape varies
              </span>
              <span className="rounded-full border border-gray-600 bg-gray-800 px-3 py-1 font-mono text-base text-gray-300">
                text/plain
              </span>
            </div>

            <div className="flex-1 rounded-lg border border-gray-700 bg-gray-950 p-5 md:p-6">
              <pre className="whitespace-pre-wrap font-mono text-lg md:text-xl text-gray-100 leading-relaxed">
                {plainTextOutput}
              </pre>
            </div>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Friendly prose — no guaranteed fields. Cannot reliably parse, store, or chain.
            </p>
          </div>

          {/* Schema-constrained */}
          <div
            className={cn(
              "rounded-xl border p-6 md:p-7 space-y-4 transition-all duration-500 flex flex-col",
              mode === "structured"
                ? snap
                  ? "border-violet-400 bg-violet-950/30 shadow-[0_0_32px_-8px_rgba(167,139,250,0.5)]"
                  : "border-violet-600/50 bg-violet-950/20"
                : "border-gray-800 bg-gray-900/40",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-violet-200">
                Schema-constrained — shape guaranteed
              </span>
              <span className="rounded-full border border-violet-600/50 bg-violet-950/50 px-3 py-1 font-mono text-base text-violet-200">
                application/json
              </span>
            </div>

            <div className="rounded-lg border border-violet-700/30 bg-violet-950/20 p-4 md:p-5 space-y-2">
              <p className="font-mono text-lg md:text-xl font-bold text-violet-200 mb-1">
                {schemaName}
              </p>
              {schemaFields.map((f) => (
                <div
                  key={f.key}
                  className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-base md:text-lg"
                >
                  <span className={cn("font-semibold", f.color ?? "text-teal-400")}>{f.key}</span>
                  <span className="text-gray-500">:</span>
                  <span className="text-gray-300">{f.type}</span>
                  {f.description && (
                    <span className="text-gray-400 w-full md:w-auto md:inline">
                      // {f.description}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 rounded-lg border border-violet-700/30 bg-gray-950 p-5 md:p-6 overflow-hidden">
              <AnimatePresence>
                {mode === "structured" ? (
                  <motion.div
                    key="structured"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: prefersReduced ? 0 : 0.35, ease: "easeOut" }}
                    className="space-y-1"
                  >
                    <span className="font-mono text-lg md:text-xl text-gray-400">{"{"}</span>
                    {schemaFields.map((f, i) => (
                      <motion.div
                        key={f.key}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: prefersReduced ? 0 : i * 0.07,
                          duration: 0.25,
                        }}
                        className="flex flex-wrap gap-x-1 gap-y-0.5 font-mono text-lg md:text-xl pl-4 md:pl-5"
                      >
                        <span className={cn("font-semibold", f.color ?? "text-teal-400")}>
                          &quot;{f.key}&quot;
                        </span>
                        <span className="text-gray-500">:</span>
                        <span className="text-gray-100">
                          {structuredExample[f.key] ?? '"…"'}
                        </span>
                        {i < schemaFields.length - 1 && (
                          <span className="text-gray-500">,</span>
                        )}
                      </motion.div>
                    ))}
                    <span className="font-mono text-lg md:text-xl text-gray-400">{"}"}</span>
                  </motion.div>
                ) : (
                  <motion.p
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-lg md:text-xl text-gray-400 italic"
                  >
                    Switch to structured output →
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <p className="text-lg md:text-xl text-violet-200 leading-relaxed">
              Same shape every call. Directly parseable, storable, and composable.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-violet-500/25 bg-violet-950/20 px-5 py-4 md:px-6 md:py-5 flex items-start gap-4">
        <span className="text-2xl md:text-3xl shrink-0" aria-hidden>
          🔒
        </span>
        <p className="text-lg md:text-xl text-violet-100 leading-relaxed">
          <span className="font-semibold">A JSON Schema is a contract</span> — it tells the model
          exactly what fields to return. Your orchestrator validates the response, then{" "}
          <span className="font-mono text-violet-200">execute_ai_action</span> writes the task row
          without guessing.
        </p>
      </div>
    </div>
  );
}
