export interface AnatomySession {
  id: string;
  title: string;
  slug: string;
  status: "available" | "coming-soon";
}

export interface AnatomyModule {
  id: string;
  label: string;
  subtitle: string;
  emoji: string;
  color: string;
  bodyPart: string;
  sessions: AnatomySession[];
}

export const ANATOMY_MODULES: readonly AnatomyModule[] = [
  {
    id: "brain",
    label: "Brain",
    subtitle: "How It Thinks",
    emoji: "🧠",
    color: "#00E5FF",
    bodyPart: "brain",
    sessions: [
      {
        id: "brain-01",
        title: "LLM Overview — The Big Picture",
        slug: "how-llms-work",
        status: "available",
      },
      {
        id: "brain-02",
        title: "Tokenization & Context Window",
        slug: "tokens-context-window",
        status: "available",
      },
      {
        id: "brain-03",
        title: "Embeddings",
        slug: "embeddings",
        status: "available",
      },
      {
        id: "brain-04",
        title: "The Transformer: Attention Is All You Need",
        slug: "transformer-attention",
        status: "available",
      },
      {
        id: "brain-05",
        title: "Training LLMs — From Data to Aligned Models",
        slug: "how-llms-are-trained",
        status: "available",
      },
    ],
  },
  {
    id: "senses",
    label: "Senses",
    subtitle: "How It Perceives",
    emoji: "👁️",
    color: "#FFB300",
    bodyPart: "senses",
    sessions: [
      {
        id: "senses-01",
        title: "The Evolution of Senses (Translator vs Native)",
        slug: "senses-01",
        status: "coming-soon",
      },
      {
        id: "senses-02",
        title: "Vision & Image Understanding",
        slug: "senses-02",
        status: "coming-soon",
      },
      {
        id: "senses-03",
        title: "Audio & Speech",
        slug: "senses-03",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "memory",
    label: "Memory",
    subtitle: "What It Remembers",
    emoji: "💾",
    color: "#7C3AED",
    bodyPart: "memory",
    sessions: [
      {
        id: "memory-01",
        title: "Short-Term Memory (In-Context)",
        slug: "memory-01",
        status: "coming-soon",
      },
      {
        id: "memory-02",
        title: "Long-Term Memory & Vector Databases",
        slug: "memory-02",
        status: "coming-soon",
      },
      {
        id: "memory-03",
        title: "RAG — Retrieval-Augmented Generation",
        slug: "memory-03",
        status: "coming-soon",
      },
      {
        id: "memory-04",
        title: "State Management",
        slug: "memory-04",
        status: "coming-soon",
      },
      {
        id: "memory-05",
        title: "Memory Architecture Patterns",
        slug: "memory-05",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "hands",
    label: "Hands",
    subtitle: "How Agents Take Action",
    emoji: "🤲",
    color: "#10B981",
    bodyPart: "hands",
    sessions: [
      {
        id: "hands-01",
        title: "Tools & Function Calling",
        slug: "tools-and-function-calling",
        status: "coming-soon",
      },
      {
        id: "hands-02",
        title: "Model Context Protocol (MCP)",
        slug: "mcp",
        status: "coming-soon",
      },
      {
        id: "hands-03",
        title: "Code Execution & Sandboxing",
        slug: "hands-03",
        status: "coming-soon",
      },
      {
        id: "hands-04",
        title: "Browser & Computer Use",
        slug: "hands-04",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "heart",
    label: "Heart",
    subtitle: "How Agents Decide & Plan",
    emoji: "🫀",
    color: "#F43F5E",
    bodyPart: "heart",
    sessions: [
      {
        id: "heart-01",
        title: "Agent Architectures & Loops",
        slug: "ai-agents",
        status: "coming-soon",
      },
      {
        id: "heart-02",
        title: "Planning & Task Decomposition",
        slug: "planning-in-ai-agents",
        status: "coming-soon",
      },
      {
        id: "heart-03",
        title: "Human-in-the-Loop",
        slug: "human-in-the-loop",
        status: "coming-soon",
      },
      {
        id: "heart-04",
        title: "Agent Skills & Specialization",
        slug: "agent-skills",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "voice",
    label: "Voice",
    subtitle: "How It Communicates",
    emoji: "🗣️",
    color: "#38BDF8",
    bodyPart: "voice",
    sessions: [
      {
        id: "voice-01",
        title: "Persona & System Prompts",
        slug: "voice-01",
        status: "coming-soon",
      },
      {
        id: "voice-02",
        title: "Structured Output & Formatting",
        slug: "voice-02",
        status: "coming-soon",
      },
      {
        id: "voice-03",
        title: "Output Safety & Filtering",
        slug: "voice-03",
        status: "coming-soon",
      },
      {
        id: "voice-04",
        title: "Streaming & Real-time Output",
        slug: "voice-04",
        status: "coming-soon",
      },
      {
        id: "voice-05",
        title: "Multilingual & Localization",
        slug: "voice-05",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "nervous",
    label: "Nervous System",
    subtitle: "How It All Connects",
    emoji: "🦴",
    color: "#F97316",
    bodyPart: "nervous",
    sessions: [
      {
        id: "nervous-01",
        title: "Context Engineering",
        slug: "context-engineering",
        status: "coming-soon",
      },
      {
        id: "nervous-02",
        title: "Guardrails & Alignment",
        slug: "guardrails-and-safety",
        status: "coming-soon",
      },
      {
        id: "nervous-03",
        title: "Observability, Tracing & Debugging",
        slug: "observability-and-tracing",
        status: "coming-soon",
      },
      {
        id: "nervous-04",
        title: "Evals & Testing",
        slug: "evals",
        status: "coming-soon",
      },
      {
        id: "nervous-05",
        title: "Deployment & Production Patterns",
        slug: "nervous-05",
        status: "coming-soon",
      },
    ],
  },
];

export const COLONY_MODULE: AnatomyModule = {
  id: "colony",
  label: "The Colony",
  subtitle: "How Agents Collaborate",
  emoji: "🌐",
  color: "#6366F1",
  bodyPart: "colony",
  sessions: [
    {
      id: "colony-01",
      title: "Multi-Agent Architectures",
      slug: "multi-agent-systems",
      status: "coming-soon",
    },
    {
      id: "colony-02",
      title: "Agent Orchestration & Coordination",
      slug: "colony-02",
      status: "coming-soon",
    },
    {
      id: "colony-03",
      title: "Communication Protocols Between Agents",
      slug: "colony-03",
      status: "coming-soon",
    },
    {
      id: "colony-04",
      title: "Emergent Behavior & Failure Modes",
      slug: "colony-04",
      status: "coming-soon",
    },
    {
      id: "colony-05",
      title: "Real-World Multi-Agent Systems",
      slug: "colony-05",
      status: "coming-soon",
    },
  ],
};
