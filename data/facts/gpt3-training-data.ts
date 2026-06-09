/**
 * Canonical GPT-3 pre-training data facts + teaching copy.
 * Hard numbers: data/facts/gpt3-training-data.json (Brown et al. 2020, Table 2.2 + Appendix A).
 * Components must import from here — do not duplicate stats in session UI files.
 */

import rawFacts from "./gpt3-training-data.json";

export type FactTier = "hard" | "pedagogical";

/** Verified numeric / mechanism facts from the paper JSON. */
export const GPT3_DATASET_FACTS = rawFacts;

export type Gpt3AccentColor = "amber" | "rose" | "violet" | "blue" | "teal";

export interface Gpt3SourceTeachingCopy {
  id: string;
  label: string;
  shortLabel: string;
  emoji: string;
  color: Gpt3AccentColor;
  what: string;
  whatTier: FactTier;
  /** Source-specific step first, then shared cleanup steps on every tab. */
  filterSteps: string[];
  filterTier: FactTier;
  note?: string;
  noteTier?: FactTier;
  diagramLabel: string;
}

export interface Gpt3DataSourceBuilt {
  id: string;
  label: string;
  shortLabel: string;
  emoji: string;
  color: Gpt3AccentColor;
  what: string;
  filter: string;
  filterSteps: string[];
  rawTokensB: number;
  weightPercent: number;
  note?: string;
}

/** Applied to every GPT-3 source (Brown et al. 2020, Appendix A; benchmark step §4.1). */
const SHARED_FILTER_STEPS = [
  "Remove duplicate pages across all five sources.",
  "Drop benchmark test overlap.",
] as const;

export interface Gpt3CompareRow {
  label: string;
  raw: number;
  weight: number;
  color: Gpt3AccentColor;
}

const TEACHING_COPY: Record<string, Gpt3SourceTeachingCopy> = {
  "common-crawl": {
    id: "common-crawl",
    label: "Common Crawl (Filtered)",
    shortLabel: "Common Crawl",
    emoji: "🌐",
    color: "amber",
    what: "A robot that visits billions of websites, saves everything it finds, and gives it to everyone for free.",
    whatTier: "pedagogical",
    filterSteps: [
      "Quality checker (ML) — keep pages that look like WebText, books, and Wikipedia.",
      ...SHARED_FILTER_STEPS,
    ],
    filterTier: "hard",
    note: "60% of training — but each page is seen less than once over 300B training tokens.",
    noteTier: "hard",
    diagramLabel: "Public Web",
  },
  webtext2: {
    id: "webtext2",
    label: "WebText2",
    shortLabel: "WebText2",
    emoji: "⬆️",
    color: "rose",
    what: "Web pages linked from Reddit posts with 3+ upvotes.",
    whatTier: "hard",
    filterSteps: [
      "Only pages linked from Reddit posts with 3+ upvotes.",
      ...SHARED_FILTER_STEPS,
    ],
    filterTier: "hard",
    note: "22% of training — each page seen about 3×.",
    noteTier: "hard",
    diagramLabel: "Reddit upvotes = quality filter",
  },
  books1: {
    id: "books1",
    label: "Books1",
    shortLabel: "Books1",
    emoji: "📖",
    color: "violet",
    what: "Self-published books from the internet.",
    whatTier: "pedagogical",
    filterSteps: [
      ...SHARED_FILTER_STEPS,
    ],
    filterTier: "pedagogical",
    note: "Self-published vs published — simplified; paper does not name sources.",
    noteTier: "pedagogical",
    diagramLabel: "Self-published books",
  },
  books2: {
    id: "books2",
    label: "Books2",
    shortLabel: "Books2",
    emoji: "📚",
    color: "blue",
    what: "Published books from the internet.",
    whatTier: "pedagogical",
    filterSteps: [
      ...SHARED_FILTER_STEPS,
    ],
    filterTier: "pedagogical",
    note: "Self-published vs published — simplified; paper does not name sources.",
    noteTier: "pedagogical",
    diagramLabel: "Published books",
  },
  wikipedia: {
    id: "wikipedia",
    label: "Wikipedia (English)",
    shortLabel: "Wikipedia",
    emoji: "📝",
    color: "teal",
    what: "All English Wikipedia articles — clean, factual reference text.",
    whatTier: "hard",
    filterSteps: [
      "Trusted source — little extra filtering at collection.",
      ...SHARED_FILTER_STEPS,
    ],
    filterTier: "pedagogical",
    note: "Smallest source (3B tokens) but seen about 3× during training.",
    noteTier: "hard",
    diagramLabel: "Clean · structured · factual",
  },
};

function sourceById(id: string) {
  const row = GPT3_DATASET_FACTS.sources.find((s) => s.id === id);
  if (!row) throw new Error(`Missing GPT-3 source fact: ${id}`);
  return row;
}

export function buildGpt3DataSources(): Gpt3DataSourceBuilt[] {
  return GPT3_DATASET_FACTS.sources.map((row) => {
    const copy = TEACHING_COPY[row.id];
    if (!copy) throw new Error(`Missing GPT-3 teaching copy: ${row.id}`);

    return {
      id: copy.id,
      label: copy.label,
      shortLabel: copy.shortLabel,
      emoji: copy.emoji,
      color: copy.color,
      what: copy.what,
      filterSteps: [...copy.filterSteps],
      filter: copy.filterSteps.join(" "),
      rawTokensB: row.rawTokensB,
      weightPercent: row.weightPercent,
      note: copy.note,
    };
  });
}

export function buildGpt3CompareRows(): Gpt3CompareRow[] {
  return GPT3_DATASET_FACTS.compareRows.map((row) => {
    const raw = row.sourceIds.reduce((sum, id) => sum + sourceById(id).rawTokensB, 0);
    const weight = row.sourceIds.reduce((sum, id) => sum + sourceById(id).weightPercent, 0);
    return {
      label: row.label,
      raw,
      weight,
      color: row.color as Gpt3AccentColor,
    };
  });
}

export function getGpt3DiagramLabel(sourceId: string): string {
  const copy = TEACHING_COPY[sourceId];
  if (!copy) throw new Error(`Missing GPT-3 diagram label: ${sourceId}`);
  return copy.diagramLabel;
}

export function getGpt3MaxRawTokensB(): number {
  return Math.max(...GPT3_DATASET_FACTS.sources.map((s) => s.rawTokensB));
}
