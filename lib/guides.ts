import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import matter from "gray-matter";

const GUIDES_ROOT = path.join(process.cwd(), "content", "guides");

export type GuideStatus = "published" | "coming-soon";

export interface GuideFrontmatter {
  title: string;
  slug: string;
  order: number;
  status: GuideStatus;
  summary: string;
  date: string | null;
  author: string | null;
  tags: string[];
}

export interface Guide {
  frontmatter: GuideFrontmatter;
  content: string;
}

function toDateString(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseGuide(raw: string, fileName: string): Guide {
  const { data, content } = matter(raw);

  return {
    frontmatter: {
      title: String(data.title ?? fileName),
      slug: String(data.slug ?? path.basename(fileName, ".mdx")),
      order: typeof data.order === "number" ? data.order : 99,
      status: data.status === "published" ? "published" : "coming-soon",
      summary: String(data.summary ?? ""),
      date: toDateString(data.date),
      author: typeof data.author === "string" ? data.author : null,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    },
    content,
  };
}

export const getAllGuides = cache(async (): Promise<Guide[]> => {
  const files = (await readdir(GUIDES_ROOT)).filter((file) => file.endsWith(".mdx"));
  const guides = await Promise.all(
    files.map(async (file) => parseGuide(await readFile(path.join(GUIDES_ROOT, file), "utf8"), file)),
  );

  return guides.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
});

export const getGuide = cache(async (slug: string) => {
  const guides = await getAllGuides();
  return guides.find((guide) => guide.frontmatter.slug === slug) ?? null;
});

export function formatGuideDate(date: string | null) {
  if (!date) return null;
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
