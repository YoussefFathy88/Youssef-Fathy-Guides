"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

export interface ApiStage {
  id: string;
  label: string;
  icon: string;
  detail: string;
  latencyMs?: number;
  badge?: string;
}

export interface ApiLifecycleFlowProps {
  title?: string;
  caption?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  stages?: ApiStage[];
  autoPlay?: boolean;
}

const DEFAULT_STAGES: ApiStage[] = [
  {
    id: "client",
    label: "Client",
    icon: "💻",
    detail: 'Browser calls fetch("/api/users/42"). The HTTP request is serialized into bytes and sent across the network.',
    badge: "Origin",
  },
  {
    id: "dns",
    label: "DNS",
    icon: "🌐",
    detail: "api.example.com is resolved to an IP address via DNS. Cached locally after the first lookup, so subsequent requests skip this step.",
    latencyMs: 12,
    badge: "Resolve",
  },
  {
    id: "tls",
    label: "TLS",
    icon: "🔒",
    detail: "TLS handshake: the server sends its certificate, the client verifies it, and both sides agree on an encryption key. Required for HTTPS.",
    latencyMs: 28,
    badge: "Handshake",
  },
  {
    id: "server",
    label: "Server",
    icon: "⚙️",
    detail: "Node.js receives the request. The auth middleware validates the JWT, then the router matches GET /users/:id and calls the handler.",
    latencyMs: 5,
    badge: "Handler",
  },
  {
    id: "db",
    label: "Database",
    icon: "🗄️",
    detail: "SELECT * FROM users WHERE id = 42 — an index scan on the primary key returns one row in ~3ms. The ORM maps it to a plain object.",
    latencyMs: 3,
    badge: "Query",
  },
  {
    id: "response",
    label: "Response",
    icon: "📦",
    detail: "Server serializes the user object to JSON, sets Cache-Control and Content-Type headers, and sends 200 OK back to the client.",
    latencyMs: 2,
    badge: "200 OK",
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  DELETE: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  PATCH: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
};

export default function ApiLifecycleFlow({
  title,
  caption,
  method = "GET",
  path = "/api/users/42",
  statusCode = 200,
  stages = DEFAULT_STAGES,
  autoPlay = false,
}: ApiLifecycleFlowProps) {
  const reducedMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(-1);
  const [selected, setSelected] = useState<ApiStage | null>(null);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runFlow = useCallback(() => {
    if (running) return;
    setRunning(true);
    setActiveIdx(-1);
    setSelected(null);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const delay = reducedMotion ? 120 : 580;
    stages.forEach((_, i) => {
      const t = setTimeout(() => {
        setActiveIdx(i);
        if (i === stages.length - 1) {
          const t2 = setTimeout(() => setRunning(false), delay);
          timersRef.current.push(t2);
        }
      }, i * delay);
      timersRef.current.push(t);
    });
  }, [running, stages, reducedMotion]);

  useEffect(() => {
    if (autoPlay) {
      const t = setTimeout(runFlow, 400);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalLatency = stages.reduce((s, st) => s + (st.latencyMs ?? 0), 0);
  const methodColor = METHOD_COLORS[method] ?? "bg-gray-100 text-gray-700";

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Request bar */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
        <span className={cn("rounded px-2 py-0.5 font-mono text-[11px] font-bold", methodColor)}>
          {method}
        </span>
        <code className="flex-1 truncate font-mono text-[12px] text-gray-700 dark:text-gray-300">{path}</code>
        <AnimatePresence>
          {activeIdx === stages.length - 1 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 font-mono text-[11px] font-bold text-teal-700 dark:bg-teal-500/20 dark:text-teal-300"
            >
              {statusCode} OK
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Stage flow */}
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-center">
          {stages.map((stage, i) => {
            const isActive = activeIdx === i;
            const isDone = activeIdx > i;
            const isSelected = selected?.id === stage.id;

            return (
              <div key={stage.id} className="flex items-center">
                <motion.button
                  type="button"
                  onClick={() => setSelected(isSelected ? null : stage)}
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all",
                    isActive
                      ? "border-violet-300 bg-violet-50 shadow-md dark:border-violet-500/40 dark:bg-violet-500/10"
                      : isDone
                      ? "border-teal-200 bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/10"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
                    isSelected && "ring-2 ring-violet-400 dark:ring-violet-500",
                  )}
                >
                  <span className="text-2xl leading-none">{stage.icon}</span>
                  <span className={cn(
                    "text-[11px] font-semibold",
                    isActive ? "text-violet-700 dark:text-violet-300"
                      : isDone ? "text-teal-700 dark:text-teal-300"
                      : "text-gray-600 dark:text-gray-400",
                  )}>
                    {stage.label}
                  </span>
                  {stage.badge && (
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                      isActive
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                        : isDone
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                    )}>
                      {stage.badge}
                    </span>
                  )}
                  {stage.latencyMs !== undefined && stage.latencyMs > 0 && (
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">+{stage.latencyMs}ms</span>
                  )}
                </motion.button>

                {i < stages.length - 1 && (
                  <div className="relative mx-1 h-0.5 w-6">
                    <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-teal-400"
                      animate={{ scaleX: isDone || isActive ? 1 : 0 }}
                      style={{ transformOrigin: "left" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{selected.icon}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {selected.label}
              </span>
              {selected.latencyMs !== undefined && selected.latencyMs > 0 && (
                <span className="ml-auto font-mono text-[11px] text-gray-400 dark:text-gray-500">
                  +{selected.latencyMs}ms
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selected.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Latency + button */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          ~{totalLatency}ms total (warm connection, cached DNS) · Click any stage for details
        </span>
        <div className="ml-auto">
          <button
            type="button"
            disabled={running}
            onClick={() => {
              timersRef.current.forEach(clearTimeout);
              timersRef.current = [];
              setActiveIdx(-1);
              setSelected(null);
              setRunning(false);
              setTimeout(runFlow, 50);
            }}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
              running
                ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                : "bg-violet-600 text-white hover:bg-violet-700",
            )}
          >
            {running ? "Running…" : activeIdx >= 0 ? "↩ Replay" : "▶ Send Request"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
