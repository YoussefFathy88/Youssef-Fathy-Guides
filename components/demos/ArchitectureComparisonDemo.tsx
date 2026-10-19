"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PanelId = "fnn" | "rnn" | "transformer";

type ArcPoint = {
  x: number;
  y: number;
};

const WORDS = ["In", "Egypt", "there", "are", "pyramids", "and", "the", "capital", "city", "is", "___"] as const;
const EGYPT_INDEX = 4;
const TARGET_INDEX = 10;

const PANEL_META: Record<
  PanelId,
  {
    title: string;
    badgeClass: string;
    activeClass: string;
    explanation: string;
    whyText: string;
    leftBarClass: string;
  }
> = {
  fnn: {
    title: "🧱 Feedforward Network",
    badgeClass: "border border-amber-500/70 bg-amber-950 text-amber-700 dark:text-amber-300",
    activeClass: "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    explanation:
      "FNN can only see the last 3 words. 'Egypt' is far outside the fixed window, so the model guesses a generic city word.",
    whyText:
      "Fixed window = structural blindness. No matter how much data you train on, a 3-word window will never see 6 words back.",
    leftBarClass: "bg-amber-500",
  },
  rnn: {
    title: "🔄 Recurrent Network",
    badgeClass: "border border-teal-500/70 bg-teal-950 text-teal-700 dark:text-teal-300",
    activeClass: "border-teal-500 shadow-[0_0_20px_rgba(45,212,191,0.15)]",
    explanation:
      "RNN processed every word in order, but the hidden state overwrites itself at each step. By the time we reach 'is', Egypt's signal is only 8% of what it was — too faint to influence the prediction.",
    whyText:
      "Sequential hidden state = vanishing signal. Each new word dilutes older ones. Long sentences = forgotten early context.",
    leftBarClass: "bg-teal-500",
  },
  transformer: {
    title: "⚡ Transformer",
    badgeClass: "border border-violet-500/70 bg-violet-950 text-violet-700 dark:text-violet-300",
    activeClass: "border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    explanation:
      "The Transformer looks at all words simultaneously and learns which ones matter for each prediction. 'Egypt' attends directly to the blank with full strength — no decay, no distance limit.",
    whyText:
      "Attention = direct connection. Every word can connect to every other word regardless of distance. Distance is irrelevant.",
    leftBarClass: "bg-violet-500",
  },
};

export function ArchitectureComparisonDemo() {
  const [activePanel, setActivePanel] = useState<PanelId>("fnn");
  const [whyOpen, setWhyOpen] = useState<Record<PanelId, boolean>>({
    fnn: false,
    rnn: false,
    transformer: false,
  });

  const transformerRowRef = useRef<HTMLDivElement | null>(null);
  const transformerChipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [arcPoints, setArcPoints] = useState<{ source: ArcPoint; target: ArcPoint } | null>(null);
  const [faintArcSources, setFaintArcSources] = useState<ArcPoint[]>([]);

  const mainArcPathId = "architecture-comparison-main-arc";

  useEffect(() => {
    const updateArcPoints = () => {
      const row = transformerRowRef.current;
      const egyptChip = transformerChipRefs.current[EGYPT_INDEX];
      const targetChip = transformerChipRefs.current[TARGET_INDEX];

      if (!row || !egyptChip || !targetChip) return;

      const rowRect = row.getBoundingClientRect();
      const egyptRect = egyptChip.getBoundingClientRect();
      const targetRect = targetChip.getBoundingClientRect();

      const source = {
        x: egyptRect.left - rowRect.left + egyptRect.width / 2,
        y: egyptRect.top - rowRect.top + 2,
      };
      const target = {
        x: targetRect.left - rowRect.left + targetRect.width / 2,
        y: targetRect.top - rowRect.top + 2,
      };

      const arcs: ArcPoint[] = WORDS.map((_, idx) => {
        const chip = transformerChipRefs.current[idx];
        if (!chip) {
          return { x: source.x, y: source.y };
        }
        const chipRect = chip.getBoundingClientRect();
        return {
          x: chipRect.left - rowRect.left + chipRect.width / 2,
          y: chipRect.top - rowRect.top + 2,
        };
      });

      setArcPoints({ source, target });
      setFaintArcSources(arcs);
    };

    updateArcPoints();
    window.addEventListener("resize", updateArcPoints);
    return () => window.removeEventListener("resize", updateArcPoints);
  }, []);

  const mainPath = useMemo(() => {
    if (!arcPoints) return "";
    const cp1x = arcPoints.source.x + (arcPoints.target.x - arcPoints.source.x) * 0.35;
    const cp2x = arcPoints.source.x + (arcPoints.target.x - arcPoints.source.x) * 0.7;
    return `M ${arcPoints.source.x} ${arcPoints.source.y} C ${cp1x} -42, ${cp2x} -42, ${arcPoints.target.x} ${arcPoints.target.y}`;
  }, [arcPoints]);

  return (
    <section className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 font-sans text-zinc-900 dark:text-zinc-100 sm:p-6">
      <div className="mb-5 overflow-x-auto">
        <div className="mx-auto inline-flex min-w-max flex-col items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {WORDS.map((word, idx) => (
              <span
                key={`shared-${word}-${idx}`}
                className={[
                  "rounded-md bg-gray-100 dark:bg-zinc-800 px-2 py-1 text-sm font-mono text-zinc-900 dark:text-zinc-200 transition-all duration-300",
                  idx === EGYPT_INDEX ? "shadow-[0_0_10px_rgba(251,191,36,0.35)]" : "",
                  idx === TARGET_INDEX
                    ? "border border-violet-400 animate-pulse shadow-[0_0_10px_rgba(167,139,250,0.35)]"
                    : "",
                ].join(" ")}
              >
                {word}
              </span>
            ))}
          </div>
          <div className="font-sans text-xs text-zinc-600 dark:text-zinc-400">
            <span className="text-violet-700 dark:text-violet-300">↓</span> Predict this word
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article
          onClick={() => setActivePanel("fnn")}
          className={[
            "cursor-pointer rounded-xl border bg-gray-50 dark:bg-zinc-900 p-4 transition-all duration-300",
            "border-gray-300 dark:border-zinc-700",
            activePanel === "fnn" ? `scale-[1.02] opacity-100 ${PANEL_META.fnn.activeClass}` : "opacity-70",
          ].join(" ")}
        >
          <div className="mb-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PANEL_META.fnn.badgeClass}`}>
              {PANEL_META.fnn.title}
            </span>
          </div>

          <div className="mb-2 flex flex-wrap gap-1.5">
            {WORDS.map((word, idx) => {
              const inWindow = idx >= 8;
              const isEgypt = idx === EGYPT_INDEX;
              return (
                <div key={`fnn-${word}-${idx}`} className="relative">
                  <span
                    className={[
                      "rounded-md px-2 py-1 text-sm font-mono transition-all duration-300",
                      inWindow
                        ? "border border-amber-500 bg-amber-950 text-amber-800 dark:text-amber-200"
                        : "bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 grayscale opacity-30",
                      isEgypt ? "line-through text-zinc-600 dark:text-zinc-500 opacity-40" : "",
                    ].join(" ")}
                  >
                    {word}
                  </span>
                  {isEgypt ? (
                    <span className="absolute -top-2 -right-2 text-[10px] text-rose-700 dark:text-rose-400">❌</span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mb-3 text-xs text-amber-700 dark:text-amber-300">Window = last 3 words</div>
          <div className="mb-4 text-xs text-rose-700 dark:text-rose-300">❌ Outside window</div>

          <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">How it sees the input</p>
          <div className="mb-2 text-center text-zinc-600 dark:text-zinc-500">↓</div>

          <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">Prediction</p>
          <div className="rounded-lg border border-rose-500 bg-rose-950 p-3 text-center text-lg font-bold text-rose-700 dark:text-rose-400">
            🏙️ Paris
          </div>
          <p className="mt-2 text-center text-xs text-rose-700 dark:text-rose-300">Generic guess — no context about Egypt facts</p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setWhyOpen((prev) => ({ ...prev, fnn: !prev.fnn }));
            }}
            className="mt-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 transition-all duration-300 hover:border-amber-500/60"
          >
            Why?
          </button>
          <div
            className={[
              "overflow-hidden transition-all duration-300",
              whyOpen.fnn ? "mt-2 max-h-40" : "max-h-0",
            ].join(" ")}
          >
            <div className="rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 text-xs text-zinc-700 dark:text-zinc-300">
              {PANEL_META.fnn.whyText}
            </div>
          </div>
        </article>

        <article
          onClick={() => setActivePanel("rnn")}
          className={[
            "cursor-pointer rounded-xl border bg-gray-50 dark:bg-zinc-900 p-4 transition-all duration-300",
            "border-gray-300 dark:border-zinc-700",
            activePanel === "rnn" ? `scale-[1.02] opacity-100 ${PANEL_META.rnn.activeClass}` : "opacity-70",
          ].join(" ")}
        >
          <div className="mb-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PANEL_META.rnn.badgeClass}`}>
              {PANEL_META.rnn.title}
            </span>
          </div>

          <div className="mb-2 flex flex-wrap gap-1.5">
            {WORDS.map((word, idx) => {
              const isEgypt = idx === EGYPT_INDEX;
              return (
                <div key={`rnn-${word}-${idx}`} className="flex flex-col items-center gap-0.5">
                  <span
                    className={[
                      "rounded-md bg-gray-100 dark:bg-zinc-800 px-2 py-1 text-sm font-mono text-zinc-900 dark:text-zinc-200 transition-all duration-300",
                      isEgypt ? "bg-amber-950 text-amber-600 opacity-50" : "",
                    ].join(" ")}
                  >
                    {word}
                  </span>
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-500">{idx < 10 ? `h${idx + 1}` : ""}</span>
                </div>
              );
            })}
          </div>
          <div className="mb-3 text-xs text-amber-700 dark:text-amber-300">⚠️ Fading</div>

          <div className="mb-4">
            <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-zinc-700 to-teal-400">
              <span className="absolute -top-2 left-[15%] h-6 w-[2px] bg-amber-300" />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-600 dark:text-zinc-500">
              <span>Older</span>
              <span className="text-amber-700 dark:text-amber-300">Egypt: 8% retained</span>
              <span>Recent</span>
            </div>
          </div>

          <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">How it sees the input</p>
          <div className="mb-2 text-center text-zinc-600 dark:text-zinc-500">↓</div>

          <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">Prediction</p>
          <div className="rounded-lg border border-rose-500 bg-rose-950 p-3 text-center text-lg font-bold text-rose-700 dark:text-rose-400">
            🏙️ Paris
          </div>
          <p className="mt-2 text-center text-xs text-rose-700 dark:text-rose-300">Egypt processed but nearly forgotten</p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setWhyOpen((prev) => ({ ...prev, rnn: !prev.rnn }));
            }}
            className="mt-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 transition-all duration-300 hover:border-teal-500/60"
          >
            Why?
          </button>
          <div
            className={[
              "overflow-hidden transition-all duration-300",
              whyOpen.rnn ? "mt-2 max-h-40" : "max-h-0",
            ].join(" ")}
          >
            <div className="rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 text-xs text-zinc-700 dark:text-zinc-300">
              {PANEL_META.rnn.whyText}
            </div>
          </div>
        </article>

        <article
          onClick={() => setActivePanel("transformer")}
          className={[
            "cursor-pointer rounded-xl border bg-gray-50 dark:bg-zinc-900 p-4 transition-all duration-300",
            "border-gray-300 dark:border-zinc-700",
            activePanel === "transformer"
              ? `scale-[1.02] opacity-100 ${PANEL_META.transformer.activeClass}`
              : "opacity-70",
          ].join(" ")}
        >
          <div className="mb-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PANEL_META.transformer.badgeClass}`}
            >
              {PANEL_META.transformer.title}
            </span>
          </div>

          <div className="relative mb-4">
            <div ref={transformerRowRef} className="relative flex flex-wrap gap-1.5 pb-2">
              {WORDS.map((word, idx) => {
                const isEgypt = idx === EGYPT_INDEX;
                const isTarget = idx === TARGET_INDEX;
                return (
                  <div
                    key={`transformer-${word}-${idx}`}
                    ref={(el) => {
                      transformerChipRefs.current[idx] = el;
                    }}
                    className={[
                      "rounded-md bg-gray-100 dark:bg-zinc-800 px-2 py-1 text-sm font-mono text-zinc-900 dark:text-zinc-200 transition-all duration-300",
                      isEgypt ? "bg-amber-900 text-amber-700 dark:text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "",
                      isTarget ? "bg-violet-900 text-violet-800 dark:text-violet-200 shadow-[0_0_10px_rgba(167,139,250,0.45)]" : "",
                    ].join(" ")}
                  >
                    {word}
                  </div>
                );
              })}

              {arcPoints ? (
                <svg
                  className="pointer-events-none absolute inset-x-0 -top-12 hidden h-20 w-full md:block"
                  viewBox={`0 -50 ${Math.max(arcPoints.target.x + 40, 420)} 80`}
                  preserveAspectRatio="none"
                >
                  {faintArcSources.map((source, idx) => {
                    if (idx === TARGET_INDEX) return null;
                    const path = `M ${source.x} ${source.y} C ${source.x + (arcPoints.target.x - source.x) * 0.35} -26, ${
                      source.x + (arcPoints.target.x - source.x) * 0.72
                    } -26, ${arcPoints.target.x} ${arcPoints.target.y}`;
                    return (
                      <path
                        key={`faint-arc-${idx}`}
                        d={path}
                        fill="none"
                        className="stroke-violet-400"
                        strokeWidth="1.2"
                        opacity={0.2}
                      />
                    );
                  })}
                  <path id={mainArcPathId} d={mainPath} fill="none" className="stroke-violet-400" strokeWidth="2" />
                  <text
                    x={(arcPoints.source.x + arcPoints.target.x) / 2}
                    y={-34}
                    textAnchor="middle"
                    className="fill-violet-300 text-[10px]"
                  >
                    Attention
                  </text>

                  {activePanel === "transformer" ? (
                    <circle r="3" className="fill-violet-300">
                      <animateMotion dur="2s" repeatCount="indefinite" rotate="auto">
                        <mpath href={`#${mainArcPathId}`} />
                      </animateMotion>
                    </circle>
                  ) : (
                    <circle cx={arcPoints.source.x} cy={arcPoints.source.y} r="3" className="fill-violet-300/70" />
                  )}
                </svg>
              ) : null}
            </div>
            <p className="text-xs text-violet-700 dark:text-violet-300 md:hidden">→ Direct Attention</p>
          </div>

          <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">How it sees the input</p>
          <div className="mb-2 text-center text-zinc-600 dark:text-zinc-500">↓</div>

          <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">Prediction</p>
          <div className="relative rounded-lg border border-violet-500 bg-violet-950 p-3 text-center text-lg font-bold text-violet-700 dark:text-violet-300">
            <span className="absolute top-1 right-2 text-xs text-emerald-700 dark:text-emerald-300">✅</span>
            🏙️ Cairo
          </div>
          <p className="mt-2 text-center text-xs text-violet-700 dark:text-violet-300">
            Egypt attended directly — full context preserved
          </p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setWhyOpen((prev) => ({ ...prev, transformer: !prev.transformer }));
            }}
            className="mt-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 transition-all duration-300 hover:border-violet-500/60"
          >
            Why?
          </button>
          <div
            className={[
              "overflow-hidden transition-all duration-300",
              whyOpen.transformer ? "mt-2 max-h-40" : "max-h-0",
            ].join(" ")}
          >
            <div className="rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 text-xs text-zinc-700 dark:text-zinc-300">
              {PANEL_META.transformer.whyText}
            </div>
          </div>
        </article>
      </div>

      <div className="mt-6 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 p-4">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 h-10 w-1 rounded ${PANEL_META[activePanel].leftBarClass}`} />
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{PANEL_META[activePanel].explanation}</p>
        </div>
      </div>
    </section>
  );
}

export default ArchitectureComparisonDemo;
