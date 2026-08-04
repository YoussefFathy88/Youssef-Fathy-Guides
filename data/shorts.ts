export type ShortPlaylist = "ai" | "web-development" | "software-design";

export interface ShortDef {
  slug: string;
  title: string;
  topic: string;
  topicColor: "violet" | "amber" | "teal" | "rose" | "blue" | "emerald";
  description: string;
  playlist: ShortPlaylist;
}

export const SHORTS: ShortDef[] = [
  // ── AI Concepts ────────────────────────────────────────────────────────────
  {
    slug: "how-llms-work",
    title: "How LLMs Work",
    topic: "LLM Basics",
    topicColor: "violet",
    description:
      "Ask a question — the model builds the answer one token at a time, not all at once.",
    playlist: "ai",
  },
  {
    slug: "how-tokens-work",
    title: "BPE: Training vs Runtime",
    topic: "What Are Tokens?",
    topicColor: "violet",
    description:
      "Follow one word, \"Egyptian\", through the exact merge rules BPE learns during training — then watch runtime replay those rules on a full prompt.",
    playlist: "ai",
  },
  {
    slug: "how-embeddings-work",
    title: "How Embeddings Work",
    topic: "Embeddings",
    topicColor: "rose",
    description:
      "Words become lists of numbers so AI can measure meaning — and similar words land close together.",
    playlist: "ai",
  },
  {
    slug: "how-claude-code-works",
    title: "How Claude Code Works",
    topic: "Claude Code",
    topicColor: "emerald",
    description:
      "Claude is just a model that writes text — coding tools let it read, edit, and run your code in a loop.",
    playlist: "ai",
  },
  {
    slug: "how-agent-skills-work",
    title: "How Agent Skills Work",
    topic: "Agent Skills",
    topicColor: "amber",
    description:
      "A skill is a folder with a SKILL.md file — Claude loads only what each task needs, keeping context small.",
    playlist: "ai",
  },
  {
    slug: "what-are-ai-models",
    title: "What Are AI Models?",
    topic: "AI Models",
    topicColor: "violet",
    description:
      "Weights are numbers, training tunes them, inference uses them — the whole trick behind every AI model, from a house-price formula to an LLM.",
    playlist: "ai",
  },
  {
    slug: "claude-code-vs-cursor",
    title: "Claude Code vs Cursor",
    topic: "Coding Agents",
    topicColor: "rose",
    description:
      "Both tools can run on the same Claude model — different rule files, agent loops, and trust systems build a completely different experience around it.",
    playlist: "ai",
  },

  // ── Web Development Concepts ────────────────────────────────────────────────
  {
    slug: "how-auth-works",
    title: "How Authentication Works",
    topic: "Auth",
    topicColor: "blue",
    description:
      "Passwords get stolen — here's how tokens, MFA, and OAuth actually keep you logged in safely.",
    playlist: "web-development",
  },

  // ── Software Design Concepts ────────────────────────────────────────────────
  {
    slug: "solid-principles",
    title: "SOLID Principles Explained",
    topic: "SOLID",
    topicColor: "emerald",
    description:
      "Five rules that make code easy to change — one class, one job, and never break what works.",
    playlist: "software-design",
  },
  {
    slug: "vibe-coding-vs-ai-engineering",
    title: "Vibe Coding vs AI Engineering",
    topic: "Vibe Coding",
    topicColor: "teal",
    description:
      "Same prompt, two developers — one skips review, one checks every step. Here's when each approach actually wins.",
    playlist: "software-design",
  },
];
