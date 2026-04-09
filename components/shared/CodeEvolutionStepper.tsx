"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

export interface EvolutionStage {
  id: string;
  label: string;
  description: string;
  code: string;
  language?: string;
  addedLines?: number[];
  removedLines?: number[];
  highlightLines?: number[];
}

export interface CodeEvolutionStepperProps {
  title?: string;
  caption?: string;
  stages?: EvolutionStage[];
  autoPlay?: boolean;
  autoPlayMs?: number;
}

const DEFAULT_STAGES: EvolutionStage[] = [
  {
    id: "v1",
    label: "v1 — Naive loop",
    description: "Start simple: a plain for-loop scanning every element. O(n) time, O(1) space. Works fine — but doesn't scale for large datasets.",
    language: "python",
    code: `def find_target(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
  },
  {
    id: "v2",
    label: "v2 — Type hints + enumerate",
    description: "Add type hints for clarity and use enumerate() instead of indexing — more idiomatic Python. The logic is identical but the intent is clearer.",
    language: "python",
    addedLines: [1, 2, 3, 5],
    code: `def find_target(
    arr: list[int],
    target: int,
) -> int:
    for i, value in enumerate(arr):
        if value == target:
            return i
    return -1`,
  },
  {
    id: "v3",
    label: "v3 — Binary search",
    description: "If the input is sorted, binary search halves the search space each step: O(log n). We use Python's standard bisect module — no reimplementation needed.",
    language: "python",
    addedLines: [1, 2, 7, 8, 9],
    code: `import bisect

def find_target(
    arr: list[int],
    target: int,
) -> int:
    idx = bisect.bisect_left(arr, target)
    if idx < len(arr) and arr[idx] == target:
        return idx
    return -1`,
  },
  {
    id: "v4",
    label: "v4 — O(1) cached index",
    description: "Build a dict index once; every subsequent lookup is O(1) amortised. Best when the array is searched many times and doesn't change.",
    language: "python",
    addedLines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    code: `class SearchIndex:
    def __init__(self, arr: list[int]):
        # Build index once — O(n) upfront
        self._index: dict[int, int] = {
            value: i
            for i, value in enumerate(arr)
        }

    def find(self, target: int) -> int:
        return self._index.get(target, -1)  # O(1)

# Usage
index = SearchIndex([3, 9, 27, 38, 43, 82])
result = index.find(27)  # returns 2`,
  },
];

const LANG_ICONS: Record<string, string> = {
  python: "🐍",
  typescript: "🔷",
  javascript: "🟨",
  tsx: "⚛️",
  jsx: "⚛️",
  sql: "🗄️",
  bash: "💻",
  json: "📋",
  rust: "🦀",
  go: "🔵",
};

function getLangIcon(lang?: string): string {
  return LANG_ICONS[lang?.toLowerCase() ?? ""] ?? "📄";
}

function highlightLine(line: string): React.ReactNode {
  const patterns: { re: RegExp; cls: string }[] = [
    { re: /(#[^\n]*)/, cls: "text-gray-500 italic" },
    { re: /(\/\/[^\n]*)/, cls: "text-gray-500 italic" },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, cls: "text-amber-400" },
    {
      re: /\b(def|class|return|import|from|for|in|if|else|elif|with|as|try|except|raise|async|await|const|let|var|function|export|default|new|this|true|false|null|undefined|type|interface|extends|implements|public|private|protected|static|readonly)\b/,
      cls: "text-violet-400 font-medium",
    },
    { re: /\b(\d+(?:\.\d+)?)\b/, cls: "text-teal-400" },
  ];

  function tokenize(text: string, depth = 0): React.ReactNode[] {
    if (!text || depth > 8) return [text];
    for (const { re, cls } of patterns) {
      const match = text.match(re);
      if (match && match.index !== undefined) {
        return [
          ...tokenize(text.slice(0, match.index), depth + 1),
          <span key={`${depth}-${match.index}`} className={cls}>{match[0]}</span>,
          ...tokenize(text.slice(match.index + match[0].length), depth + 1),
        ];
      }
    }
    return [text];
  }
  return <>{tokenize(line)}</>;
}

export default function CodeEvolutionStepper({
  title,
  caption,
  stages = DEFAULT_STAGES,
  autoPlay = false,
  autoPlayMs = 3000,
}: CodeEvolutionStepperProps) {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(autoPlay);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLast = current === stages.length - 1;
  const stage = stages[current];

  const go = useCallback((next: number) => {
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  }, [current]);

  const stepForward = useCallback(() => {
    setCurrent(c => {
      if (c < stages.length - 1) {
        setDirection(1);
        return c + 1;
      }
      setPlaying(false);
      return c;
    });
  }, [stages.length]);

  useEffect(() => {
    if (!playing) { if (timerRef.current) clearTimeout(timerRef.current); return; }
    timerRef.current = setTimeout(stepForward, autoPlayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, current, stepForward, autoPlayMs]);

  const codeLines = stage.code.split("\n");
  const hasChanges = (stage.addedLines?.length ?? 0) + (stage.removedLines?.length ?? 0) > 0;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Stage tabs */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {stages.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition",
              i === current
                ? "border-violet-300 bg-violet-600 text-white"
                : i < current
                ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500",
            )}
          >
            {i < current && <span className="text-[10px]">✓</span>}
            {s.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950 dark:border-gray-700">
        {/* Chrome */}
        <div className="flex items-center border-b border-gray-800 bg-gray-900 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="ml-1.5 h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="ml-1.5 h-2.5 w-2.5 rounded-full bg-teal-500/70" />
          <div className="ml-4 flex items-center gap-2">
            <span className="text-sm">{getLangIcon(stage.language)}</span>
            <span className="text-[11px] text-gray-400">{stage.label}</span>
          </div>
          {hasChanges && (
            <div className="ml-auto flex items-center gap-3">
              {(stage.addedLines?.length ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-teal-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  +{stage.addedLines!.length}
                </span>
              )}
              {(stage.removedLines?.length ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  -{stage.removedLines!.length}
                </span>
              )}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stage.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: reducedMotion ? 0 : d * 24, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: reducedMotion ? 0 : d * -24, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="overflow-x-auto p-4">
              <table className="w-full border-separate border-spacing-0">
                <tbody>
                  {codeLines.map((line, i) => {
                    const lineNum = i + 1;
                    const isAdded = stage.addedLines?.includes(lineNum) ?? false;
                    const isRemoved = stage.removedLines?.includes(lineNum) ?? false;
                    const isHighlighted = stage.highlightLines?.includes(lineNum) ?? false;
                    return (
                      <tr
                        key={lineNum}
                        className={cn(
                          isAdded && "bg-teal-500/10",
                          isRemoved && "bg-rose-500/10",
                          isHighlighted && !isAdded && !isRemoved && "bg-amber-500/10",
                        )}
                      >
                        <td className="w-6 select-none pr-3 text-right font-mono text-[11px] text-gray-600">
                          {lineNum}
                        </td>
                        <td className="w-4 pr-2 text-center font-mono text-[11px]">
                          {isAdded && <span className="text-teal-400">+</span>}
                          {isRemoved && <span className="text-rose-400">-</span>}
                          {!isAdded && !isRemoved && <span className="select-none text-gray-800">{" "}</span>}
                        </td>
                        <td className="whitespace-pre font-mono text-[12.5px] text-gray-200">
                          {highlightLine(line)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stage.id}
          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {stage.description}
        </motion.p>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2">
        <span className="mr-1 text-[11px] text-gray-400 dark:text-gray-500">
          {current + 1} / {stages.length}
        </span>
        <button
          type="button"
          disabled={current === 0}
          onClick={() => { setPlaying(false); go(current - 1); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          ← Prev
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => { setPlaying(false); stepForward(); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Next →
        </button>
        <button
          type="button"
          onClick={() => {
            if (playing) { setPlaying(false); }
            else { if (isLast) go(0); setPlaying(true); }
          }}
          className={cn(
            "flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-semibold transition",
            playing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
              : "bg-violet-600 text-white hover:bg-violet-700",
          )}
        >
          {playing ? "⏸ Pause" : isLast ? "↩ Replay" : "▶ Play"}
        </button>
      </div>
    </motion.div>
  );
}
