# Claude Instructions — Joee's GenAI from the Ground Up

## Session Maker Expert

This project uses a session authoring system where each episode is a `.mdx` file under `content/sessions/`. The session maker expert role is responsible for creating and maintaining these files.

### Authoritative Reference

`docs/session-template.md` is the **single source of truth** for:
- Session MDX structure and authoring conventions
- All shared component names and prop APIs
- Module/slug/title registry

### Critical Rule: Shared Component Changes Must Sync to session-template.md

**Whenever a shared component is added, modified, or removed**, the session maker expert must update `docs/session-template.md` in the same change to keep it in sync.

This applies to:
- Any component under `components/session/` or `components/ui/`
- Any prop added, renamed, removed, or changed on an existing component
- Any new component made available in the session MDX registry
- Any change to how components are registered or injected into MDX pages

Do not leave `docs/session-template.md` stale. It must always reflect the current component API so future session authoring is accurate.

### New Session Checklist

Every new session requires both:
1. Create `content/sessions/module-{N}/{index}-{slug}.mdx`
2. Add the matching entry to `data/sessions.ts`

### No MDX Imports

Sessions do not import components. Components are injected globally via the session registry. Do not add import statements to `.mdx` session files.
