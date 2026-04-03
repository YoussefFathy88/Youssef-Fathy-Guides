"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* ─── Deterministic token lookup ─────────────────────────────────────────── */

/** Pre-tokenised examples — token[],  rough real-world IDs */
const EXAMPLES: { label: string; text: string; tokens: { str: string; id: number; chars: [number, number] }[] }[] = [
  {
    label: "English",
    text: "The quick brown fox",
    tokens: [
      { str: "The",   id: 464,   chars: [0, 3]  },
      { str: " quick",id: 2068,  chars: [3, 9]  },
      { str: " brown",id: 7586,  chars: [9, 15] },
      { str: " fox",  id: 21831, chars: [15, 19]},
    ],
  },
  {
    label: "Python code",
    text: "getUserById",
    tokens: [
      { str: "get",  id: 1136,  chars: [0, 3]  },
      { str: "User", id: 2616,  chars: [3, 7]  },
      { str: "By",   id: 3886,  chars: [7, 9]  },
      { str: "Id",   id: 7390,  chars: [9, 11] },
    ],
  },
  {
    label: "URL",
    text: "https://api.example.com",
    tokens: [
      { str: "https",  id: 5450,  chars: [0, 5]  },
      { str: "://",    id: 570,   chars: [5, 8]  },
      { str: "api",    id: 15450, chars: [8, 11] },
      { str: ".",      id: 13,    chars: [11, 12]},
      { str: "example",id: 8306,  chars: [12, 19]},
      { str: ".",      id: 13,    chars: [19, 20]},
      { str: "com",    id: 785,   chars: [20, 23]},
    ],
  },
  {
    label: "Arabic",
    text: "مرحبا بالعالم",
    tokens: [
      { str: "مر",  id: 40058, chars: [0, 2]  },
      { str: "حب",  id: 29778, chars: [2, 4]  },
      { str: "ا",   id: 627,   chars: [4, 5]  },
      { str: " ب",  id: 264,   chars: [5, 7]  },
      { str: "ال",  id: 2498,  chars: [7, 9]  },
      { str: "عال", id: 20987, chars: [9, 12] },
      { str: "م",   id: 1447,  chars: [12, 13]},
    ],
  },
];

const TOKEN_COLORS = [
  { bg: "bg-violet-100 dark:bg-violet-500/20", text: "text-violet-800 dark:text-violet-200", border: "border-violet-300 dark:border-violet-500/40" },
  { bg: "bg-teal-100 dark:bg-teal-500/20",     text: "text-teal-800 dark:text-teal-200",     border: "border-teal-300 dark:border-teal-500/40"   },
  { bg: "bg-amber-100 dark:bg-amber-500/20",   text: "text-amber-800 dark:text-amber-200",   border: "border-amber-300 dark:border-amber-500/40" },
  { bg: "bg-blue-100 dark:bg-blue-500/20",     text: "text-blue-800 dark:text-blue-200",     border: "border-blue-300 dark:border-blue-500/40"   },
  { bg: "bg-rose-100 dark:bg-rose-500/20",     text: "text-rose-800 dark:text-rose-200",     border: "border-rose-300 dark:border-rose-500/40"   },
  { bg: "bg-indigo-100 dark:bg-indigo-500/20", text: "text-indigo-800 dark:text-indigo-200", border: "border-indigo-300 dark:border-indigo-500/40"},
  { bg: "bg-lime-100 dark:bg-lime-500/20",     text: "text-lime-800 dark:text-lime-200",     border: "border-lime-300 dark:border-lime-500/40"   },
];

/* ─── Typed-text tokeniser (deterministic lookup table) ───────────────────── */

/** Very simple lookup tokeniser — approximates BPE without server round-trips */
const COMMON_TOKENS: [string, number][] = [
  ["https://", 5450], ["://", 570], [" the", 262], [" of", 286], [" a", 257],
  [" an", 281], [" is", 318], [" in", 287], ["The", 464], ["the", 262], [",", 11],
  [".", 13], ["!", 0], ["?", 30], [" ", 220], ["get", 1136], ["set", 900],
  ["User", 2616], ["user", 2836], ["Id", 7390], ["By", 3886], ["=", 28],
  ["(", 7], [")", 8], [";", 26], ["[", 58], ["]", 60], ["{", 90], ["}", 92],
  ["://", 570], [".com", 785], [".js", 784], [".py", 340],
];

function naiveTokenize(text: string): { str: string; id: number; chars: [number, number] }[] {
  if (!text) return [];
  const result: { str: string; id: number; chars: [number, number] }[] = [];
  let pos = 0;
  const remaining = [...text];
  let charPos = 0;

  const tokenMap = new Map(COMMON_TOKENS);

  while (charPos < text.length) {
    let matched = false;
    // Try longest match first (up to 8 chars)
    for (let len = Math.min(8, text.length - charPos); len >= 1; len--) {
      const substr = text.slice(charPos, charPos + len);
      if (tokenMap.has(substr)) {
        result.push({ str: substr, id: tokenMap.get(substr)!, chars: [charPos, charPos + len] });
        charPos += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Single char fallback
      const ch = text[charPos];
      result.push({ str: ch, id: ch.charCodeAt(0), chars: [charPos, charPos + 1] });
      charPos += 1;
    }
  }
  return result;
}

export interface LiveTokenizerProps {
  title?: string;
  caption?: string;
}

export default function LiveTokenizer({
  title   = "Type any text — see how the tokenizer splits it",
  caption = "Each colored chip is one token. Hover to see its integer ID.",
}: LiveTokenizerProps) {
  const reducedMotion = useReducedMotion();
  const [inputText, setInputText] = useState(EXAMPLES[0].text);
  const [activeToken, setActiveToken] = useState<number | null>(null);
  const [activeExample, setActiveExample] = useState(0);

  const tokens = (() => {
    // Use pre-tokenised example when it matches exactly
    const ex = EXAMPLES.find(e => e.text === inputText);
    return ex ? ex.tokens : naiveTokenize(inputText);
  })();

  const charCount   = inputText.length;
  const tokenCount  = tokens.length;
  const charsPerTok = charCount > 0 && tokenCount > 0 ? (charCount / tokenCount).toFixed(2) : "—";

  function loadExample(i: number) {
    setActiveExample(i);
    setInputText(EXAMPLES[i].text);
    setActiveToken(null);
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        {/* Example presets */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => loadExample(i)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                i === activeExample
                  ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/60 dark:bg-violet-500/10 dark:text-violet-300"
                  : "border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
              )}
            >
              {ex.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setActiveExample(-1); setInputText(""); setActiveToken(null); }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              activeExample === -1
                ? "border-teal-400 bg-teal-50 text-teal-700 dark:border-teal-500/60 dark:bg-teal-500/10 dark:text-teal-300"
                : "border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
            )}
          >
            ✏️ Type your own
          </button>
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputText}
          onChange={e => { setInputText(e.target.value); setActiveToken(null); }}
          placeholder="Type any text…"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-900 outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-300/50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-violet-500"
        />

        {/* Token chips */}
        <div className="min-h-[60px] rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/60">
          {tokens.length === 0 ? (
            <p className="text-sm text-gray-400">Type something above to see tokens…</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence initial={false} mode="popLayout">
                {tokens.map((tok, i) => {
                  const col = TOKEN_COLORS[i % TOKEN_COLORS.length];
                  const isActive = activeToken === i;
                  return (
                    <motion.button
                      key={`${i}-${tok.str}-${tok.id}`}
                      layout
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15, delay: reducedMotion ? 0 : i * 0.03 }}
                      type="button"
                      onClick={() => setActiveToken(isActive ? null : i)}
                      className={cn(
                        "rounded-lg border px-2 py-1 font-mono text-sm font-medium transition-all",
                        col.bg, col.text, col.border,
                        isActive && "scale-110 shadow-md",
                      )}
                      title={`Token ID: ${tok.id}`}
                      aria-label={`Token "${tok.str}", ID ${tok.id}`}
                    >
                      {tok.str === " " ? "·" : tok.str}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Active token detail */}
        <AnimatePresence>
          {activeToken !== null && tokens[activeToken] && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-500/30 dark:bg-violet-500/10"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-violet-500">Token string</p>
                  <p className="font-mono text-lg font-bold text-violet-800 dark:text-violet-200">
                    &quot;{tokens[activeToken].str}&quot;
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-violet-500">Integer ID</p>
                  <p className="font-mono text-lg font-bold text-violet-800 dark:text-violet-200">
                    {tokens[activeToken].id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-violet-500">Characters</p>
                  <p className="font-mono text-lg font-bold text-violet-800 dark:text-violet-200">
                    [{tokens[activeToken].chars[0]}–{tokens[activeToken].chars[1]}]
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Tokens</p>
            <p className="mt-0.5 font-mono text-2xl font-bold text-violet-600 dark:text-violet-400">{tokenCount}</p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Characters</p>
            <p className="mt-0.5 font-mono text-2xl font-bold text-gray-800 dark:text-gray-200">{charCount}</p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Chars / Token</p>
            <p className={cn(
              "mt-0.5 font-mono text-2xl font-bold",
              Number(charsPerTok) < 4 ? "text-teal-500" : Number(charsPerTok) < 6 ? "text-amber-500" : "text-rose-500",
            )}>
              {charsPerTok}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          {Number(charsPerTok) < 4
            ? "✅ Efficient tokenisation — typical for English prose"
            : Number(charsPerTok) < 5
            ? "⚠️ Moderate density — technical terms, code or punctuation"
            : "🔴 High token density — rare words, URLs, or non-English text cost more"}
        </p>
      </div>
    </motion.div>
  );
}
