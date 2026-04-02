# Joee's GenAI from the Ground Up

A story-driven GenAI course site built with Next.js App Router, TypeScript, and Tailwind CSS.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4 with `@tailwindcss/postcss`
- Reusable, data-driven session components

## Project structure

```text
app/
  page.tsx
  layout.tsx
  globals.css
  not-found.tsx
  library/page.tsx
  module/[id]/page.tsx
  session/[slug]/page.tsx
components/
  layout/
  session/
  ui/
data/
  sessions.ts
lib/
  session-types.ts
  sessions.ts
  utils.ts
```

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Run with Docker

### Fast dev run

Use this for daily UI/code iteration. Your local files are mounted into the container, so normal source edits are picked up without rebuilding the image.

```powershell
docker compose -f docker.yaml up
```

Open `http://localhost:3000`.

Rebuild only when `package.json`, `package-lock.json`, `Dockerfile`, or `docker.yaml` changes:

```powershell
docker compose -f docker.yaml up --build
```

### Safest clean restart

Use this when you want to guarantee the app is rebuilt from a clean state and avoid stale `.next` / container cache issues.

```powershell
docker compose -f docker.yaml down -v
if (Test-Path -LiteralPath '.next') { Remove-Item -LiteralPath '.next' -Recurse -Force }
docker compose -f docker.yaml build --no-cache app
docker compose -f docker.yaml up --force-recreate
```

Open `http://localhost:3000`.

### Practical rule

- Use the **fast dev run** by default.
- Use the **safest clean restart** only when the browser still shows an old error, screenshots look stale/blank, or dependency/Docker config changed.
