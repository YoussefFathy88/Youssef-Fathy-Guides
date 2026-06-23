"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Step data ────────────────────────────────────────────────────────────────


interface Step {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeColor: string;
}

const STEPS: Step[] = [
  {
    id: "notThinking",
    title: "ChatGPT is not thinking",
    subtitle: "It guesses the next token, one step at a time",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "scores",
    title: "Every next token gets a score",
    subtitle: "Softmax turns scores into probabilities",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "loop",
    title: "Pick one — then run again",
    subtitle: "New token joins the prompt; repeat",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "different",
    title: "Same prompt, different answers",
    subtitle: "Greedy picks #1; sampling can vary",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "scale",
    title: "A full reply is many steps",
    subtitle: "Hundreds of picks build one answer",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

// ─── Shared example — real prompt → answer, token by token ───────────────────

const USER_PROMPT = "What's the capital of Egypt?";

const ANSWER_TOKENS = ["The", " capital", " of", " Egypt", " is", " Cairo", "."];

interface TokenCandidate {
  token: string;
  prob: number;
  color: string;
}

const TOKEN_CANDIDATES: TokenCandidate[][] = [
  [
    { token: "The", prob: 78, color: "bg-teal-500" },
    { token: "A", prob: 12, color: "bg-amber-500" },
    { token: "It", prob: 6, color: "bg-rose-500" },
  ],
  [
    { token: " capital", prob: 84, color: "bg-teal-500" },
    { token: " answer", prob: 9, color: "bg-amber-500" },
    { token: " city", prob: 4, color: "bg-rose-500" },
  ],
  [
    { token: " of", prob: 91, color: "bg-teal-500" },
    { token: " is", prob: 5, color: "bg-amber-500" },
    { token: ",", prob: 2, color: "bg-rose-500" },
  ],
  [
    { token: " Egypt", prob: 88, color: "bg-teal-500" },
    { token: " Egyptian", prob: 7, color: "bg-amber-500" },
    { token: " Cairo", prob: 3, color: "bg-rose-500" },
  ],
  [
    { token: " is", prob: 92, color: "bg-teal-500" },
    { token: " was", prob: 5, color: "bg-amber-500" },
    { token: ",", prob: 2, color: "bg-rose-500" },
  ],
  [
    { token: " Cairo", prob: 93, color: "bg-teal-500" },
    { token: " Alexandria", prob: 4, color: "bg-amber-500" },
    { token: " Giza", prob: 2, color: "bg-rose-500" },
  ],
  [
    { token: ".", prob: 89, color: "bg-teal-500" },
    { token: "!", prob: 6, color: "bg-amber-500" },
    { token: ",", prob: 3, color: "bg-rose-500" },
  ],
];


interface LoopRound {
  answerTokensSoFar: string[];
  candidates: TokenCandidate[];
  picked: string;
}

const LOOP_ROUNDS: LoopRound[] = ANSWER_TOKENS.map((picked, i) => ({
  answerTokensSoFar: ANSWER_TOKENS.slice(0, i),
  candidates: TOKEN_CANDIDATES[i]!,
  picked,
}));

type LoopPhase = "input" | "output" | "pick" | "concat";

const LOOP_PHASES: LoopPhase[] = ["input", "output", "pick", "concat"];

const TOTAL_LOOP_PHASES = LOOP_ROUNDS.length * LOOP_PHASES.length;

function getLoopState(phaseIndex: number) {
  const roundIndex = Math.floor(phaseIndex / LOOP_PHASES.length);
  const phase = LOOP_PHASES[phaseIndex % LOOP_PHASES.length]!;
  return { roundIndex, phase };
}

function PromptAnswerPanel({
  answerTokens,
  highlightLast,
}: {
  answerTokens: string[];
  highlightLast?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-3 py-2">
        <p className="text-base font-bold text-violet-200 mb-1">Your prompt</p>
        <p className="text-base text-violet-50 leading-snug">{USER_PROMPT}</p>
      </div>
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 min-h-[2.75rem]">
        <p className="text-base font-bold text-teal-200 mb-1.5">Answer so far</p>
        {answerTokens.length === 0 ? (
          <p className="text-base text-slate-500 italic">Empty — model picks first token</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {answerTokens.map((tok, i) => {
              const isHighlight = highlightLast === tok && i === answerTokens.length - 1;
              return (
                <span
                  key={`${tok}-${i}`}
                  className={cn(
                    "rounded-lg border px-2 py-0.5 text-base font-semibold",
                    isHighlight
                      ? "border-teal-300/60 bg-teal-500/30 text-teal-50"
                      : "border-teal-400/40 bg-teal-500/20 text-teal-100",
                  )}
                >
                  {tok}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseLabel({ children }: { children: string }) {
  return (
    <p className="text-base font-bold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

function DownArrow({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center py-0.5"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal-400/70">
        <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
        <polyline points="19 12 12 19 5 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

function ProbBars({
  candidates,
  picked,
  reduced,
  delay = 0,
}: {
  candidates: TokenCandidate[];
  picked?: string;
  reduced: boolean;
  delay?: number;
}) {
  return (
    <div className="space-y-2 w-full">
      {candidates.map((c, i) => {
        const isPicked = picked === c.token;
        return (
          <motion.div
            key={c.token}
            initial={reduced ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : delay + i * 0.12, duration: 0.3 }}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 space-y-1",
              isPicked
                ? "border-teal-400/50 bg-teal-500/15"
                : "border-slate-600/40 bg-slate-800/40",
            )}
          >
            <div className="flex justify-between text-base">
              <span className={cn("font-semibold", isPicked ? "text-teal-100" : "text-white")}>
                {c.token}
              </span>
              <span className="font-mono text-teal-200">{c.prob}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className={cn("h-full rounded-full", c.color)}
                initial={{ width: "0%" }}
                animate={{ width: `${c.prob}%` }}
                transition={{
                  delay: reduced ? 0 : delay + i * 0.12 + 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function NotThinkingVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4"
      >
        <p className="text-base font-bold text-violet-200 mb-2">Your prompt</p>
        <p className="text-lg text-white">{USER_PROMPT}</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.4, duration: 0.4 }}
        className="w-full rounded-2xl border border-slate-600/50 bg-slate-800/60 p-4"
      >
        <p className="text-base font-bold text-slate-300 mb-2">AI answer</p>
        <div className="flex flex-wrap items-center gap-2 min-h-[2.5rem]">
          <motion.span
            initial={reduced ? false : { opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: reduced ? 0 : 0.8, duration: 0.3 }}
            className="text-2xl text-slate-400 tracking-widest"
          >
            …
          </motion.span>
          <motion.span
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: reduced ? 0 : 1.0,
              duration: 0.35,
              type: "spring",
              bounce: 0.5,
            }}
            className="rounded-xl border border-violet-400/50 bg-violet-500/25 px-4 py-2 text-lg font-bold text-violet-100"
          >
            next token?
          </motion.span>
        </div>
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.3 }}
        className="text-center text-base text-slate-400"
      >
        Not a plan — one token at a time
      </motion.p>
    </div>
  );
}

function ScoresVisual({ reduced }: { reduced: boolean }) {
  const firstCandidates = TOKEN_CANDIDATES[0]!;

  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[320px] mx-auto">
      <PromptAnswerPanel answerTokens={[]} />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-2"
      >
        <p className="text-base text-slate-400">Next answer token — scores</p>
        <ProbBars candidates={firstCandidates} reduced={reduced} />
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-base text-slate-400"
      >
        Illustrative probabilities
      </motion.p>
    </div>
  );
}

function LoopVisual({
  reduced,
  phaseIndex,
}: {
  reduced: boolean;
  phaseIndex: number;
}) {
  const { roundIndex, phase } = getLoopState(phaseIndex);
  const round = LOOP_ROUNDS[roundIndex]!;
  const answerAfterPick = [...round.answerTokensSoFar, round.picked];
  const showLoopBack = phase === "concat" && roundIndex < LOOP_ROUNDS.length - 1;
  const isFinal = phase === "concat" && roundIndex === LOOP_ROUNDS.length - 1;
  const phaseLabel =
    phase === "input"
      ? "Input to AI"
      : phase === "output"
        ? "Output shape"
        : phase === "pick"
          ? "Pick one"
          : "New input";

  return (
    <div className="flex flex-col gap-2 px-3 w-full max-w-[320px] mx-auto">
      <div className="flex items-center justify-between">
        <PhaseLabel>{phaseLabel}</PhaseLabel>
        <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-base font-semibold text-teal-200">
          Token {roundIndex + 1} / {LOOP_ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "input" && (
          <motion.div
            key={`input-${roundIndex}`}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <PromptAnswerPanel answerTokens={round.answerTokensSoFar} />
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-600/40 bg-slate-800/50 px-3 py-2">
              <span className="text-base text-slate-400">→</span>
              <span className="rounded-md border border-teal-500/40 bg-teal-500/15 px-2 py-0.5 text-base font-bold text-teal-200">
                LLM
              </span>
            </div>
          </motion.div>
        )}

        {phase === "output" && (
          <motion.div
            key={`output-${roundIndex}`}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <p className="text-base text-slate-400">Scores for every next token</p>
            <ProbBars candidates={round.candidates} reduced />
          </motion.div>
        )}

        {phase === "pick" && (
          <motion.div
            key={`pick-${roundIndex}`}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <ProbBars candidates={round.candidates} picked={round.picked} reduced />
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-center"
            >
              <p className="text-base text-amber-100">
                Picked{" "}
                <span className="font-bold text-amber-50">{round.picked}</span>
              </p>
            </motion.div>
          </motion.div>
        )}

        {phase === "concat" && (
          <motion.div
            key={`concat-${roundIndex}`}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-2.5 space-y-2">
              <p className="text-base text-blue-200/80">Answer grows by one token</p>
              <PromptAnswerPanel answerTokens={round.answerTokensSoFar} />
              <div className="flex items-center gap-2">
                <span className="text-base text-slate-400">+</span>
                <span className="rounded-lg border border-teal-400/50 bg-teal-500/25 px-2 py-0.5 text-base font-bold text-teal-100">
                  {round.picked}
                </span>
              </div>
            </div>
            <DownArrow reduced={reduced} />
            <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-3 py-2.5">
              <p className="text-base text-teal-200/80 mb-1">Becomes the next input</p>
              <PromptAnswerPanel answerTokens={answerAfterPick} highlightLast={round.picked} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showLoopBack && (
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 pt-1"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-400"
          >
            <path d="M21 12a9 9 0 1 1-9-9" strokeLinecap="round" />
            <polyline points="21 3 21 12 12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-base text-slate-400">Press Next to run again</p>
        </motion.div>
      )}

      {isFinal && (
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-base text-slate-400 pt-1"
        >
          Press Next — loop until the reply ends
        </motion.p>
      )}
    </div>
  );
}

function DifferentVisual({ reduced }: { reduced: boolean }) {
  const contextTokens = ANSWER_TOKENS.slice(0, 5);
  const cairoCandidates = TOKEN_CANDIDATES[5]!;

  const panels = [
    {
      mode: "Greedy",
      desc: "Always picks #1",
      picked: " Cairo",
      color: "border-blue-500/40 bg-blue-500/10",
      labelColor: "text-blue-300",
    },
    {
      mode: "Sampling",
      desc: "Can pick lower ranks",
      picked: " Alexandria",
      color: "border-amber-500/40 bg-amber-500/10",
      labelColor: "text-amber-300",
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-3 w-full max-w-[340px] mx-auto">
      <PromptAnswerPanel answerTokens={contextTokens} />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <p className="text-base text-slate-400 text-center">Same prompt — next token scores</p>
        <ProbBars candidates={cairoCandidates} reduced={reduced} />
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {panels.map((panel, i) => (
          <motion.div
            key={panel.mode}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.35 }}
            className={cn("rounded-xl border p-3 space-y-2", panel.color)}
          >
            <p className={cn("text-base font-bold", panel.labelColor)}>{panel.mode}</p>
            <p className="text-base text-slate-400">{panel.desc}</p>
            <span
              className={cn(
                "inline-block rounded-lg border px-2 py-1 text-base font-semibold",
                i === 0
                  ? "border-blue-400/40 bg-blue-500/20 text-blue-100"
                  : "border-amber-400/40 bg-amber-500/20 text-amber-100",
              )}
            >
              {panel.picked}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-base text-slate-400"
      >
        Illustrative — sampling is random
      </motion.p>
    </div>
  );
}

function ScaleVisual({ reduced }: { reduced: boolean }) {
  const fullAnswer = ANSWER_TOKENS.join("");

  return (
    <div className="flex flex-col items-center gap-5 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="text-center"
      >
        <p className="text-5xl font-bold font-mono text-rose-300">{ANSWER_TOKENS.length}</p>
        <p className="mt-1 text-base text-slate-400">tokens in this reply</p>
      </motion.div>

      <div className="w-full space-y-2">
        <PromptAnswerPanel answerTokens={ANSWER_TOKENS} />
        <div className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2">
          <p className="text-base text-rose-200/80 mb-1">Full answer</p>
          <p className="text-base font-semibold text-white leading-snug">{fullAnswer}</p>
        </div>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-center"
      >
        <p className="text-base text-rose-200">
          Longer chats — hundreds of picks
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LLMWorksShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const [loopPhaseIndex, setLoopPhaseIndex] = useState(0);

  const step = STEPS[stepIndex]!;
  const isLoopStep = step.id === "loop";

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
    setLoopPhaseIndex(0);
  }, []);

  const goNext = useCallback(() => {
    if (STEPS[stepIndex]?.id === "loop" && loopPhaseIndex < TOTAL_LOOP_PHASES - 1) {
      setLoopPhaseIndex(prev => prev + 1);
      return;
    }

    setLoopPhaseIndex(0);
    setStepIndex(prev => (prev + 1) % STEPS.length);
  }, [stepIndex, loopPhaseIndex]);

  const goPrev = useCallback(() => {
    if (STEPS[stepIndex]?.id === "loop" && loopPhaseIndex > 0) {
      setLoopPhaseIndex(prev => prev - 1);
      return;
    }

    setLoopPhaseIndex(0);
    setStepIndex(prev => (prev - 1 + STEPS.length) % STEPS.length);
  }, [stepIndex, loopPhaseIndex]);

  const progress = isLoopStep
    ? ((loopPhaseIndex + 1) / TOTAL_LOOP_PHASES) * 100
    : ((stepIndex + 1) / STEPS.length) * 100;

  function renderVisual(id: string) {
    switch (id) {
      case "notThinking": return <NotThinkingVisual reduced={reducedMotion} />;
      case "scores":      return <ScoresVisual      reduced={reducedMotion} />;
      case "loop":        return <LoopVisual        reduced={reducedMotion} phaseIndex={loopPhaseIndex} />;
      case "different":   return <DifferentVisual   reduced={reducedMotion} />;
      case "scale":       return <ScaleVisual       reduced={reducedMotion} />;
      default:            return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor,
          )}
        >
          LLM Basics
        </span>

        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToStep(i)}
              aria-label={`Step ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === stepIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>

      <div className="px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={`title-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className={cn("text-2xl font-bold leading-tight", step.accentColor)}
          >
            {step.title}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`visual-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? {} : { opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            {renderVisual(step.id)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 pt-3 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`subtitle-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="rounded-xl bg-black/40 px-4 py-2.5 backdrop-blur-sm"
          >
            <p className="text-center text-base font-medium text-white">
              {step.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label="Next step"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white/70"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center text-base font-medium uppercase tracking-widest text-white/50">
          {isLoopStep
            ? `Phase ${loopPhaseIndex + 1} / ${TOTAL_LOOP_PHASES} — tap Next`
            : `Step ${stepIndex + 1} / ${STEPS.length} — tap Next`}
        </p>
      </div>
    </div>
  );
}
