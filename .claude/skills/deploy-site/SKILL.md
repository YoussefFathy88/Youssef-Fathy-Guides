---
name: deploy-site
description: >-
  Checks, commits, pushes, and publishes the website to GitHub Pages
  (https://yousseffathy88.github.io/Youssef-Fathy-Guides/). Use EVERY time you
  are asked to commit or push in this repo ("commit", "push", "commit and push",
  "push on my github", "ship it", "deploy", "update the site", "publish").
---

# Deploy site (commit → push → publish)

The live site is a static export served from the `gh-pages` branch of
`YoussefFathy88/Youssef-Fathy-Guides`. GitHub Actions is blocked on this account
(billing lock), so pushing `main` does NOT update the site by itself. This skill
does it.

## Steps

1. **Check the static build before committing.** Run from the repo root:

   ```bash
   MSYS_NO_PATHCONV=1 STATIC_EXPORT=1 PAGES_BASE_PATH=/Youssef-Fathy-Guides npx next build --webpack
   ```

   (Git Bash rewrites `/Youssef-Fathy-Guides` into a Windows path without
   `MSYS_NO_PATHCONV=1`; in PowerShell set the env vars with `$env:NAME = '...'`.)
   If it fails, fix the cause first (common ones: an unclosed MDX tag, a dynamic
   route missing `generateStaticParams`, a page reading `searchParams` without the
   `NEXT_PUBLIC_STATIC_EXPORT` guard, a `public/` image path not wrapped in
   `withBasePath`). Do not commit a change that breaks this build.
   Remove the `out/` folder afterwards if you don't need it (it is gitignored).

2. **Commit only the files for this task.** The working tree often has unrelated
   uncommitted edits by the user. Stage paths explicitly, never `git add -A`.

3. **Push `main`:**

   ```bash
   git push https://github.com/YoussefFathy88/Youssef-Fathy-Guides.git main
   ```

4. **Publish the site:**

   ```bash
   npm run deploy:pages
   ```

   This builds the last commit (HEAD) in a clean temporary checkout, so
   uncommitted edits are never published, then force-pushes the result to
   `gh-pages`. It takes about a minute.

5. **Verify** with `gh api repos/YoussefFathy88/Youssef-Fathy-Guides/pages/builds/latest --jq .status`
   (wait for `built`), then open the changed page under
   `https://yousseffathy88.github.io/Youssef-Fathy-Guides/` and confirm it shows
   the change.

6. **Tell the user** the commit hash and the live link of the page that changed.

## Notes

- Presenter mode (`?view=present`) is local-only; the static site hides its link.
- A push that adds or changes `.github/workflows/*` needs the `workflow` scope on
  the gh login (`gh auth refresh -h github.com -s workflow`).
- Each push to `main` shows a failed "Deploy to GitHub Pages" Actions run until
  the billing lock is fixed. That is expected and does not affect the live site.
- Once billing is fixed: set Settings → Pages → Source to "GitHub Actions" and
  the workflow in `.github/workflows/deploy-pages.yml` deploys on every push;
  then step 4 is no longer needed.
