#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const result = {
    port: 3020,
    viewport: "1600x1100",
    surface: "lab",
    diagram: "",
    slug: "",
    step: null,
    outdir: path.join(process.cwd(), "output", "diagram-verification"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--port" && next) {
      result.port = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--viewport" && next) {
      result.viewport = next;
      index += 1;
    } else if (arg === "--surface" && next) {
      result.surface = next;
      index += 1;
    } else if (arg === "--diagram" && next) {
      result.diagram = next;
      index += 1;
    } else if (arg === "--slug" && next) {
      result.slug = next;
      index += 1;
    } else if (arg === "--step" && next) {
      result.step = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--outdir" && next) {
      result.outdir = path.resolve(next);
      index += 1;
    }
  }

  return result;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const spawnOptions = {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
      ...options,
    };
    const child =
      process.platform === "win32"
        ? spawn("cmd.exe", ["/c", command, ...args], spawnOptions)
        : spawn(command, args, spawnOptions);

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}.`));
    });
  });
}

function getNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

async function waitForServer(baseUrl, targetPath, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(new URL(targetPath, baseUrl), {
        redirect: "manual",
      });
      if (response.ok || response.status === 307 || response.status === 308) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${new URL(targetPath, baseUrl).toString()}.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = `http://127.0.0.1:${args.port}`;
  const startTarget =
    args.surface === "lab" && args.diagram
      ? `/diagram-lab/${args.diagram}`
      : args.surface === "lab"
      ? "/diagram-lab"
      : args.slug
      ? `/sessions/${args.slug}`
      : "/";

  await mkdir(args.outdir, { recursive: true });

  const npmCommand = getNpmCommand();

  await runCommand(npmCommand, ["run", "build"]);

  const server = spawn(npmCommand, ["run", "start", "--", "--port", String(args.port), "--hostname", "127.0.0.1"], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  try {
    await waitForServer(baseUrl, startTarget);

    if (args.diagram) {
      const verifyArgs = [
        path.join("scripts", "verify-diagram.mjs"),
        "--surface",
        args.surface,
        "--base-url",
        baseUrl,
        "--diagram",
        args.diagram,
        "--viewport",
        args.viewport,
        "--outdir",
        args.outdir,
      ];

      if (args.slug) {
        verifyArgs.push("--slug", args.slug);
      }

      if (args.step != null) {
        verifyArgs.push("--step", String(args.step));
      }

      await runCommand(process.execPath, verifyArgs);
    } else {
      await runCommand(process.execPath, [
        path.join("scripts", "verify-diagrams.mjs"),
        "--surface",
        args.surface,
        "--base-url",
        baseUrl,
        "--viewport",
        args.viewport,
        "--outdir",
        args.outdir,
      ]);
    }
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
