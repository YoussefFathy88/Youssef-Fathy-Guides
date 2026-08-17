"use client";

import { PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";
import ContextWindowFiller from "@/components/shared/ContextWindowFiller";
import DualLanePipelineDiagram from "@/components/shared/DualLanePipelineDiagram";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "problem", short: "1. The Problem", color: "rose" },
  { id: "pipeline", short: "2. Indexing + Retrieval", color: "teal" },
] as const;

// ─── Tab 1 — The problem before RAG ────────────────────────────────────────────

function ProblemPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Ask the raw model about your own requirements doc, and it either guesses or you stuff the whole thing into the prompt.</PanelTitle>
      <ContextWindowFiller
        title="Paste the whole doc into every prompt — it blows the context budget"
        size="lg"
        windowSize={8000}
        costPer1kTokens={0.015}
        blocks={[
          { id: "system", label: "System prompt", tokens: 300, color: "gray", defaultOn: true },
          { id: "fulldoc", label: "Full requirements doc (40 pages)", tokens: 42000, color: "rose", defaultOn: true },
          { id: "question", label: "Your question", tokens: 40, color: "blue", defaultOn: true },
        ]}
      />
    </div>
  );
}

// ─── Tab 2 — Indexing + retrieval, one pipeline ────────────────────────────────

function PipelinePanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Index the docs once, then retrieve the best-matching chunks for every new question.</PanelTitle>
      <DualLanePipelineDiagram
        title="RAG for the requirements doc"
        presentation
        minHeight={520}
        hideStepNarrative
        lanes={[
          {
            id: "prep",
            label: "Index once",
            color: "violet",
            blocks: [
              { id: "docs", label: "Requirements doc", emoji: "📄" },
              { id: "chunk", label: "Chunk", emoji: "✂️" },
              { id: "embed-i", label: "Embed", emoji: "🔢" },
              { id: "store", label: "Vector store", emoji: "🗄️" },
            ],
          },
          {
            id: "run",
            label: "Per question",
            color: "teal",
            blocks: [
              { id: "q", label: "New requirement", emoji: "❓" },
              { id: "embed-q", label: "Embed", emoji: "🔢" },
              { id: "retrieve", label: "Retrieve", emoji: "🔍" },
              { id: "gen", label: "LLM", emoji: "🤖", accent: "blue" },
            ],
          },
        ]}
        edges={[
          { from: "docs", to: "chunk", animated: false },
          { from: "chunk", to: "embed-i", animated: false },
          { from: "embed-i", to: "store", animated: true },
          { from: "q", to: "embed-q", animated: true },
          { from: "embed-q", to: "retrieve", animated: true },
          { from: "store", to: "retrieve", animated: true },
          { from: "retrieve", to: "gen", animated: true },
          { from: "q", to: "gen", animated: true, dashed: true, label: "+ question (prompt)" },
        ]}
        steps={[
          { id: "s1", label: "1", description: ".", highlightNodes: ["docs"], highlightEdges: [] },
          { id: "s2", label: "2", description: ".", highlightNodes: ["docs", "chunk"], highlightEdges: ["docs→chunk"] },
          { id: "s3", label: "3", description: ".", highlightNodes: ["chunk", "embed-i", "store"], highlightEdges: ["chunk→embed-i", "embed-i→store"] },
          { id: "s4", label: "4", description: ".", highlightNodes: ["q"], highlightEdges: [] },
          { id: "s5", label: "5", description: ".", highlightNodes: ["q", "embed-q"], highlightEdges: ["q→embed-q"] },
          { id: "s6", label: "6", description: ".", highlightNodes: ["embed-q", "retrieve", "store"], highlightEdges: ["embed-q→retrieve", "store→retrieve"] },
          { id: "s7", label: "7", description: ".", highlightNodes: ["retrieve", "q", "gen"], highlightEdges: ["retrieve→gen", "q→gen"] },
        ]}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [ProblemPanel, PipelinePanel] as const;

export default function RagBeforeAfterExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="RAG: the problem, then indexing and retrieval" />;
}
