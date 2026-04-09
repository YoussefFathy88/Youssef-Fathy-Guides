"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { Container } from "@/components/ui/container";

import { GALLERY_ITEMS } from "./gallery-demos";

export default function ComponentGalleryPage() {
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const expandedTitleId = useId();

  const closeExpanded = useCallback(() => setExpandedName(null), []);

  useEffect(() => {
    if (!expandedName) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expandedName]);

  useEffect(() => {
    if (!expandedName) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeExpanded();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedName, closeExpanded]);

  const expandedItem = expandedName
    ? GALLERY_ITEMS.find((i) => i.name === expandedName)
    : undefined;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
      <Container className="space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-violet-400">
            Internal — Session MDX registry
          </p>
          <h1 className="text-4xl font-semibold text-white">Session component gallery</h1>
          <p className="max-w-3xl text-slate-300">
            Every custom component from <span className="font-mono text-violet-300">getMdxComponents</span>,
            shown in a grid with the same name you use in MDX. Use this to compare visuals and pick
            interactives for future sessions.{" "}
            <span className="text-slate-400">
              Use <strong className="font-medium text-slate-300">Open full size</strong> (or the preview
              bar) to view at session width without the grid crop.
            </span>
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {GALLERY_ITEMS.map((item) => (
            <article
              key={item.name}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 shadow-lg shadow-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 bg-gray-950/50 px-4 py-3">
                <div className="min-w-0">
                  <h2 className="font-mono text-sm font-semibold tracking-tight text-violet-300">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">Grid preview is condensed</p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedName(item.name)}
                  className="shrink-0 rounded-lg border border-violet-500/40 bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-200 transition-colors hover:bg-violet-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Open full size
                </button>
              </div>
              <button
                type="button"
                onClick={() => setExpandedName(item.name)}
                className="w-full border-b border-white/10 bg-gray-900/80 px-4 py-2 text-center text-xs font-medium text-violet-300/90 transition-colors hover:bg-violet-500/10 hover:text-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
              >
                Full-page preview — session width, no crop
              </button>
              <div className="max-h-[min(70vh,560px)] min-h-0 overflow-y-auto overflow-x-hidden p-4">
                {item.node}
              </div>
            </article>
          ))}
        </div>
      </Container>

      {expandedItem ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-gray-950/97 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={expandedTitleId}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-gray-950 px-4 py-3 sm:px-6">
            <h2 id={expandedTitleId} className="font-mono text-base font-semibold text-violet-300">
              {expandedItem.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="hidden sm:inline">Esc to close</span>
              <button
                type="button"
                onClick={closeExpanded}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-gray-100 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Close
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <Container className="py-8 pb-16 sm:py-10">
              <article className="w-full max-w-none rounded-[28px] border border-gray-200/80 bg-white/85 px-7 py-9 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/60 sm:px-10 sm:py-11 lg:px-12">
                <div className="w-full min-w-0">{expandedItem.node}</div>
              </article>
            </Container>
          </div>
        </div>
      ) : null}
    </main>
  );
}
