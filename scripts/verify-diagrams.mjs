#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const TARGETS = [
  { slug: "how-llms-work", diagram: "llm-lifecycle-training-inference" },
  { slug: "tokens-context-window", diagram: "tokens-to-context-window" },
  { slug: "embeddings", diagram: "embeddings-entry-point" },
  { slug: "transformer-attention", diagram: "transformer-block-overview" },
  { slug: "transformer-attention", diagram: "scratchpad-vs-fast-mode" },
  { slug: "agent-memory-types", diagram: "agent-memory-types-overview" },
  { slug: "rag", diagram: "rag-retrieval-loop" },
  { slug: "tools-and-function-calling", diagram: "tool-use-loop" },
];

function parseArgs(argv) {
  const result = {
    baseUrl: process.env.DIAGRAM_BASE_URL ?? "http://127.0.0.1:3000",
    viewport: "1600x1100",
    surface: "lab",
    outdir: path.join(process.cwd(), "output", "diagram-verification"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--base-url" && next) {
      result.baseUrl = next;
      index += 1;
    } else if (arg === "--viewport" && next) {
      result.viewport = next;
      index += 1;
    } else if (arg === "--surface" && next) {
      result.surface = next;
      index += 1;
    } else if (arg === "--outdir" && next) {
      result.outdir = path.resolve(next);
      index += 1;
    }
  }

  return result;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
    });

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

async function main() {
  const args = parseArgs(process.argv.slice(2));

  for (const target of TARGETS) {
    const commandArgs = [
      path.join("scripts", "verify-diagram.mjs"),
      "--surface",
      args.surface,
      "--base-url",
      args.baseUrl,
      "--slug",
      target.slug,
      "--diagram",
      target.diagram,
      "--viewport",
      args.viewport,
      "--outdir",
      args.outdir,
    ];

    await runCommand(process.execPath, commandArgs);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
