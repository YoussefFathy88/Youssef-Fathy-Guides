---
name: session-authoring
description: >-
  Authors and maintains Joee's GenAI session MDX under content/sessions/, shared
  session components, and registry wiring. Use when creating or editing .mdx
  sessions, adding session components, StepSequence/EmbeddingSearchSimulator-style
  interactives, or when the user mentions session-template, component-gallery,
  MDX registry, or serializable props for sessions.
---

# Session authoring (Youtube Sessions)

## When this applies

- Creating or editing files under `content/sessions/`.
- Adding, changing, or removing components used from session MDX.
- Tasks that mention `docs/session-template.md`, `docs/component-gallery.md`, `data/sessions.ts`, or “session registry”.

## Authoritative references (read before large edits)

- `docs/session-template.md` — session structure: frontmatter, canonical modules/slugs, six-section skeleton, narrative and prop-safety rules.
- `docs/component-gallery.md` — every MDX component: chooser tables, summary table, and prop interfaces (keep in sync when components change).
- `CLAUDE.md` (repo root) — doc sync rules, no MDX imports, new session checklist.

## Non-negotiables

1. **No MDX imports** — components are injected via the session MDX registry; session `.mdx` files must not contain import statements.
2. **Serializable props only** — no function props, no inline JSX in MDX props (breaks RSC/MDX compilation). Prefer strings, numbers, booleans, arrays, and plain objects.
3. **Keep `docs/component-gallery.md` in sync** — any add/change/remove of session-facing components or their props must update that file in the **same change** as the code. Update `docs/session-template.md` only when **session-level** authoring rules change (see `CLAUDE.md`).
4. **Six sections in order** — `goal` → `big-picture` → `core-concepts` → `practical-example` → `recap` → `next-session` (`SessionSection` ids).
5. **Video / PPT legibility (mandatory)** — follow `.cursor/rules/session-video-legibility.mdc`: in-component body **`text-lg md:text-xl` minimum** (prefer `text-xl` on full-slide panels), headings **`text-xl md:text-2xl`+**, no `text-xs` / `text-[11px]` for teaching copy, generous `p-8 md:p-10` on slide-scale panels. **Presenter fit:** each animation step must fit **one screen** in `?view=present` — **clear big text + short copy** (truncate examples, preview 4–6 tokens); use step-through/tabs for depth, never stack duplicate panels (Input/Action/Output + walkthrough + hero on one step). **Prefer tabs over long vertical stacks** when a step has multiple examples (sequences, sources, files) — one active tab visible at a time. Spot-check presenter mode before finishing. Also: diagram layout uncluttered; **spacing between `##` titles and diagrams** (see `docs/session-template.md` § Diagram clarity and `.cursor/rules/ppt-title-diagram-only.mdc`).
6. **Interactive-first / gamification (mandatory)** — follow `.cursor/rules/session-interactive-first.mdc`: every concept slide must use an animated or interactive component. **Check `docs/component-gallery.md` first** before building anything new. Static bullet-point slides are not acceptable. Build new components only when no gallery component fits, and design them with progressive reveal, step-through controls, color-as-signal, and exploration (sliders / presets / toggles).
7. **Simple English (mandatory)** — follow `.cursor/rules/session-simple-english.mdc`: plain words on every slide label, step, and caption; no jargon unless it is the lesson.
8. **Content accuracy — STRICT (mandatory)** — follow `.cursor/rules/content-accuracy-all-topics.mdc` and `.cursor/rules/session-educational-accuracy.mdc`. **`web_search` is required before any factual file edit** — list claims → search primary sources → claim table with ✓/✗ **in your response** → then write. Memory, lore, and fact sheets alone are **not** enough when changing copy. **Hard facts** in `data/facts/*.json`; teaching copy in `data/facts/*.ts`. Before finishing: five-point checklist. See `data/facts/README.md`.

## New session checklist

1. Add `content/sessions/module-{N}/{index}-{slug}.mdx` (frontmatter + six sections).
2. Add the matching entry in `data/sessions.ts` (optional `hideFromCourseNav: true` to keep a session file + route but omit it from the course journey list — see `docs/session-template.md`).

## Session static images

- Put PNG/JPEG/WebP under **`public/sessions/module-{N}/{session-short-name}/`** (see `public/sessions/README.md`).
- Reference with a root-relative **`src`**: `/sessions/module-1/why-transformer/example.png`.
- The MDX **`img`** element is styled in `getMdxComponents` (article + presenter); always set a descriptive **`alt`**.

## Wiring a new interactive (registry)

Session pages resolve MDX components from `getMdxComponents` in `app/sessions/[slug]/page.tsx`.

1. Implement the component (typically `components/session/*.tsx` for simulators, or `components/shared/*.tsx` for generic widgets).
2. Export from `components/shared/index.ts` (many session components re-export from `../session/...`).
3. Import and register the component in the object returned by `getMdxComponents` in `app/sessions/[slug]/page.tsx`.
4. Update `docs/component-gallery.md`: quick chooser row, summary table row, and **Interface** section for the component (and adjust `app/component-gallery/gallery-demos.tsx` if you maintain the live gallery).

## StepSequence shapes

`StepSequence` supports two step array shapes (do not mix in one array):

| Shape | Fields | Use |
| --- | --- | --- |
| `SequenceStep` | `number`, `phase`, `title`, `detail`, optional `icon`, `color` | Phased / labeled sequences (e.g. RAG prompt assembly). |
| `NarrativeSequenceStep` | `id`, `label`, `description`, optional `highlight`, `detail` | Text-only narratives; `highlight` tints rows (`shared`, `inside`, `outside`, `contrast`). |

- Optional prop **`autoPlay`** — only affects **narrative** steps (timer advance). Phased steps ignore it.
- If the first step has `description` + `label` and no `number`, the narrative renderer is used (vertical layout).

## Verification (efficient)

Run from the repo root after substantive changes:

1. **`web_search` gate (factual edits)** — run web search per `content-accuracy-all-topics.mdc`; claim table with sources **before** writing any MDX, component labels, or fact sheets.
2. **`npm run build`** — must pass TypeScript and Next compile. On Windows PowerShell, chain commands with `;` not `&&` if the shell errors on `&&`.
3. **Accuracy pass (mandatory)** — for each changed slide/step: read labels and captions in `?view=present` and confirm the taught mechanism is correct. Build passing does **not** mean content is accurate.
4. **Spot-check the session URL** in dev or production build — confirm the new/changed block renders and interactions work.
5. **Higher risk** (new client simulators with timers/state): manual or Playwright pass on one happy path.

## Common mistakes to avoid

- **Skipping `web_search`** before factual copy — invalid edit even if it “sounds right”.
- **Mechanically wrong slides** — reusing position tabs, batch layouts, or captions from another step without verifying the algorithm (classic failure: optimizer shown per-position instead of batch-averaged weight updates).
- Forgetting `getMdxComponents` registration after adding a barrel export (build may still pass if the MDX file is not compiled in CI — page will fail at runtime for that session).
- Stale **`docs/component-gallery.md`** after changing a component API or registry entry.
- Using `ConceptStepper` `visual:` with inline JSX in MDX — use TSX-only authoring or switch to serializable patterns (`StepSequence` narrative steps, or a purpose-built simulator component).
