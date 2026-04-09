# Codex Instructions - Joee's GenAI from the Ground Up

## Golden references for session authoring

| Document | Use |
|---|---|
| `docs/session-template.md` | Session structure, frontmatter, canonical modules/slugs, six-section MDX skeleton, narrative rules. |
| `docs/component-gallery.md` | Every MDX component: chooser tables, summary, and prop / TypeScript interfaces. |

## Critical sync rule

Whenever any shared session component is **added, updated, renamed, or removed**, or its **props** change:

- Update **`docs/component-gallery.md`** in the **same change** (chooser, summary table, and interface sections).
- Update **`docs/session-template.md`** only if **session-level** authoring rules change (not for routine prop-only edits).

This applies to:

- Components under `components/shared/`
- Session components under `components/session/` and `components/ui/` that appear in MDX
- Registry/injection changes in `app/sessions/[slug]/page.tsx` (`getMdxComponents`)

Do not leave **`docs/component-gallery.md`** stale.
