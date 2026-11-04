// Builds the last commit (HEAD) as a static site and publishes it to the gh-pages branch.
// GitHub Pages serves that branch at https://yousseffathy88.github.io/Youssef-Fathy-Guides/
// Uncommitted changes are never deployed: the build runs in a clean checkout of HEAD.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE_PATH = process.env.PAGES_BASE_PATH ?? "/Youssef-Fathy-Guides";
const REMOTE_URL = "https://github.com/YoussefFathy88/Youssef-Fathy-Guides.git";
const isWindows = process.platform === "win32";

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: "inherit", shell: isWindows, ...options });
}

function git(args, cwd = process.cwd()) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

const repoRoot = git(["rev-parse", "--show-toplevel"]);
const commit = git(["rev-parse", "--short", "HEAD"]);
const tempRoot = mkdtempSync(path.join(os.tmpdir(), "gh-pages-"));
const checkout = path.join(tempRoot, "src");

console.log(`Deploying commit ${commit} to gh-pages (base path ${BASE_PATH})`);

try {
  git(["worktree", "add", "--detach", checkout, "HEAD"], repoRoot);

  // Reuse installed packages instead of running npm ci in the clean checkout.
  const nodeModules = path.join(repoRoot, "node_modules");
  if (!existsSync(nodeModules)) throw new Error("node_modules missing: run npm install first.");
  symlinkSync(nodeModules, path.join(checkout, "node_modules"), "junction");

  run("npx", ["next", "build", "--webpack"], {
    cwd: checkout,
    env: { ...process.env, STATIC_EXPORT: "1", PAGES_BASE_PATH: BASE_PATH },
  });

  const out = path.join(checkout, "out");
  // Without this file GitHub Pages runs Jekyll, which drops the _next/ folder.
  writeFileSync(path.join(out, ".nojekyll"), "");

  git(["init", "-q", "-b", "gh-pages"], out);
  git(["config", "core.autocrlf", "false"], out);
  git(["add", "-A"], out);
  git(["-c", "user.name=YoussefFathy88", "-c", "user.email=youssef8.fathy@gmail.com",
    "commit", "-q", "-m", `Deploy site from ${commit}`], out);
  run("git", ["push", "-f", REMOTE_URL, "gh-pages"], { cwd: out, shell: false });

  console.log(`\nDone. Live in about a minute at https://yousseffathy88.github.io${BASE_PATH}/`);
} finally {
  // Drop the node_modules link first so cleanup never deletes the real packages.
  const link = path.join(checkout, "node_modules");
  if (existsSync(link)) unlinkSync(link);
  if (existsSync(checkout)) git(["worktree", "remove", "--force", checkout], repoRoot);
  rmSync(tempRoot, { recursive: true, force: true });
}
