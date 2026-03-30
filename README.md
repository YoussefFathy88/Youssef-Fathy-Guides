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

```bash
docker compose -f docker.yaml up --build
```

Then open `http://localhost:3000`.
