import type { ComponentPropsWithoutRef } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

import { GuideTable } from "@/components/guides/GuideTable";
import { Container } from "@/components/ui/container";
import { formatGuideDate, getAllGuides, getGuide } from "@/lib/guides";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

/* Reading-page typography: large and plain, black text with green accents. */
const mdxComponents = {
  GuideTable,
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-14 mb-5 border-l-4 border-brand pl-4 text-2xl font-bold sm:text-3xl"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 mb-3 text-xl font-bold sm:text-2xl" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mt-4 text-lg leading-8 text-foreground sm:text-xl sm:leading-9" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mt-4 list-disc space-y-3 pl-6 text-lg leading-8 text-foreground marker:text-brand sm:text-xl sm:leading-9"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mt-4 list-decimal space-y-3 pl-6 text-lg leading-8 text-foreground marker:font-bold marker:text-brand-text sm:text-xl sm:leading-9"
      {...props}
    />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-bold text-foreground" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded-md bg-background-elevated px-1.5 py-0.5 font-mono text-[0.92em] text-brand-text"
      {...props}
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="font-semibold text-brand-text underline underline-offset-4" {...props} />
  ),
};

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides
    .filter((guide) => guide.frontmatter.status === "published")
    .map((guide) => ({ slug: guide.frontmatter.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = await getGuide((await params).slug);
  if (!guide) return {};
  return { title: guide.frontmatter.title, description: guide.frontmatter.summary };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const guide = await getGuide((await params).slug);
  if (!guide || guide.frontmatter.status !== "published") notFound();

  const { frontmatter, content } = guide;
  const date = formatGuideDate(frontmatter.date);

  return (
    <main>
      <Container className="pb-24 pt-10">
        <div className="mx-auto max-w-3xl">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground transition hover:text-brand-text"
        >
          ← All guides
        </Link>

        <header className="mt-8 space-y-5 border-b border-border-subtle pb-8">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{frontmatter.title}</h1>
          {date || frontmatter.author ? (
            <p className="text-base">
              {[date, frontmatter.author].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          <p className="rounded-2xl bg-brand-soft p-5 text-lg leading-8 text-foreground sm:text-xl sm:leading-9">
            {frontmatter.summary}
          </p>
          {frontmatter.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border-subtle px-3 py-1 text-sm font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <article>
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{ blockJS: false, blockDangerousJS: false }}
          />
        </article>
        </div>
      </Container>
    </main>
  );
}
