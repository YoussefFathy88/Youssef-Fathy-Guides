"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AnatomySection } from "@/components/AnatomySection";
import CourseLabSection from "@/components/CourseLabSection";
import { SessionBadge } from "@/components/ui/session-badge";
import { SHORTS } from "@/data/shorts";

const COURSE_CARDS = [
  {
    id: "ai-agent-story",
    title: "AI Agent Story",
    badge: "Available now",
    description:
      "Learn agents from the model internals outward: tokens, embeddings, tools, memory, agency, and production systems.",
    meta: "Robot explorer",
    status: "available",
  },
  {
    id: "ai-engineering-lab",
    title: "AI Engineering Lab",
    badge: "Available now",
    description:
      "Project-based sessions for building, testing, and shipping applied AI systems.",
    meta: "Project lab",
    status: "available",
  },
  {
    id: "efficient-coding-with-ai",
    title: "Efficient Coding with AI",
    badge: "Available now",
    description:
      "A practical playlist on choosing models, planning, and building AI-assisted software with discipline.",
    meta: "Tool playlist",
    status: "available",
  },
] as const;

type CourseId = (typeof COURSE_CARDS)[number]["id"];

export function HomeCourseGateway() {
  const [openCourseId, setOpenCourseId] = useState<CourseId | null>(null);

  useEffect(() => {
    if (window.location.hash === "#ai-agent-story") {
      setOpenCourseId("ai-agent-story");
    }

    if (window.location.hash === "#ai-engineering-lab") {
      setOpenCourseId("ai-engineering-lab");
    }

    if (window.location.hash === "#efficient-coding-with-ai") {
      setOpenCourseId("efficient-coding-with-ai");
    }
  }, []);

  useEffect(() => {
    if (!openCourseId) return;

    document.getElementById(openCourseId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [openCourseId]);

  return (
    <>
      <section className="surface-card overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="space-y-8">
          <div className="max-w-4xl space-y-5">
            <SessionBadge tone="purple">The Software Story</SessionBadge>
            <div className="space-y-4">
              <h1 className="max-w-5xl text-balance text-4xl font-semibold sm:text-5xl lg:text-6xl">
                Available materials and courses.
              </h1>
              <p className="max-w-3xl text-lg text-slate-300 sm:text-xl">
                Choose a course to open its learning experience. Sessions are accessed
                through the course interface, not a separate session list.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {COURSE_CARDS.map((course) => {
              const isAvailable = course.status === "available";
              const isOpen = openCourseId === course.id;

              return (
                <article
                  key={course.id}
                  className="surface-panel flex min-h-72 flex-col justify-between p-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-400">{course.meta}</span>
                      <span
                        className={
                          isAvailable
                            ? "rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200"
                            : "rounded-full border border-amber-400/20 bg-amber-500/12 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-200"
                        }
                      >
                        {course.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-3xl font-semibold text-white">{course.title}</h2>
                      <p className="mt-3 text-base leading-7 text-slate-300">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => setOpenCourseId(course.id)}
                      className="mt-8 inline-flex w-fit items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/15 px-5 py-3 text-sm font-semibold text-sky-50 shadow-[0_20px_45px_-24px_rgba(96,165,250,0.75)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/35 hover:bg-sky-500/22"
                    >
                      {isOpen ? `${course.title} is open` : `Open ${course.title}`}
                    </button>
                  ) : (
                    <div className="mt-8 inline-flex w-fit cursor-not-allowed items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-400">
                      Coming soon
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {openCourseId ? (
            <div className="rounded-3xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-sky-100">
              {openCourseId === "ai-agent-story"
                ? "AI Agent Story is open. Use the robot below to choose a body part and enter the available sessions."
                : openCourseId === "ai-engineering-lab"
                  ? "AI Engineering Lab is open. Browse the project sessions below."
                  : "Efficient Coding with AI is open. Browse the playlist sessions below."}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Shorts section ──────────────────────────────────────────────────── */}
      <section className="surface-card overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Copy */}
          <div className="max-w-xl space-y-4">
            <SessionBadge tone="purple">AI Concepts</SessionBadge>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white">Short Videos</h2>
              <p className="text-base leading-7 text-slate-300">
                Bite-sized animated AI concept videos — one idea per short,
                designed for phone. Each Short walks through a concept with
                step-by-step animations.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {SHORTS.map((s) => (
                <span
                  key={s.slug}
                  className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300"
                >
                  {s.topic}
                </span>
              ))}
            </div>
          </div>

          {/* Phone preview + CTA */}
          <div className="flex flex-col items-start gap-5 lg:items-end">
            {/* Tiny phone-frame thumbnail */}
            <div className="relative h-28 w-16 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 ring-1 ring-white/10 shadow-xl">
              {/* decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-16 w-16 rounded-full border border-white/8" />
                <div className="absolute h-10 w-10 rounded-full border border-white/8" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <div className="h-1 w-8 rounded-full bg-white/20" />
                <div className="h-1 w-6 rounded-full bg-violet-400/60" />
                <div className="h-3 w-3 rounded-full bg-white/70" />
              </div>
            </div>

            <Link
              href="/shorts"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/15 px-5 py-3 text-sm font-semibold text-violet-50 shadow-[0_20px_45px_-24px_rgba(139,92,246,0.7)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-violet-500/22"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="translate-x-0.5"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Browse Shorts
            </Link>
          </div>
        </div>
      </section>

      {openCourseId === "ai-agent-story" ? (
        <div id="ai-agent-story" className="scroll-mt-24">
          <AnatomySection />
        </div>
      ) : null}

      {openCourseId === "ai-engineering-lab" ? (
        <div id="ai-engineering-lab" className="scroll-mt-24">
          <CourseLabSection playlistId="ai-engineering-lab" />
        </div>
      ) : null}

      {openCourseId === "efficient-coding-with-ai" ? (
        <div id="efficient-coding-with-ai" className="scroll-mt-24">
          <CourseLabSection playlistId="efficient-coding-with-ai" />
        </div>
      ) : null}
    </>
  );
}
