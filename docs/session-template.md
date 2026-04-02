# Session MDX Template
## Project: Joee's GenAI from the Ground Up

---

## How it works

Each session is one `.mdx` file. Components are injected via a registry — no imports needed.
The MDX file owns the session page content only. Navigation and library views read from `data/sessions.ts`.

**Every time you add a session, two steps are required:**
1. Create `content/sessions/module-{N}/{index}-{slug}.mdx`
2. Add its entry to `data/sessions.ts`

---

## Canonical Slugs

| ID  | Slug | Title | Module |
|-----|------|-------|--------|
| E01 | how-llms-work | How LLMs Work | 1 |
| E02 | tokens-context-window | Tokens & Context Window | 1 |
| E03 | embeddings | Embeddings | 1 |
| E04 | transformer-attention | Transformer & Attention | 1 |
| E05 | how-llms-think | How LLMs Think: Reasoning, Planning & Sampling | 1 |
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

## Template

```mdx
---
title: "{{ Session Title }}"
slug: "{{ slug from canonical table }}"
module: {{ 1 | 2 | 3 | 4 }}
moduleName: "{{ Module display name }}"
sessionNumber: {{ 1-22 }}
duration: "{{ e.g. 12 min }}"
difficulty: "{{ beginner | intermediate | advanced }}"
tags: ["tag1", "tag2", "tag3"]
nextSession: "{{ slug from canonical table }}"
prevSession: {{ "slug-from-canonical-table" | null }}
---

{/* SECTION 1 - GOAL */}
<SessionSection id="goal" label="Goal">

## {{ What the viewer will understand }}

{{ 2-3 sentences. }}

</SessionSection>


{/* SECTION 2 - BIG PICTURE */}
<SessionSection id="big-picture" label="Big Picture">

## {{ Where this fits }}

{{ 2-3 sentences. }}

<{{ Component }} title="..." caption="..." {{ ...props }} />

</SessionSection>


{/* SECTION 3 - CORE CONCEPTS — 2-4 concepts, one component each, narration before every component */}
<SessionSection id="core-concepts" label="Core Concepts">

## {{ First concept }}

{{ 2-3 sentences. }}

<{{ Component }} title="..." caption="..." {{ ...props }} />

### {{ Second concept }}

{{ 2-3 sentences. }}

<{{ Component }} title="..." caption="..." {{ ...props }} />

</SessionSection>


{/* SECTION 4 - PRACTICAL EXAMPLE */}
<SessionSection id="practical-example" label="Practical Example">

## {{ Scenario title }}

{{ 2-4 sentences. Specific company, specific problem. }}

<{{ Component }} title="..." caption="..." {{ ...props }} />

</SessionSection>


{/* SECTION 5 - RECAP — RecapTable only, no prose */}
<SessionSection id="recap" label="Recap">

## What we covered

<RecapTable rows={[
  { term: "Term 1", definition: "One sentence definition" },
  { term: "Term 2", definition: "One sentence definition" },
  { term: "Term 3", definition: "One sentence definition" },
  { term: "Term 4", definition: "One sentence definition" },
  { term: "Term 5", definition: "One sentence definition" },
]} />

</SessionSection>


{/* SECTION 6 - NEXT SESSION — NextSessionCard only, no prose */}
<SessionSection id="next-session" label="Next Session">

<NextSessionCard
  title="..."
  slug="..."
  teaser="..."
  module={1}
/>

</SessionSection>
```

---

## Critical Rules

### Frontmatter
- `slug` must match the canonical table exactly
- `module` is an integer — `module: 1` not `module: "1"`
- `prevSession: null` (no quotes) for E01
- `tags` max 3 items

### Components
- No import statements — registry provides all components automatically
- No inline functions in props — causes server/client boundary error
- String props use double quotes
- Array props multiline — one item per line
- Never nest components inside each other
- For `DataFlowDiagram`, keep the canvas minimal â€” short labels in boxes, full descriptions in the detail panel

### Content
- Max 3 sentences per narration block
- One component per sub-concept — never two in a row without narration between
- No prose in Section 5 — RecapTable only
- No prose in Section 6 — NextSessionCard only
- Max 4 sub-concepts in Section 3
- Max 5 rows in RecapTable
- Captions are instructions: "Try dragging..." not "This shows..."

---

## ParameterSlider — states API

Use `states` array only. Never use `outputFn`, `outputExamples`, or inline functions.

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
      description: "Deterministic -- always picks the most likely token.",
      examples: ["Output A", "Output A", "Output A"]
    },
    {
      max: 0.8,
      description: "Focused -- creative but coherent.",
      examples: ["Output A", "Output B", "Output B"]
    },
    {
      max: 1.4,
      description: "Balanced -- noticeably varied each run.",
      examples: ["Output A", "Output B", "Output C"]
    },
    {
      description: "Chaotic -- high variance. No max on last state.",
      examples: ["Output X", "Output Y", "Output Z"]
    },
  ]}
/>
```

Rules:
- `max` is the upper bound (inclusive) for that state
- Last state has **no `max` field** — it catches all values above
- No `label` field — it does not exist in the component
- No `upTo` field — use `max`

---

## Component Chooser

Pick the **most specific** component for the content type. Avoid `DataFlowDiagram` and `ConceptStepper` when a purpose-built alternative exists.

| Content type | Use this component |
|---|---|
| Linear pipeline / subway-style flow (RAG, LLM lifecycle, tool loop) | **`PipelineTrack`** |
| Numbered how-it-works sequence (training loop, inference steps) | **`StepSequence`** |
| Stacked architecture / processing layers (transformer layers, agent stack) | **`LayerStack`** |
| Code block with callout explanations | **`AnnotatedCode`** |
| Concept A vs Concept B | `ConceptCompare` |
| Any number that controls behaviour (temperature, top-p) | `ParameterSlider` |
| Token-to-token attention weights | `AttentionHeatmap` |
| Semantic similarity / embedding clusters | `Vector2DPlot` |
| Next-token probability distribution | `TokenProbDist` |
| User types input → sees live output | `MiniPlayground` |
| Arbitrary node graph with non-linear edges | `DataFlowDiagram` |
| Sequential concept reveal (use sparingly) | `ConceptStepper` |

### When `DataFlowDiagram` is still appropriate
Only use `DataFlowDiagram` for **non-linear** graphs where nodes connect in arbitrary directions (e.g. memory type topology, multi-agent routing). For any ordered, left-to-right flow use `PipelineTrack` instead.

### `DataFlowDiagram` authoring rules
- Default behavior is **panel mode** â€” clicking a box or line shows its description below the diagram
- Keep `nodes[].label` short â€” usually one short phrase only
- Put node explanations in `nodes[].sublabel` â€” they appear in the panel when the box is clicked
- Put line explanations in `edges[].label` â€” they stay hidden on the canvas and appear in the panel when the line is clicked
- Do not rely on bold text inside boxes to signal importance
- Use solid lines for actual runtime flow and `edges[].dashed` only for supporting or shared relationships that are not themselves the main data path
- If solid and dashed lines have diagram-specific meaning, always set `solidLegendLabel` and `dashedLegendLabel`
- If a node needs a paragraph to make sense inside the canvas, use a different component

---

## Available Components

All components are always available without importing:

| Component | Props summary |
|---|---|
| `PipelineTrack` | `nodes`, `lines`, `title?`, `caption?` |
| `StepSequence` | `steps`, `title?`, `caption?`, `orientation?` ("horizontal" \| "vertical") |
| `LayerStack` | `layers`, `title?`, `caption?`, `direction?` ("top-to-bottom" \| "bottom-to-top") |
| `AnnotatedCode` | `code`, `annotations`, `language?`, `title?`, `caption?` |
| `ParameterSlider` | `label`, `min`, `max`, `step`, `defaultValue`, `states` |
| `AttentionHeatmap` | `tokens`, `weights`, `colorRamp?`, `title?`, `caption?` |
| `ConceptStepper` | `steps`, `autoPlay?`, `showDots?`, `title?`, `caption?` |
| `DataFlowDiagram` | `nodes`, `edges` (`dashed?` supported), `height?`, `highlightPath?`, `title?`, `caption?`, `nodeDetailMode?`, `solidLegendLabel?`, `dashedLegendLabel?` |
| `ConceptCompare` | `left`, `right`, `mode?`, `title?`, `caption?` |
| `MiniPlayground` | `placeholder?`, `simulationFn?`, `title?`, `caption?` |
| `Vector2DPlot` | `points`, `showDistances?`, `showClusters?`, `title?`, `caption?` |
| `TokenProbDist` | `candidates`, `showTemperature?`, `showTopP?`, `title?`, `caption?` |
| `SessionSection` | Section wrapper (always required) |
| `RecapTable` | Section 5 recap only — `rows` array |
| `NextSessionCard` | Section 6 next session only |

---

## New Component Examples

### PipelineTrack
```mdx
<PipelineTrack
  title="The RAG pipeline — index path runs once, query path runs every time"
  caption="Follow each track — top track builds the index, bottom track answers a question"
  nodes={[
    { id: "docs", label: "Documents", sublabel: "PDFs, databases, web pages", color: "gray" },
    { id: "chunk", label: "Chunking", sublabel: "Split into 200–500 token segments", color: "violet" },
    { id: "embed", label: "Embedding model", sublabel: "Converts each chunk to a vector", color: "teal" },
    { id: "vecdb", label: "Vector database", sublabel: "Stores all chunk vectors", color: "amber" },
    { id: "query", label: "User query", sublabel: "Natural language question", color: "gray" },
    { id: "retrieve", label: "Retrieve top-k", sublabel: "Nearest-neighbour search", color: "teal" },
    { id: "llm", label: "LLM", sublabel: "Generates answer with context", color: "violet" },
  ]}
  lines={[
    { nodes: ["docs", "chunk", "embed", "vecdb"], color: "#8b5cf6", label: "Index path", dashed: true },
    { nodes: ["query", "embed", "retrieve", "llm"], color: "#14b8a6", label: "Query path" },
  ]}
/>
```

### StepSequence
```mdx
<StepSequence
  title="How transformer attention works — four steps"
  caption="Click a step to expand the detail"
  orientation="vertical"
  steps={[
    { number: 1, phase: "Project", title: "Turn each token into Q, K, V vectors", detail: "Every token embedding is multiplied by three learned weight matrices to produce a Query, Key, and Value vector for that position.", color: "violet" },
    { number: 2, phase: "Score", title: "Dot-product every Q against every K", detail: "We compute a raw attention score between every pair of positions. High score = these two tokens should influence each other.", color: "teal" },
    { number: 3, phase: "Normalise", title: "Softmax turns raw scores into probabilities", detail: "Scores are scaled by √d_k then passed through softmax. Each row now sums to 1 — a probability distribution over all positions.", color: "amber" },
    { number: 4, phase: "Aggregate", title: "Weighted sum of V vectors gives the output", detail: "The output for each token is the sum of all Value vectors weighted by the attention probabilities computed in step 3.", color: "blue" },
  ]}
/>
```

### LayerStack
```mdx
<LayerStack
  title="The transformer block — data flows upward through each layer"
  caption="Click any layer to see what it does"
  direction="bottom-to-top"
  layers={[
    { id: "embed", label: "Token Embedding", sublabel: "Input", color: "gray", detail: "Converts each input token ID into a dense vector of size d_model (e.g. 768). This is the raw numeric representation the model works with." },
    { id: "pos", label: "Positional Encoding", sublabel: "Layer 0", color: "violet", detail: "Adds position-specific signals to each embedding so the model knows token order. Without this, the transformer is position-blind." },
    { id: "attn", label: "Multi-Head Attention", sublabel: "Layer 1–N", color: "teal", detail: "Lets each token attend to every other token. Multiple heads allow the model to capture different types of relationships simultaneously." },
    { id: "ffn", label: "Feed-Forward Network", sublabel: "Layer 1–N", color: "amber", detail: "A two-layer MLP applied independently to each position. Doubles the model's width then projects back — where most 'knowledge' is stored." },
    { id: "lm", label: "LM Head", sublabel: "Output", color: "blue", detail: "Projects the final hidden state to vocabulary size and applies softmax to produce a probability distribution over the next token." },
  ]}
/>
```

### AnnotatedCode
```mdx
<AnnotatedCode
  title="A minimal RAG query in Python"
  caption="Click a callout number to highlight the corresponding line"
  code={`import anthropic
import chromadb

client = chromadb.Client()
collection = client.get_collection("docs")

query = "How does attention work?"
results = collection.query(query_texts=[query], n_results=3)

context = "\n".join(results["documents"][0])

response = anthropic.Anthropic().messages.create(
  model="claude-opus-4-6",
  max_tokens=512,
  messages=[{"role": "user", "content": f"{context}\n\n{query}"}]
)`}
  annotations={[
    { line: 4, label: "Vector DB client", description: "ChromaDB runs locally — no external API needed for prototyping.", color: "violet" },
    { line: 7, label: "User query", description: "The raw natural-language question — not yet vectorised.", color: "teal" },
    { line: 8, label: "Similarity search", description: "ChromaDB embeds the query and returns the 3 most similar chunks by cosine distance.", color: "amber" },
    { line: 10, label: "Context injection", description: "Retrieved chunks are joined into a single string and prepended to the prompt.", color: "blue" },
    { line: 12, label: "LLM call", description: "Claude receives the context + question and generates a grounded answer.", color: "violet" },
  ]}
/>

---

## Working Example — E06 Agent Memory Types

```mdx
---
title: "Agent Memory Types"
slug: "agent-memory-types"
module: 2
moduleName: "Giving the Brain Capabilities"
sessionNumber: 6
duration: "12 min"
difficulty: "intermediate"
tags: ["memory", "episodic", "semantic"]
nextSession: "rag"
prevSession: "how-llms-think"
---

<SessionSection id="goal" label="Goal">

## Understand the four types of memory an AI agent can have and when to use each one

By default, LLMs are stateless -- every API call starts from scratch. Building an agent that
remembers anything requires you to design a memory system explicitly. This session maps the
four memory types, what each stores, where it lives, and which problem it solves.

</SessionSection>


<SessionSection id="big-picture" label="Big Picture">

## Memory is what turns a stateless model into an agent that learns over time

Without a memory system, your agent forgets everything the moment a session ends. The four
memory types each solve a different part of that problem. Most real agents combine two or more.

<DataFlowDiagram
  title="The four memory types and where they live relative to the agent"
  caption="Follow the arrows, then click any box or line below the diagram to inspect its role more clearly"
  height={340}
  nodes={[
    { id: "agent", label: "Agent (LLM)", sublabel: "Stateless model making decisions", x: 50, y: 50, color: "violet" },
    { id: "incontext", label: "In-context memory", sublabel: "Active conversation -- lives inside context window", x: 50, y: 12, color: "teal" },
    { id: "episodic", label: "Episodic memory", sublabel: "Past interaction logs -- stored in external database", x: 82, y: 50, color: "amber" },
    { id: "semantic", label: "Semantic memory", sublabel: "Facts and knowledge -- vector or structured DB", x: 82, y: 82, color: "teal" },
    { id: "procedural", label: "Procedural memory", sublabel: "Instructions and rules -- system prompt or config file", x: 50, y: 82, color: "gray" },
    { id: "response", label: "Agent response", sublabel: "Output to user or next tool call", x: 18, y: 50, color: "gray" },
  ]}
  edges={[
    { from: "incontext", to: "agent", animated: true, label: "Always present" },
    { from: "episodic", to: "agent", animated: true, label: "Retrieved on demand" },
    { from: "semantic", to: "agent", animated: true, label: "Retrieved on demand" },
    { from: "procedural", to: "agent", animated: false, label: "Loaded once at start", dashed: true },
    { from: "agent", to: "response", animated: true },
  ]}
  highlightPath={["episodic", "agent", "response"]}
  solidLegendLabel="Solid line: route being shown directly"
  dashedLegendLabel="Dashed line: additional supporting relationship"
/>

</SessionSection>


<SessionSection id="core-concepts" label="Core Concepts">

## In-context memory: the agent's active working space

In-context memory is everything currently inside the context window. It requires no external
infrastructure and is instantly available. When the session ends, everything in context is
gone unless explicitly saved elsewhere.

<ConceptStepper
  title="How in-context memory grows and gets truncated during a long conversation"
  caption="Step through the turns -- notice the moment old content starts getting dropped"
  autoPlay={false}
  showDots={true}
  steps={[
    { title: "Turn 1 -- conversation starts fresh", caption: "Context holds: system prompt (500 tokens) + first message (50 tokens) = 550 tokens. Agent sees everything.", visual: null },
    { title: "Turn 10 -- history accumulating", caption: "Context now holds 2,360 tokens across system prompt, 9 turns, and current message. Still fits -- no truncation.", visual: null },
    { title: "Turn 40 -- context window nearly full", caption: "The oldest turns are being dropped. Agent can no longer see what was said in turns 1-15.", visual: null },
    { title: "Session ends -- all in-context memory erased", caption: "Context clears completely. Next session starts blank unless key info was saved to external memory.", visual: null },
  ]}
/>

### Episodic memory: a searchable log of past sessions

Episodic memory stores records of past interactions saved to an external database at the end
of each session. The most relevant ones are retrieved and injected into context at the start
of future sessions. A support agent with episodic memory can reference what happened last week
without the user re-explaining.

<ConceptCompare
  title="Support agent without episodic memory vs support agent with episodic memory"
  caption="Toggle -- notice what the agent can and cannot reference in a follow-up conversation"
  mode="toggle"
  left={{
    label: "No episodic memory -- every session is a blank slate",
    color: "gray",
    points: [
      "Agent has zero knowledge of past interactions",
      "User must re-explain context every time: 'As I mentioned last week...'",
      "Agent cannot reference past decisions or resolutions",
      "Frustrating for users with ongoing issues",
    ]
  }}
  right={{
    label: "With episodic memory -- past sessions are searchable",
    color: "teal",
    points: [
      "Summaries of past interactions stored in a vector database",
      "Top 3 most relevant past episodes retrieved at session start",
      "Agent can say: 'Last Tuesday you had a billing error -- resolved by resetting your subscription'",
      "Enables coherent continuity across days, weeks, or months",
    ]
  }}
/>

### Semantic memory: facts and knowledge the agent can look up

Semantic memory stores factual knowledge independent of any specific interaction -- product
docs, policies, domain knowledge. RAG is the most widely used implementation. The next session
covers exactly how RAG works.

<ConceptCompare
  title="Episodic memory vs semantic memory -- what each one actually stores"
  caption="Read both sides -- one remembers what happened, the other knows what is true"
  mode="side-by-side"
  left={{
    label: "Episodic memory -- records of events",
    color: "amber",
    points: [
      "'On 3 March, user reported a login error on their mobile app'",
      "'Agent escalated the ticket to tier-2 support'",
      "'Issue resolved by resetting the OAuth token'",
      "Always tied to a specific time, user, and outcome",
    ]
  }}
  right={{
    label: "Semantic memory -- statements of fact",
    color: "teal",
    points: [
      "'OAuth tokens in this system expire after 24 hours'",
      "'Tier-2 support handles all authentication-related issues'",
      "'The mobile app login flow uses Auth0 as the identity provider'",
      "Not tied to any event -- true regardless of when you ask",
    ]
  }}
/>

### Procedural memory: instructions that shape how the agent behaves

Procedural memory stores rules, workflows, and decision logic -- how to handle a refund,
which tool to call for which task, when to escalate. It lives in the system prompt or config
file loaded at startup. Unlike other memory types it is never retrieved mid-conversation.

<DataFlowDiagram
  title="How procedural memory enters the agent at session startup"
  caption="Click any box or line below the diagram to inspect what loads at startup and what happens later in the session"
  height={260}
  nodes={[
    { id: "sysprompt", label: "System prompt", sublabel: "Step-by-step rules and escalation logic", x: 8, y: 25, color: "gray" },
    { id: "tools", label: "Tool definitions", sublabel: "When and how to call each available tool", x: 8, y: 75, color: "gray" },
    { id: "startup", label: "Agent session start", sublabel: "Procedural memory loaded here -- before first user message", x: 42, y: 50, color: "violet" },
    { id: "convo", label: "Conversation runs", sublabel: "Agent follows loaded rules throughout session", x: 72, y: 50, color: "teal" },
    { id: "usermsg", label: "User message arrives", sublabel: "Triggers agent response -- rules already in place", x: 93, y: 50, color: "gray" },
  ]}
  edges={[
    { from: "sysprompt", to: "startup", animated: false, label: "Loaded once", dashed: true },
    { from: "tools", to: "startup", animated: false, label: "Loaded once", dashed: true },
    { from: "startup", to: "convo", animated: true, label: "Rules stay active through the session" },
    { from: "usermsg", to: "convo", animated: true, label: "User input arrives after startup" },
  ]}
  highlightPath={["sysprompt", "startup", "convo"]}
  solidLegendLabel="Solid line: the main session path"
  dashedLegendLabel="Dashed line: setup loaded before the session begins"
/>

</SessionSection>


<SessionSection id="practical-example" label="Practical Example">

## A customer support agent using all four memory types together

A SaaS company builds a support agent for enterprise customers. In-context memory holds the
live conversation. The three most relevant past tickets are retrieved from episodic memory at
session start. Relevant product docs are retrieved from semantic memory when needed. The system
prompt -- procedural memory -- defines escalation rules and response format.

<DataFlowDiagram
  title="Customer support agent -- all four memory types activating on one user message"
  caption="Trace the message path, then click any box or line below the diagram to inspect what each memory type contributes"
  height={360}
  nodes={[
    { id: "msg", label: "Customer message", sublabel: "'My payment failed again -- this happened last month too'", x: 4, y: 50, color: "gray" },
    { id: "incontext", label: "In-context memory", sublabel: "Current conversation -- already in context window", x: 30, y: 15, color: "teal" },
    { id: "episodic", label: "Episodic memory", sublabel: "Last month's payment failure ticket -- retrieved by similarity search", x: 30, y: 50, color: "amber" },
    { id: "semantic", label: "Semantic memory", sublabel: "Payment retry policy doc -- retrieved from vector DB", x: 30, y: 82, color: "teal" },
    { id: "agent", label: "Agent (LLM)", sublabel: "Combines all four memory sources to form response", x: 62, y: 50, color: "violet" },
    { id: "procedural", label: "Procedural memory", sublabel: "Escalation rules -- loaded in system prompt at session start", x: 62, y: 85, color: "gray" },
    { id: "response", label: "Response to customer", sublabel: "'I can see last month's issue -- here is what to try first...'", x: 90, y: 50, color: "teal" },
  ]}
  edges={[
    { from: "msg", to: "incontext", animated: true, label: "Current message enters active context" },
    { from: "msg", to: "episodic", animated: true, label: "Message triggers search over similar past tickets" },
    { from: "msg", to: "semantic", animated: true, label: "Message triggers retrieval of relevant product knowledge" },
    { from: "incontext", to: "agent", animated: true, label: "Live conversation is already available to the agent" },
    { from: "episodic", to: "agent", animated: true, label: "Retrieved episode is injected into context" },
    { from: "semantic", to: "agent", animated: true, label: "Retrieved knowledge is injected into context" },
    { from: "procedural", to: "agent", animated: false, label: "Rules were loaded earlier at session start", dashed: true },
    { from: "agent", to: "response", animated: true, label: "The agent forms the reply" },
  ]}
  highlightPath={["msg", "episodic", "agent", "response"]}
  solidLegendLabel="Solid line: the example path being traced"
  dashedLegendLabel="Dashed line: other memory sources that also connect to the agent"
/>

</SessionSection>


<SessionSection id="recap" label="Recap">

## What we covered

<RecapTable rows={[
  { term: "In-context memory", definition: "Everything currently in the context window -- fast and always available, but temporary and limited by context window size" },
  { term: "Episodic memory", definition: "A stored log of past interactions saved to an external database and retrieved at the start of future sessions" },
  { term: "Semantic memory", definition: "A store of facts and knowledge retrieved on demand when the agent needs specific information -- RAG is the main implementation" },
  { term: "Procedural memory", definition: "Rules and instructions loaded at agent startup that define how the agent behaves throughout the session" },
  { term: "Stateless", definition: "The default behaviour of an LLM -- no memory of previous API calls, every request processed independently from scratch" },
]} />

</SessionSection>


<SessionSection id="next-session" label="Next Session">

<NextSessionCard
  title="RAG"
  slug="rag"
  teaser="Semantic memory needs a retrieval mechanism to actually work -- RAG is exactly that. Next session we open up how RAG finds the right document at query time."
  module={2}
/>

</SessionSection>
```
