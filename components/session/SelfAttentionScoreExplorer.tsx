"use client";

import { useEffect, useState } from "react";

const TEAL = "#1D9E75";
const AMBER = "#BA7517";
const GRAY = "#B4B2A9";

function barColor(score: number, isSelf: boolean): string {
  if (isSelf) return GRAY;
  if (score >= 0.25) return TEAL;
  if (score >= 0.12) return AMBER;
  return GRAY;
}

function scoreLabel(score: number, isSelf: boolean): string {
  if (isSelf) return "self";
  if (score >= 0.30) return "strong";
  if (score >= 0.20) return "related";
  if (score >= 0.12) return "weak";
  return "distant";
}

export interface AttentionScoreRow {
  token: string;
  scores: number[];
}

export interface SelfAttentionScoreExplorerProps {
  title?: string;
  caption?: string;
  tokens: string[];
  queries: string[];
  attentionRows: AttentionScoreRow[];
  defaultSelected?: number;
}

interface BarWidth {
  index: number;
  width: number;
}

export default function SelfAttentionScoreExplorer({
  title,
  caption,
  tokens,
  queries,
  attentionRows,
  defaultSelected = 0,
}: SelfAttentionScoreExplorerProps) {
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [animatedWidths, setAnimatedWidths] = useState<BarWidth[]>([]);

  const row = attentionRows[selectedIndex];
  const query = queries[selectedIndex];

  useEffect(() => {
    // Reset widths to 0 then stagger them in
    setAnimatedWidths(tokens.map((_, j) => ({ index: j, width: 0 })));
    tokens.forEach((_, j) => {
      setTimeout(() => {
        setAnimatedWidths((prev) =>
          prev.map((bw) =>
            bw.index === j
              ? { index: j, width: Math.round((row?.scores[j] ?? 0) * 100) }
              : bw,
          ),
        );
      }, 40 + j * 60);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  function handleSelect(i: number) {
    if (i === selectedIndex) return;
    setSelectedIndex(i);
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && (
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          )}
          {caption && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
          )}
        </div>
      )}

      {/* Token selector pills */}
      <div className="flex flex-wrap gap-2">
        {tokens.map((token, i) => {
          const isSelected = i === selectedIndex;
          return (
            <button
              key={token + i}
              type="button"
              onClick={() => handleSelect(i)}
              className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
              style={{
                border: isSelected ? `2px solid ${TEAL}` : "2px solid #d1d5db",
                background: isSelected ? `${TEAL}18` : "transparent",
                color: isSelected ? TEAL : "#6b7280",
              }}
            >
              {token}
            </button>
          );
        })}
      </div>

      {/* Query pill */}
      {query && (
        <div
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: `${TEAL}12`, border: `1px solid ${TEAL}30` }}
        >
          <span className="text-[11px] font-semibold" style={{ color: TEAL }}>
            &ldquo;{tokens[selectedIndex]}&rdquo; asks:
          </span>
          <span className="text-[11px] text-gray-600 dark:text-gray-400">{query}</span>
        </div>
      )}

      {/* Score bars */}
      {row && (
        <div className="mt-4 space-y-2">
          {tokens.map((token, j) => {
            const score = row.scores[j] ?? 0;
            const pct = Math.round(score * 100);
            const isSelf = j === selectedIndex;
            const color = barColor(score, isSelf);
            const label = scoreLabel(score, isSelf);
            const width = animatedWidths.find((bw) => bw.index === j)?.width ?? 0;

            return (
              <div key={token + j} className="flex items-center gap-2">
                {/* Token label – right-aligned, fixed width */}
                <span
                  className="shrink-0 text-right text-[11px] font-medium text-gray-600 dark:text-gray-400"
                  style={{ width: 38 }}
                >
                  {token}
                </span>

                {/* Bar track */}
                <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    style={{
                      width: `${width}%`,
                      backgroundColor: color,
                      height: "100%",
                      borderRadius: "9999px",
                      transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
                    }}
                  />
                </div>

                {/* Percentage */}
                <span
                  className="w-8 shrink-0 text-right text-[11px] font-semibold"
                  style={{ color }}
                >
                  {pct}%
                </span>

                {/* Relationship label */}
                <span className="w-14 shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Description sentence */}
      {row && (
        <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          &ldquo;{tokens[selectedIndex]}&rdquo; attends most to{" "}
          {row.scores
            .map((s, j) => ({ s, j }))
            .filter(({ j }) => j !== selectedIndex)
            .sort((a, b) => b.s - a.s)
            .slice(0, 2)
            .map(({ j }) => `"${tokens[j]}"`)
            .join(" and ")}
          {" "}— capturing the relationships that matter most for understanding this word in context.
        </p>
      )}
    </div>
  );
}
