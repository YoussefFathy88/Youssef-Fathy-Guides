"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

/* ─── Deterministic chunk layout ─────────────────────────────────────────── */

const SAMPLE_TEXT =
  "The transformer architecture was introduced in the 2017 paper Attention Is All You Need by Vaswani et al. at Google. It replaced recurrent neural networks with a self-attention mechanism that can process all tokens in parallel, dramatically speeding up training. The architecture consists of an encoder and decoder, each made of stacked identical layers. Each layer contains a multi-head self-attention sublayer followed by a position-wise feed-forward network. Layer normalisation and residual connections wrap each sublayer. The encoder maps an input sequence to a sequence of continuous representations. The decoder then generates an output sequence one token at a time, attending to both the encoder output and previously generated tokens. Positional encodings are added to the input embeddings to inject sequence order information, since the attention mechanism itself is order-agnostic.";

const WORDS = SAMPLE_TEXT.split(" ");

interface Chunk {
  start: number; // word index
  end: number;   // word index (exclusive)
  overlapStart: number; // where overlap begins from prev chunk
}

const CHUNK_COLORS = [
  { bg: "bg-violet-100 dark:bg-violet-500/20", border: "border-violet-300 dark:border-violet-500/40", text: "text-violet-800 dark:text-violet-200" },
  { bg: "bg-teal-100 dark:bg-teal-500/20",     border: "border-teal-300 dark:border-teal-500/40",     text: "text-teal-800 dark:text-teal-200"   },
  { bg: "bg-amber-100 dark:bg-amber-500/20",   border: "border-amber-300 dark:border-amber-500/40",   text: "text-amber-800 dark:text-amber-200" },
  { bg: "bg-blue-100 dark:bg-blue-500/20",     border: "border-blue-300 dark:border-blue-500/40",     text: "text-blue-800 dark:text-blue-200"   },
  { bg: "bg-rose-100 dark:bg-rose-500/20",     border: "border-rose-300 dark:border-rose-500/40",     text: "text-rose-800 dark:text-rose-200"   },
];

const OVERLAP_BG = "bg-white/70 dark:bg-gray-900/50 ring-1 ring-white dark:ring-gray-700";

function buildChunks(chunkSize: number, overlap: number): Chunk[] {
  const chunks: Chunk[] = [];
  let pos = 0;
  while (pos < WORDS.length) {
    const end = Math.min(pos + chunkSize, WORDS.length);
    chunks.push({
      start: pos,
      end,
      overlapStart: pos, // overlap from previous chunk is already included at start
    });
    pos += chunkSize - overlap;
    if (pos >= WORDS.length) break;
  }
  return chunks;
}

export interface ChunkVisualizerProps {
  title?:   string;
  caption?: string;
}

export default function ChunkVisualizer({
  title   = "Drag the sliders — watch chunks resize and overlap shift in real time",
  caption = "Smaller chunks = more precise retrieval. Larger overlap = fewer missed boundaries. Click any chunk to inspect its content.",
}: ChunkVisualizerProps) {
  const reducedMotion = useReducedMotion();
  const [chunkSize, setChunkSize] = useState(25);
  const [overlap, setOverlap]     = useState(5);
  const [activeChunk, setActiveChunk] = useState<number | null>(null);

  // Clamp overlap to always be less than chunkSize
  const safeOverlap = Math.min(overlap, chunkSize - 5);
  const chunks = useMemo(() => buildChunks(chunkSize, safeOverlap), [chunkSize, safeOverlap]);

  const totalTokensApprox = chunks.length * chunkSize;

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

        {/* Sliders */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Chunk size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Chunk size
              </label>
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 font-mono text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                ~{chunkSize * 4} tokens
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={chunkSize}
              onChange={e => {
                setChunkSize(Number(e.target.value));
                setActiveChunk(null);
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-violet-500 dark:bg-gray-700"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>10 words (precise)</span>
              <span>50 words (broad)</span>
            </div>
          </div>

          {/* Overlap */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Overlap
              </label>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                ~{safeOverlap * 4} tokens
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, chunkSize - 5)}
              step={2}
              value={safeOverlap}
              onChange={e => {
                setOverlap(Number(e.target.value));
                setActiveChunk(null);
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-amber-500 dark:bg-gray-700"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0 (no overlap)</span>
              <span>{chunkSize - 5} (max)</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white px-3 py-2.5 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] text-gray-400">Chunks</p>
            <motion.p
              key={chunks.length}
              initial={reducedMotion ? false : { scale: 1.2 }}
              animate={{ scale: 1 }}
              className="mt-0.5 font-mono text-xl font-bold text-violet-600 dark:text-violet-400"
            >
              {chunks.length}
            </motion.p>
          </div>
          <div className="rounded-xl bg-white px-3 py-2.5 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] text-gray-400">~Total tokens indexed</p>
            <motion.p
              key={totalTokensApprox}
              initial={reducedMotion ? false : { scale: 1.1 }}
              animate={{ scale: 1 }}
              className="mt-0.5 font-mono text-xl font-bold text-gray-800 dark:text-gray-200"
            >
              {totalTokensApprox * 4}
            </motion.p>
          </div>
          <div className="rounded-xl bg-white px-3 py-2.5 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] text-gray-400">Overlap %</p>
            <p className="mt-0.5 font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
              {chunkSize > 0 ? Math.round((safeOverlap / chunkSize) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Visual chunk display */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Document split into {chunks.length} chunk{chunks.length !== 1 ? "s" : ""} — click any to inspect
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chunks.map((chunk, ci) => {
              const col = CHUNK_COLORS[ci % CHUNK_COLORS.length];
              const isActive = activeChunk === ci;
              return (
                <motion.button
                  key={`${ci}-${chunk.start}-${chunk.end}`}
                  layout
                  type="button"
                  onClick={() => setActiveChunk(isActive ? null : ci)}
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: reducedMotion ? 0 : ci * 0.04 }}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all",
                    col.bg, col.border, col.text,
                    isActive && "scale-105 shadow-md ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900",
                  )}
                >
                  Chunk {ci + 1}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Active chunk content */}
        {activeChunk !== null && chunks[activeChunk] && (
          <motion.div
            key={`detail-${activeChunk}-${chunkSize}-${safeOverlap}`}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60"
          >
            {(() => {
              const ch = chunks[activeChunk];
              const col = CHUNK_COLORS[activeChunk % CHUNK_COLORS.length];
              const prevChunk = chunks[activeChunk - 1];
              const nextChunk = chunks[activeChunk + 1];

              return (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={cn("rounded-lg border px-2 py-0.5 text-xs font-bold", col.bg, col.border, col.text)}>
                      Chunk {activeChunk + 1}
                    </span>
                    <span className="text-xs text-gray-400">
                      words {ch.start}–{ch.end} · ~{(ch.end - ch.start) * 4} tokens
                    </span>
                  </div>

                  {/* Overlap from prev */}
                  {prevChunk && safeOverlap > 0 && (
                    <div className="mb-1">
                      <p className="mb-1 text-[10px] text-amber-500">← overlap from chunk {activeChunk}</p>
                      <p className={cn("rounded-lg px-3 py-2 text-xs leading-relaxed", OVERLAP_BG, "text-amber-700 dark:text-amber-300")}>
                        {WORDS.slice(ch.start, ch.start + safeOverlap).join(" ")}
                      </p>
                    </div>
                  )}

                  {/* Main body */}
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                    {WORDS.slice(
                      prevChunk && safeOverlap > 0 ? ch.start + safeOverlap : ch.start,
                      nextChunk && safeOverlap > 0 ? ch.end - safeOverlap : ch.end,
                    ).join(" ")}
                  </p>

                  {/* Overlap into next */}
                  {nextChunk && safeOverlap > 0 && (
                    <div className="mt-1">
                      <p className={cn("rounded-lg px-3 py-2 text-xs leading-relaxed", OVERLAP_BG, "text-amber-700 dark:text-amber-300")}>
                        {WORDS.slice(ch.end - safeOverlap, ch.end).join(" ")}
                      </p>
                      <p className="mt-1 text-[10px] text-amber-500">overlap into chunk {activeChunk + 2} →</p>
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500">
          {chunkSize <= 15
            ? "🔍 Small chunks — very precise retrieval, but may miss surrounding context."
            : chunkSize <= 30
            ? "✅ Balanced chunk size — good retrieval precision with adequate context."
            : "📄 Large chunks — more context per retrieved piece, but harder to match specific queries."}
        </p>
      </div>
    </motion.div>
  );
}
