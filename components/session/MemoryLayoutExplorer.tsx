"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface StackFrame {
  id: number;
  name: string;
  size: number; // in bytes (display units)
}

interface HeapBlock {
  id: number;
  size: number;
}

type SegmentName = "stack" | "gap" | "heap" | "bss" | "data" | "text";

const SEGMENT_INFO: Record<SegmentName, { label: string; desc: string; grows?: string }> = {
  stack:  { label: "Stack",  desc: "Local variables, function parameters, return addresses. Grows downward toward lower addresses. Each function call adds a new frame.", grows: "↓ grows down" },
  gap:    { label: "Gap",    desc: "Unmapped virtual address space between stack and heap. A stack overflow occurs when they collide.", grows: undefined },
  heap:   { label: "Heap",   desc: "Dynamic allocations (malloc/new). Grows upward toward higher addresses. The programmer is responsible for freeing memory.", grows: "↑ grows up" },
  bss:    { label: "BSS",    desc: "Uninitialized global and static variables. Zero-filled by the OS at startup. BSS = Block Started by Symbol.", grows: undefined },
  data:   { label: "Data",   desc: "Initialized global and static variables. Stored in the binary on disk and loaded into memory at program start.", grows: undefined },
  text:   { label: "Text",   desc: "Executable machine code (compiled instructions). Read-only to prevent code modification. Shared between processes running the same binary.", grows: undefined },
};

const FRAME_NAMES = ["main()", "readFile()", "parseJSON()", "compute()", "validate()", "sort()", "encrypt()"];
const HEAP_LABELS = ["buf[256]", "node*", "array[64]", "string", "obj*", "data[128]"];

let frameIdSeq = 0;
let heapIdSeq = 0;

// Heights (px) for fixed segments
const TEXT_H = 48;
const DATA_H = 36;
const BSS_H  = 36;
const HEAP_BLOCK_H = 24; // per block
const STACK_FRAME_H = 24; // per frame
const TOTAL_H = 360;

export interface MemoryLayoutExplorerProps {
  title?: string;
  caption?: string;
}

export default function MemoryLayoutExplorer({ title, caption }: MemoryLayoutExplorerProps) {
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([
    { id: ++frameIdSeq, name: "main()", size: 64 },
  ]);
  const [heapBlocks, setHeapBlocks] = useState<HeapBlock[]>([]);
  const [selected, setSelected] = useState<SegmentName | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [newFrameAnim, setNewFrameAnim] = useState(false);
  const [newHeapAnim, setNewHeapAnim] = useState(false);

  const stackH = Math.max(32, stackFrames.length * STACK_FRAME_H + 8);
  const heapH  = Math.max(32, heapBlocks.length * HEAP_BLOCK_H + 8);
  const gapH   = Math.max(8, TOTAL_H - TEXT_H - DATA_H - BSS_H - stackH - heapH);
  const isOverflowing = gapH <= 8;

  const handleCallFunction = () => {
    if (isOverflowing) return;
    const name = FRAME_NAMES[stackFrames.length % FRAME_NAMES.length];
    setStackFrames(prev => [{ id: ++frameIdSeq, name, size: 32 + Math.floor(Math.random() * 64) }, ...prev]);
    setNewFrameAnim(true);
    setTimeout(() => setNewFrameAnim(false), 500);
    if (stackFrames.length >= 5) setOverflow(true);
  };

  const handleMalloc = () => {
    if (isOverflowing) return;
    const label = HEAP_LABELS[heapBlocks.length % HEAP_LABELS.length];
    setHeapBlocks(prev => [...prev, { id: ++heapIdSeq, size: 64 + Math.floor(Math.random() * 128) }]);
    setNewHeapAnim(true);
    setTimeout(() => setNewHeapAnim(false), 500);
    if (heapBlocks.length >= 4) setOverflow(true);
  };

  const handleReturn = () => {
    if (stackFrames.length <= 1) return;
    setStackFrames(prev => prev.slice(1));
    setOverflow(false);
  };

  // Hex address helpers (for display only)
  const HIGH_ADDR = 0x7fff_ff00;
  const LOW_ADDR  = 0x0000_0040;
  function addr(pct: number): string {
    const v = Math.round(LOW_ADDR + pct * (HIGH_ADDR - LOW_ADDR));
    return `0x${v.toString(16).padStart(8, "0")}`;
  }

  const segments: { name: SegmentName; height: number; isGap?: boolean }[] = [
    { name: "stack", height: stackH },
    { name: "gap",   height: gapH, isGap: true },
    { name: "heap",  height: heapH },
    { name: "bss",   height: BSS_H },
    { name: "data",  height: DATA_H },
    { name: "text",  height: TEXT_H },
  ];

  const segColors: Record<SegmentName, string> = {
    stack: "bg-rose-100 border-rose-300 dark:bg-rose-900/30 dark:border-rose-700",
    gap:   "bg-gray-50 border-dashed border-gray-200 dark:bg-gray-900/20 dark:border-gray-700",
    heap:  "bg-teal-100 border-teal-300 dark:bg-teal-900/30 dark:border-teal-700",
    bss:   "bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700",
    data:  "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
    text:  "bg-violet-100 border-violet-300 dark:bg-violet-900/30 dark:border-violet-700",
  };

  const segText: Record<SegmentName, string> = {
    stack: "text-rose-700 dark:text-rose-300",
    gap:   "text-gray-400 dark:text-gray-600",
    heap:  "text-teal-700 dark:text-teal-300",
    bss:   "text-amber-700 dark:text-amber-300",
    data:  "text-blue-700 dark:text-blue-300",
    text:  "text-violet-700 dark:text-violet-300",
  };

  const segDotColors: Record<SegmentName, string> = {
    stack: "bg-rose-500",
    gap:   "bg-gray-300",
    heap:  "bg-teal-500",
    bss:   "bg-amber-500",
    data:  "bg-blue-500",
    text:  "bg-violet-500",
  };

  // Cumulative heights for address labels
  let cumH = 0;
  const addrPoints: { pct: number; name: SegmentName }[] = [];
  for (const seg of [...segments].reverse()) {
    addrPoints.push({ pct: cumH / TOTAL_H, name: seg.name });
    cumH += seg.height;
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      <div className="flex gap-4">
        {/* Address labels */}
        <div className="flex shrink-0 flex-col justify-between py-0 font-mono text-[9px] text-gray-400 dark:text-gray-500"
          style={{ height: TOTAL_H }}>
          <span>{addr(1)}</span>
          <span>↑ high</span>
          <span>↓ low</span>
          <span>{addr(0)}</span>
        </div>

        {/* Memory bar */}
        <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" style={{ height: TOTAL_H }}>
          {segments.map(seg => (
            <button
              key={seg.name}
              type="button"
              onClick={() => setSelected(selected === seg.name ? null : seg.name)}
              style={{ height: `${seg.height}px`, flexShrink: 0 }}
              className={cn(
                "relative flex items-start overflow-hidden border-b px-2 py-1 text-left transition-all duration-300",
                segColors[seg.name],
                selected === seg.name && "ring-2 ring-inset ring-gray-400 dark:ring-gray-500",
              )}
            >
              {seg.name !== "gap" && (
                <span className={cn("text-[10px] font-semibold", segText[seg.name])}>
                  {SEGMENT_INFO[seg.name].label}
                  {SEGMENT_INFO[seg.name].grows && (
                    <span className="ml-1 font-normal opacity-60">{SEGMENT_INFO[seg.name].grows}</span>
                  )}
                </span>
              )}

              {/* Stack frames */}
              {seg.name === "stack" && (
                <div className="absolute inset-x-0 top-6 flex flex-col gap-px px-2">
                  {stackFrames.map((frame, fi) => (
                    <div
                      key={frame.id}
                      style={{
                        height: STACK_FRAME_H - 2,
                        opacity: fi === 0 && newFrameAnim ? 0.6 : 1,
                        transition: "opacity 0.4s, transform 0.3s",
                        transform: fi === 0 && newFrameAnim ? "translateY(-4px)" : "translateY(0)",
                      }}
                      className="flex items-center rounded bg-rose-300 px-2 dark:bg-rose-700"
                    >
                      <span className="text-[9px] font-mono font-medium text-rose-900 dark:text-rose-100">
                        {frame.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Heap blocks */}
              {seg.name === "heap" && (
                <div className="absolute inset-x-0 bottom-1 flex flex-col-reverse gap-px px-2">
                  {heapBlocks.map((block, bi) => (
                    <div
                      key={block.id}
                      style={{
                        height: HEAP_BLOCK_H - 2,
                        opacity: bi === heapBlocks.length - 1 && newHeapAnim ? 0.6 : 1,
                        transition: "opacity 0.4s",
                      }}
                      className="flex items-center rounded bg-teal-300 px-2 dark:bg-teal-700"
                    >
                      <span className="text-[9px] font-mono text-teal-900 dark:text-teal-100">
                        malloc {block.size}B
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Gap overflow warning */}
              {seg.name === "gap" && isOverflowing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                    ⚠ Stack Overflow!
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Segment legend */}
        <div className="flex shrink-0 flex-col gap-1.5">
          {(Object.keys(SEGMENT_INFO) as SegmentName[]).filter(k => k !== "gap").map(name => (
            <div key={name} className="flex items-center gap-1.5">
              <div className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", segDotColors[name])} />
              <span className={cn("text-[10px] font-medium", segText[name])}>{SEGMENT_INFO[name].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip panel */}
      {selected && (
        <div className={cn("mt-4 rounded-xl border p-3 transition-all", segColors[selected])}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn("text-xs font-bold", segText[selected])}>
                {SEGMENT_INFO[selected].label}
                {SEGMENT_INFO[selected].grows && <span className="ml-1.5 font-normal opacity-70">{SEGMENT_INFO[selected].grows}</span>}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                {SEGMENT_INFO[selected].desc}
              </p>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="shrink-0 text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isOverflowing}
          onClick={handleCallFunction}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
        >
          📞 Call function
        </button>
        <button
          type="button"
          disabled={stackFrames.length <= 1}
          onClick={handleReturn}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ↩ Return
        </button>
        <button
          type="button"
          disabled={isOverflowing}
          onClick={handleMalloc}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-medium text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
        >
          🗄 malloc()
        </button>
        <button
          type="button"
          onClick={() => { setStackFrames([{ id: ++frameIdSeq, name: "main()", size: 64 }]); setHeapBlocks([]); setOverflow(false); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ↩ Reset
        </button>
        <span className="self-center text-[10px] text-gray-400 dark:text-gray-500">
          {stackFrames.length} frame{stackFrames.length !== 1 ? "s" : ""} · {heapBlocks.length} heap alloc{heapBlocks.length !== 1 ? "s" : ""} · Click any segment for details
        </span>
      </div>
    </div>
  );
}
