export interface ShortDef {
  slug: string;
  title: string;
  topic: string;
  topicColor: "violet" | "amber" | "teal" | "rose" | "blue" | "emerald";
  description: string;
}

export const SHORTS: ShortDef[] = [
  {
    slug: "how-llms-work",
    title: "How LLMs Work",
    topic: "LLM Basics",
    topicColor: "violet",
    description:
      "Ask a question — the model builds the answer one token at a time, not all at once.",
  },
  {
    slug: "how-tokens-work",
    title: "How AI Reads Text",
    topic: "Tokenization",
    topicColor: "violet",
    description:
      "AI doesn't see letters or words — it splits everything into numbered pieces called tokens.",
  },
  {
    slug: "how-llms-are-trained",
    title: "How LLMs Are Trained",
    topic: "LLM Training",
    topicColor: "amber",
    description:
      "From random noise to a helpful AI — the three stages that turn raw text into ChatGPT.",
  },
  {
    slug: "context-window",
    title: "What Is a Context Window?",
    topic: "Context Window",
    topicColor: "teal",
    description:
      "The AI's working memory: everything it can see at once, and why it forgets old messages.",
  },
  {
    slug: "how-embeddings-work",
    title: "How Embeddings Work",
    topic: "Embeddings",
    topicColor: "rose",
    description:
      "Words become lists of numbers so AI can measure meaning — and similar words land close together.",
  },
  {
    slug: "how-rag-works",
    title: "How RAG Works",
    topic: "RAG",
    topicColor: "blue",
    description:
      "How AI answers questions about your private files by searching a vector database before replying.",
  },
  {
    slug: "how-ai-takes-actions",
    title: "How AI Takes Actions",
    topic: "AI Actions",
    topicColor: "emerald",
    description:
      "AI doesn't run tools itself — it outputs a JSON plan and your app executes the actual work.",
  },
];
