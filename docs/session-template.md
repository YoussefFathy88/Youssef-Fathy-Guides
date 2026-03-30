# Session MDX Template Spec
## Project: Joee's GenAI from the Ground Up

---

## Overview

Every session is a single `.mdx` file. It contains:
1. A **frontmatter block** (YAML) -- metadata the session page reads for the header, SEO, and progress nav
2. **Six content sections** -- each maps to one step in the fixed session structure
3. **Component blocks** -- interactive components injected via the MDX component registry

### What the MDX file does and does not own

The MDX file owns everything **inside** the session page: narration, components, structure.

The MDX file does **not** own the app's session index, module listing, or library views.
Those read from `data/sessions.ts`. When you add a new session MDX file, you must also
add its entry to `data/sessions.ts` -- they are two separate steps, both required.

---

## File Location

```
content/
  sessions/
    module-1/
      01-how-llms-work.mdx
      02-tokens-context-window.mdx
      ...
    module-2/
      ...
```

Naming convention: `{two-digit-index}-{slug}.mdx` where slug matches `data/sessions.ts` exactly.

---

## Canonical Session Slugs

Always copy slugs from `data/sessions.ts`. Never invent them.

| ID  | Slug                          | Title                      | Module |
|-----|-------------------------------|----------------------------|--------|
| E01 | how-llms-work                 | How LLMs Work              | 1      |
| E02 | tokens-context-window         | Tokens & Context Window    | 1      |
| E03 | embeddings                    | Embeddings                 | 1      |
| E04 | transformer-attention         | Transformer & Attention    | 1      |
| E05 | training-and-fine-tuning      | Training & Fine-tuning     | 1      |
| E06 | prompting-foundations         | Prompting Foundations      | 1      |
| E07 | evals                         | Evals                      | 1      |
| E08 | rag                           | RAG                        | 2      |
| E09 | tool-use                      | Tool Use                   | 2      |
| E10 | agent-memory                  | Agent Memory               | 2      |
| E11 | mcp                           | MCP                        | 2      |
| E12 | agent-skills                  | Agent Skills               | 2      |
| E13 | context-and-context-engineering | Context & Context Engineering | 2  |
| E14 | ai-agents                     | AI Agents                  | 3      |
| E15 | ai-workflows                  | AI Workflows               | 3      |
| E16 | agent-memory-types            | Agent Memory Types         | 3      |
| E17 | human-in-the-loop             | Human-in-the-Loop          | 3      |
| E18 | guardrails-and-safety         | Guardrails & Safety        | 3      |
| E19 | multi-agent-systems           | Multi-Agent Systems        | 3      |
| E20 | observability                 | Observability              | 4      |
| E21 | cost-and-latency-optimization | Cost & Latency Optimization | 4     |
| E22 | deployment-patterns           | Deployment Patterns        | 4      |

---

## How the MDX Pipeline Works

The session page renders MDX via `next-mdx-remote`. All components are injected through
a registry in `app/sessions/[slug]/page.tsx` -- no import statements needed in MDX files.
The loader strips any leading imports automatically.

**Do not write import statements in MDX files.** All 8 shared components plus
`SessionSection`, `RecapTable`, and `NextSessionCard` are always available.

---

## Full Template

```mdx
---
title: "{{ Session Title }}"
slug: "{{ slug from canonical table above }}"
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

## {{ What the viewer will understand by the end }}

{{ 2-3 sentences. What problem does this session solve?
   What will the viewer be able to explain after watching? }}

</SessionSection>


{/* SECTION 2 - BIG PICTURE */}

<SessionSection id="big-picture" label="Big Picture">

## {{ Where this fits }}

{{ 2-3 sentences. Where does this concept live in the GenAI stack? }}

<{{ ComponentName }}
  title="{{ diagram title }}"
  caption="{{ instruction: what should the viewer try or notice? }}"
  {{ ...props }}
/>

</SessionSection>


{/* SECTION 3 - CORE CONCEPTS
    2-4 sub-concepts. Each: narration then one component. Never two components in a row. */}

<SessionSection id="core-concepts" label="Core Concepts">

## {{ First concept heading }}

{{ 2-3 sentences. }}

<{{ ComponentName }}
  title="{{ concept name }}"
  caption="{{ instruction }}"
  {{ ...props }}
/>

### {{ Second concept heading }}

{{ 2-3 sentences. }}

<{{ ComponentName }}
  title="{{ concept name }}"
  caption="{{ instruction }}"
  {{ ...props }}
/>

</SessionSection>


{/* SECTION 4 - PRACTICAL EXAMPLE */}

<SessionSection id="practical-example" label="Practical Example">

## {{ Real-world scenario title }}

{{ 2-4 sentences. Specific company type, specific problem, specific use case. }}

<{{ ComponentName }}
  title="{{ scenario name }}"
  caption="{{ what the user should experiment with }}"
  {{ ...props }}
/>

</SessionSection>


{/* SECTION 5 - RECAP -- RecapTable only, no prose */}

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


{/* SECTION 6 - NEXT SESSION -- NextSessionCard only, no prose */}

<SessionSection id="next-session" label="Next Session">

<NextSessionCard
  title="{{ Next session title }}"
  slug="{{ next-session-slug }}"
  teaser="{{ One sentence: what comes next and why it follows naturally. }}"
  module={1}
/>

</SessionSection>
```

---

## ParameterSlider -- States API

`ParameterSlider` uses a `states` array. Each state object has:

```ts
interface ParameterSliderState {
  max?: number          // upper bound (inclusive) for this state
                        // omit max on the LAST state -- it catches everything above
  description: string   // shown in the output box when value is in this range
  examples?: string[]   // up to 3 chips shown below the description
  colorClassName?: string // optional Tailwind bg class for the thumb accent
}
```

How matching works: the component finds the **first** state where `value <= state.max`.
The last state should have **no `max`** so it catches all values above the previous bound.

**Correct usage:**
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
      description: "Deterministic -- always picks the most likely token. Identical output every run.",
      examples: ["The cat sat on the mat.", "The cat sat on the mat.", "The cat sat on the mat."]
    },
    {
      max: 0.8,
      description: "Focused -- creative but coherent. Good for most assistant use cases.",
      examples: ["The cat sat on the mat.", "The cat sat on the floor.", "The cat rested on the rug."]
    },
    {
      max: 1.4,
      description: "Balanced -- noticeably varied each run. Good for drafting and brainstorming.",
      examples: ["The cat sat on a velvet cushion.", "The cat chose the windowsill.", "The cat sprawled across the stairs."]
    },
    {
      description: "Chaotic -- high variance, low coherence. For exploration only.",
      examples: ["The cat orbited a small moon.", "The cat dissolved into geometry.", "The cat became several cats."]
    },
  ]}
/>
```

**Wrong -- will not work:**
```mdx
// upTo does not exist -- use max
{ upTo: 0.3, label: "Deterministic", description: "..." }

// label is not a valid field -- omit it
{ max: 0.3, label: "Low", description: "..." }

// inline functions break the server/client boundary
outputFn={(v) => { return "..." }}
```

---

## NextSessionCard -- module is an integer

```mdx
// Correct
<NextSessionCard module={1} />

// Wrong
<NextSessionCard module="1" />
<NextSessionCard module="{{ module number }}" />
```

---

## prevSession -- null without quotes

```yaml
# Correct -- first session in the course
prevSession: null

# Wrong
prevSession: "null"
prevSession: ""
```

---

## Checklist: Adding a New Session

Both steps required every time:

- [ ] Create `content/sessions/module-{N}/{index}-{slug}.mdx`
- [ ] Add the session entry to `data/sessions.ts`

Missing either step means the session page works but library and home views are out of sync.

---

## Authoring Rules

### Content
1. **Max 3 sentences per narration block** -- split the concept if you need more
2. **One component per sub-concept** -- never two components without narration between them
3. **No prose in Section 5** -- RecapTable only
4. **No prose in Section 6** -- NextSessionCard only
5. **Max 4 sub-concepts in Section 3** -- more than 4 means two sessions
6. **Max 5 rows in RecapTable** -- more than 5 means the session is too broad
7. **Captions are instructions** -- "Try dragging above 1.5" not "This shows temperature"

### Components
8. **No import statements** -- registry provides everything automatically
9. **No inline functions in props** -- use `states` array for ParameterSlider
10. **ParameterSlider states**: last state has no `max`, no `label` field anywhere
11. **Never nest components inside each other**
12. **String props use double quotes**
13. **Array props multiline** -- one item per line

### Frontmatter
14. **`slug` must match `data/sessions.ts` exactly** -- use the canonical table above
15. **`nextSession` and `prevSession` use slugs from the canonical table**
16. **`module` is an integer** -- `module: 1` not `module: "1"`
17. **`prevSession: null`** without quotes for E01
18. **`tags` max 3 items**

---

## Example: Filled Session (E03 -- Embeddings)

A correct, working session using real slugs from `data/sessions.ts`.

```mdx
---
title: "Embeddings"
slug: "embeddings"
module: 1
moduleName: "The Engine Room"
sessionNumber: 3
duration: "12 min"
difficulty: "beginner"
tags: ["embeddings", "vectors", "similarity"]
nextSession: "transformer-attention"
prevSession: "tokens-context-window"
---

<SessionSection id="goal" label="Goal">

## Understand how the model turns words into numbers it can reason over

Tokens are just integers -- the model cannot compare or cluster them as text.
Embeddings solve this by mapping every token to a point in a high-dimensional space
where meaning becomes geometry.

</SessionSection>


<SessionSection id="big-picture" label="Big Picture">

## Where embeddings live in the LLM stack

Embeddings sit at the entry point of every model and every retrieval system.
Before attention, before generation, before any tool call -- the model converts
your input tokens into vectors and operates in that space throughout.

<DataFlowDiagram
  title="From token to vector to meaning"
  caption="Notice that embeddings feed both the model and the retrieval layer"
  height={240}
  nodes={[
    { id: "token", label: "Token IDs", sublabel: "Integers from vocab", x: 5, y: 40, color: "gray" },
    { id: "embed", label: "Embedding layer", sublabel: "Lookup table", x: 30, y: 40, color: "violet" },
    { id: "vector", label: "Vector", sublabel: "768 or 1536 dims", x: 58, y: 40, color: "teal" },
    { id: "model", label: "Transformer layers", x: 82, y: 20, color: "violet" },
    { id: "retrieval", label: "Vector DB", x: 82, y: 60, color: "amber" },
  ]}
  edges={[
    { from: "token", to: "embed", animated: true },
    { from: "embed", to: "vector", animated: true },
    { from: "vector", to: "model", animated: true },
    { from: "vector", to: "retrieval", animated: true },
  ]}
/>

</SessionSection>


<SessionSection id="core-concepts" label="Core Concepts">

## Words become points in space

The embedding layer is a learned lookup table -- each token ID maps to a fixed-length
vector of floating-point numbers. These numbers are not hand-crafted; they are learned
during training so that tokens used in similar contexts end up close together.

<Vector2DPlot
  title="Word embeddings projected to 2D"
  caption="Hover any point to see its distance from the query token"
  height={340}
  showDistances={true}
  showClusters={true}
  points={[
    { id: "king", label: "king", x: 72, y: 25, cluster: "royalty", isQuery: true },
    { id: "queen", label: "queen", x: 68, y: 32, cluster: "royalty" },
    { id: "prince", label: "prince", x: 76, y: 35, cluster: "royalty" },
    { id: "dog", label: "dog", x: 22, y: 68, cluster: "animals" },
    { id: "cat", label: "cat", x: 18, y: 74, cluster: "animals" },
    { id: "wolf", label: "wolf", x: 28, y: 65, cluster: "animals" },
    { id: "car", label: "car", x: 55, y: 78, cluster: "vehicles" },
    { id: "bus", label: "bus", x: 62, y: 75, cluster: "vehicles" },
  ]}
/>

### Similarity is distance

Once words are vectors, "similarity" becomes a calculation -- usually cosine similarity
or dot product. This is what powers search, RAG retrieval, and recommendation systems.
Two sentences are similar if their embedding vectors point in roughly the same direction.

<AttentionHeatmap
  title="Cosine similarity between word pairs"
  caption="Click a row to see which words are most similar to that word"
  colorRamp="violet"
  tokens={["king", "queen", "prince", "dog", "cat", "car"]}
  weights={[
    [1.00, 0.82, 0.74, 0.12, 0.10, 0.08],
    [0.82, 1.00, 0.70, 0.14, 0.13, 0.07],
    [0.74, 0.70, 1.00, 0.11, 0.09, 0.06],
    [0.12, 0.14, 0.11, 1.00, 0.88, 0.15],
    [0.10, 0.13, 0.09, 0.88, 1.00, 0.12],
    [0.08, 0.07, 0.06, 0.15, 0.12, 1.00],
  ]}
/>

</SessionSection>


<SessionSection id="practical-example" label="Practical Example">

## How a support ticket router uses embeddings

A SaaS company receives thousands of support tickets daily.
Rather than keyword matching, they embed every ticket and every known issue category,
then route each new ticket to the nearest category by cosine similarity.
When a new category emerges, they add its embedding -- no retraining required.

<ConceptCompare
  title="Keyword matching vs embedding similarity"
  mode="side-by-side"
  left={{
    label: "Keyword matching",
    color: "gray",
    points: [
      "Breaks on synonyms and typos",
      "Requires manual rule maintenance",
      "Cannot handle new phrasing",
      "Fast but brittle",
    ]
  }}
  right={{
    label: "Embedding similarity",
    color: "violet",
    points: [
      "Captures meaning not just words",
      "Handles paraphrase and typos naturally",
      "New categories added without retraining",
      "Slightly slower but robust",
    ]
  }}
/>

</SessionSection>


<SessionSection id="recap" label="Recap">

## What we covered

<RecapTable rows={[
  { term: "Embedding", definition: "A learned vector representation of a token that places similar meanings close together in space" },
  { term: "Vector", definition: "A list of floating-point numbers representing a point in high-dimensional space" },
  { term: "Cosine similarity", definition: "A measure of how similar two vectors are based on the angle between them, regardless of magnitude" },
  { term: "Embedding layer", definition: "A lookup table at the model's input that converts token IDs into their vector representations" },
  { term: "Semantic search", definition: "Retrieval based on meaning similarity between query and document embeddings rather than keyword overlap" },
]} />

</SessionSection>


<SessionSection id="next-session" label="Next Session">

<NextSessionCard
  title="Transformer & Attention"
  slug="transformer-attention"
  teaser="Now that tokens have become vectors, we follow them into the transformer and see how attention lets every token relate to every other token before the model produces its output."
  module={1}
/>

</SessionSection>
```