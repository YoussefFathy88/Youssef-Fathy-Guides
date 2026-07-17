"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "context", short: "Load Context First", color: "teal" },
  { id: "discuss", short: "Discuss & Refine", color: "violet" },
  { id: "output", short: "Good Plan Output", color: "amber" },
] as const;

// ─── Tab 1 — Load full context first ───────────────────────────────────────────

const CONTEXT_ITEMS = [
  { id: "goal", label: "Project goal" },
  { id: "stack", label: "Tech stack" },
  { id: "constraints", label: "Existing constraints & patterns" },
  { id: "why", label: "What problem you're solving, and why" },
] as const;

function ContextPanel() {
  const reducedMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(1);
  const full = loaded >= CONTEXT_ITEMS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Before the first implementation prompt, load the model up with real context.</PanelTitle>
      <div className="flex flex-col gap-3 rounded-xl border-2 border-teal-400/40 bg-teal-950/15 p-4 md:p-5">
        {CONTEXT_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={reducedMotion ? false : { opacity: 0, x: -14 }}
            animate={{ opacity: i < loaded ? 1 : 0.15, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 rounded-lg border border-teal-400/40 bg-gray-950/60 px-4 py-3"
          >
            <span className="text-xl text-teal-300">{i < loaded ? "✅" : "◻"}</span>
            <p className="text-lg text-gray-100 md:text-xl">{item.label}</p>
          </motion.div>
        ))}
      </div>
      {!full ? (
        <button
          type="button"
          onClick={() => setLoaded((l) => l + 1)}
          className="w-fit rounded-xl border-2 border-teal-400/70 bg-teal-950/40 px-5 py-3 text-base font-bold text-teal-100 transition hover:border-teal-300 md:text-lg"
        >
          Load next item →
        </button>
      ) : (
        <Callout color="teal">Context window filled — the model now shares your mental model before writing any code.</Callout>
      )}
    </div>
  );
}

// ─── Tab 2 — Discuss and refine ────────────────────────────────────────────────

const CHAT_STEPS = [
  { role: "You", text: "Add a way for users to reset a forgotten password." },
  { role: "AI plan", text: "I'll add a \"Forgot password\" link, an email endpoint, and a reset-token page." },
  { role: "You", text: "What happens if the email doesn't exist? And how long is the token valid?" },
  { role: "AI plan (refined)", text: "Silent success either way (no email enumeration), token expires in 15 minutes." },
] as const;

function DiscussPanel() {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(1);
  const done = shown >= CHAT_STEPS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Planning is a conversation — push back until the plan is actually clear.</PanelTitle>
      <div className="flex flex-col gap-3">
        {CHAT_STEPS.slice(0, shown).map((msg, i) => (
          <motion.div
            key={i}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "max-w-[85%] rounded-xl border-2 p-4",
              msg.role.startsWith("You") ? "self-start border-violet-400/50 bg-violet-950/25" : "self-end border-teal-400/50 bg-teal-950/25",
            )}
          >
            <p className="text-base font-bold text-gray-300 md:text-lg">{msg.role}</p>
            <p className="mt-1 text-lg text-gray-100 md:text-xl">{msg.text}</p>
          </motion.div>
        ))}
      </div>
      {!done ? (
        <button
          type="button"
          onClick={() => setShown((s) => s + 1)}
          className="w-fit rounded-xl border-2 border-violet-400/70 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-100 transition hover:border-violet-300 md:text-lg"
        >
          Continue conversation →
        </button>
      ) : (
        <Callout color="violet">Don&apos;t start implementing until you understand the plan completely — not just approve it.</Callout>
      )}
    </div>
  );
}

// ─── Tab 3 — What good plan output looks like ─────────────────────────────────

const PLAN_LAYERS = [
  { id: "goal", label: "Clear goal statement", detail: "\"Let users recover access without emailing support.\"" },
  { id: "approach", label: "Chosen approach + why", detail: "Email reset-link flow with short-lived token, rejected SMS (no phone numbers on file)." },
  { id: "components", label: "Component breakdown", detail: "What exists: auth service. What to build: reset endpoint, email template, reset page." },
  { id: "subtasks", label: "Ordered subtasks with dependencies", detail: "1) token schema → 2) email endpoint → 3) reset page → 4) tests." },
] as const;

function OutputPanel() {
  const reducedMotion = useReducedMotion();
  const [layers, setLayers] = useState(1);
  const full = layers >= PLAN_LAYERS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>A well-formed plan has four layers, built up in order.</PanelTitle>
      <div className="flex flex-col gap-3">
        {PLAN_LAYERS.slice(0, layers).map((layer, i) => (
          <motion.div
            key={layer.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border-2 border-amber-400/40 bg-amber-950/20 p-4"
          >
            <p className="text-base font-bold text-amber-200 md:text-lg">{i + 1}. {layer.label}</p>
            <p className="mt-1 text-lg text-gray-100 md:text-xl">{layer.detail}</p>
          </motion.div>
        ))}
      </div>
      {!full && (
        <button
          type="button"
          onClick={() => setLayers((l) => l + 1)}
          className="w-fit rounded-xl border-2 border-amber-400/70 bg-amber-950/40 px-5 py-3 text-base font-bold text-amber-100 transition hover:border-amber-300 md:text-lg"
        >
          Add next layer →
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [ContextPanel, DiscussPanel, OutputPanel] as const;

export default function PlanningWithAIExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="How to plan with AI" />;
}
