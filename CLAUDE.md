# Claude Instructions — Joee's GenAI from the Ground Up

## Session Maker Expert

This project uses a session authoring system where each episode is a `.mdx` file under `content/sessions/`. The session maker expert role is responsible for creating and maintaining these files.

### Authoritative references

| Document | Purpose |
|---|---|
| `docs/session-template.md` | Session structure: frontmatter, canonical modules/slugs, six-section MDX skeleton, narrative and prop-safety rules. |
| `docs/component-gallery.md` | MDX component catalog: chooser tables, summary table, and TypeScript-style prop interfaces for every registry component. |

### Critical rule: keep docs in sync with components

**Whenever a shared component is added, modified, or removed** for session MDX, update documentation in the **same change**:

1. **`docs/component-gallery.md`** — names, descriptions, chooser rows, summary table row, and **interface/props** for any affected component. This is required for **any** change to props or registry visibility.
2. **`docs/session-template.md`** — only if you change **session-level** rules (section order, frontmatter conventions, global authoring policy), not for routine prop tweaks.

This applies to:

- Any component under `components/session/` or `components/ui/` that appears in session MDX
- Any prop added, renamed, removed, or changed on an existing session-facing component
- Any new component wired into `getMdxComponents` in `app/sessions/[slug]/page.tsx`
- Any change to how components are registered or injected into MDX pages

Do not leave **`docs/component-gallery.md`** stale. It must reflect the current component API so agents and authors can plan sessions accurately.

### New session checklist

Every new session requires both:

1. Create `content/sessions/module-{N}/{index}-{slug}.mdx`
2. Add the matching entry to `data/sessions.ts`

### No MDX imports

Sessions do not import components. Components are injected globally via the session registry. Do not add import statements to `.mdx` session files.
