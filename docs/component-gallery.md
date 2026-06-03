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
| Animated outline for the first (Goal) slide | `SessionOutlineSlide` |
| AI Engineering Lab session overview: goal, technologies, and main concepts | `LabSessionOverview` |
| Term recap table (section 5 only) | `RecapTable` |
| Link card to next episode (section 6 only) | `NextSessionCard` |
| Tool-use / agent loop with actor lanes | `AgentLoopStepper` |
| Visual animated tool-use loop — tools as cards, model picks & fires, no raw JSON | `ToolLoopVisualizer` |
| Grouped graph + scripted step-through | `NodeFlowDiagram` |
| Two stacked lanes (prep vs run), measured arrows + scripted steps | `DualLanePipelineDiagram` |
| High-level vertical pipeline summary + side narrative panel | `MacroPipeline` |
| Multi-step story of vector creation, dimensions, and geometry | `VectorAnatomyExplorer` |
| Lab architecture — large Frontend / Backend / NFR tabs (Next+Tailwind, RAG stack, Docker·reload·.env) | `RagLabSystemArchitecture` |
| RAG lab — tree + six separate prompt tabs (one paste per file) | `RagLabPromptExplorer` |
| Legacy arbitrary directed graph (no `/component-gallery` preview — prefer `NodeFlowDiagram` for new sessions) | `DataFlowDiagram` |
| Legacy pipeline tracks / stations (no `/component-gallery` preview — prefer `NodeFlowDiagram` for new sessions) | `PipelineTrack` |
| Numbered phases / narrative steps | `StepSequence` |
| Legacy vertical stack of layers (no `/component-gallery` preview — prefer `NodeFlowDiagram` or bespoke TSX for new sessions) | `LayerStack` |
| Code with line callouts | `AnnotatedCode` |
| Two-way compare (panels or rows) | `ConceptCompare` |
| Carousel steps with rich visuals | `ConceptStepper` (TSX-only `visual`; prefer `StepSequence` in MDX) |
| Discrete slider / states with examples | `ParameterSlider` |
| Attention matrix | `AttentionHeatmap` |
| 2D embedding / cluster plot | `Vector2DPlot` |
| Straight-line graph (y = mx + c) step-through — teach mapping functions & weights | `LinearMappingGraph` |
| Linear regression training — forward pass, error, gradients, weight updates toward y=3x+2 | `LinearRegressionTrainingExplorer` |
| Chained linear layers — vanishing or exploding gradient (story prop) | `LinearChainGradientExplorer` |
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
| Animated LLM API call loop — input → model → unstructured text output, cycles examples | `LlmApiCallFlow` |
| Task-manager prompts (system/user/combined) + free vs schema output panels | `SchemaConstraintVisualizer` |
| Task manager pipeline orchestrator — prompt → provider → action with role icons | `AiTaskflowOrchestrator` |
| Compact AiDecision JSON Schema tree (lab backend contract) | `AiDecisionSchemaCompact` |
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
| RNN unrolled over time — h₀→hₙ chain, predicted next-token labels, default stops before final answer + `terminalNextToken` | `RNNUnrolledOverview` |
| RNN walkthrough — read from “is”, h₅ recency mix (newest→oldest, decays, sums to 100%), two-slot P(next token) | `RNNWorkingExample` |
| RNN failure vs Transformer — slot after includes, Cairo decay, Alexandria vs the, arcs to slot | `RNNFailureDemo` |
| Feedforward autocomplete with fixed 3-word window and failure when context leaves window | `FNNAutocompleteDemo` |
| Unrolled RNN autocomplete with hidden-state retention decay and vanishing-memory failure | `RNNAutocompleteDemo` |
| Side-by-side FNN vs RNN vs Transformer on one sentence with interactive panel activation | `ArchitectureComparisonDemo` |
| Positional encoding — swap tokens, full-width numeric PE table (no curve chart), meaning+position bars | `PositionalEncodingVisualizer` |
| Sentence → token chips → synthetic vocab IDs (Transformer teaching path) | `TransformerSentenceTokenStrip` |
| Tokens → mock embedding rows as numeric arrays (`dim` columns); optional `ids` → first column `8842 (The)` | `EmbeddingVectorsTable` |
| After attention — animated **exploding / vanishing** gradient vectors (transformer layers; optional in sessions) | `GradientInstabilityExplorer` |
| Encoder or decoder sub-stack — pills; **surface-panel** chrome; stack blocks use `surface-strong` + left accents from site tokens (`--purple`, `--success`, `--warning`) | `TransformerSubstackExplorer` |
| Self-attention explorer — built-in **The capital of Egypt is Cairo** (six tokens), **The cat sat** (three-token Q/K/V lesson), or legacy `queries`/`attentionRows` | `SelfAttentionScoreExplorer` |
| Full Transformer pipeline walkthrough — **six-phase macro strip** + stage cards, chip trays (`title` = `detail` tooltip), step panel | `TransformerPipelineWalkthrough` |
| Three-panel side-by-side token animation showing Base → Instruct → Aligned model responses | `ModelBehaviorEvolution` |
| SVG coordinate-plane step-through: y = mx + c, known points → derive weights → animate line | `LinearMappingGraph` |
| Word embedding vectors as arrows from origin — cluster hulls, click-to-inspect raw numbers, staggered entrance animation | `EmbeddingVectorExplorer` |
| Interactive angle → cosine score: two vector arrows, arc θ, dashed projection, sliders, preset word pairs | `CosineSimilarityExplorer` |
| Side-by-side keyword vs semantic search on a shared corpus — live input, score bars, animated results | `SearchQuerySimulator` |
| Word-level vs BPE tokenization — live text input, staggered token pills, step-by-step merge breakdown, three "Why BPE Wins" cards | `BytePairEncodingExplorer` |
| Six-panel animated walkthrough: Egypt sentence → CNN failure → RNN failure → Transformer success; `panel={N}` locks to one slide | `ArchitectureEvolutionAnimator` |
| Animated 6×5 pixel grid with sliding 3×3 amber filter; activates green when filter covers a vertical-edge pattern; shows kernel + output feature map | `CNNImageSuccessDemo` |
| Unrolled RNN SVG: h₀ → three cells “A” with 2×3-node mini-layers, xₜ/yₜ, amber state arrows + pulse | `RNNCellUnrolledDiagram` |

**Flow diagrams:** prefer **`NodeFlowDiagram`** for free-form grouped graphs, or **`DualLanePipelineDiagram`** for side-by-side vertical pipelines with readable connectors between compact blocks. `PipelineTrack`, `LayerStack`, and `DataFlowDiagram` remain in the MDX registry for older sessions but are **not** previewed on `/component-gallery`.

**`ContextWindowFiller` vs `LiveTokenizer`:** `ContextWindowFiller` is budget toggles and cost, not tokenization animation. Use `LiveTokenizer` to teach BPE/token chips.

---

## Summary table

| Component | Type | One-line description |
|---|---|---|
| `SessionSection` | Shell | Wraps one of the six session sections (`id` + `label` + children). |
| `LabSessionOverview` | Shell | Project-lab spec panel for goals, technologies/concepts covered, and main concepts. |
| `RecapTable` | Shell | Glossary rows for the recap section. |
| `NextSessionCard` | Shell | CTA card linking to the next session slug. |
| `RagLabSystemArchitecture` | Interactive | Tabs for Frontend / Backend / NFR; title-only cards (details left to presenter). |
| `RagLabPromptExplorer` | Shell | Wraps `TabbedCodeExplorer`: tree + Prompts 01–05 as separate tabs (no MDX props). |
| `AgentLoopStepper` | Interactive | Step-through tool loop (user / model / your-code). |
| `NodeFlowDiagram` | Diagram | Nodes, edges, optional groups, scripted `steps`. |
| `DualLanePipelineDiagram` | Diagram | Exactly two vertical lanes, compact blocks, SVG edges from layout (cross-lane + within-lane); scripted `steps` (`highlightEdges` uses `"from→to"`). Optional `presentation` for slide-sized chrome and edges above blocks. |
| `MacroPipeline` | Diagram | High-level vertical pipeline summary; left-accented glass blocks with emojis; integrated narrative side panel; supports loopback arrows. |
| `VectorAnatomyExplorer` | Diagram | Narrative walkthrough of vectors: matrix lookup visual, dimension-level meaning sliders, and semantic geometry angle plot. |
| `ParameterSlider` | Interactive | Slider with `states` driving copy and styling. |
| `AttentionHeatmap` | Interactive | Token × token attention weights. |
| `ConceptStepper` | Interactive | Multi-step carousel; `visual` is TSX-only. |
| `ContextLimitSimulator` | Interactive | Stepped token bar story; optional `layout: "stack"` + `stackPhase` for compress sweep and summary in the same flow. |
| `CompactCommandSimulator` | Interactive | Step-through `/compact`: token bar, stacked blocks, compress sweep, summary handoff. |
| `ContextWindowFiller` | Interactive | Toggle context blocks against `windowSize`. |
| `DataFlowDiagram` | Diagram | Legacy positioned nodes and edges; optional `highlightPath`. Not previewed on `/component-gallery` — prefer `NodeFlowDiagram` for new sessions. |
| `DualPhaseFlow` | Diagram | Two phases + central artifact (e.g. index vs query). |
| `EmbeddingSearchSimulator` | Interactive | Preset/query → stages: tokenize, embed, compare, route. |
| `ConceptCompare` | Interactive | Two panels or row-driven compare; `mode` / `layout`. |
| `MiniPlayground` | Interactive | Input/output playground (no `simulationFn` from MDX). |
| `Vector2DPlot` | Interactive | Draggable 2D semantic plot. |
| `TokenProbDist` | Interactive | Sampling UI over next-token candidates. |
| `PipelineTrack` | Diagram | Legacy stations / animated tracks between node ids. Not previewed on `/component-gallery` — prefer `NodeFlowDiagram`. |
| `PositionalEncodingVisualizer` | Interactive | Three-step mini-lesson: token swap, large numeric PE table only, schematic embedding+position sum + numeric stub. |
| `TransformerSentenceTokenStrip` | Interactive | Word chips aligned with monospace vocab IDs (same length arrays). |
| `EmbeddingVectorsTable` | Interactive | Mock embedding row per token; optional **`ids`** shows **`8842 (The)`** in first column — reinforces lookup by vocab ID (`dim` truncated). |
| `StepSequence` | Interactive | Phased steps or narrative steps; optional `autoPlay` (narrative). |
| `LayerStack` | Interactive | Legacy clickable vertical stack of layers. Not previewed on `/component-gallery`. |
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
| `LlmApiCallFlow` | Interactive | Animated LLM API call cycle: Input → model (with params) → text output. Auto-cycles examples, pause/play control, insight chip. |
| `SchemaConstraintVisualizer` | Interactive | Prompt tabs (system/user/combined), free vs structured output for one example. |
| `AiTaskflowOrchestrator` | Interactive | Tabbed lab pipeline with example user message, flow strip, compact **AiDecision** schema (Step 3), validated JSON example. Steps 1–4: list_tasks → prompt merge → provider → execute. |
| `AiDecisionSchemaCompact` | Diagram | Collapsed tree view of the lab `AiDecision` JSON Schema (used inside orchestrator Step 3). |
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
| `RNNUnrolledOverview` | Interactive | Unrolled RNN strip: start h₀, per-timestep RNN cell + word + predicted next token (plain label); default sentence stops before Cairo and shows Cairo as `terminalNextToken`; orange hidden-state arrows, teal active column; Prev/Next + dots + step panel. |
| `RNNWorkingExample` | Interactive | Three tabs: read clause defaulting on **“is”** + hₜ panel; **Influence in h₅** — rows **newest→oldest** with strictly decreasing illustrative weights (recency decay sketch, sum 100%, not word odds); **Next-token prediction** — two slots with dashed `?` and **P(next token)** bars. |
| `RNNFailureDemo` | Interactive | Strip with ? slot after includes (before Egyptian Museum); decay bars; RNN Alexandria ✗ vs the ✓ with fragment lines; Transformer arcs to slot. |
| `FNNAutocompleteDemo` | Interactive | Fixed 3-word sliding-window autocomplete: sentence chips, input slots, simple 3→3→1 network, and failure banner when Egypt leaves context. |
| `RNNAutocompleteDemo` | Interactive | Sequential RNN autocomplete with unrolled cells, hidden-state memory bar, retention decay table, and vanishing-memory failure at final prediction. |
| `ArchitectureComparisonDemo` | Interactive | Shared sentence with clickable FNN/RNN/Transformer panels, architecture-specific visibility/memory cues, and dynamic explanation of why predictions differ. |
| `SelfAttentionScoreExplorer` | Interactive | Default **The capital of Egypt is Cairo** (six-token); optional **`The` / `cat` / `sat`** built-in lesson (simple Q/K/V copy); softmax bars + OUTPUT box; legacy cat MDX → Cairo dataset; Cairo mounts on index **5**, three-token clamps to **sat** (index **2**) when `defaultSelected` is left at **5**. |
| `MaskedAttentionSimulator` | Interactive | Animated visualization of causal masking showing how future tokens are masked out with $-\infty$ during autoregressive generation. |
| `PositionalEncodingMotivation` | Interactive | Step-by-step example showing why positional encoding is needed before visualizing the math. |
| `TransformerPipelineWalkthrough` | Interactive | **`surface-panel`** shell; **macro strip** (six phases from `activeStageId`); token strip + stage row themed with **`--primary` / `--success` / `--purple`** etc.; internal chips use **`PipelineInternal.detail`** as native **`title`** tooltip; larger type and controls. |
| `TransformerSubstackExplorer` | Interactive | Encoder or decoder: muted pills (purple / warning tints); **Full** stack and focus panel use `globals.css` surfaces and token-colored left accents—not saturated Tailwind primaries. Illustrations in `transformer-substack-illustrations.tsx` match the same tokens. |
| `EmbeddingVectorExplorer` | Interactive | SVG arrows from origin per word; cluster hulls toggle; click arrow → inspect mock vector; staggered entrance animation; dark-mode safe. |
| `CosineSimilarityExplorer` | Interactive | Two vector arrows (A/B), arc θ, dashed B→A projection; angle sliders; preset word pairs; cosine score coloured green/amber/gray. |
| `SearchQuerySimulator` | Interactive | Text input + preset buttons; side-by-side keyword vs semantic results; animated score bars; per-column insights. |
| `BytePairEncodingExplorer` | Interactive | Word-level vs BPE side-by-side; live text input; staggered token pills; step-by-step merge breakdown; three "Why BPE Wins" comparison cards. |
| `ArchitectureEvolutionAnimator` | Interactive | Self-contained 6-panel animated story: problem → CNN idea → CNN failure → RNN idea → RNN failure → Transformer success. No props required. |
| `CNNImageSuccessDemo` | Interactive | Animated 6×5 pixel grid; 3×3 filter slides over two vertical-edge patterns; turns green on match; output feature map updates in sync. No props. |
| `RNNCellUnrolledDiagram` | Interactive | SVG unrolled RNN: initial h₀, three identical cells with two hidden layers × three nodes, inputs x₀–x₂ and outputs y₀–y₂; amber recurrent arrows with subtle pulse animation. No props. |

---

## Component reference

Props mirror `components/shared/*.tsx`, `components/session/*`, and `getMdxComponents`. Markers: **TSX only** = do not pass from MDX.

### SessionOutlineSlide

**Description:** Animated numbered outline for the Goal section's first presenter slide. Items are pre-injected from the session frontmatter `outline` field by `getMdxComponents` — no props needed in MDX. Add `## What we'll cover` as the `h2` title above it so the Goal section generates a presenter slide.

```ts
interface SessionOutlineSlideProps {
  items?: string[]; // injected automatically from frontmatter outline; override only if needed
}
```

**Frontmatter required:**

```yaml
outline:
  - "Topic One"
  - "Topic Two"
  - "Topic Three"
outlineSectionMap:
  big-picture: 0
  core-concepts: 1
  practical-example: 2
  recap: 3
```

Example MDX (Goal section):

```mdx
<SessionSection id="goal" label="Goal">

## What we'll cover

<SessionOutlineSlide />

</SessionSection>
```

The `outlineSectionMap` drives the bottom tracker in `PresentationShell`: each key is a `SessionSection` `id` and the value is the 0-based index into `outline`. Sections not in the map leave the tracker in a neutral (no highlight) state.

---

### SessionSection

**Description:** One section of the lesson; must use canonical `id` values with `SessionSection` from the template.

```ts
interface SessionSectionProps {
  id: string;
  label: string;
  children: React.ReactNode;
}
```

### LabSessionOverview

**Description:** AI Engineering Lab opening spec panel for future project sessions. Use it near the top of a Lab session to show the build goal, technologies/concepts covered, and the main concept map in a distinct terminal/project-board style.

```ts
interface LabSessionMainConcept {
  title: string;
  description: string;
}

interface LabSessionOverviewProps {
  goal: string;
  technologies?: string[];
  concepts?: string[];
  mainConcepts?: LabSessionMainConcept[];
}
```

Example MDX:

```mdx
<LabSessionOverview
  goal="Describe what this project session ships."
  technologies={["Next.js", "Vector DB", "Embeddings"]}
  concepts={["RAG", "Chunking", "Similarity search"]}
  mainConcepts={[
    {
      title: "Project architecture",
      description: "How the pieces connect from input documents to final answers."
    },
    {
      title: "Retrieval quality",
      description: "How chunking, embeddings, and ranking change answer quality."
    }
  ]}
/>
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
type NodeShape = "circle" | "rect" | "hex" | "none"; // "none" = invisible waypoint for 90° routing
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
  noArrow?: boolean; // suppress arrowhead — use on routing/waypoint segments
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
  /** When true, hides the step label/description panel under Prev/Play/Next (diagram + controls only). */
  hideStepNarrative?: boolean;
}
```

### DualLanePipelineDiagram

**Description:** Purpose-built **two-lane** vertical pipeline (e.g. indexing vs query). Blocks share one **rounded pill** treatment (`shape` is ignored at render for visual consistency). **`gap-y-9`** keeps vertical connectors readable; arrows use **thin strokes** and **small user-space markers** (not scaled by stroke width). Optional **`label`** on an edge renders at the midpoint — use on dashed bypasses so learners see what the shortcut means. Set **`presentation`** for slide/deck use: bigger pills, wider lane gaps, connectors drawn **above** blocks (`z-index`) with a dark halo so arrows stay legible; dimmed edges stay visible during steps (~0.42 opacity default, ~0.52 in presentation). Same step UX as `NodeFlowDiagram`: dots, Prev / Play / Next, optional narrative — `highlightNodes` / `highlightEdges` match block `id` and `"from→to"` keys.

```ts
type DualLanePipelineColor = "violet" | "teal" | "amber" | "blue" | "rose" | "gray";

interface DualLanePipelineBlock {
  id: string;
  label: string;
  emoji?: string;
  /** Accepted for authoring compatibility; the canvas uses one pill style for every block. */
  shape?: "rect" | "hex" | "circle";
  accent?: DualLanePipelineColor;
}

interface DualLanePipelineLaneSpec {
  id: string;
  label: string;
  color: DualLanePipelineColor;
  blocks: DualLanePipelineBlock[];
}

interface DualLanePipelineEdge {
  from: string;
  to: string;
  dashed?: boolean;
  animated?: boolean;
  color?: DualLanePipelineColor;
  label?: string;
}

interface DualLanePipelineStep {
  id: string;
  label: string;
  description: string;
  highlightNodes: string[];
  highlightEdges: string[];
}

interface DualLanePipelineDiagramProps {
  title?: string;
  minHeight?: number;
  /** Larger blocks, spacing, thicker edges — use on slides / projector. */
  presentation?: boolean;
  hideStepNarrative?: boolean;
  lanes: [DualLanePipelineLaneSpec, DualLanePipelineLaneSpec];
  edges: DualLanePipelineEdge[];
  steps?: DualLanePipelineStep[];
  className?: string;
}
```

### MacroPipeline

**Description:** Premium vertical pipeline summary for high-level "Big Picture" overviews. Features glassmorphism blocks with left-accent bars, emojis, and a dedicated narrative side panel. Supports an optional loop-back arrow to represent iterative processes (like inference).

```ts
interface MacroPipelineBlock {
  id: string;
  label: string;
  sublabel?: string;
  emoji?: string;
  color?: "gray" | "violet" | "blue" | "teal" | "amber" | "rose" | "indigo" | "cyan";
}

interface MacroPipelineStep {
  id: string;
  label: string;
  description: string;
  highlightBlocks: string[];
}

interface MacroPipelineProps {
  blocks: MacroPipelineBlock[];
  steps?: MacroPipelineStep[];
  title?: string;
  caption?: string;
  hasLoop?: boolean;
}
```

Example MDX:

```mdx
<MacroPipeline
  title="Transformer nference Loop"
  hasLoop
  blocks={[
    { id: "input", label: "Your words", emoji: "💬", color: "gray" },
    { id: "tokenizer", label: "Tokenizer", emoji: "🔤", color: "violet" },
    { id: "transformer", label: "Transformer", emoji: "🧠", color: "amber" }
  ]}
  steps={[
    {
      id: "s1",
      label: "Phase 1",
      description: "...",
      highlightBlocks: ["input", "tokenizer"]
    }
  ]}
/>
```

### VectorAnatomyExplorer

**Description:** A multi-step educational walkthrough that helps learners "imagine" what vectors are. It transitions from the mechanical **Lookup** (matrix row selection) to **Latent Dimensions** (interpretable sliders like "Royalty" or "Location") and finally to **Geometry** (angle/cosine similarity).

```ts
// No props — self-contained narrative
```

Example MDX:

```mdx
<VectorAnatomyExplorer />
```

### RagLabSystemArchitecture

**Description:** Interactive **three-layer** architecture panel for the Introduction to RAG lab. Large tabs switch **Frontend**, **Backend**, or **Non-functional requirements**; each panel shows **title-only** cards (no body copy) so presenters narrate from slides. Cards cover Next.js, Tailwind CSS, FastAPI, LangChain, routes, Chroma, OpenAI, Docker, hot reload, `.env`.

```ts
type RagLabArchitectureSection = "frontend" | "backend" | "nfr";

interface RagLabSystemArchitectureProps {
  title?: string;
  /** Initial expanded layer; default `"frontend"`. */
  initialSection?: RagLabArchitectureSection;
  className?: string;
}
```

### RagLabPromptExplorer

**Description:** Introduction-to-RAG lab helper — renders **`TabbedCodeExplorer`** with a **`rag-chatbot/`** tree tab plus **six** plain-text prompt tabs (scaffold, index backend, index frontend, chat backend, chat frontend, UI enhancement). Prompt bodies live in `lib/rag-lab-prompts.ts`. No props from MDX.

```ts
// No props — use as <RagLabPromptExplorer />
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

**Live gallery:** intentionally omitted from `/component-gallery` (use `NodeFlowDiagram` for new teaching layouts).

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

**Live gallery:** intentionally omitted from `/component-gallery` (prefer `NodeFlowDiagram` for new teaching layouts).

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

**Live gallery:** intentionally omitted from `/component-gallery`.

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

### LlmApiCallFlow

**Description:** Animated three-lane pipeline showing the stateless LLM API call pattern: User Input → LLM API block (model, max_tokens, messages params visible) → Text Output. Auto-cycles through examples with framer-motion particle. Shows a key insight chip about unstructured output.

```ts
interface ApiExample {
  input: string;
  output: string;
}

interface LlmApiCallFlowProps {
  title?: string;
  examples?: ApiExample[];   // default: 3 task-management examples
}
```

---

### SchemaConstraintVisualizer

**Description:** Task-manager teaching slide: **System / User / Combined** prompt tabs (Jira-style assistant + example user request), then **Free text vs Structured** output panels for that same prompt. Toggle switches between unstructured prose and schema-constrained JSON.

```ts
interface SchemaField {
  key: string;
  type: string;
  description?: string;
  color?: string;            // Tailwind text colour class, e.g. "text-violet-400"
}

interface SchemaConstraintVisualizerProps {
  title?: string;
  systemPrompt?: string;                        // default: task-management assistant rules
  userMessage?: string;                         // default: create session task example
  plainTextOutput?: string;                     // default: unstructured reply for that message
  schemaName?: string;                          // default: "TaskSchema"
  schemaFields?: SchemaField[];                 // default: 5-field task schema
  structuredExample?: Record<string, string>;   // key → JSON value string
}
```

---

### AiDecisionSchemaCompact

**Description:** Collapsed, video-legible tree of the lab `AiDecision` JSON Schema (`assistant_message`, `action` enum, per-action payloads). Embedded in orchestrator Step 3; can be used standalone.

```ts
interface AiDecisionSchemaCompactProps {
  title?: string;
  className?: string;
}
```

---

### AiTaskflowOrchestrator

**Description:** Static tabbed orchestrator for the AI Task Management lab: central hub coordinates four steps matching the backend flow — `list_tasks`, `build_user_prompt`, `ai_provider.get_decision` (Provider + Tools schema), `execute_ai_action` (Action → DB). Large video-legible type; manual tab selection by default (optional `autoPlay`).

```ts
type OrchestratorStepRole = "workspace" | "prompt" | "provider" | "action";

interface AiTaskflowOrchestratorStep {
  id: string;
  stepNumber: number;
  tabLabel: string;       // e.g. "Step 1" — tab button label
  title: string;
  code: string;
  detail: string;
  icon: string;
  iconLabel: string;
  role: OrchestratorStepRole;
  outputLabel?: string;
  output?: string;
}

interface AiTaskflowOrchestratorProps {
  title?: string;
  userMessage?: string;
  systemPrompt?: string;  // shown in Step 2 merge panel
  existingTasksPreview?: string;
  steps?: AiTaskflowOrchestratorStep[];  // default: 4 steps (list → prompt → provider → action)
  autoPlay?: boolean;   // default: false — set true to show Play/Pause tour control
  cycleMs?: number;     // default: 4000
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

**Description:** Teaches the unrolled RNN picture on a short sentence (default prefix **The capital of Egypt is**, five columns). Each timestep is one column: intermediate heads **ŷ₁…ŷₙ₋₁** (abbreviated — teaching focus is hidden-state flow **h**); **only the last column** shows the concrete **`terminalNextToken`** (default Egypt sentence → **Cairo**). Middle row: **RNN step n**; bottom row: input token **xₜ**; **h₀** at the start and **h₁…hₙ** on orange arrows. Pass `""` for `⟨end⟩`. **Prev / Next** + dots change active column (teal highlight). Optional `initialActiveStep`, `lockToStep`. **Sessions:** defaults are animation-only unless `caption` / `stepDescriptions` are passed.

```ts
interface RNNUnrolledOverviewProps {
  title?: string;
  caption?: string;
  tokens?: string[];           // default prefix tokens ending at "is"
  terminalNextToken?: string;    // last-column prediction; "" → ⟨end⟩; omit on defaults → Cairo
  stepDescriptions?: string[]; // one per token; optional — footer hidden when empty
  initialActiveStep?: number;   // 0-based timestep index on mount
  lockToStep?: boolean;        // when true, disables Prev/Next/dot navigation
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

**Description:** Self-contained “RNN works” demo for `The capital of Egypt is Cairo.` **Tab 1 — How the RNN reads it:** seven token chips (including `.`); defaults to the **“is”** chip so h₅ matches the “next word is the city” beat; Prev/Next + dots; panel shows hₜ copy. **Tab 2 — Influence in h₅:** illustrative **recency** composition in **h₅** after `is` (Cairo not read yet): rows **newest → oldest** with strictly decreasing weights (not `P(next token)`); sums to 100%. Bars stagger on each tab visit. **Tab 3 — Next-token prediction:** two **slots** (Prev/Next + dots): **Slot 1** — prefix `The capital of Egypt is` + dashed `?`, ground truth Cairo; **illustrative** softmax-style rows for Cairo (teal), Alexandria, Giza, Luxor, the. **Slot 2** — prefix through `Cairo` + `?` for closing punctuation; rows for `.` (teal), comma, “ and”, etc. Bars restagger when switching tabs or slots.

```ts
interface RNNWorkingExampleProps {
  title?: string;
  caption?: string;
  /** When true, shows long instructional copy under tabs (gallery). Default false — sessions show controls + visuals only. */
  showNarrative?: boolean;
}
```

---

### RNNFailureDemo

**Description:** Token strip includes a dashed **`?` slot** after `includes` (before `Egyptian` / `Museum`). Step 0 shows full-sense prose; steps ≥1 show a teal cue: prediction is **immediately after “includes”**. Five pills → decay bars on Cairo milestones → RNN **`Alexandria` ✗** vs **`the` ✓** with monospace continuation fragments → Transformer arcs to the **slot** (Cairo, Egypt, includes → `?`). Pills use explicit light/dark text contrast on tinted backgrounds.

```ts
interface RNNFailureDemoProps {
  title?: string;
  caption?: string;
  /** When true, shows per-step story paragraphs under the strip (gallery). Default false for animation-only sessions. */
  showNarrative?: boolean;
}
```

---

### FNNAutocompleteDemo

**Description:** Self-contained feedforward autocomplete demo on the sentence `I grew up in Egypt so my favorite food is`. Shows a fixed 3-word sliding window over chips, three input slots, a simplified 3→3→1 network view, per-step prediction, and a red failure state when `Egypt` leaves the window and the model predicts a generic token.

```ts
// No props - fully self-contained
interface FNNAutocompleteDemoProps {}
```

---

### RNNAutocompleteDemo

**Description:** Self-contained unrolled RNN autocomplete demo on the same sentence. Shows per-token RNN cells and `h_t` states, an aggregate hidden-state memory bar with fading `Egypt` segment, retention-decay indicator bars, and a final vanishing-memory failure where prediction drifts to `pizza`.

```ts
// No props - fully self-contained
interface RNNAutocompleteDemoProps {}
```

---

### ArchitectureComparisonDemo

**Description:** Standalone three-panel architecture comparison on the sentence `I grew up in Egypt so my favorite food is ___`. Includes a shared sentence strip, per-architecture view (FNN window blindness, RNN fading memory, Transformer direct attention arc), click-to-activate panels, per-panel “Why?” expansions, and a bottom explanation banner that changes with the active architecture.

```ts
// No props - fully self-contained
interface ArchitectureComparisonDemoProps {}
```

---

### PositionalEncodingVisualizer

**Description:** Client-only explainer with three internal steps (pills + Prev/Next): (1) swap an adjacent pair near the sentence middle (`floor(n/2)-1` with `floor(n/2)`) to motivate order, (2) Vaswani sinusoidal PE — **numeric table only** (first `tableDims` columns for every position; no SVG wave chart), (3) schematic bars plus element-wise sum stub (first 4 dims, illustrative embedding). **`sinusoidalPe` / `peVector`** helpers are exported for tests or reuse. Respects reduced motion. Optional `autoPlay` advances steps on a timer.

```ts
interface PositionalEncodingVisualizerProps {
  title?: string;
  caption?: string;
  /** Token row; length ≥ 3. PE positions use 0..length-1 in UI plots/tables. */
  tokens?: string[];
  /** Even, 4–32; display width for sinusoidal PE. */
  dModel?: number;
  /** Columns shown in the numeric table (≤ dModel). */
  tableDims?: number;
  initialStep?: number;       // 0–2
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
}
```

---

### TransformerSentenceTokenStrip

**Description:** Teaching strip: token pills and aligned synthetic vocabulary IDs. Shows a one-line note that real models use subwords. Requires `tokens.length === ids.length`.

```ts
interface TransformerSentenceTokenStripProps {
  title?: string;
  caption?: string;
  tokens: string[];
  ids: number[];
}
```

---

### EmbeddingVectorsTable

**Description:** Per-token rows with a monospace embedding vector (deterministic mock floats from token + position + dimension). Optional **`ids`** (same length as `tokens`): header becomes **Token ID** and cells show **`8842 (The)`** (matrix row lookup). Optional `dim` (4–12).

```ts
interface EmbeddingVectorsTableProps {
  title?: string;
  caption?: string;
  tokens: string[];
  ids?: number[];
  dim?: number;
}
```

---

### GradientInstabilityExplorer

**Description:** Standalone **`surface-panel`** diagram (place **before** `TransformerSubstackExplorer` in MDX). Cycles **After attention** → **Exploding gradients** (shake/pulse, huge values) → **Vanishing gradients** (tiny values). Large monospace vectors; phase pills for manual jump. Does not include LayerNorm fix — that lives in the transformer block’s **Layer norm** pill.

```ts
interface GradientInstabilityExplorerProps {
  title?: string;
  caption?: string;
  minimal?: boolean;  // hide title/caption — diagram only
}
```

---

### TransformerSubstackExplorer

**Description:** Vertical stack diagram for **one** Transformer layer (`variant: "encoder" | "decoder"`). Topic pills select a **focus**. Styling aligns with the app shell: outer **`surface-panel`**, inner stack/focus areas use **`--surface-strong`** blocks with **`border-white/10`**, **2px left accents** mapped to **`--purple`** (attention), **`--success`** (add/norm), **`--warning`** (FFN), **slate** (input). Active stack block rings use **`--primary`** (encoder) or **`--warning`** (decoder) at low opacity; pills use translucent fills, not solid `violet-600` / `amber-600`. Non-overview focuses: thin left accent, title + sub + optional body, **tall illustration well** (`bg-white/[0.04]`), then a **Real-world analogy** footer (per-focus prose—socialization, committee, photo upscale, rough-draft + normalize, editing passes; decoder/GPT-3: no future peek, Pre-LN residuals, etc.) with optional `**bold**` spans. **`transformer-substack-illustrations.tsx`** uses the same CSS variables and slate text for minis. Encoder: self-attention → add/norm → FFN → add/norm (Post-LN, classic 512-dim teaching labels). Decoder (**GPT-3 175B**): **Layer norm** → masked multi-head self-attention (96 heads) → **residual** → **layer norm** → FFN (12,288 → 49,152 → 12,288) → **residual** (×96 blocks), then **final layer norm (ln_f)** → LM head. **Layer norm** focus shows **before → after** normalization only (`[100, 200, 300, 400]` → small stable values). No encoder or cross-attention. Default `layerCount` is **96** for decoder, **6** for encoder; affects “× layers” copy and layer-stack animation (visual stack capped at 12 boxes).

```ts
type TransformerSubstackVariant = "encoder" | "decoder";

interface TransformerSubstackExplorerProps {
  variant: TransformerSubstackVariant;
  title?: string;
  caption?: string;
  layerCount?: number;  // default 96 (decoder) or 6 (encoder) — used in layers-focus copy
}
```

---

### SelfAttentionScoreExplorer

**Description:** Built-in **The capital of Egypt is Cairo** (six tokens; default when `tokens` is omitted, matches that sentence, or legacy cat MDX is passed). Built-in **The cat sat** (exact three-token match) uses shorter Q/K/V copy aimed at “query asks, key answers the match, value supplies meaning.” Each token has **concrete Q, K, and V** plus **summary** and **outputBlend** in **OUTPUT FOR “TOKEN”**. **Attention bars**: width **350ms**; **Strong** / **Moderate** / **Weak** thresholds unchanged. **Animation**: unchanged. **Default selection**: six-token opens at **5** (“Cairo”); three-token clamps `defaultSelected` to **2** (“sat”) when left at default **5**. **Custom**: **`tokens`**, **`queries`**, **`attentionRows`** (scores sum to 1.0); generic K/V placeholders.

```ts
interface AttentionScoreRow {
  token: string;
  scores: number[];  // must sum to 1.0; one per token
}

interface SelfAttentionScoreExplorerProps {
  title?: string;
  caption?: string;
  tokens?: string[];
  queries?: string[];
  attentionRows?: AttentionScoreRow[];
  defaultSelected?: number;  // built-in six-token sentence defaults to 5 (Cairo)
}
```

---

### TransformerPipelineWalkthrough

**Description:** Full-pipeline walkthrough. **Macro strip** (six segments: Raw → Tokenize → Embed + pos → Encode → Decode → Predict): maps `step.activeStageId` via fixed ids (`raw`, `tok`, `emb`, `enc`, `dec`, `out`) so completed phases use a green tint, the current phase a **primary** ring—aligned with the session Big Picture. **Token chip strip**: input chips use **`--success`** border/fill when the active stage is `tok`/`emb`/`enc`/`dec`; output token + probability badge appear on the last step. **Pipeline row**: stage cards use **`--surface-strong`**, **`stage.color`** → CSS accents (`--muted`, `--success`, `--purple`, `--warning`, `--primary`, rose hex); active card gets **`color-mix`** tint; chevrons **slate**. **Internal chips**: **`title={internal.detail}`** for hover tooltip; active chip matches stage accent. **Step panel** and **controls**: larger text; Next = **`--primary`**; dots use primary vs muted rings. Outer **`surface-panel`**.

```ts
interface PipelineInternal {
  label: string;   // chip label shown in the tray
  detail: string;  // shown as native `title` tooltip on the chip
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
  outputProbabilityPct?: number;  // default 54 — badge text on last step
  stages: PipelineStage[];
  steps: PipelineStep[];
  /** When true, hides the macro-strip subtitle, the step caption panel (label + description), and per-step prose — keeps macro strip, stage row, token strip, and controls. */
  hideStepNarrative?: boolean;
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

---

### LinearMappingGraph

**Description:** An interactive SVG coordinate-plane component that teaches the concept of a mapping function (y = mx + c) as a precursor to explaining AI models. Steps through four phases via Prev / Next buttons and clickable phase tabs: (1) empty axes with the equation label; (2) known example points plotted with amber dots and dashed guide lines; (3) a weights annotation box showing the derived `m` and `c` values; (4) the full line animates in using framer-motion `pathLength`, labelled with the concrete equation. Clicking any phase tab jumps directly to that step.

```ts
interface LinearMappingGraphPoint {
  x: number;
  y: number;
  label?: string; // short annotation shown next to the dot, e.g. "x=0, y=0"
}

interface LinearMappingGraphProps {
  title?: string;
  caption?: string;
  m: number;                          // slope (weight 1)
  c: number;                          // y-intercept (weight 2)
  knownPoints: LinearMappingGraphPoint[]; // training examples — at least 2 recommended
  xMin?: number;                      // default -0.5
  xMax?: number;                      // default 5
  yMin?: number;                      // default -0.5
  yMax?: number;                      // default 10
}
```

---

### LinearRegressionTrainingExplorer

**Description:** Auto-stepping coordinate-plane animation teaching gradient descent on `y = mx + c`. Shows ghost true line `y = 3x + 2`, model starting at `m=0, c=0`, forward pass with prediction error, ∂E/∂m and ∂E/∂c, weight updates, and convergence. Prev/Next, phase tabs, Play/Pause. Uses shared chart layout from `linear-mapping-chart.ts`.

```ts
interface LinearRegressionTrainingExplorerProps {
  title?: string;
  caption?: string;
  targetM?: number;       // default 3
  targetC?: number;       // default 2
  learningRate?: number;  // default 0.08
}
```

---

### LinearChainGradientExplorer

**Description:** Five-step animation for chained linear layers and backprop multiplication. `story: "vanish"` uses `m₂ = 0.1` (gradient shrinks); `story: "explode"` uses `m₂ = 10` (gradient grows). Two-layer diagram then five-layer chain with product string (e.g. `1.0 × 0.1⁵ = 0.00001`). One slide per story in MDX.

```ts
type ChainGradientStory = "vanish" | "explode";

interface LinearChainGradientExplorerProps {
  story: ChainGradientStory;
  title?: string;
  caption?: string;
}
```

---

### EmbeddingVectorExplorer

**Description:** Renders each word as a directional arrow from the SVG origin. Direction = `angle` (degrees, 0 = right, 90 = up), length = `magnitude` (0–1, scaled to canvas). Arrows draw in one-by-one on mount with a stroke-dashoffset animation (80 ms stagger). Clicking an arrow reveals an inline panel showing the `mockVector` array and a note about real model dimensionality. A "Show clusters" toggle draws translucent convex-hull polygons behind each cluster's arrows. Three built-in cluster colors: violet (royalty), teal (animals), amber (vehicles); additional clusters fall back to gray. All colors adapt for dark mode.

```ts
interface EmbeddingPoint {
  id: string;
  label: string;
  angle: number;       // degrees, 0 = right, 90 = up, 180 = left, 270 = down
  magnitude: number;   // 0–1 (arrow length relative to canvas scale)
  cluster: string;     // groups color + optional hull
  mockVector?: number[]; // shown in detail panel (first N dimensions)
}

interface EmbeddingVectorExplorerProps {
  title?: string;
  caption?: string;
  points?: EmbeddingPoint[];   // default: a small built-in set
  showClusters?: boolean;      // initial state of the cluster-hull toggle (default false)
}
```

---

### CosineSimilarityExplorer

**Description:** Interactive SVG showing two vector arrows (A in blue, B in teal) from a shared origin. An amber arc labels the angle θ between them. A dashed line shows the projection of B onto A (the geometric basis of the dot product). Two range sliders (0–359°) control each vector independently. Clicking a preset button animates both arrows to the preset angles via CSS transitions on the SVG arrows. The cosine score is displayed large in green (> 0.7), amber (0.3–0.7), or gray/red (< 0.3). The preset's `description` string is shown below the score when a preset is active.

```ts
interface CosinePair {
  label: string;       // button text
  angleA: number;      // angle for vector A (degrees)
  angleB: number;      // angle for vector B (degrees)
  description: string; // shown below the score when preset is active
}

interface CosineSimilarityExplorerProps {
  title?: string;
  caption?: string;
  presets?: CosinePair[]; // default: a small built-in set
}
```

---

### SearchQuerySimulator

**Description:** Side-by-side search demo. A text input (auto-runs 400 ms after typing stops, or immediately on preset click / "Search" button). **Keyword engine:** splits query into words, counts matches against `doc.keywords` (case-insensitive partial match), score = matches / words. Matched keywords are highlighted in amber in the doc title. Shows "0 results — no character overlap found." when nothing matches. **Semantic engine:** assigns a mock similarity score per doc based on `embeddingCluster` vs the detected query topic (hardcoded mapping: car → `car-trouble`, login/auth → `login`, bill/billing/invoice → `billing`). Scores are deterministic (seeded on `doc.id`) — top cluster 0.85–0.93, partial 0.55–0.70, unrelated 0.10–0.25. Results animate in with staggered fade-up (50 ms per item) and score bars grow from 0. Each column shows a one-line insight after results appear.

```ts
interface CorpusDoc {
  id: string;
  title: string;
  snippet: string;
  keywords: string[];         // used for keyword engine
  embeddingCluster: string;   // used for semantic engine topic matching
}

interface QueryPreset {
  query: string;  // pre-fills the input and auto-runs
  label: string;  // button label
}

interface SearchQuerySimulatorProps {
  title?: string;
  caption?: string;
  corpus?: CorpusDoc[];       // default: small 3-doc built-in set
  presets?: QueryPreset[];    // default: Car trouble / Login issue / Billing error
  defaultQuery?: string;      // pre-fills and auto-runs on mount
}
```

 
 
---

### BytePairEncodingExplorer

**Description:** Fully self-contained interactive that teaches Byte Pair Encoding by comparing it against naive Word-Level tokenization. A text input at the top drives both panels in real time. **Left panel (Word-Level):** shows the word as a single token pill; if the word is not in the hardcoded known-vocabulary list (
un, 
unning, walk, walking, play, playing, cat, dog, hello), shows a red "? Unknown Word" badge instead. **Right panel (BPE):** splits the word using a hardcoded BPE merge table (common base words + suffixes `ing`, `ed`, `er`, `ly`, `est`, `un`, `re`); each sub-token renders as a staggered, color-coded pill (120 ms delay between pills); a numbered step-by-step breakdown is shown below the pills. **Bottom:** three side-by-side comparison cards - Vocabulary Size, Unknown Words, Shared Meaning - with red/green color coding. No props required.

```ts
// No props - fully self-contained
interface BytePairEncodingExplorerProps {}
```

---

### ArchitectureEvolutionAnimator

**Description:** Six-panel animated SVG walkthrough — "Egypt is a country … What is its capital?" — teaching why Transformers exist. **Panel 0:** 8 key tokens appear (Egypt + "its" amber-highlighted), arc draws Egypt→"its", model outputs "The capital of Egypt is Cairo". **Panel 1:** gray token row + amber CNN window loops left→right. **Panel 2:** CNN window fixed on "What is its", red dotted line from "its" stopped at window edge ✗, wrong prediction. **Panel 3:** conventional **unrolled RNN** — initial **h₀**, then **h₁…h₈** above each token, horizontal amber arrows **hₜ→hₜ₊₁**, vertical inputs from each token into that step (teal token pills); staggered fade-in. **Panel 4:** h arrived at "its", depleted "Egypt" memory bar (~10%), wrong prediction. **Panel 5:** attention arcs from "its" — thick amber to "Egypt", thin gray to others, correct answer ✓.

Use **`panel={N}`** (0–5) to lock to a single panel with no navigation — ideal for one-diagram-per-slide MDX sessions. Omit `panel` to show all six with Prev / Next controls.

```ts
interface ArchitectureEvolutionAnimatorProps {
  /** 0–5: show only that panel, no nav. Omit for full multi-panel mode. */
  panel?: number;
}
```

---

### CNNImageSuccessDemo

**Description:** Animated SVG showing how a CNN filter slides over a pixel grid. The 6×5 input image contains two vertical-edge patterns (at column 1 and column 4). A 3×3 filter cycles through 8 positions; its border turns green and a "✓ match!" label appears whenever it fully covers a pattern. The 3×3 kernel values are shown (vertical-edge detector: `[[0,1,0],[0,1,0],[0,1,0]]`). A 4×3 output feature map updates in sync, with activated cells tinted teal. A bottom caption explains translation invariance. No props — self-contained loop animation.

```ts
// No props required — fully self-contained.
export default function CNNImageSuccessDemo(): JSX.Element
```

---

### RNNCellUnrolledDiagram

**Description:** Teaching diagram for “same recurrent cell unrolled over time.” Shows **h₀** feeding the first column, three side‑by‑side cells labeled **A — same weights**, each with **two layers of three teal nodes**, **yₜ** above and **xₜ** below, full connectivity between the two inner layers (schematic), horizontal **amber** arrows carrying **h₁, h₂…** between columns, and an ellipsis for longer sequences. Short footer line inside the SVG ties **xₜ** to **token embeddings** for LLMs. Uses scoped SVG marker IDs via **`useId()`**. No props.

```ts
// No props required — fully self-contained.
export default function RNNCellUnrolledDiagram(): JSX.Element
```
