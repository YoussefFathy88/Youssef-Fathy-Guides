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

## Screenshot Loop

- Use one fixed desktop viewport for before/after comparisons.
- If the task targets demos, teaching, slides, or YouTube, also verify the presentation viewport.
- Capture the same route, same state, and same viewport before and after every meaningful change.
- Save both whole-page and component-level screenshots when possible.
- If a screenshot is blank, all-white, obviously stale, or missing the expected component, do not use it as evidence.
- Cross-check suspicious screenshots against page HTML, measured metrics, and a direct browser route check before concluding anything about the UI.
- Prefer timestamped artifacts so you can prove which capture belongs to which run.

## Scope Of Truth

- Use isolated component-lab routes to judge component quality.
- Use integrated app routes to judge layout, spacing, and page-level consistency.
- If a component looks good in isolation but bad in the app, debug the page container before changing the component geometry again.
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
- Do not call a visual issue fixed until the rendered output has been checked.
- If verification confidence is reduced by stale servers, bad screenshots, or inconsistent artifacts, say that explicitly.
