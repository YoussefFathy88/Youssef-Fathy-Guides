# Frontend AI Testing Playbook

This document explains how we tested frontend changes in this project, what problems happened during verification, what Playwright / Playwright CLI is, and what workflow helps an AI agent check whether a UI change is actually correct.

The key lesson from this project was simple: code review alone was not enough. For visual components like `NodeFlowDiagram`, the AI needed a real browser, real screenshots, and a repeatable verification route before layout changes became trustworthy.

## What Playwright And Playwright CLI Mean

Playwright is a browser automation tool. It can open a real browser page, wait for UI elements, click buttons, inspect the DOM, measure element bounding boxes, and save screenshots.

Playwright CLI usually means using Playwright from the terminal instead of manually opening the browser yourself. In this project, there are two related styles of usage:

- direct Playwright-based scripts in `scripts/verify-diagram.mjs`, `scripts/verify-diagrams.mjs`, and `scripts/run-diagram-review.mjs`
- `.playwright-cli/` artifacts, which are generated browser snapshots / page dumps from Playwright-driven debugging

The reason this matters is that an AI agent can use Playwright to gather visual feedback from the actual rendered page, instead of guessing from TypeScript and CSS code.

## The Verification Setup We Built

For diagram work, the most useful step was creating a stable component review surface:

- `/diagram-lab`
- `/diagram-lab/[diagramId]`

Why this helped:

- it renders the shared diagram component in isolation
- it removes unrelated session-page layout noise
- it makes overlap, spacing, and arrow-routing problems easier to inspect
- it gives a repeatable route for screenshot comparison

Then we still checked the full session route, for example `/sessions/transformer-attention`, to verify page-level integration and container width behavior.

## The Screenshot Artifacts We Captured

The verification scripts save artifacts under `output/diagram-verification/`.

Each run usually contains:

- `page.png` for the full page
- `diagram.png` for the diagram component wrapper
- `canvas.png` for just the diagram canvas
- `page.html` for the rendered HTML snapshot
- `metrics.json` for measured node, edge, group, and panel bounds
- `summary.json` for run metadata

This combination is important because screenshots alone can be misleading. The HTML and metrics help confirm whether a visual problem is caused by component geometry, page width, missing props, or a stale render.

## Best Practice Workflow For Testing Frontend Changes With AI

Use this order when asking an AI agent to modify frontend UI and prove the result.

1. Build first.

```powershell
npm run build
```

2. Start a production-style server on a fresh port.

```powershell
npm run start -- --port 3042 --hostname 127.0.0.1
```

3. Verify the route returns successfully before trusting screenshots.

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3042/sessions/rag" -UseBasicParsing
```

4. Capture a baseline screenshot and metrics from the same viewport every time.

```powershell
node scripts/verify-diagram.mjs --surface session --base-url http://127.0.0.1:3042 --slug transformer-attention --diagram transformer-block-overview --viewport 2048x1115 --outdir output/diagram-verification
```

5. Make one focused UI change.

6. Rebuild, restart the server, recapture the same route, same viewport, same state.

7. Compare:

- previous screenshot vs new screenshot
- old `metrics.json` vs new `metrics.json`
- lab route vs session route

8. Keep the change only if the rendered result is truly better.

## Problems We Faced And How To Avoid Them

### 1. Stale server on the same port

Problem:
The browser or Playwright was sometimes hitting an old `next start` process on the same port. That made it look like the code change failed, when actually the new build was not the server being tested.

Fix:

- use a fresh port for each clean verification pass
- stop the old process before starting a new one
- confirm the server logs and the route response belong to the current run

### 2. Blank or white screenshots

Problem:
Some screenshots looked empty or visually wrong even when code had changed. If those screenshots were trusted too early, they pushed debugging in the wrong direction.

Fix:

- never trust a blank, all-white, stale, or suspicious screenshot as proof of UI state
- cross-check it with `page.html`, `metrics.json`, and a direct browser route request
- confirm the target selector really exists and is visible before calling screenshot
- wait briefly after route load or interaction before capture when animations/hydration are involved

### 3. Dev mode noise and stale build artifacts

Problem:
`next dev` and stale `.next` cache could produce noisy or inconsistent verification, especially when debugging route and MDX hydration issues.

Fix:

- prefer `npm run build` + `npm run start` for final judgment
- clear `.next` when route output behaves inconsistently
- rebuild after changing shared components or route wrappers

### 4. Component lab looked good, but the session page still looked bad

Problem:
A diagram could look fine in `/diagram-lab/[diagramId]` but still appear cramped in `/sessions/[slug]`. That meant the bug was not only the diagram geometry; it was also the session page container width.

Fix:

- compare the lab route and the session route for the same diagram
- inspect container width and canvas size first
- if the session page is narrower than the lab, fix the page layout wrapper before retuning every node coordinate

### 5. Runtime crashes from missing or partial MDX props

Problem:
Several components assumed props like `rows`, `steps`, `blocks`, or `leftPhase.color` always existed. In session routes, MDX hydration could pass `undefined` or partially missing objects, which crashed the component before any visual testing was meaningful.

Fix:

- harden MDX-facing components with safe defaults
- merge partial object props into fallback objects instead of only handling `undefined`
- verify the route returns `200` and the component renders before doing visual tuning

### 6. Judging layout from screenshots only, without measurements

Problem:
Some overlap and spacing problems were hard to reason about by eye, and screenshots alone did not explain whether the issue came from one node, a group box, or the page container.

Fix:

- collect element bounds into `metrics.json`
- inspect diagram width, canvas height, node rects, group rects, and edge rects
- use the metrics to decide whether the problem is node geometry, group sizing, or route width

## Recommended Prompt Pattern When Asking AI To Improve Frontend UI

A strong request is not only "make this UI better". It should also tell the AI how to verify the change.

Example:

```text
Improve this diagram layout for YouTube readability.
Use the diagram-lab route for isolated component review and the session route for integration review.
Build the app, start a production server on a fresh port, capture before/after screenshots at 2048x1115, compare metrics.json, and do not call it fixed if screenshots are blank, stale, or from the wrong server.
```

## Good Acceptance Criteria

Use concrete visual rules so the AI knows what "better" means.

- No block or node overlaps
- No clipped text
- No section or group heading colliding with diagram content
- No arrows crossing through important labels or icons
- Consistent spacing between related objects
- Controls and explanation panels fit without crowding the main visual
- Readable at paused YouTube frame scale
- The same component looks good in both the isolated lab route and the real session page

## Related Files

- `docs/node-flow-diagram-review.md`
- `app/diagram-lab/page.tsx`
- `app/diagram-lab/[diagramId]/page.tsx`
- `lib/node-flow-diagram-lab.ts`
- `scripts/verify-diagram.mjs`
- `scripts/verify-diagrams.mjs`
- `scripts/run-diagram-review.mjs`
