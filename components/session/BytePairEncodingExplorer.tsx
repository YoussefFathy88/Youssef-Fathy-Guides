"use client";

import { useState } from "react";

import { TOKENIZER_VOCAB_EXAMPLES } from "@/data/facts/tokenization";

// ─── Vocabulary (illustrative — approximates learned BPE merges) ───────────────

// Longer bases checked first to avoid partial matches
const KNOWN_BASES = [
  "write", "happy", "walk", "play", "read", "love", "work",
  "fast", "kind", "run", "cat", "dog", "hello", "do",
];

// Prefixes tried before suffixes
const BPE_PREFIXES = ["un", "re"];
// Suffixes checked in priority order (longest first)
const BPE_SUFFIXES = ["ing", "est", "ed", "er", "ly"];

const BASE_COLORS: Record<string, string> = {
  run: "bg-violet-500 text-white", walk: "bg-blue-500 text-white", play: "bg-teal-500 text-white",
  fast: "bg-amber-500 text-black", kind: "bg-orange-500 text-black", happy: "bg-pink-500 text-white",
  do: "bg-indigo-500 text-white", read: "bg-sky-500 text-white", write: "bg-purple-500 text-white",
  love: "bg-rose-400 text-white", work: "bg-cyan-500 text-black", cat: "bg-amber-400 text-black",
  dog: "bg-orange-400 text-black", hello: "bg-pink-400 text-white",
};

const AFFIX_COLORS: Record<string, string> = {
  ing: "bg-emerald-500 text-white", ed: "bg-cyan-600 text-white", er: "bg-sky-600 text-white",
  ly: "bg-fuchsia-500 text-white", est: "bg-yellow-500 text-black", un: "bg-rose-500 text-white",
  re: "bg-lime-500 text-black",
};

function getTokenColor(token: string): string {
  return BASE_COLORS[token] ?? AFFIX_COLORS[token] ?? "bg-gray-500 text-white";
}

// ─── Encode a new word using already-learned merge rules ───────────────────────

interface BpeResult {
  chars: string[];
  tokens: string[];
  steps: string[];
}

function bpeEncode(raw: string): BpeResult {
  if (!raw.trim()) return { chars: [], tokens: [], steps: [] };

  const word = raw.toLowerCase().trim();
  const chars = word.split("");
  const steps: string[] = [];
  const tokens: string[] = [];

  let remaining = word;

  for (const p of BPE_PREFIXES) {
    if (remaining.startsWith(p) && remaining.length > p.length) {
      const afterPrefix = remaining.slice(p.length);
      if (KNOWN_BASES.some((b) => afterPrefix === b || afterPrefix.startsWith(b))) {
        remaining = afterPrefix;
        tokens.push(p);
        steps.push(`Merge learned pair → "${p}" is a known prefix token`);
        break;
      }
    }
  }

  for (const b of KNOWN_BASES) {
    if (remaining.startsWith(b)) {
      tokens.push(b);
      remaining = remaining.slice(b.length);
      steps.push(`Merge learned pair → "${b}" is a known base token`);
      break;
    }
  }

  while (remaining.length > 0) {
    let matched = false;
    for (const s of BPE_SUFFIXES) {
      if (remaining === s || remaining.startsWith(s)) {
        const chunk = remaining.startsWith(s) ? s : remaining;
        tokens.push(chunk);
        remaining = remaining.slice(chunk.length);
        steps.push(`Merge learned pair → "${chunk}" is a known suffix token`);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(remaining);
      steps.push(`No further learned merge applies → "${remaining}" stays as its own token`);
      remaining = "";
    }
  }

  if (tokens.length === 0) {
    tokens.push(word);
    steps.push(`Whole word already matches the vocabulary`);
  }

  return { chars, tokens, steps };
}

// ─── Component ───────────────────────────────────────────────────────────────

const PRESETS = ["running", "replay", "kindly", "unread", "faster", "tokenizer"];

export interface BytePairEncodingExplorerProps {
  title?: string;
  caption?: string;
}

export default function BytePairEncodingExplorer({
  title = "Watch BPE tokenize a brand-new word",
  caption = "It starts from characters and applies the merge rules training already learned.",
}: BytePairEncodingExplorerProps) {
  const [input, setInput] = useState("tokenizer");
  const trimmed = input.toLowerCase().trim();
  const result = bpeEncode(trimmed);
  const vocabExample = TOKENIZER_VOCAB_EXAMPLES[1]!;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-10 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 space-y-2 md:mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl dark:text-gray-100">
          {title}
        </h2>
        <p className="text-lg leading-relaxed text-gray-600 md:text-xl dark:text-gray-300">{caption}</p>
      </div>

      {/* Input */}
      <div className="mb-6 flex flex-wrap items-center gap-3 md:mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="tokenizer"
          className="w-48 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-lg text-gray-900 outline-none placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
        <span className="text-base font-medium text-gray-500 dark:text-gray-400">or try:</span>
        {PRESETS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setInput(w)}
            className={[
              "rounded-full border px-3.5 py-1.5 font-mono text-base font-medium transition",
              trimmed === w
                ? "border-violet-500 bg-violet-500/15 text-violet-700 dark:border-violet-400 dark:bg-violet-500/20 dark:text-violet-200"
                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800",
            ].join(" ")}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Step 1 — characters */}
      <div className="mb-5 rounded-xl bg-white p-5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
        <p className="mb-3 text-base font-bold uppercase tracking-[0.1em] text-gray-500 md:text-lg dark:text-gray-400">
          Start from characters
        </p>
        <div className="flex flex-wrap gap-2">
          {result.chars.length > 0 ? (
            result.chars.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="rounded-lg bg-gray-200 px-3 py-1.5 font-mono text-lg font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              >
                {c}
              </span>
            ))
          ) : (
            <span className="text-lg text-gray-400 dark:text-gray-500">Type a word above…</span>
          )}
        </div>
      </div>

      {/* Step 2 — merges applied */}
      {result.steps.length > 0 && (
        <div className="mb-5 rounded-xl bg-white p-5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
          <p className="mb-3 text-base font-bold uppercase tracking-[0.1em] text-gray-500 md:text-lg dark:text-gray-400">
            Apply learned merges
          </p>
          <div className="space-y-2">
            {result.steps.map((step, i) => (
              <div key={i} className="flex gap-3 text-lg text-gray-700 dark:text-gray-300">
                <span className="shrink-0 font-mono font-bold text-gray-400 dark:text-gray-500">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — final tokens */}
      <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
        <p className="mb-3 text-base font-bold uppercase tracking-[0.1em] text-gray-500 md:text-lg dark:text-gray-400">
          Final tokens
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {result.tokens.length > 0 ? (
            result.tokens.map((tok, i) => (
              <span
                key={`${tok}-${i}`}
                className={`inline-flex items-center rounded-lg px-4 py-2 font-mono text-lg font-bold tracking-wide ${getTokenColor(tok)}`}
              >
                {tok}
              </span>
            ))
          ) : (
            <span className="text-lg text-gray-400 dark:text-gray-500">—</span>
          )}
          {result.tokens.length > 0 && (
            <span className="text-base font-semibold text-gray-500 dark:text-gray-400">
              {result.tokens.length} {result.tokens.length > 1 ? "tokens" : "token"}
            </span>
          )}
        </div>
      </div>

      <p className="mt-6 text-base italic text-gray-500 md:text-lg dark:text-gray-400">
        Simplified merge rules for teaching — real vocabularies hold about {vocabExample.vocabSize.toLocaleString()} tokens
        ({vocabExample.tokenizer}, {vocabExample.model}), learned once from huge amounts of text.
      </p>
    </div>
  );
}
