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

## Run with Antigravity (No-Admin / Portable Node)

If you don't have Node.js or Docker installed (or lack admin rights), use the portable setup:

1. **One-time Setup** (Downloads Node.js locally):
   ```powershell
   .\setup_node.ps1
   ```

2. **Run the Website**:
   ```powershell
   .\dev.ps1
   ```

3. **Test from another laptop**:
   Ensure you are on the same network and open `http://<your-ip>:3000` on the other device.
