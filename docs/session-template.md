# Session MDX Template
## Project: Joee's GenAI from the Ground Up

---

## Canonical role of this file

`docs/session-template.md` is the **single source of truth for session authoring**: frontmatter, canonical module/slug registry, the six-section MDX skeleton, and narrative rules.

**Component names, chooser tables, and TypeScript prop shapes** live in [`component-gallery.md`](component-gallery.md). When planning or writing interactives, use that file (and the live `/component-gallery` page) alongside this one.

---

## How it works

Each session is one `.mdx` file. Components are injected by the session registry, so no MDX imports are needed.
Session pages own only their content. Navigation, ordering, and library metadata come from `data/sessions.ts`.

Every new session requires both steps:
1. Create `content/sessions/module-{N}/{index}-{slug}.mdx`
2. Add the matching entry to `data/sessions.ts`


## Session structure template

```mdx
---
title: "{{ Canonical session title }}"
slug: "{{ slug from Canonical Slugs }}"
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

## Critical rules

> [!IMPORTANT]
> Interactive-first is non-negotiable.
>
> Every visual concept that can be demonstrated interactively should use an interactive component first.
> Static diagrams are fallback components, not the default.

### Component priority

When picking an interactive, prefer the **most specific** tool for the job. Full chooser + prop reference: [`component-gallery.md`](component-gallery.md).

Rough priority:

1. **Purpose-built simulators** (training, inference, tokenizer, thinking mode, memory, chunking, tools, embeddings router): see the **Quick chooser** table in `component-gallery.md`.
2. **Interactive teaching blocks** (attention, 2D plot, token distribution, sliders, compare, sequences, context fill, pipelines, layers, annotated code).
3. **Graph-style** `NodeFlowDiagram` / `DataFlowDiagram` / `DualPhaseFlow` when topology or grouping matters.
4. **Prose only** when the idea is not visual.

If you are about to explain training, inference, tokenization, thinking mode, memory, chunking, or tool execution with `StepSequence` alone, stop and check whether a purpose-built simulator in `component-gallery.md` is a better fit.

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
- For `ParameterSlider`, use `states` instead of `outputFn`, `outputExamples`, or `colorFn` (see `component-gallery.md`)
- For `ConceptStepper`, `visual` is not MDX-serializable; prefer `StepSequence` or other MDX-safe components unless authoring TSX
- `ConceptCompare` supports `mode` / `layout` and row-driven `rows` (see `component-gallery.md`)
- Match prop shapes exactly to [`component-gallery.md`](component-gallery.md)

---

## Validation checklist

Before shipping a session file, verify:

- The file path matches `content/sessions/module-{N}/{index}-{slug}.mdx`
- Frontmatter title, slug, module, moduleName, and sessionNumber match the canonical tables
- `prevSession` and `nextSession` point to real canonical slugs
- The six sections exist in the required order
- No MDX import statements are present
- Every concept block has short narration before its component
- No section uses unsupported inline function props
- Every custom component prop shape matches [`component-gallery.md`](component-gallery.md)
- `RecapTable` has at most 5 rows and appears only in Section 5
- `NextSessionCard` appears only in Section 6
