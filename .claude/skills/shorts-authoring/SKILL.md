---
name: shorts-authoring
description: >-
  Authors a new YouTube Shorts-format AI concept animation for this project.
  Creates the Short component, registers it in data/shorts.ts, and wires the
  viewer. Use when the user names an AI concept (e.g. "embeddings", "attention",
  "gradient descent") and asks for a Short, short video, concept animation, or
  mentions YouTube Shorts.
---

# Shorts Authoring

## What a Short is

A Short is a self-contained 9:16 vertical animated story in `components/shorts/`.
Every Short uses `ShortsShell` (the phone-frame wrapper) and renders a
5-step animation with framer-motion transitions. **Default: manual navigation**
(Prev / Next only) — see `.cursor/rules/shorts-manual-navigation.mdc`.

## Files to create / edit for every new Short

| File | Action |
|------|--------|
| `components/shorts/{ConceptName}Short.tsx` | **Create** — the Short component |
| `data/shorts.ts` | **Edit** — add one entry to `SHORTS` |
| `app/shorts/[slug]/page.tsx` | **Edit** — add one `case` to `ShortContent` |
| `.next/types/link.d.ts` | **Edit** — nothing needed if slug already dynamic |

Never touch `ShortsShell.tsx` or `app/shorts/page.tsx` — they are already generic.

---

## Step 1 — Research (REQUIRED before writing steps or facts)

Run `WebSearch`/`WebFetch` for the concept before writing step data or any hard numbers.
Produce a claim table:

| Claim | Source | Verdict |
|-------|--------|---------|
| … | … | ✓ / ✗ |

Only ✓ claims may appear in `title` or `subtitle` fields.
Soft-pedagogical language ("roughly", "around", "illustrative") is fine for
✓ facts that are approximations.

---

## Step 2 — Design the 5 steps

A Short has **exactly 5 steps**. Each step has:

```
id          unique lowercase string, no spaces
title       ≤ 8 words, plain English, verb-first or noun-first — no jargon
subtitle    ≤ 10 words, one-sentence elaboration
accentColor Tailwind text-{color}-300 (pick one per step, vary across steps)
badgeColor  bg-{color}-500/20 text-{color}-200 border-{color}-500/30
```

**Step narrative arc (required shape):**
1. **Hook** — the surprising or counter-intuitive truth ("AI can't read words")
2. **Mechanism A** — first half of how it works
3. **Mechanism B** — second half / deeper layer
4. **Contrast** — good vs bad, simple vs complex, cheap vs expensive
5. **Scale / result** — the real-world number or payoff

---

## Step 3 — Design one visual per step

Each step renders its own sub-component: `function {StepId}Visual({ reduced })`.

Visual guidelines:
- Uses only `motion.*` from framer-motion and Tailwind classes — no external libs
- `reduced` prop gates `initial` / `animate` to respect `useReducedMotion`
- One dominant animated element per step (chip grid, fill bar, comparison rows, etc.)
- All text: `text-base` minimum; primary labels `text-lg` or larger
- Colors: use the `bg-{color}-500/25 text-{color}-200 border-{color}-400/40` palette
- Animate sequentially with `delay: i * 0.25–0.35` for list items
- Keep total height well within the phone frame — no scroll

**STRICT — low content per card, tabs over tall stacks:** The phone frame has a
fixed height and the animation zone is `overflow-hidden`; content that doesn't
fit is silently clipped, not scrolled. Each card/panel must stay low-content (a
short label, a couple of data rows, one line of explanation). If a step needs
more than one card's worth of content — e.g. "model asks" + "tool runs" +
"result", or 2+ comparable examples — split it across a **second tab row**
(or Prev/Next phases) so only one card is visible at a time. Never grow a
single card to fit more; add a tab instead. Before shipping, mentally add up
card heights against the phone frame height — if it's close, split into tabs.
See `.cursor/rules/shorts-manual-navigation.mdc`.

**Navigation (required):** Manual step-through by default — `isPlaying` starts
`false`; no auto-advance timers unless the user explicitly requests autoplay.
Multi-phase steps (input → scores → pick → concat) advance on **Next / Prev**,
not `setTimeout`. See `.cursor/rules/shorts-manual-navigation.mdc`.

**LLM generation examples:** Use a real **prompt → answer** story. Show the
user question, then build the reply **one token at a time** (not sentence
prefix autocomplete). Label "Input to AI" as question + answer tokens so far.

**Proven visual patterns (reuse freely):**
| Pattern | Use when |
|---------|----------|
| Staggered chip grid | Showing discrete items (tokens, layers, heads) |
| Row list with `→ value` | Mapping (token → ID, word → vector) |
| Animated fill bar | Showing capacity, probability, or scale |
| Before / after side-by-side | Comparing mechanism inputs vs outputs |
| Counting number + label | Emphasizing a key stat (128K, 96 heads, etc.) |

---

## Step 4 — Write the component

### File: `components/shorts/{ConceptName}Short.tsx`

Exact structure to follow (do not deviate from the shell):

```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const STEP_DURATION_MS = 3800;

interface Step {
  id: string; title: string; subtitle: string;
  accentColor: string; badgeColor: string;
}

const STEPS: Step[] = [ /* 5 entries */ ];

// ── One Visual sub-component per step ────────────────────────────────────────
function {StepId}Visual({ reduced }: { reduced: boolean }) { ... }
// ... repeat for all 5 step IDs

// ── Main export ───────────────────────────────────────────────────────────────
export function {ConceptName}Short() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manual navigation by default — optional Play only if user opts in
  // goToStep / goNext / goPrev callbacks (see LLMWorksShort.tsx)
  // renderVisual(id) switch → returns correct Visual component

  return (
    <div className="flex h-full flex-col">
      {/* Badge + step dots */}
      {/* Title (AnimatePresence mode="wait") */}
      {/* Animation zone (flex-1, AnimatePresence mode="wait") */}
      {/* Subtitle strip (AnimatePresence mode="wait") */}
      {/* Controls + progress bar */}
    </div>
  );
}
```

Copy the shell from `LLMWorksShort.tsx` (manual navigation + optional loop
sub-phases). Do **not** copy auto-advance timers from older shorts unless
autoplay is explicitly requested.

**Do not import lucide-react.** Use inline SVG for any icons (see existing Prev/Next/Play/Pause SVGs in `TokenizerShort.tsx`).

---

## Step 5 — Register in `data/shorts.ts`

Add to the `SHORTS` array:

```ts
{
  slug: "concept-slug",         // kebab-case, matches the route
  title: "Human-readable title",
  topic: "Topic Label",         // shown as badge in gallery + chip on home page
  topicColor: "violet",         // one of: violet | amber | teal | rose | blue | emerald
  description: "One sentence. Plain English. What the viewer will learn.",
},
```

---

## Step 6 — Wire the viewer

In `app/shorts/[slug]/page.tsx`, import the new component and add a case:

```ts
import { {ConceptName}Short } from "@/components/shorts/{ConceptName}Short";

// inside ShortContent:
case "{concept-slug}":
  return <{ConceptName}Short />;
```

---

## Step 7 — TypeScript check

Run `npx tsc --noEmit` from the repo root (PowerShell: use `;` not `&&`).
Fix any errors before finishing.

---

## Quality checklist (run before finishing)

- [ ] All 5 step titles ≤ 8 words, plain English
- [ ] All subtitles ≤ 10 words
- [ ] No `text-xs` or `text-sm` for teaching copy
- [ ] Each visual is fully contained in the phone frame (no overflow)
- [ ] No step stacks 2+ full content cards vertically — used tabs/phase toggle instead
- [ ] Accent colors vary across the 5 steps (not all the same)
- [ ] Hard facts verified with web search (claim table in response)
- [ ] `SHORTS` entry added to `data/shorts.ts`
- [ ] `ShortContent` case added to `app/shorts/[slug]/page.tsx`
- [ ] `npx tsc --noEmit` passes

---

## Color palette reference

| Name | Chip classes |
|------|-------------|
| violet | `bg-violet-500/25 text-violet-200 border-violet-400/40` |
| amber  | `bg-amber-500/25  text-amber-200  border-amber-400/40` |
| teal   | `bg-teal-500/25   text-teal-200   border-teal-400/40`  |
| blue   | `bg-blue-500/25   text-blue-200   border-blue-400/40`  |
| rose   | `bg-rose-500/25   text-rose-200   border-rose-400/40`  |

Badge classes: `bg-{color}-500/20 text-{color}-200 border-{color}-500/30`
Accent title: `text-{color}-300`

---

## Example: Embeddings Short skeleton

Step design for a future "How Embeddings Work" Short:

| # | id | title | subtitle |
|---|---|---|---|
| 1 | `problem` | Words mean nothing to math | Computers need numbers, not letters |
| 2 | `vector` | Each word becomes a list of numbers | Called a vector — hundreds of values |
| 3 | `meaning` | Similar words, similar vectors | "King" and "Queen" are close in space |
| 4 | `distance` | Distance measures meaning | Closer vectors = more similar concepts |
| 5 | `scale` | GPT-4 uses 1536-dimension vectors | Each token is a point in 1536-D space |

Use this as a template shape when designing new step narratives.
