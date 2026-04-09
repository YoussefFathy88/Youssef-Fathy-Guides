"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

export interface MessageQueueSimProps {
  title?: string;
  caption?: string;
  queueCapacity?: number;
  consumerCount?: number;
}

interface Msg {
  id: number;
  color: string;
  failCount: number;
}

interface Consumer {
  id: number;
  processing: Msg | null;
  progress: number; // 0–100
  processDuration: number; // ms
  alive: boolean;
}

const MSG_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-teal-500", "bg-amber-500",
  "bg-rose-500", "bg-green-600", "bg-indigo-500", "bg-orange-500",
];

let _msgId = 0;
const nextMsgId = () => ++_msgId;

function mkConsumer(id: number): Consumer {
  return { id, processing: null, progress: 0, processDuration: 1200 + Math.random() * 800, alive: true };
}

function colorFor(id: number): string {
  return MSG_COLORS[id % MSG_COLORS.length];
}

export default function MessageQueueSim({
  title,
  caption,
  queueCapacity = 10,
  consumerCount = 2,
}: MessageQueueSimProps) {
  const [queue, setQueue] = useState<Msg[]>([]);
  const [dlq, setDlq] = useState<Msg[]>([]);
  const [consumers, setConsumers] = useState<Consumer[]>(() =>
    Array.from({ length: consumerCount }, (_, i) => mkConsumer(i + 1))
  );
  const [autoPublish, setAutoPublish] = useState(false);
  const [simulateFail, setSimulateFail] = useState(false);
  const [published, setPublished] = useState(0);
  const [consumed, setConsumed] = useState(0);

  const queueRef   = useRef(queue);
  const consumersRef = useRef(consumers);
  const dlqRef     = useRef(dlq);
  const failRef    = useRef(simulateFail);
  queueRef.current   = queue;
  consumersRef.current = consumers;
  dlqRef.current     = dlq;
  failRef.current    = simulateFail;

  // Publish one message
  const publish = useCallback(() => {
    setQueue(q => {
      if (q.length >= queueCapacity) return q;
      const id = nextMsgId();
      setPublished(p => p + 1);
      return [...q, { id, color: colorFor(id), failCount: 0 }];
    });
  }, [queueCapacity]);

  // Auto-publish
  useEffect(() => {
    if (!autoPublish) return;
    const t = setInterval(publish, 800);
    return () => clearInterval(t);
  }, [autoPublish, publish]);

  // Consumer processing loop (~50ms tick)
  useEffect(() => {
    const TICK = 50;
    const t = setInterval(() => {
      setConsumers(prev => {
        const q = [...queueRef.current];
        const next = prev.map(c => {
          if (!c.alive) return c;

          if (c.processing) {
            const newProg = c.progress + (TICK / c.processDuration) * 100;
            if (newProg >= 100) {
              // Done processing
              const msg = c.processing;
              const shouldFail = failRef.current && msg.failCount < 2 && Math.random() < 0.4;
              if (shouldFail) {
                const updated = { ...msg, failCount: msg.failCount + 1 };
                if (updated.failCount >= 3) {
                  setDlq(d => [...d, updated]);
                } else {
                  setQueue(q2 => [updated, ...q2]); // re-queue at front
                }
              } else {
                setConsumed(cnt => cnt + 1);
              }
              return { ...c, processing: null, progress: 0, processDuration: 1200 + Math.random() * 800 };
            }
            return { ...c, progress: newProg };
          } else {
            // Try to dequeue
            if (q.length > 0) {
              const msg = q.shift()!;
              setQueue([...q]);
              return { ...c, processing: msg, progress: 0 };
            }
            return c;
          }
        });
        return next;
      });
    }, TICK);
    return () => clearInterval(t);
  }, []);

  const isFull = queue.length >= queueCapacity;
  const lag = queue.length;
  const aliveCount = consumers.filter(c => c.alive).length;

  function killConsumer() {
    setConsumers(prev => {
      const aliveIdx = prev.map((c, i) => ({ c, i })).filter(x => x.c.alive).map(x => x.i);
      if (aliveIdx.length <= 1) return prev;
      const killIdx = aliveIdx[aliveIdx.length - 1];
      return prev.map((c, i) => i === killIdx ? { ...c, alive: false, processing: null, progress: 0 } : c);
    });
  }

  function reviveConsumers() {
    setConsumers(prev => prev.map(c => ({ ...c, alive: true })));
  }

  function reset() {
    setQueue([]);
    setDlq([]);
    setConsumers(Array.from({ length: consumerCount }, (_, i) => mkConsumer(i + 1)));
    setPublished(0);
    setConsumed(0);
    setAutoPublish(false);
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Metrics bar */}
      <div className="mb-5 grid grid-cols-4 gap-2">
        {[
          { label: "Published", value: published, color: "text-violet-600 dark:text-violet-400" },
          { label: "Consumed",  value: consumed,  color: "text-teal-600 dark:text-teal-400"   },
          { label: "Queue Depth", value: `${lag}/${queueCapacity}`, color: lag > queueCapacity * 0.7 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400" },
          { label: "Consumer Lag", value: lag > 0 && aliveCount === 0 ? "∞" : lag, color: "text-gray-700 dark:text-gray-200" },
        ].map(m => (
          <div key={m.label} className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-[9px] text-gray-400">{m.label}</p>
            <p className={cn("text-sm font-bold", m.color)}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex gap-3">

        {/* Producer */}
        <div className="flex w-28 shrink-0 flex-col gap-2">
          <p className="text-center text-[10px] font-bold text-gray-500 dark:text-gray-400">Producer</p>
          <button
            type="button"
            onClick={publish}
            disabled={isFull}
            className={cn(
              "rounded-xl border py-3 text-xs font-bold transition",
              isFull
                ? "border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                : "border-violet-300 bg-violet-600 text-white hover:bg-violet-700",
            )}
          >
            {isFull ? "Queue Full\n⚡ backpressure" : "📤 Publish"}
          </button>
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-2 dark:border-gray-700 dark:bg-gray-900">
            <span className="text-[9px] text-gray-500">Auto</span>
            <button
              type="button"
              onClick={() => setAutoPublish(p => !p)}
              className={cn(
                "h-4 w-8 rounded-full transition-all",
                autoPublish ? "bg-violet-500" : "bg-gray-300 dark:bg-gray-600",
              )}
            >
              <div className={cn("h-3.5 w-3.5 rounded-full bg-white transition-all mx-px", autoPublish ? "translate-x-4" : "translate-x-0")} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-2 dark:border-gray-700 dark:bg-gray-900">
            <input
              id="fail-chk"
              type="checkbox"
              checked={simulateFail}
              onChange={e => setSimulateFail(e.target.checked)}
              className="h-3 w-3 accent-rose-500"
            />
            <label htmlFor="fail-chk" className="text-[9px] text-gray-500">Sim. failures</label>
          </div>
        </div>

        {/* Queue */}
        <div className="flex-1">
          <p className="mb-1.5 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
            Queue <span className="font-normal text-gray-400">({queue.length}/{queueCapacity})</span>
          </p>
          {/* Slot grid */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(queueCapacity, 5)}, 1fr)` }}>
            {Array.from({ length: queueCapacity }, (_, i) => {
              const msg = queue[i];
              return (
                <div
                  key={i}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-lg border text-[9px] font-bold transition-all",
                    msg
                      ? `${msg.color} border-transparent text-white`
                      : "border-dashed border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
                  )}
                >
                  {msg ? `#${msg.id}` : ""}
                </div>
              );
            })}
          </div>

          {/* DLQ */}
          {(dlq.length > 0 || simulateFail) && (
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                Dead Letter Queue ({dlq.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {dlq.map(m => (
                  <div key={m.id} className="rounded border border-rose-300 bg-rose-100 px-2 py-0.5 font-mono text-[9px] text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                    #{m.id} (failed {m.failCount}×)
                  </div>
                ))}
                {dlq.length === 0 && <span className="text-[10px] text-gray-400">empty</span>}
              </div>
            </div>
          )}
        </div>

        {/* Consumers */}
        <div className="flex w-36 shrink-0 flex-col gap-2">
          <p className="text-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
            Consumers ({aliveCount}/{consumers.length})
          </p>
          {consumers.map(c => (
            <div
              key={c.id}
              className={cn(
                "rounded-xl border p-2 transition-all",
                !c.alive ? "border-gray-200 bg-gray-100 opacity-50 dark:border-gray-700 dark:bg-gray-800" :
                c.processing ? "border-teal-200 bg-teal-50 dark:border-teal-700 dark:bg-teal-900/20" :
                "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                  Worker {c.id}
                </span>
                {c.alive && c.processing && (
                  <span className={cn("h-2 w-2 rounded-full", c.processing.color)} />
                )}
              </div>
              {c.alive ? (
                c.processing ? (
                  <div className="mt-1.5">
                    <div className="mb-0.5 flex justify-between text-[9px] text-gray-500">
                      <span>#{c.processing.id}</span>
                      <span>{Math.round(c.progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={cn("h-full rounded-full transition-all", c.processing.color)}
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-[9px] text-gray-400">idle</p>
                )
              ) : (
                <p className="mt-1 text-[9px] text-gray-400">💀 killed</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Queue fill bar */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[9px] text-gray-400">
          <span>Queue fill</span>
          <span>{Math.round((queue.length / queueCapacity) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={cn("h-full rounded-full transition-all duration-300",
              isFull ? "bg-rose-500" : queue.length > queueCapacity * 0.7 ? "bg-amber-500" : "bg-teal-500")}
            style={{ width: `${(queue.length / queueCapacity) * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={killConsumer}
          disabled={aliveCount <= 1}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
        >
          💀 Kill Consumer
        </button>
        {aliveCount < consumers.length && (
          <button
            type="button"
            onClick={reviveConsumers}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-medium text-teal-700 transition hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
          >
            💚 Revive All
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ↩ Reset
        </button>
        {isFull && (
          <span className="self-center text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            ⚡ Backpressure — queue is full!
          </span>
        )}
      </div>
    </div>
  );
}
