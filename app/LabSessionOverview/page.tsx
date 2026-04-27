import type { Metadata } from "next";

import { LabSessionOverview } from "@/components/session";
import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";

export const metadata: Metadata = {
  title: "Lab Session Overview Preview",
  description: "Preview page for the AI Engineering Lab session overview component.",
};

export default function LabSessionOverviewPreviewPage() {
  return (
    <main className="relative min-h-screen overflow-hidden py-12 sm:py-16">
      <GridBackground />
      <Container className="relative z-10 space-y-12 xl:pr-20">
        <header className="max-w-5xl space-y-5">
          <p className="font-mono text-base font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
            Component Preview
          </p>
          <h1 className="text-6xl font-semibold text-white sm:text-7xl">
            Lab Session Overview
          </h1>
          <p className="text-2xl text-slate-300 sm:text-3xl">
            Structure-only preview for future AI Engineering Lab session pages.
          </p>
        </header>

        <LabSessionOverview
          goal="Define the project goal here: what the viewer will build, ship, or understand by the end of this lab session."
          technologies={["Technology A", "Technology B", "Tooling", "Runtime"]}
          concepts={["Main concept A", "Main concept B", "System design", "Evaluation"]}
          mainConcepts={[
            {
              title: "Build target",
              description:
                "Describe the concrete thing this session ships and why it matters.",
            },
            {
              title: "Architecture path",
              description:
                "Outline how the project pieces connect from input to working output.",
            },
            {
              title: "Engineering tradeoff",
              description:
                "Name the decision viewers need to understand before using this pattern.",
            },
          ]}
        />
      </Container>
    </main>
  );
}
