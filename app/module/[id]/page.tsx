import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JourneyMap } from "@/components/JourneyMap";
import { ModuleChapter } from "@/components/ModuleChapter";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";
import { getModuleById, getModules, getSessionsByModule } from "@/lib/course";

type ModulePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  return getModules().map((module) => ({ id: String(module.id) }));
}

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { id } = await params;
  const module = getModuleById(Number(id) as 1 | 2 | 3 | 4);

  if (!module) {
    return { title: "Module Not Found" };
  }

  return {
    title: `Module ${module.id} | ${module.title}`,
    description: module.tagline,
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { id } = await params;
  const moduleId = Number(id) as 1 | 2 | 3 | 4;
  const module = getModuleById(moduleId);

  if (!module) {
    notFound();
  }

  return (
    <main className="relative overflow-hidden">
      <GridBackground />
      <Container className="relative z-10 space-y-8 pb-20 pt-12 xl:pr-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ButtonLink href="/library" variant="secondary">
            Back to library
          </ButtonLink>
        </div>

        <JourneyMap />
        <ModuleChapter module={module} sessions={getSessionsByModule(module.id)} />
      </Container>
    </main>
  );
}
