---
name: create-genai-session
description: Draft, revise, or continue" session files in this repo. Use when Codex needs to create the next course session, author a specific session MDX file under content/sessions/, update a session to match docs/session-template.md, or sync the matching entry in data/sessions.ts. Best for requests like "create the next session", "draft E04", "turn this outline into a session", or "fix this session to match the template."
---

# Create GenAI Session

## Overview

Use the repo's canonical session template and course metadata to create or update session MDX files with minimal prompting. Treat `docs/session-template.md` as the authoring contract, `data/sessions.ts` as the canonical session list, and nearby session MDX files as style and continuity references.

## Default Behavior

When the user says "create the next session", infer the target session from `data/sessions.ts` and the existing files under `content/sessions/`.

- Prefer the next canonical session whose MDX file does not exist yet.
- If the target MDX file already exists, treat the request as a revision/update unless the user explicitly asks for a replacement.
- Keep slug, title, module, and ordering aligned with `data/sessions.ts`.

When the user names a specific session, use the canonical slug/title/module from `data/sessions.ts` instead of inventing them.

## Required Reads

Always read these files first:

- `docs/session-template.md`
- `data/sessions.ts`

Then read the target and nearby MDX context:

- The target session MDX if it already exists
- The previous session MDX in the same module if it exists
- The next session MDX if it exists and helps with continuity

Read component source files only when needed to confirm props or capabilities. Do not bulk-read every shared component by default.

## Workflow

1. Identify the target session.
2. Read `docs/session-template.md` and `data/sessions.ts`.
3. Resolve the correct file path under `content/sessions/module-{N}/{index}-{slug}.mdx`.
4. Read the nearest relevant session MDX files for tone, continuity, and next/previous linkage.
5. Draft or update the session in the six-section format from the template.
6. Sync `data/sessions.ts` if the request adds a new session or changes canonical metadata.
7. Validate the file structure and component usage before finishing.

## Authoring Rules To Enforce

- Keep the six sections in this exact order:
  - `goal`
  - `big-picture`
  - `core-concepts`
  - `practical-example`
  - `recap`
  - `next-session`
- Do not write MDX import statements.
- Keep narration blocks short and consistent with the template.
- Use `RecapTable` only in Section 5.
- Use `NextSessionCard` only in Section 6.
- Never pass inline functions to `ParameterSlider`; use the `states` array shape from the current component API.
- Keep frontmatter aligned with the filename and canonical slug.
- Use real slugs from `data/sessions.ts`; do not invent neighboring session slugs.

## Sync Rules

When creating or revising a session, keep these in sync when applicable:

- `content/sessions/.../{index}-{slug}.mdx`
- The matching canonical entry in `data/sessions.ts`
- `prevSession` and `nextSession` frontmatter in the target MDX

If the request inserts a new session between existing ones, also update neighboring linkage where needed so the sequence stays coherent.

## Validation Checklist

Before finishing, verify all of the following:

- Filename matches the canonical slug and numeric prefix.
- Frontmatter uses numeric `module` and `sessionNumber`.
- `prevSession` uses `null` without quotes when appropriate.
- The six `SessionSection` blocks exist in the correct order.
- No MDX imports are present.
- Shared component props match the current implementation.
- `ParameterSlider` uses `max`-based `states`, not `upTo`, `label`, or inline functions.
- `data/sessions.ts` stays aligned with the session being authored.

## Minimal Inputs From The User

For the most efficient workflow, these prompts are enough:

- `Use $create-genai-session to create the next session.`
- `Use $create-genai-session to draft E04.`
- `Use $create-genai-session to update the tokenization session using the latest template.`

If the user wants a better first draft, these extra inputs help but are optional:

- A preferred teaching angle
- Specific real-world examples to include
- Components they want emphasized or avoided
- Whether to create only the MDX file or also update `data/sessions.ts`

If none of that is provided, infer a sensible draft from the canonical session title, adjacent sessions, and the template.
