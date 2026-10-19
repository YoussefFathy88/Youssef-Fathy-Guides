"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

export type RagLabArchitectureSection = "frontend" | "backend" | "nfr";

export interface RagLabSystemArchitectureProps {
  /** Shown above the three layer selectors. */
  title?: string;
  /** Which layer is expanded first (click another to switch). */
  initialSection?: RagLabArchitectureSection;
  className?: string;
}

function Chevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={cn(
        "h-6 w-6 shrink-0 text-slate-600 dark:text-slate-400 transition-transform duration-200 md:h-7 md:w-7",
        open && "rotate-180",
        className,
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type TitleAccent = "slate" | "sky" | "emerald" | "amber" | "violet";

function TitleCard({ title, accent }: { title: string; accent: TitleAccent }) {
  const accents: Record<TitleAccent, string> = {
    slate: "border-slate-500/45 bg-gray-50/85 dark:bg-slate-900/85 ring-slate-500/15",
    sky: "border-sky-500/45 bg-sky-950/35 ring-sky-500/15",
    emerald: "border-emerald-500/45 bg-emerald-950/30 ring-emerald-500/15",
    amber: "border-amber-500/45 bg-amber-950/25 ring-amber-500/15",
    violet: "border-violet-500/45 bg-violet-950/30 ring-violet-500/15",
  };

  return (
    <div
      className={cn(
        "flex min-h-[5.5rem] items-center justify-center rounded-2xl border-2 px-4 py-6 shadow-lg ring-1 md:min-h-[6.5rem] md:px-6 md:py-8",
        accents[accent],
      )}
    >
      <h4 className="text-center text-lg font-bold tracking-tight text-gray-950 dark:text-white md:text-2xl">{title}</h4>
    </div>
  );
}

const SECTIONS: {
  id: RagLabArchitectureSection;
  label: string;
  hint: string;
}[] = [
  { id: "frontend", label: "Frontend", hint: "Next.js & Tailwind CSS" },
  { id: "backend", label: "Backend", hint: "FastAPI · RAG · models" },
  { id: "nfr", label: "Non-functional requirements", hint: "Docker · reload · .env" },
];

export function RagLabSystemArchitecture({
  title = "Lab stack — reference architecture",
  initialSection = "frontend",
  className,
}: RagLabSystemArchitectureProps) {
  const baseId = useId();
  const [active, setActive] = useState<RagLabArchitectureSection>(initialSection);
  const panelId = `${baseId}-panel`;

  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gray-300/90 dark:border-slate-600/90 bg-white dark:bg-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative">
        <figcaption className="border-b border-gray-200 dark:border-slate-800 bg-gray-50/90 dark:bg-slate-900/90 px-4 py-4 md:px-6 md:py-5">
          <p className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100 md:text-lg">{title}</p>
        </figcaption>

        <div
          className="grid gap-3 border-b border-gray-200 dark:border-slate-800 p-4 md:grid-cols-3 md:gap-4 md:p-5"
          role="tablist"
          aria-label="Architecture layers"
        >
          {SECTIONS.map((section) => {
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                id={`${baseId}-tab-${section.id}`}
                onClick={() => setActive(section.id)}
                className={cn(
                  "flex min-h-[100px] flex-col items-start justify-between gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-colors md:min-h-[120px] md:px-5 md:py-5",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400",
                  isActive
                    ? "border-sky-500/70 bg-sky-950/40 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
                    : "border-gray-300 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-900",
                )}
              >
                <div>
                  <span className="block text-lg font-bold text-gray-950 dark:text-white md:text-xl">{section.label}</span>
                  <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400 md:text-base">{section.hint}</span>
                </div>
                <Chevron open={isActive} className={isActive ? "text-sky-700 dark:text-sky-300" : undefined} />
              </button>
            );
          })}
        </div>

        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          className="p-4 pb-6 md:p-6 md:pb-8"
        >
          {active === "frontend" ? (
            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              <TitleCard title="Next.js" accent="sky" />
              <TitleCard title="Tailwind CSS" accent="slate" />
            </div>
          ) : null}

          {active === "backend" ? (
            <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
              <TitleCard title="FastAPI" accent="emerald" />
              <TitleCard title="LangChain" accent="amber" />
              <TitleCard title="POST /index" accent="emerald" />
              <TitleCard title="POST /chat" accent="emerald" />
              <TitleCard title="Chroma" accent="violet" />
              <TitleCard title="OpenAI" accent="sky" />
            </div>
          ) : null}

          {active === "nfr" ? (
            <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
              <TitleCard title="Docker · docker-compose" accent="emerald" />
              <TitleCard title="Hot reload · Next.js" accent="amber" />
              <TitleCard title="Hot reload · FastAPI" accent="amber" />
              <TitleCard title=".env — secrets" accent="slate" />
            </div>
          ) : null}
        </div>
      </div>
    </figure>
  );
}

export default RagLabSystemArchitecture;
