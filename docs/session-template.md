# Session MDX Template
## Project: Joee's GenAI from the Ground Up

---

## Canonical Role of This File

`docs/session-template.md` is the single source of truth for session authoring and component prop syntax.
Do not rely on a separate `references/component-props.md` file.

Whenever a shared component API changes, update this document in the same change so the session maker expert stays in sync.

---

## How it Works

Each session is one `.mdx` file. Components are injected by the session registry, so no MDX imports are needed.
Session pages own only their content. Navigation, ordering, and library metadata come from `data/sessions.ts`.

Every new session requires both steps:
1. Create `content/sessions/module-{N}/{index}-{slug}.mdx`
2. Add the matching entry to `data/sessions.ts`

---

## Canonical Modules

| Module | moduleName |
|---|---|
| 1 | The Engine Room |
| 2 | Giving the Brain Capabilities |
| 3 | From Capability to Agency |
| 4 | Shipping to Production |

---

## Canonical Slugs

| ID | Slug | Title | Module |
|---|---|---|---|
| E01 | how-llms-work | How LLMs Work | 1 |
| E02 | tokens-context-window | Tokens & Context Window | 1 |
| E03 | embeddings | Embeddings | 1 |
| E04 | transformer-attention | Transformer & Attention | 1 |
| E05 | how-llms-think | How LLMs Think | 1 |
| E06 | agent-memory-types | Agent Memory Types | 2 |
| E07 | rag | RAG | 2 |
| E08 | tools-and-function-calling | Tools & Function Calling | 2 |
| E09 | mcp | MCP | 2 |
| E10 | agent-skills | Agent Skills | 2 |
| E11 | context-engineering | Context Engineering | 2 |
| E12 | ai-workflows | AI Workflows | 3 |
| E13 | ai-agents | AI Agents | 3 |
| E14 | planning-in-ai-agents | Planning in AI Agents | 3 |
| E15 | tools-vs-skills-vs-mcp | Tools vs Skills vs MCP | 3 |
| E16 | human-in-the-loop | Human-in-the-Loop | 3 |
| E17 | multi-agent-systems | Multi-Agent Systems | 3 |
| E18 | guardrails-and-safety | Guardrails & Safety | 4 |
| E19 | evals | Evals | 4 |
| E20 | observability-and-tracing | Observability & Tracing | 4 |
| E21 | cost-latency-reliability | Cost, Latency & Reliability | 4 |
| E22 | prompt-engineering-vs-fine-tuning-vs-rag | Prompt Engineering vs Fine-Tuning vs RAG | 4 |

---

## Session Structure Template

```mdx
---
title: "{{ Canonical session title }}"
slug: "{{ slug from Canonical Slugs }}"
module: {{ 1 | 2 | 3 | 4 }}
moduleName: "{{ moduleName from Canonical Modules }}"
sessionNumber: {{ 1-22 }}
duration: "{{ e.g. 12 min }}"
difficulty: "{{ beginner | intermediate | advanced }}"
tags: ["tag1", "tag2", "tag3"]
nextSession: "{{ next slug from Canonical Slugs }}"
prevSession: {{ "previous-slug-from-canonical-slugs" | null }}
---

<SessionSection id="goal" label="Goal">

## {{ What the viewer will understand }}

{{ 2-3 sentences. }}

</SessionSection>

<SessionSection id="big-picture" label="Big Picture">

## {{ Where this concept fits }}

{{ 2-3 sentences. }}

<{{ Component }} title="..." caption="..." {{ ...props }} />

</SessionSection>

<SessionSection id="core-concepts" label="Core Concepts">

## {{ First concept }}

{{ 2-3 sentences. }}

<{{ Component }} title="..." caption="..." {{ ...props }} />

### {{ Second concept }}

{{ 2-3 sentences. }}

<{{ Component }} title="..." caption="..." {{ ...props }} />

</SessionSection>

<SessionSection id="practical-example" label="Practical Example">

## {{ Specific applied scenario }}

{{ 2-4 sentences. Use a concrete company or concrete workflow. }}

<{{ Component }} title="..." caption="..." {{ ...props }} />

</SessionSection>

<SessionSection id="recap" label="Recap">

## What we covered

<RecapTable
  rows={[
    { term: "Term 1", definition: "One sentence definition." },
    { term: "Term 2", definition: "One sentence definition." },
    { term: "Term 3", definition: "One sentence definition." },
    { term: "Term 4", definition: "One sentence definition." },
    { term: "Term 5", definition: "One sentence definition." },
  ]}
/>

</SessionSection>

<SessionSection id="next-session" label="Next Session">

<NextSessionCard
  title="{{ Canonical next session title }}"
  slug="{{ next slug }}"
  teaser="{{ 1-2 sentence teaser }}"
  module={{ next module number }}
/>

</SessionSection>
```

---

## Critical Rules

> [!IMPORTANT]
> Interactive-first is non-negotiable.
>
> Every visual concept that can be demonstrated interactively should use an interactive component first.
> Static diagrams are fallback components, not the default.

### Component priority

1. Purpose-built simulators:
   `TrainingLoopSimulator`, `AutoregressiveDemo`, `TransformerLogitsExplainer`, `InferenceWalkthrough`, `LiveTokenizer`, `ThinkingModeSimulator`, `ChatReplay`, `MemoryOrchestrator`, `ChunkVisualizer`, `ParallelToolRunner`
2. Interactive teaching components:
   `AttentionHeatmap`, `Vector2DPlot`, `TokenProbDist`, `ParameterSlider`, `MiniPlayground`, `ConceptCompare`, `StepSequence`, `ContextWindowFiller`, `PipelineTrack`, `LayerStack`, `AnnotatedCode`
3. Graph-style diagrams:
   `NodeFlowDiagram`, `DataFlowDiagram`
4. Pure prose only when the concept is not visual or interactive

If you are about to explain training, inference, tokenization, thinking mode, memory, chunking, or tool execution with `StepSequence` alone, stop and check whether one of the purpose-built simulators is a better fit.

### Frontmatter rules

- `slug` must match Canonical Slugs exactly
- `module` must be a number, not a quoted string
- `prevSession: null` must be unquoted for E01
- `tags` should contain at most 3 items
- Keep `moduleName`, `title`, and `sessionNumber` aligned with the canonical tables

### Content rules

- Keep the six `SessionSection` blocks in this exact order: `goal`, `big-picture`, `core-concepts`, `practical-example`, `recap`, `next-session`
- Do not write MDX import statements
- Never nest one custom component inside another custom component
- Use one component per concept block; do not place two custom components back to back without narration in between
- Keep narration blocks to 3 sentences maximum
- Use `RecapTable` only in Section 5 and no extra prose inside that section except the `## What we covered` heading
- Use `NextSessionCard` only in Section 6 and no extra prose in that section
- Section 3 should have 2-4 sub-concepts maximum
- `RecapTable` should have 5 rows maximum
- Captions should be action instructions like "Click a token..." or "Drag the slider...", not passive descriptions

### Prop safety rules

- Use double quotes for string props
- Use multiline array/object props with one item per line
- Do not pass inline functions through MDX props
- For `ParameterSlider`, use `states` instead of `outputFn`, `outputExamples`, or `colorFn`
- For `ConceptStepper`, prefer plain object props and avoid `visual` values that require inline JSX authoring unless you are editing TSX directly
- `ConceptCompare` is still part of the current component set and supports `mode="toggle"` and `mode="side-by-side"`
- `AttentionHeatmap`, `Vector2DPlot`, and `TokenProbDist` keep the prop interfaces documented below; use those exact shapes

---

## Component Chooser

Pick the most specific component that fits the concept.

| Content type | Use this component |
|---|---|
| Linear subway-style pipeline, lifecycle, retrieval path, tool path | `PipelineTrack` |
| Numbered ordered sequence where each step expands to detail | `StepSequence` |
| Stacked layers or architecture blocks | `LayerStack` |
| Code with line callouts | `AnnotatedCode` |
| Compare two concepts, two modes, or before/after behaviors | `ConceptCompare` |
| Numeric parameter with behavior states and sample outputs | `ParameterSlider` |
| Token-to-token attention matrix | `AttentionHeatmap` |
| Embedding clusters, semantic distance, nearest neighbors | `Vector2DPlot` |
| Next-token sampling distribution with temperature/top-p | `TokenProbDist` |
| User input to simulated output | `MiniPlayground` |
| Context budget composition and overflow/truncation risk | `ContextWindowFiller` |
| Arbitrary non-linear graph/topology with clickable node and edge detail | `DataFlowDiagram` |
| Step-by-step concept carousel | `ConceptStepper` |
| One-token-at-a-time training dynamics | `TrainingLoopSimulator` |
| Autoregressive generation loop with greedy vs sampled mode, or a scripted Q&A token stream | `AutoregressiveDemo` |
| Bridge raw logits to post-softmax probabilities | `TransformerLogitsExplainer` |
| Full narrated inference pass from prompt to token append | `InferenceWalkthrough` |
| Type text and inspect colored token chips + token IDs | `LiveTokenizer` |
| Fast mode vs thinking mode timing/cost/quality tradeoff | `ThinkingModeSimulator` |
| Before/after conversation replay with and without memory/retrieval | `ChatReplay` |
| Toggle memory types and watch retrieval/response quality change | `MemoryOrchestrator` |
| Chunk size + overlap tradeoffs on a real passage | `ChunkVisualizer` |
| Parallel vs sequential tool-call latency | `ParallelToolRunner` |
| Arbitrary node graph with grouped nodes and scripted walkthrough steps | `NodeFlowDiagram` |

### When `DataFlowDiagram` is appropriate

Use `DataFlowDiagram` for non-linear graphs where nodes connect in arbitrary directions and the reader needs clickable node/edge detail below the canvas.
Use `PipelineTrack` instead for ordered left-to-right pipelines.

### What `ContextWindowFiller` actually shows

`ContextWindowFiller` is a toggle-driven context budget visual, not a token-by-token typing animation.
Each block is a prompt/memory/retrieval slice with a token count. Toggling blocks fills a stacked budget bar, computes estimated input cost, and shows near-limit/over-limit warnings so the learner can see why truncation happens.

Use `LiveTokenizer` when the teaching goal is token-by-token text splitting.

---

## Component Prop Reference

These interfaces mirror the current TypeScript implementations in `components/shared`, `components/session/RecapTable.tsx`, and `components/session/NextSessionCard.tsx`.
Props that are valid in TSX but unsafe to pass through MDX are marked with `// TSX only, do not pass from MDX`.

### SessionSection

```ts
interface SessionSectionProps {
  id: string;
  label: string;
  children: React.ReactNode;
}
```

### RecapTable

```ts
interface RecapRow {
  term: string;
  definition: string;
}

interface RecapTableProps {
  rows?: RecapRow[];
}
```

### NextSessionCard

```ts
interface NextSessionCardProps {
  title: string;
  slug: string;
  teaser: string;
  module: number;
}
```

### ParameterSlider

Use `states` in MDX and do not pass function props.

```ts
interface ParameterSliderState {
  max?: number;
  description: string;
  examples?: string[];
  colorClassName?: string;
}

interface ParameterSliderProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  states?: ParameterSliderState[];
  outputFn?: (value: number) => string; // TSX only, do not pass from MDX
  outputExamples?: (value: number) => string[]; // TSX only, do not pass from MDX
  colorFn?: (value: number) => string; // TSX only, do not pass from MDX
}
```

```mdx
<ParameterSlider
  label="Temperature"
  min={0}
  max={2}
  step={0.1}
  defaultValue={1.0}
  states={[
    {
      max: 0.3,
      description: "Nearly deterministic. Good for extraction and code review.",
      examples: [
        "Same output every run.",
        "Same output every run.",
        "Same output every run.",
      ],
      colorClassName: "bg-violet-500 dark:bg-violet-400",
    },
    {
      max: 1.0,
      description: "Balanced and varied while staying coherent.",
      examples: [
        "Variation A",
        "Variation B",
        "Variation C",
      ],
      colorClassName: "bg-teal-500 dark:bg-teal-400",
    },
    {
      description: "High variance. Useful for brainstorming, risky for production.",
      examples: [
        "Unexpected output A",
        "Unexpected output B",
        "Unexpected output C",
      ],
      colorClassName: "bg-amber-500 dark:bg-amber-400",
    },
  ]}
/>
```

### PipelineTrack

```ts
interface TrackNode {
  id: string;
  label: string;
  sublabel?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
}

interface TrackLine {
  nodes: string[];
  color: string;
  label?: string;
  dashed?: boolean;
}

interface PipelineTrackProps {
  nodes: TrackNode[];
  lines: TrackLine[];
  title?: string;
  caption?: string;
}
```

```mdx
<PipelineTrack
  title="RAG has one offline index path and one online query path"
  caption="Hover each station and follow the animated query track."
  nodes={[
    { id: "docs", label: "Docs", sublabel: "Source files", color: "gray" },
    { id: "chunk", label: "Chunk", sublabel: "Split text", color: "violet" },
    { id: "embed", label: "Embed", sublabel: "Vectorize", color: "teal" },
    { id: "search", label: "Search", sublabel: "Top-k retrieval", color: "amber" },
    { id: "llm", label: "LLM", sublabel: "Grounded answer", color: "blue" },
  ]}
  lines={[
    { nodes: ["docs", "chunk", "embed", "search"], color: "#8b5cf6", label: "Index path", dashed: true },
    { nodes: ["search", "llm"], color: "#14b8a6", label: "Query path" },
  ]}
/>
```

### StepSequence

```ts
interface SequenceStep {
  number: number;
  phase: string;
  title: string;
  detail: string;
  icon?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
}

interface StepSequenceProps {
  steps?: SequenceStep[];
  title?: string;
  caption?: string;
  orientation?: "horizontal" | "vertical";
}
```

### LayerStack

```ts
interface StackLayer {
  id: string;
  label: string;
  sublabel?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
  detail: string;
}

interface LayerStackProps {
  layers: StackLayer[];
  title?: string;
  caption?: string;
  direction?: "top-to-bottom" | "bottom-to-top";
}
```

```mdx
<LayerStack
  title="Transformer block layers"
  caption="Click each layer to inspect its role."
  direction="bottom-to-top"
  layers={[
    {
      id: "embed",
      label: "Token Embedding",
      sublabel: "Input",
      color: "gray",
      detail: "Maps token IDs into dense vectors.",
    },
    {
      id: "attn",
      label: "Multi-Head Attention",
      sublabel: "Core block",
      color: "teal",
      detail: "Mixes information across token positions.",
    },
    {
      id: "ffn",
      label: "Feed Forward",
      sublabel: "Core block",
      color: "amber",
      detail: "Applies a per-token MLP after attention.",
    },
  ]}
/>
```

### AnnotatedCode

```ts
interface CodeAnnotation {
  line: number;
  label: string;
  description: string;
  color?: "violet" | "teal" | "amber" | "rose" | "blue";
}

interface AnnotatedCodeProps {
  code: string;
  language?: string;
  annotations: CodeAnnotation[];
  title?: string;
  caption?: string;
}
```

```mdx
<AnnotatedCode
  title="Tool calling in one request"
  caption="Click each numbered annotation to highlight the matching line."
  code={`const response = await client.responses.create({
  model: "gpt-4.1-mini",
  tools: [searchDocs],
  input: "Find the refund policy",
});`}
  annotations={[
    {
      line: 1,
      label: "Create response",
      description: "Starts one model call.",
      color: "violet",
    },
    {
      line: 3,
      label: "Attach tool schema",
      description: "Exposes the tool to the model.",
      color: "teal",
    },
  ]}
/>
```

### ContextWindowFiller

```ts
interface ContextBlock {
  id: string;
  label: string;
  tokens: number;
  color: "violet" | "teal" | "amber" | "blue" | "gray" | "rose";
  defaultOn?: boolean;
  icon?: string;
  description?: string;
}

interface ContextWindowFillerProps {
  title?: string;
  caption?: string;
  windowSize: number;
  costPer1kTokens?: number;
  blocks: ContextBlock[];
}
```

```mdx
<ContextWindowFiller
  title="What fills a 128k context window"
  caption="Toggle blocks to see how quickly the budget fills and when truncation begins."
  windowSize={128000}
  costPer1kTokens={0.003}
  blocks={[
    {
      id: "system",
      label: "System prompt",
      tokens: 1200,
      color: "violet",
      defaultOn: true,
      icon: "🧭",
    },
    {
      id: "history",
      label: "Chat history",
      tokens: 18000,
      color: "teal",
      defaultOn: true,
      icon: "💬",
    },
    {
      id: "retrieval",
      label: "Retrieved docs",
      tokens: 42000,
      color: "amber",
      defaultOn: false,
      icon: "📚",
    },
  ]}
/>
```

### ConceptCompare

`ConceptCompare` is still supported and is the right component for two-way comparisons.
Use `mode="toggle"` for compact before/after switches and `mode="side-by-side"` for direct contrast. On mobile, it automatically falls back to toggle mode.

```ts
interface ComparePanel {
  label: string;
  description?: string;
  visual?: React.ReactNode;
  points?: string[];
  color?: "violet" | "teal" | "amber" | "gray" | "rose" | "blue";
}

interface ConceptCompareProps {
  left?: ComparePanel;
  right?: ComparePanel;
  mode?: "side-by-side" | "toggle";
  title?: string;
  caption?: string;
}
```

```mdx
<ConceptCompare
  title="Prompt engineering vs fine-tuning"
  caption="Toggle between both options and compare setup cost, control, and ideal use case."
  mode="side-by-side"
  left={{
    label: "Prompt engineering",
    color: "violet",
    points: [
      "Fast to iterate",
      "No training job",
      "Behavior is steered at inference time",
    ],
  }}
  right={{
    label: "Fine-tuning",
    color: "teal",
    points: [
      "More stable format and tone",
      "Requires training data and training time",
      "Behavior is baked into weights",
    ],
  }}
/>
```

### AttentionHeatmap

```ts
interface AttentionHeatmapProps {
  tokens?: string[];
  weights?: number[][];
  colorRamp?: "amber" | "violet" | "teal";
  title?: string;
  caption?: string;
}
```

```mdx
<AttentionHeatmap
  title="Which tokens attend to which other tokens"
  caption="Click a row label to lock that token's attention pattern."
  tokens={["The", "cat", "sat", "down"]}
  weights={[
    [1.0, 0.6, 0.2, 0.1],
    [0.5, 1.0, 0.7, 0.2],
    [0.1, 0.8, 1.0, 0.6],
    [0.1, 0.3, 0.7, 1.0],
  ]}
  colorRamp="violet"
/>
```

### Vector2DPlot

```ts
interface PlotPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  cluster?: string;
  isQuery?: boolean;
}

interface Vector2DPlotProps {
  points?: PlotPoint[];
  showDistances?: boolean;
  showClusters?: boolean;
  title?: string;
  caption?: string;
  height?: number;
}
```

```mdx
<Vector2DPlot
  title="Embedding neighborhoods"
  caption="Drag the query point and hover a neighbor to inspect distance."
  showDistances={true}
  showClusters={true}
  height={340}
  points={[
    { id: "query", label: "Query", x: 50, y: 50, cluster: "query", isQuery: true },
    { id: "dog", label: "dog", x: 30, y: 40, cluster: "animals" },
    { id: "cat", label: "cat", x: 35, y: 52, cluster: "animals" },
    { id: "invoice", label: "invoice", x: 78, y: 30, cluster: "finance" },
  ]}
/>
```

### TokenProbDist

```ts
interface TokenCandidate {
  token: string;
  rawProb: number;
}

interface TokenProbDistProps {
  candidates?: TokenCandidate[];
  showTemperature?: boolean;
  showTopP?: boolean;
  defaultTemperature?: number;
  defaultTopP?: number;
  highlightTop?: number;
  title?: string;
  caption?: string;
}
```

```mdx
<TokenProbDist
  title="Next-token distribution"
  caption="Click Sample repeatedly, then change temperature to watch the distribution flatten or sharpen."
  showTemperature={true}
  showTopP={true}
  defaultTemperature={0.8}
  defaultTopP={0.9}
  highlightTop={2}
  candidates={[
    { token: "Paris", rawProb: 0.91 },
    { token: "Lyon", rawProb: 0.04 },
    { token: "Marseille", rawProb: 0.03 },
    { token: "Nice", rawProb: 0.02 },
  ]}
/>
```

### MiniPlayground

Do not pass `simulationFn`, `outputFn`, or any other inline function through MDX.
Use this component only with its static props unless you change the TSX implementation first.

```ts
interface MiniPlaygroundProps {
  placeholder?: string;
  inputLabel?: string;
  outputLabel?: string;
  simulationFn?: (input: string) => string; // TSX only, do not pass from MDX
  debounceMs?: number;
  showCharCount?: boolean;
  maxLength?: number;
  outputClassName?: string;
  title?: string;
  caption?: string;
  hint?: string;
}
```

### DataFlowDiagram

```ts
interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  color?: "violet" | "teal" | "amber" | "gray";
  active?: boolean;
}

interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
  color?: string;
  dashed?: boolean;
}

interface DataFlowDiagramProps {
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  height?: number;
  title?: string;
  caption?: string;
  highlightPath?: string[];
  nodeDetailMode?: "inline" | "legend" | "panel";
  solidLegendLabel?: string;
  dashedLegendLabel?: string;
}
```

### NodeFlowDiagram

Use this when you need grouped nodes plus a scripted step-through controller.
`highlightEdges` entries inside `steps` must use the exact `"from→to"` format.

```ts
type NodeColor = "violet" | "teal" | "amber" | "blue" | "rose" | "gray";
type NodeShape = "circle" | "rect" | "hex";
type NodeSize = "sm" | "md" | "lg";
type NodeFlowLayout =
  | "horizontal-flow"
  | "vertical-stack"
  | "split-lanes"
  | "hub-spoke"
  | "freeform";
type NodeFlowViewport = "presentation" | "page" | "responsive";
type NodeFlowDensity = "comfortable" | "compact";

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  shape?: NodeShape;
  size?: NodeSize;
  color?: NodeColor;
  icon?: string;
  emoji?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  stepNumber?: number;
  animated?: boolean;
  dashed?: boolean;
  bidirectional?: boolean;
  color?: NodeColor;
}

interface NodeGroup {
  id: string;
  label: string;
  nodeIds: string[];
  color?: NodeColor;
}

interface DiagramStep {
  id: string;
  label: string;
  description: string;
  highlightNodes: string[];
  highlightEdges: string[];
}

interface NodeFlowDiagramProps {
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  groups?: NodeGroup[];
  steps?: DiagramStep[];
  title?: string;
  height?: number;
  layout?: NodeFlowLayout;
  viewport?: NodeFlowViewport;
  density?: NodeFlowDensity;
}
```

### ConceptStepper

```ts
interface Step {
  title: string;
  caption: string;
  visual: React.ReactNode;
}

interface ConceptStepperProps {
  steps?: Step[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  title?: string;
}
```

### TrainingLoopSimulator

```ts
interface TrainingLoopSimulatorProps {
  title?: string;
  caption?: string;
}
```

```mdx
<TrainingLoopSimulator
  title="Watch the model learn"
  caption="Click Start Training to watch loss fall and the correct token probability rise."
/>
```

### AutoregressiveDemo

```ts
interface AutoregressiveDemoCandidate {
  token: string;
  prob: number;
}

interface AutoregressiveDemoCandidateStep {
  step: number;
  candidates: AutoregressiveDemoCandidate[];
}

interface AutoregressiveDemoProps {
  title?: string;
  caption?: string;
  question?: string;
  contextPrefix?: string;
  tokens?: string[];
  topCandidates?: AutoregressiveDemoCandidateStep[];
  autoRunDelayMs?: number;
  decisionRevealDelayMs?: number;
}
```

```mdx
<AutoregressiveDemo
  title="Inference: a full Q&A generated token by token"
  caption="Click 'Step Into' to reveal the next-token probabilities, then click it again to append the chosen token. Run plays the loop automatically."
  question="What is the capital of France?"
  contextPrefix="The capital of France is"
  tokens={["Paris", ",", " which", " is", " also", " France", "'s", " largest", " city", "."]}
  topCandidates={[
    {
      step: 0,
      candidates: [
        { token: "Paris", prob: 0.91 },
        { token: "Lyon", prob: 0.04 },
        { token: "a", prob: 0.02 },
      ],
    },
  ]}
  autoRunDelayMs={900}
  decisionRevealDelayMs={560}
/>
```

### TransformerLogitsExplainer

```ts
interface TransformerLogitCandidate {
  token: string;
  logit: number;
  rawProb: number;
}

interface TransformerLogitsExplainerProps {
  title: string;
  caption: string;
  candidates: TransformerLogitCandidate[];
}
```

```mdx
<TransformerLogitsExplainer
  title="Logits -> softmax -> probability distribution"
  caption="Step through how raw model scores become the next-token probabilities."
  candidates={[
    { token: "Paris", logit: 9.2, rawProb: 0.91 },
    { token: "Lyon", logit: 3.1, rawProb: 0.04 },
    { token: "a", logit: 1.8, rawProb: 0.02 },
  ]}
/>
```

### InferenceWalkthrough

```ts
interface InferenceWalkthroughCandidate {
  token: string;
  logit: number;
  rawProb: number;
}

interface InferenceWalkthroughProps {
  title: string;
  caption: string;
  question: string;
  answer: string;
  logitCandidates: InferenceWalkthroughCandidate[];
}
```

```mdx
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
```

### LiveTokenizer

```ts
interface LiveTokenizerProps {
  title?: string;
  caption?: string;
}
```

```mdx
<LiveTokenizer
  title="Type text and inspect token boundaries"
  caption="Click a token chip to see the token string, ID, and source character span."
/>
```

### ThinkingModeSimulator

```ts
interface ThinkingModeSimulatorProps {
  title?: string;
  caption?: string;
}
```

### ChatReplay

```ts
interface ChatMessage {
  role: "user" | "agent";
  text: string;
  context?: string;
  delay?: number;
}

interface ChatScenario {
  label: string;
  description: string;
  color: "violet" | "teal" | "amber" | "gray";
  messages: ChatMessage[];
}

interface ChatReplayProps {
  title?: string;
  caption?: string;
  scenarios?: [ChatScenario, ChatScenario];
  leftLabel?: string;
  rightLabel?: string;
}
```

`leftLabel` and `rightLabel` exist in the current TypeScript interface but are not rendered by the current component implementation, so prefer `scenarios[0].label` and `scenarios[1].label` instead.

```mdx
<ChatReplay
  title="Same user follow-up, with and without episodic memory"
  caption="Toggle both scenarios and compare what the agent can reference."
/>
```

### MemoryOrchestrator

```ts
interface MemoryOrchestratorProps {
  title?: string;
  caption?: string;
}
```

### ChunkVisualizer

```ts
interface ChunkVisualizerProps {
  title?: string;
  caption?: string;
}
```

### ParallelToolRunner

```ts
interface ParallelToolRunnerProps {
  title?: string;
  caption?: string;
}
```

---

## Validation Checklist

Before shipping a session file, verify:

- The file path matches `content/sessions/module-{N}/{index}-{slug}.mdx`
- Frontmatter title, slug, module, moduleName, and sessionNumber match the canonical tables
- `prevSession` and `nextSession` point to real canonical slugs
- The six sections exist in the required order
- No MDX import statements are present
- Every concept block has short narration before its component
- No section uses unsupported inline function props
- Every custom component prop shape matches the interfaces in this file
- `RecapTable` has at most 5 rows and appears only in Section 5
- `NextSessionCard` appears only in Section 6
