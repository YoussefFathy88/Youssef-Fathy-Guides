"use client";

import { useProgress } from "@/data/progress";
import type { CourseSession } from "@/lib/session-types";
import {
  getNextAvailableSession,
  getRequiredSessionToUnlock,
  getSessionRoute,
} from "@/lib/course";

import { ButtonLink } from "@/components/ui/button-link";
import { SectionShell } from "@/components/ui/section-shell";

type SessionProgressCtaProps = {
  session: CourseSession;
};

export function SessionProgressCta({ session }: SessionProgressCtaProps) {
  const { completed, markComplete } = useProgress();
  const isCompleted = completed.has(session.id);
  const nextSession = getNextAvailableSession(session.id, completed);
  const requiredSession = getRequiredSessionToUnlock(session);

  return (
    <SectionShell className="px-6 py-8 sm:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Next session</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            {nextSession ? `${nextSession.id} | ${nextSession.title}` : "Course checkpoint reached"}
          </h2>
          <p className="mt-3 max-w-3xl text-lg text-slate-300">
            Mark this session complete to persist your progress locally and keep your guided path in sync.
          </p>
          {requiredSession ? (
            <p className="mt-3 text-sm text-slate-400">
              Recommended first in the guided path: {requiredSession.id} | {requiredSession.title}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {!isCompleted ? (
            <button
              type="button"
              onClick={() => markComplete(session.id)}
              className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
            >
              Mark {session.id} complete
            </button>
          ) : null}
          {requiredSession ? (
            <ButtonLink href={getSessionRoute(requiredSession)} variant="secondary">
              Open {requiredSession.id}
            </ButtonLink>
          ) : null}
          {nextSession ? (
            <ButtonLink href={getSessionRoute(nextSession)}>
              Go to {nextSession.id}
            </ButtonLink>
          ) : (
            <ButtonLink href="/library">Open library</ButtonLink>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
