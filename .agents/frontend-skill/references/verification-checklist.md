# Frontend Verification Checklist

Use this checklist when frontend quality depends on the real rendered result rather than code-only reasoning.

## Runtime

- Prefer a production-style server for final checks: `build` then `start`.
- Use a fresh port for each clean verification pass when stale processes are likely.
- Clear local build cache when the UI behaves inconsistently after route or shared-component changes.
- Keep Docker as fallback, but prefer the local runtime when it is stable.
- Verify that the server you are hitting is the one you just started.
- If the port is already occupied, do not assume the running process is correct; restart on a fresh port or stop the old process first.
- After rebuilding, restart the verification server before judging the UI.

## Subagent Recording Loop

- Instruct the `browser_subagent` to use one fixed desktop viewport for before/after comparisons.
- If the task targets demos, teaching, slides, or YouTube, also verify the presentation viewport using the subagent.
- Dispatch the subagent to capture the same route, same state, and same interaction before and after every meaningful change.
- Review the automatic WebP recording and screenshot artifacts returned.
- If an artifact is blank, all-white, obviously stale, or missing the expected component, do not use it as evidence.
- Cross-check suspicious visual artifacts against the DOM HTML returned by the subagent and measured metrics before concluding anything about the UI.
- Prefer relying on the subagent's deterministic artifacts rather than assumed runtime states.

## Scope Of Truth

- Use isolated component-lab routes to judge component quality.
- Use integrated app routes to judge layout, spacing, and page-level consistency.
- If a component looks good in isolation but bad in the app, debug the page container before changing the component geometry again.
- Beware of `ResizeObserver` edge cases in presentation views or scaled frameworks (like Reveal.js). Scaling a parent's CSS transform can drastically reduce available viewport boundaries for child SVGs or Flex elements!
- When scaling up components for legibility, check the coordinate mapping constraints (like MDX percentage-based `X` and `Y` values). Increasing component fixed sizes without adjusting their coordinate layout mapping will cause intersections in scaled containers. 
- If the app route and lab route disagree, first verify runtime freshness and prop delivery before redesigning the component.

## Acceptance Rules

- No node or block overlaps.
- No clipped text.
- No group or section labels colliding with content.
- No arrows or connectors obscuring important labels or icons.
- Controls, captions, and inspector panels fit without crowding the main visual.
- The result is readable at paused-video scale when the task is presentation-oriented.

## Debugging Order

- First fix runtime crashes or missing-prop issues.
- Then fix width, container, and canvas sizing.
- Then fix component geometry and spacing.
- Only after shared fixes are exhausted should you add per-page or per-diagram tuning.
- If the verification path itself is unreliable, stop and repair the verification environment before making more UI changes.

## Reporting

- Separate confirmed improvements from remaining issues.
- Separate UI findings from unrelated repo debt such as existing lint or build warnings.
- Do not call a visual issue fixed until the rendered output has been checked via `browser_subagent`.
- If verification confidence is reduced by stale servers, bad visual artifacts, or inconsistent states, say that explicitly.
