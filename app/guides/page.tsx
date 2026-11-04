import type { Metadata, Route } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { prompts, SKILLS_REPO_URL } from "@/data/prompts";
import { formatGuideDate, getAllGuides } from "@/lib/guides";

const SECTIONS = [
  { id: "skills", label: "Skills" },
  { id: "prompts", label: "Prompts" },
  { id: "guides", label: "Guides" },
];

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Skills, prompts, and practical guides that go with each video: how I use AI for montage, building apps, and planning.",
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <main>
      <Container className="pb-20 pt-12">
        <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-4">
          <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-base font-semibold text-brand-text">
            Guides
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">Tips from every video</h1>
          <p className="max-w-2xl text-xl">
            The skills, prompts, and short guides from my videos. Grab one, try it, and come
            back for the next.
          </p>
          <nav className="flex flex-wrap gap-3 pt-2">
            {SECTIONS.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-border-subtle px-5 py-2 text-base font-bold transition hover:border-brand hover:text-brand-text sm:text-lg"
              >
                {index + 1}. {section.label}
              </a>
            ))}
          </nav>
        </header>

        <section id="skills" className="scroll-mt-24 space-y-5">
          <h2 className="border-l-4 border-brand pl-4 text-3xl font-bold">Skills</h2>
          <a
            href={SKILLS_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card group flex flex-col gap-5 p-6 transition hover:-translate-y-0.5 hover:border-brand sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div className="flex items-start gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="h-8 w-8 fill-current">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </span>
              <div className="space-y-2">
                <p className="text-2xl font-bold">All skills from the videos</p>
                <p className="text-lg">All skills in the videos are uploaded on this GitHub page.</p>
                <p className="font-mono text-base text-muted-foreground">
                  github.com/YoussefFathy88/Youssef-Fathy-Skills
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand px-5 py-3 text-base font-bold text-white sm:text-lg">
              Open on GitHub ↗
            </span>
          </a>
        </section>

        <section id="prompts" className="scroll-mt-24 space-y-5">
          <h2 className="border-l-4 border-brand pl-4 text-3xl font-bold">Prompts</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {prompts.map((prompt) => (
              <Link
                key={prompt.slug}
                href={`/guides/prompts/${prompt.slug}` as Route}
                className="surface-card flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <span className="self-start rounded-full bg-brand px-3 py-1 text-sm font-semibold text-white">
                  Copy prompt
                </span>
                <h3 className="text-2xl font-bold">{prompt.title}</h3>
                <p className="text-lg">{prompt.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="guides" className="scroll-mt-24 space-y-5">
        <h2 className="border-l-4 border-brand pl-4 text-3xl font-bold">Guides</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {guides.map(({ frontmatter: guide }) => {
            const isPublished = guide.status === "published";
            const date = formatGuideDate(guide.date);
            const body = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={
                      isPublished
                        ? "rounded-full bg-brand px-3 py-1 text-sm font-semibold text-white"
                        : "rounded-full border border-border-subtle px-3 py-1 text-sm font-semibold text-muted-foreground"
                    }
                  >
                    {isPublished ? "Read now" : "Coming soon"}
                  </span>
                  {date ? <span className="text-base text-muted-foreground">{date}</span> : null}
                </div>
                <h3 className="text-2xl font-bold">{guide.title}</h3>
                <p className="text-lg">{guide.summary}</p>
              </>
            );

            return isPublished ? (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}` as Route}
                className="surface-card flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-brand"
              >
                {body}
              </Link>
            ) : (
              <div key={guide.slug} className="surface-card flex flex-col gap-4 p-6 opacity-70">
                {body}
              </div>
            );
          })}
        </div>
        </section>
        </div>
      </Container>
    </main>
  );
}
