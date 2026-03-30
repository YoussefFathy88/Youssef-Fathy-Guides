import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import matter from "gray-matter";

const SESSIONS_ROOT = path.join(process.cwd(), "content", "sessions");
const MDX_EXTENSION = ".mdx";

type SessionDifficulty = "beginner" | "intermediate" | "advanced";

type ParsedSessionFile = {
  filePath: string;
  frontmatter: SessionFrontmatter;
  content: string;
};

export interface SessionFrontmatter {
  title: string;
  slug: string;
  module: number;
  moduleName: string;
  sessionNumber: number;
  duration: string;
  difficulty: SessionDifficulty;
  tags: string[];
  nextSession: string | null;
  prevSession: string | null;
}

function isDifficulty(value: unknown): value is SessionDifficulty {
  return value === "beginner" || value === "intermediate" || value === "advanced";
}

function toNullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeSlugFromPath(filePath: string) {
  return path
    .basename(filePath, MDX_EXTENSION)
    .replace(/^\d+-/, "")
    .trim();
}

function stripLeadingMdxImports(content: string) {
  const lines = content.split(/\r?\n/);
  let index = 0;

  while (index < lines.length && lines[index].trim() === "") {
    index += 1;
  }

  while (index < lines.length) {
    const currentLine = lines[index].trim();

    if (!currentLine.startsWith("import ") && !currentLine.startsWith("export ")) {
      break;
    }

    while (index < lines.length && !lines[index].trim().endsWith(";")) {
      index += 1;
    }

    index += 1;

    while (index < lines.length && lines[index].trim() === "") {
      index += 1;
    }
  }

  return lines.slice(index).join("\n");
}

function parseFrontmatter(
  rawFrontmatter: Record<string, unknown>,
  filePath: string,
): SessionFrontmatter {
  const slug = typeof rawFrontmatter.slug === "string"
    ? rawFrontmatter.slug
    : normalizeSlugFromPath(filePath);

  if (typeof rawFrontmatter.title !== "string") {
    throw new Error(`Missing "title" in session frontmatter: ${filePath}`);
  }

  if (typeof rawFrontmatter.moduleName !== "string") {
    throw new Error(`Missing "moduleName" in session frontmatter: ${filePath}`);
  }

  if (typeof rawFrontmatter.duration !== "string") {
    throw new Error(`Missing "duration" in session frontmatter: ${filePath}`);
  }

  if (typeof rawFrontmatter.module !== "number") {
    throw new Error(`Missing numeric "module" in session frontmatter: ${filePath}`);
  }

  if (typeof rawFrontmatter.sessionNumber !== "number") {
    throw new Error(`Missing numeric "sessionNumber" in session frontmatter: ${filePath}`);
  }

  if (!isDifficulty(rawFrontmatter.difficulty)) {
    throw new Error(`Invalid "difficulty" in session frontmatter: ${filePath}`);
  }

  return {
    title: rawFrontmatter.title,
    slug,
    module: rawFrontmatter.module,
    moduleName: rawFrontmatter.moduleName,
    sessionNumber: rawFrontmatter.sessionNumber,
    duration: rawFrontmatter.duration,
    difficulty: rawFrontmatter.difficulty,
    tags: Array.isArray(rawFrontmatter.tags)
      ? rawFrontmatter.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    nextSession: toNullableString(rawFrontmatter.nextSession),
    prevSession: toNullableString(rawFrontmatter.prevSession),
  };
}

async function collectSessionFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolvedPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectSessionFiles(resolvedPath);
      }

      return entry.isFile() && entry.name.endsWith(MDX_EXTENSION) ? [resolvedPath] : [];
    }),
  );

  return files.flat();
}

const loadSessionFiles = cache(async (): Promise<ParsedSessionFile[]> => {
  const filePaths = await collectSessionFiles(SESSIONS_ROOT);

  if (filePaths.length === 0) {
    throw new Error(`No MDX session files were found under ${SESSIONS_ROOT}.`);
  }

  const parsedFiles = await Promise.all(
    filePaths.map(async (filePath) => {
      const rawSource = await readFile(filePath, "utf8");
      const { data, content } = matter(rawSource);

      return {
        filePath,
        frontmatter: parseFrontmatter(data, filePath),
        content: stripLeadingMdxImports(content).trim(),
      };
    }),
  );

  return parsedFiles.sort((left, right) => {
    if (left.frontmatter.module !== right.frontmatter.module) {
      return left.frontmatter.module - right.frontmatter.module;
    }

    if (left.frontmatter.sessionNumber !== right.frontmatter.sessionNumber) {
      return left.frontmatter.sessionNumber - right.frontmatter.sessionNumber;
    }

    return left.frontmatter.slug.localeCompare(right.frontmatter.slug);
  });
});

export const getAllSessions = cache(async (): Promise<SessionFrontmatter[]> => {
  const sessions = await loadSessionFiles();
  return sessions.map((session) => session.frontmatter);
});

export const getSession = cache(async (slug: string): Promise<{
  frontmatter: SessionFrontmatter;
  content: string;
}> => {
  const sessions = await loadSessionFiles();
  const matchedSession = sessions.find(
    (session) =>
      session.frontmatter.slug === slug || normalizeSlugFromPath(session.filePath) === slug,
  );

  if (!matchedSession) {
    throw new Error(`Session "${slug}" was not found under ${SESSIONS_ROOT}.`);
  }

  return {
    frontmatter: matchedSession.frontmatter,
    content: matchedSession.content,
  };
});
