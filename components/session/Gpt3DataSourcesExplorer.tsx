"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";

import {
  buildGpt3CompareRows,
  buildGpt3DataSources,
  getGpt3DiagramLabel,
  getGpt3MaxRawTokensB,
} from "@/data/facts/gpt3-training-data";
import { cn } from "@/lib/utils";

type AccentColor = "amber" | "rose" | "violet" | "blue" | "teal";

export interface Gpt3DataSource {
  id: string;
  label: string;
  shortLabel: string;
  emoji: string;
  color: AccentColor;
  what: string;
  filter: string;
  filterSteps?: string[];
  rawTokensB: number;
  weightPercent: number;
  note?: string;
}

export interface Gpt3DataSourcesExplorerProps {
  title?: string;
  caption?: string;
  sources?: Gpt3DataSource[];
}

const ACCENT: Record<
  AccentColor,
  { tab: string; bar: string; ring: string; badge: string; diagram: string }
> = {
  amber: {
    tab: "border-amber-500/70 bg-amber-950/40 text-amber-100 ring-amber-500/30",
    bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    ring: "ring-amber-500/40",
    badge: "bg-amber-500/20 text-amber-200",
    diagram: "#f59e0b",
  },
  rose: {
    tab: "border-rose-500/70 bg-rose-950/40 text-rose-100 ring-rose-500/30",
    bar: "bg-gradient-to-r from-rose-500 to-rose-400",
    ring: "ring-rose-500/40",
    badge: "bg-rose-500/20 text-rose-200",
    diagram: "#f43f5e",
  },
  violet: {
    tab: "border-violet-500/70 bg-violet-950/40 text-violet-100 ring-violet-500/30",
    bar: "bg-gradient-to-r from-violet-500 to-violet-400",
    ring: "ring-violet-500/40",
    badge: "bg-violet-500/20 text-violet-200",
    diagram: "#8b5cf6",
  },
  blue: {
    tab: "border-blue-500/70 bg-blue-950/40 text-blue-100 ring-blue-500/30",
    bar: "bg-gradient-to-r from-blue-500 to-blue-400",
    ring: "ring-blue-500/40",
    badge: "bg-blue-500/20 text-blue-200",
    diagram: "#3b82f6",
  },
  teal: {
    tab: "border-teal-500/70 bg-teal-950/40 text-teal-100 ring-teal-500/30",
    bar: "bg-gradient-to-r from-teal-500 to-teal-400",
    ring: "ring-teal-500/40",
    badge: "bg-teal-500/20 text-teal-200",
    diagram: "#14b8a6",
  },
};

const DEFAULT_SOURCES: Gpt3DataSource[] = buildGpt3DataSources();
const COMPARE_ROWS = buildGpt3CompareRows();
const MAX_RAW_TOKENS_B = getGpt3MaxRawTokensB();

function SourceDiagram({ sourceId, accent }: { sourceId: string; accent: AccentColor }) {
  const stroke = ACCENT[accent].diagram;

  if (sourceId === "common-crawl") {
    return (
      <svg viewBox="0 0 560 220" className="h-full w-full" aria-hidden>
        <circle cx="280" cy="110" r="72" fill="none" stroke={stroke} strokeWidth="3" opacity="0.35" />
        <ellipse cx="280" cy="110" rx="120" ry="36" fill="none" stroke={stroke} strokeWidth="2" opacity="0.25" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 280 + Math.cos(rad) * 95;
          const y = 110 + Math.sin(rad) * 55;
          return (
            <g key={deg}>
              <rect x={x - 22} y={y - 16} width="44" height="32" rx="4" fill={stroke} opacity={0.15 + i * 0.04} stroke={stroke} strokeWidth="2" />
              <line x1="280" y1="110" x2={x} y2={y} stroke={stroke} strokeWidth="1.5" opacity="0.35" strokeDasharray="4 4" />
            </g>
          );
        })}
        <text x="280" y="118" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">
          Public Web
        </text>
      </svg>
    );
  }

  if (sourceId === "webtext2") {
    return (
      <svg viewBox="0 0 560 220" className="h-full w-full" aria-hidden>
        {[80, 200, 320, 440].map((x, i) => (
          <g key={x}>
            <rect x={x - 36} y="70" width="72" height="48" rx="6" fill={stroke} opacity={0.12 + i * 0.05} stroke={stroke} strokeWidth="2" />
            <path d={`M ${x} 118 L ${x + 18} 138 L ${x + 36} 118 Z`} fill={stroke} opacity="0.7" />
            <text x={x} y="98" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
              link
            </text>
          </g>
        ))}
        <text x="280" y="188" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
          {getGpt3DiagramLabel("webtext2")}
        </text>
      </svg>
    );
  }

  if (sourceId === "books1") {
    return (
      <svg viewBox="0 0 560 220" className="h-full w-full" aria-hidden>
        {[160, 230, 300, 370].map((x, i) => (
          <rect
            key={x}
            x={x - 28}
            y={90 - i * 8}
            width="56"
            height="88"
            rx="4"
            fill={stroke}
            opacity={0.18 + i * 0.08}
            stroke={stroke}
            strokeWidth="2"
          />
        ))}
        <text x="280" y="188" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
          {getGpt3DiagramLabel("books1")}
        </text>
      </svg>
    );
  }

  if (sourceId === "books2") {
    return (
      <svg viewBox="0 0 560 220" className="h-full w-full" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x={120 + i * 42}
            y={78 + (i % 2) * 10}
            width="34"
            height="72"
            rx="3"
            fill={stroke}
            opacity={0.15 + (i % 4) * 0.08}
            stroke={stroke}
            strokeWidth="1.5"
          />
        ))}
        <text x="280" y="188" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
          {getGpt3DiagramLabel("books2")}
        </text>
      </svg>
    );
  }

  if (sourceId === "wikipedia") {
    return (
      <svg viewBox="0 0 560 220" className="h-full w-full" aria-hidden>
        <rect x="150" y="52" width="260" height="120" rx="10" fill={stroke} opacity="0.12" stroke={stroke} strokeWidth="2.5" />
        <text x="280" y="88" textAnchor="middle" fill="white" fontSize="22" fontWeight="800">
          Wikipedia
        </text>
        <line x1="180" y1="104" x2="380" y2="104" stroke={stroke} strokeWidth="2" opacity="0.5" />
        <line x1="180" y1="124" x2="360" y2="124" stroke={stroke} strokeWidth="2" opacity="0.35" />
        <line x1="180" y1="144" x2="340" y2="144" stroke={stroke} strokeWidth="2" opacity="0.25" />
        <text x="280" y="188" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
          {getGpt3DiagramLabel("wikipedia")}
        </text>
      </svg>
    );
  }

  return null;
}

function MetricBar({
  label,
  valueLabel,
  percent,
  maxPercent,
  accent,
}: {
  label: string;
  valueLabel: string;
  percent: number;
  maxPercent: number;
  accent: AccentColor;
}) {
  const width = Math.max(6, (percent / maxPercent) * 100);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">{label}</span>
        <span className="text-xl font-bold text-white md:text-2xl">{valueLabel}</span>
      </div>
      <div className="h-5 overflow-hidden rounded-full bg-gray-800 ring-1 ring-gray-700 md:h-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={cn("h-full rounded-full", ACCENT[accent].bar)}
        />
      </div>
    </div>
  );
}

function SourcePanel({ source }: { source: Gpt3DataSource }) {
  const tone = ACCENT[source.color];
  const maxRaw = MAX_RAW_TOKENS_B;

  return (
    <motion.div
      key={source.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-4xl md:text-5xl" aria-hidden>
          {source.emoji}
        </span>
        <div>
          <h3 className="text-2xl font-bold text-white md:text-3xl">{source.label}</h3>
          {source.note ? (
            <p className="mt-1 text-lg text-amber-200 md:text-xl">{source.note}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <div className={cn("rounded-2xl border-2 p-5 ring-1 md:p-6", tone.ring, "border-gray-700 bg-gray-900/70")}>
          <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">What</p>
          <p className="mt-3 text-lg leading-relaxed text-gray-100 md:text-xl">{source.what}</p>
        </div>
        <div className={cn("rounded-2xl border-2 p-5 ring-1 md:p-6", tone.ring, "border-gray-700 bg-gray-900/70")}>
          <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">How filtered</p>
          {source.filterSteps && source.filterSteps.length > 0 ? (
            <ul className="mt-3 space-y-2 text-lg leading-relaxed text-gray-100 md:text-xl">
              {source.filterSteps.map((step) => (
                <li key={step} className="flex gap-3">
                  <span className="font-bold text-gray-400" aria-hidden>
                    •
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-lg leading-relaxed text-gray-100 md:text-xl">{source.filter}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-700 bg-gray-950/80 p-4 md:p-5">
        <div className="h-[180px] md:h-[200px]">
          <SourceDiagram sourceId={source.id} accent={source.color} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <MetricBar
          label="Raw corpus size"
          valueLabel={`${source.rawTokensB}B tokens`}
          percent={source.rawTokensB}
          maxPercent={maxRaw}
          accent={source.color}
        />
        <MetricBar
          label="Training mix weight"
          valueLabel={`${source.weightPercent}%`}
          percent={source.weightPercent}
          maxPercent={60}
          accent={source.color}
        />
      </div>
    </motion.div>
  );
}

function ComparePanel() {
  const maxRaw = MAX_RAW_TOKENS_B;
  const maxWeight = 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-bold text-white md:text-3xl">Raw size vs training weight</h3>
        <p className="mt-2 text-lg text-gray-200 md:text-xl">
          Training picks from five sources by quality — not by raw size alone.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-700">
        <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-gray-700 bg-gray-900/90 px-4 py-3 md:px-6 md:py-4">
          <span className="text-base font-bold text-gray-300 md:text-lg">Source</span>
          <span className="text-base font-bold text-gray-300 md:text-lg">Raw size</span>
          <span className="text-base font-bold text-gray-300 md:text-lg">Training weight</span>
        </div>
        {COMPARE_ROWS.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1.2fr_1fr_1fr] items-center gap-3 border-b border-gray-800 px-4 py-4 last:border-b-0 md:px-6 md:py-5"
          >
            <span className="text-lg font-semibold text-white md:text-xl">{row.label}</span>
            <div className="space-y-1">
              <span className="block text-lg font-bold text-white md:text-xl">{row.raw}B</span>
              <div className="h-3 overflow-hidden rounded-full bg-gray-800 md:h-4">
                <div
                  className={cn("h-full rounded-full", ACCENT[row.color].bar)}
                  style={{ width: `${Math.max(4, (row.raw / maxRaw) * 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="block text-lg font-bold text-white md:text-xl">{row.weight}%</span>
              <div className="h-3 overflow-hidden rounded-full bg-gray-800 md:h-4">
                <div
                  className={cn("h-full rounded-full", ACCENT[row.color].bar)}
                  style={{ width: `${Math.max(4, (row.weight / maxWeight) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Gpt3DataSourcesExplorer({
  title = "GPT-3 training data — five sources",
  caption = "Tap each source — what it is, how it was cleaned, and how size compares to training weight.",
  sources = DEFAULT_SOURCES,
}: Gpt3DataSourcesExplorerProps) {
  const reducedMotion = useReducedMotion();
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<string>(sources[0]?.id ?? "common-crawl");
  const isCompare = activeTab === "compare";
  const activeSource = sources.find((s) => s.id === activeTab);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-700 bg-gray-900 p-6 md:p-10"
      data-local-navigation="true"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-100 md:text-2xl">{title}</h2>
        {caption ? <p className="text-lg text-gray-300 md:text-xl">{caption}</p> : null}
      </div>

      <div
        className="mt-6 flex flex-wrap gap-2 md:mt-8 md:gap-3"
        role="tablist"
        aria-label="data sources"
      >
        {sources.map((source) => {
          const isActive = activeTab === source.id;
          return (
            <button
              key={source.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`${baseId}-tab-${source.id}`}
              onClick={() => setActiveTab(source.id)}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:px-5 md:py-3.5 md:text-lg",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                isActive
                  ? cn("ring-2", ACCENT[source.color].tab)
                  : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-600 hover:text-white",
              )}
            >
              <span className="mr-2" aria-hidden>
                {source.emoji}
              </span>
              {source.shortLabel}
            </button>
          );
        })}
        <button
          type="button"
          role="tab"
          aria-selected={isCompare}
          id={`${baseId}-tab-compare`}
          onClick={() => setActiveTab("compare")}
          className={cn(
            "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:px-5 md:py-3.5 md:text-lg",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
            isCompare
              ? "border-violet-500/70 bg-violet-950/40 text-violet-100 ring-2 ring-violet-500/30"
              : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-600 hover:text-white",
          )}
        >
          Compare
        </button>
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeTab}`}
        className="mt-6 md:mt-8"
      >
        <AnimatePresence mode="wait">
          {isCompare ? (
            <ComparePanel key="compare" />
          ) : activeSource ? (
            <SourcePanel key={activeSource.id} source={activeSource} />
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
