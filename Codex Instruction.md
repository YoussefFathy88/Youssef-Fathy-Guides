# Codex Instructions - Joee's GenAI from the Ground Up

## Golden Reference for Session Authoring

`docs/session-template.md` is the single source of truth for session structure, available MDX components, and component prop APIs used by the session maker expert.

## Critical Sync Rule

Whenever any shared session component is added, updated, renamed, or removed, `docs/session-template.md` must be updated in the same change so it always reflects the current component API.

This applies to:
- Components under `components/shared/`
- Session components under `components/session/`
- New or changed props on existing components
- Registry/injection changes that alter which components are available in MDX

Do not leave `docs/session-template.md` stale.
