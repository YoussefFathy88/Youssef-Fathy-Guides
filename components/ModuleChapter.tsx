"use client";

import type { CourseModule, CourseSession } from "@/lib/session-types";
import { useProgress } from "@/data/progress";
import {
  getCurrentSessionId,
  getRequiredSessionToUnlock,
  getSessionState,
} from "@/lib/course";
import { hexToRgba } from "@/lib/utils";

import { SessionCard } from "@/components/SessionCard";

type ModuleChapterProps = {
  module: CourseModule;
  sessions: CourseSession[];
};

export function ModuleChapter({ module, sessions }: ModuleChapterProps) {
  const { completed } = useProgress();
  const currentSessionId = getCurrentSessionId(completed);
  const completedInModule = sessions.filter((session) => completed.has(session.id)).length;

  return (
    <section className="space-y-6">
      <div
        className="surface-card overflow-hidden p-6 sm:p-8"
        style={{
          borderColor: hexToRgba(module.color, 0.26),
          background: `linear-gradient(135deg, ${hexToRgba(module.color, 0.18)}, var(--surface) 42%, var(--surface-strong))`,
        }}
      >
        <div className="grid gap-4 lg:grid-cols-[0.8fr_0.2fr] lg:items-end">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em]" style={{ color: module.color }}>
              Chapter {module.id}
            </p>
            <h2 className="text-4xl font-semibold text-gray-950 dark:text-white">
              {module.title}
            </h2>
            <p className="max-w-3xl text-lg text-slate-900 dark:text-slate-200">{module.tagline}</p>
          </div>

          <div className="surface-panel p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Module progress</p>
            <p className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">
              {completedInModule}/{sessions.length}
            </p>
            <div className="mt-4 h-2 rounded-full bg-gray-900/[0.07] dark:bg-white/10">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(completedInModule / sessions.length) * 100}%`,
                  backgroundColor: module.color,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {sessions.map((session) => {
          const state = getSessionState(session, completed, currentSessionId);
          const required = getRequiredSessionToUnlock(session);

          return (
            <SessionCard
              key={session.id}
              session={session}
              state={state}
              unlockHint={required ? `${required.id} ${required.title}` : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
