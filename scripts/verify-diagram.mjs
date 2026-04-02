#!/usr/bin/env node

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const result = {
    baseUrl: process.env.DIAGRAM_BASE_URL ?? "http://127.0.0.1:3000",
    slug: "",
    diagram: "",
    surface: "lab",
    viewport: "1600x1100",
    step: null,
    headed: false,
    outdir: path.join(process.cwd(), "output", "diagram-verification"),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--base-url" && next) {
      result.baseUrl = next;
      i += 1;
    } else if (arg === "--slug" && next) {
      result.slug = next;
      i += 1;
    } else if (arg === "--diagram" && next) {
      result.diagram = next;
      i += 1;
    } else if (arg === "--surface" && next) {
      result.surface = next;
      i += 1;
    } else if (arg === "--viewport" && next) {
      result.viewport = next;
      i += 1;
    } else if (arg === "--step" && next) {
      result.step = Number.parseInt(next, 10);
      i += 1;
    } else if (arg === "--outdir" && next) {
      result.outdir = path.resolve(next);
      i += 1;
    } else if (arg === "--headed") {
      result.headed = true;
    }
  }

  if (!["lab", "session"].includes(result.surface)) {
    throw new Error(`Invalid --surface value "${result.surface}". Use "lab" or "session".`);
  }

  if (result.surface === "session" && !result.slug) {
    throw new Error("Missing required --slug argument for --surface session.");
  }

  if (!result.diagram) {
    throw new Error("Missing required --diagram argument.");
  }

  const viewportMatch = /^(\d+)x(\d+)$/.exec(result.viewport);
  if (!viewportMatch) {
    throw new Error(`Invalid --viewport value "${result.viewport}". Use WIDTHxHEIGHT, for example 1600x1100.`);
  }

  result.viewportWidth = Number.parseInt(viewportMatch[1], 10);
  result.viewportHeight = Number.parseInt(viewportMatch[2], 10);

  if (result.step != null && (!Number.isFinite(result.step) || result.step < 1)) {
    throw new Error("The optional --step value must be a 1-based positive integer.");
  }

  return result;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const stamp = timestamp();
  const runDir = path.join(args.outdir, `${args.slug}-${args.diagram}-${stamp}`);
  await mkdir(runDir, { recursive: true });

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({
    viewport: { width: args.viewportWidth, height: args.viewportHeight },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const targetPath =
    args.surface === "lab"
      ? `/diagram-lab/${args.diagram}`
      : `/sessions/${args.slug}`;
  const url = new URL(targetPath, args.baseUrl).toString();
  await page.goto(url, { waitUntil: "networkidle" });

  const diagramSelector = `[data-diagram-id="${args.diagram}"]`;
  const diagram = page.locator(diagramSelector);
  await diagram.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(600);

  if (args.step != null) {
    const stepIndex = args.step - 1;
    const stepDot = page.locator(
      `[data-diagram-step-dot="${args.diagram}"][data-step-index="${stepIndex}"]`,
    );
    await stepDot.waitFor({ state: "visible", timeout: 10000 });
    await stepDot.click();
    await page.waitForTimeout(450);
  }

  const pageShotPath = path.join(runDir, "page.png");
  const diagramShotPath = path.join(runDir, "diagram.png");
  const canvasShotPath = path.join(runDir, "canvas.png");
  const pageHtmlPath = path.join(runDir, "page.html");
  const metricsPath = path.join(runDir, "metrics.json");
  const summaryPath = path.join(runDir, "summary.json");

  await page.screenshot({ path: pageShotPath, fullPage: true });
  await diagram.screenshot({ path: diagramShotPath });
  await page.locator(`[data-diagram-canvas="${args.diagram}"]`).screenshot({ path: canvasShotPath });
  await writeFile(pageHtmlPath, await page.content(), "utf8");

  const metrics = await page.evaluate((diagramId) => {
    const host = document.querySelector(`[data-diagram-id="${diagramId}"]`);
    if (!host) throw new Error(`Diagram ${diagramId} not found in page.`);

    const collect = (selector, mapFn) =>
      Array.from(host.querySelectorAll(selector)).map((element) => {
        const rect = element.getBoundingClientRect();
        return mapFn(element, {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      });

    const diagramRect = host.getBoundingClientRect();
    const detailPanel = host.querySelector(`[data-diagram-detail-panel="${diagramId}"]`);
    const activeDot = host.querySelector(`[data-diagram-step-dot="${diagramId}"][class*="bg-blue-400"]`);
    const title = host.querySelector("[data-diagram-title]");

    return {
      title: title?.textContent?.trim() ?? null,
      diagramId,
      diagramRect: {
        x: Math.round(diagramRect.x),
        y: Math.round(diagramRect.y),
        width: Math.round(diagramRect.width),
        height: Math.round(diagramRect.height),
      },
      detailPanelRect: detailPanel
        ? (() => {
            const rect = detailPanel.getBoundingClientRect();
            return {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          })()
        : null,
      currentStepIndex:
        activeDot != null ? Number.parseInt(activeDot.getAttribute("data-step-index") ?? "-1", 10) : null,
      groups: collect("[data-group-id]", (element, rect) => ({
        id: element.getAttribute("data-group-id"),
        label: element.getAttribute("data-group-label"),
        rect,
      })),
      nodes: collect("[data-node-id]", (element, rect) => ({
        id: element.getAttribute("data-node-id"),
        shape: element.getAttribute("data-node-shape"),
        rect,
        label: element.querySelector("text")?.textContent?.trim() ?? null,
      })),
      edges: collect("[data-edge-key]", (element, rect) => ({
        key: element.getAttribute("data-edge-key"),
        from: element.getAttribute("data-edge-from"),
        to: element.getAttribute("data-edge-to"),
        rect,
      })),
    };
  }, args.diagram);

  await writeFile(metricsPath, JSON.stringify(metrics, null, 2), "utf8");

  const summary = {
    slug: args.slug,
    diagram: args.diagram,
    surface: args.surface,
    url,
    viewport: {
      width: args.viewportWidth,
      height: args.viewportHeight,
    },
    requestedStep: args.step,
    resolvedStepIndex: metrics.currentStepIndex,
    artifacts: {
      pageScreenshot: pageShotPath,
      diagramScreenshot: diagramShotPath,
      canvasScreenshot: canvasShotPath,
      pageHtml: pageHtmlPath,
      metrics: metricsPath,
    },
  };

  await writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf8");
  await browser.close();

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
