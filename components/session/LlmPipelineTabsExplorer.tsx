"use client";

import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";
import LiveTokenizer from "@/components/shared/LiveTokenizer";
import TokenProbDist from "@/components/shared/TokenProbDist";
import EmbeddingVectorExplorer from "@/components/session/EmbeddingVectorExplorer";
import SelfAttentionScoreExplorer from "@/components/session/SelfAttentionScoreExplorer";

// ─── Tabs ─────────────────────────────────────────────────────────────────────
// One box, four tabs: the same "LLM box" from the black-box slide, opened up.

const TABS: readonly ExplorerTab[] = [
  { id: "tokenize", short: "1. Tokenize", color: "teal" },
  { id: "embed", short: "2. Embed", color: "blue" },
  { id: "attend", short: "3. Transformer", color: "violet" },
  { id: "next", short: "4. Next Token", color: "amber" },
] as const;

// ─── Tab 1 — Tokenization ──────────────────────────────────────────────────────

function TokenizePanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Raw text is split into tokens — each one gets an ID number.</PanelTitle>
      <LiveTokenizer title="Type a requirement and watch it split into tokens" />
    </div>
  );
}

// ─── Tab 2 — Embedding ──────────────────────────────────────────────────────────

function EmbedPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Each token ID becomes a vector — words with similar meaning land near each other.</PanelTitle>
      <EmbeddingVectorExplorer title="Words as vectors in 2D space" />
    </div>
  );
}

// ─── Tab 3 — Transformer / attention ───────────────────────────────────────────

function AttendPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>The transformer lets every token &ldquo;look at&rdquo; every other token — this is attention.</PanelTitle>
      <SelfAttentionScoreExplorer title="Click a token to see what it attends to" />
    </div>
  );
}

// ─── Tab 4 — Next token + loop back ────────────────────────────────────────────

function NextTokenPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>The model scores every word in its vocabulary, then samples one.</PanelTitle>
      <TokenProbDist
        title="Next-token distribution after '...ticket priority should be'"
        showTemperature
        defaultTemperature={0.7}
        highlightTop={1}
        candidates={[
          { token: "High", rawProb: 0.52 },
          { token: "Medium", rawProb: 0.28 },
          { token: "Low", rawProb: 0.11 },
          { token: "Urgent", rawProb: 0.06 },
          { token: "TBD", rawProb: 0.03 },
        ]}
      />
      <Callout color="amber">
        That word is added back onto the prompt, and the whole loop repeats — tokenize, embed, attend,
        predict — one word at a time. This is why generation is called <strong>autoregressive</strong>:
        each new token is generated using every token that came before it, including the ones the model
        just wrote.
      </Callout>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [TokenizePanel, EmbedPanel, AttendPanel, NextTokenPanel] as const;

export default function LlmPipelineTabsExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="The LLM pipeline, one stage per tab" />;
}
