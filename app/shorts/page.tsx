import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";
import { SHORTS } from "@/data/shorts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Short Videos — AI & Software Engineering",
  description:
    "Bite-sized animated concept videos, each teaching one idea in under a minute. Two playlists: AI Concepts and Software Engineering.",
};

const TOPIC_COLORS: Record<string, string> = {
  violet:  "border-violet-500/30 bg-violet-500/15 text-violet-800 dark:text-violet-200",
  amber:   "border-amber-500/30  bg-amber-500/15  text-amber-800 dark:text-amber-200",
  teal:    "border-teal-500/30   bg-teal-500/15   text-teal-800 dark:text-teal-200",
  rose:    "border-rose-500/30   bg-rose-500/15   text-rose-800 dark:text-rose-200",
  blue:    "border-blue-500/30   bg-blue-500/15   text-blue-800 dark:text-blue-200",
  emerald: "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
};

const aiShorts = SHORTS.filter((s) => s.playlist === "ai");
const seShorts = SHORTS.filter((s) => s.playlist === "software-design" || s.playlist === "web-development");

function ShortsGrid({ shorts }: { shorts: typeof SHORTS }) {
  if (shorts.length === 0) {
    return <p className="text-slate-600 dark:text-slate-500">No shorts published yet.</p>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {shorts.map((short) => {
        const badgeCls =
          TOPIC_COLORS[short.topicColor] ?? TOPIC_COLORS["violet"];

        return (
          <Link
            key={short.slug}
            href={`/shorts/${short.slug}`}
            className="group block"
          >
            {/* Phone-shaped preview card */}
            <article className="overflow-hidden rounded-3xl bg-gradient-to-b from-white dark:from-slate-900 to-white dark:to-slate-950 ring-1 ring-gray-200 dark:ring-white/10 transition duration-200 group-hover:ring-gray-300 dark:group-hover:ring-white/25 group-hover:-translate-y-1 shadow-xl">
              {/* 9:16 thumbnail zone */}
              <div className="aspect-[9/16] relative flex flex-col items-center justify-center gap-5 p-6">
                {/* Decorative concentric rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <div className="h-48 w-48 rounded-full border border-gray-200 dark:border-white/5" />
                  <div className="absolute h-32 w-32 rounded-full border border-gray-200 dark:border-white/5" />
                </div>

                {/* Topic badge */}
                <span
                  className={cn(
                    "z-10 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
                    badgeCls,
                  )}
                >
                  {short.topic}
                </span>

                {/* Title */}
                <h3 className="z-10 text-center text-2xl font-bold leading-tight text-gray-950 dark:text-white">
                  {short.title}
                </h3>

                {/* Play button hint */}
                <div className="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-slate-900 translate-x-0.5"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>

                {/* Description */}
                <p className="z-10 text-center text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {short.description}
                </p>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}

export default function ShortsGalleryPage() {
  return (
    <main className="relative overflow-hidden min-h-screen">
      <GridBackground />

      <Container className="relative z-10 py-16 space-y-16">
        {/* ── Page header ─────────────────────────────────────────────────────── */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-950 dark:text-white sm:text-5xl">
            Short Videos
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-7">
            One concept, one animation, under a minute. Two playlists —{" "}
            <span className="text-violet-700 dark:text-violet-300 font-medium">AI Concepts</span>{" "}
            and{" "}
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              Software Engineering
            </span>
            .
          </p>
        </div>

        {/* ── AI Concepts playlist ─────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-800 dark:text-violet-200">
              🤖 AI Concepts
            </span>
            <div className="h-px flex-1 bg-gray-900/[0.07] dark:bg-white/10" />
          </div>
          <ShortsGrid shorts={aiShorts} />
        </section>

        {/* ── Software Engineering playlist ────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-800 dark:text-blue-200">
              🛠️ Software Engineering
            </span>
            <div className="h-px flex-1 bg-gray-900/[0.07] dark:bg-white/10" />
          </div>
          <ShortsGrid shorts={seShorts} />
        </section>
      </Container>
    </main>
  );
}
