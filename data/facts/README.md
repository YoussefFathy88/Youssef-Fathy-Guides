# Session fact sheets

Canonical, verified facts for teaching content. **Session components must not hard-code paper numbers or mechanisms** — import from here when a sheet exists.

## Accuracy gate — web search required

Before **any** edit to these files or related slide copy:

1. **List claims** you plan to change.
2. Run **`web_search`** (or `WebFetch` on the primary paper/doc URL) — see `.cursor/rules/content-accuracy-all-topics.mdc`.
3. **Claim table with ✓/✗** in your response — only then edit JSON/TS/components.
4. Re-search when updating copy — fact sheets are not a substitute for verification.

Rules: `content-accuracy-all-topics.mdc`, `session-educational-accuracy.mdc`, `session-simple-english.mdc`.

## Files

| File | Purpose |
|---|---|
| `gpt3-training-data.json` | **Hard facts** — numbers, mechanisms, citations (must match web-search verification) |
| `gpt3-training-data.ts` | Teaching copy + builders; numbers read from JSON only |

## Claim tiers

| Tier | Rule | Example |
|---|---|---|
| **hard** | Must match primary source + JSON | Token counts, documented filters |
| **pedagogical** | Simplified; never implied as paper fact | "Self-published books" for Books1 |

## Adding a new topic

1. **Web search** the primary source first.
2. Add `{topic}.json` with cited hard facts.
3. Add `{topic}.ts` with `build*` helpers and teaching copy.
4. Wire the session component to import from `data/facts/`.
