/**
 * Session component gallery catalog.
 * Keep in sync with `getMdxComponents` in `app/sessions/[slug]/page.tsx`.
 */

import type { ReactNode } from "react";

import { NextSessionCard, RecapTable, SessionSection } from "@/components/session";
import {
  AgentLoopStepper,
  AlgorithmStepper,
  AnnotatedCode,
  ApiLifecycleFlow,
  BTreeExplorer,
  ConsensusSimulator,
  MemoryLayoutExplorer,
  MessageQueueSim,
  MutexRaceDetector,
  OAuthFlowStepper,
  PacketJourneyVisualizer,
  ProcessSchedulerViz,
  RateLimiterVisualizer,
  TransactionIsolationSim,
  AttentionHeatmap,
  AutoregressiveDemo,
  CallStackVisualizer,
  ChatReplay,
  ChunkVisualizer,
  CodeEvolutionStepper,
  ConceptCompare,
  ConceptStepper,
  CompactCommandSimulator,
  ContextLimitSimulator,
  ContextWindowFiller,
  DataFlowDiagram,
  DualPhaseFlow,
  EmbeddingSearchSimulator,
  GradientDescentSimulator,
  InferenceWalkthrough,
  LayerStack,
  LiveTokenizer,
  MemoryOrchestrator,
  MiniPlayground,
  NeuralNetworkForwardPass,
  NodeFlowDiagram,
  ParameterSlider,
  ParallelToolRunner,
  PipelineTrack,
  PromptAnatomyVisualizer,
  StepSequence,
  TabbedCodeExplorer,
  ThinkingModeSimulator,
  TokenProbDist,
  TrainingLoopSimulator,
  TransformerLogitsExplainer,
  Vector2DPlot,
} from "@/components/shared";
import { contextLimitStepsFixture, embeddingSearchFixture } from "./gallery-fixtures";

export type GalleryItem = {
  name: string;
  node: ReactNode;
};

const temperatureExamples = [
  "The cat sat on the mat.",
  "The cat lounged across a moonlit quilt.",
  "The cat improvised a jazz solo on the mat.",
];

const ragConceptStepperSteps = [
  {
    title: "Query",
    caption: "A user asks for an answer grounded in external knowledge.",
    visual: (
      <div className="flex min-h-[160px] flex-col justify-center gap-4 rounded-2xl bg-violet-500/10 p-6">
        <span className="text-xs uppercase tracking-[0.24em] text-violet-500 dark:text-violet-300">
          User intent
        </span>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          &quot;Summarize the company policy on remote work.&quot;
        </p>
      </div>
    ),
  },
  {
    title: "Embed",
    caption: "The query becomes a vector so the system can search semantically.",
    visual: (
      <div className="grid min-h-[160px] gap-3 rounded-2xl bg-teal-500/10 p-6 sm:grid-cols-5">
        {[0.12, 0.44, 0.81, 0.29, 0.63].map((value) => (
          <div
            key={value}
            className="flex items-end justify-center rounded-2xl bg-white/80 p-4 dark:bg-gray-900/70"
          >
            <div
              className="w-full rounded-full bg-teal-500 dark:bg-teal-400"
              style={{ height: `${value * 100}px` }}
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
      <div className="grid min-h-[160px] gap-3 rounded-2xl bg-amber-500/10 p-6">
        {["Remote work policy v3", "Manager approval workflow", "Equipment reimbursement FAQ"].map(
          (item, index) => (
            <div
              key={item}
              className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-amber-500/30 dark:bg-gray-900/70 dark:text-gray-200"
              style={{ transform: `translateX(${index * 8}px)` }}
            >
              {item}
            </div>
          ),
        )}
      </div>
    ),
  },
  {
    title: "Generate",
    caption: "The model answers using both the prompt and retrieved evidence.",
    visual: (
      <div className="flex min-h-[160px] items-center rounded-2xl bg-gray-900 p-6 text-gray-100">
        <p className="max-w-2xl text-sm">
          Employees may work remotely up to three days per week with manager approval.
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

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    name: "SessionSection",
    node: (
      <SessionSection id="gallery-demo" label="Gallery demo">
        <h2 className="text-xl font-semibold text-gray-100">Example section body</h2>
        <p className="mt-2 text-gray-300">Minimal preview of section chrome and content area.</p>
      </SessionSection>
    ),
  },
  {
    name: "RecapTable",
    node: (
      <RecapTable
        rows={[
          { term: "Token", definition: "The basic unit the model processes." },
          { term: "Embedding", definition: "A vector representation of meaning." },
        ]}
      />
    ),
  },
  {
    name: "NextSessionCard",
    node: (
      <NextSessionCard
        title="Embeddings"
        slug="embeddings"
        teaser="How integers become comparable vectors in semantic space."
        module={1}
      />
    ),
  },
  {
    name: "AgentLoopStepper",
    node: (
      <AgentLoopStepper
        title="The complete tool-use loop — step through it yourself"
        caption="Press Step → to advance one step at a time, or Play to run through automatically"
        steps={[
          {
            id: "define",
            actor: "user",
            label: "You define tools and send the user message",
            bubble:
              "POST /v1/messages\n{\n  tools: [{ name: 'get_weather', ... }],\n  messages: [...]\n}",
            detail:
              "Your API call includes a tools array alongside the user message. Each tool has a name, a description, and an input_schema.",
          },
          {
            id: "decide",
            actor: "model",
            label: "Model decides to call a tool",
            bubble:
              "Response: stop_reason: 'tool_use'\ncontent: [{ type: 'tool_use', name: 'get_weather', input: { city: 'Cairo' } }]",
            detail:
              "The model returns a structured tool_use block — the tool name and the arguments it wants to pass.",
          },
          {
            id: "execute",
            actor: "your-code",
            label: "Your application executes the tool",
            bubble: "result = get_weather(city='Cairo')",
            detail:
              "Your application reads the tool_use block, calls the actual function, and gets a real result.",
          },
          {
            id: "return",
            actor: "user",
            label: "You send the tool result back",
            bubble: "messages: [..., { role: 'user', content: [tool_result] }]",
            detail:
              "You append a tool_result message to the conversation with the real data your function returned.",
          },
          {
            id: "answer",
            actor: "model",
            label: "Model generates the final answer",
            bubble: "The current weather in Cairo is 34°C and sunny.",
            detail:
              "With the tool result in context, the model generates its response grounded in real data.",
          },
        ]}
      />
    ),
  },
  {
    name: "NodeFlowDiagram",
    node: (
      <NodeFlowDiagram
        title="From raw text to what the model actually reads"
        height={360}
        nodes={[
          {
            id: "text",
            label: "Raw Text",
            sublabel: '"Hello, world!"',
            x: 10,
            y: 35,
            color: "gray",
            shape: "rect",
            emoji: "📝",
          },
          {
            id: "bpe",
            label: "BPE Tokenizer",
            sublabel: "Byte-pair encoding",
            x: 36,
            y: 35,
            color: "violet",
            shape: "rect",
            size: "lg",
            emoji: "✂️",
          },
          {
            id: "tokens",
            label: "Token Strings",
            sublabel: '"Hello", ",", " world"…',
            x: 62,
            y: 35,
            color: "teal",
            shape: "rect",
            emoji: "🔤",
          },
          {
            id: "ids",
            label: "Token IDs",
            sublabel: "[15496, 11, 995…]",
            x: 86,
            y: 35,
            color: "amber",
            shape: "rect",
            emoji: "🔢",
          },
          {
            id: "window",
            label: "Context Window",
            sublabel: "Max tokens the model holds",
            x: 86,
            y: 78,
            color: "blue",
            shape: "hex",
            size: "lg",
            emoji: "🪟",
          },
        ]}
        edges={[
          { from: "text", to: "bpe", animated: true, stepNumber: 1 },
          { from: "bpe", to: "tokens", animated: true, stepNumber: 2 },
          { from: "tokens", to: "ids", animated: true, stepNumber: 3 },
          { from: "ids", to: "window", animated: true, stepNumber: 4, label: "fills up to limit" },
        ]}
        steps={[
          {
            id: "s1",
            label: "Step 1 — Raw text enters",
            description: "Your string enters the tokenization pipeline exactly as typed.",
            highlightNodes: ["text"],
            highlightEdges: [],
          },
          {
            id: "s2",
            label: "Step 2 — BPE splits into tokens",
            description: "The tokenizer applies Byte-Pair Encoding rules learned from training data.",
            highlightNodes: ["bpe", "tokens"],
            highlightEdges: ["text→bpe", "bpe→tokens"],
          },
          {
            id: "s3",
            label: "Step 3 — Tokens mapped to integers",
            description: 'Each token string maps to a fixed integer ID in the vocabulary.',
            highlightNodes: ["tokens", "ids"],
            highlightEdges: ["tokens→ids"],
          },
          {
            id: "s4",
            label: "Step 4 — IDs fill the context window",
            description:
              "The integer sequence is placed into the context window — the hard limit for one call.",
            highlightNodes: ["ids", "window"],
            highlightEdges: ["ids→window"],
          },
        ]}
      />
    ),
  },
  {
    name: "ParameterSlider",
    node: (
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
            examples: ["The cat sat on the mat.", "The cat sat on the mat.", "The cat sat on the mat."],
            colorClassName: "bg-violet-500 dark:bg-violet-400",
          },
          {
            max: 1.2,
            description: "Balanced creativity",
            examples: temperatureExamples,
            colorClassName: "bg-teal-500 dark:bg-teal-400",
          },
          {
            description: "Highly random and creative",
            examples: [
              "The cat composed a sonnet on the mat.",
              "The cat moonwalked across a velvet mat.",
            ],
            colorClassName: "bg-amber-500 dark:bg-amber-400",
          },
        ]}
      />
    ),
  },
  {
    name: "AttentionHeatmap",
    node: (
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
    ),
  },
  {
    name: "ConceptStepper",
    node: <ConceptStepper steps={ragConceptStepperSteps} title="RAG pipeline walkthrough" />,
  },
  {
    name: "ContextLimitSimulator",
    node: (
      <ContextLimitSimulator
        title="Contract review tool: watch the context window fill up — then see the fix"
        caption="Press Next Step to advance. Watch the token bar and running total update at each stage."
        windowSize={128000}
        steps={[...contextLimitStepsFixture]}
      />
    ),
  },
  {
    name: "CompactCommandSimulator",
    node: (
      <CompactCommandSimulator
        title="/compact — compress terminal context into a summary handoff"
        caption="Prev / Next below. On the compressing step, a scan runs and blocks collapse; the next step shows the summary row."
        windowSize={200000}
        steps={[
          {
            id: "c1",
            label: "Step 1 — Fresh session",
            caption: "Empty window; nothing in the stack yet.",
            blocks: [],
            tokenCount: 0,
            sideNote: "0 / 200,000 tokens",
            phase: "normal",
          },
          {
            id: "c2",
            label: "Step 2 — Context loaded",
            caption: "Files, tests, and chat turns add tokens.",
            blocks: [
              { id: "a", label: "Source files read", tokens: 12000, color: "teal" },
              { id: "b", label: "Test output", tokens: 4000, color: "amber" },
            ],
            tokenCount: 16000,
            sideNote: "16,000 / 200,000 — room to work",
            phase: "normal",
          },
          {
            id: "c3",
            label: "Step 3 — Run /compact",
            caption: "Scan and collapse the stacked context.",
            blocks: [
              { id: "a", label: "Source files read", tokens: 12000, color: "teal" },
              { id: "b", label: "Test output", tokens: 4000, color: "amber" },
            ],
            tokenCount: 16000,
            sideNote: "Compressing…",
            phase: "compressing",
          },
          {
            id: "c4",
            label: "Step 4 — Summary only",
            caption: "A small summary block replaces the raw transcript.",
            blocks: [
              {
                id: "sum",
                label: "Compact summary (goals, files, next steps)",
                tokens: 2400,
                color: "blue",
              },
            ],
            tokenCount: 2400,
            sideNote: "✅ 2,400 / 200,000 — continuity preserved",
            phase: "compacted",
          },
        ]}
      />
    ),
  },
  {
    name: "ContextWindowFiller",
    node: (
      <ContextWindowFiller
        title="What fills the context window — toggle blocks on and off"
        caption="Toggle each block to see how different content types compete for the same fixed space"
        windowSize={128000}
        costPer1kTokens={0.003}
        blocks={[
          {
            id: "system",
            label: "System prompt",
            tokens: 420,
            color: "gray",
            defaultOn: true,
            icon: "⚙️",
            description: "Instructions, persona, constraints",
          },
          {
            id: "few-shot",
            label: "Few-shot examples",
            tokens: 2800,
            color: "violet",
            defaultOn: false,
            icon: "📋",
            description: "3 example input/output pairs",
          },
          {
            id: "history",
            label: "Conversation history",
            tokens: 14000,
            color: "amber",
            defaultOn: false,
            icon: "💬",
            description: "10 turns of back-and-forth",
          },
          {
            id: "message",
            label: "Current message",
            tokens: 180,
            color: "blue",
            defaultOn: true,
            icon: "✏️",
            description: "The user's current question",
          },
        ]}
      />
    ),
  },
  {
    name: "DataFlowDiagram",
    node: (
      <DataFlowDiagram
        title="Tool-using agent loop"
        caption="A compact 4-node loop for explaining iterative agent behaviour."
        nodes={[
          { id: "user", label: "User", x: 10, y: 52, color: "gray" },
          {
            id: "llm-a",
            label: "LLM",
            sublabel: "reason",
            x: 38,
            y: 26,
            color: "violet",
            active: true,
          },
          { id: "tool", label: "Tool", sublabel: "search", x: 66, y: 52, color: "teal" },
          { id: "llm-b", label: "LLM", sublabel: "respond", x: 88, y: 26, color: "amber" },
        ]}
        edges={[
          { from: "user", to: "llm-a", label: "prompt" },
          { from: "llm-a", to: "tool", label: "call" },
          { from: "tool", to: "llm-b", label: "result", color: "fill-teal-500 dark:fill-teal-400" },
          { from: "llm-b", to: "user", label: "answer", color: "fill-amber-500 dark:fill-amber-400" },
        ]}
        highlightPath={["user", "llm-a", "tool", "llm-b"]}
      />
    ),
  },
  {
    name: "DualPhaseFlow",
    node: (
      <DualPhaseFlow
        title="Medical research RAG — 40,000 trial documents to a cited answer"
        caption="Indexing runs once at setup. Every researcher question runs the query phase in milliseconds."
        leftPhase={{
          label: "Index (setup)",
          frequency: "Runs once at deployment",
          frequencyDetail: "40,000 PDFs produce ~800,000 chunks. Takes hours but only ever runs once.",
          color: "violet",
          steps: [
            { id: "docs", label: "40,000 trial documents", sublabel: "PDFs covering 20 years", icon: "📋" },
            {
              id: "chunk-med",
              label: "Chunk into 500-token segments",
              sublabel: "~800,000 total chunks",
              icon: "✂️",
            },
            {
              id: "bio-embed",
              label: "Biomedical embedding model",
              sublabel: "Fine-tuned on medical text",
              icon: "🧬",
            },
          ],
        }}
        rightPhase={{
          label: "Query (per researcher)",
          frequency: "Runs on every question",
          frequencyDetail: "Same biomedical model embeds the question before similarity search.",
          color: "teal",
          steps: [
            {
              id: "researcher-q",
              label: "Researcher question",
              sublabel: "What were the adverse events in Phase 2 trial?",
              icon: "🔬",
            },
            { id: "vec-search", label: "Top 5 chunks retrieved", sublabel: "Vector search", icon: "🔍" },
            {
              id: "llm-answer",
              label: "LLM generates cited answer",
              sublabel: "According to Trial NCT-2847...",
              icon: "📝",
            },
          ],
        }}
        artifact={{
          label: "Vector database",
          sublabel: "800,000 chunk vectors. Searched in milliseconds.",
          icon: "🗃️",
        }}
      />
    ),
  },
  {
    name: "EmbeddingSearchSimulator",
    node: <EmbeddingSearchSimulator {...embeddingSearchFixture} />,
  },
  {
    name: "ConceptCompare",
    node: (
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
    ),
  },
  {
    name: "MiniPlayground",
    node: (
      <MiniPlayground
        title="Prompt simulation"
        caption="A tiny prompt playground for showing input-output transformation."
        simulationFn={(input) => `LLM processed: ${input.toUpperCase()}`}
        hint="This simulation uppercases the text so you can focus on the interaction pattern."
      />
    ),
  },
  {
    name: "Vector2DPlot",
    node: (
      <Vector2DPlot
        title="Semantic clusters in embedding space"
        caption="Drag the query point around to see which cluster becomes closest."
        points={vectorPoints}
      />
    ),
  },
  {
    name: "TokenProbDist",
    node: (
      <TokenProbDist
        title='Next-token candidates after "The cat sat on the"'
        caption="Sampling controls reshape the distribution before a token is drawn."
        candidates={tokenCandidates}
        showTopP
        defaultTemperature={1}
        defaultTopP={0.9}
        highlightTop={2}
      />
    ),
  },
  {
    name: "PipelineTrack",
    node: (
      <PipelineTrack
        title="Request path through the stack"
        caption="The token advances one hop at a time (Input → Embed → …), pausing at each station so the forward path reads clearly."
        nodes={[
          {
            id: "in",
            label: "Input",
            sublabel: "User query + system prompt as raw text.",
            color: "gray",
          },
          {
            id: "embed",
            label: "Embed",
            sublabel: "Text → token IDs → dense vectors the model can score.",
            color: "violet",
          },
          {
            id: "retrieve",
            label: "Retrieve",
            badge: "External KB",
            sublabel: "Vector search pulls chunks; they are merged into context before generation.",
            color: "teal",
          },
          {
            id: "gen",
            label: "Generate",
            sublabel: "Transformer forward pass + sample loop emits the answer tokens.",
            color: "amber",
          },
        ]}
        lines={[
          { nodes: ["in", "embed", "retrieve", "gen"], color: "#8b5cf6", label: "RAG path" },
        ]}
      />
    ),
  },
  {
    name: "StepSequence",
    node: (
      <StepSequence
        title="What tools can wrap — four examples of the same pattern"
        caption="Click any step to expand — the tool is always a thin wrapper around something that already exists"
        orientation="horizontal"
        steps={[
          {
            number: 1,
            phase: "REST API",
            title: "get_weather(city)",
            detail:
              "Wraps a call to a weather API. Your function hits the API, gets JSON back, returns the result.",
            color: "violet",
            icon: "🌤️",
          },
          {
            number: 2,
            phase: "Database",
            title: "get_customer_orders(id)",
            detail:
              "Wraps a SQL query to your orders database. Your function runs the query, returns the rows.",
            color: "teal",
            icon: "🗄️",
          },
          {
            number: 3,
            phase: "Service",
            title: "send_notification(user, msg)",
            detail: "Wraps an internal notification microservice.",
            color: "amber",
            icon: "📨",
          },
          {
            number: 4,
            phase: "Code",
            title: "run_python(code)",
            detail: "Wraps a sandboxed Python executor.",
            color: "blue",
            icon: "⚙️",
          },
        ]}
      />
    ),
  },
  {
    name: "LayerStack",
    node: (
      <LayerStack
        title="Inside a transformer block"
        caption="Click layers to read how data flows through the stack."
        layers={[
          {
            id: "norm1",
            label: "Layer Norm",
            sublabel: "Stabilize activations",
            color: "gray",
            detail: "Normalizes inputs before attention so training stays stable.",
          },
          {
            id: "attn",
            label: "Multi-head attention",
            sublabel: "Q, K, V",
            color: "violet",
            detail: "Each token attends to all tokens; outputs are mixed context-aware vectors.",
          },
          {
            id: "ff",
            label: "Feed-forward",
            sublabel: "MLP",
            color: "teal",
            detail: "Per-token nonlinearity — where most parameters live.",
          },
        ]}
      />
    ),
  },
  {
    name: "AnnotatedCode",
    node: (
      <AnnotatedCode
        title="A well-defined tool in Python — Anthropic SDK format"
        caption="Click a callout number to highlight the corresponding line"
        code={`tools = [
  {
    "name": "get_order_status",
    "description": (
      "Look up the current status of a specific customer order "
      "by order ID. Use this when the user asks about a specific "
      "order, shipment, or delivery. Returns: status, estimated "
      "delivery date, and tracking number."
    ),
    "input_schema": {
      "type": "object",
      "properties": {
        "order_id": {
          "type": "string",
          "description": "The unique order ID, e.g. ORD-12345"
        }
      },
      "required": ["order_id"]
    }
  }
]`}
        annotations={[
          { line: 3, label: "Tool name", description: "What your code calls this function.", color: "violet" },
          {
            line: 4,
            label: "Description",
            description: "What the model reads to decide when to call this tool.",
            color: "teal",
          },
          {
            line: 10,
            label: "Input schema",
            description: "JSON Schema for arguments the model must provide.",
            color: "amber",
          },
        ]}
      />
    ),
  },
  {
    name: "TrainingLoopSimulator",
    node: (
      <TrainingLoopSimulator
        title="Watch the model learn — probability of 'Paris' rises as training runs"
        caption="Click Start Training to run through 80 epochs. Watch the loss fall and the distribution sharpen toward the correct answer."
      />
    ),
  },
  {
    name: "AutoregressiveDemo",
    node: (
      <AutoregressiveDemo
        title="Inference: a full Q&A generated token by token"
        caption="Click 'Step Into' to reveal the next-token probabilities, then click it again to append the chosen token."
        question="What is the capital of France?"
        contextPrefix="The capital of France is"
        tokens={["Paris", ",", " which", " is", " also", " France", "'s", " largest", " city", "."]}
        topCandidates={[
          { step: 0, candidates: [{ token: "Paris", prob: 0.91 }, { token: "Lyon", prob: 0.04 }] },
          { step: 1, candidates: [{ token: ",", prob: 0.65 }, { token: ".", prob: 0.2 }] },
        ]}
      />
    ),
  },
  {
    name: "TransformerLogitsExplainer",
    node: (
      <TransformerLogitsExplainer
        title="Logits → softmax → probability distribution"
        caption="Step through how raw model scores become the next-token probabilities."
        candidates={[
          { token: "Paris", logit: 9.2, rawProb: 0.91 },
          { token: "Lyon", logit: 3.1, rawProb: 0.04 },
          { token: "a", logit: 1.8, rawProb: 0.02 },
          { token: "the", logit: 1.4, rawProb: 0.01 },
        ]}
      />
    ),
  },
  {
    name: "InferenceWalkthrough",
    node: (
      <InferenceWalkthrough
        title="End-to-end: from question to answer"
        caption="Step through each stage of a real LLM inference call."
        question="What is the capital of France?"
        answer="The capital of France is Paris."
        logitCandidates={[
          { token: "Paris", logit: 9.2, rawProb: 0.91 },
          { token: "Lyon", logit: 3.1, rawProb: 0.04 },
          { token: "a", logit: 1.8, rawProb: 0.02 },
        ]}
      />
    ),
  },
  {
    name: "LiveTokenizer",
    node: (
      <LiveTokenizer
        title="Type any text — see how the tokenizer splits it into chips"
        caption="Each colored chip is one token. Click any chip to see its integer ID."
      />
    ),
  },
  {
    name: "ThinkingModeSimulator",
    node: (
      <ThinkingModeSimulator
        title="Same prompt — watch fast mode and thinking mode race side by side"
        caption="Press Play to run both simultaneously."
      />
    ),
  },
  {
    name: "ChatReplay",
    node: (
      <ChatReplay
        title="Support agent without vs with episodic memory"
        caption="Toggle between the two — notice how the agent changes when it can access past interaction records."
      />
    ),
  },
  {
    name: "MemoryOrchestrator",
    node: (
      <MemoryOrchestrator
        title="Toggle each memory type ON/OFF — watch how the agent response degrades"
        caption="All four memory types active by default. Disable each one and run the message to see what the agent loses."
      />
    ),
  },
  {
    name: "ChunkVisualizer",
    node: (
      <ChunkVisualizer
        title="Drag the sliders — watch the document split and overlap shift in real time"
        caption="Adjust chunk size and overlap to see how they trade off."
      />
    ),
  },
  {
    name: "ParallelToolRunner",
    node: (
      <ParallelToolRunner
        title="Watch all three tools fire simultaneously — then receive one combined answer"
        caption="Toggle between Parallel and Sequential modes, then click Run to see the time difference."
      />
    ),
  },
  {
    name: "AlgorithmStepper",
    node: (
      <AlgorithmStepper
        title="Step through sorting & searching algorithms"
        caption="Switch between Bubble Sort (O(n²)) and Binary Search (O(log n)). Use Step or Play to animate each comparison and swap."
        defaultAlgorithm="bubble"
      />
    ),
  },
  {
    name: "CallStackVisualizer",
    node: (
      <CallStackVisualizer
        title="Recursion under the hood — fib(5) call stack"
        caption="Step through each recursive call to see frames push and pop. Watch the stack grow then unwind as results bubble back up."
      />
    ),
  },
  {
    name: "NeuralNetworkForwardPass",
    node: (
      <NeuralNetworkForwardPass
        title="Forward pass through a feedforward neural network"
        caption="Click 'Run Forward Pass' to watch the signal propagate layer by layer. Each node shows its activation value."
        layers={[3, 4, 4, 2]}
        inputLabels={["Feature 1", "Feature 2", "Feature 3"]}
        outputLabels={["Class A", "Class B"]}
      />
    ),
  },
  {
    name: "GradientDescentSimulator",
    node: (
      <GradientDescentSimulator
        title="Gradient descent on a 2D loss surface"
        caption="Switch learning rates to see slow convergence, smooth convergence, oscillation, and divergence. Use Step or Play to animate."
        defaultLearningRate={0.15}
      />
    ),
  },
  {
    name: "PromptAnatomyVisualizer",
    node: (
      <PromptAnatomyVisualizer
        title="Anatomy of a production LLM prompt"
        caption="Click any section to expand it. Each block has a role, raw content, and a token count. The bar shows the token budget split."
      />
    ),
  },
  {
    name: "ApiLifecycleFlow",
    node: (
      <ApiLifecycleFlow
        title="HTTP request lifecycle — from fetch() to JSON response"
        caption="Click 'Send Request' to animate each hop. Click any stage node for a detailed explanation."
        method="GET"
        path="/api/users/42"
        statusCode={200}
      />
    ),
  },
  {
    name: "TabbedCodeExplorer",
    node: (
      <TabbedCodeExplorer
        title="Multi-file code explorer — RAG pipeline example"
        caption="Click tabs to switch files. Toggle the ⊞ icon to open the file tree. Highlighted lines show the key API calls."
        showFileTree={false}
      />
    ),
  },
  {
    name: "CodeEvolutionStepper",
    node: (
      <CodeEvolutionStepper
        title="How code evolves — from naive loop to O(1) lookup"
        caption="Step through 4 versions of the same function. Green lines are additions. Click any version tab to jump directly."
      />
    ),
  },
  // ── OS / Networking / Distributed-systems ────────────────────────────────
  {
    name: "PacketJourneyVisualizer",
    node: (
      <PacketJourneyVisualizer
        title="How a packet travels through the OSI model"
        caption="Click ▶ Play to animate encapsulation (sender) → transmission → decapsulation (receiver). Click any layer band for details."
      />
    ),
  },
  {
    name: "ConsensusSimulator",
    node: (
      <ConsensusSimulator
        title="Raft consensus — leader election & log replication"
        caption="Click 'Start Election' to watch timers deplete, a candidate emerge, and a leader win majority. Then 'Add Entry' or 'Inject Partition'."
        nodeCount={5}
      />
    ),
  },
  {
    name: "ProcessSchedulerViz",
    node: (
      <ProcessSchedulerViz
        title="OS CPU scheduling — Gantt timeline visualizer"
        caption="Switch between FIFO, SJF, Round Robin, and Priority. Step through one time unit at a time or Play to auto-animate."
        defaultAlgorithm="RoundRobin"
        quantum={2}
      />
    ),
  },
  {
    name: "MemoryLayoutExplorer",
    node: (
      <MemoryLayoutExplorer
        title="Process address space — stack, heap, BSS, data, text"
        caption="Click 'Call function' to push stack frames, 'malloc()' to grow the heap. Trigger a stack overflow by calling too many functions."
      />
    ),
  },
  {
    name: "MutexRaceDetector",
    node: (
      <MutexRaceDetector
        title="Race condition vs. mutex — shared counter demo"
        caption="Step through instructions one at a time. Move the context-switch point to create the race. Then enable Mutex to fix it."
      />
    ),
  },
  // ── Data Structures / Databases / Auth / Systems ─────────────────────────
  {
    name: "BTreeExplorer",
    node: (
      <BTreeExplorer
        title="B-tree — insert, search, and delete with live split animation"
        caption="Type a key and press Insert / Search / Delete. Watch traversal paths highlight amber, splits bubble up, and the tree rebalance."
        order={3}
        initialValues={[10, 20, 5, 6, 12, 30, 7, 17]}
      />
    ),
  },
  {
    name: "TransactionIsolationSim",
    node: (
      <TransactionIsolationSim
        title="SQL transaction isolation — dirty reads, non-repeatable reads, phantoms"
        caption="Step through the interleaved T1 / T2 timeline. Switch isolation levels to see what each transaction actually reads — and which anomalies appear."
        defaultLevel="ReadUncommitted"
      />
    ),
  },
  {
    name: "OAuthFlowStepper",
    node: (
      <OAuthFlowStepper
        title="OAuth 2.0 Authorization Code flow with JWT anatomy"
        caption="Click 'Start' to walk through each hop. After the token exchange step, decode the JWT to inspect header, payload claims, and signature."
        defaultGrantType="AuthorizationCode"
      />
    ),
  },
  {
    name: "MessageQueueSim",
    node: (
      <MessageQueueSim
        title="Message queue — producers, consumers, backpressure, and dead-letter queue"
        caption="Publish messages manually or enable Auto mode. Kill a consumer to watch lag build. Enable 'Sim. failures' to see messages route to the DLQ."
        queueCapacity={10}
        consumerCount={2}
      />
    ),
  },
  {
    name: "RateLimiterVisualizer",
    node: (
      <RateLimiterVisualizer
        title="Rate limiting — Token Bucket, Sliding Window, and Fixed Window"
        caption="Switch algorithms and adjust the incoming rate slider. Click 'Send Burst' to fire 20 requests at once and observe throttling behavior."
        defaultAlgorithm="TokenBucket"
        requestsPerSecond={5}
        burstCapacity={10}
      />
    ),
  },
];
