import type { Metadata, Route } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { formatGuideDate, getAllGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description: "Practical tips that go with each video: how I use AI for montage, building apps, and planning.",
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
            Short, practical guides that go with my videos. Read one, try it, and come back
            for the next.
          </p>
        </header>

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
                <h2 className="text-2xl font-bold">{guide.title}</h2>
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
        </div>
      </Container>
    </main>
  );
}
