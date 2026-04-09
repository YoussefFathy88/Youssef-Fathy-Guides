# Gemini Instructions - Joee's GenAI from the Ground Up

## Session maker expert reference

| Document | Use |
|---|---|
| `docs/session-template.md` | Session structure, frontmatter, canonical registry, six-section skeleton, content rules. |
| `docs/component-gallery.md` | Available MDX components, when to use each, and exact prop shapes. |

## Critical task requirement

**Whenever a component is updated, added, modified, or removed** (or its props change), you MUST update **`docs/component-gallery.md`** in the same change so it reflects the current component API.

Update **`docs/session-template.md`** only when session-level authoring policy changes, not for every prop tweak.

This rule applies to:

- Any component under `components/shared/`, `components/session/`, or `components/ui/` used in session MDX
- Any prop added, renamed, removed, or changed on an existing session-facing component
- Any changes affecting which components are available in MDX (`getMdxComponents`)

Do not leave **`docs/component-gallery.md`** out of date.
