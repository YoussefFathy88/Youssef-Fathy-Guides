"use client";

import { useState, useEffect, useRef } from "react";

// ─── Vocabulary ────────────────────────────────────────────────────────────────

const KNOWN_WORDS = new Set([
  "run", "running", "walk", "walking", "play", "playing",
  "cat", "dog", "hello", "fast", "kind", "happy", "do",
  "read", "write", "love", "work",
]);

// Longer bases checked first to avoid partial matches
const KNOWN_BASES = [
  "write", "happy", "walk", "play", "read", "love", "work",
  "fast", "kind", "run", "cat", "dog", "hello", "do",
];

// Prefixes tried before suffixes
const BPE_PREFIXES = ["un", "re"];
// Suffixes checked in priority order (longest first)
const BPE_SUFFIXES = ["ing", "est", "ed", "er", "ly"];

// ─── Colors ────────────────────────────────────────────────────────────────────

const BASE_COLORS: Record<string, string> = {
  run:   "bg-violet-500 text-white",
  walk:  "bg-blue-500 text-white",
  play:  "bg-teal-500 text-white",
  fast:  "bg-amber-500 text-black",
  kind:  "bg-orange-500 text-black",
  happy: "bg-pink-500 text-white",
  do:    "bg-indigo-500 text-white",
  read:  "bg-sky-500 text-white",
  write: "bg-purple-500 text-white",
  love:  "bg-rose-400 text-white",
  work:  "bg-cyan-500 text-black",
  cat:   "bg-amber-400 text-black",
  dog:   "bg-orange-400 text-black",
  hello: "bg-pink-400 text-white",
};

const AFFIX_COLORS: Record<string, string> = {
  ing: "bg-emerald-500 text-white",
  ed:  "bg-cyan-600 text-white",
  er:  "bg-sky-600 text-white",
  ly:  "bg-fuchsia-500 text-white",
  est: "bg-yellow-500 text-black",
  un:  "bg-rose-500 text-white",
  re:  "bg-lime-500 text-black",
};

function getTokenColor(token: string): string {
  return BASE_COLORS[token] ?? AFFIX_COLORS[token] ?? "bg-gray-500 text-white";
}

// ─── Tokenizer ─────────────────────────────────────────────────────────────────

interface BpeResult {
  tokens: string[];
  steps: string[];
}

function bpeTokenize(raw: string): BpeResult {
  if (!raw.trim()) return { tokens: [], steps: [] };

  const word = raw.toLowerCase().trim();
  const steps: string[] = [];
  const tokens: string[] = [];

  steps.push(`Input: "${word}" — split into individual characters: ${word.split("").join(" · ")}`);

  let remaining = word;

  // 1. Try to peel a prefix
  let prefix: string | null = null;
  for (const p of BPE_PREFIXES) {
    if (remaining.startsWith(p) && remaining.length > p.length) {
      const afterPrefix = remaining.slice(p.length);
      // Only treat as prefix if what follows is a known base
      if (KNOWN_BASES.some((b) => afterPrefix === b || afterPrefix.startsWith(b))) {
        prefix = p;
        remaining = afterPrefix;
        tokens.push(p);
        steps.push(`BPE merge: "${p}–" is a frequent prefix token`);
        break;
      }
    }
  }

  // 2. Try to match a known base
  let base: string | null = null;
  for (const b of KNOWN_BASES) {
    if (remaining.startsWith(b)) {
      base = b;
      tokens.push(b);
      remaining = remaining.slice(b.length);
      steps.push(`BPE merge: "${b}" is a high-frequency base token`);
      break;
    }
  }

  // 3. Peel suffixes from what remains
  while (remaining.length > 0) {
    let matched = false;
    for (const s of BPE_SUFFIXES) {
      if (remaining === s || remaining.startsWith(s)) {
        const chunk = remaining.startsWith(s) ? s : remaining;
        tokens.push(chunk);
        remaining = remaining.slice(chunk.length);
        steps.push(`BPE merge: "–${chunk}" is a frequent suffix token`);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(remaining);
      steps.push(`Residual: "${remaining}" kept as a single piece`);
      remaining = "";
    }
  }

  if (tokens.length === 0) {
    tokens.push(word);
    steps.push(`No known sub-word merges — whole word is one token`);
  }

  steps.push(`Result: ${tokens.join(" + ")} (${tokens.length} token${tokens.length > 1 ? "s" : ""})`);
  return { tokens, steps };
}

// ─── Static examples shown in the examples grid ────────────────────────────────

interface Example {
  word: string;
  tokens: string[];
  note: string;
}

const EXAMPLES: Example[] = [
  { word: "running",  tokens: ["run", "ing"],   note: "base + suffix" },
  { word: "walked",   tokens: ["walk", "ed"],   note: "base + suffix" },
  { word: "faster",   tokens: ["fast", "er"],   note: "base + suffix" },
  { word: "kindly",   tokens: ["kind", "ly"],   note: "base + suffix" },
  { word: "replay",   tokens: ["re", "play"],   note: "prefix + base" },
  { word: "unread",   tokens: ["un", "read"],   note: "prefix + base" },
  { word: "writing",  tokens: ["write", "ing"], note: "base + suffix" },
  { word: "rerun",    tokens: ["re", "run"],    note: "prefix + base" },
];

// ─── Components ────────────────────────────────────────────────────────────────

interface TokenChipProps {
  token: string;
  delay?: number;
  size?: "sm" | "md";
}

function TokenChip({ token, delay = 0, size = "md" }: TokenChipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisible(false);
    timerRef.current = setTimeout(() => setVisible(true), delay + 20);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [token, delay]);

  const padding = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <span
      className={[
        `inline-flex items-center rounded-md font-bold tracking-wide transition-all duration-400 ${padding}`,
        getTokenColor(token),
        visible ? "opacity-100 scale-100" : "opacity-0 scale-90",
      ].join(" ")}
    >
      {token}
    </span>
  );
}

// Static chip (no animation) for the examples grid
function StaticChip({ token, size = "sm" }: { token: string; size?: "sm" | "md" }) {
  const padding = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1 text-sm";
  return (
    <span className={`inline-flex items-center rounded-md font-bold tracking-wide ${padding} ${getTokenColor(token)}`}>
      {token}
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function BytePairEncodingExplorer() {
  const [input, setInput] = useState("running");

  const trimmed = input.toLowerCase().trim();
  const bpe = bpeTokenize(trimmed);
  const wordInVocab = KNOWN_WORDS.has(trimmed);

  const PRESETS = ["running", "replay", "kindly", "unread", "faster", "writing"];

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: "#0f1117" }}>

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white mb-1">
          Byte Pair Encoding — Interactive Explorer
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Type any English word and see how Word-Level vs BPE tokenization treat it differently.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="running"
            className="w-40 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-base text-white placeholder-gray-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition"
          />
          <span className="text-xs text-gray-600">or try:</span>
          {PRESETS.map((w) => (
            <button
              key={w}
              onClick={() => setInput(w)}
              className={[
                "rounded-full border px-3 py-1 text-xs transition font-mono",
                trimmed === w
                  ? "border-violet-500/60 bg-violet-500/20 text-violet-300"
                  : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-panel comparison ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "#1a1d27" }}>

        {/* LEFT — Word-Level */}
        <div className="p-6" style={{ background: "#0f1117" }}>
          <span className="inline-block rounded-full bg-rose-500/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-4">
            Word-Level Tokenization
          </span>

          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Token chips</p>

          <div className="min-h-[40px] flex flex-wrap items-center gap-2">
            {trimmed ? (
              wordInVocab ? (
                <TokenChip token={trimmed} delay={0} />
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-1.5 text-sm font-bold text-rose-400">
                  ❌ Unknown Word
                </span>
              )
            ) : (
              <span className="text-gray-600 text-sm">Start typing…</span>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-white/8 bg-white/3 p-4 space-y-2">
            <p className="text-xs text-gray-500 font-medium">How it works</p>
            <p className="text-xs text-gray-400 leading-5">
              One word = one token. The model needs a separate vocabulary entry for every
              unique word form — <em>run</em>, <em>running</em>, <em>runner</em>, <em>ran</em> all
              require separate entries.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-gray-500">Vocabulary needed:</span>
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
                1 entry per unique form
              </span>
            </div>
            {!wordInVocab && trimmed && (
              <p className="text-[11px] text-rose-400/80 italic pt-1">
                "{trimmed}" is not in the vocabulary → model sees &lt;UNK&gt;, loses meaning.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT — BPE */}
        <div className="p-6" style={{ background: "#0f1117" }}>
          <span className="inline-block rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-4">
            BPE Tokenization
          </span>

          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Token chips</p>

          <div className="min-h-[40px] flex flex-wrap items-center gap-2">
            {trimmed ? (
              bpe.tokens.map((tok, i) => (
                <TokenChip key={`${tok}-${i}`} token={tok} delay={i * 130} />
              ))
            ) : (
              <span className="text-gray-600 text-sm">Start typing…</span>
            )}
          </div>

          {/* Step-by-step */}
          {bpe.steps.length > 0 && trimmed && (
            <div className="mt-5 rounded-xl border border-white/8 bg-white/3 p-4 space-y-1.5">
              <p className="text-xs text-gray-500 font-medium mb-2">Merge steps</p>
              {bpe.steps.map((step, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="shrink-0 text-gray-700 font-mono w-5 text-right">{i + 1}.</span>
                  <span className="text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-gray-500">Shared sub-words across:</span>
            {["running", "runner", "rerun"].map((w) => (
              <span key={w} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400 font-mono">
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Real-world examples grid ── */}
      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Real-world splits</p>
        <p className="text-xs text-gray-600 mb-4">
          These common English words each produce exactly 2 BPE tokens — a base and an affix.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EXAMPLES.map(({ word, tokens, note }) => (
            <button
              key={word}
              onClick={() => setInput(word)}
              className={[
                "rounded-xl border p-3 text-left transition group",
                trimmed === word
                  ? "border-violet-500/40 bg-violet-500/10"
                  : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5",
              ].join(" ")}
            >
              <p className="text-xs text-gray-500 mb-2 font-mono">{word}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {tokens.map((t) => (
                  <StaticChip key={t} token={t} size="sm" />
                ))}
              </div>
              <p className="text-[10px] text-gray-600">{note}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Why BPE Wins ── */}
      <div className="px-6 pb-6 border-t border-white/10 pt-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Why BPE Wins</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <p className="text-sm font-semibold text-white mb-3">Vocabulary Size</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Word-level</span>
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-400">Millions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">BPE</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">~50k</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <p className="text-sm font-semibold text-white mb-3">Unknown Words</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Word-level</span>
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-400">Breaks ❌</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">BPE</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">Always works ✅</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <p className="text-sm font-semibold text-white mb-3">Shared Meaning</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Word-level</span>
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-400">run ≠ running ❌</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">BPE</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">share "run" ✅</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
