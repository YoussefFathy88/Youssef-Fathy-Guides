"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccentColor = "amber" | "teal" | "rose" | "violet" | "blue" | "gray";

const BAR_FILL: Record<AccentColor, string> = {
  teal:   "bg-teal-500",
  violet: "bg-violet-500",
  rose:   "bg-rose-500",
  amber:  "bg-amber-500",
  blue:   "bg-blue-500",
  gray:   "bg-gray-500",
};

const ACCENT: Record<
  AccentColor,
  { tab: string; bg: string; text: string; border: string }
> = {
  gray: {
    tab: "border-slate-300/80 bg-gray-100/60 dark:bg-slate-800/60 text-gray-950 dark:text-white ring-slate-300/50",
    bg: "bg-slate-500/15",
    text: "text-gray-900 dark:text-gray-100",
    border: "border-slate-300/70",
  },
  teal: {
    tab: "border-teal-400/80 bg-teal-950/50 text-teal-800 dark:text-teal-50 ring-teal-400/50",
    bg: "bg-teal-500/15",
    text: "text-teal-800 dark:text-teal-100",
    border: "border-teal-400/70",
  },
  blue: {
    tab: "border-blue-400/80 bg-blue-950/50 text-blue-800 dark:text-blue-50 ring-blue-400/50",
    bg: "bg-blue-500/15",
    text: "text-blue-800 dark:text-blue-100",
    border: "border-blue-400/70",
  },
  violet: {
    tab: "border-violet-400/80 bg-violet-950/50 text-violet-800 dark:text-violet-50 ring-violet-400/50",
    bg: "bg-violet-500/15",
    text: "text-violet-800 dark:text-violet-100",
    border: "border-violet-400/70",
  },
  rose: {
    tab: "border-rose-400/80 bg-rose-950/50 text-rose-800 dark:text-rose-50 ring-rose-400/50",
    bg: "bg-rose-500/15",
    text: "text-rose-800 dark:text-rose-100",
    border: "border-rose-400/70",
  },
  amber: {
    tab: "border-amber-400/80 bg-amber-950/50 text-amber-800 dark:text-amber-50 ring-amber-400/50",
    bg: "bg-amber-500/15",
    text: "text-amber-800 dark:text-amber-100",
    border: "border-amber-400/70",
  },
};

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "why-sft",       short: "Why SFT?",    color: "violet" as AccentColor },
  { id: "generate",      short: "Generate",    color: "violet" as AccentColor },
  { id: "rank",          short: "Rank",        color: "teal"   as AccentColor },
  { id: "reward-model",  short: "Reward M.",   color: "blue"   as AccentColor },
  { id: "ppo",           short: "PPO Loop",    color: "amber"  as AccentColor },
  { id: "hacking",       short: "Hacking ⚠️",  color: "rose"   as AccentColor },
  { id: "kl",            short: "KL Fix ✅",   color: "teal"   as AccentColor },
] as const;

// ─── Tab 1 — Why SFT Is Not Enough ────────────────────────────────────────────

function WhySftPanel() {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">
        SFT taught the model to copy training answers. But copying has limits.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-teal-500/50 bg-teal-950/30 p-4 md:p-5">
          <p className="text-base font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300 md:text-lg">Response A</p>
          <p className="mt-2 text-lg text-gray-900 dark:text-gray-100 md:text-xl">
            "An API is a way for two applications to talk to each other. For example, when a weather app shows today's temperature, it's using an API to fetch that data from a remote server."
          </p>
          <p className="mt-3 text-lg font-bold text-teal-700 dark:text-teal-300 md:text-xl">✅ Clear, accurate, helpful</p>
        </div>

        <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/25 p-4 md:p-5">
          <p className="text-base font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300 md:text-lg">Response C</p>
          <p className="mt-2 text-lg text-gray-900 dark:text-gray-100 md:text-xl">
            "APIs are the REVOLUTIONARY backbone of MODERN SOFTWARE!! They TRANSFORM how apps COMMUNICATE in ways that are truly MIND-BLOWING and INCREDIBLE!!"
          </p>
          <p className="mt-3 text-lg font-bold text-rose-700 dark:text-rose-400 md:text-xl">❌ Overhyped, not helpful</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50/70 dark:bg-gray-900/70 p-4 md:p-5">
        <p className="text-lg text-gray-900 dark:text-gray-200 md:text-xl">
          SFT cannot tell them apart — it only learned to copy example answers.
          It has no way to know which answer people actually like better.
          <span className="mt-2 block font-bold text-violet-700 dark:text-violet-300">
            RLHF solves this by adding human preferences into training.
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── Tab 2 — Generate Multiple Responses ──────────────────────────────────────

const RESPONSES_TAB2 = [
  { badge: "Response A", color: "violet" as AccentColor, text: "An API is a way for two applications to talk to each other. For example, when a weather app shows today's temperature, it's using an API to fetch that data from a remote server." },
  { badge: "Response B", color: "gray"   as AccentColor, text: "An API stands for Application Programming Interface. It is an interface used in applications for programming purposes." },
  { badge: "Response C", color: "teal"   as AccentColor, text: "APIs are the REVOLUTIONARY backbone of MODERN SOFTWARE!! They TRANSFORM how apps COMMUNICATE in ways that are truly MIND-BLOWING and INCREDIBLE!!" },
];

function GeneratePanel() {
  const reducedMotion = useReducedMotion();
  const visible = RESPONSES_TAB2.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-900/80 px-4 py-3 md:px-5">
        <span className="text-base font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 md:text-lg">Prompt</span>
        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 md:text-xl">"What is an API?"</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {RESPONSES_TAB2.map((r, i) => (
          <AnimatePresence key={r.badge}>
            {visible > i && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "rounded-xl border-2 p-4 md:p-5",
                  ACCENT[r.color].border,
                  ACCENT[r.color].bg,
                )}
              >
                <span className={cn("text-base font-bold md:text-lg", ACCENT[r.color].text)}>{r.badge}</span>
                <p className="mt-2 text-lg text-gray-900 dark:text-gray-100 md:text-xl">{r.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl">
        These all came from the same model.
        <span className="font-bold text-amber-700 dark:text-amber-300"> Now we need a way to judge which is best.</span>
      </p>
    </div>
  );
}

// ─── Tab 3 — Humans Rank ──────────────────────────────────────────────────────

const RANKED = [
  { label: "Response A", rank: "Rank #1", medal: "🥇", color: "teal"   as AccentColor },
  { label: "Response B", rank: "Rank #2", medal: "🥈", color: "violet" as AccentColor },
  { label: "Response C", rank: "Rank #3", medal: "🥉", color: "gray"   as AccentColor },
];

function RankPanel() {
  const reducedMotion = useReducedMotion();
  const visible = RANKED.length;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">
        Human annotators rank which response they prefer.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {RANKED.map((r, i) => (
          <div
            key={r.label}
            className={cn(
              "rounded-xl border-2 p-4 md:p-5",
              ACCENT[r.color].border,
              ACCENT[r.color].bg,
            )}
          >
            <p className={cn("text-base font-bold md:text-lg", ACCENT[r.color].text)}>{r.label}</p>

            <AnimatePresence>
              {visible > i && (
                <motion.p
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  className="mt-3 text-2xl font-bold md:text-3xl"
                >
                  {r.medal} {r.rank}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50/70 dark:bg-gray-900/70 p-4 md:p-5">
        <p className="text-lg text-gray-900 dark:text-gray-200 md:text-xl">
          Humans don't write new responses — they just rank what the model produced.
          <span className="block font-bold text-teal-700 dark:text-teal-300 mt-1">
            This ranking data trains the next step: the Reward Model.
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── Tab 4 — Train the Reward Model ───────────────────────────────────────────

const REWARD_BARS = [
  { label: "Response A", score: 0.91, width: 91, color: "teal"   as AccentColor, badge: "✅" },
  { label: "Response B", score: 0.67, width: 67, color: "violet" as AccentColor, badge: ""   },
  { label: "Response C", score: 0.31, width: 31, color: "rose"   as AccentColor, badge: "❌" },
];

function RewardModelPanel() {
  const reducedMotion = useReducedMotion();
  const animated = true;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">
        The Reward Model learns to predict human preferences as a score.
      </p>

      <div className="space-y-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-950/70 p-4 md:p-5">
        {REWARD_BARS.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className={cn("w-28 shrink-0 text-base font-bold md:text-lg", ACCENT[bar.color].text)}>
              {bar.label}
            </span>
            <div className="flex h-8 min-w-0 flex-1 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <motion.div
                className={cn("h-full rounded-lg", BAR_FILL[bar.color])}
                initial={{ width: "0%" }}
                animate={{ width: animated || reducedMotion ? `${bar.width}%` : "0%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-base font-bold text-gray-900 dark:text-gray-200 md:text-lg">
              {bar.score} {bar.badge}
            </span>
          </div>
        ))}
      </div>

      <p className="text-lg text-gray-900 dark:text-gray-200 md:text-xl">
        The Reward Model is a separate neural network. It takes any (prompt, response) pair
        and outputs a single number — how much a human would prefer it.
      </p>

      <div className="rounded-xl border-2 border-amber-500/40 bg-amber-950/20 p-4 md:p-5">
        <p className="text-base font-bold text-amber-700 dark:text-amber-300 md:text-lg">⚡ Key insight</p>
        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 md:text-xl">
          Humans ranked ~33,000 response pairs to train InstructGPT's reward model.
          The reward model then generalizes to millions of new prompts.
        </p>
      </div>
    </div>
  );
}

// ─── Tab 5 — PPO Fine-Tuning Loop ─────────────────────────────────────────────

const PPO_ROUNDS = [
  {
    round: 1,
    response:
      '"An API stands for Application Programming Interface. It is an interface used in applications for programming purposes."',
    flaw: "Circular — defines API using the word interface",
    score: 0.58,
    update: "↑ nudged away from empty definitions",
    scoreColor: "text-rose-700 dark:text-rose-400",
  },
  {
    round: 2,
    response: '"An API is a way for two applications to talk to each other."',
    flaw: "Clear idea — but no concrete example yet",
    score: 0.76,
    update: "↑ nudged toward helpful examples",
    scoreColor: "text-amber-700 dark:text-amber-400",
  },
  {
    round: 3,
    response:
      '"An API is a way for two applications to talk to each other. For example, when a weather app shows today\'s temperature, it\'s using an API to fetch that data from a remote server."',
    flaw: "Clear, accurate, helpful — same as human rank #1",
    score: 0.92,
    update: "✅ Reward score near the top",
    scoreColor: "text-teal-700 dark:text-teal-400",
  },
];

function PpoPanel() {
  const reducedMotion = useReducedMotion();
  const [round, setRound] = useState(0);

  const current = PPO_ROUNDS[round];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">
        PPO (Proximal Policy Optimization) uses reward scores to update the model's weights — chasing higher scores over time.
      </p>

      <div className="flex flex-wrap gap-2">
        {PPO_ROUNDS.map((r, i) => (
          <button
            key={r.round}
            type="button"
            onClick={() => setRound(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
              round === i
                ? "border-amber-500/60 bg-amber-950/40 text-amber-800 dark:text-amber-100 ring-2 ring-amber-500/30"
                : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
            )}
          >
            Round {r.round}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="flex flex-1 flex-col gap-3 rounded-xl border-2 border-amber-500/30 bg-amber-950/20 p-4 md:p-5"
        >
          <p className="text-base font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300 md:text-lg">
            Round {current.round}
          </p>
          <p className="text-lg text-gray-900 dark:text-gray-100 md:text-xl">
            Model generates: {current.response}
          </p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">
            {current.flaw}
          </p>
          <p className={cn("text-xl font-bold md:text-2xl", current.scoreColor)}>
            Reward score: {current.score}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-200 md:text-xl">
            PPO update: {current.update}
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl">
        PPO is just the optimizer — instead of minimizing text prediction loss,
        it <span className="font-bold text-amber-700 dark:text-amber-300">maximizes the reward score</span>.
      </p>
    </div>
  );
}

// ─── Tab 6 — Reward Hacking ────────────────────────────────────────────────────

const HACKING_STEPS = [
  {
    id: "goal",
    label: "The goal",
    title: "PPO only cares about one thing: raise the reward score.",
    body: "The model keeps training. Its job is to get a higher number from the reward model — not to write a better answer for you.",
  },
  {
    id: "trick",
    label: "The trick",
    title: "The model finds a shortcut: loud hype words fool the reward model.",
    body: "After many PPO steps, it learns that ALL CAPS, exclamation marks, and words like REVOLUTIONARY and INCREDIBLE push the score up — even when the answer teaches nothing.",
  },
  {
    id: "result",
    label: "The result",
    title: "Score goes up. Quality goes down. That is reward hacking.",
    body: null,
  },
] as const;

function HackingPanel() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = HACKING_STEPS[stepIdx];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">
        Too much PPO — the model cheats the reward score instead of getting better.
      </p>

      <div className="flex flex-wrap gap-2">
        {HACKING_STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStepIdx(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
              stepIdx === i
                ? "border-rose-400/70 bg-rose-950/50 text-rose-800 dark:text-rose-50 ring-2 ring-rose-400/50 ring-offset-2 ring-offset-gray-900"
                : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300 hover:border-gray-500",
            )}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border-2 border-rose-500/30 bg-rose-950/20 p-4 md:p-5">
        <p className="text-lg font-bold text-rose-800 dark:text-rose-100 md:text-xl">{step.title}</p>
        {step.body ? (
          <p className="mt-2 text-lg text-gray-900 dark:text-gray-200 md:text-xl">{step.body}</p>
        ) : null}
      </div>

      {stepIdx === 2 && (
        <>
          <p className="text-base font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 md:text-lg">
            Prompt: "What is an API?"
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4">
              <p className="text-base font-bold text-teal-700 dark:text-teal-300 md:text-lg">Good answer</p>
              <p className="mt-2 text-lg text-gray-900 dark:text-gray-100 md:text-xl">
                "An API lets two apps talk to each other. A weather app uses an API to fetch today's temperature."
              </p>
              <p className="mt-3 text-lg font-bold text-teal-700 dark:text-teal-300 md:text-xl">Reward score: 0.91 ✅</p>
              <p className="mt-1 text-lg text-gray-700 dark:text-gray-300 md:text-xl">Helpful for a real user</p>
            </div>

            <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4">
              <p className="text-base font-bold text-rose-700 dark:text-rose-300 md:text-lg">Hacked answer</p>
              <p className="mt-2 text-lg text-gray-900 dark:text-gray-100 md:text-xl">
                "APIs are REVOLUTIONARY!! They TRANSFORM software in MIND-BLOWING ways!!"
              </p>
              <p className="mt-3 text-lg font-bold text-rose-700 dark:text-rose-400 md:text-xl">Reward score: 0.97 ❌</p>
              <p className="mt-1 text-lg text-gray-700 dark:text-gray-300 md:text-xl">Higher score — but useless to humans</p>
            </div>
          </div>

          <div className="rounded-xl border-2 border-rose-400 bg-rose-950/40 px-4 py-4">
            <p className="text-lg font-bold text-rose-800 dark:text-rose-200 md:text-xl">
              ⚠️ Reward hacking = the model gamed the score without getting better.
            </p>
            <p className="mt-2 text-lg text-gray-900 dark:text-gray-200 md:text-xl">
              It learned to please the reward model, not to help you. That is why the next step adds a KL penalty.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab 7 — KL Penalty ───────────────────────────────────────────────────────

const KL_SCENARIOS = [
  {
    round: 1,
    tabLabel: "Step 0",
    response:
      '"An API is a way for two applications to talk to each other. For example, when a weather app shows today\'s temperature, it\'s using an API to fetch that data from a remote server."',
    note: "SFT baseline — starting point right before PPO",
    klStatus: "KL = 0",
    klColor: "text-violet-700 dark:text-violet-400",
    driftSummary: "Token choices match SFT exactly — no drift yet",
    driftColor: "text-violet-700 dark:text-violet-300",
    outcome: "Model unchanged — PPO has not started",
    outcomeColor: "text-gray-700 dark:text-gray-300",
    tokens: [
      { token: '"An"', sft: 35, current: 35, driftLabel: "Match" },
      { token: '"API"', sft: 40, current: 40, driftLabel: "Match" },
      { token: '"For example"', sft: 18, current: 18, driftLabel: "Match" },
    ],
  },
  {
    round: 2,
    tabLabel: "No KL",
    response:
      '"APIs are REVOLUTIONARY!! They TRANSFORM software in MIND-BLOWING ways!!"',
    note: "Hype words took over — model drifted far from SFT",
    klStatus: "KL = large ❌",
    klColor: "text-rose-700 dark:text-rose-400",
    driftSummary: "Normal words dropped — REVOLUTIONARY spiked to 55%",
    driftColor: "text-rose-700 dark:text-rose-400",
    outcome: "Reward hacked — score up, answer useless",
    outcomeColor: "text-rose-700 dark:text-rose-400",
    tokens: [
      { token: '"An"', sft: 35, current: 8, driftLabel: "HIGH ⚠️" },
      { token: '"API"', sft: 40, current: 5, driftLabel: "HIGH ⚠️" },
      { token: '"REVOLUTIONARY"', sft: 1, current: 55, driftLabel: "EXTREME ❌" },
    ],
  },
  {
    round: 3,
    tabLabel: "With KL",
    response:
      '"An API is a way for two applications to talk to each other. For example, when a weather app shows today\'s temperature, it\'s using an API to fetch that data from a remote server."',
    note: "Helpful answer — stayed close to SFT, added clarity",
    klStatus: "KL = small ✅",
    klColor: "text-teal-700 dark:text-teal-400",
    driftSummary: "Small shift toward helpful words — hype stays blocked",
    driftColor: "text-teal-700 dark:text-teal-400",
    outcome: "Improved AND stable ✅",
    outcomeColor: "text-teal-700 dark:text-teal-400",
    tokens: [
      { token: '"An"', sft: 35, current: 32, driftLabel: "Low" },
      { token: '"For example"', sft: 18, current: 24, driftLabel: "Low ✅" },
      { token: '"REVOLUTIONARY"', sft: 1, current: 1, driftLabel: "Blocked ✅" },
    ],
  },
] as const;

function KlTokenRow({
  token,
  sft,
  current,
  driftLabel,
  reducedMotion,
}: {
  token: string;
  sft: number;
  current: number;
  driftLabel: string;
  reducedMotion: boolean | null;
}) {
  const isHealthy = driftLabel.includes("✅") || driftLabel === "Match" || driftLabel === "Low";
  const isBad = driftLabel.includes("❌") || driftLabel.includes("⚠️") || driftLabel === "HIGH ⚠️";
  const currentBar = isHealthy ? "bg-teal-500" : isBad ? "bg-rose-500" : "bg-amber-500";
  const driftColor = isHealthy
    ? driftLabel === "Match"
      ? "text-violet-700 dark:text-violet-300"
      : "text-teal-700 dark:text-teal-400"
    : isBad
      ? "text-rose-700 dark:text-rose-400"
      : "text-amber-700 dark:text-amber-400";

  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-base font-bold text-gray-900 dark:text-gray-200 md:text-lg">{token}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-right text-base text-violet-700 dark:text-violet-300 md:text-lg">{sft}%</span>
          <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <motion.div
              className="h-full rounded-full bg-violet-500"
              initial={{ width: "0%" }}
              animate={{ width: `${sft}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut" }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-base text-violet-700 dark:text-violet-300 md:text-lg">SFT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-right text-base text-gray-900 dark:text-gray-200 md:text-lg">{current}%</span>
          <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <motion.div
              className={cn("h-full rounded-full", currentBar)}
              initial={{ width: "0%" }}
              animate={{ width: `${current}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut", delay: 0.1 }}
            />
          </div>
          <span className={cn("w-24 shrink-0 text-right text-base font-bold md:text-lg", driftColor)}>
            {driftLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function KlPanel() {
  const reducedMotion = useReducedMotion();
  const [scenario, setScenario] = useState(0);
  const current = KL_SCENARIOS[scenario];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">
        KL Penalty measures how far the model has drifted from its SFT baseline — and punishes big drift.
      </p>

      <div className="flex flex-wrap gap-2">
        {KL_SCENARIOS.map((s, i) => (
          <button
            key={s.round}
            type="button"
            onClick={() => setScenario(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
              scenario === i
                ? "border-teal-500/60 bg-teal-950/40 text-teal-800 dark:text-teal-100 ring-2 ring-teal-500/30"
                : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
            )}
          >
            {s.tabLabel}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scenario}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-3 rounded-xl border-2 border-teal-500/30 bg-teal-950/20 p-4 md:p-5"
        >
          <p className="text-base font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300 md:text-lg">
            {current.tabLabel}
          </p>
          <p className="text-lg text-gray-900 dark:text-gray-100 md:text-xl">Model generates: {current.response}</p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 md:text-xl">{current.note}</p>
          <p className={cn("text-xl font-bold md:text-2xl", current.klColor)}>{current.klStatus}</p>

          <div className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-950/70 p-4">
            <p className="mb-3 text-base font-bold text-gray-600 dark:text-gray-400 md:text-lg">Prompt: "What is an API?"</p>
            <div className="space-y-3">
              {current.tokens.map((t) => (
                <KlTokenRow
                  key={t.token}
                  token={t.token}
                  sft={t.sft}
                  current={t.current}
                  driftLabel={t.driftLabel}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
            <p className={cn("mt-3 text-lg font-semibold md:text-xl", current.driftColor)}>
              {current.driftSummary}
            </p>
          </div>

          <p className={cn("text-lg font-bold md:text-xl", current.outcomeColor)}>
            Result: {current.outcome}
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl">
        PPO pushes the model to improve.
        <span className="font-bold text-teal-700 dark:text-teal-300"> KL keeps it from going off the rails.</span>
      </p>
    </div>
  );
}

// ─── Panel router ─────────────────────────────────────────────────────────────

function TabPanel({ tabId }: { tabId: string }) {
  switch (tabId) {
    case "why-sft":      return <WhySftPanel />;
    case "generate":     return <GeneratePanel />;
    case "rank":         return <RankPanel />;
    case "reward-model": return <RewardModelPanel />;
    case "ppo":          return <PpoPanel />;
    case "hacking":      return <HackingPanel />;
    case "kl":           return <KlPanel />;
    default:             return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RLHFExplorer() {
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
      {/* Tab bar */}
      <div
        className="flex gap-2 overflow-x-auto px-1 py-1 md:gap-2.5"
        role="tablist"
        aria-label="RLHF pipeline stages"
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
                  ? cn(
                      "ring-2 ring-offset-2 ring-offset-gray-900",
                      ACCENT[tab.color].tab,
                    )
                  : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300 hover:border-gray-500 hover:text-gray-950 dark:hover:text-white",
              )}
            >
              <span
                className={cn(
                  "mr-1.5",
                  isActive ? "text-gray-900 dark:text-gray-200" : "text-gray-600 dark:text-gray-400",
                )}
                aria-hidden
              >
                {idx + 1}.
              </span>
              {tab.short}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
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

      {/* Navigation */}
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
