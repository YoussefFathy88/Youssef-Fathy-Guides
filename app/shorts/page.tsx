import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";
import { SHORTS } from "@/data/shorts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Concepts — Short Videos",
  description:
    "Bite-sized animated AI concept videos, each teaching one idea in under a minute.",
};

const TOPIC_COLORS: Record<string, string> = {
  violet:  "border-violet-500/30 bg-violet-500/15 text-violet-200",
  amber:   "border-amber-500/30  bg-amber-500/15  text-amber-200",
  teal:    "border-teal-500/30   bg-teal-500/15   text-teal-200",
  rose:    "border-rose-500/30   bg-rose-500/15   text-rose-200",
  blue:    "border-blue-500/30   bg-blue-500/15   text-blue-200",
  emerald: "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
};

export default function ShortsGalleryPage() {
  return (
    <main className="relative overflow-hidden min-h-screen">
      <GridBackground />

      <Container className="relative z-10 py-16 space-y-12">
        {/* ── Page header ───────────────────────────────────────────────────── */}
        <div className="space-y-4 max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-200">
            AI Concepts
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Short Videos
          </h1>
          <p className="text-lg text-slate-300 leading-7">
            One AI concept, one animation, under a minute. Designed for{" "}
            <span className="text-white font-medium">YouTube Shorts</span> and
            phone viewing.
          </p>
        </div>

        {/* ── Shorts grid ───────────────────────────────────────────────────── */}
        {SHORTS.length === 0 ? (
          <p className="text-slate-500">No shorts published yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SHORTS.map((short) => {
              const badgeCls =
                TOPIC_COLORS[short.topicColor] ?? TOPIC_COLORS["violet"];

              return (
                <Link
                  key={short.slug}
                  href={`/shorts/${short.slug}`}
                  className="group block"
                >
                  {/* Phone-shaped preview card */}
                  <article className="overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 ring-1 ring-white/10 transition duration-200 group-hover:ring-white/25 group-hover:-translate-y-1 shadow-xl">
                    {/* 9:16 thumbnail zone */}
                    <div className="aspect-[9/16] relative flex flex-col items-center justify-center gap-5 p-6">
                      {/* Decorative concentric rings */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <div className="h-48 w-48 rounded-full border border-white/5" />
                        <div className="absolute h-32 w-32 rounded-full border border-white/5" />
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
                      <h2 className="z-10 text-center text-2xl font-bold leading-tight text-white">
                        {short.title}
                      </h2>

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
                      <p className="z-10 text-center text-sm text-slate-400 leading-relaxed">
                        {short.description}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
