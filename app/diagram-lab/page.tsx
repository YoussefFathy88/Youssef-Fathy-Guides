import Link from "next/link";

import { nodeFlowDiagramLabTargets } from "@/lib/node-flow-diagram-lab";

export default function DiagramLabIndexPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#060914] px-6 py-10 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300/80">
            Diagram Lab
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 dark:text-white">
            NodeFlowDiagram verification surface
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">
            Use this page to inspect the shared diagram renderer without unrelated session content.
            Each target below renders a single diagram at a stable width, which makes screenshot
            review and layout tuning much more reliable.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {nodeFlowDiagramLabTargets.map((target) => (
            <Link
              key={target.id}
              href={`/diagram-lab/${target.id}`}
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 p-5 transition hover:border-blue-400/40 hover:bg-gray-900/[0.07] dark:hover:bg-white/[0.08]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
                {target.sessionTitle}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-gray-950 dark:text-white">{target.props.title}</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Session route: <span className="font-mono text-slate-700 dark:text-slate-300">/sessions/{target.sessionSlug}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Diagram id: <span className="font-mono text-slate-700 dark:text-slate-300">{target.id}</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
