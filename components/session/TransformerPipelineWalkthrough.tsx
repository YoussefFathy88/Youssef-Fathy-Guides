"use client";

import { useState } from "react";

const COLOR_HEX: Record<string, string> = {
  gray: "#888780",
  teal: "#1D9E75",
  violet: "#534AB7",
  amber: "#BA7517",
  blue: "#185FA5",
  rose: "#A32D2D",
};

function hexTint(hex: string): string {
  return hex + "18";
}

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
  stages: PipelineStage[];
  steps: PipelineStep[];
}

const ACTIVE_TOKEN_STAGES = new Set(["tok", "emb", "enc", "dec"]);

export default function TransformerPipelineWalkthrough({
  title,
  caption,
  inputText,
  outputToken,
  stages,
  steps,
}: TransformerPipelineWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const totalSteps = steps.length;

  const inputTokens = inputText.split(" ");
  const tokensLit = ACTIVE_TOKEN_STAGES.has(step?.activeStageId ?? "");

  function jumpToStage(stageId: string) {
    const idx = steps.findIndex((s) => s.activeStageId === stageId);
    if (idx >= 0) setCurrentStep(idx);
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && (
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          )}
          {caption && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
          )}
        </div>
      )}

      {/* Token chip strip */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Input
        </span>
        {inputTokens.map((token, i) => (
          <span
            key={token + i}
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300"
            style={{
              border: tokensLit ? `1.5px solid ${COLOR_HEX.teal}` : "1.5px solid #d1d5db",
              background: tokensLit ? hexTint(COLOR_HEX.teal) : "transparent",
              color: tokensLit ? COLOR_HEX.teal : "#6b7280",
            }}
          >
            {token}
          </span>
        ))}

        {/* Arrow */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Output token chip */}
        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-500"
          style={{
            border: `1.5px solid ${COLOR_HEX.teal}`,
            background: isLastStep ? hexTint(COLOR_HEX.teal) : "transparent",
            color: isLastStep ? COLOR_HEX.teal : "transparent",
            opacity: isLastStep ? 1 : 0,
            transform: isLastStep ? "scale(1)" : "scale(0.9)",
          }}
        >
          &ldquo;{outputToken}&rdquo;
          {isLastStep && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{ background: COLOR_HEX.teal }}
            >
              54%
            </span>
          )}
        </span>
      </div>

      {/* Pipeline row */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-start gap-1 pb-2">
          {stages.map((stage, si) => {
            const isActive = step?.activeStageId === stage.id;
            const color = COLOR_HEX[stage.color] ?? COLOR_HEX.gray;

            return (
              <div key={stage.id} className="flex items-start">
                {/* Stage card */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => jumpToStage(stage.id)}
                    className="min-w-[80px] rounded-xl px-3 py-2.5 text-center transition-all duration-200"
                    style={{
                      border: isActive ? `2px solid ${color}` : "2px solid #e5e7eb",
                      background: isActive ? hexTint(color) : "white",
                    }}
                  >
                    <div
                      className="text-xs font-semibold"
                      style={{ color: isActive ? color : "#374151" }}
                    >
                      {stage.label}
                    </div>
                    <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                      {stage.sublabel}
                    </div>
                  </button>

                  {/* Internal chip tray */}
                  <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{
                      maxHeight: isActive && stage.internals.length > 0 ? "200px" : "0px",
                      width: "100%",
                    }}
                  >
                    {stage.internals.length > 0 && (
                      <div className="mt-1.5 flex flex-col gap-1 px-1">
                        {stage.internals.map((internal) => {
                          const isChipActive = step?.activeInternalId === internal.label;
                          return (
                            <div
                              key={internal.label}
                              className="rounded-lg px-2 py-1 text-[10px] font-medium transition-all"
                              style={{
                                border: isChipActive
                                  ? `1px solid ${color}`
                                  : "1px solid #e5e7eb",
                                background: isChipActive ? hexTint(color) : "#f9fafb",
                                color: isChipActive ? color : "#9ca3af",
                                opacity: isActive ? 1 : 0.5,
                              }}
                            >
                              {internal.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chevron arrow between stages */}
                {si < stages.length - 1 && (
                  <div className="mx-1 mt-3 flex shrink-0 items-center">
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                      <path
                        d="M1 8h16M12 3l5 5-5 5"
                        stroke="#d1d5db"
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
      <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          step {currentStep + 1} of {totalSteps}
        </p>
        <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">{step?.label}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          {step?.description}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))}
          disabled={currentStep === totalSteps - 1}
          className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

        {/* Step dots */}
        <div className="ml-2 flex flex-wrap items-center gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentStep(i)}
              aria-label={`Jump to step ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === currentStep ? 10 : 7,
                height: i === currentStep ? 10 : 7,
                background: i === currentStep ? "#534AB7" : "transparent",
                border: `2px solid ${i === currentStep ? "#534AB7" : "#d1d5db"}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
