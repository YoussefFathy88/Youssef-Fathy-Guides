# NodeFlowDiagram Review Workflow

Use this workflow when layout changes need real visual verification instead of code-only guessing.

## Review surface

The stable review route is:

- `/diagram-lab`
- `/diagram-lab/[diagramId]`

This route renders `NodeFlowDiagram` in isolation, without the rest of the session page. That makes spacing, arrow routing, and overlap issues much easier to judge.

## Default review standard

- Surface: `lab`
- Viewport: `1600x1100`
- Density: `comfortable`
- View mode: presentation-style canvas

This is the baseline for YouTube-friendly diagram review.

## Single diagram capture

Capture one diagram after the app is already running:

```bash
npm run verify:diagram -- --surface lab --diagram embeddings-entry-point --viewport 1600x1100 --step 5
```

## Capture all registered diagrams

Capture all NodeFlowDiagram lab targets against a running app:

```bash
npm run verify:diagrams -- --surface lab --base-url http://127.0.0.1:3000 --viewport 1600x1100
```

## One-command production review

Build the app, start a production server on a fixed port, wait for the lab route to become healthy, and capture screenshots:

Single diagram:

```bash
npm run review:diagram -- --diagram embeddings-entry-point --viewport 1600x1100 --step 5
```

All lab targets:

```bash
npm run review:diagram -- --viewport 1600x1100
```

## Output location

Artifacts are written under:

```text
output/diagram-verification/
```

Each run contains:

- `page.png`
- `diagram.png`
- `canvas.png`
- `page.html`
- `metrics.json`
- `summary.json`

## Acceptance checklist

- No node overlaps
- No group-title overlap
- No text clipping inside nodes
- No step badge sitting on borders
- No arrows passing through labels or icon circles
- Clear breathing room between related shapes
- Readable at paused YouTube scale
