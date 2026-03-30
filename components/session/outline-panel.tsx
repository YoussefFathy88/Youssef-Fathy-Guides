import type { OutlineItem } from "@/lib/session-types";
import { getAccentClasses } from "@/lib/utils";

type OutlinePanelProps = {
  items: OutlineItem[];
};

export function OutlinePanel({ items }: OutlinePanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const accent = getAccentClasses(item.accent);

        return (
          <article
            key={item.title}
            className={`surface-panel p-5 transition duration-300 hover:-translate-y-1 ${accent.border}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${accent.badge}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {item.label}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{item.description}</p>
          </article>
        );
      })}
    </div>
  );
}
