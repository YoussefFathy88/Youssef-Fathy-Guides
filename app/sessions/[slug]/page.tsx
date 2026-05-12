import type { ComponentPropsWithoutRef } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

import {
  LabSessionOverview,
  NextSessionCard,
  PresentationShell,
  RagLabPromptExplorer,
  RagLabSystemArchitecture,
  RecapTable,
  SessionProgressNav,
  SessionSection,
} from "@/components/session";
import {
  AgentLoopStepper,
  AlgorithmStepper,
  AnnotatedCode,
  ApiLifecycleFlow,
  BTreeExplorer,
  ConsensusSimulator,
  MemoryLayoutExplorer,
  MessageQueueSim,
  MutexRaceDetector,
  OAuthFlowStepper,
  PacketJourneyVisualizer,
  ProcessSchedulerViz,
  RateLimiterVisualizer,
  TransactionIsolationSim,
  AttentionHeatmap,
  AutoregressiveDemo,
  CallStackVisualizer,
  ChatReplay,
  ChunkVisualizer,
  CodeEvolutionStepper,
  ConceptCompare,
  ConceptStepper,
  CompactCommandSimulator,
  ContextLimitSimulator,
  ContextWindowFiller,
  DataFlowDiagram,
  DualPhaseFlow,
  EmbeddingSearchSimulator,
  GradientDescentSimulator,
  InferenceWalkthrough,
  LayerStack,
  LiveTokenizer,
  MemoryOrchestrator,
  MiniPlayground,
  NeuralNetworkForwardPass,
  NodeFlowDiagram,
  DualLanePipelineDiagram,
  ParameterSlider,
  ParallelToolRunner,
  PipelineTrack,
  PromptAnatomyVisualizer,
  StepSequence,
  TabbedCodeExplorer,
  ThinkingModeSimulator,
  TokenProbDist,
  TransformerLogitsExplainer,
  TrainingLoopSimulator,
  Vector2DPlot,
  HiddenStateDecayDiagram,
  RNNUnrolledOverview,
  RNNWorkingExample,
  RNNFailureDemo,
  SelfAttentionScoreExplorer,
  TransformerPipelineWalkthrough,
  PositionalEncodingVisualizer,
  TransformerSentenceTokenStrip,
  EmbeddingVectorsTable,
  TransformerSubstackExplorer,
  ModelBehaviorEvolution,
  LinearMappingGraph,
  EmbeddingVectorExplorer,
  CosineSimilarityExplorer,
  SearchQuerySimulator,
  MaskedAttentionSimulator,
  BytePairEncodingExplorer,
  ArchitectureEvolutionAnimator,
  CNNImageSuccessDemo,
  NNEquationDemo,
  RNNCellUnrolledDiagram,
  MacroPipeline,
  VectorAnatomyExplorer,
} from "@/components/shared";
import FNNAutocompleteDemo from "@/components/demos/FNNAutocompleteDemo";
import ArchitectureComparisonDemo from "@/components/demos/ArchitectureComparisonDemo";
import RNNAutocompleteDemo from "@/components/demos/RNNAutocompleteDemo";
import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";
import { cn } from "@/lib/utils";
import { getAllSessions, getSession } from "@/lib/sessions";

type SessionRouteParams = Promise<{
  slug: string;
}>;

type SessionSearchParams = Promise<{
  view?: string | string[] | undefined;
}>;

type SessionMetadataProps = {
  params: SessionRouteParams;
};

type SessionPageProps = {
  params: SessionRouteParams;
  searchParams: SessionSearchParams;
};

const sessionSections = [
  { id: "goal", label: "Goal" },
  { id: "big-picture", label: "Big Picture" },
  { id: "core-concepts", label: "Core Concepts" },
  { id: "practical-example", label: "Practical Example" },
  { id: "recap", label: "Recap" },
  { id: "next-session", label: "Next Session" },
] as const;

type SessionSection = { id: string; label: string };

// Per-slug section overrides for sessions that extend the standard six-section layout.
const sessionSectionOverrides: Record<string, SessionSection[]> = {
  "introduction-to-rag-lab": [
    { id: "goal", label: "Goal" },
    { id: "big-picture", label: "Big Picture" },
    { id: "practical-example", label: "Practical Example" },
    { id: "next-session", label: "Next Session" },
  ],
  "how-llms-work": [
    { id: "goal", label: "Goal" },
    { id: "what-is-a-mapping", label: "What is a Mapping?" },
    { id: "model-as-mapping", label: "AI as Mapping" },
    { id: "big-picture", label: "Big Picture" },
    { id: "core-concepts", label: "Core Concepts" },
    { id: "practical-example", label: "Practical Example" },
    { id: "recap", label: "Recap" },
    { id: "next-session", label: "Next Session" },
  ],
};

function getMdxComponents(isPresentationMode: boolean) {
  return {
    SessionSection,
    LabSessionOverview,
    RagLabPromptExplorer,
    RagLabSystemArchitecture,
    RecapTable,
    NextSessionCard,
    AgentLoopStepper,
    NodeFlowDiagram,
    DualLanePipelineDiagram,
    ParameterSlider,
    AttentionHeatmap,
    ConceptStepper,
    CompactCommandSimulator,
    ContextLimitSimulator,
    ContextWindowFiller,
    DataFlowDiagram,
    DualPhaseFlow,
    EmbeddingSearchSimulator,
    ConceptCompare,
    MiniPlayground,
    Vector2DPlot,
    TokenProbDist,
    PipelineTrack,
    StepSequence,
    LayerStack,
    AnnotatedCode,
    MacroPipeline,
    VectorAnatomyExplorer,
    // New interactive components
    TrainingLoopSimulator,
    AutoregressiveDemo,
    TransformerLogitsExplainer,
    InferenceWalkthrough,
    LiveTokenizer,
    ThinkingModeSimulator,
    ChatReplay,
    MemoryOrchestrator,
    ChunkVisualizer,
    ParallelToolRunner,
    // OS / Networking / Distributed-systems components
    PacketJourneyVisualizer,
    ConsensusSimulator,
    ProcessSchedulerViz,
    MemoryLayoutExplorer,
    MutexRaceDetector,
    // Data structures, databases, auth, distributed systems
  BTreeExplorer,
  TransactionIsolationSim,
  OAuthFlowStepper,
  MessageQueueSim,
  RateLimiterVisualizer,
  // Transformer session components
  HiddenStateDecayDiagram,
  RNNUnrolledOverview,
  RNNWorkingExample,
  RNNFailureDemo,
  FNNAutocompleteDemo,
  ArchitectureComparisonDemo,
  RNNAutocompleteDemo,
  SelfAttentionScoreExplorer,
  MaskedAttentionSimulator,
  TransformerPipelineWalkthrough,
  PositionalEncodingVisualizer,
  TransformerSentenceTokenStrip,
  EmbeddingVectorsTable,
  TransformerSubstackExplorer,
  // Training pipeline components
  ModelBehaviorEvolution,
  // Foundational concept components
  LinearMappingGraph,
  // Embedding session components
  EmbeddingVectorExplorer,
  CosineSimilarityExplorer,
  SearchQuerySimulator,
  // Tokenization session components
  BytePairEncodingExplorer,
  // Architecture evolution (why-transformer)
  ArchitectureEvolutionAnimator,
  CNNImageSuccessDemo,
  NNEquationDemo,
  RNNCellUnrolledDiagram,
  // Diagram & code navigation components
  AlgorithmStepper,
    CallStackVisualizer,
    NeuralNetworkForwardPass,
    GradientDescentSimulator,
    PromptAnatomyVisualizer,
    ApiLifecycleFlow,
    TabbedCodeExplorer,
    CodeEvolutionStepper,
    h2: ({ className, ...props }: ComponentPropsWithoutRef<"h2">) => (
      <h2
        {...props}
        data-session-slide-marker="h2"
        className={[
          isPresentationMode
            ? "mb-0 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl"
            : "mb-10 text-balance text-[2.4rem] font-semibold leading-tight tracking-tight text-gray-950 dark:text-gray-50 sm:mb-14 sm:text-5xl",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    h3: ({ className, ...props }: ComponentPropsWithoutRef<"h3">) => (
      <h3
        {...props}
        className={[
          isPresentationMode
            ? "mt-8 mb-3 text-2xl font-semibold text-gray-100 sm:mb-4 sm:text-3xl"
            : "mt-10 mb-2 text-[1.8rem] font-semibold leading-tight text-gray-950 dark:text-gray-100 sm:mb-3 sm:text-[2rem]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    p: ({ className, ...props }: ComponentPropsWithoutRef<"p">) => (
      <p
        {...props}
        className={[
          isPresentationMode
            ? "mt-5 text-lg leading-9 text-gray-200 sm:text-xl sm:leading-10"
            : "mt-5 text-[1.14rem] leading-9 text-gray-700 dark:text-gray-300 sm:text-[1.22rem] sm:leading-10",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    a: ({ className, ...props }: ComponentPropsWithoutRef<"a">) => (
      <a
        {...props}
        className={[
          isPresentationMode
            ? "font-medium text-violet-300 underline decoration-violet-500/60 underline-offset-4 hover:text-violet-200"
            : "font-medium text-violet-600 underline decoration-violet-300 underline-offset-4 hover:text-violet-700 dark:text-violet-400 dark:decoration-violet-700 dark:hover:text-violet-300",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    ul: ({ className, ...props }: ComponentPropsWithoutRef<"ul">) => (
      <ul
        {...props}
        className={[
          isPresentationMode
            ? "mt-5 list-disc space-y-3 pl-6 text-lg leading-8 text-gray-200 sm:text-xl sm:leading-9"
            : "mt-5 list-disc space-y-3 pl-7 text-[1.12rem] leading-9 text-gray-700 dark:text-gray-300 sm:text-[1.2rem] sm:leading-10",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    ol: ({ className, ...props }: ComponentPropsWithoutRef<"ol">) => (
      <ol
        {...props}
        className={[
          isPresentationMode
            ? "mt-5 list-decimal space-y-3 pl-6 text-lg leading-8 text-gray-200 sm:text-xl sm:leading-9"
            : "mt-5 list-decimal space-y-3 pl-7 text-[1.12rem] leading-9 text-gray-700 dark:text-gray-300 sm:text-[1.2rem] sm:leading-10",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    li: ({ className, ...props }: ComponentPropsWithoutRef<"li">) => (
      <li {...props} className={className} />
    ),
    strong: ({ className, ...props }: ComponentPropsWithoutRef<"strong">) => (
      <strong
        {...props}
        className={[
          isPresentationMode
            ? "font-semibold text-white"
            : "font-semibold text-gray-950 dark:text-gray-100",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => (
      <code
        {...props}
        className={[
          isPresentationMode
            ? "rounded-md bg-violet-500/12 px-1.5 py-0.5 font-mono text-[0.92em] text-violet-200"
            : "rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[0.92em] text-violet-700 dark:bg-gray-800 dark:text-violet-300",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    img: ({ className, alt, ...props }: ComponentPropsWithoutRef<"img">) => (
      <img
        {...props}
        alt={alt ?? ""}
        className={cn(
          "mx-auto block h-auto w-full max-w-5xl rounded-2xl border object-contain shadow-md",
          isPresentationMode
            ? "border-gray-700 bg-gray-950/50"
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950/80",
          className,
        )}
      />
    ),
  };
}

export async function generateStaticParams() {
  const sessions = await getAllSessions();
  return sessions.map((session) => ({ slug: session.slug }));
}

export async function generateMetadata({
  params,
}: SessionMetadataProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { frontmatter } = await getSession(slug);

    return {
      title: {
        absolute: `${frontmatter.title} - GenAI from the Ground Up`,
      },
      description: frontmatter.title,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[sessions route] generateMetadata failed for slug "${slug}":`,
        error instanceof Error ? error.message : error,
        error instanceof Error ? error.stack : "",
      );
    }
    return {
      title: {
        absolute: "Session Not Found - GenAI from the Ground Up",
      },
    };
  }
}

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const viewParam = Array.isArray(resolvedSearchParams.view)
    ? resolvedSearchParams.view[0]
    : resolvedSearchParams.view;
  const isPresentationMode = viewParam === "present";

  try {
    const { frontmatter, content } = await getSession(slug);
    const mdxComponents = getMdxComponents(isPresentationMode);
    const activeSections = sessionSectionOverrides[slug] ?? [...sessionSections];

    if (isPresentationMode) {
      return (
        <main className="relative h-[100dvh] overflow-hidden bg-[#060914]">
          <PresentationShell slug={slug} module={frontmatter.module} moduleName={frontmatter.moduleName}>
            <MDXRemote source={content} components={mdxComponents} />
          </PresentationShell>
        </main>
      );
    }

    return (
      <main className="relative overflow-hidden">
        <GridBackground />
        <Container className="relative z-10 py-10 lg:py-12">
          <div className="space-y-8">
            <header className="rounded-[28px] border border-gray-200/80 bg-white/85 px-6 py-8 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/60 sm:px-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                      Module {frontmatter.module}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{frontmatter.moduleName}</span>
                  </div>
                  <Link
                    href={`/sessions/${slug}?view=present`}
                    className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:border-violet-700 dark:hover:bg-violet-900/50"
                  >
                    Presenter Mode
                  </Link>
                </div>

                <div className="space-y-3">
                  <h1 className="text-balance text-5xl font-semibold leading-tight text-gray-950 dark:text-gray-50 sm:text-6xl">
                    {frontmatter.title}
                  </h1>
                </div>
              </div>
            </header>

            <div className="flex flex-col gap-8">
              <SessionProgressNav sections={activeSections} activeSection="goal" />

              <article className="w-full max-w-none rounded-[28px] border border-gray-200/80 bg-white/85 px-7 py-9 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/60 sm:px-10 sm:py-11 lg:px-12">
                <MDXRemote source={content} components={mdxComponents} />
              </article>
            </div>
          </div>
        </Container>
      </main>
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[sessions route] SessionPage failed for slug "${slug}" (returning 404; see error below):`,
        error instanceof Error ? error.message : error,
        error instanceof Error ? error.stack : "",
      );
    }
    return notFound();
  }
}
