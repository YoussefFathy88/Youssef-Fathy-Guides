# Project rules (ported from .cursor/rules)

This repo's editorial rules live in `.cursor/rules/*.mdc` (written for Cursor).
Claude Code does not auto-apply glob-scoped rule files the way Cursor does, so
this file is the always-loaded index: read it first, then open the linked
`.mdc` file for full detail **before editing matching paths**.

Non-negotiable, in priority order:

## 1. Content accuracy (all topics) — `.cursor/rules/content-accuracy-all-topics.mdc`

**Applies to:** any factual claim, anywhere in the repo (slides, copy, `data/facts/*`, chat answers).

- Run `WebSearch`/`WebFetch` on a primary source **before** writing or editing any verifiable claim (numbers, dates, "X is used for Y", superlatives, pipeline/mechanism steps). Never write from memory.
- Produce a claim table (Claim / Tier / Source / Verdict) before editing files. Only ✓ claims ship; ✗ claims get reworded, softened ("not publicly disclosed", "widely believed but not confirmed", "simplified for teaching"), or removed.
- Prefer primary sources in this order: original papers (arxiv/NeurIPS) → official company blogs/docs → peer-reviewed/government sources. Avoid Medium/Reddit/YouTube/forum lore as sole source.
- `data/facts/*.json` is a cache of prior verified search, not a substitute for re-searching when you **change** teaching copy.
- If earlier copy was wrong, fix it proactively in the same change.

## 2. Session educational accuracy — `.cursor/rules/session-educational-accuracy.mdc`

**Applies to:** `content/sessions/**/*.mdx`, `components/session/**/*.tsx`, `components/shared/**/*.tsx`, `data/facts/**`, `docs/session-template.md`, `docs/component-gallery.md`.

- Do rule #1's web-search gate first; this adds mechanism-level verification.
- Claim tiers: **hard** (must match a cited primary source or `data/facts/*.json`) vs **pedagogical** (simplified shorthand, never presented as paper fact — tag it).
- Before marking any slide/component edit done, answer all five:
  1. What is the real mechanism (one sentence)?
  2. Does the visual imply that mechanism, or something else?
  3. Do summary line, labels, tabs, numbers, and caption all agree?
  4. If a UI pattern was copied from another step, does the mechanism still match? (e.g. per-position tabs are valid for forward/loss, **not** for optimizer — gradients are batch-averaged.)
  5. Spot-check in `?view=present`, reading every label aloud.
- **Sequences that claim improvement over time must be strictly monotonic** (loss ↓, chosen-prob ↑, gap widens, rank order preserved) — check every adjacent pair before shipping. A "Step 50" worse than "Step 1" is a shipped bug.
- Reject on sight: non-monotonic step data, one-prediction-per-forward on full-sequence pretraining, prefix→single-word batches, position-tied optimizer UI, unlabeled/misleading chart axes, hard-coded stats with no source/"illustrative" tag.

## 3. Interactive-first / gamification — `.cursor/rules/session-interactive-first.mdc`

**Applies to:** `content/sessions/**/*.mdx`, `components/session/**/*.tsx`, `components/shared/**/*.tsx`.

- Every concept gets an animation or interactive diagram — static bullet lists are notes, not slides.
- Before building anything new, check `docs/component-gallery.md`'s chooser table for an existing match; reuse over rebuilding.
- New components: one idea per animation, step-through (Prev/Next/Play) over walls of content, tabs for parallel examples (never tall vertical stacks), color/motion as signal (not decoration), animate failure paths too, large obvious controls (`text-base md:text-lg`, `py-3 px-5`+).
- Never let interactivity override accuracy (rule #2) or legibility (rule #4).

## 4. Simple English — `.cursor/rules/session-simple-english.mdc`

**Applies to:** `content/sessions/**/*.mdx`, `components/session/**/*.tsx`, `data/facts/**`, `docs/component-gallery.md`.

- Plain words on every label/step/caption: "remove duplicates" not "deduplication", "bot saves the page" not "WARC archive ingestion". One idea per line; prefer concrete verbs.
- Technical terms (token, batch, loss, weights) are fine when they **are** the lesson, not filler.
- Simple ≠ wrong — still apply rule #1's search/citation gate.

## 5. Session and video legibility — `.cursor/rules/session-video-legibility.mdc`

**Applies to:** `components/session/**/*.tsx`, `components/shared/**/*.tsx`, `app/sessions/**/*.tsx`, `app/component-gallery/**/*.tsx`, `content/sessions/**/*.mdx`.

- These are slides recorded for YouTube 1080p / presenter mode, not a dense app UI. When unsure between two sizes, pick the larger one.
- Hard floors: headings `text-xl md:text-2xl`+, body `text-lg md:text-xl`+, section labels/buttons `text-base md:text-lg`+ bold. **Banned everywhere:** `text-xs`, `text-sm` as teaching copy, arbitrary `text-[Npx]` below 14px, faint gray-500+ on dark shells.
- **One-screen presenter fit is mandatory** — the active step of an animation must be readable with **zero vertical scroll** in `?view=present`. If the presenter must scroll, the slide is a shipped defect: cut a row, cut a section, or move content behind a tab/step — never shrink type or padding to cram more in.
- Token/weight/card grids: one row (3–4 items) on slide-scale panels; use "… + N more" in the caption for the rest.
- New components must meet this from the first commit; editing an existing component means upgrading **all** its typography, not just the touched lines.

## 6. PPT slide style — title + one animation only — `.cursor/rules/ppt-title-diagram-only.mdc`

**Applies to:** `content/sessions/**/*.mdx`, `components/session/**/*.tsx`, `components/shared/**/*.tsx`.

- Every session opens with an outline slide: frontmatter `outline` (3–6 short noun-phrase items) + `outlineSectionMap` (maps `SessionSection` id → outline index), and MDX `## What we'll cover` + `<SessionOutlineSlide />` with no prose.
- Every other slide: exactly one `##` heading + one animated/interactive component. Never two animated components under one heading, never paragraph/bullet text between title and component. Split into two slides if a topic needs two visuals.
- When touching a session that lacks the outline pattern, add it (frontmatter + `SessionOutlineSlide`) and verify the tracker pills in `?view=present`.

## 7. Shorts — manual navigation — `.cursor/rules/shorts-manual-navigation.mdc`

**Applies to:** `components/shorts/**/*.tsx`, `data/shorts.ts`. (Not always-on in the original Cursor config — only relevant when touching Shorts.)

- Shorts are presented live: default to manual step-through (`isPlaying` starts `false`), advance only on Prev/Next/dot-jump, never auto-advance timers unless explicitly requested.
- LLM-generation examples use a real chat shape: user question, then answer built **one token at a time** — not prefix-completion ("The capital of France is ___") as the main story.
- Multi-phase steps (input → scores → pick → concat) are driven by Next/Prev, not `setTimeout` chains; reset phase index on step change.
- The phone frame's animation zone is `overflow-hidden` with no scroll — never stack multiple content cards vertically in one step. If a step has 2+ cards/examples (e.g. request card + result card), add a second tab row so only one card shows at a time.

---

## Skills

Authoring workflows live as Claude Code skills under `.claude/skills/` (ported from `.cursor/skills/`, same content):

- `session-authoring` — creating/editing `content/sessions/**/*.mdx`, session components, MDX registry wiring.
- `shorts-authoring` — creating a new YouTube Shorts concept animation end-to-end.
- `deploy-site` — **use on every commit/push request**: static-build check, commit, push `main`, then `npm run deploy:pages` to update the live GitHub Pages site.

Both skills still point at the `.cursor/rules/*.mdc` files above for full rule text — those files remain the source of truth; this CLAUDE.md is the condensed always-loaded summary.
