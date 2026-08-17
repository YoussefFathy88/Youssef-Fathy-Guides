import type { Route } from "next";

export type LabProject = {
  number: string;
  title: string;
  tags: string[];
  description: string;
  status: string;
  href?: Route;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  projects: LabProject[];
};

export const PLAYLISTS: Playlist[] = [
  {
    id: "ai-engineering-lab",
    title: "AI Engineering Lab",
    description: "Project-based sessions. Every session ships something.",
    projects: [
      {
        number: "01",
        title: "Chat with Your Data",
        tags: ["RAG", "Vector DB", "Embeddings"],
        description:
          "Build a pipeline that lets you query your own documents using natural language.",
        href: "/sessions/introduction-to-rag-lab" as Route,
        status: "Start lab",
      },
      {
        number: "02",
        title: "Task Management System",
        tags: ["Agents", "Tool Use", "Memory"],
        description:
          "Build a fully functional task manager powered by an LLM agent with persistent state.",
        href: "/sessions/introduction-to-ai-taskflow-lab" as Route,
        status: "Start lab",
      },
      {
        number: "03",
        title: "Mini Claude Code",
        tags: ["Code Agents", "CLI", "Agentic Loops"],
        description:
          "Build a minimal coding agent that reads files, writes code, and runs terminal commands.",
        status: "Coming soon",
      },
      {
        number: "04",
        title: "From Requirements to Jira Tickets — AI Agent",
        tags: ["RAG", "Tool Use", "Agents"],
        description:
          "Combine retrieval and tool use to build an agent that reads a requirements doc and files Jira tickets for each item, grounded in your existing specs.",
        href: "/sessions/requirements-to-jira-tickets-agent" as Route,
        status: "Start lab",
      },
    ],
  },
  {
    id: "efficient-coding-with-ai",
    title: "Efficient Coding with AI",
    description:
      "A practical playlist on choosing models, planning, and building AI-assisted software with discipline.",
    projects: [
      {
        number: "01",
        title: "Plan Before You Code",
        tags: ["Model Selection", "Planning"],
        description:
          "Pick the right model tier and turn a vague idea into a concrete plan before you write a line of code.",
        href: "/sessions/plan-before-you-code" as Route,
        status: "Start lab",
      },
      {
        number: "02",
        title: "Disciplined AI Implementation",
        tags: ["Implementation", "Discipline"],
        description:
          "Turn a plan into working code with a disciplined, verifiable build loop — illustrated with a real SpecAI build.",
        href: "/sessions/disciplined-ai-implementation" as Route,
        status: "Start lab",
      },
      {
        number: "03",
        title: "Project Rules & Skills",
        tags: ["Project Rules", "Skills"],
        description:
          "Turn recurring instructions into reusable rules and skills your AI tools follow automatically.",
        href: "/sessions/ai-project-rules-and-skills" as Route,
        status: "Start lab",
      },
    ],
  },
];
