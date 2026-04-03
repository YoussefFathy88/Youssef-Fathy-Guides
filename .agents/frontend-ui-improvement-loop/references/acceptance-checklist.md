# Frontend UI Acceptance Checklist

Use this file when a frontend task needs a concrete visual review standard.

## Baseline

- Confirm the app runs.
- Confirm `build` passes, or name the exact blocker.
- Confirm whether `lint` is clean, noisy, or blocked by unrelated debt.
- Dispatch the `browser_subagent` to capture video and screenshot baselines before changing layout or styling.

## Standard Viewports

- Desktop review viewport: instruct the `browser_subagent` to use one fixed width/height for iteration.
- Presentation review viewport: instruct the `browser_subagent` to use a second fixed width/height when the UI is for demos, slides, or YouTube.
- Do not compare visual artifacts recorded at inconsistent sizes.

## Visual Acceptance Rules

- No overlapping nodes, cards, labels, badges, or controls.
- No text clipping or unreadable wrapping.
- No arrows or connectors crossing through important text or icons.
- Clear spacing between related elements.
- Group headers do not collide with their contents.
- Interactive states remain legible when selected, active, hovered, or stepped through.
- Important content is readable from a paused video frame when presentation clarity matters.

## Diagram-Specific Checks

- Prefer larger, fewer labels inside the canvas.
- Move detail copy to an external panel when internal descriptions create clutter.
- Keep step markers away from node borders and label text.
- Route connectors through clear corridors instead of squeezing through dense content.
- Use shared layout presets before hand-tuning every individual page.
- When enlarging diagram nodes, simultaneously verify that their bounding constraints (e.g., coordinate gaps derived from `x/y` attributes) are also proportionally increased to prevent overlapping.
- Beware of flexible canvas containers getting "squished" by layout engines (like Slide presentation decks). Scaling up your fixed sizes vs elastic coordinates WILL cause overlap if the viewport unexpectedly shrinks.

## Review Loop

1. Capture baseline videos and screenshots using the `browser_subagent`.
2. Apply one focused UI change.
3. Re-capture the same interaction and views at the same viewport.
4. Compare before and after.
5. Keep the change only if the rendered result is clearly better.

## Fresh Restart Rule

- Use hot reload / normal dev serving by default for speed.
- Do a fresh clean restart/check only when there is evidence of stale runtime state, mismatched artifacts, container/host drift, or dependency/config changes.
- After a reset, validate the same route and same UI state again before making more UI edits.

## Report Format

- Confirmed fixes
- Remaining visual issues
- Verification method used
- Repo blockers that are separate from the UI change
