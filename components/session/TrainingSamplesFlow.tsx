"use client";

import CommonCrawlPreparationFlow, {
  type CommonCrawlStage,
} from "./CommonCrawlPreparationFlow";

/**
 * Shared running example — simple AI blog sentence traced through every step.
 * Deliberately avoids "transformers" / "attention" jargon so the example
 * does not distract from the tokenisation & training mechanism being taught.
 */
const CLEAN_TEXT = "AI learns from reading lots of text.";

const TOKENS = ["AI", "learns", "from", "read", "ing", "lots", "of", "text", "."];
const IDS = [9468, 19444, 422, 1100, 278, 6568, 286, 2420, 13];

const TARGET_TOKENS = ["learns", "from", "read", "ing", "lots", "of", "text", ".", "<|end|>"];
const TARGET_IDS = [19444, 422, 1100, 278, 6568, 286, 2420, 13, 50256];

const RAW_HTML = `<h1>What is AI?</h1>
<nav>Home | About</nav>
<p>${CLEAN_TEXT}</p>
<div class="ad">Buy now!</div>`;

const STAGES: CommonCrawlStage[] = [
  {
    id: "clean-text",
    number: 1,
    label: "Start — clean text arrives from the pipeline",
    phase: "Start",
    emoji: "📄",
    color: "teal",
    transform: "Plain text — HTML and noise already removed",
    walkthrough: {
      mode: "text",
      beforeLabel: "Raw blog page",
      afterLabel: "After cleaning",
      before: RAW_HTML,
      after: CLEAN_TEXT,
    },
    verdict: "neutral",
  },
  {
    id: "tokenize",
    number: 2,
    label: "Split text into tokens",
    phase: "Tokens",
    emoji: "🔢",
    color: "violet",
    transform: "Words and subwords as numbered tokens",
    walkthrough: {
      mode: "token-grid",
      beforeLabel: "Before",
      afterLabel: "After",
      beforeText: CLEAN_TEXT,
      tokens: TOKENS,
      ids: IDS,
    },
    verdict: "pass",
  },
  {
    id: "chunk",
    number: 3,
    label: "Cut into fixed-size chunks",
    phase: "Tokens",
    emoji: "📦",
    color: "violet",
    transform: "Chunks of 2,048 tokens each",
    walkthrough: {
      mode: "chunk-split",
      streamTokens: [...TOKENS, "…", "billions", "more", "tokens", "…"],
      streamIds: [...IDS, 999, 8888, 7777, 6666, 5555],
      chunkIndex: 1842,
      chunkSize: 2048,
      totalChunks: "millions",
    },
    verdict: "pass",
  },
  {
    id: "pairs",
    number: 4,
    label: "Each token predicts the next",
    phase: "Train prep",
    emoji: "↔️",
    color: "blue",
    transform: "Input tokens → target tokens (shifted by one)",
    walkthrough: {
      mode: "input-target",
      inputTokens: TOKENS,
      inputIds: IDS,
      targetTokens: TARGET_TOKENS,
      targetIds: TARGET_IDS,
      highlightPosition: 2,
    },
    verdict: "pass",
  },
  {
    id: "train",
    number: 5,
    label: "Feed to the model — weights update",
    phase: "Train",
    emoji: "🧠",
    color: "blue",
    transform: "Model weights updated — it learned something new",
    walkthrough: {
      mode: "training-batch",
      batchSize: 512,
      pair: {
        inputTokens: TOKENS.slice(0, 5),
        inputIds: IDS.slice(0, 5),
        targetTokens: TARGET_TOKENS.slice(0, 5),
        targetIds: TARGET_IDS.slice(0, 5),
      },
    },
    verdict: "pass",
  },
];

export default function TrainingSamplesFlow() {
  return (
    <CommonCrawlPreparationFlow
      title="From clean text to a training sample"
      caption="Step through how one cleaned page becomes the input the model trains on."
      stages={STAGES}
    />
  );
}
