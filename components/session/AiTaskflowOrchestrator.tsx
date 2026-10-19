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
  existingTasksPreview?: string;
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
      "The user question arrives. First the orchestrator loads up to 50 tasks from the database so the model sees what is already on the board.",
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
      "The orchestrator merges procedural rules (system prompt), live tasks, and the user question into one prompt sent to the provider.",
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
      "OpenAI returns JSON. Your app validates it against the AiDecision schema — assistant_message plus action and the matching payload branch.",
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
      "The orchestrator reads decision.action and calls the matching handler — here create_task inserts a new row and returns the saved record.",
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
  existingTasksPreview,
  userMessage,
}: {
  step: AiTaskflowOrchestratorStep;
  systemPrompt: string;
  existingTasksPreview: string;
  userMessage: string;
}) {
  const badge = ROLE_BADGES[step.role];

  return (
    <>
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 text-4xl md:text-5xl">
          {step.icon}
        </span>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-base md:text-lg font-bold text-gray-700 dark:text-gray-300">
              Step {step.stepNumber}
            </span>
            <span className={cn("rounded-full border px-3 py-1 font-mono text-base md:text-lg font-semibold", badge.bg, badge.text)}>
              {step.iconLabel}
            </span>
            {step.role === "provider" && (
              <span className={cn("rounded-full border px-3 py-1 font-mono text-base md:text-lg font-semibold", ROLE_BADGES.tools.bg, ROLE_BADGES.tools.text)}>
                <span className="mr-1">🔧</span> Tools schema
              </span>
            )}
          </div>
          <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">{step.title}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-300/80 dark:border-gray-700/80 bg-white dark:bg-gray-950 p-4 md:p-5">
        <p className="font-mono text-base md:text-lg text-violet-700 dark:text-violet-300 leading-relaxed">{step.code}</p>
      </div>

      <p className="text-lg md:text-xl text-gray-900 dark:text-gray-200 leading-relaxed">{step.detail}</p>

      {step.id === "prompt" && (
        <PromptMergePanel
          systemPrompt={systemPrompt}
          existingTasks={existingTasksPreview}
          userMessage={userMessage}
        />
      )}

      {step.id === "decision" && <AiDecisionSchemaCompact />}

      {step.output && step.id !== "prompt" && (
        <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-5 md:p-6 space-y-2">
          <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
            → {step.outputLabel}
          </span>
          <pre className="whitespace-pre-wrap font-mono text-base md:text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
            {step.output}
          </pre>
        </div>
      )}
    </>
  );
}

function MergeArrow() {
  return (
    <div className="flex justify-center py-2 text-2xl md:text-3xl text-teal-700 dark:text-teal-400" aria-hidden>
      ↓
    </div>
  );
}

function UserQuestionFlow({
  message,
  steps,
  activeStep,
}: {
  message: string;
  steps: AiTaskflowOrchestratorStep[];
  activeStep: number;
}) {
  const flowNodes = [
    { id: "user", label: "User", icon: "💬" },
    ...steps.map((s) => ({ id: s.id, label: s.tabLabel, icon: s.icon })),
  ];

  return (
    <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-6 md:p-7 space-y-5">
      <div className="space-y-2">
        <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">
          Example flow
        </span>
        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          User writes a question — orchestrator runs Steps 1 → 4
        </p>
      </div>

      <div className="rounded-xl border border-teal-600/30 bg-white/60 dark:bg-gray-950/60 p-5 md:p-6">
        <span className="font-mono text-base md:text-lg font-bold text-gray-600 dark:text-gray-400">message =</span>
        <p className="mt-2 text-lg md:text-xl text-teal-800 dark:text-teal-50 leading-relaxed">&quot;{message}&quot;</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {flowNodes.map((node, i) => {
          const isUser = i === 0;
          const stepIndex = i - 1;
          const highlighted = isUser ? activeStep === 0 : stepIndex === activeStep;
          const done = isUser ? activeStep > 0 : stepIndex < activeStep;

          return (
            <div key={node.id} className="flex items-center gap-2 md:gap-3">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border-2 px-4 py-2.5 md:px-5 md:py-3 font-mono text-base md:text-lg font-semibold transition-colors",
                  highlighted
                    ? "border-teal-400 bg-teal-500/20 text-teal-800 dark:text-teal-100 ring-2 ring-teal-400/40"
                    : done
                      ? "border-gray-300 dark:border-gray-600 bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300"
                      : "border-gray-300 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/60 text-gray-600 dark:text-gray-500 opacity-40",
                  (i === 0 || highlighted || done) && "opacity-100",
                )}
              >
                <span className="text-xl md:text-2xl">{node.icon}</span>
                <span>{node.label}</span>
              </div>
              {i < flowNodes.length - 1 && (
                <span className="text-xl md:text-2xl text-gray-600" aria-hidden>
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PromptMergePanel({
  systemPrompt,
  existingTasks,
  userMessage,
}: {
  systemPrompt: string;
  existingTasks: string;
  userMessage: string;
}) {
  const blocks = [
    { label: "System prompt", emoji: "📋", content: systemPrompt, accent: "border-violet-500/40 bg-violet-950/30" },
    { label: "existing_tasks (from Step 1)", emoji: "🗄️", content: existingTasks, accent: "border-blue-500/40 bg-blue-950/30" },
    { label: "User message", emoji: "💬", content: userMessage, accent: "border-teal-500/40 bg-teal-950/30" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-lg md:text-xl font-semibold text-teal-800 dark:text-teal-100">
        Three inputs merge into one prompt
      </p>
      <div className="grid gap-3 md:gap-4">
        {blocks.map((block) => (
          <div
            key={block.label}
            className={cn("rounded-xl border p-4 md:p-5 space-y-2", block.accent)}
          >
            <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-gray-200">
              {block.emoji} {block.label}
            </span>
            <pre className="whitespace-pre-wrap font-mono text-base md:text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
              {block.content}
            </pre>
          </div>
        ))}
      </div>
      <MergeArrow />
      <div className="rounded-xl border-2 border-teal-400/50 bg-teal-950/25 p-4 md:p-5 space-y-2">
        <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">
          → Combined user_prompt
        </span>
        <pre className="whitespace-pre-wrap font-mono text-base md:text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
          {`[SYSTEM] ${systemPrompt.split("\n")[0]}…\n\n[TASKS] 3 tasks loaded (ids 1–3)…\n\n[USER] ${userMessage}`}
        </pre>
      </div>
    </div>
  );
}

export default function AiTaskflowOrchestrator({
  title = "The orchestrator manages workspace → prompt → provider → action",
  userMessage = DEFAULT_MESSAGE,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  existingTasksPreview = DEMO_EXISTING_TASKS_JSON,
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
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-950/60 p-8 md:p-10 space-y-8">
      {title && (
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">{title}</h3>
      )}

      <UserQuestionFlow
        message={userMessage}
        steps={steps}
        activeStep={activeStep}
      />

      {/* Orchestrator hub — reacts to active tab */}
      <div
        className={cn(
          "rounded-2xl border-2 p-6 md:p-8 space-y-5",
          ROLE_BADGES.orchestrator.bg,
          "ring-2",
          ROLE_BADGES.orchestrator.ring,
        )}
      >
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <span className="text-4xl md:text-5xl shrink-0" aria-hidden>
            🎛️
          </span>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-cyan-800 dark:text-cyan-200">
              Orchestrator
            </p>
            <p className="min-h-[3.25rem] md:min-h-[3.5rem] text-lg md:text-xl text-cyan-800 dark:text-cyan-50 leading-relaxed flex items-center">
              Managing{" "}
              <span className="font-semibold text-cyan-800 dark:text-cyan-100 ml-1">
                {step.tabLabel} — {step.iconLabel}
              </span>
            </p>
          </div>
        </div>

        {/* Pipeline progress under orchestrator */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {steps.map((s, i) => {
            const isActive = i === activeStep;
            const isPast = i < activeStep;
            const sBadge = ROLE_BADGES[s.role];
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-2 md:px-4 md:py-2.5 font-mono text-base md:text-lg font-semibold transition-colors",
                  isActive
                    ? cn(sBadge.bg, sBadge.text, "ring-2", sBadge.ring, "opacity-100")
                    : isPast
                      ? "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-500 opacity-70"
                      : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-500 opacity-35",
                )}
              >
                <span className="text-lg">{s.icon}</span>
                <span className="hidden sm:inline">{s.tabLabel}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 pt-1">
          <span className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-base md:text-lg font-semibold", ROLE_BADGES.workspace.bg, ROLE_BADGES.workspace.text)}>
            <span className="text-xl">🗄️</span> Workspace
          </span>
          <span className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-base md:text-lg font-semibold", ROLE_BADGES.provider.bg, ROLE_BADGES.provider.text)}>
            <span className="text-xl">🤖</span> Provider
          </span>
          <span className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-base md:text-lg font-semibold", ROLE_BADGES.tools.bg, ROLE_BADGES.tools.text)}>
            <span className="text-xl">🔧</span> Tools
          </span>
          <span className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-base md:text-lg font-semibold", ROLE_BADGES.action.bg, ROLE_BADGES.action.text)}>
            <span className="text-xl">⚡</span> Action
          </span>
        </div>
      </div>

      <div className="flex justify-center" aria-hidden>
        <div className="h-6 w-1 rounded-full bg-cyan-400/80" />
      </div>

      {/* Step tabs */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
        role="tablist"
        aria-label="Orchestrator pipeline steps"
      >
        {steps.map((s, i) => {
          const isActive = i === activeStep;
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
                "rounded-xl border-2 px-4 py-4 md:py-5 text-left transition-all duration-200",
                isActive
                  ? cn(sBadge.bg, sBadge.ring, "ring-2")
                  : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl">{s.icon}</span>
                <div className="space-y-0.5 min-w-0">
                  <p className="font-mono text-base md:text-lg font-bold text-gray-900 dark:text-gray-200">{s.tabLabel}</p>
                  <p className={cn("text-base md:text-lg font-semibold truncate", isActive ? sBadge.text : "text-gray-600 dark:text-gray-500")}>
                    {s.iconLabel}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/*
        Grid stack: all steps share one cell so row height = tallest step (Steps 2–3).
        Shorter steps (1, 4) sit at the top with no extra min-height — no page jump on tab change.
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
                "col-start-1 row-start-1 self-start w-full rounded-2xl border-2 p-6 md:p-8 space-y-5 transition-opacity duration-300",
                sBadge.bg,
                isActive
                  ? cn("visible z-10 ring-2", sBadge.ring)
                  : "invisible z-0 pointer-events-none border-transparent",
              )}
            >
              <StepPanelBody
                step={s}
                systemPrompt={systemPrompt}
                existingTasksPreview={existingTasksPreview}
                userMessage={userMessage}
              />
            </div>
          );
        })}
      </div>

      <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
        {autoPlay
          ? "Use Play to cycle steps, or tap a tab"
          : "Tap a step tab — orchestrator highlights the step you select"}
      </p>
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
