# Gemini Instructions - Joee's GenAI from the Ground Up

## Session Maker Expert Reference

`docs/session-template.md` is the **golden reference** for the session Maker expert. It defines the session structure, available MDX components, and component prop APIs.

## Critical Task Requirement

**Whenever a component is updated, added, modified, or removed**, you MUST ensure that `docs/session-template.md` is kept up-to-date in the same change so it always reflects the exact current component API.

This rule applies specifically to:
- Any component under `components/shared/`, `components/session/`, or `components/ui/`
- Any prop added, renamed, removed, or changed on an existing component
- Any changes affecting available components within MDX sessions

Do not leave `docs/session-template.md` out of date.
