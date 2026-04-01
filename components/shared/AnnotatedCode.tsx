"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface CodeAnnotation {
  line: number;
  label: string;
  description: string;
  color?: "violet" | "teal" | "amber" | "rose" | "blue";
}

export interface AnnotatedCodeProps {
  code: string;
  language?: string;
  annotations: CodeAnnotation[];
  title?: string;
  caption?: string;
}

const colorMap = {
  violet: {
    badge: "bg-violet-500 text-white",
    highlight: "bg-violet-100/80 dark:bg-violet-500/15",
    border: "border-l-2 border-violet-400 dark:border-violet-500",
    panel: "bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30",
    label: "text-violet-700 dark:text-violet-300",
  },
  teal: {
    badge: "bg-teal-500 text-white",
    highlight: "bg-teal-100/80 dark:bg-teal-500/15",
    border: "border-l-2 border-teal-400 dark:border-teal-500",
    panel: "bg-teal-50 border-teal-200 dark:bg-teal-500/10 dark:border-teal-500/30",
    label: "text-teal-700 dark:text-teal-300",
  },
  amber: {
    badge: "bg-amber-500 text-white",
    highlight: "bg-amber-100/80 dark:bg-amber-500/15",
    border: "border-l-2 border-amber-400 dark:border-amber-500",
    panel: "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30",
    label: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    badge: "bg-rose-500 text-white",
    highlight: "bg-rose-100/80 dark:bg-rose-500/15",
    border: "border-l-2 border-rose-400 dark:border-rose-500",
    panel: "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30",
    label: "text-rose-700 dark:text-rose-300",
  },
  blue: {
    badge: "bg-blue-500 text-white",
    highlight: "bg-blue-100/80 dark:bg-blue-500/15",
    border: "border-l-2 border-blue-400 dark:border-blue-500",
    panel: "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30",
    label: "text-blue-700 dark:text-blue-300",
  },
} as const;

// Minimal keyword-based syntax highlighter — no external deps
function highlightLine(line: string): React.ReactNode {
  // Tokenise by keywords, strings, numbers, comments
  const patterns: { re: RegExp; cls: string }[] = [
    { re: /(#[^\n]*)/, cls: "text-gray-400 italic" },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, cls: "text-amber-600 dark:text-amber-400" },
    { re: /\b(def|class|return|import|from|for|in|if|else|elif|with|as|try|except|raise|async|await|const|let|var|function|export|default|new|this|true|false|null|undefined|type|interface)\b/, cls: "text-violet-600 dark:text-violet-400 font-medium" },
    { re: /\b(\d+(?:\.\d+)?)\b/, cls: "text-teal-600 dark:text-teal-400" },
  ];

  // Walk through line and split by first matching pattern
  function tokenize(text: string, depth = 0): React.ReactNode[] {
    if (!text || depth > 8) return [text];
    for (const { re, cls } of patterns) {
      const match = text.match(re);
      if (match && match.index !== undefined) {
        const before = text.slice(0, match.index);
        const matched = match[0];
        const after = text.slice(match.index + matched.length);
        return [
          ...tokenize(before, depth + 1),
          <span key={`${depth}-${match.index}`} className={cls}>{matched}</span>,
          ...tokenize(after, depth + 1),
        ];
      }
    }
    return [text];
  }

  return <>{tokenize(line)}</>;
}

export default function AnnotatedCode({
  code,
  annotations,
  title,
  caption,
}: AnnotatedCodeProps) {
  const reducedMotion = useReducedMotion();
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);

  const codeLines = code.split("\n");

  // Map line → annotation index
  const lineAnnotationMap = new Map<number, number>();
  annotations.forEach((ann, idx) => {
    lineAnnotationMap.set(ann.line, idx);
  });

  const activeAnn = activeAnnotation !== null ? annotations[activeAnnotation] : null;
  const activeTone = activeAnn ? colorMap[activeAnn.color ?? "violet"] : null;

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

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {/* Code block — 60% width on md+ */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-950 md:w-[60%] dark:border-gray-700">
          {/* Top bar */}
          <div className="flex items-center gap-1.5 border-b border-gray-800 bg-gray-900 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500/70" />
          </div>

          {/* Lines */}
          <div className="overflow-x-auto p-4">
            <table className="w-full border-separate border-spacing-0">
              <tbody>
                {codeLines.map((line, i) => {
                  const lineNum = i + 1;
                  const annIdx = lineAnnotationMap.get(lineNum);
                  const isAnnotated = annIdx !== undefined;
                  const isActive = activeAnnotation === annIdx;
                  const ann = isAnnotated ? annotations[annIdx!] : null;
                  const tone = ann ? colorMap[ann.color ?? "violet"] : null;

                  return (
                    <tr
                      key={lineNum}
                      className={cn(
                        "group",
                        isAnnotated && "cursor-pointer",
                        isActive && tone?.highlight,
                        isActive && tone?.border,
                      )}
                      onClick={() =>
                        isAnnotated
                          ? setActiveAnnotation(isActive ? null : annIdx!)
                          : undefined
                      }
                    >
                      {/* Line number */}
                      <td className="w-8 select-none pr-4 text-right font-mono text-[11px] text-gray-600">
                        {lineNum}
                      </td>
                      {/* Code content */}
                      <td className="font-mono text-[12.5px] text-gray-200 whitespace-pre">
                        {highlightLine(line)}
                      </td>
                      {/* Annotation badge */}
                      <td className="w-6 pl-2">
                        {isAnnotated && ann && tone && (
                          <span
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                              tone.badge,
                            )}
                          >
                            {annIdx! + 1}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Annotations panel — 40% width on md+ */}
        <div className="flex w-full flex-col gap-2 md:w-[40%]">
          {annotations.map((ann, idx) => {
            const tone = colorMap[ann.color ?? "violet"];
            const isActive = activeAnnotation === idx;

            return (
              <motion.button
                key={idx}
                type="button"
                initial={reducedMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: idx * 0.06, ease: "easeOut" }}
                onClick={() => setActiveAnnotation(isActive ? null : idx)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-shadow hover:shadow-md",
                  tone.panel,
                  isActive && "ring-2",
                  isActive && tone.label.replace("text-", "ring-").split(" ")[0],
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      tone.badge,
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className={cn("text-xs font-semibold", tone.label)}>{ann.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                      {ann.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}

          {/* Active annotation detail — shown when something is selected */}
          {activeAnn && activeTone && (
            <motion.div
              key={activeAnnotation}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl border p-3 text-xs leading-relaxed",
                activeTone.panel,
                activeTone.label,
              )}
            >
              <strong className="block font-semibold">Line {activeAnn.line}</strong>
              {activeAnn.description}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
