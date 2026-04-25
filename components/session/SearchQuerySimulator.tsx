"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CorpusDoc {
  id: string;
  title: string;
  snippet: string;
  keywords: string[];
  embeddingCluster: string;
}

export interface QueryPreset {
  query: string;
  label: string;
}

export interface SearchQuerySimulatorProps {
  title?: string;
  caption?: string;
  corpus?: CorpusDoc[];
  presets?: QueryPreset[];
  defaultQuery?: string;
}

// ── Topic → cluster mapping ───────────────────────────────────────────────────

const TOPIC_CLUSTER_MAP: Record<string, string> = {
  car: "car-trouble",
  vehicle: "car-trouble",
  login: "login",
  "log in": "login",
  auth: "login",
  bill: "billing",
  billing: "billing",
  invoice: "billing",
};

function detectTopic(query: string): string | null {
  const q = query.toLowerCase();
  for (const [keyword, cluster] of Object.entries(TOPIC_CLUSTER_MAP)) {
    if (q.includes(keyword)) return cluster;
  }
  return null;
}

// Simple seeded pseudo-random (deterministic per doc.id)
function seededRandom(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  const t = Math.abs(h) / 2147483647;
  return min + t * (max - min);
}

// ── Scoring ───────────────────────────────────────────────────────────────────

interface KeywordResult {
  doc: CorpusDoc;
  score: number;
  matchedWords: string[];
}

interface SemanticResult {
  doc: CorpusDoc;
  score: number;
}

function keywordSearch(query: string, corpus: CorpusDoc[]): KeywordResult[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return [];
  const results: KeywordResult[] = [];
  for (const doc of corpus) {
    const docKws = doc.keywords.map((k) => k.toLowerCase());
    const matched = words.filter((w) => docKws.includes(w));
    const score = matched.length / words.length;
    if (score > 0) {
      results.push({ doc, score, matchedWords: matched });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

function semanticSearch(query: string, corpus: CorpusDoc[]): SemanticResult[] {
  const topic = detectTopic(query);
  const results: SemanticResult[] = corpus.map((doc) => {
    let score: number;
    if (!topic) {
      score = seededRandom(doc.id + "none", 0.10, 0.25);
    } else if (doc.embeddingCluster === topic) {
      score = seededRandom(doc.id + topic, 0.85, 0.93);
    } else if (topic.split("-").some((t) => doc.embeddingCluster.includes(t))) {
      score = seededRandom(doc.id + topic + "partial", 0.55, 0.70);
    } else {
      score = seededRandom(doc.id + topic + "none", 0.10, 0.25);
    }
    return { doc, score };
  });
  return results.sort((a, b) => b.score - a.score);
}

// ── Score bar color ───────────────────────────────────────────────────────────

function scoreBarColor(score: number) {
  if (score >= 0.7) return "bg-green-500";
  if (score >= 0.4) return "bg-amber-500";
  return "bg-gray-400 dark:bg-gray-600";
}

// ── Highlight keywords in title ───────────────────────────────────────────────

function HighlightedTitle({ title, words }: { title: string; words: string[] }) {
  if (!words.length) return <span>{title}</span>;
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = title.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="rounded bg-amber-200 px-0.5 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ── Animated result row ───────────────────────────────────────────────────────

interface KeywordRowProps {
  result: KeywordResult;
  index: number;
  visible: boolean;
}

function KeywordRow({ result, index, visible }: KeywordRowProps) {
  return (
    <div
      className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 300ms ease ${index * 50}ms, transform 300ms ease ${index * 50}ms`,
      }}
    >
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
        <HighlightedTitle title={result.doc.title} words={result.matchedWords} />
      </p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {result.doc.snippet}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gray-500 dark:bg-gray-400"
            style={{
              width: visible ? `${(result.score * 100).toFixed(0)}%` : "0%",
              transition: `width 400ms cubic-bezier(0.4,0,0.2,1) ${index * 50 + 100}ms`,
            }}
          />
        </div>
        <span className="font-mono text-xs text-gray-500">{(result.score * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

interface SemanticRowProps {
  result: SemanticResult;
  index: number;
  visible: boolean;
}

function SemanticRow({ result, index, visible }: SemanticRowProps) {
  return (
    <div
      className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-950/20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 300ms ease ${index * 50}ms, transform 300ms ease ${index * 50}ms`,
      }}
    >
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{result.doc.title}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {result.doc.snippet}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
          <div
            className={cn("h-full rounded-full", scoreBarColor(result.score))}
            style={{
              width: visible ? `${(result.score * 100).toFixed(0)}%` : "0%",
              transition: `width 400ms cubic-bezier(0.4,0,0.2,1) ${index * 50 + 100}ms`,
            }}
          />
        </div>
        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
          {result.score.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ── Default corpus / presets ──────────────────────────────────────────────────

const DEFAULT_CORPUS: CorpusDoc[] = [
  { id: "d1", title: "Car won't start — check the battery", snippet: "A car that won't start is usually a dead battery or a faulty starter motor.", keywords: ["car", "won't", "start", "battery"], embeddingCluster: "car-trouble" },
  { id: "d2", title: "Vehicle fails to turn on", snippet: "If your vehicle fails to turn on, check the battery terminals first.", keywords: ["vehicle", "fails", "turn"], embeddingCluster: "car-trouble" },
  { id: "d3", title: "Can't log in? Try these steps", snippet: "If you can't log in, try resetting your password or clearing your browser cache.", keywords: ["can't", "log", "in", "password"], embeddingCluster: "login" },
  { id: "d4", title: "Authentication failure guide", snippet: "Authentication failure usually means your session token has expired.", keywords: ["authentication", "failure", "session"], embeddingCluster: "login" },
  { id: "d5", title: "Wrong bill or unexpected charge?", snippet: "If your bill looks wrong or you see an unexpected charge, contact our billing team.", keywords: ["wrong", "bill", "charge"], embeddingCluster: "billing" },
  { id: "d6", title: "Incorrect invoice resolution", snippet: "For an incorrect invoice or overcharge on your statement, contact billing.", keywords: ["invoice", "overcharge", "statement"], embeddingCluster: "billing" },
];

const DEFAULT_PRESETS: QueryPreset[] = [
  { query: "car won't start", label: "Car trouble" },
  { query: "I can't log in", label: "Login issue" },
  { query: "bill is wrong", label: "Billing error" },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function SearchQuerySimulator({
  title,
  caption,
  corpus = DEFAULT_CORPUS,
  presets = DEFAULT_PRESETS,
  defaultQuery = "",
}: SearchQuerySimulatorProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [kwResults, setKwResults] = useState<KeywordResult[]>([]);
  const [semResults, setSemResults] = useState<SemanticResult[]>([]);
  const [ran, setRan] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    (q: string) => {
      setResultsVisible(false);
      const kw = keywordSearch(q, corpus);
      const sem = semanticSearch(q, corpus);
      setKwResults(kw);
      setSemResults(sem);
      setRan(true);
      requestAnimationFrame(() => {
        setTimeout(() => setResultsVisible(true), 20);
      });
    },
    [corpus],
  );

  // Auto-run 400ms after typing stops
  useEffect(() => {
    if (!query) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  // Run default query on mount
  useEffect(() => {
    if (defaultQuery) runSearch(defaultQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreset = (p: QueryPreset) => {
    setQuery(p.query);
    runSearch(p.query);
  };

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      {(title || caption) && (
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          {title && <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>}
          {caption && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a search query…"
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-600 dark:focus:ring-blue-900/30"
          />
          <button
            onClick={() => runSearch(query)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:bg-blue-800"
          >
            Search
          </button>
        </div>

        {/* Preset buttons */}
        {presets.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePreset(p)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  query === p.query
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Results grid */}
        {ran && (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Keyword column */}
            <div>
              <div className="mb-3 rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Keyword search
                </p>
              </div>
              {kwResults.length === 0 ? (
                <div
                  className="rounded-lg border border-dashed border-gray-200 p-4 text-center dark:border-gray-700"
                  style={{
                    opacity: resultsVisible ? 1 : 0,
                    transition: "opacity 300ms ease",
                  }}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    0 results — no character overlap found.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {kwResults.map((r, i) => (
                    <KeywordRow key={r.doc.id} result={r} index={i} visible={resultsVisible} />
                  ))}
                </div>
              )}
              {/* Insight */}
              <p
                className="mt-2 text-xs text-gray-400 dark:text-gray-500"
                style={{
                  opacity: resultsVisible ? 1 : 0,
                  transition: "opacity 400ms ease 300ms",
                }}
              >
                Matched {kwResults.length} / {corpus.length} documents
              </p>
            </div>

            {/* Semantic column */}
            <div>
              <div className="mb-3 rounded-lg bg-blue-50 px-3 py-1.5 dark:bg-blue-950/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Semantic search
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {semResults.map((r, i) => (
                  <SemanticRow key={r.doc.id} result={r} index={i} visible={resultsVisible} />
                ))}
              </div>
              {/* Insight */}
              <p
                className="mt-2 text-xs text-gray-400 dark:text-gray-500"
                style={{
                  opacity: resultsVisible ? 1 : 0,
                  transition: "opacity 400ms ease 300ms",
                }}
              >
                Top result:{" "}
                <span className="font-mono text-blue-500">
                  {semResults[0]?.score.toFixed(2) ?? "—"}
                </span>{" "}
                similarity
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
