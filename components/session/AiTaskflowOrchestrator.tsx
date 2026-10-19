"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import AiDecisionSchemaCompact from "./AiDecisionSchemaCompact";
import {
  DEMO_DB_RESULT_JSON,
  DEMO_DECISION_JSON,
  DEMO_EXISTING_TASKS_JSON,
  DEMO_USER_MESSAGE,
} from "./ai-taskflow-schema";

export type OrchestratorStepRole = "workspace" | "prompt" | "provider" | "action";

export interface AiTaskflowOrchestratorStep {
  id: string;
  stepNumber: number;
  tabLabel: string;
  title: string;
  code: string;
  detail: string;
  icon: string;
  iconLabel: string;
  role: OrchestratorStepRole;
  outputLabel?: string;
  output?: string;
}

export interface AiTaskflowOrchestratorProps {
  title?: string;
  userMessage?: string;
  systemPrompt?: string;
  steps?: AiTaskflowOrchestratorStep[];
  autoPlay?: boolean;
  cycleMs?: number;
}

const DEFAULT_MESSAGE = DEMO_USER_MESSAGE;

const DEFAULT_SYSTEM_PROMPT = `You are a task management assistant.
Use existing_tasks for context. Respond only with JSON matching the AiDecision schema.
Pick action: create_task, list_tasks, update_task, delete_task, or none.
Never invent task IDs — only use IDs from the workspace.`;

const DEFAULT_STEPS: AiTaskflowOrchestratorStep[] = [
  {
    id: "list",
    stepNumber: 1,
    tabLabel: "Step 1",
    title: "Load the workspace — give the model visibility into current tasks",
    code: "existing_tasks = tasks_service.list_tasks(db, limit=50)",
    detail:
      "First, load up to 50 tasks so the model sees what is already on the board.",
    icon: "🗄️",
    iconLabel: "Workspace",
    role: "workspace",
    outputLabel: "existing_tasks",
    output: DEMO_EXISTING_TASKS_JSON,
  },
  {
    id: "prompt",
    stepNumber: 2,
    tabLabel: "Step 2",
    title: "Combine system prompt, workspace, and user message",
    code: "user_prompt = build_user_prompt(system_prompt, message, existing_tasks)",
    detail:
      "Rules, live tasks, and the question are merged into one prompt.",
    icon: "📝",
    iconLabel: "Prompt",
    role: "prompt",
    outputLabel: "user_prompt",
    output: "",
  },
  {
    id: "decision",
    stepNumber: 3,
    tabLabel: "Step 3",
    title: "Provider returns a validated AiDecision",
    code: "decision = ai_provider.get_decision(user_prompt)  # → AiDecision",
    detail:
      "The provider returns JSON. Your app checks it against the AiDecision schema.",
    icon: "🤖",
    iconLabel: "Provider",
    role: "provider",
    outputLabel: "AiDecision (validated)",
    output: DEMO_DECISION_JSON,
  },
  {
    id: "execute",
    stepNumber: 4,
    tabLabel: "Step 4",
    title: "Execute the action against the database",
    code: "result = execute_ai_action(db, decision)  # routes by decision.action",
    detail:
      "decision.action picks the handler — here create_task inserts a new row.",
    icon: "⚡",
    iconLabel: "Action",
    role: "action",
    outputLabel: "Task row saved",
    output: DEMO_DB_RESULT_JSON,
  },
];

const ROLE_BADGES: Record<
  OrchestratorStepRole | "orchestrator" | "tools",
  { bg: string; ring: string; text: string }
> = {
  orchestrator: {
    bg: "bg-cyan-500/15 border-cyan-400/40",
    ring: "ring-cyan-400/50",
    text: "text-cyan-800 dark:text-cyan-100",
  },
  workspace: {
    bg: "bg-blue-500/15 border-blue-400/40",
    ring: "ring-blue-400/50",
    text: "text-blue-800 dark:text-blue-100",
  },
  prompt: {
    bg: "bg-teal-500/15 border-teal-400/40",
    ring: "ring-teal-400/50",
    text: "text-teal-800 dark:text-teal-100",
  },
  provider: {
    bg: "bg-violet-500/15 border-violet-400/40",
    ring: "ring-violet-400/50",
    text: "text-violet-800 dark:text-violet-100",
  },
  tools: {
    bg: "bg-amber-500/15 border-amber-400/40",
    ring: "ring-amber-400/50",
    text: "text-amber-800 dark:text-amber-100",
  },
  action: {
    bg: "bg-rose-500/15 border-rose-400/40",
    ring: "ring-rose-400/50",
    text: "text-rose-800 dark:text-rose-100",
  },
};

function StepPanelBody({
  step,
  systemPrompt,
  userMessage,
}: {
  step: AiTaskflowOrchestratorStep;
  systemPrompt: string;
  userMessage: string;
}) {
  return (
    <>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 text-3xl md:text-4xl">
          {step.icon}
        </span>
        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          <span className="font-mono text-gray-600 dark:text-gray-400">Step {step.stepNumber} · </span>
          {step.title}
        </p>
      </div>

      <div className="rounded-xl border border-gray-300/80 dark:border-gray-700/80 bg-white dark:bg-gray-950 px-4 py-3 md:px-5">
        <p className="font-mono text-base md:text-lg text-violet-700 dark:text-violet-300 leading-relaxed">{step.code}</p>
      </div>

      <p className="text-lg md:text-xl text-gray-900 dark:text-gray-200 leading-relaxed">{step.detail}</p>

      {step.id === "prompt" && (
        <PromptMergePanel systemPrompt={systemPrompt} userMessage={userMessage} />
      )}

      {step.id === "decision" ? (
        <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
          <AiDecisionSchemaCompact compact />
          {step.output && <OutputBlock label={step.outputLabel} output={step.output} />}
        </div>
      ) : (
        step.output &&
        step.id !== "prompt" && <OutputBlock label={step.outputLabel} output={step.output} />
      )}
    </>
  );
}

function OutputBlock({ label, output }: { label?: string; output: string }) {
  return (
    <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4 space-y-2">
      <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
        → {label}
      </span>
      <pre className="whitespace-pre-wrap font-mono text-base md:text-lg text-gray-900 dark:text-gray-100 leading-snug">
        {output}
      </pre>
    </div>
  );
}

function PromptMergePanel({
  systemPrompt,
  userMessage,
}: {
  systemPrompt: string;
  userMessage: string;
}) {
  const blocks = [
    { label: "System prompt", emoji: "📋", content: systemPrompt.split("\n")[0], accent: "border-violet-500/40 bg-violet-950/30" },
    { label: "existing_tasks", emoji: "🗄️", content: "3 tasks from Step 1 (ids 1–3)", accent: "border-blue-500/40 bg-blue-950/30" },
    { label: "User message", emoji: "💬", content: userMessage, accent: "border-teal-500/40 bg-teal-950/30" },
  ];

  return (
    <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
      <div className="space-y-2">
        {blocks.map((block) => (
          <div key={block.label} className={cn("rounded-xl border px-4 py-2.5", block.accent)}>
            <p className="font-mono text-base md:text-lg font-bold text-gray-900 dark:text-gray-200">
              {block.emoji} {block.label}
            </p>
            <p className="text-base md:text-lg text-gray-900 dark:text-gray-100 leading-snug">{block.content}</p>
          </div>
        ))}
      </div>
      <div className="text-center text-3xl text-teal-700 dark:text-teal-400" aria-hidden>
        <span className="md:hidden">↓</span>
        <span className="hidden md:inline">→</span>
      </div>
      <div className="rounded-xl border-2 border-teal-400/50 bg-teal-950/25 p-4 md:p-5 space-y-2">
        <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">
          → Combined user_prompt
        </span>
        <pre className="whitespace-pre-wrap font-mono text-base md:text-lg text-gray-900 dark:text-gray-100 leading-snug">
          {`[SYSTEM] ${systemPrompt.split("\n")[0]}…\n\n[TASKS] 3 tasks loaded (ids 1–3)…\n\n[USER] ${userMessage}`}
        </pre>
      </div>
    </div>
  );
}

export default function AiTaskflowOrchestrator({
  title,
  userMessage = DEFAULT_MESSAGE,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  steps = DEFAULT_STEPS,
  autoPlay = false,
  cycleMs = 4000,
}: AiTaskflowOrchestratorProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const step = steps[activeStep];

  const selectStep = useCallback((index: number) => {
    setPlaying(false);
    setActiveStep(index);
  }, []);

  const advance = useCallback(() => {
    setActiveStep((i) => (i + 1) % steps.length);
  }, [steps.length]);

  useEffect(() => {
    if (!autoPlay || !playing) return;
    const t = setInterval(advance, cycleMs);
    return () => clearInterval(t);
  }, [autoPlay, playing, advance, cycleMs]);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-950/60 p-6 md:p-7 space-y-4">
      {title && (
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">{title}</h3>
      )}

      {/* Trigger: the user question that starts the run */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-teal-600/30 bg-teal-950/20 px-5 py-3">
        <span className="font-mono text-base md:text-lg font-bold text-teal-800 dark:text-teal-200">💬 User asks</span>
        <span className="text-lg md:text-xl text-teal-800 dark:text-teal-50">&quot;{userMessage}&quot;</span>
      </div>

      {/* Orchestrator runs Steps 1 → 4 — tabs double as the progress tracker */}
      <div className="space-y-2">
        <p className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-cyan-800 dark:text-cyan-200">
          🎛️ Orchestrator runs
        </p>
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
          role="tablist"
          aria-label="Orchestrator pipeline steps"
        >
          {steps.map((s, i) => {
            const isActive = i === activeStep;
            const isPast = i < activeStep;
            const sBadge = ROLE_BADGES[s.role];
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`orchestrator-panel-${s.id}`}
                id={`orchestrator-tab-${s.id}`}
                onClick={() => selectStep(i)}
                className={cn(
                  "rounded-xl border-2 px-4 py-2.5 text-left transition-all duration-200",
                  isActive
                    ? cn(sBadge.bg, sBadge.ring, "ring-2")
                    : isPast
                      ? "border-gray-300 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/70 hover:border-gray-500"
                      : "border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-600",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl md:text-3xl">{s.icon}</span>
                  <p className="min-w-0 truncate font-mono text-base md:text-lg font-bold text-gray-900 dark:text-gray-200">
                    {s.tabLabel}
                    <span className={cn("ml-2", isActive ? sBadge.text : "text-gray-600 dark:text-gray-400")}>
                      {s.iconLabel}
                    </span>
                    {isPast && <span className="ml-2 text-emerald-700 dark:text-emerald-400">✓</span>}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/*
        Grid stack: all steps share one cell so row height = tallest step.
        Shorter steps sit at the top — no layout jump on tab change.
      */}
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        {steps.map((s, i) => {
          const isActive = i === activeStep;
          const sBadge = ROLE_BADGES[s.role];
          return (
            <div
              key={s.id}
              id={`orchestrator-panel-${s.id}`}
              role="tabpanel"
              aria-labelledby={`orchestrator-tab-${s.id}`}
              aria-hidden={!isActive}
              className={cn(
                "col-start-1 row-start-1 self-start w-full rounded-2xl border-2 p-5 space-y-3 transition-opacity duration-300",
                sBadge.bg,
                isActive
                  ? cn("visible z-10 ring-2", sBadge.ring)
                  : "invisible z-0 pointer-events-none border-transparent",
              )}
            >
              <StepPanelBody step={s} systemPrompt={systemPrompt} userMessage={userMessage} />
            </div>
          );
        })}
      </div>

      {autoPlay && (
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="font-mono text-base md:text-lg text-gray-900 dark:text-gray-200 hover:text-gray-950 dark:hover:text-white transition-colors py-3 px-5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
        >
          {playing ? "⏸ Pause tour" : "▶ Play all steps"}
        </button>
      )}
    </div>
  );
}
