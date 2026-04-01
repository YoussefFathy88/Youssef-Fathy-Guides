import type { ComponentPropsWithoutRef } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

import {
  NextSessionCard,
  PresentationShell,
  RecapTable,
  SessionProgressNav,
  SessionSection,
} from "@/components/session";
import {
  AgentLoopStepper,
  AnnotatedCode,
  AttentionHeatmap,
  ConceptCompare,
  ConceptStepper,
  ContextWindowFiller,
  DataFlowDiagram,
  DualPhaseFlow,
  LayerStack,
  MiniPlayground,
  ParameterSlider,
  PipelineTrack,
  StepSequence,
  TokenProbDist,
  Vector2DPlot,
} from "@/components/shared";
import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";
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

function getMdxComponents(isPresentationMode: boolean) {
  return {
    SessionSection,
    RecapTable,
    NextSessionCard,
    AgentLoopStepper,
    ParameterSlider,
    AttentionHeatmap,
    ConceptStepper,
    ContextWindowFiller,
    DataFlowDiagram,
    DualPhaseFlow,
    ConceptCompare,
    MiniPlayground,
    Vector2DPlot,
    TokenProbDist,
    PipelineTrack,
    StepSequence,
    LayerStack,
    AnnotatedCode,
    h2: ({ className, ...props }: ComponentPropsWithoutRef<"h2">) => (
      <h2
        {...props}
        className={[
          isPresentationMode
            ? "text-balance text-4xl font-semibold text-white sm:text-5xl"
            : "text-balance text-[2.4rem] font-semibold leading-tight text-gray-950 dark:text-gray-50 sm:text-5xl",
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
            ? "mt-8 text-2xl font-semibold text-gray-100 sm:text-3xl"
            : "mt-10 text-[1.8rem] font-semibold leading-tight text-gray-950 dark:text-gray-100 sm:text-[2rem]",
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
  } catch {
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

    if (isPresentationMode) {
      return (
        <main className="relative h-[100dvh] overflow-hidden bg-[#060914]">
          <PresentationShell
            slug={slug}
            title={frontmatter.title}
            module={frontmatter.module}
            moduleName={frontmatter.moduleName}
            sections={[...sessionSections]}
          >
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

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-14">
              <SessionProgressNav sections={[...sessionSections]} activeSection="goal" />

              <article className="w-full max-w-[1120px] rounded-[28px] border border-gray-200/80 bg-white/85 px-7 py-9 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/60 sm:px-10 sm:py-11 lg:px-12">
                <MDXRemote source={content} components={mdxComponents} />
              </article>
            </div>
          </div>
        </Container>
      </main>
    );
  } catch {
    return notFound();
  }
}
