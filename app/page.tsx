import { JourneyMap } from "@/components/JourneyMap";
import { ProgressSummary } from "@/components/ProgressSummary";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";
import { SectionShell } from "@/components/ui/section-shell";
import { SessionBadge } from "@/components/ui/session-badge";
import { getModules, getSessionById, getSessionRoute } from "@/lib/course";

const storyPoints = [
  {
    title: "Start in the engine room",
    text: "The course begins with the internal mechanics of LLMs so the later workflow and agent lessons land on real understanding.",
  },
  {
    title: "Add capability with intent",
    text: "RAG, tools, memory, MCP, and skills are introduced as system upgrades, not disconnected buzzwords.",
  },
  {
    title: "Ship with production discipline",
    text: "The final module brings observability, performance, and deployment patterns into the story so the course ends where real systems live.",
  },
];

export default function HomePage() {
  const firstSession = getSessionById("E01");
  const modules = getModules();

  return (
    <main className="relative overflow-hidden">
      <GridBackground />
      <Container className="relative z-10 space-y-10 pb-20 pt-12 xl:pr-20">
        <section className="surface-card overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.24fr_0.76fr] lg:items-end">
            <div className="space-y-5">
              <SessionBadge tone="purple">Joee's GenAI from the Ground Up</SessionBadge>
              <div className="space-y-4">
                <h1 className="max-w-5xl text-balance text-4xl font-semibold sm:text-5xl lg:text-6xl">
                  A story-driven course that starts inside the model and ends in production.
                </h1>
                <p className="max-w-3xl text-lg text-slate-300 sm:text-xl">
                  This is not a bag of isolated tutorials. It is a guided journey from
                  the mechanics of LLMs to tools, agents, and production systems.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {firstSession ? (
                  <ButtonLink href={getSessionRoute(firstSession)}>
                    Start with {firstSession.id}
                  </ButtonLink>
                ) : null}
                <ButtonLink href="/library" variant="secondary">
                  Open full library
                </ButtonLink>
              </div>
            </div>

            <div className="surface-panel grid gap-3 p-5">
              {modules.map((module) => (
                <div key={module.id} className="surface-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-400">Module {module.id}</p>
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
                      style={{
                        color: module.color,
                        borderColor: `${module.color}40`,
                        backgroundColor: `${module.color}1A`,
                      }}
                    >
                      {module.episodeRange}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">{module.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProgressSummary />

        <JourneyMap />

        <SectionShell>
          <div className="grid gap-4 lg:grid-cols-3">
            {storyPoints.map((point) => (
              <div
                key={point.title}
                className="surface-panel p-5 transition duration-300 hover:-translate-y-1"
              >
                <h2 className="text-2xl font-semibold text-white">{point.title}</h2>
                <p className="mt-3 text-base text-slate-300">{point.text}</p>
              </div>
            ))}
          </div>
        </SectionShell>
      </Container>
    </main>
  );
}
