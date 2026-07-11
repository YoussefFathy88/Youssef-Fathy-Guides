import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShortsRecordingView } from "@/components/shorts/ShortsRecordingView";
import { LLMWorksShort } from "@/components/shorts/LLMWorksShort";
import { TokenizerShort } from "@/components/shorts/TokenizerShort";
import { EmbeddingShort } from "@/components/shorts/EmbeddingShort";
import { AIActionsShort } from "@/components/shorts/AIActionsShort";
import { AgentSkillsShort } from "@/components/shorts/AgentSkillsShort";
import { AIModelsShort } from "@/components/shorts/AIModelsShort";
import { AuthenticationShort } from "@/components/shorts/AuthenticationShort";
import { SOLIDShort } from "@/components/shorts/SOLIDShort";
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
    case "how-embeddings-work":
      return <EmbeddingShort />;
    case "how-claude-code-works":
      return <AIActionsShort />;
    case "how-agent-skills-work":
      return <AgentSkillsShort />;
    case "what-are-ai-models":
      return <AIModelsShort />;
    // ── Software Engineering ──────────────────────────────────────────────
    case "how-auth-works":
      return <AuthenticationShort />;
    case "solid-principles":
      return <SOLIDShort />;
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

      <ShortsRecordingView topic={short.topic} title={short.title} description={short.description}>
        <ShortContent slug={slug} />
      </ShortsRecordingView>
    </main>
  );
}
