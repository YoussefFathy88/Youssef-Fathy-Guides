import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NodeFlowDiagram } from "@/components/shared";
import {
  getNodeFlowDiagramLabTarget,
  nodeFlowDiagramLabTargets,
} from "@/lib/node-flow-diagram-lab";

type DiagramLabPageProps = {
  params: Promise<{
    diagramId: string;
  }>;
};

export async function generateStaticParams() {
  return nodeFlowDiagramLabTargets.map((target) => ({
    diagramId: target.id,
  }));
}

export async function generateMetadata({ params }: DiagramLabPageProps): Promise<Metadata> {
  const { diagramId } = await params;
  const target = getNodeFlowDiagramLabTarget(diagramId);

  if (!target) {
    return {
      title: "Diagram Lab",
    };
  }

  return {
    title: {
      absolute: `${target.props.title} - Diagram Lab`,
    },
    description: `Verification surface for ${target.props.title}.`,
  };
}

export default async function DiagramLabPage({ params }: DiagramLabPageProps) {
  const { diagramId } = await params;
  const target = getNodeFlowDiagramLabTarget(diagramId);

  if (!target) {
    notFound();
  }

  const currentIndex = nodeFlowDiagramLabTargets.findIndex((entry) => entry.id === target.id);
  const previous = currentIndex > 0 ? nodeFlowDiagramLabTargets[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < nodeFlowDiagramLabTargets.length - 1
      ? nodeFlowDiagramLabTargets[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-[#060914] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-[1680px] space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300/80">
              Diagram Lab
            </p>
            <h1 className="max-w-5xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {target.props.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Session: /sessions/{target.sessionSlug}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Diagram: {target.id}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Viewport target: 1600x1100
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/diagram-lab"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              All diagrams
            </Link>
            <Link
              href={`/sessions/${target.sessionSlug}`}
              className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20"
            >
              Open session
            </Link>
            {previous ? (
              <Link
                href={`/diagram-lab/${previous.id}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Previous
              </Link>
            ) : null}
            {next ? (
              <Link
                href={`/diagram-lab/${next.id}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Next
              </Link>
            ) : null}
          </div>
        </header>

        <section className="rounded-[28px] border border-white/10 bg-[#0b1120]/70 p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
          <div className="mx-auto max-w-[1560px]">
            <NodeFlowDiagram {...target.props} viewport="presentation" density="comfortable" />
          </div>
        </section>
      </div>
    </main>
  );
}
