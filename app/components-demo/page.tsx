"use client";

import {
  AttentionHeatmap,
  ConceptCompare,
  ConceptStepper,
  MiniPlayground,
  ParameterSlider,
  TokenProbDist,
  Vector2DPlot,
} from "@/components/shared";
import { Container } from "@/components/ui/container";

const temperatureExamples = [
  "The cat sat on the mat.",
  "The cat lounged across a moonlit quilt.",
  "The cat improvised a jazz solo on the mat.",
];

const ragSteps = [
  {
    title: "Query",
    caption: "A user asks for an answer grounded in external knowledge.",
    visual: (
      <div className="flex min-h-[240px] flex-col justify-center gap-4 rounded-2xl bg-violet-500/10 p-6">
        <span className="text-xs uppercase tracking-[0.24em] text-violet-500 dark:text-violet-300">
          User intent
        </span>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          "Summarize the company policy on remote work."
        </p>
      </div>
    ),
  },
  {
    title: "Embed",
    caption: "The query becomes a vector so the system can search semantically.",
    visual: (
      <div className="grid min-h-[240px] gap-3 rounded-2xl bg-teal-500/10 p-6 sm:grid-cols-5">
        {[0.12, 0.44, 0.81, 0.29, 0.63].map((value) => (
          <div
            key={value}
            className="flex items-end justify-center rounded-2xl bg-white/80 p-4 dark:bg-gray-900/70"
          >
            <div
              className="w-full rounded-full bg-teal-500 dark:bg-teal-400"
              style={{ height: `${value * 140}px` }}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Retrieve",
    caption: "Nearest chunks are pulled from the vector store.",
    visual: (
      <div className="grid min-h-[240px] gap-3 rounded-2xl bg-amber-500/10 p-6">
        {[
          "Remote work policy v3",
          "Manager approval workflow",
          "Equipment reimbursement FAQ",
        ].map((item, index) => (
          <div
            key={item}
            className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-amber-500/30 dark:bg-gray-900/70 dark:text-gray-200"
            style={{ transform: `translateX(${index * 12}px)` }}
          >
            {item}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Generate",
    caption: "The model answers using both the prompt and retrieved evidence.",
    visual: (
      <div className="flex min-h-[240px] items-center rounded-2xl bg-gray-900 p-6 text-gray-100">
        <p className="max-w-2xl text-base">
          Employees may work remotely up to three days per week with manager approval,
          using company-issued hardware and the reimbursement process described in the
          policy appendix.
        </p>
      </div>
    ),
  },
];

const vectorPoints = [
  { id: "query", label: "query", x: 48, y: 52, cluster: "query", isQuery: true },
  { id: "cat", label: "cat", x: 28, y: 28, cluster: "animals" },
  { id: "dog", label: "dog", x: 22, y: 38, cluster: "animals" },
  { id: "lion", label: "lion", x: 34, y: 22, cluster: "animals" },
  { id: "car", label: "car", x: 72, y: 30, cluster: "vehicles" },
  { id: "train", label: "train", x: 78, y: 42, cluster: "vehicles" },
  { id: "pizza", label: "pizza", x: 62, y: 74, cluster: "food" },
  { id: "apple", label: "apple", x: 52, y: 82, cluster: "food" },
];

const tokenCandidates = [
  { token: "mat", rawProb: 0.36 },
  { token: "floor", rawProb: 0.2 },
  { token: "couch", rawProb: 0.16 },
  { token: "rug", rawProb: 0.11 },
  { token: "sofa", rawProb: 0.09 },
  { token: "chair", rawProb: 0.08 },
];

export default function ComponentsDemoPage() {
  return (
    <main className="py-12">
      <Container className="space-y-10">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-violet-400">
            Shared Interactive Components
          </p>
          <h1 className="text-4xl font-semibold text-white">Components demo and QA page</h1>
          <p className="max-w-3xl text-slate-300">
            Each block below is wired with realistic GenAI education examples so the
            session pages can reuse them consistently.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">ParameterSlider</h2>
          <ParameterSlider
            label="Temperature"
            min={0}
            max={2}
            step={0.1}
            defaultValue={0.8}
            states={[
              {
                max: 0.5,
                description: "Deterministic and focused",
                examples: [
                  "The cat sat on the mat.",
                  "The cat sat on the mat.",
                  "The cat sat on the mat.",
                ],
                colorClassName: "bg-violet-500 dark:bg-violet-400",
              },
              {
                max: 1.2,
                description: "Balanced creativity",
                examples: temperatureExamples,
                colorClassName: "bg-teal-500 dark:bg-teal-400",
              },
              {
                max: 1.5,
                description: "Open-ended and exploratory",
                examples: [
                  "The cat composed a sonnet on the mat.",
                  "The cat moonwalked across a velvet mat.",
                  "The cat summoned a committee of curious mats.",
                ],
                colorClassName: "bg-amber-500 dark:bg-amber-400",
              },
              {
                description: "Highly random and creative",
                examples: [
                  "The cat composed a sonnet on the mat.",
                  "The cat moonwalked across a velvet mat.",
                  "The cat summoned a committee of curious mats.",
                ],
                colorClassName: "bg-amber-500 dark:bg-amber-400",
              },
            ]}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">AttentionHeatmap</h2>
          <AttentionHeatmap
            title="Self-attention over a short sentence"
            caption="Select a token to isolate which words it attends to most strongly."
            tokens={["The", "cat", "sat", "on", "the", "mat"]}
            weights={[
              [1, 0.12, 0.08, 0.05, 0.28, 0.1],
              [0.18, 1, 0.24, 0.14, 0.26, 0.3],
              [0.12, 0.31, 1, 0.2, 0.14, 0.22],
              [0.05, 0.18, 0.24, 1, 0.11, 0.37],
              [0.22, 0.26, 0.12, 0.08, 1, 0.29],
              [0.07, 0.28, 0.21, 0.34, 0.22, 1],
            ]}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">ConceptStepper</h2>
          <ConceptStepper steps={ragSteps} title="RAG pipeline walkthrough" />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">ConceptCompare</h2>
          <ConceptCompare
            title="RAG vs Fine-tuning"
            left={{
              label: "RAG",
              description: "Inject external knowledge at runtime without changing weights.",
              points: [
                "Fast to update when documents change",
                "Grounds outputs in retrieved evidence",
                "Depends on retrieval quality and chunking",
              ],
              color: "violet",
            }}
            right={{
              label: "Fine-tuning",
              description: "Adjust model behaviour by training weights on examples.",
              points: [
                "Improves style, structure, or task-specific behavior",
                "Useful when the pattern must become native to the model",
                "Requires curated data and training workflow",
              ],
              color: "teal",
            }}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">MiniPlayground</h2>
          <MiniPlayground
            title="Prompt simulation"
            caption="A tiny prompt playground for showing input-output transformation."
            simulationFn={(input) => `LLM processed: ${input.toUpperCase()}`}
            hint="This simulation uppercases the text so you can focus on the interaction pattern."
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Vector2DPlot</h2>
          <Vector2DPlot
            title="Semantic clusters in embedding space"
            caption="Drag the query point around to see which cluster becomes closest."
            points={vectorPoints}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">TokenProbDist</h2>
          <TokenProbDist
            title='Next-token candidates after "The cat sat on the"'
            caption="Sampling controls reshape the distribution before a token is drawn."
            candidates={tokenCandidates}
            showTopP
            defaultTemperature={1}
            defaultTopP={0.9}
            highlightTop={2}
          />
        </section>
      </Container>
    </main>
  );
}
