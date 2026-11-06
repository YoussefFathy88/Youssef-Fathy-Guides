import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyPromptButton } from "@/components/guides/CopyPromptButton";
import { Container } from "@/components/ui/container";
import { getPrompt, prompts } from "@/data/prompts";

type PromptPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return prompts.map((prompt) => ({ slug: prompt.slug }));
}

export async function generateMetadata({ params }: PromptPageProps): Promise<Metadata> {
  const prompt = getPrompt((await params).slug);
  if (!prompt) return {};
  return { title: prompt.title, description: prompt.summary };
}

export default async function PromptPage({ params }: PromptPageProps) {
  const prompt = getPrompt((await params).slug);
  if (!prompt) notFound();

  return (
    <main>
      <Container className="pb-24 pt-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href={"/guides#prompts" as Route}
            className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground transition hover:text-brand-text"
          >
            ← All prompts
          </Link>

          <header className="mt-8 space-y-5 border-b border-border-subtle pb-8">
            <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-base font-semibold text-brand-text">
              Prompt
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{prompt.title}</h1>
            <p className="rounded-2xl bg-brand-soft p-5 text-lg leading-8 text-foreground sm:text-xl sm:leading-9">
              {prompt.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border-subtle px-3 py-1 text-sm font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <section className="mt-10">
            <h2 className="mb-5 border-l-4 border-brand pl-4 text-2xl font-bold sm:text-3xl">
              How to use it
            </h2>
            <ol className="grid gap-4 sm:grid-cols-2">
              {prompt.steps.map((step, index) => (
                <li key={step} className="surface-card flex gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-lg leading-7">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <h2 className="border-l-4 border-brand pl-4 text-2xl font-bold sm:text-3xl">
                The prompt
              </h2>
              <CopyPromptButton text={prompt.body} />
            </div>
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-[#0d1117]">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-base text-gray-400">prompt.md</span>
              </div>
              <pre className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap break-words p-5 font-mono text-base leading-7 text-gray-100">
                {prompt.body}
              </pre>
            </div>
            <div className="mt-6 flex justify-center">
              <CopyPromptButton text={prompt.body} className="w-full sm:w-auto" />
            </div>
          </section>

          {prompt.afterGuide ? (
            <section className="mt-14">
              <h2 className="mb-6 border-l-4 border-brand pl-4 text-2xl font-bold sm:text-3xl">
                {prompt.afterGuide.title}
              </h2>
              <ol className="space-y-4">
                {prompt.afterGuide.steps.map((step, index) => (
                  <li key={step.title} className="surface-card flex gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xl font-bold">{step.title}</p>
                      <p className="text-lg leading-7">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 rounded-2xl border-2 border-brand bg-brand-soft p-5 sm:p-6">
                <p className="text-xl font-bold">Your expected link</p>
                <ul className="mt-4 space-y-4">
                  {prompt.afterGuide.expectedLinks.map((link) => (
                    <li key={link.url} className="space-y-1">
                      <p className="text-base font-semibold text-muted-foreground">{link.when}</p>
                      <p className="break-all font-mono text-lg font-bold text-brand-text">{link.url}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="mt-6 list-disc space-y-2 pl-6 text-lg leading-7 marker:text-brand">
                {prompt.afterGuide.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
