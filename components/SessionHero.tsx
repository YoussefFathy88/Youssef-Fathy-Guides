"use client";

import type { Route } from "next";

import { ButtonLink } from "@/components/ui/button-link";
import { useProgress } from "@/data/progress";
import type { CourseSession } from "@/lib/session-types";
import {
  getModuleById,
  getNextAvailableSession,
  getRequiredSessionToUnlock,
  getSessionById,
  getSessionRoute,
} from "@/lib/course";
import { hexToRgba } from "@/lib/utils";

type SessionHeroProps = {
  session: CourseSession;
};

export function SessionHero({ session }: SessionHeroProps) {
  const { completed, markComplete } = useProgress();
  const module = getModuleById(session.module);
  const previous = session.dependsOn.at(-1) ? getSessionById(session.dependsOn.at(-1) ?? "") : undefined;
  const next = session.leadsTo[0] ? getSessionById(session.leadsTo[0]) : undefined;
  const nextAvailable = getNextAvailableSession(session.id, completed);
  const isCompleted = completed.has(session.id);
  const requiredSession = getRequiredSessionToUnlock(session);

  return (
    <section className="surface-card overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[13px] uppercase tracking-[0.28em] text-slate-600 dark:text-slate-400">
            Previously on the series
          </p>
          <blockquote
            className="border-l-2 pl-4 text-[13px] italic leading-6 text-slate-700 dark:text-slate-300"
            style={{ borderColor: module?.color }}
          >
            {session.prevRecap}
          </blockquote>
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em]" style={{ color: module?.color }}>
            {session.id} | Module {session.module}: {module?.title}
          </p>
          <h1 className="max-w-5xl text-balance text-4xl font-semibold sm:text-5xl lg:text-6xl">
            {session.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 px-3 py-1 text-slate-700 dark:text-slate-300">
            {previous?.title ?? "Course entry point"}
          </span>
          <span className="text-slate-600 dark:text-slate-500">-&gt;</span>
          <span
            className="rounded-full border px-3 py-1 font-medium text-gray-950 dark:text-white"
            style={{
              borderColor: hexToRgba(module?.color ?? "#534AB7", 0.35),
              backgroundColor: module?.color,
            }}
          >
            Current session: {session.title}
          </span>
          <span className="text-slate-600 dark:text-slate-500">-&gt;</span>
          <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 px-3 py-1 text-slate-700 dark:text-slate-300">
            {next?.title ?? "End of current thread"}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#player">Start Session</ButtonLink>
          <ButtonLink href={"/#ai-agent-story" as Route} variant="secondary">
            Back to robot
          </ButtonLink>
          {requiredSession ? (
            <ButtonLink href={getSessionRoute(requiredSession)} variant="secondary">
              Recommended first: {requiredSession.id}
            </ButtonLink>
          ) : null}
          {!isCompleted ? (
            <button
              type="button"
              onClick={() => markComplete(session.id)}
              className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-5 py-3 text-sm font-semibold text-emerald-800 dark:text-emerald-100 transition hover:bg-emerald-500/20"
            >
              Mark complete
            </button>
          ) : nextAvailable ? (
            <ButtonLink href={getSessionRoute(nextAvailable)} variant="secondary">
              Continue to {nextAvailable.id}
            </ButtonLink>
          ) : null}
        </div>

        {requiredSession ? (
          <div className="surface-panel p-4 text-sm text-slate-700 dark:text-slate-300">
            You can open this session anytime. For the guided path, it is best taken after {requiredSession.id} - {requiredSession.title}.
          </div>
        ) : null}
      </div>
    </section>
  );
}
