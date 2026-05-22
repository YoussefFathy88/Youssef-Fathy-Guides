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
}

function SchemaRow({ field, depth = 0 }: { field: SchemaFieldLine; depth?: number }) {
  return (
    <div className={cn(depth > 0 && "ml-4 md:ml-6 border-l border-violet-500/25 pl-3 md:pl-4")}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-1.5">
        <span className="font-mono text-base md:text-lg font-semibold text-violet-200">
          {field.key}
        </span>
        <span className="font-mono text-base md:text-lg text-gray-500">:</span>
        <span className="font-mono text-base md:text-lg text-amber-200/90">{field.type}</span>
        {field.required && (
          <span className="rounded-full border border-rose-500/40 bg-rose-950/40 px-2 py-0.5 font-mono text-sm md:text-base font-bold text-rose-200">
            required
          </span>
        )}
        {field.note && (
          <span className="font-mono text-base md:text-lg text-gray-400 w-full md:w-auto">
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
}: AiDecisionSchemaCompactProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-violet-600/35 bg-violet-950/25 p-5 md:p-6 space-y-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl" aria-hidden>
          🔧
        </span>
        <span className="font-mono text-lg md:text-xl font-bold text-violet-200">
          {AI_DECISION_SCHEMA_NAME}
        </span>
        <span className="font-mono text-base md:text-lg text-gray-400">JSON Schema</span>
      </div>
      {title && <p className="text-lg md:text-xl text-violet-100/90 leading-relaxed">{title}</p>}
      <div className="rounded-lg border border-violet-700/30 bg-gray-950/80 p-4 md:p-5 space-y-0.5">
        {AI_DECISION_SCHEMA_LINES.map((field) => (
          <SchemaRow key={field.key} field={field} />
        ))}
      </div>
      <p className="text-base md:text-lg text-gray-400 leading-relaxed">
        Only the payload for the chosen <span className="font-mono text-amber-200">action</span> is
        filled — other branches stay empty.
      </p>
    </div>
  );
}
