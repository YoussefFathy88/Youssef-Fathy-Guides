import type { ConceptCard } from "@/lib/session-types";
import { getAccentClasses } from "@/lib/utils";

type ConceptBlockProps = {
  concept: ConceptCard;
};

export function ConceptBlock({ concept }: ConceptBlockProps) {
  const accent = getAccentClasses(concept.accent);

  return (
    <article className={`surface-card overflow-hidden p-5 sm:p-6 ${accent.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${accent.badge}`}>
            {concept.category}
          </span>
          <h3 className="mt-4 text-2xl font-semibold text-white">{concept.title}</h3>
        </div>
        <span className={`mt-1 h-3 w-3 rounded-full ${accent.dot}`} />
      </div>

      <p className="mt-4 text-base text-slate-300">{concept.description}</p>

      <div className={`surface-panel mt-6 p-4 ${accent.border}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white">{concept.placeholderTitle}</p>
          <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Story layer
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {concept.placeholderItems.map((item) => (
            <span
              key={item}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs ${accent.badge}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
          Takeaway
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-200">{concept.takeaway}</p>
    </article>
  );
}
