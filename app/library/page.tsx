import { JourneyMap } from "@/components/JourneyMap";
import { ModuleChapter } from "@/components/ModuleChapter";
import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";
import { SectionShell } from "@/components/ui/section-shell";
import { SessionBadge } from "@/components/ui/session-badge";
import { getModules, getSessionsByModule } from "@/lib/course";

export default function LibraryPage() {
  const modules = getModules();

  return (
    <main className="relative overflow-hidden">
      <GridBackground />
      <Container className="relative z-10 space-y-10 pb-20 pt-12 xl:pr-20">
        <SectionShell className="px-6 py-8 sm:px-8 sm:py-10">
          <SessionBadge tone="blue">The Agents Story Playlist</SessionBadge>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold sm:text-5xl">
            Every module, every session, one persistent learning journey.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Your progress is stored locally in the browser, so you can move through the course in order and keep the story intact.
          </p>
        </SectionShell>

        <JourneyMap />

        <div className="space-y-10">
          {modules.map((module) => (
            <ModuleChapter
              key={module.id}
              module={module}
              sessions={getSessionsByModule(module.id)}
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
