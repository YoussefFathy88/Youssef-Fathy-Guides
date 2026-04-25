import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getSessionBySlug, getSessions } from "@/lib/course";

type SessionPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  return getSessions().map((session) => ({ slug: session.slug }));
}

export async function generateMetadata({
  params,
}: SessionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = getSessionBySlug(slug);

  if (!session) {
    return { title: "Session Not Found" };
  }

  return {
    title: `${session.id} | ${session.title}`,
    description: session.prevRecap,
  };
}

export default async function LegacySessionPage({ params, searchParams }: SessionPageProps) {
  const { slug } = await params;
  await searchParams;
  const session = getSessionBySlug(slug);

  if (!session) {
    return notFound();
  }

  redirect(`/sessions/${slug}`);
}
