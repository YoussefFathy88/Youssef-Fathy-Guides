"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "why", short: "Why AI Ignores Standards", color: "rose" },
  { id: "types", short: "Types of Rules", color: "teal" },
  { id: "where", short: "Where Rules Live", color: "violet" },
] as const;

// ─── Tab 1 — Why AI ignores your standards without rules ──────────────────────

function WhyPanel() {
  const reducedMotion = useReducedMotion();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Every session starts cold — without rules, the AI has no memory of your standards.</PanelTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4 md:p-5">
          <p className="text-base font-bold text-rose-300 md:text-lg">No rules — generic output</p>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-lg text-gray-200 md:text-xl">
{`function get_user_data(id) {
  return db.query('SELECT * FROM users...')
}`}
          </pre>
        </div>
        <div className="rounded-xl border-2 border-teal-400/50 bg-teal-950/20 p-4 md:p-5">
          <p className="text-base font-bold text-teal-300 md:text-lg">With rules — matches project style</p>
          {!showRules ? (
            <button
              type="button"
              onClick={() => setShowRules(true)}
              className="mt-3 rounded-lg border-2 border-teal-400/60 bg-teal-950/40 px-4 py-2 text-base font-bold text-teal-100 md:text-lg"
            >
              Apply project rules →
            </button>
          ) : (
            <motion.pre
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 whitespace-pre-wrap font-mono text-lg text-gray-200 md:text-xl"
            >
{`export async function getUserById(userId: string) {
  return userService.findById(userId)
}`}
            </motion.pre>
          )}
        </div>
      </div>
      <Callout color="rose">
        By default the AI writes its own naming, its own patterns, its own file structure — inconsistent across sessions and hard to maintain.
      </Callout>
    </div>
  );
}

// ─── Tab 2 — Types of rules ─────────────────────────────────────────────────────

const RULE_TYPES = [
  { id: "arch", label: "Architecture rules", example: "Where services, endpoints, and utilities live." },
  { id: "naming", label: "Naming conventions", example: "File names, function names, variable patterns." },
  { id: "patterns", label: "Coding patterns", example: "How errors are handled, how services are structured." },
  { id: "constraints", label: "Constraints", example: "What NOT to do — no inline SQL, no logic in controllers." },
] as const;

function TypesPanel() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Rules fall into four categories.</PanelTitle>
      <div className="grid gap-3 md:grid-cols-2">
        {RULE_TYPES.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reducedMotion ? 0 : i * 0.12 }}
            className="rounded-xl border-2 border-teal-400/40 bg-teal-950/15 p-4"
          >
            <p className="text-lg font-bold text-teal-200 md:text-xl">{rule.label}</p>
            <p className="mt-1 text-lg text-gray-100 md:text-xl">{rule.example}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 3 — Where rules live ────────────────────────────────────────────────────

const FILE_TREE = [
  { id: "claude", path: "CLAUDE.md", tool: "Claude Code", highlight: true },
  { id: "cursor", path: ".cursorrules", tool: "Cursor", highlight: true },
  { id: "ai-rules", path: ".ai-rules/*.md", tool: "Both (large projects)", highlight: false },
] as const;

function WherePanel() {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Rules live in the repo — committed, so the whole team benefits.</PanelTitle>
      <div className="flex flex-col gap-2 rounded-xl border border-gray-700 bg-gray-950/70 p-4 font-mono text-lg md:text-xl">
        <p className="text-gray-400">project/</p>
        {FILE_TREE.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(f.id)}
            className={cn(
              "ml-4 flex items-center gap-2 rounded-lg px-2 py-1 text-left transition",
              active === f.id ? "bg-violet-950/50 text-violet-200" : "text-gray-200 hover:bg-gray-900",
            )}
          >
            <span>├─</span>
            <span className={cn(active === f.id && "font-bold")}>{f.path}</span>
          </button>
        ))}
      </div>
      {active && (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Callout color="violet">
            {FILE_TREE.find((f) => f.id === active)?.path} → auto-loaded for {FILE_TREE.find((f) => f.id === active)?.tool}.
          </Callout>
        </motion.div>
      )}
      <p className="text-lg text-gray-300 md:text-xl">Click a file above to see which tool loads it automatically.</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [WhyPanel, TypesPanel, WherePanel] as const;

export default function ProjectRulesExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="What are project rules" />;
}
