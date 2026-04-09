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

## New session checklist

1. Add `content/sessions/module-{N}/{index}-{slug}.mdx` (frontmatter + six sections).
2. Add the matching entry in `data/sessions.ts`.

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

1. **`npm run build`** (or `pnpm build` if available) — must pass TypeScript and Next compile. On Windows PowerShell, chain commands with `;` not `&&` if the shell errors on `&&`.
2. **Spot-check the session URL** in dev or production build — e.g. `/session/embeddings` or `/sessions/embeddings` depending on which route you use; confirm the new/changed block renders and interactions work.
3. **Higher risk** (new client simulators with timers/state): add or run a short Playwright check (preset → route → stage text / result) if you have Playwright in the workflow; otherwise do a manual pass on one happy path.

## Common mistakes to avoid

- Forgetting `getMdxComponents` registration after adding a barrel export (build may still pass if the MDX file is not compiled in CI — page will fail at runtime for that session).
- Stale **`docs/component-gallery.md`** after changing a component API or registry entry.
- Using `ConceptStepper` `visual:` with inline JSX in MDX — use TSX-only authoring or switch to serializable patterns (`StepSequence` narrative steps, or a purpose-built simulator component).
