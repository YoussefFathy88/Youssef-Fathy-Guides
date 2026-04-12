# Session MDX component gallery
## Project: Joee's GenAI from the Ground Up

---

## Role of this file

`docs/component-gallery.md` is the **authoritative catalog** of every custom component available in session MDX: what it is for, and the prop shapes you may pass from `.mdx` files.

- **Session structure** (six sections, frontmatter, narrative rules) lives in [`session-template.md`](session-template.md).
- **Truth in code:** components are registered in `app/sessions/[slug]/page.tsx` (`getMdxComponents`). If this doc disagrees with TypeScript, fix the doc.
- **Visual QA:** run the app and open `/component-gallery` for live previews.

### Keep this document in sync

Whenever you **add, remove, rename, or change props** on any component exposed to session MDX, update **this file in the same change** as the code (see [`CLAUDE.md`](../CLAUDE.md)).

---

## Quick chooser

| Teaching need | Component |
|---|---|
| Section wrapper (required six blocks) | `SessionSection` |
| Term recap table (section 5 only) | `RecapTable` |
| Link card to next episode (section 6 only) | `NextSessionCard` |
| Tool-use / agent loop with actor lanes | `AgentLoopStepper` |
| Grouped graph + scripted step-through | `NodeFlowDiagram` |
| Arbitrary directed graph, clickable detail | `DataFlowDiagram` |
| Left-to-right pipeline tracks + motion | `PipelineTrack` |
| Numbered phases / narrative steps | `StepSequence` |
| Vertical stack of layers (transformer block, etc.) | `LayerStack` |
| Code with line callouts | `AnnotatedCode` |
| Two-way compare (panels or rows) | `ConceptCompare` |
| Carousel steps with rich visuals | `ConceptStepper` (TSX-only `visual`; prefer `StepSequence` in MDX) |
| Discrete slider / states with examples | `ParameterSlider` |
| Attention matrix | `AttentionHeatmap` |
| 2D embedding / cluster plot | `Vector2DPlot` |
| Next-token distribution + temperature / top-p | `TokenProbDist` |
| Typed prompt → simulated output | `MiniPlayground` (no function props from MDX) |
| Toggle blocks that fill context budget | `ContextWindowFiller` |
| Step story: context overflow → fix | `ContextLimitSimulator` |
| Claude Code `/compact` compression story | `CompactCommandSimulator` |
| Index vs query phases + shared artifact | `DualPhaseFlow` |
| Ticket/text → embed → route walkthrough | `EmbeddingSearchSimulator` |
| Training dynamics (loss + distribution) | `TrainingLoopSimulator` |
| Token-by-token generation demo | `AutoregressiveDemo` |
| Logits → softmax | `TransformerLogitsExplainer` |
| Full inference story | `InferenceWalkthrough` |
| Live tokenizer chips | `LiveTokenizer` |
| Fast vs thinking mode | `ThinkingModeSimulator` |
| Two conversation scenarios | `ChatReplay` |
| Four memory toggles | `MemoryOrchestrator` |
| Chunk size / overlap on text | `ChunkVisualizer` |
| Parallel vs sequential tools | `ParallelToolRunner` |
| Sorting / searching algorithm step-through | `AlgorithmStepper` |
| Function call stack push/pop (recursion) | `CallStackVisualizer` |
| Feedforward neural network forward pass | `NeuralNetworkForwardPass` |
| Loss landscape + gradient descent ball | `GradientDescentSimulator` |
| Color-coded prompt sections with token counts | `PromptAnatomyVisualizer` |
| HTTP request/response hop animation | `ApiLifecycleFlow` |
| Multi-file tabbed code viewer | `TabbedCodeExplorer` |
| Code evolution (version-by-version with diff) | `CodeEvolutionStepper` |
| OSI model packet encapsulation / decapsulation | `PacketJourneyVisualizer` |
| Raft consensus — election + log replication | `ConsensusSimulator` |
| OS CPU scheduling Gantt timeline (FIFO/SJF/RR/Priority) | `ProcessSchedulerViz` |
| Process address space (stack/heap/BSS/data/text) | `MemoryLayoutExplorer` |
| Race condition vs mutex — shared counter demo | `MutexRaceDetector` |
| B-tree with animated insert/search/delete and splits | `BTreeExplorer` |
| SQL transaction isolation levels (dirty/non-repeatable/phantom) | `TransactionIsolationSim` |
| OAuth 2.0 Authorization Code flow with JWT decoder | `OAuthFlowStepper` |
| Message queue with producers, consumers, backpressure, DLQ | `MessageQueueSim` |
| Rate limiting: Token Bucket / Sliding Window / Fixed Window | `RateLimiterVisualizer` |
| RNN hidden-state signal decay with animated bars + ghost line | `HiddenStateDecayDiagram` |
| RNN unrolled over time — h₀→hₙ chain, ŷ heads, one column per token (Prev/Next) | `RNNUnrolledOverview` |
| RNN walkthrough — short declarative clause, survival into h₇, next-token autocomplete | `RNNWorkingExample` |
| RNN failure vs Transformer — slot after includes, Cairo decay, Alexandria vs the, arcs to slot | `RNNFailureDemo` |
| Positional encoding — swap tokens, sine-by-index sketch, meaning+position bars | `PositionalEncodingVisualizer` |
| Encoder or decoder sub-stack — pills; **surface-panel** chrome; stack blocks use `surface-strong` + left accents from site tokens (`--purple`, `--success`, `--warning`) | `TransformerSubstackExplorer` |
| Self-attention Q/K/V score explorer — click a token, watch bars animate | `SelfAttentionScoreExplorer` |
| Full Transformer pipeline walkthrough — stage cards + internal chip trays + step panel | `TransformerPipelineWalkthrough` |
| Three-panel side-by-side token animation showing Base → Instruct → Aligned model responses | `ModelBehaviorEvolution` |

**`DataFlowDiagram` vs `PipelineTrack`:** use `DataFlowDiagram` for non-linear graphs with arbitrary edges; use `PipelineTrack` for ordered left-to-right pipelines.

**`ContextWindowFiller` vs `LiveTokenizer`:** `ContextWindowFiller` is budget toggles and cost, not tokenization animation. Use `LiveTokenizer` to teach BPE/token chips.

---

## Summary table

| Component | Type | One-line description |
|---|---|---|
| `SessionSection` | Shell | Wraps one of the six session sections (`id` + `label` + children). |
| `RecapTable` | Shell | Glossary rows for the recap section. |
| `NextSessionCard` | Shell | CTA card linking to the next session slug. |
| `AgentLoopStepper` | Interactive | Step-through tool loop (user / model / your-code). |
| `NodeFlowDiagram` | Diagram | Nodes, edges, optional groups, scripted `steps`. |
| `ParameterSlider` | Interactive | Slider with `states` driving copy and styling. |
| `AttentionHeatmap` | Interactive | Token × token attention weights. |
| `ConceptStepper` | Interactive | Multi-step carousel; `visual` is TSX-only. |
| `ContextLimitSimulator` | Interactive | Stepped token bar story; optional `layout: "stack"` + `stackPhase` for compress sweep and summary in the same flow. |
| `CompactCommandSimulator` | Interactive | Step-through `/compact`: token bar, stacked blocks, compress sweep, summary handoff. |
| `ContextWindowFiller` | Interactive | Toggle context blocks against `windowSize`. |
| `DataFlowDiagram` | Diagram | Positioned nodes and edges, optional `highlightPath`. |
| `DualPhaseFlow` | Diagram | Two phases + central artifact (e.g. index vs query). |
| `EmbeddingSearchSimulator` | Interactive | Preset/query → stages: tokenize, embed, compare, route. |
| `ConceptCompare` | Interactive | Two panels or row-driven compare; `mode` / `layout`. |
| `MiniPlayground` | Interactive | Input/output playground (no `simulationFn` from MDX). |
| `Vector2DPlot` | Interactive | Draggable 2D semantic plot. |
| `TokenProbDist` | Interactive | Sampling UI over next-token candidates. |
| `PipelineTrack` | Diagram | Stations and animated lines between node ids. |
| `PositionalEncodingVisualizer` | Interactive | Three-step mini-lesson: token swap, positional wave, schematic embedding+position sum. |
| `StepSequence` | Interactive | Phased steps or narrative steps; optional `autoPlay` (narrative). |
| `LayerStack` | Interactive | Clickable vertical stack of layers. |
| `AnnotatedCode` | Interactive | Code string + line `annotations`. |
| `TrainingLoopSimulator` | Interactive | Animated training loop / distribution. |
| `AutoregressiveDemo` | Interactive | Scripted autoregressive token steps. |
| `TransformerLogitsExplainer` | Interactive | Logit table → softmax narrative. |
| `InferenceWalkthrough` | Interactive | End-to-end inference stages. |
| `LiveTokenizer` | Interactive | Type text → token chips (built-in tokenizer demo). |
| `ThinkingModeSimulator` | Interactive | Fast vs thinking mode side-by-side. |
| `ChatReplay` | Interactive | Two chat scenarios (e.g. with/without memory). |
| `MemoryOrchestrator` | Interactive | Toggle memory types and run message. |
| `ChunkVisualizer` | Interactive | Chunk boundaries and overlap on sample text. |
| `ParallelToolRunner` | Interactive | Parallel vs sequential tool timing. |
| `AlgorithmStepper` | Interactive | Animated array bars for sorting/searching algorithms. |
| `CallStackVisualizer` | Interactive | Push/pop frame animation with pseudo-code highlight. |
| `NeuralNetworkForwardPass` | Diagram | SVG feedforward network with layer-by-layer pulse animation. |
| `GradientDescentSimulator` | Interactive | 2D loss landscape contour + animated gradient descent ball. |
| `PromptAnatomyVisualizer` | Interactive | Expandable prompt sections with token budget bar. |
| `ApiLifecycleFlow` | Interactive | HTTP request hop animation (Client→DNS→TLS→Server→DB→Response). |
| `TabbedCodeExplorer` | Interactive | Tabbed multi-file code viewer with optional file tree sidebar. |
| `CodeEvolutionStepper` | Interactive | Paged code versions with green/red diff line markers. |
| `PacketJourneyVisualizer` | Interactive | Animates OSI-layer encapsulation on sender → wire → decapsulation on receiver. |
| `ConsensusSimulator` | Interactive | Raft election + heartbeat + log replication with partition injection. |
| `ProcessSchedulerViz` | Interactive | Gantt timeline for FIFO / SJF / Round Robin / Priority with per-tick step controls. |
| `MemoryLayoutExplorer` | Interactive | Virtual address space with dynamic stack frames, heap allocs, and overflow warning. |
| `MutexRaceDetector` | Interactive | Shared-counter race condition vs mutex; step-through, interleave slider, 100-run histogram. |
| `BTreeExplorer` | Interactive | B-tree with frame-animated insert (with splits), search, and delete. Order and initial values configurable. |
| `TransactionIsolationSim` | Interactive | Scripted T1/T2 timeline, per-level read results, anomaly banners, and prevention summary table. |
| `OAuthFlowStepper` | Interactive | Step-through OAuth flow (Authorization Code / Client Credentials / Implicit) with JWT anatomy panel. |
| `MessageQueueSim` | Interactive | Producer, slot queue, multi-consumer progress bars, backpressure, Kill Consumer, DLQ on failure. |
| `RateLimiterVisualizer` | Interactive | Token Bucket / Sliding Window / Fixed Window with live request stream, burst button, and rate slider. |
| `HiddenStateDecayDiagram` | Interactive | Animated bar chart showing RNN hidden-state signal decay token-by-token, with ghost reference line and Play/Pause/Reset. |
| `RNNUnrolledOverview` | Interactive | Unrolled RNN strip: start h₀, per-timestep RNN cell + word + ŷₙ, orange hidden-state arrows, teal active column; Prev/Next + dots + step panel. |
| `RNNWorkingExample` | Interactive | Three tabs: read “The capital of Egypt is Cairo.” with hₜ panel, survival-into-h₇ bars (stagger on tab), next-token chips (Cairo, then “.”) with probabilities. |
| `RNNFailureDemo` | Interactive | Strip with ? slot after includes (before Egyptian Museum); decay bars; RNN Alexandria ✗ vs the ✓ with fragment lines; Transformer arcs to slot. |
| `SelfAttentionScoreExplorer` | Interactive | Click any token to see its Query question and attention scores over all other tokens; bars animate in with stagger. |
| `TransformerPipelineWalkthrough` | Interactive | Horizontal stage cards with internal chip trays, token strip, step panel, and Prev/Next controls for full Transformer pipeline story. |
| `TransformerSubstackExplorer` | Interactive | Encoder or decoder: muted pills (purple / warning tints); **Full** stack and focus panel use `globals.css` surfaces and token-colored left accents—not saturated Tailwind primaries. Illustrations in `transformer-substack-illustrations.tsx` match the same tokens. |

---

## Component reference

Props mirror `components/shared/*.tsx`, `components/session/*`, and `getMdxComponents`. Markers: **TSX only** = do not pass from MDX.

### SessionSection

**Description:** One section of the lesson; must use canonical `id` values with `SessionSection` from the template.

```ts
interface SessionSectionProps {
  id: string;
  label: string;
  children: React.ReactNode;
}
```

### RecapTable

**Description:** Renders term/definition rows (section 5).

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

**Description:** Next episode CTA (section 6).

```ts
interface NextSessionCardProps {
  title: string;
  slug: string;
  teaser: string;
  module: number;
}
```

### AgentLoopStepper

**Description:** Tool-use loop with messages per actor.

```ts
interface LoopStep {
  id: string;
  actor: "user" | "model" | "your-code";
  label: string;
  bubble: string;
  detail: string;
}

interface AgentLoopStepperProps {
  title?: string;
  caption?: string;
  steps: LoopStep[];
}
```

### NodeFlowDiagram

**Description:** Rich flow canvas with optional `groups` and `steps`. `highlightEdges` in each step use `"from→to"`. `sublabel` on nodes is for authoring notes and is not shown on the canvas. Edge `stepNumber` is accepted for backwards compatibility but is **not rendered** (no on-connector badges); use scripted `steps` and the footer controls for ordering.

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
  anchor?: "top" | "right" | "bottom" | "left" | "center";
  priority?: number;
  lane?: string;
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
  diagramId?: string;
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

### ParameterSlider

**Description:** Teaching slider; use `states` from MDX. Ranges can use consecutive `max` thresholds or discrete `value` + `label`.

```ts
interface ParameterSliderState {
  value?: number;
  max?: number;
  label?: string;
  description: string;
  highlight?: string;
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
  outputFn?: (value: number) => string; // TSX only
  outputExamples?: (value: number) => string[]; // TSX only
  colorFn?: (value: number) => string; // TSX only
}
```

### AttentionHeatmap

**Description:** Square attention matrix; click row labels.

```ts
interface AttentionHeatmapProps {
  tokens?: string[];
  weights?: number[][];
  colorRamp?: "amber" | "violet" | "teal";
  title?: string;
  caption?: string;
}
```

### ConceptStepper

**Description:** Step carousel. **`visual` is `ReactNode` — not serializable from MDX;** author in TSX or use `StepSequence` / other components in MDX.

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

### ContextLimitSimulator

**Description:** Stepped narrative with token blocks and optional error/reset. Steps can use `layout: "stack"` with `stackPhase` (`warning` → `compressing` → `compacted`) to show a Claude Code–style compress sweep and summary handoff in the same flow as segmented-bar steps.

```ts
type TokenBlock = {
  id: string;
  label: string;
  tokens: number;
  color: "rose" | "gray" | "amber" | "teal" | "blue" | "violet";
};

type ContextLimitLayout = "track" | "stack";
type ContextStackPhase = "default" | "warning" | "compressing" | "compacted";

type ContextLimitStep = {
  id: string;
  label: string;
  caption: string;
  blocks: TokenBlock[];
  sideNote: string | null;
  errorState: boolean;
  resetBar: boolean;
  /** `"stack"` = thin budget bar + stacked rows, compress sweep, summary (default: `"track"` segmented bar). */
  layout?: ContextLimitLayout;
  /** When `layout` is `"stack"`, sets bar tint and compress/summary animation. */
  stackPhase?: ContextStackPhase;
};

interface ContextLimitSimulatorProps {
  title: string;
  caption: string;
  windowSize: number;
  steps: ContextLimitStep[];
}
```

### CompactCommandSimulator

**Description:** Stepped narrative for Claude Code-style `/compact`: token budget bar, stacked context blocks, compressing scan + collapse, then a compact summary row. Tailwind-only animations (no Framer Motion). Step 0 is visible immediately (no “start” click required).

```ts
type CompactPhase = "normal" | "warning" | "compressing" | "compacted";

type CompactBlock = {
  id: string;
  label: string;
  tokens: number;
  color: "rose" | "gray" | "amber" | "teal" | "blue" | "violet";
};

type CompactStep = {
  id: string;
  label: string;
  caption: string;
  blocks: CompactBlock[];
  tokenCount: number;
  sideNote: string;
  phase: CompactPhase;
};

interface CompactCommandSimulatorProps {
  title: string;
  caption: string;
  windowSize: number;
  steps: CompactStep[];
}
```

### ContextWindowFiller

**Description:** Toggle slices of context against a max window and optional cost.

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

### DataFlowDiagram

**Description:** Flow graph with optional `nodeDetailMode` for how details show.

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

### DualPhaseFlow

**Description:** Side-by-side phases (e.g. offline index vs online query) with a shared artifact.

```ts
interface PhaseStep {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

interface StoredArtifact {
  label: string;
  sublabel?: string;
  icon?: string;
}

interface PhaseConfig {
  label: string;
  frequency: string;
  frequencyDetail?: string;
  color: "violet" | "teal" | "amber" | "blue" | "rose" | "gray";
  steps: PhaseStep[];
}

interface DualPhaseFlowProps {
  title?: string;
  caption?: string;
  leftPhase: PhaseConfig;
  rightPhase: PhaseConfig;
  artifact: StoredArtifact;
}
```

### EmbeddingSearchSimulator

**Description:** Manual stage advance: tokenize → embed → similarity → route (deterministic demo).

```ts
interface EmbeddingSearchStage {
  id: string;
  label: string;
  description: string;
}

interface EmbeddingSearchCategory {
  id: string;
  label: string;
  centroidLabel: string;
  color: "blue" | "amber" | "red" | "teal" | "violet";
  icon: string;
}

interface EmbeddingSearchSimulatorProps {
  title: string;
  caption: string;
  placeholder: string;
  presets: string[];
  categories: EmbeddingSearchCategory[];
  stages: EmbeddingSearchStage[];
}
```

### ConceptCompare

**Description:** Compare two panels (`left` / `right`) or use `rows` for staged row reveal. `layout` aliases `mode`.

```ts
interface ComparePanel {
  label: string;
  description?: string;
  visual?: React.ReactNode;
  points?: string[];
  color?: "violet" | "teal" | "amber" | "gray" | "rose" | "blue";
}

interface CompareRow {
  id: string;
  leftTitle: string;
  leftBody: string;
  leftDetail?: string;
  rightTitle: string;
  rightBody: string;
  rightDetail?: string;
}

interface ConceptCompareProps {
  left?: ComparePanel;
  right?: ComparePanel;
  mode?: "side-by-side" | "toggle";
  layout?: "side-by-side" | "toggle";
  title?: string;
  caption?: string;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: "violet" | "teal" | "amber" | "gray" | "rose" | "blue";
  rightColor?: "violet" | "teal" | "amber" | "gray" | "rose" | "blue";
  rows?: CompareRow[];
}
```

### MiniPlayground

**Description:** Prompt in → output out. **`simulationFn` is TSX only** (no functions from MDX).

```ts
interface MiniPlaygroundProps {
  placeholder?: string;
  inputLabel?: string;
  outputLabel?: string;
  simulationFn?: (input: string) => string; // TSX only
  debounceMs?: number;
  showCharCount?: boolean;
  maxLength?: number;
  outputClassName?: string;
  title?: string;
  caption?: string;
  hint?: string;
}
```

### Vector2DPlot

**Description:** 2D plot with optional distances and cluster legend.

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

### TokenProbDist

**Description:** Next-token bar chart + optional temperature / top-p controls.

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

### PipelineTrack

**Description:** Two rendering modes. **SVG animation mode** (`nodes` + `lines`): stations per `TrackLine.nodes` (ids); solid lines use a segment-by-segment forward token (travel + dwell per hop). **Stations mode** (`stations`): simple clickable HTML cards laid out horizontally with arrows; clicking a card expands a detail panel — ideal for teaching pipeline stages without animation. Do not mix both modes on the same instance.

```ts
interface TrackNode {
  id: string;
  label: string;
  sublabel?: string;
  /** Small pill above the station (e.g. external knowledge at Retrieve). */
  badge?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
}

interface TrackLine {
  nodes: string[];
  color: string;
  label?: string;
  dashed?: boolean;
}

/** Used in stations mode only — no nodes/lines required. */
interface PipelineStation {
  id: string;
  label: string;
  sublabel?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
  detail: string;  // shown in the detail panel when this station is clicked
}

interface PipelineTrackProps {
  /** SVG animation mode */
  nodes?: TrackNode[];
  lines?: TrackLine[];
  /** Stations mode — if provided, nodes/lines are ignored */
  stations?: PipelineStation[];
  title?: string;
  caption?: string;
}
```

### StepSequence

**Description:** Either phased steps (`number`, `phase`, …) or narrative steps (`id`, `label`, `description`, …). Do not mix shapes in one array. `autoPlay` applies to narrative lists only.

```ts
interface SequenceStep {
  number: number;
  phase: string;
  title: string;
  detail: string;
  icon?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
}

interface NarrativeSequenceStep {
  id: string;
  label: string;
  description: string;
  highlight?: "shared" | "inside" | "outside" | "contrast";
  detail: string;
  /** Fades in after animated floats finish when `animateDetail` is true. */
  detailNote?: string;
  /** When true, expanding reveals float literals in `detail` left-to-right (~60ms apart); unrevealed show `···`. Defaults to false. */
  animateDetail?: boolean;
}

interface StepSequenceProps {
  steps?: SequenceStep[] | NarrativeSequenceStep[];
  title?: string;
  caption?: string;
  orientation?: "horizontal" | "vertical";
  autoPlay?: boolean;
}
```

### LayerStack

**Description:** Click a layer to expand detail.

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

### AnnotatedCode

**Description:** `code` string plus numbered `annotations` (1-based `line`).

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

### TrainingLoopSimulator

**Description:** Animated training / distribution convergence (built-in demo data).

```ts
interface TrainingLoopSimulatorProps {
  title?: string;
  caption?: string;
}
```

### AutoregressiveDemo

**Description:** Scripted tokens + optional per-step candidate rows.

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

### TransformerLogitsExplainer

**Description:** Walk from logits to probabilities for listed candidates.

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

### InferenceWalkthrough

**Description:** Narrated stages from question to final answer. The **Network forward (to logits)** stage lists four static rows (raw text → tokenize → embed → transformer); the transformer row notes that **logits** are its output, without duplicating the dedicated Logits / Softmax stages.

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

### LiveTokenizer

**Description:** Interactive tokenizer chip view (uses built-in examples + typing).

```ts
interface LiveTokenizerProps {
  title?: string;
  caption?: string;
}
```

### ThinkingModeSimulator

**Description:** Compare fast vs thinking-mode behavior (built-in scenario).

```ts
interface ThinkingModeSimulatorProps {
  title?: string;
  caption?: string;
}
```

### ChatReplay

**Description:** Two scenarios with message timelines. Prefer scenario `label` text; `leftLabel` / `rightLabel` exist on the type but may not be shown in UI—verify in component if you rely on them.

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

### MemoryOrchestrator

**Description:** Built-in four-memory-type lab; optional title/caption.

```ts
interface MemoryOrchestratorProps {
  title?: string;
  caption?: string;
}
```

### ChunkVisualizer

**Description:** Built-in passage; optional title/caption.

```ts
interface ChunkVisualizerProps {
  title?: string;
  caption?: string;
}
```

### ParallelToolRunner

**Description:** Built-in parallel vs sequential tool timing demo.

```ts
interface ParallelToolRunnerProps {
  title?: string;
  caption?: string;
}
```

---

### AlgorithmStepper

**Description:** Animated array-bar visualization for sorting and searching algorithms. Supports Bubble Sort (O(n²)) and Binary Search (O(log n)) with step-through or auto-play.

```ts
interface AlgorithmStepperProps {
  title?: string;
  caption?: string;
  defaultAlgorithm?: "bubble" | "binary";  // default: "bubble"
}
```

---

### CallStackVisualizer

**Description:** Step-through call stack with pseudo-code line highlighting. Ships with a Fibonacci recursion demo. Frames animate in/out as they push and pop.

```ts
interface StackFrame {
  id: string;
  fn: string;
  args?: string;
  locals?: string;
  returnValue?: string;
  state: "active" | "waiting" | "returning";
}

interface CallStackStep {
  id: string;
  frames: StackFrame[];
  highlightCode: string;  // substring of a pseudo-code line to highlight
  description: string;
}

interface CallStackVisualizerProps {
  title?: string;
  caption?: string;
  steps?: CallStackStep[];       // defaults to Fibonacci demo
  autoPlay?: boolean;            // default: false
  autoPlayMs?: number;           // default: 2200
}
```

---

### NeuralNetworkForwardPass

**Description:** SVG feedforward neural network with layer-by-layer pulse animation. No external dependencies — pure framer-motion + SVG.

```ts
interface NeuralNetworkForwardPassProps {
  title?: string;
  caption?: string;
  layers?: number[];         // neuron counts per layer, e.g. [3, 4, 4, 2]
  inputLabels?: string[];    // labels beside input nodes
  outputLabels?: string[];   // labels beside output nodes
}
```

---

### GradientDescentSimulator

**Description:** 2D loss landscape (contour plot via SVG ellipses) with an animated dot following gradient descent steps. Learning rate selector shows slow/fast/oscillating/diverging behaviour.

```ts
interface GradientDescentSimulatorProps {
  title?: string;
  caption?: string;
  defaultLearningRate?: number;  // one of 0.05 | 0.15 | 0.40 | 0.85
}
```

---

### PromptAnatomyVisualizer

**Description:** Color-coded expandable blocks for each prompt section (system, context, examples, user). Shows a token budget bar across all parts.

```ts
type PromptPartColor = "violet" | "teal" | "amber" | "blue" | "rose" | "gray";

interface PromptPart {
  id: string;
  role: string;          // e.g. "system", "user", "context", "examples"
  label: string;
  content: string;
  description: string;
  tokenCount?: number;
  color?: PromptPartColor;
}

interface PromptAnatomyVisualizerProps {
  title?: string;
  caption?: string;
  parts?: PromptPart[];  // defaults to a customer-support prompt demo
}
```

---

### ApiLifecycleFlow

**Description:** Animated HTTP request lifecycle: Client → DNS → TLS → Server → Database → Response. Click any node for a detail panel. Ships with a GET /api/users/42 demo.

```ts
interface ApiStage {
  id: string;
  label: string;
  icon: string;
  detail: string;
  latencyMs?: number;
  badge?: string;
}

interface ApiLifecycleFlowProps {
  title?: string;
  caption?: string;
  method?: string;       // default: "GET"
  path?: string;         // default: "/api/users/42"
  statusCode?: number;   // default: 200
  stages?: ApiStage[];   // defaults to 6-stage GET demo
  autoPlay?: boolean;    // default: false
}
```

---

### TabbedCodeExplorer

**Description:** Multi-file tabbed code viewer with syntax highlighting (no external parser), optional file-tree sidebar, and per-file line highlighting.

```ts
interface ExplorerFile {
  id: string;
  filename: string;
  language?: string;          // "python" | "typescript" | "javascript" | "sql" | "json" | etc.
  code: string;
  description?: string;
  highlightLines?: number[];  // 1-based line numbers to highlight in amber
}

interface TabbedCodeExplorerProps {
  title?: string;
  caption?: string;
  files?: ExplorerFile[];     // defaults to a 3-file RAG pipeline demo
  defaultFile?: string;       // id of the file to show first
  showFileTree?: boolean;     // default: false
}
```

---

### CodeEvolutionStepper

**Description:** Paged navigator through code versions. Each stage shows a code block with green (+) / red (−) diff markers on changed lines and a description of what changed and why.

```ts
interface EvolutionStage {
  id: string;
  label: string;
  description: string;
  code: string;
  language?: string;
  addedLines?: number[];    // 1-based line numbers to mark green
  removedLines?: number[];  // 1-based line numbers to mark red
  highlightLines?: number[];// 1-based line numbers to mark amber (no +/-)
}

interface CodeEvolutionStepperProps {
  title?: string;
  caption?: string;
  stages?: EvolutionStage[]; // defaults to 4-stage search function demo
  autoPlay?: boolean;        // default: false
  autoPlayMs?: number;       // default: 3000
}
```

---

### PacketJourneyVisualizer

**Description:** Animates a packet travelling down the 7 OSI layers on the sender side (encapsulation — each layer adds a header, the packet block grows), across a wire, then back up on the receiver side (decapsulation — each layer strips its header). Clicking any layer band opens a detail panel. Play / Pause / Step / Reset controls.

```ts
interface PacketJourneyVisualizerProps {
  title?: string;
  caption?: string;
}
```

---

### ConsensusSimulator

**Description:** Raft consensus simulator. N nodes are shown as SVG circles with election-timer arcs. The first timer to expire triggers a scripted election: RequestVote arrows, VoteGranted arrows, leader elected in amber. The leader sends periodic Heartbeat arrows. "Add Entry" replicates to followers (cells turn teal when committed). "Inject Partition" splits nodes into two groups behind dashed borders; the minority side never commits.

```ts
interface ConsensusSimulatorProps {
  title?: string;
  caption?: string;
  nodeCount?: number; // default 5 (max 5 for best layout)
}
```

---

### ProcessSchedulerViz

**Description:** Gantt-timeline CPU scheduler. Computes the full schedule upfront for the selected algorithm, then animates through time units at 600 ms/unit. Color blocks show which process runs at each tick; idle periods appear as gray. Metrics (avg wait, avg turnaround, CPU utilization, context switches) update instantly when the algorithm tab changes.

```ts
type SchedulerAlgorithm = "FIFO" | "SJF" | "RoundRobin" | "Priority";

interface SchedulerProcess {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;       // lower number = higher priority; used by Priority algo
  color: string;           // Tailwind bg color class, e.g. "bg-violet-500"
}

interface ProcessSchedulerVizProps {
  title?: string;
  caption?: string;
  processes?: SchedulerProcess[];       // defaults to 4 preset processes
  defaultAlgorithm?: SchedulerAlgorithm; // default "FIFO"
  quantum?: number;                      // Round Robin time quantum, default 2
}
```

---

### MemoryLayoutExplorer

**Description:** Vertical virtual-address-space bar divided into Stack (rose), Gap (dashed), Heap (teal), BSS (amber), Data (blue), Text (violet). Hex addresses are shown on the left. "Call function" pushes an animated frame onto the stack, "malloc()" appends a heap block, "Return" pops the top frame. Segments touch → stack-overflow warning pulses. Click any segment for a description panel.

```ts
interface MemoryLayoutExplorerProps {
  title?: string;
  caption?: string;
}
```

---

### MutexRaceDetector

**Description:** Two-thread race-condition demo. Thread A and Thread B each execute LOAD / INC / STORE on a shared counter. In **No Lock** mode an interleave-point selector (0=after LOAD, 1=after INC, 2=after STORE) shows how the counter ends at 1 instead of 2. Toggling **Enable Mutex** serialises execution so the counter always reaches 2. "Step →" advances one instruction at a time with a colour-coded execution trace. "Run 100×" runs the current mode 100 times and renders a bar-chart histogram of final counter values.

```ts
interface MutexRaceDetectorProps {
  title?: string;
  caption?: string;
}
```

---

### BTreeExplorer

**Description:** Animated B-tree. Insert traces the traversal path (amber), then inserts the key into the leaf, then bubbles splits upward frame by frame (showing promoted keys, new root when needed). Search highlights the traversal path and marks the key green (found) or red (not found). Delete from leaf handles underflow with rotation or merge. Speed selector (slow / medium / fast). Frame scrubber bar + ← / → step controls. "Reset" restores initial values.

```ts
interface BTreeExplorerProps {
  title?: string;
  caption?: string;
  order?: number;           // max keys per node, default 3
  initialValues?: number[]; // pre-inserted keys, default [10,20,5,6,12,30,7,17]
}
```

---

### TransactionIsolationSim

**Description:** Scripted T1 / T2 interleaved timeline on a 3-row `accounts` table. "Next Step →" advances one operation at a time. Each read cell shows the value T1 actually sees under the active isolation level. Anomalies (Dirty Read, Non-Repeatable Read) appear as red warning banners. Under Serializable, T2's write shows "WAITING for T1 lock". A summary table at the bottom shows which anomalies each level prevents.

```ts
type IsolationLevel = "ReadUncommitted" | "ReadCommitted" | "RepeatableRead" | "Serializable";

interface TransactionIsolationSimProps {
  title?: string;
  caption?: string;
  defaultLevel?: IsolationLevel; // default "ReadCommitted"
}
```

---

### OAuthFlowStepper

**Description:** Step-through OAuth 2.0 flow with four actor columns (User/Browser, Client App, Auth Server, Resource Server). Each step highlights the relevant actors, draws an animated arrow, and shows the HTTP method + endpoint. Three grant types: Authorization Code (8 steps), Client Credentials (4 steps), Implicit (4 steps). After the token-exchange step, a JWT anatomy panel appears showing the encoded token in three colored segments; clicking "Decode →" reveals the decoded header and payload with field descriptions.

```ts
type OAuthGrantType = "AuthorizationCode" | "ClientCredentials" | "Implicit";

interface OAuthFlowStepperProps {
  title?: string;
  caption?: string;
  defaultGrantType?: OAuthGrantType; // default "AuthorizationCode"
}
```

---

### MessageQueueSim

**Description:** Message queue simulator with a Producer panel (Publish button, Auto-publish toggle, Simulate Failures checkbox), a horizontal slot queue, and per-consumer progress bars. When the queue is full the Publish button turns red with "Queue Full — backpressure applied". "Kill Consumer" removes the last alive worker, building visible lag. Messages that fail 3 times route to a Dead Letter Queue row. Metrics bar shows Published, Consumed, Queue Depth, Consumer Lag.

```ts
interface MessageQueueSimProps {
  title?: string;
  caption?: string;
  queueCapacity?: number;  // default 10
  consumerCount?: number;  // default 2
}
```

---

### RateLimiterVisualizer

**Description:** Three rate-limiting algorithm tabs. **Token Bucket**: fill-level meter with animated drip, token dots visualisation. **Sliding Window**: rolling timeline with a highlighted 1-second window; requests plotted as teal (allowed) or red (throttled) bars. **Fixed Window**: three window slots; thundering-herd note at boundary. Request stream shows last 30 requests as coloured bubbles. Rate slider (1–20 req/s). "Send Burst" fires 20 requests instantly. Live counters: Allowed, Throttled, Allow Rate, Tokens/Slots left.

```ts
type RateLimitAlgorithm = "TokenBucket" | "SlidingWindow" | "FixedWindow";

interface RateLimiterVisualizerProps {
  title?: string;
  caption?: string;
  defaultAlgorithm?: RateLimitAlgorithm; // default "TokenBucket"
  requestsPerSecond?: number;            // refill rate / window limit, default 5
  burstCapacity?: number;                // Token Bucket max tokens, default 10
}
```

---

### RNNUnrolledOverview

**Description:** Teaches the unrolled RNN picture on a short sentence (default **The capital of Egypt is Cairo**). Each timestep is one column: next-token scores **ŷₙ** (dashed link), **RNN step n** box, input word below; **h₀** at the start and **h₁…hₙ** on orange arrows between columns. **Prev / Next** and step dots change the active column (teal highlight); a panel shows `stepDescriptions[i]`. Same weights every step — only hidden vector and input change.

```ts
interface RNNUnrolledOverviewProps {
  title?: string;
  caption?: string;
  tokens?: string[];           // default six-word sentence
  stepDescriptions?: string[]; // one per token; must align length with tokens when both are set from MDX
}
```

---

### HiddenStateDecayDiagram

**Description:** Animated bar chart illustrating RNN hidden-state signal decay. Tokens are laid out horizontally; pressing Play advances one token at a time at 1.1-second intervals, growing each bar to its `decayHeights[i]` value with a CSS cubic-bezier height transition. A dashed ghost line persists at the first token's original height after token 0 activates, providing a visual reference for how far the signal has fallen. Step dots below the controls track progress; clicking any dot jumps to that step. Play/Pause/Reset/Replay controls. No framer-motion.

```ts
interface HiddenStateDecayDiagramProps {
  title?: string;
  caption?: string;
  tokens: string[];               // e.g. ["The","cat","sat","on","the","mat"]
  decayHeights: number[];         // bar height in px at that step (max 88px container)
  colors: ("teal"|"amber"|"rose"|"violet"|"gray"|"blue")[];  // one per token
  sublabels: string[];            // shown under token word when active, e.g. "full signal"
  stepDescriptions: string[];     // one per token — shown in description panel below controls
}
```

---

### RNNWorkingExample

**Description:** Self-contained “RNN works” demo for the short clause `The capital of Egypt is Cairo.` **Tab 1:** seven token chips (including `.`) with Prev/Next + dots; active chip teal border/fill; panel shows hₜ and copy about building a declarative fact. **Tab 2:** seven survival-into-h₇ bars (stagger on each tab visit). **Tab 3 — Next-token prediction:** after the prefix `… Egypt is`, two purple chips (`Cairo`, `.`) step with probabilities; active chip scales 1.05 + teal % badge.

```ts
interface RNNWorkingExampleProps {
  title?: string;
  caption?: string;
}
```

---

### RNNFailureDemo

**Description:** Token strip includes a dashed **`?` slot** after `includes` (before `Egyptian` / `Museum`). Step 0 shows full-sense prose; steps ≥1 show a teal cue: prediction is **immediately after “includes”**. Five pills → decay bars on Cairo milestones → RNN **`Alexandria` ✗** vs **`the` ✓** with monospace continuation fragments → Transformer arcs to the **slot** (Cairo, Egypt, includes → `?`). Pills use explicit light/dark text contrast on tinted backgrounds.

```ts
interface RNNFailureDemoProps {
  title?: string;
  caption?: string;
}
```

---

### PositionalEncodingVisualizer

**Description:** Client-only explainer with three internal steps (pills + Prev/Next): (1) swap two middle tokens to motivate order, (2) draw a simple sine-like curve over position indices, (3) animate three schematic bars for meaning, position, and sum. Respects reduced motion (no path/bar animation). Optional `autoPlay` advances steps on a timer.

```ts
interface PositionalEncodingVisualizerProps {
  title?: string;
  caption?: string;
  /** Token row for the order demo; needs length ≥ 3 (swaps indices 1 and 2). */
  tokens?: string[];
  initialStep?: number;       // 0–2
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
}
```

---

### TransformerSubstackExplorer

**Description:** Vertical stack diagram for **one** Transformer layer (`variant: "encoder" | "decoder"`). Topic pills select a **focus**. Styling aligns with the app shell: outer **`surface-panel`**, inner stack/focus areas use **`--surface-strong`** blocks with **`border-white/10`**, **2px left accents** mapped to **`--purple`** (attention), **`--success`** (add/norm), **`--warning`** (FFN), **slate** (input). Active stack block rings use **`--primary`** (encoder) or **`--warning`** (decoder) at low opacity; pills use translucent fills, not solid `violet-600` / `amber-600`. Non-overview focuses: thin left accent, title + sub + optional body, **tall illustration well** (`bg-white/[0.04]`). **`transformer-substack-illustrations.tsx`** uses the same CSS variables and slate text for minis. Encoder: self-attention → add/norm → FFN → add/norm. Decoder: input → masked self-attention → add/norm → cross-attention → add/norm → FFN → add/norm. `layerCount` affects the “× layers” copy and the layer-stack animation.

```ts
type TransformerSubstackVariant = "encoder" | "decoder";

interface TransformerSubstackExplorerProps {
  variant: TransformerSubstackVariant;
  title?: string;
  caption?: string;
  layerCount?: number;  // default 6 — used in layers-focus copy
}
```

---

### SelfAttentionScoreExplorer

**Description:** Click any token button to see its Query question and attention scores toward all other tokens. Score bars animate in left-to-right with a 60ms stagger using CSS width transitions. Bar color: ≥0.25 → teal, ≥0.12 → amber, <0.12 → gray, self-attention → always gray. Scores are displayed as integer percentages. A relationship label (strong/related/weak/distant/self) sits after each bar. The `defaultSelected` token is pre-loaded on mount so the component is never empty.

```ts
interface AttentionScoreRow {
  token: string;
  scores: number[];  // must sum to 1.0; one per token
}

interface SelfAttentionScoreExplorerProps {
  title?: string;
  caption?: string;
  tokens: string[];
  queries: string[];              // one query question per token
  attentionRows: AttentionScoreRow[];  // one row per token
  defaultSelected?: number;       // pre-selected token index (default: 0)
}
```

---

### TransformerPipelineWalkthrough

**Description:** Full-pipeline walkthrough with four UI zones. **Token chip strip**: input sentence chips light up (teal) when the active stage processes tokens (`tok`/`emb`/`enc`/`dec`); output token chip fades in with probability badge on the final step. **Pipeline row**: horizontal stage cards connected by chevron arrows; active stage gets a color-tinted border + expanded internal chip tray (max-height CSS transition); clicking any stage card jumps to the first step for that stage. **Step panel**: step N-of-M counter, step label, description. **Controls**: Prev/Next buttons + clickable step dots.

```ts
interface PipelineInternal {
  label: string;   // chip label shown in the tray
  detail: string;  // (stored for future use; not currently rendered in a tooltip)
}

interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  color: "gray"|"teal"|"violet"|"amber"|"blue"|"rose";
  internals: PipelineInternal[];  // shown as chips when this stage is active
}

interface PipelineStep {
  id: string;
  label: string;              // step title in the panel
  description: string;        // full explanation text
  activeStageId: string;      // which stage card to highlight
  activeInternalId: string | null;  // which internal chip to highlight (null = none)
}

interface TransformerPipelineWalkthroughProps {
  title?: string;
  caption?: string;
  inputText: string;          // split by spaces → token chips
  outputToken: string;        // appears on the final step with a probability badge
  stages: PipelineStage[];
  steps: PipelineStep[];
}
```

---

### ModelBehaviorEvolution

**Description:** Three-panel side-by-side component that animates the same prompt through three LLM training checkpoints (Base → Instruct → Aligned). A shared prompt box sits above three equal-width panels. On "▶ Run Pipeline", stages animate sequentially: tokens append one at a time (200 ms interval) with a blinking cursor; the active panel gets a colored glowing border while inactive panels dim to 40% opacity; when a stage completes its explanation strip fades in. After all three stages finish, the button switches to "↺ Replay". Resting state shows empty panels with placeholder text.

```ts
type BadgeColor = "gray" | "teal" | "amber" | "violet" | "rose" | "blue";

interface ModelBehaviorStage {
  label: string;        // panel header, e.g. "Base Model (Pre-training only)"
  badgeColor: BadgeColor;
  explanation: string;  // explanation strip shown after stage completes — complete the sentence "This output happened because…"
  tokens: string[];     // full token sequence to animate, one element per token
}

interface ModelBehaviorEvolutionProps {
  title: string;
  caption: string;
  prompt: string;               // the single shared prompt shown above all panels
  stages: ModelBehaviorStage[]; // exactly 3 items: Base → Instruct → Aligned
}
```
