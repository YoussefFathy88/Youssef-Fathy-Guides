"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

export type RateLimitAlgorithm = "TokenBucket" | "SlidingWindow" | "FixedWindow";

export interface RateLimiterVisualizerProps {
  title?: string;
  caption?: string;
  defaultAlgorithm?: RateLimitAlgorithm;
  requestsPerSecond?: number;
  burstCapacity?: number;
}

interface Request {
  id: number;
  time: number;       // ms since epoch
  allowed: boolean;
}

let _rid = 0;
const nextRid = () => ++_rid;

const ALGO_LABELS: Record<RateLimitAlgorithm, string> = {
  TokenBucket:   "Token Bucket",
  SlidingWindow: "Sliding Window",
  FixedWindow:   "Fixed Window",
};

const ALGO_DESC: Record<RateLimitAlgorithm, string> = {
  TokenBucket:   "Tokens refill at a steady rate. A request consumes one token. Burst allowed up to bucket capacity.",
  SlidingWindow: "Counts requests in a rolling 1-second window. Smoothly prevents spikes.",
  FixedWindow:   "Counts resets at each boundary. Thundering-herd: 2× the rate can pass at a window edge.",
};

const WINDOW_MS = 1000; // 1s window for Sliding / Fixed

export default function RateLimiterVisualizer({
  title,
  caption,
  defaultAlgorithm = "TokenBucket",
  requestsPerSecond = 5,
  burstCapacity = 10,
}: RateLimiterVisualizerProps) {
  const [algo, setAlgo] = useState<RateLimitAlgorithm>(defaultAlgorithm);
  const [incomingRate, setIncomingRate] = useState(requestsPerSecond);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Token Bucket state
  const [tokens, setTokens] = useState(burstCapacity);
  const tokensRef = useRef(burstCapacity);
  tokensRef.current = tokens;

  // Sliding Window state
  const slidingWindowRef = useRef<number[]>([]); // timestamps of allowed requests in window

  // Fixed Window state
  const fixedWindowRef = useRef({ start: 0, count: 0 });

  // Counters
  const [allowed, setAllowed]     = useState(0);
  const [throttled, setThrottled] = useState(0);

  const algoRef        = useRef(algo);
  const rateRef        = useRef(incomingRate);
  const burstRef       = useRef(burstCapacity);
  algoRef.current      = algo;
  rateRef.current      = incomingRate;
  burstRef.current     = burstCapacity;

  const tickRateRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRefillRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Token refill (every 100ms, add rate/10 tokens)
  useEffect(() => {
    if (!isRunning || algo !== "TokenBucket") return;
    tickRefillRef.current = setInterval(() => {
      setTokens(t => Math.min(burstRef.current, t + rateRef.current / 10));
    }, 100);
    return () => { if (tickRefillRef.current) clearInterval(tickRefillRef.current); };
  }, [isRunning, algo]);

  // Request generation
  const processRequest = useCallback(() => {
    const now = Date.now();
    const a = algoRef.current;
    let pass = false;

    if (a === "TokenBucket") {
      if (tokensRef.current >= 1) {
        setTokens(t => { tokensRef.current = t - 1; return t - 1; });
        pass = true;
      }
    } else if (a === "SlidingWindow") {
      const cutoff = now - WINDOW_MS;
      const recent = slidingWindowRef.current.filter(t => t > cutoff);
      if (recent.length < rateRef.current) {
        recent.push(now);
        slidingWindowRef.current = recent;
        pass = true;
      } else {
        slidingWindowRef.current = recent;
      }
    } else {
      // Fixed window
      const fw = fixedWindowRef.current;
      if (now - fw.start >= WINDOW_MS) {
        fw.start = now;
        fw.count = 0;
      }
      if (fw.count < rateRef.current) {
        fw.count++;
        pass = true;
      }
    }

    const req: Request = { id: nextRid(), time: now, allowed: pass };
    setRequests(prev => [...prev.slice(-50), req]);
    if (pass) setAllowed(c => c + 1);
    else       setThrottled(c => c + 1);
  }, []);

  useEffect(() => {
    if (!isRunning) { if (tickRateRef.current) clearInterval(tickRateRef.current); return; }
    const interval = Math.max(50, 1000 / incomingRate);
    tickRateRef.current = setInterval(processRequest, interval);
    return () => { if (tickRateRef.current) clearInterval(tickRateRef.current); };
  }, [isRunning, incomingRate, processRequest]);

  function handleBurst() {
    for (let i = 0; i < 20; i++) {
      setTimeout(processRequest, i * 30);
    }
  }

  function resetAll() {
    setIsRunning(false);
    setRequests([]);
    setAllowed(0);
    setThrottled(0);
    setTokens(burstCapacity);
    tokensRef.current = burstCapacity;
    slidingWindowRef.current = [];
    fixedWindowRef.current = { start: 0, count: 0 };
  }

  function switchAlgo(a: RateLimitAlgorithm) {
    setAlgo(a);
    resetAll();
  }

  const tokenPct   = Math.round((tokens / burstCapacity) * 100);
  const recentReqs = requests.slice(-30);
  const now        = Date.now();

  // For Sliding Window visualization
  const windowReqs = requests.filter(r => r.allowed && r.time > now - WINDOW_MS);
  const windowCount = windowReqs.length;

  // For Fixed Window visualization
  const fwStart = fixedWindowRef.current.start;
  const fwCount = fixedWindowRef.current.count;
  const fwPct   = fwStart > 0 ? Math.min(100, ((Date.now() - fwStart) / WINDOW_MS) * 100) : 0;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Algorithm tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["TokenBucket", "SlidingWindow", "FixedWindow"] as RateLimitAlgorithm[]).map(a => (
          <button
            key={a}
            type="button"
            onClick={() => switchAlgo(a)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              a === algo
                ? "border-teal-300 bg-teal-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
            )}
          >
            {ALGO_LABELS[a]}
          </button>
        ))}
      </div>
      <p className="mb-5 text-[11px] text-gray-500 dark:text-gray-400">{ALGO_DESC[algo]}</p>

      {/* Algorithm-specific visualization */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">

        {algo === "TokenBucket" && (
          <div className="flex items-start gap-6">
            {/* Bucket fill meter */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-medium text-gray-500">Token Bucket</p>
              <div className="relative flex h-36 w-20 items-end overflow-hidden rounded-xl border-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
                <div
                  className="w-full rounded-b-xl bg-teal-400 transition-all duration-200"
                  style={{ height: `${tokenPct}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {Math.floor(tokens)}/{burstCapacity}
                  </span>
                </div>
                {/* Drip animation */}
                {isRunning && (
                  <div
                    className="absolute left-1/2 -ml-1 h-2 w-2 animate-bounce rounded-full bg-teal-300"
                    style={{ top: -8 }}
                  />
                )}
              </div>
              <p className="text-[9px] text-gray-400">↑ drip refill</p>
            </div>
            {/* Stats */}
            <div className="flex flex-1 flex-col gap-2">
              <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
                <p className="text-[10px] font-medium text-teal-700 dark:text-teal-300">Fill rate</p>
                <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{incomingRate} token/s</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-[10px] font-medium text-gray-500">Burst capacity</p>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{burstCapacity} tokens</p>
              </div>
              <div className="mt-auto flex flex-wrap gap-1">
                {Array.from({ length: burstCapacity }, (_, i) => (
                  <div
                    key={i}
                    className={cn("h-3 w-3 rounded-full transition-all",
                      i < Math.floor(tokens) ? "bg-teal-400" : "bg-gray-200 dark:bg-gray-700")}
                  />
                ))}
              </div>
              <p className="text-[9px] text-gray-400">Each token = 1 request allowed</p>
            </div>
          </div>
        )}

        {algo === "SlidingWindow" && (
          <div>
            <p className="mb-2 text-[10px] font-medium text-gray-500">
              Rolling 1-second window — {windowCount}/{incomingRate} slots used
            </p>
            {/* Timeline */}
            <div className="relative h-14 w-full overflow-hidden rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="absolute inset-y-0 right-0 w-1/3 rounded-r-xl bg-blue-200/60 dark:bg-blue-700/30" />
              <div className="absolute right-2 top-1 text-[9px] text-blue-600 dark:text-blue-400">← 1s window</div>
              {recentReqs.map(r => {
                const age = now - r.time;
                const pct = 100 - (age / 1500) * 100;
                if (pct < 0 || pct > 100) return null;
                return (
                  <div
                    key={r.id}
                    className={cn("absolute top-4 h-6 w-1.5 rounded-full",
                      r.allowed ? "bg-teal-500" : "bg-rose-500")}
                    style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                  />
                );
              })}
              <div className="absolute bottom-1 left-2 text-[9px] text-gray-400">older →</div>
              <div className="absolute bottom-1 right-2 text-[9px] text-gray-400">← now</div>
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-gray-500">
              <span>Window admits: <strong>{incomingRate} req/s</strong></span>
              <span className={cn(windowCount >= incomingRate ? "text-rose-600 dark:text-rose-400" : "text-teal-600 dark:text-teal-400")}>
                {windowCount >= incomingRate ? "🚫 Window full" : `✓ ${incomingRate - windowCount} slots free`}
              </span>
            </div>
          </div>
        )}

        {algo === "FixedWindow" && (
          <div>
            <p className="mb-2 text-[10px] font-medium text-gray-500">
              Fixed 1-second window — resets at each boundary
            </p>
            {/* Window grid */}
            <div className="grid grid-cols-3 gap-2">
              {[-2, -1, 0].map(offset => {
                const isCurrent = offset === 0;
                const cnt = isCurrent ? fwCount : 0;
                return (
                  <div
                    key={offset}
                    className={cn(
                      "rounded-xl border p-2 text-center transition-all",
                      isCurrent
                        ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20"
                        : "border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-800",
                    )}
                  >
                    <p className="text-[9px] text-gray-400">{offset === 0 ? "Current window" : `Past window ${offset}`}</p>
                    <p className={cn("text-xl font-bold", isCurrent ? "text-amber-600 dark:text-amber-400" : "text-gray-400")}>
                      {cnt}
                    </p>
                    <p className="text-[9px] text-gray-400">/ {incomingRate} limit</p>
                    {isCurrent && fwStart > 0 && (
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${fwPct}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
              ⚠ Thundering herd: up to {incomingRate * 2} req can pass at a window boundary (last req of old window + first of new).
            </p>
          </div>
        )}
      </div>

      {/* Request stream */}
      <div className="mb-4">
        <p className="mb-2 text-[10px] font-medium text-gray-500 dark:text-gray-400">Request stream (last 30)</p>
        <div className="flex flex-wrap gap-1">
          {recentReqs.map(r => (
            <div
              key={r.id}
              title={r.allowed ? "Allowed" : "Throttled (429)"}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-[8px] font-bold text-white transition-all",
                r.allowed ? "bg-teal-500" : "bg-rose-500",
              )}
            >
              {r.allowed ? "✓" : "429"}
            </div>
          ))}
          {recentReqs.length === 0 && (
            <span className="text-[11px] text-gray-400">No requests yet — click Start or Send Burst</span>
          )}
        </div>
      </div>

      {/* Live stats + rate slider */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Allowed",        value: allowed,   color: "text-teal-600 dark:text-teal-400"   },
          { label: "Throttled",      value: throttled, color: "text-rose-600 dark:text-rose-400"   },
          { label: "Allow Rate",     value: allowed + throttled > 0 ? `${Math.round((allowed / (allowed + throttled)) * 100)}%` : "—", color: "text-blue-600 dark:text-blue-400" },
          { label: algo === "TokenBucket" ? "Tokens Left" : "Window Slots",
            value: algo === "TokenBucket" ? Math.floor(tokens) : Math.max(0, incomingRate - windowCount),
            color: "text-gray-700 dark:text-gray-200" },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-[9px] text-gray-400">{s.label}</p>
            <p className={cn("text-sm font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Rate slider */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-[10px] text-gray-500">
          <span>Incoming rate</span>
          <span className="font-semibold">{incomingRate} req/s</span>
        </div>
        <input
          type="range" min={1} max={20} value={incomingRate}
          onChange={e => setIncomingRate(Number(e.target.value))}
          className="w-full accent-teal-500"
        />
        <div className="flex justify-between text-[9px] text-gray-400">
          <span>1</span><span>10</span><span>20 req/s</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsRunning(r => !r)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
            isRunning
              ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              : "bg-teal-600 text-white hover:bg-teal-700",
          )}
        >
          {isRunning ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          type="button"
          onClick={handleBurst}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        >
          ⚡ Send Burst (20)
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ↩ Reset
        </button>
      </div>
    </div>
  );
}
