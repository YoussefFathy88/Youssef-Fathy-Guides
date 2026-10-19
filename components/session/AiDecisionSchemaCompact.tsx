"use client";

import { cn } from "@/lib/utils";
import {
  AI_DECISION_SCHEMA_LINES,
  AI_DECISION_SCHEMA_NAME,
  type SchemaFieldLine,
} from "./ai-taskflow-schema";

export interface AiDecisionSchemaCompactProps {
  title?: string;
  className?: string;
  /** Top-level fields only, no title or footer — fits inside a slide-sized panel. */
  compact?: boolean;
}

function SchemaRow({ field, depth = 0 }: { field: SchemaFieldLine; depth?: number }) {
  return (
    <div className={cn(depth > 0 && "ml-4 md:ml-6 border-l border-violet-500/25 pl-3 md:pl-4")}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-1.5">
        <span className="font-mono text-base md:text-lg font-semibold text-violet-800 dark:text-violet-200">
          {field.key}
        </span>
        <span className="font-mono text-base md:text-lg text-gray-600 dark:text-gray-500">:</span>
        <span className="font-mono text-base md:text-lg text-amber-800 dark:text-amber-200/90">{field.type}</span>
        {field.required && (
          <span className="rounded-full border border-rose-500/40 bg-rose-950/40 px-2 py-0.5 font-mono text-base font-bold text-rose-800 dark:text-rose-200">
            required
          </span>
        )}
        {field.note && (
          <span className="font-mono text-base md:text-lg text-gray-600 dark:text-gray-400 w-full md:w-auto">
            — {field.note}
          </span>
        )}
      </div>
      {field.children?.map((child) => (
        <SchemaRow key={child.key} field={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function AiDecisionSchemaCompact({
  title = "Response schema — validated before your code runs",
  className,
  compact = false,
}: AiDecisionSchemaCompactProps) {
  // Compact: scalar fields without notes; payload objects collapsed into one row (only the chosen one is filled).
  const payloads = AI_DECISION_SCHEMA_LINES.filter((f) => f.type === "object");
  const lines: SchemaFieldLine[] = compact
    ? [
        ...AI_DECISION_SCHEMA_LINES.filter((f) => f.type !== "object").map(
          ({ key, type, required }) => ({ key, type, required }),
        ),
        {
          key: payloads.map((f) => f.key).join(" · "),
          type: "object",
        },
      ]
    : AI_DECISION_SCHEMA_LINES;

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-600/35 bg-violet-950/25 space-y-3",
        compact ? "p-4 md:p-5" : "p-5 md:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl" aria-hidden>
          🔧
        </span>
        <span className="font-mono text-lg md:text-xl font-bold text-violet-800 dark:text-violet-200">
          {AI_DECISION_SCHEMA_NAME}
        </span>
        <span className="font-mono text-base md:text-lg text-gray-600 dark:text-gray-400">JSON Schema</span>
      </div>
      {title && !compact && <p className="text-lg md:text-xl text-violet-800 dark:text-violet-100/90 leading-relaxed">{title}</p>}
      <div className={cn("rounded-lg border border-violet-700/30 bg-white/80 dark:bg-gray-950/80 space-y-0.5", compact ? "px-4 py-2" : "p-4 md:p-5")}>
        {lines.map((field) => (
          <SchemaRow key={field.key} field={field} />
        ))}
      </div>
      <p className={cn("text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed", compact && "hidden")}>
        Only the payload for the chosen <span className="font-mono text-amber-800 dark:text-amber-200">action</span> is
        filled — other branches stay empty.
      </p>
    </div>
  );
}
