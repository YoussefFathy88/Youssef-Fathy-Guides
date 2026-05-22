"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface SchemaField {
  key: string;
  type: string;
  description?: string;
  color?: string;
}

export interface SchemaConstraintVisualizerProps {
  title?: string;
  schemaName?: string;
  schemaFields?: SchemaField[];
  freeTextExamples?: string[];
  structuredExample?: Record<string, string>;
}

const DEFAULT_SCHEMA_FIELDS: SchemaField[] = [
  { key: "id", type: "string", description: "UUID", color: "text-violet-400" },
  { key: "title", type: "string", description: "Task title", color: "text-teal-400" },
  { key: "priority", type: '"low" | "medium" | "high"', description: "Urgency level", color: "text-amber-400" },
  { key: "dueDate", type: "string", description: "ISO date", color: "text-blue-400" },
  { key: "status", type: '"todo" | "in_progress" | "done"', description: "Current state", color: "text-rose-400" },
];

const DEFAULT_FREE_TEXT: string[] = [
  "Okay! I've noted that you need to review the PRs. I'd suggest doing it by Friday since that's coming up soon. Let me know if you need help prioritizing!",
  "- Review PRs before Friday\n- Priority: high\n- Don't forget about the standup on Thursday",
  "Task added: 'Review PRs', due Friday, high priority. Also reminder: team sync is Thursday at 3pm.",
];

const DEFAULT_STRUCTURED: Record<string, string> = {
  id: '"task_a3f9b2"',
  title: '"Review PRs before Friday"',
  priority: '"high"',
  dueDate: '"2026-05-24"',
  status: '"todo"',
};

export default function SchemaConstraintVisualizer({
  title = "Schema constraints lock the output shape — every response is parseable",
  schemaName = "TaskSchema",
  schemaFields = DEFAULT_SCHEMA_FIELDS,
  freeTextExamples = DEFAULT_FREE_TEXT,
  structuredExample = DEFAULT_STRUCTURED,
}: SchemaConstraintVisualizerProps) {
  const prefersReduced = useReducedMotion();
  const [freeIdx, setFreeIdx] = useState(0);
  const [mode, setMode] = useState<"free" | "structured">("free");
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    if (mode !== "free") return;
    const t = setInterval(() => setFreeIdx((i) => (i + 1) % freeTextExamples.length), 2800);
    return () => clearInterval(t);
  }, [mode, freeTextExamples.length]);

  const switchToStructured = useCallback(() => {
    setMode("structured");
    setSnap(true);
    const t = setTimeout(() => setSnap(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-950/60 p-8 md:p-10 space-y-8">
      {title && (
        <h3 className="text-xl md:text-2xl font-semibold text-gray-100 leading-snug">{title}</h3>
      )}

      {/* Toggle */}
      <div className="flex items-center gap-1.5 self-start rounded-full border border-gray-700 bg-gray-900 p-1.5">
        <button
          onClick={() => setMode("free")}
          className={cn(
            "rounded-full px-5 py-3 md:px-6 md:py-3.5 font-mono text-base md:text-lg font-semibold transition-all duration-200",
            mode === "free"
              ? "bg-gray-700 text-gray-100 shadow"
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          Free text
        </button>
        <button
          onClick={switchToStructured}
          className={cn(
            "rounded-full px-5 py-3 md:px-6 md:py-3.5 font-mono text-base md:text-lg font-semibold transition-all duration-200",
            mode === "structured"
              ? "bg-violet-600 text-white shadow"
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          Structured output
        </button>
      </div>

      {/* Split panels */}
      <div className="grid md:grid-cols-2 gap-5 md:gap-6">
        {/* Left: Free text */}
        <div
          className={cn(
            "rounded-xl border p-6 md:p-7 space-y-4 transition-all duration-500 min-h-[380px] flex flex-col",
            mode === "free"
              ? "border-gray-600 bg-gray-900"
              : "border-gray-800 bg-gray-900/40 opacity-50"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-gray-200">
              Unstructured — shape varies
            </span>
            <span className="rounded-full border border-gray-600 bg-gray-800 px-3 py-1 font-mono text-base text-gray-300">
              text/plain
            </span>
          </div>

          <div className="flex-1 rounded-lg border border-gray-700 bg-gray-950 p-5 md:p-6">
            <AnimatePresence mode="wait">
              <motion.pre
                key={freeIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: prefersReduced ? 0 : 0.3 }}
                className="whitespace-pre-wrap font-mono text-lg md:text-xl text-gray-100 leading-relaxed"
              >
                {freeTextExamples[freeIdx]}
              </motion.pre>
            </AnimatePresence>
          </div>

          {mode === "free" && (
            <div className="flex gap-2">
              {freeTextExamples.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === freeIdx ? "w-5 bg-gray-400" : "w-1.5 bg-gray-700"
                  )}
                />
              ))}
            </div>
          )}

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Different format every call. Cannot reliably parse, store, or chain.
          </p>
        </div>

        {/* Right: Schema-constrained */}
        <div
          className={cn(
            "rounded-xl border p-6 md:p-7 space-y-4 transition-all duration-500 min-h-[380px] flex flex-col",
            mode === "structured"
              ? snap
                ? "border-violet-400 bg-violet-950/30 shadow-[0_0_32px_-8px_rgba(167,139,250,0.5)]"
                : "border-violet-600/50 bg-violet-950/20"
              : "border-gray-800 bg-gray-900/40"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-base md:text-lg font-bold uppercase tracking-widest text-violet-200">
              Schema-constrained — shape guaranteed
            </span>
            <span className="rounded-full border border-violet-600/50 bg-violet-950/50 px-3 py-1 font-mono text-base text-violet-200">
              application/json
            </span>
          </div>

          {/* Schema definition */}
          <div className="rounded-lg border border-violet-700/30 bg-violet-950/20 p-4 md:p-5 space-y-2">
            <p className="font-mono text-lg md:text-xl font-bold text-violet-200 mb-1">{schemaName}</p>
            {schemaFields.map((f) => (
              <div key={f.key} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-base md:text-lg">
                <span className={cn("font-semibold", f.color ?? "text-teal-400")}>{f.key}</span>
                <span className="text-gray-500">:</span>
                <span className="text-gray-300">{f.type}</span>
                {f.description && (
                  <span className="text-gray-400 w-full md:w-auto md:inline">// {f.description}</span>
                )}
              </div>
            ))}
          </div>

          {/* Structured output */}
          <div className="flex-1 rounded-lg border border-violet-700/30 bg-gray-950 p-5 md:p-6 overflow-hidden">
            <AnimatePresence>
              {mode === "structured" ? (
                <motion.div
                  key="structured"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: prefersReduced ? 0 : 0.35, ease: "easeOut" }}
                  className="space-y-1"
                >
                  <span className="font-mono text-lg md:text-xl text-gray-400">{"{"}</span>
                  {schemaFields.map((f, i) => (
                    <motion.div
                      key={f.key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: prefersReduced ? 0 : i * 0.07, duration: 0.25 }}
                      className="flex flex-wrap gap-x-1 gap-y-0.5 font-mono text-lg md:text-xl pl-4 md:pl-5"
                    >
                      <span className={cn("font-semibold", f.color ?? "text-teal-400")}>
                        &quot;{f.key}&quot;
                      </span>
                      <span className="text-gray-500">:</span>
                      <span className="text-gray-100">{structuredExample[f.key] ?? '"…"'}</span>
                      {i < schemaFields.length - 1 && <span className="text-gray-500">,</span>}
                    </motion.div>
                  ))}
                  <span className="font-mono text-lg md:text-xl text-gray-400">{"}"}</span>
                </motion.div>
              ) : (
                <motion.p
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-lg md:text-xl text-gray-400 italic"
                >
                  Switch to structured output →
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <p className="text-lg md:text-xl text-violet-200 leading-relaxed">
            Same shape every call. Directly parseable, storable, and composable.
          </p>
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-xl border border-violet-500/25 bg-violet-950/20 px-5 py-4 md:px-6 md:py-5 flex items-start gap-4">
        <span className="text-2xl md:text-3xl shrink-0">🔒</span>
        <p className="text-lg md:text-xl text-violet-100 leading-relaxed">
          <span className="font-semibold">A JSON Schema is a contract</span> — it tells the model
          exactly what fields to return and in what format. The output always matches the shape
          you define. Your code can parse, validate, and store it without guessing.
        </p>
      </div>
    </div>
  );
}
