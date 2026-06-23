import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ShortsShell } from "@/components/shorts/ShortsShell";
import { LLMWorksShort } from "@/components/shorts/LLMWorksShort";
import { TokenizerShort } from "@/components/shorts/TokenizerShort";
import { LLMTrainingShort } from "@/components/shorts/LLMTrainingShort";
import { ContextWindowShort } from "@/components/shorts/ContextWindowShort";
import { EmbeddingShort } from "@/components/shorts/EmbeddingShort";
import { RAGShort } from "@/components/shorts/RAGShort";
import { AIActionsShort } from "@/components/shorts/AIActionsShort";
import { GridBackground } from "@/components/ui/grid-background";
import { SHORTS } from "@/data/shorts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SHORTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const short = SHORTS.find((s) => s.slug === slug);
  if (!short) return {};
  return {
    title: `${short.title} — Short`,
    description: short.description,
  };
}

/** Switch: map slug → the matching Short component */
function ShortContent({ slug }: { slug: string }) {
  switch (slug) {
    case "how-llms-work":
      return <LLMWorksShort />;
    case "how-tokens-work":
      return <TokenizerShort />;
    case "how-llms-are-trained":
      return <LLMTrainingShort />;
    case "context-window":
      return <ContextWindowShort />;
    case "how-embeddings-work":
      return <EmbeddingShort />;
    case "how-rag-works":
      return <RAGShort />;
    case "how-ai-takes-actions":
      return <AIActionsShort />;
    default:
      return null;
  }
}

export default async function ShortsViewerPage({ params }: Props) {
  const { slug } = await params;
  const short = SHORTS.find((s) => s.slug === slug);

  if (!short) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <GridBackground />

      {/* Full-page dark centering backdrop */}
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 px-4 py-10">
        {/* Back link */}
        <div className="w-full max-w-[390px]">
          <Link
            href="/shorts"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Shorts
          </Link>
        </div>

        {/* The Short — full 9:16 phone frame */}
        <ShortsShell>
          <ShortContent slug={slug} />
        </ShortsShell>

        {/* Metadata below the phone */}
        <div className="w-full max-w-[390px] space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {short.topic}
          </p>
          <h1 className="text-xl font-bold text-white">{short.title}</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {short.description}
          </p>
        </div>
      </div>
    </main>
  );
}
