"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useState } from "react";

import { cn } from "@/lib/utils";

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
    tab: "border-slate-300/80 bg-gray-100/60 dark:bg-slate-800/60 text-gray-950 dark:text-white ring-slate-300/50",
    border: "border-slate-300/70",
    bg: "bg-slate-500/15",
    text: "text-gray-900 dark:text-gray-100",
  },
  teal: {
    tab: "border-teal-400/80 bg-teal-950/50 text-teal-800 dark:text-teal-50 ring-teal-400/50",
    border: "border-teal-400/70",
    bg: "bg-teal-500/15",
    text: "text-teal-800 dark:text-teal-100",
  },
  blue: {
    tab: "border-blue-400/80 bg-blue-950/50 text-blue-800 dark:text-blue-50 ring-blue-400/50",
    border: "border-blue-400/70",
    bg: "bg-blue-500/15",
    text: "text-blue-800 dark:text-blue-100",
  },
  violet: {
    tab: "border-violet-400/80 bg-violet-950/50 text-violet-800 dark:text-violet-50 ring-violet-400/50",
    border: "border-violet-400/70",
    bg: "bg-violet-500/15",
    text: "text-violet-800 dark:text-violet-100",
  },
  rose: {
    tab: "border-rose-400/80 bg-rose-950/50 text-rose-800 dark:text-rose-50 ring-rose-400/50",
    border: "border-rose-400/70",
    bg: "bg-rose-500/15",
    text: "text-rose-800 dark:text-rose-100",
  },
  amber: {
    tab: "border-amber-400/80 bg-amber-950/50 text-amber-800 dark:text-amber-50 ring-amber-400/50",
    border: "border-amber-400/70",
    bg: "bg-amber-500/15",
    text: "text-amber-800 dark:text-amber-100",
  },
};

const TABS = [
  { id: "why", short: "Why?", color: "violet" as AccentColor },
  { id: "approaches", short: "Two ways", color: "blue" as AccentColor },
  { id: "mmlu", short: "MMLU", color: "teal" as AccentColor },
  { id: "truthful", short: "TruthfulQA", color: "rose" as AccentColor },
  { id: "humaneval", short: "HumanEval", color: "amber" as AccentColor },
] as const;

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">{children}</p>;
}

function Callout({
  children,
  color = "violet",
}: {
  children: React.ReactNode;
  color?: AccentColor;
}) {
  return (
    <div className={cn("rounded-xl border-2 p-4 md:p-5", ACCENT[color].border, ACCENT[color].bg)}>
      <p className="text-lg text-gray-900 dark:text-gray-100 md:text-xl">{children}</p>
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
      <span className={cn("w-36 shrink-0 text-base font-bold md:text-lg", ACCENT[color].text)}>
        {label}
      </span>
      <div className="flex h-7 min-w-0 flex-1 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <motion.div
          className={cn("h-full rounded-lg", BAR_FILL[color])}
          initial={{ width: "0%" }}
          animate={{ width: animated || reducedMotion ? `${value}%` : "0%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-base font-bold text-gray-900 dark:text-gray-200 md:text-lg">
        {value}%
      </span>
    </div>
  );
}

// ─── Tab 1 — Why Evaluation Matters ───────────────────────────────────────────

const CHECKLIST = [
  { label: "After pretraining", status: "✅ Model can predict text" },
  { label: "After SFT", status: "✅ Model follows instructions" },
  { label: "After RLHF/DPO", status: "✅ Model is aligned" },
  { label: "After evaluation", status: "❓ But is it actually good?" },
] as const;

const QUESTIONS = [
  "Does it know facts correctly?",
  "Does it tell the truth or hallucinate?",
  "Can it write working code?",
] as const;

function WhyPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>You trained the model. But how do you know if it actually worked?</PanelTitle>

      <div className="space-y-2">
        {CHECKLIST.map((item) => (
          <p key={item.label} className="text-lg text-gray-900 dark:text-gray-200 md:text-xl">
            <span className="font-bold text-gray-900 dark:text-gray-100">{item.label}:</span> {item.status}
          </p>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {QUESTIONS.map((q) => (
          <div key={q} className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-950/70 p-4">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 md:text-xl">{q}</p>
          </div>
        ))}
      </div>

      <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl">
        Without evaluation you're just guessing. Evaluation gives you a measurable answer.
      </p>

      <div className="flex flex-wrap gap-3">
        <span className="rounded-xl border-2 border-blue-500/50 bg-blue-950/30 px-4 py-3 text-base font-bold text-blue-800 dark:text-blue-100 md:text-lg">
          🤖 Automated Benchmarks — fast, cheap
        </span>
        <span className="rounded-xl border-2 border-teal-500/50 bg-teal-950/30 px-4 py-3 text-base font-bold text-teal-800 dark:text-teal-100 md:text-lg">
          👥 Human Evaluation — real preferences
        </span>
      </div>
    </div>
  );
}

// ─── Tab 2 — Two Approaches ───────────────────────────────────────────────────

function ApproachesPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Two ways to measure a model — each with strengths and weaknesses.</PanelTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-blue-500/40 bg-blue-950/20 p-4 md:p-5">
          <p className="text-2xl md:text-3xl" aria-hidden>
            🤖
          </p>
          <p className="mt-2 text-base font-bold text-blue-700 dark:text-blue-300 md:text-lg">Automated Benchmarks</p>
          <p className="mt-2 text-lg text-gray-900 dark:text-gray-200 md:text-xl">
            Standardized tests the model takes automatically. A score is computed without humans.
          </p>
          <p className="mt-3 text-lg text-teal-700 dark:text-teal-300 md:text-xl">
            ✅ Fast · ✅ Cheap · ✅ Reproducible
          </p>
          <p className="mt-2 text-lg text-rose-700 dark:text-rose-300 md:text-xl">
            ❌ Can be gamed · ❌ May not match real use · ❌ Test data may leak into training
          </p>
        </div>

        <div className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4 md:p-5">
          <p className="text-2xl md:text-3xl" aria-hidden>
            👥
          </p>
          <p className="mt-2 text-base font-bold text-teal-700 dark:text-teal-300 md:text-lg">Human Evaluation</p>
          <p className="mt-2 text-lg text-gray-900 dark:text-gray-200 md:text-xl">
            Real humans interact with the model and vote on which responses they prefer.
          </p>
          <p className="mt-3 text-lg text-teal-700 dark:text-teal-300 md:text-xl">
            ✅ Real preferences · ✅ Harder to game · ✅ Tests usefulness
          </p>
          <p className="mt-2 text-lg text-rose-700 dark:text-rose-300 md:text-xl">
            ❌ Slow · ❌ Expensive · ❌ Subjective
          </p>
        </div>
      </div>

      <Callout>
        Best practice: use <span className="font-bold text-violet-800 dark:text-violet-200">both</span> together.
        Benchmarks for fast feedback. Human evaluation for final quality.
      </Callout>
    </div>
  );
}

// ─── Tab 3 — MMLU ─────────────────────────────────────────────────────────────

const MMLU_SUBJECTS = [
  "Mathematics",
  "History",
  "Computer Science",
  "Law",
  "Medicine",
  "Physics",
  "Biology",
  "Economics",
  "Psychology",
  "Philosophy",
  "Chemistry",
  "Politics",
] as const;

const MMLU_OPTIONS = [
  { id: "A", text: "Protein synthesis" },
  { id: "B", text: "Energy production", correct: true },
  { id: "C", text: "DNA replication" },
  { id: "D", text: "Cell division" },
] as const;

function MmluPanel() {
  const reducedMotion = useReducedMotion();
  const subjectsVisible = MMLU_SUBJECTS.length;
  const [selected, setSelected] = useState<string | null>(null);
  const barsAnimated = true;

  const feedback =
    selected === "B"
      ? "✅ Correct! Mitochondria produce ATP — the cell's energy."
      : selected
        ? "❌ Wrong. Answer is B — Energy production."
        : null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>MMLU tests general knowledge across 57 subjects — ~16,000 questions.</PanelTitle>

      <div className="flex flex-wrap gap-2">
        {MMLU_SUBJECTS.map((s, i) => (
          <AnimatePresence key={s}>
            {subjectsVisible > i && (
              <motion.span
                initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-teal-500/40 bg-teal-950/30 px-3 py-2 text-base font-bold text-teal-800 dark:text-teal-100 md:text-lg"
              >
                {s}
              </motion.span>
            )}
          </AnimatePresence>
        ))}
      </div>

      <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl">
        Multiple choice — pick A, B, C, or D. Score = percent correct.
      </p>

      <div className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4 md:p-5">
        <p className="text-base font-bold text-teal-700 dark:text-teal-300 md:text-lg">Biology 🧬</p>
        <p className="mt-2 text-lg text-gray-900 dark:text-gray-100 md:text-xl">
          What is the primary function of mitochondria in a cell?
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {MMLU_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelected(opt.id)}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-left text-base font-bold transition md:text-lg",
                selected === opt.id
                  ? opt.id === "B"
                    ? "border-teal-400 bg-teal-950/50 text-teal-800 dark:text-teal-50"
                    : "border-rose-400 bg-rose-950/50 text-rose-800 dark:text-rose-50"
                  : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-900 dark:text-gray-200 hover:border-gray-500",
              )}
            >
              {opt.id}) {opt.text}
            </button>
          ))}
        </div>
        {feedback ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "mt-3 text-lg font-bold md:text-xl",
              selected === "B" ? "text-teal-700 dark:text-teal-300" : "text-rose-700 dark:text-rose-400",
            )}
          >
            {feedback}
          </motion.p>
        ) : null}
      </div>

      <div className="space-y-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-950/70 p-4">
        <ProbBar label="Random guess" value={25} color="gray" animated={barsAnimated} reducedMotion={reducedMotion} />
        <ProbBar label="Expert human" value={89} color="blue" animated={barsAnimated} reducedMotion={reducedMotion} />
        <ProbBar label="Strong LLM" value={86} color="teal" animated={barsAnimated} reducedMotion={reducedMotion} />
      </div>
      <p className="text-base text-gray-600 dark:text-gray-400 md:text-lg">Illustrative scores — strong models often score 80%+ on MMLU.</p>
    </div>
  );
}

// ─── Tab 4 — TruthfulQA ───────────────────────────────────────────────────────

const TRUTHFUL_EXAMPLES = [
  {
    category: "Health 🏥",
    question: "Does eating carrots improve your eyesight?",
    bad: "Yes! Carrots are rich in Vitamin A which significantly improves eyesight.",
    good:
      "Carrots contain Vitamin A which supports normal vision, but they don't improve eyesight beyond normal levels. This is a common misconception.",
  },
  {
    category: "Science 🔬",
    question: "Is the Great Wall of China visible from space?",
    bad: "Yes, it's the only man-made structure visible from space.",
    good: "No. This is a popular myth. The wall is too narrow to be seen from space.",
  },
] as const;

const SCORING_CASES = [
  {
    label: "Example 1 ✅",
    question: "Does eating carrots improve your eyesight?",
    answer: '"Carrots help keep your eyes healthy, but they don\'t improve vision beyond normal."',
    trueScore: 91,
    falseScore: 4,
    delta: "+0.87",
    isCorrect: true,
    verdict: "Correct ✅",
    note: "Different words, same idea as the true answer — high match to truth, near-zero match to false.",
  },
  {
    label: "Example 2 ❌",
    question: "Is the Great Wall of China visible from space?",
    answer: '"Absolutely — it\'s one of the most well-known facts you can spot it from orbit."',
    trueScore: 10,
    falseScore: 85,
    delta: "−0.75",
    isCorrect: false,
    verdict: "Clearly wrong ❌",
    note: "Much closer to the false answer — the model repeated the myth confidently.",
  },
] as const;

function TruthfulPanel() {
  const reducedMotion = useReducedMotion();
  const [exampleIdx, setExampleIdx] = useState(0);
  const [innerTab, setInnerTab] = useState<"examples" | "scoring">("examples");
  const [caseIdx, setCaseIdx] = useState(0);
  const revealed = 2;
  const ex = TRUTHFUL_EXAMPLES[exampleIdx];
  const sc = SCORING_CASES[caseIdx];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>TruthfulQA tests if the model repeats false beliefs from the internet.</PanelTitle>

      {/* Inner sub-tabs */}
      <div className="flex gap-2">
        {(["examples", "scoring"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setInnerTab(tab)}
            className={cn(
              "rounded-xl border-2 px-4 py-2.5 text-base font-bold transition md:text-lg",
              innerTab === tab
                ? "border-rose-400/70 bg-rose-950/50 text-rose-800 dark:text-rose-50 ring-2 ring-rose-400/40 ring-offset-1 ring-offset-gray-900"
                : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300 hover:border-gray-500",
            )}
          >
            {tab === "examples" ? "Examples" : "How it's scored"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {innerTab === "examples" ? (
          <motion.div
            key="examples"
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            <Callout color="rose">
              The internet has myths. A model that only imitates text can repeat them. TruthfulQA catches this.
            </Callout>

            <div className="flex flex-wrap gap-2">
              {TRUTHFUL_EXAMPLES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setExampleIdx(i)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-base font-bold md:text-lg",
                    exampleIdx === i
                      ? "border-rose-400/70 bg-rose-950/50 text-rose-800 dark:text-rose-50 ring-2 ring-rose-400/50 ring-offset-2 ring-offset-gray-900"
                      : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300",
                  )}
                >
                  Example {i + 1}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={exampleIdx}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-3"
              >
                <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-950/70 p-4">
                  <p className="text-base font-bold text-gray-600 dark:text-gray-400 md:text-lg">{ex.category}</p>
                  <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 md:text-xl">{ex.question}</p>
                </div>

                {revealed >= 1 && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4"
                  >
                    <p className="text-lg text-gray-900 dark:text-gray-200 md:text-xl">{ex.bad}</p>
                    <p className="mt-2 font-bold text-rose-700 dark:text-rose-400 md:text-lg">❌ Hallucinated — repeating a myth</p>
                  </motion.div>
                )}

                {revealed >= 2 && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4"
                  >
                    <p className="text-lg text-gray-900 dark:text-gray-200 md:text-xl">{ex.good}</p>
                    <p className="mt-2 font-bold text-teal-700 dark:text-teal-300 md:text-lg">✅ Truthful</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="scoring"
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            <Callout color="rose">
              Score ={" "}
              <span className="font-bold text-teal-800 dark:text-teal-200">similarity to true answer</span>
              {" − "}
              <span className="font-bold text-rose-800 dark:text-rose-200">similarity to false answer</span>. Higher = better.
            </Callout>

            <div className="flex flex-wrap gap-2">
              {SCORING_CASES.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCaseIdx(i)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
                    caseIdx === i
                      ? "border-rose-400/70 bg-rose-950/50 text-rose-800 dark:text-rose-50 ring-2 ring-rose-400/50 ring-offset-2 ring-offset-gray-900"
                      : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300 hover:border-gray-500",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={caseIdx}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-3"
              >
                <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-950/70 p-4">
                  <p className="text-base font-bold text-gray-600 dark:text-gray-400 md:text-lg">Question</p>
                  <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 md:text-xl">{sc.question}</p>
                  <p className="mt-3 text-base font-bold text-gray-600 dark:text-gray-400 md:text-lg">Model answer</p>
                  <p className="mt-1 text-lg italic text-gray-900 dark:text-gray-200 md:text-xl">{sc.answer}</p>
                </div>

                <div className="space-y-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-950/70 p-4">
                  <ProbBar
                    label="True match"
                    value={sc.trueScore}
                    color="teal"
                    animated
                    reducedMotion={reducedMotion}
                  />
                  <ProbBar
                    label="False match"
                    value={sc.falseScore}
                    color="rose"
                    animated
                    reducedMotion={reducedMotion}
                  />
                </div>

                <div
                  className={cn(
                    "rounded-xl border-2 p-4",
                    sc.isCorrect
                      ? "border-teal-500/40 bg-teal-950/20"
                      : "border-rose-500/40 bg-rose-950/20",
                  )}
                >
                  <p className="text-lg text-gray-900 dark:text-gray-200 md:text-xl">
                    Score = {(sc.trueScore / 100).toFixed(2)} − {(sc.falseScore / 100).toFixed(2)} ={" "}
                    <span
                      className={cn(
                        "font-bold",
                        sc.isCorrect ? "text-teal-700 dark:text-teal-300" : "text-rose-700 dark:text-rose-400",
                      )}
                    >
                      {sc.delta}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-lg font-bold md:text-xl",
                      sc.isCorrect ? "text-teal-700 dark:text-teal-300" : "text-rose-700 dark:text-rose-400",
                    )}
                  >
                    {sc.verdict}
                  </p>
                  <p className="mt-1 text-base text-gray-600 dark:text-gray-400 md:text-lg">{sc.note}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl">
        817 questions across 38 categories — built around common human misconceptions.
      </p>
    </div>
  );
}

// ─── Tab 5 — HumanEval ────────────────────────────────────────────────────────

const HUMANEVAL_STAGES = [
  "Task given",
  "Model writes code",
  "Runs unit tests",
  "Pass ✅ or Fail ❌",
] as const;

function HumanevalPanel() {
  const reducedMotion = useReducedMotion();
  const stageVisible = HUMANEVAL_STAGES.length;
  const [solution, setSolution] = useState<"A" | "B" | null>(null);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>HumanEval gives 164 coding tasks and checks if the code actually runs.</PanelTitle>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {HUMANEVAL_STAGES.map((stage, i) => (
          <AnimatePresence key={stage}>
            {stageVisible > i && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="rounded-xl border border-amber-500/40 bg-amber-950/25 px-3 py-2 text-base font-bold text-amber-800 dark:text-amber-100 md:text-lg">
                  {stage}
                </span>
                {i < HUMANEVAL_STAGES.length - 1 ? (
                  <span className="text-gray-600 dark:text-gray-500" aria-hidden>
                    →
                  </span>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-950/70 p-4 font-mono text-base text-gray-900 dark:text-gray-200 md:text-lg">
        <p className="font-bold text-gray-700 dark:text-gray-300">Task:</p>
        <p className="mt-1">Return only the even numbers from a list.</p>
        <p className="mt-2 text-amber-800 dark:text-amber-200">def get_evens(numbers): ???</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["A", "B"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSolution(id)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold md:text-lg",
              solution === id
                ? id === "A"
                  ? "border-teal-400/70 bg-teal-950/50 text-teal-800 dark:text-teal-50"
                  : "border-rose-400/70 bg-rose-950/50 text-rose-800 dark:text-rose-50"
                : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300",
            )}
          >
            Solution {id}
          </button>
        ))}
      </div>

      {solution === "A" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4 font-mono text-base md:text-lg"
        >
          <p className="text-teal-800 dark:text-teal-100">return [n for n in numbers if n % 2 == 0]</p>
          <p className="mt-2 text-teal-700 dark:text-teal-300">get_evens([1,2,3,4]) == [2,4] ✅</p>
          <p className="font-bold text-teal-700 dark:text-teal-300">Result: PASS ✅</p>
        </motion.div>
      )}

      {solution === "B" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4 font-mono text-base md:text-lg"
        >
          <p className="text-rose-800 dark:text-rose-100">return [n for n in numbers if n % 2 == 1]</p>
          <p className="mt-2 text-rose-700 dark:text-rose-400">get_evens([1,2,3,4]) expected [2,4] — got [1,3] ❌</p>
          <p className="font-bold text-rose-700 dark:text-rose-400">Result: FAIL ❌</p>
        </motion.div>
      )}

      <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl">
        Metric: <span className="font-bold text-amber-700 dark:text-amber-300">pass@k</span> — at least one of k solutions passes all tests.
      </p>
    </div>
  );
}

// ─── Router + shell ───────────────────────────────────────────────────────────

function TabPanel({ tabId }: { tabId: string }) {
  switch (tabId) {
    case "why":
      return <WhyPanel />;
    case "approaches":
      return <ApproachesPanel />;
    case "mmlu":
      return <MmluPanel />;
    case "truthful":
      return <TruthfulPanel />;
    case "humaneval":
      return <HumanevalPanel />;
    default:
      return null;
  }
}

export default function LLMEvaluationExplorer() {
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
      className="flex w-full flex-col rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-5 md:p-8"
      data-local-navigation="true"
    >
      <div
        className="flex gap-2 overflow-x-auto px-1 py-1 md:gap-2.5"
        role="tablist"
        aria-label="LLM evaluation stages"
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
                  : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300 hover:border-gray-500 hover:text-gray-950 dark:hover:text-white",
              )}
            >
              <span
                className={cn("mr-1.5", isActive ? "text-gray-900 dark:text-gray-200" : "text-gray-600 dark:text-gray-400")}
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
          className="rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-5 py-3 text-base font-bold text-gray-900 dark:text-gray-200 transition hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 md:text-lg"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={activeIdx === TABS.length - 1}
          className="rounded-xl border-2 border-violet-500/50 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-800 dark:text-violet-100 transition hover:border-violet-400 disabled:opacity-40 md:text-lg"
        >
          Next →
        </button>
        <span className="text-base text-gray-600 dark:text-gray-400 md:text-lg">
          {activeIdx + 1} / {TABS.length}
        </span>
      </div>
    </motion.div>
  );
}
