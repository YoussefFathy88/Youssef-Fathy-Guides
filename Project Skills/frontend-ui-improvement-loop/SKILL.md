---
name: frontend-ui-improvement-loop
description: Improve, debug, or polish frontend UI with real verification. Use when Codex needs to fix layout, spacing, responsiveness, interaction, animation, readability, or visual regressions and must confirm the result by running the app, checking build/lint health, opening the UI in a browser, capturing screenshots, and iterating from actual rendered output instead of code-only guesses.
---

# Frontend UI Improvement Loop

Use this skill to make frontend changes only after establishing a reliable validation loop.

## Workflow

1. Establish the runtime path before touching UI code.
   Prefer local `npm`/`node` when available.
   Fall back to Docker or `docker compose` when the local runtime is missing or inconsistent.

2. Check the project health baseline.
   Run the smallest commands that tell you whether the repo can support trustworthy UI iteration:
   - install deps if needed
   - run `build`
   - run `lint`
   - note unrelated repo blockers separately from the UI task

3. Start the app and verify the real page.
   Use the real browser path whenever possible.
   If `$playwright` is available, use it to open the page, capture screenshots, and inspect interaction states.
   Do not treat code review alone as visual verification.
   Confirm that the server you are looking at is the one you intended to start.
   If the port is occupied, stale, or ambiguous, stop and fix that first.

4. Capture a baseline before making layout changes.
   Save screenshots of the exact pages or states being improved.
   Use fixed viewport sizes so before/after comparisons are meaningful.
   If a screenshot is blank, all-white, obviously stale, or missing the expected UI, treat it as a broken verification artifact rather than a frontend result.

5. Make the smallest change that addresses the visible problem.
   Prefer shared renderer/layout fixes before per-page overrides.
   If a shared fix is too risky, use explicit page-level layout hints and say so.

6. Re-run the same validation loop after each meaningful change.
   Rebuild when type or route changes are involved.
   Reopen the same pages.
   Re-capture screenshots at the same viewport.
   Compare the new result against the baseline and acceptance rules.

7. Report outcomes clearly.
   Separate:
   - confirmed UI improvements
   - remaining visual issues
   - unrelated repo debt discovered during validation

## Working Rules

- Optimize for real rendered clarity, not theoretical neatness.
- Treat presenter-mode readability as the stricter target when the task mentions demos, teaching, slides, or YouTube.
- Keep descriptions outside dense diagrams when internal text reduces clarity.
- Favor stable spacing, readable labels, and calm connector routing over decorative complexity.
- Avoid declaring a UI issue fixed until you have checked the rendered result.
- Do not trust a browser artifact until runtime freshness is confirmed.
- When page screenshots, HTML, metrics, and live route behavior disagree, debug the verification path before changing the UI again.

## Validation Order

- First: `build`
- Second: `lint`
- Third: run the app
- Fourth: browser inspection and screenshots
- Fifth: implementation
- Sixth: repeat verification

If `lint` has unrelated pre-existing failures but `build` is clean, continue UI work only if the browser verification path is still trustworthy. Call out the lint debt explicitly instead of silently ignoring it.

## Browser Review

Use a fixed desktop viewport for iteration.
If the user cares about presentation or recorded video, also test the presentation viewport.

Prefer the fastest live dev loop first. Do a fresh clean restart/check only when there is a concrete signal that the current runtime may be stale or untrustworthy, for example:
- the browser still shows an old error after a code fix
- screenshots/HTML/metrics disagree with the code you just edited
- host files and container-served files may be out of sync
- a package, lockfile, Dockerfile, Docker compose file, or framework config changed
- a blank/white/stale screenshot appears and route checks do not explain it

When one of those signals appears, run the smallest reliable reset sequence for the active runtime, then re-open the same route and re-capture the same state. For this repo's dev Docker flow, that usually means stopping the app, clearing `.next`, recreating the container, and verifying the route again.

When screenshots look suspicious:

- verify the route returns successfully
- verify the build/server process is fresh
- verify the artifact timestamp matches the current run
- compare the screenshot with page HTML and measured metrics
- restart on a fresh port if there is any doubt about stale state

Read [references/acceptance-checklist.md](./references/acceptance-checklist.md) when you need the standard acceptance criteria and review loop.

## Output Standard

When closing the task:
- say what was visually improved
- say how it was verified
- mention any remaining issues or repo blockers that still affect confidence
