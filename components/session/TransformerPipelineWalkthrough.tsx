"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface PipelineInternal {
  label: string;
  detail: string;
}

export interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  color: "gray" | "teal" | "violet" | "amber" | "blue" | "rose";
  internals: PipelineInternal[];
}

export interface PipelineStep {
  id: string;
  label: string;
  description: string;
  activeStageId: string;
  activeInternalId: string | null;
}

export interface TransformerPipelineWalkthroughProps {
  title?: string;
  caption?: string;
  inputText: string;
  outputToken: string;
  /** Shown on the final step badge next to the output token (0–100). */
  outputProbabilityPct?: number;
  stages: PipelineStage[];
  steps: PipelineStep[];
  /** When true, hides the macro-strip subtitle, step caption panel, and per-step descriptions (controls + visuals only). */
  hideStepNarrative?: boolean;
}

const ACTIVE_TOKEN_STAGES = new Set(["tok", "emb", "enc", "dec"]);

/** Maps stage id → macro phase index 0..5 (aligned with Big Picture six stages). */
const STAGE_TO_MACRO: Record<string, number> = {
  raw: 0,
  tok: 1,
  emb: 2,
  enc: 3,
  dec: 4,
  out: 5,
};

const MACRO_PHASES = [
  { id: "raw", short: "Raw", sub: "string in" },
  { id: "tok", short: "Tokenize", sub: "text → IDs" },
  { id: "emb", short: "Embed + pos", sub: "vectors" },
  { id: "enc", short: "Encode", sub: "all tokens" },
  { id: "dec", short: "Decode", sub: "next token" },
  { id: "out", short: "Predict", sub: "logits" },
] as const;

function stageAccentCss(color: PipelineStage["color"]): string {
  switch (color) {
    case "gray":
      return "var(--muted)";
    case "teal":
      return "var(--success)";
    case "violet":
      return "var(--purple)";
    case "amber":
      return "var(--warning)";
    case "blue":
      return "var(--primary)";
    case "rose":
      return "#fb7185";
    default:
      return "var(--muted)";
  }
}

export default function TransformerPipelineWalkthrough({
  title,
  caption,
  inputText,
  outputToken,
  outputProbabilityPct = 54,
  stages,
  steps,
  hideStepNarrative = false,
}: TransformerPipelineWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const totalSteps = steps.length;

  const inputTokens = inputText.split(" ");
  const tokensLit = ACTIVE_TOKEN_STAGES.has(step?.activeStageId ?? "");

  const macroIdx = useMemo(
    () => STAGE_TO_MACRO[step?.activeStageId ?? "raw"] ?? 0,
    [step?.activeStageId],
  );

  function jumpToStage(stageId: string) {
    const idx = steps.findIndex((s) => s.activeStageId === stageId);
    if (idx >= 0) setCurrentStep(idx);
  }

  return (
    <div className="surface-panel w-full p-8 md:p-10">
      {(title || caption) && (
        <div className="mb-6 space-y-2 md:mb-8">
          {title && <h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>}
          {caption && <p className="text-base font-medium text-slate-300 md:text-lg">{caption}</p>}
        </div>
      )}

      {/* Macro strip — six phases vs Big Picture */}
      <div className="mb-8">
        {!hideStepNarrative ? (
          <p className="mb-3 text-base font-bold uppercase tracking-[0.12em] text-slate-300 md:text-lg">
            Pipeline phases (same six as Big Picture)
          </p>
        ) : null}
        <div className="flex flex-wrap items-stretch gap-2 sm:gap-3">
          {MACRO_PHASES.map((phase, i) => {
            const done = i < macroIdx;
            const active = i === macroIdx;
            return (
              <div
                key={phase.id}
                className={cn(
                  "flex min-w-0 flex-1 flex-col rounded-xl border-2 px-3 py-3 text-center sm:min-w-[5.5rem] sm:px-3.5",
                  done && "border-[color:var(--success)]/35 bg-[color:var(--success)]/10",
                  active &&
                    "border-[color:var(--primary)]/50 bg-[color:var(--primary)]/15 ring-2 ring-[color:var(--primary)]/30",
                  !done && !active && "border-white/10 bg-white/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold leading-tight md:text-base",
                    active ? "text-[color:var(--primary)]" : done ? "text-[color:var(--success)]" : "text-slate-400",
                  )}
                >
                  {phase.short}
                </span>
                <span className="mt-1 hidden text-sm font-medium text-slate-300 sm:block md:text-base">{phase.sub}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Token chip strip */}
      <div className="mb-8 flex flex-wrap items-center gap-3 md:gap-4">
        <span className="text-base font-bold uppercase tracking-wide text-slate-300 md:text-lg">Input</span>
        {inputTokens.map((token, i) => (
          <span
            key={token + i}
            className={cn(
              "rounded-full px-4 py-2 text-base font-bold transition-all duration-300 md:px-5 md:py-2.5 md:text-lg",
              tokensLit
                ? "border-2 border-[color:var(--success)]/60 bg-[color:var(--success)]/15 text-[color:var(--success)]"
                : "border border-white/20 text-slate-400",
            )}
          >
            {token}
          </span>
        ))}

        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" className="shrink-0 text-slate-400" aria-hidden>
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold transition-all duration-500 md:gap-3 md:px-5 md:py-2.5 md:text-lg",
            isLastStep
              ? "scale-100 border-2 border-[color:var(--success)]/60 bg-[color:var(--success)]/15 text-[color:var(--success)] opacity-100"
              : "pointer-events-none scale-95 border border-transparent text-transparent opacity-0",
          )}
          aria-hidden={!isLastStep}
        >
          <span>&ldquo;{outputToken}&rdquo;</span>
          {isLastStep && (
            <span className="rounded-full bg-[color:var(--success)] px-3 py-1 text-base font-bold tabular-nums text-[color:var(--background)] md:text-lg">
              {outputProbabilityPct}%
            </span>
          )}
        </span>
      </div>

      {/* Pipeline row */}
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-start gap-0.5 md:gap-1">
          {stages.map((stage, si) => {
            const isActive = step?.activeStageId === stage.id;
            const accent = stageAccentCss(stage.color);

            return (
              <div key={stage.id} className="flex items-start">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => jumpToStage(stage.id)}
                    className={cn(
                      "min-w-[112px] rounded-xl border-2 px-3 py-4 text-center transition-all duration-200 md:min-w-[132px] md:px-4 md:py-5",
                      "bg-[color:var(--surface-strong)]",
                      isActive ? "shadow-sm" : "opacity-[0.88] hover:opacity-100",
                    )}
                    style={{
                      borderColor: isActive ? accent : "rgba(148, 163, 184, 0.2)",
                      backgroundColor: isActive ? `color-mix(in srgb, ${accent} 14%, var(--surface-strong))` : undefined,
                    }}
                  >
                    <div
                      className="text-base font-bold md:text-lg"
                      style={{ color: isActive ? accent : "var(--foreground)" }}
                    >
                      {stage.label}
                    </div>
                    <div className="mt-1.5 text-base font-medium text-slate-300 md:text-lg">{stage.sublabel}</div>
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{
                      maxHeight: isActive && stage.internals.length > 0 ? "220px" : "0px",
                      width: "100%",
                    }}
                  >
                    {stage.internals.length > 0 && (
                      <div className="mt-3 flex w-full min-w-[112px] flex-col gap-2 px-0.5 md:min-w-[132px]">
                        {stage.internals.map((internal) => {
                          const isChipActive = step?.activeInternalId === internal.label;
                          return (
                            <div
                              key={internal.label}
                              title={internal.detail}
                              className={cn(
                                "cursor-default rounded-lg border px-3 py-2 text-base font-semibold transition-all md:text-lg",
                                isChipActive
                                  ? "border-opacity-60"
                                  : "border-white/10 bg-white/[0.04] text-slate-500",
                              )}
                              style={
                                isChipActive
                                  ? {
                                      borderColor: accent,
                                      backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
                                      color: accent,
                                    }
                                  : { opacity: isActive ? 1 : 0.45 }
                              }
                            >
                              {internal.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {si < stages.length - 1 && (
                  <div className="mx-0.5 mt-4 flex shrink-0 items-center md:mx-1 md:mt-5">
                    <svg width="24" height="16" viewBox="0 0 22 16" fill="none" className="text-slate-500" aria-hidden>
                      <path
                        d="M1 8h16M12 3l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step panel */}
      {!hideStepNarrative ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-5 md:px-6 md:py-6">
          <p className="mb-2 text-base font-bold uppercase tracking-wide text-slate-300 md:text-lg">
            Step {currentStep + 1} of {totalSteps}
          </p>
          <p className="text-base font-bold text-white md:text-lg">{step?.label}</p>
          <p className="mt-3 text-base font-medium leading-relaxed text-slate-200 md:text-lg">{step?.description}</p>
        </div>
      ) : null}

      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="rounded-xl border-2 border-white/15 bg-white/[0.04] px-5 py-3 text-base font-bold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-35 md:px-6 md:py-3.5 md:text-lg"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))}
          disabled={currentStep === totalSteps - 1}
          className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-base font-bold text-[color:var(--background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:px-6 md:py-3.5 md:text-lg"
        >
          Next
        </button>

        <div className="flex flex-wrap items-center gap-2 md:ml-2">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentStep(i)}
              aria-label={`Jump to step ${i + 1}`}
              aria-current={i === currentStep ? "step" : undefined}
              className={cn(
                "rounded-full transition-all",
                i === currentStep
                  ? "h-2.5 w-2.5 bg-[color:var(--primary)] ring-2 ring-[color:var(--primary)]/40"
                  : "h-2 w-2 border-2 border-white/25 bg-transparent hover:border-white/40",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
