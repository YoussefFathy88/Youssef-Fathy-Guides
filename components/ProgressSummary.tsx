"use client";

import { useProgress } from "@/data/progress";
import { getModuleById, getProgressSummary } from "@/lib/course";
import { hexToRgba } from "@/lib/utils";

export function ProgressSummary() {
  const { completed, reset } = useProgress();
  const summary = getProgressSummary(completed);
  const module = getModuleById(summary.currentModule);
  const progressPercent = (summary.currentModuleCompleted / summary.currentModuleTotal) * 100;

  return (
    <section className="surface-card p-6 sm:p-8">
      <div className="grid gap-5 lg:grid-cols-[0.7fr_0.3fr] lg:items-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-600 dark:text-slate-400">
            Your progress
          </p>
          <h2 className="text-3xl font-semibold text-gray-950 dark:text-white">
            {summary.completedCount} of {summary.totalCount} sessions complete
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            You are currently moving through Module {summary.currentModule}: {module?.title}.
          </p>
          <div className="mt-4 h-2 rounded-full bg-gray-900/[0.07] dark:bg-white/10">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: module?.color,
                boxShadow: `0 0 18px ${hexToRgba(module?.color ?? "#534AB7", 0.45)}`,
              }}
            />
          </div>
        </div>

        <div className="flex justify-start lg:justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-950 dark:text-white transition hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-900/[0.07] dark:hover:bg-white/10"
          >
            Reset progress
          </button>
        </div>
      </div>
    </section>
  );
}
