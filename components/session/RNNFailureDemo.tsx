"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * Strip: … Cairo. [gap] It includes [NEXT TOKEN] Egyptian Museum
 * The ··· chip = collapsed middle. Slot = where the model emits one token.
 */
type StripPart = { kind: "word"; text: string } | { kind: "ellipsis" } | { kind: "slot" };

const STRIP: StripPart[] = [
  { kind: "word", text: "The" },
  { kind: "word", text: "capital" },
  { kind: "word", text: "of" },
  { kind: "word", text: "Egypt" },
  { kind: "word", text: "is" },
  { kind: "word", text: "Cairo" },
  { kind: "ellipsis" },
  { kind: "word", text: "It" },
  { kind: "word", text: "includes" },
  { kind: "slot" },
  { kind: "word", text: "Egyptian" },
  { kind: "word", text: "Museum" },
];

const IDX = {
  cairo: 5,
  egypt: 3,
  includes: 8,
  slot: 9,
  museum: 11,
} as const;

/** Cairo retention at milestone tokens (ellipsis = many overwrites). */
const DECAY_TOKEN_INDICES = [IDX.cairo, 6, 7, IDX.includes, IDX.museum] as const;
const DECAY_PCTS = [100, 50, 25, 12.5, 0.4];

const STEPS = [
  { id: 0, label: "The sentence", tone: "neutral" as const },
  { id: 1, label: "Key words", tone: "neutral" as const },
  { id: 2, label: "Cairo fades", tone: "warn" as const },
  { id: 3, label: "Wrong completion", tone: "bad" as const },
  { id: 4, label: "Transformer fixes it", tone: "good" as const },
];

const AMBER = "#BA7517";
const AMBER_FILL = "rgba(186, 117, 23, 0.12)";
const ROSE = "#A32D2D";
const ROSE_FILL = "#FCEBEB";
const TEAL = "#1D9E75";
const TEAL_FILL = "#E1F5EE";
const PURPLE = "#534AB7";
const PURPLE_FILL = "rgba(83, 74, 183, 0.12)";
const CORAL = "#E24B4A";

function barColorForPct(pct: number): string {
  if (pct >= 25) return AMBER;
  if (pct > 2) return CORAL;
  return ROSE;
}

function TokenChip({
  label,
  variant = "word",
  highlight,
}: {
  label: string;
  variant?: "word" | "ellipsis" | "slot";
  highlight?: "amber" | "rose" | "teal" | "purple" | "none";
}) {
  const w =
    variant === "ellipsis" ? 48 : variant === "slot" ? 56 : label.length > 7 ? 92 : 80;
  const styles: CSSProperties = {
    width: w,
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: variant === "slot" ? 14 : 12,
    fontWeight: 600,
    flexShrink: 0,
    transition: "border-color 0.15s, background-color 0.15s",
  };

  if (variant === "ellipsis") {
    Object.assign(styles, {
      letterSpacing: "0.15em",
      backgroundColor: "#e5e7eb",
      color: "#6b7280",
      border: "1px solid #d1d5db",
    });
  } else if (variant === "slot") {
    Object.assign(styles, {
      backgroundColor: "#f1f5f9",
      color: "#475569",
      border: "2px dashed #64748b",
    });
  } else {
    Object.assign(styles, {
      backgroundColor: "#f9fafb",
      color: "#374151",
      border: "1px solid #d1d5db",
    });
  }

  if (highlight === "amber") {
    Object.assign(styles, {
      border: variant === "slot" ? `2px dashed ${AMBER}` : `2px solid ${AMBER}`,
      backgroundColor: AMBER_FILL,
    });
  } else if (highlight === "rose") {
    Object.assign(styles, {
      border: variant === "slot" ? `2px dashed ${ROSE}` : `2px solid ${ROSE}`,
      backgroundColor: ROSE_FILL,
    });
  } else if (highlight === "teal") {
    Object.assign(styles, {
      border: variant === "slot" ? `2px dashed ${TEAL}` : `2px solid ${TEAL}`,
      backgroundColor: TEAL_FILL,
    });
  } else if (highlight === "purple") {
    Object.assign(styles, {
      border: variant === "slot" ? `2px dashed ${PURPLE}` : `2px solid ${PURPLE}`,
      backgroundColor: PURPLE_FILL,
      color: PURPLE,
    });
  }

  return (
    <span className="select-none" style={styles} title={variant === "slot" ? "Next token is predicted here" : undefined}>
      {label}
    </span>
  );
}

const DESCRIPTIONS: string[] = [
  "You already know: The capital of Egypt is Cairo. This longer version adds more story after Cairo (the ··· chip hides extra words), then: It includes ? Egyptian Museum. The dashed box is not a word — it marks where the model must emit exactly one next token. After includes, that token should be the, because the full name is the Egyptian Museum and we are still talking about Cairo.",
  "Cairo (early) is where that museum is. Egypt anchors the country. The dashed slot is the prediction point — right after includes, before Egyptian. The RNN must remember Cairo all the way to that slot.",
  "Each new token partly overwrites earlier information. By Museum, only about 0.4% of the Cairo anchor remains — not enough to choose the right word at the slot.",
  "With Cairo faded, the RNN may guess another Egyptian city — Alexandria — instead of the. That yields … includes Alexandria Egyptian … which is both the wrong city (you already said Cairo) and an impossible phrase. The right single token at the slot is the.",
  "The Transformer sees all tokens at once. The slot can attend straight back to Cairo and Egypt. Autocomplete at the slot recovers the. No decay across the gap.",
];

export interface RNNFailureDemoProps {
  title?: string;
  caption?: string;
  /** When true, shows long captions and per-step story text (gallery). Sessions use visuals + pills only. */
  showNarrative?: boolean;
}

export default function RNNFailureDemo({
  title,
  caption,
  showNarrative = false,
}: RNNFailureDemoProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(() => DECAY_PCTS.map(() => 0));
  const [panelsVisible, setPanelsVisible] = useState(false);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const arcRun = useRef(0);

  useEffect(() => {
    if (activeStep !== 2) return;
    setBarHeights(DECAY_PCTS.map(() => 0));
    const timers: ReturnType<typeof setTimeout>[] = [];
    DECAY_PCTS.forEach((pct, i) => {
      timers.push(
        setTimeout(() => {
          setBarHeights((prev) => {
            const next = [...prev];
            next[i] = (pct / 100) * 80;
            return next;
          });
        }, 60 * i),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [activeStep]);

  useEffect(() => {
    if (activeStep !== 3) {
      setPanelsVisible(false);
      return;
    }
    setPanelsVisible(false);
    const id = requestAnimationFrame(() => {
      setPanelsVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, [activeStep]);

  useLayoutEffect(() => {
    if (activeStep !== 4) return;

    arcRun.current += 1;
    const run = arcRun.current;

    const paths = pathRefs.current.filter(Boolean) as SVGPathElement[];
    paths.forEach((path) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      path.style.transition = "none";
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (run !== arcRun.current) return;
        paths.forEach((path, idx) => {
          setTimeout(() => {
            path.style.transition = "stroke-dashoffset 0.8s ease";
            path.style.strokeDashoffset = "0";
          }, idx * 120);
        });
      });
    });
  }, [activeStep]);

  function highlightForIndex(i: number): "amber" | "rose" | "teal" | "purple" | "none" {
    if (activeStep === 1) {
      if (i === IDX.cairo) return "amber";
      if (i === IDX.egypt) return "rose";
      if (i === IDX.slot) return "teal";
    }
    if (activeStep === 2 && i === IDX.cairo) return "amber";
    if (activeStep === 3) {
      if (i === IDX.cairo || i === IDX.slot) return "rose";
    }
    if (activeStep === 4) {
      if (i === IDX.cairo || i === IDX.egypt || i === IDX.slot || i === IDX.museum) return "purple";
    }
    return "none";
  }

  function pillClass(stepIndex: number): string {
    const on = activeStep === stepIndex;
    const base =
      "rounded-full border px-3 py-1.5 text-xs font-medium transition-[border-color,background-color] duration-150 text-center leading-tight";
    if (!on) {
      return `${base} border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900/60 dark:text-gray-200`;
    }
    const tone = STEPS[stepIndex].tone;
    if (tone === "warn") {
      return `${base} bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50`;
    }
    if (tone === "bad") {
      return `${base} bg-rose-50 text-rose-950 dark:bg-rose-950/50 dark:text-rose-50`;
    }
    if (tone === "good") {
      return `${base} bg-violet-50 text-violet-950 dark:bg-violet-950/40 dark:text-violet-50`;
    }
    return `${base} text-gray-900 dark:text-gray-100`;
  }

  function pillStyle(stepIndex: number): CSSProperties | undefined {
    const on = activeStep === stepIndex;
    if (!on) return undefined;
    const tone = STEPS[stepIndex].tone;
    if (tone === "warn") {
      return { borderColor: AMBER, borderWidth: 2 };
    }
    if (tone === "bad") {
      return { borderColor: ROSE, borderWidth: 2 };
    }
    if (tone === "good") {
      return { borderColor: PURPLE, borderWidth: 2 };
    }
    return undefined;
  }

  const n = STRIP.length;
  const colW = 900 / n;
  const cx = (i: number) => colW * (i + 0.5);
  const yBase = 88;

  const pathCairoToSlot = `M ${cx(IDX.cairo)} ${yBase} Q ${(cx(IDX.cairo) + cx(IDX.slot)) / 2} 8 ${cx(IDX.slot)} ${yBase}`;
  const pathEgyptToSlot = `M ${cx(IDX.egypt)} ${yBase} Q ${(cx(IDX.egypt) + cx(IDX.slot)) / 2} 18 ${cx(IDX.slot)} ${yBase}`;
  const pathIncludesToSlot = `M ${cx(IDX.includes)} ${yBase} Q ${(cx(IDX.includes) + cx(IDX.slot)) / 2} 28 ${cx(IDX.slot)} ${yBase}`;

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

      <div className="mb-3 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveStep(s.id)}
            className={pillClass(s.id)}
            style={pillStyle(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
        {showNarrative && activeStep === 0 && (
          <p className="mb-3 text-center text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-gray-100">Full sense:</span> The capital of Egypt is
            Cairo. Later, … it includes <span className="whitespace-nowrap">[next word]</span> Egyptian Museum — the
            missing word belongs right after <span className="font-medium">includes</span>.
          </p>
        )}

        {showNarrative && activeStep >= 1 && (
          <p className="mb-3 text-center text-[11px] font-medium text-teal-800 dark:text-teal-200">
            Next token is predicted <span className="underline decoration-teal-500/80">immediately after</span>{" "}
            <span className="font-semibold">&quot;includes&quot;</span> (dashed box), before &quot;Egyptian&quot;.
          </p>
        )}

        {activeStep === 4 && (
          <div className="relative mb-2 h-24 w-full">
            {showNarrative ? (
              <p className="mb-1 text-center text-[11px] font-medium" style={{ color: PURPLE }}>
                direct attention — full signal at the prediction slot
              </p>
            ) : (
              <div className="mb-1 h-3" />
            )}
            <svg
              className="absolute inset-x-0 top-5 h-20 w-full overflow-visible"
              viewBox="0 0 900 100"
              preserveAspectRatio="none"
            >
              <path
                ref={(el) => {
                  pathRefs.current[0] = el;
                }}
                d={pathCairoToSlot}
                fill="none"
                stroke={PURPLE}
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.85}
              />
              <path
                ref={(el) => {
                  pathRefs.current[1] = el;
                }}
                d={pathEgyptToSlot}
                fill="none"
                stroke={PURPLE}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.65}
              />
              <path
                ref={(el) => {
                  pathRefs.current[2] = el;
                }}
                d={pathIncludesToSlot}
                fill="none"
                stroke={PURPLE}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.45}
              />
            </svg>
          </div>
        )}

        <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-1 sm:flex-nowrap sm:overflow-x-auto sm:pb-1">
          {STRIP.map((part, i) => (
            <div key={`${part.kind}-${i}`} className="flex min-w-0 flex-1 justify-center sm:flex-1">
              {part.kind === "word" && (
                <TokenChip label={part.text} variant="word" highlight={highlightForIndex(i)} />
              )}
              {part.kind === "ellipsis" && (
                <TokenChip label="···" variant="ellipsis" highlight={highlightForIndex(i)} />
              )}
              {part.kind === "slot" && (
                <div className="flex flex-col items-center gap-0.5">
                  <TokenChip label="?" variant="slot" highlight={highlightForIndex(i)} />
                  <span className="hidden text-[9px] text-gray-400 sm:block">next</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {activeStep === 2 && (
          <div className="mt-6">
            {showNarrative ? (
              <p className="mb-3 text-center text-[11px] text-gray-500 dark:text-gray-400">
                How much of the <strong className="text-gray-700 dark:text-gray-300">Cairo</strong> anchor survives by
                each milestone (50% per step; ··· packs many real tokens).
              </p>
            ) : null}
            <div className="flex justify-between gap-2">
              {DECAY_PCTS.map((pct, i) => {
                const h = barHeights[i] ?? 0;
                const color = barColorForPct(pct);
                const isLast = i === DECAY_PCTS.length - 1;
                const tokIdx = DECAY_TOKEN_INDICES[i];
                const label =
                  STRIP[tokIdx]?.kind === "word"
                    ? STRIP[tokIdx].text
                    : STRIP[tokIdx]?.kind === "ellipsis"
                      ? "···"
                      : "?";
                return (
                  <div key={`${label}-${tokIdx}`} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <div className="relative w-full" style={{ height: 80 }}>
                      <div
                        className="absolute bottom-0 left-1/2 w-[70%] max-w-[52px] -translate-x-1/2 rounded-t transition-[height] duration-500"
                        style={{
                          height: h,
                          backgroundColor: color,
                          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                    <span className="text-center text-[10px] tabular-nums text-gray-600 dark:text-gray-400">
                      {pct === 0.4 ? "0.4%" : `${pct}%`}
                    </span>
                    <span
                      className="max-w-[72px] truncate text-center text-[10px] text-gray-500 dark:text-gray-400"
                      title={label}
                    >
                      {label}
                    </span>
                    {isLast && (
                      <span className="text-center text-[10px] font-semibold" style={{ color: ROSE }}>
                        ⚠ 0.4% left
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr]"
            style={{
              opacity: panelsVisible ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            <div className="flex flex-col items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-200">RNN predicts (at slot)</span>
              <span
                className="rounded-lg px-4 py-3 text-lg font-bold"
                style={{
                  backgroundColor: ROSE_FILL,
                  border: `2px solid ${ROSE}`,
                  color: ROSE,
                }}
              >
                Alexandria ✗
              </span>
              <p className="text-center font-mono text-[10px] leading-snug text-rose-900/90 dark:text-rose-100/90">
                … includes <span className="font-bold">Alexandria</span> Egyptian Museum
                <br />
                <span className="text-rose-700 dark:text-rose-300">wrong city + broken phrase</span>
              </p>
            </div>
            <div className="flex items-center justify-center text-xs text-gray-400">vs</div>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">Should be</span>
              <span
                className="rounded-lg px-4 py-3 text-lg font-bold"
                style={{
                  backgroundColor: TEAL_FILL,
                  border: `2px solid ${TEAL}`,
                  color: TEAL,
                }}
              >
                the ✓
              </span>
              <p className="text-center font-mono text-[10px] leading-snug text-emerald-900/90 dark:text-emerald-100/90">
                … includes <span className="font-bold">the</span> Egyptian Museum
                <br />
                <span className="text-emerald-700 dark:text-emerald-300">fixed proper name in Cairo</span>
              </p>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div
              className="rounded-xl border px-6 py-4"
              style={{
                borderColor: PURPLE,
                backgroundColor: PURPLE_FILL,
              }}
            >
              <span className="text-lg font-bold" style={{ color: PURPLE }}>
                the ✓
              </span>
            </div>
            <p className="text-center font-mono text-[10px] text-gray-600 dark:text-gray-400">
              … includes the Egyptian Museum
            </p>
          </div>
        )}

        {showNarrative ? (
          <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {DESCRIPTIONS[activeStep]}
          </p>
        ) : null}
      </div>
    </div>
  );
}
