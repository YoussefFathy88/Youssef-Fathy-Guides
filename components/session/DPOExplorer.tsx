"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccentColor = "amber" | "teal" | "rose" | "violet" | "blue" | "gray";

const BAR_FILL: Record<AccentColor, string> = {
  teal: "bg-teal-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  gray: "bg-gray-500",
};

const ACCENT: Record<AccentColor, { tab: string; border: string; bg: string; text: string }> = {
  gray: {
    tab: "border-slate-300/80 bg-slate-800/60 text-white ring-slate-300/50",
    border: "border-slate-300/70",
    bg: "bg-slate-500/15",
    text: "text-gray-100",
  },
  teal: {
    tab: "border-teal-400/80 bg-teal-950/50 text-teal-50 ring-teal-400/50",
    border: "border-teal-400/70",
    bg: "bg-teal-500/15",
    text: "text-teal-100",
  },
  blue: {
    tab: "border-blue-400/80 bg-blue-950/50 text-blue-50 ring-blue-400/50",
    border: "border-blue-400/70",
    bg: "bg-blue-500/15",
    text: "text-blue-100",
  },
  violet: {
    tab: "border-violet-400/80 bg-violet-950/50 text-violet-50 ring-violet-400/50",
    border: "border-violet-400/70",
    bg: "bg-violet-500/15",
    text: "text-violet-100",
  },
  rose: {
    tab: "border-rose-400/80 bg-rose-950/50 text-rose-50 ring-rose-400/50",
    border: "border-rose-400/70",
    bg: "bg-rose-500/15",
    text: "text-rose-100",
  },
  amber: {
    tab: "border-amber-400/80 bg-amber-950/50 text-amber-50 ring-amber-400/50",
    border: "border-amber-400/70",
    bg: "bg-amber-500/15",
    text: "text-amber-100",
  },
};

const TABS = [
  { id: "why-rlhf", short: "Why RLHF?", color: "rose" as AccentColor },
  { id: "insight", short: "Insight", color: "violet" as AccentColor },
  { id: "data", short: "Data", color: "teal" as AccentColor },
  { id: "update", short: "Update", color: "amber" as AccentColor },
  { id: "reference", short: "Reference", color: "blue" as AccentColor },
  { id: "compare", short: "Compare", color: "gray" as AccentColor },
] as const;

// ─── Shared UI ────────────────────────────────────────────────────────────────

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-lg font-semibold text-gray-300 md:text-xl">{children}</p>
  );
}

function Callout({
  children,
  color = "violet",
}: {
  children: React.ReactNode;
  color?: AccentColor;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 md:p-5",
        ACCENT[color].border,
        ACCENT[color].bg,
      )}
    >
      <p className="text-lg text-gray-100 md:text-xl">{children}</p>
    </div>
  );
}

function ProbBar({
  label,
  value,
  color,
  animated,
  reducedMotion,
}: {
  label: string;
  value: number;
  color: AccentColor;
  animated: boolean;
  reducedMotion: boolean | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("w-32 shrink-0 text-base font-bold md:w-36 md:text-lg", ACCENT[color].text)}>
        {label}
      </span>
      <div className="flex h-7 min-w-0 flex-1 overflow-hidden rounded-lg bg-gray-800">
        <motion.div
          className={cn("h-full rounded-lg", BAR_FILL[color])}
          initial={{ width: "0%" }}
          animate={{ width: animated || reducedMotion ? `${value}%` : "0%" }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-base font-bold text-gray-200 md:text-lg">
        {value}%
      </span>
    </div>
  );
}

// ─── Tab 1 — Why RLHF Is Too Complex ──────────────────────────────────────────

const RLHF_STAGES = [
  { label: "SFT Model", badge: "✅", problem: "Starting point — fine ✅", color: "teal" as AccentColor },
  { label: "Reward Model", badge: "⚠️", problem: "Expensive to train. Can be gamed ⚠️", color: "amber" as AccentColor },
  { label: "PPO", badge: "⚠️", problem: "Unstable. Hard to tune ⚠️", color: "rose" as AccentColor },
  { label: "Aligned Model", badge: "✅", problem: "Goal — but long road", color: "violet" as AccentColor },
];

function WhyRlhfPanel() {
  const reducedMotion = useReducedMotion();
  const visible = RLHF_STAGES.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>RLHF works — but it has 3 moving parts that can all go wrong.</PanelTitle>

      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {RLHF_STAGES.map((stage, i) => (
          <AnimatePresence key={stage.label}>
            {visible > i && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2"
              >
                <div
                  className={cn(
                    "rounded-xl border-2 px-3 py-3 text-center md:px-4 md:py-4",
                    ACCENT[stage.color].border,
                    ACCENT[stage.color].bg,
                  )}
                >
                  <p className={cn("text-base font-bold md:text-lg", ACCENT[stage.color].text)}>
                    {stage.label}
                  </p>
                  <p className="mt-1 text-xl md:text-2xl">{stage.badge}</p>
                </div>
                {i < RLHF_STAGES.length - 1 ? (
                  <span className="text-xl text-gray-500 md:text-2xl" aria-hidden>
                    →
                  </span>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {RLHF_STAGES.slice(0, 3).map((stage) => (
          <p key={stage.label} className="text-base text-gray-300 md:text-lg">
            <span className="font-bold text-gray-100">{stage.label}:</span> {stage.problem}
          </p>
        ))}
      </div>

      <Callout color="violet">
        <span className="font-bold text-violet-200">❓ What if we could skip the Reward Model and PPO entirely?</span>
        <span className="mt-2 block">That's exactly what DPO does.</span>
      </Callout>
    </div>
  );
}

// ─── Tab 2 — The Key Insight ──────────────────────────────────────────────────

function InsightPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>The model is secretly already a reward model.</PanelTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4 md:p-5">
          <p className="text-base font-bold text-rose-300 md:text-lg">RLHF thinking</p>
          <p className="mt-2 text-lg text-gray-200 md:text-xl">
            We need a separate neural network to judge responses.
          </p>
          <p className="mt-3 font-mono text-base text-gray-300 md:text-lg">
            [LLM] → response<br />
            [Reward Model] → 0.91
          </p>
          <p className="mt-3 text-lg font-bold text-rose-300 md:text-xl">Two separate models needed.</p>
        </div>

        <div className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4 md:p-5">
          <p className="text-base font-bold text-teal-300 md:text-lg">DPO insight</p>
          <p className="mt-2 text-lg text-gray-200 md:text-xl">
            The LLM already knows which responses are more likely. That is a form of preference.
          </p>
          <p className="mt-3 text-lg text-gray-200 md:text-xl">
            "An API is a way for two applications…" → <span className="font-bold text-teal-300">high probability</span>
            <br />
            "APIs are the REVOLUTIONARY backbone…" → <span className="font-bold text-rose-400">low probability</span>
          </p>
          <p className="mt-3 text-lg font-bold text-teal-300 md:text-xl">One model does everything.</p>
        </div>
      </div>

      <Callout>
        DPO proves you can rewrite the reward model goal using the LLM's own probabilities.
        <span className="mt-1 block font-bold text-violet-200">No separate reward model needed.</span>
      </Callout>
    </div>
  );
}

// ─── Tab 3 — Data Format ──────────────────────────────────────────────────────

const DPO_TRIPLES = [
  {
    prompt: "What is an API?",
    chosen: "An API is a way for two applications to talk to each other. For example, when a weather app shows today's temperature, it's using an API to fetch that data from a remote server.",
    rejected: "APIs are the REVOLUTIONARY backbone of MODERN SOFTWARE!! They TRANSFORM how apps COMMUNICATE in ways that are truly MIND-BLOWING and INCREDIBLE!!",
  },
  {
    prompt: "Write a short poem about rain.",
    chosen: "Rain taps softly on the glass, whispering of clouds that pass.",
    rejected: "RAIN RAIN RAIN RAIN WET WET WET",
  },
  {
    prompt: "What is photosynthesis?",
    chosen: "Photosynthesis is how plants convert sunlight into energy using chlorophyll.",
    rejected: "Plants do photosynthesis with the sun and stuff.",
  },
] as const;

function DataPanel() {
  const reducedMotion = useReducedMotion();
  const [tripleIdx, setTripleIdx] = useState(0);
  const visible = 1;

  const triple = DPO_TRIPLES[tripleIdx];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>DPO uses the same human rankings as RLHF — but packages them differently.</PanelTitle>

      <div className="rounded-xl border border-gray-600 bg-gray-950/70 p-4">
        <p className="text-base font-bold text-gray-400 md:text-lg">RLHF data format</p>
        <p className="mt-1 text-lg text-gray-300 md:text-xl">
          Prompt → score each response → train a separate reward model
        </p>
      </div>

      <p className="text-center text-lg font-bold text-violet-300 md:text-xl">↓ DPO simplifies this to ↓</p>

      <div className="flex flex-wrap gap-2">
        {DPO_TRIPLES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setTripleIdx(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
              tripleIdx === i
                ? "border-teal-400/70 bg-teal-950/50 text-teal-50 ring-2 ring-teal-400/50 ring-offset-2 ring-offset-gray-900"
                : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-500",
            )}
          >
            Triple {i + 1}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {visible > 0 && (
          <motion.div
            key={tripleIdx}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border-2 border-teal-500/50 bg-teal-950/25 p-4 md:p-5"
          >
            <p className="font-mono text-base text-gray-300 md:text-lg">
              prompt: "{triple.prompt}"
            </p>
            <p className="mt-2 text-lg text-teal-100 md:text-xl">
              chosen: "{triple.chosen}" ✅
            </p>
            <p className="mt-2 text-lg text-rose-200 md:text-xl">
              rejected: "{triple.rejected}" ❌
            </p>
            <p className="mt-3 text-lg font-bold text-teal-300 md:text-xl">One triple. No reward model needed.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-lg text-gray-300 md:text-xl">
        Every example tells the model what to do <span className="font-bold text-teal-300">more</span> of
        and what to do <span className="font-bold text-rose-400">less</span> of.
      </p>
    </div>
  );
}

// ─── Tab 4 — How DPO Updates ──────────────────────────────────────────────────

const TRAINING_STEPS = [
  { step: 1, chosen: 52, rejected: 38, phase: "before" as const },
  { step: 1, chosen: 71, rejected: 24, phase: "after" as const },
  { step: 50, chosen: 67, rejected: 29, phase: "mid" as const },
  { step: 200, chosen: 84, rejected: 12, phase: "done" as const },
];

function UpdatePanel() {
  const reducedMotion = useReducedMotion();
  const [stepIdx, setStepIdx] = useState(0);
  const animated = true;
  const current = TRAINING_STEPS[stepIdx];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>
        For every triple, DPO increases chosen probability and decreases rejected probability.
      </PanelTitle>

      <div className="rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3">
        <span className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">Prompt</span>
        <p className="text-lg text-gray-100 md:text-xl">"What is an API?"</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRAINING_STEPS.map((s, i) => (
          <button
            key={`${s.step}-${s.phase}`}
            type="button"
            onClick={() => setStepIdx(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
              stepIdx === i
                ? "border-amber-400/70 bg-amber-950/50 text-amber-50 ring-2 ring-amber-400/50 ring-offset-2 ring-offset-gray-900"
                : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-500",
            )}
          >
            {s.phase === "before"
              ? "Before update"
              : s.phase === "after"
                ? "After 1 update"
                : `Step ${s.step}`}
          </button>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-gray-700 bg-gray-950/70 p-4 md:p-5">
        <ProbBar
          label="Chosen"
          value={current.chosen}
          color="teal"
          animated={animated}
          reducedMotion={reducedMotion}
        />
        <ProbBar
          label="Rejected"
          value={current.rejected}
          color="rose"
          animated={animated}
          reducedMotion={reducedMotion}
        />
        {current.phase === "after" && (
          <p className="text-lg font-bold text-amber-300 md:text-xl">
            ↑ chosen went up ✅ &nbsp;·&nbsp; ↓ rejected went down ✅
          </p>
        )}
        {current.phase === "done" && (
          <p className="text-lg font-bold text-teal-300 md:text-xl">Model well aligned ✅</p>
        )}
      </div>

      <Callout color="amber">
        No PPO. No reward model. The loss directly pushes the model in the right direction —
        <span className="font-bold text-amber-200"> a supervised-style update on preference pairs.</span>
      </Callout>
    </div>
  );
}

// ─── Tab 5 — Reference Model ──────────────────────────────────────────────────

function ReferencePanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>DPO has built-in drift prevention — no separate KL penalty to tune.</PanelTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4">
          <p className="text-base font-bold text-rose-300 md:text-lg">RLHF approach</p>
          <p className="mt-2 text-lg text-gray-200 md:text-xl">
            PPO updates → model drifts<br />
            KL penalty → measures drift<br />
            Loss → penalizes if too far from SFT
          </p>
          <p className="mt-2 font-bold text-rose-300 md:text-lg">Explicit external constraint</p>
        </div>

        <div className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4">
          <p className="text-base font-bold text-teal-300 md:text-lg">DPO approach</p>
          <p className="mt-2 text-lg text-gray-200 md:text-xl">
            SFT model kept frozen as reference<br />
            Loss compares current vs reference probabilities
          </p>
          <p className="mt-2 font-bold text-teal-300 md:text-lg">Drift prevention baked into the loss</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-gray-600 bg-gray-950/70 p-4">
          <p className="text-base font-bold text-violet-300 md:text-lg">Reference (SFT, frozen)</p>
          <p className="mt-1 text-lg text-gray-200 md:text-xl">"An API is…" → 60%</p>
          <p className="mt-2 text-lg text-teal-300 md:text-xl">Current: 58% — still close ✅</p>
        </div>
        <div className="rounded-xl border border-gray-600 bg-gray-950/70 p-4">
          <p className="text-base font-bold text-rose-300 md:text-lg">Reward hacking path</p>
          <p className="mt-1 text-lg text-gray-200 md:text-xl">"REVOLUTIONARY MODERN…" → 80%</p>
          <p className="mt-2 text-lg text-rose-400 md:text-xl">Drifted far — large penalty built in ❌</p>
        </div>
      </div>

      <Callout color="blue">
        You don't tune a separate KL weight.
        <span className="block font-bold text-blue-200">
          DPO handles drift mathematically inside its own loss function.
        </span>
      </Callout>
    </div>
  );
}

// ─── Tab 6 — Full Comparison ──────────────────────────────────────────────────

const COMPARE_ROWS = [
  { feature: "Reward Model", rlhf: "✅ Required", dpo: "❌ Not needed" },
  { feature: "PPO", rlhf: "✅ Required", dpo: "❌ Not needed" },
  { feature: "Drift control", rlhf: "KL penalty", dpo: "Built into loss" },
  { feature: "Stability", rlhf: "⚠️ Can fail", dpo: "✅ Stable" },
  { feature: "Complexity", rlhf: "High", dpo: "Low" },
  { feature: "Performance", rlhf: "Strong", dpo: "Matches or beats" },
] as const;

function ComparePanel() {
  const reducedMotion = useReducedMotion();
  const [flowStep, setFlowStep] = useState(0);

  const rlhfSteps = ["SFT Model", "Humans rank", "Reward Model ⚠️", "PPO ⚠️", "KL penalty ⚠️", "Aligned ✅"];
  const dpoSteps = ["SFT Model", "Chosen / rejected pairs", "Direct optimization ✅", "Aligned ✅"];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Same goal. Very different paths.</PanelTitle>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFlowStep(0)}
          className={cn(
            "rounded-xl border-2 px-4 py-3 text-base font-bold md:text-lg",
            flowStep === 0
              ? "border-rose-400/70 bg-rose-950/50 text-rose-50 ring-2 ring-rose-400/50 ring-offset-2 ring-offset-gray-900"
              : "border-gray-700 bg-gray-950/60 text-gray-300",
          )}
        >
          RLHF path
        </button>
        <button
          type="button"
          onClick={() => setFlowStep(1)}
          className={cn(
            "rounded-xl border-2 px-4 py-3 text-base font-bold md:text-lg",
            flowStep === 1
              ? "border-teal-400/70 bg-teal-950/50 text-teal-50 ring-2 ring-teal-400/50 ring-offset-2 ring-offset-gray-900"
              : "border-gray-700 bg-gray-950/60 text-gray-300",
          )}
        >
          DPO path
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={flowStep}
          initial={reducedMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.22 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {(flowStep === 0 ? rlhfSteps : dpoSteps).map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-xl border-2 px-3 py-2 text-base font-bold md:text-lg",
                  flowStep === 0
                    ? "border-rose-500/40 bg-rose-950/25 text-rose-100"
                    : "border-teal-500/40 bg-teal-950/25 text-teal-100",
                )}
              >
                {step}
              </span>
              {i < arr.length - 1 ? (
                <span className="text-gray-500" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full min-w-[28rem] text-left text-base md:text-lg">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-950/80">
              <th className="px-4 py-3 font-bold text-gray-300">Feature</th>
              <th className="px-4 py-3 font-bold text-rose-300">RLHF</th>
              <th className="px-4 py-3 font-bold text-teal-300">DPO</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.feature} className="border-b border-gray-800">
                <td className="px-4 py-3 font-bold text-gray-200">{row.feature}</td>
                <td className="px-4 py-3 text-gray-300">{row.rlhf}</td>
                <td className="px-4 py-3 text-gray-300">{row.dpo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout>
        Both start from the same human preference data.
        <span className="mt-2 block">
          RLHF converts it into a reward model, then uses RL.
          DPO optimizes the model directly.
          <span className="font-bold text-violet-200"> Same destination — DPO takes a simpler road.</span>
        </span>
      </Callout>
    </div>
  );
}

// ─── Panel router ─────────────────────────────────────────────────────────────

function TabPanel({ tabId }: { tabId: string }) {
  switch (tabId) {
    case "why-rlhf":
      return <WhyRlhfPanel />;
    case "insight":
      return <InsightPanel />;
    case "data":
      return <DataPanel />;
    case "update":
      return <UpdatePanel />;
    case "reference":
      return <ReferencePanel />;
    case "compare":
      return <ComparePanel />;
    default:
      return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DPOExplorer() {
  const reducedMotion = useReducedMotion();
  const baseId = useId();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeTab = TABS[activeIdx];

  const goPrev = useCallback(() => setActiveIdx((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setActiveIdx((i) => Math.min(TABS.length - 1, i + 1)), []);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex w-full flex-col rounded-2xl border border-gray-700 bg-gray-900 p-5 md:p-8"
      data-local-navigation="true"
    >
      <div
        className="flex gap-2 overflow-x-auto px-1 py-1 md:gap-2.5"
        role="tablist"
        aria-label="DPO pipeline stages"
      >
        {TABS.map((tab, idx) => {
          const isActive = activeIdx === idx;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`${baseId}-tab-${tab.id}`}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "shrink-0 rounded-xl border-2 px-3 py-2.5 text-base font-bold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
                "md:px-4 md:py-3 md:text-lg",
                isActive
                  ? cn("ring-2 ring-offset-2 ring-offset-gray-900", ACCENT[tab.color].tab)
                  : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-500 hover:text-white",
              )}
            >
              <span
                className={cn("mr-1.5", isActive ? "text-gray-200" : "text-gray-400")}
                aria-hidden
              >
                {idx + 1}.
              </span>
              {tab.short}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeTab.id}`}
        className="mt-5 flex flex-1 flex-col md:mt-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="flex flex-1 flex-col"
          >
            <TabPanel tabId={activeTab.id} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="rounded-xl border-2 border-gray-700 bg-gray-950 px-5 py-3 text-base font-bold text-gray-200 transition hover:border-gray-600 disabled:opacity-40 md:text-lg"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={activeIdx === TABS.length - 1}
          className="rounded-xl border-2 border-violet-500/50 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-100 transition hover:border-violet-400 disabled:opacity-40 md:text-lg"
        >
          Next →
        </button>
        <span className="text-base text-gray-400 md:text-lg">
          {activeIdx + 1} / {TABS.length}
        </span>
      </div>
    </motion.div>
  );
}
