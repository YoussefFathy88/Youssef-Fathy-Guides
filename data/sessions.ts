import type { CourseModule, CourseSession } from "@/lib/session-types";

export const courseModules: CourseModule[] = [
  {
    id: 1,
    title: "The Engine Room",
    episodeRange: "E01-E07",
    tagline:
      "Build the mental model. Understand what an LLM actually is before touching any API.",
    color: "#534AB7",
    accent: "purple",
  },
  {
    id: 2,
    title: "Giving the Brain Capabilities",
    episodeRange: "E08-E13",
    tagline:
      "The model is ready. Now give it tools, memory, and external knowledge.",
    color: "#0F6E56",
    accent: "green",
    unlockAfter: "E07",
  },
  {
    id: 3,
    title: "From Capability to Agency",
    episodeRange: "E14-E19",
    tagline:
      "Individual tools become agents. Agents become multi-agent systems that can reason and act.",
    color: "#BA7517",
    accent: "amber",
    unlockAfter: "E13",
  },
  {
    id: 4,
    title: "Shipping to Production",
    episodeRange: "E20-E22",
    tagline:
      "Everything you've built needs to work in the real world.",
    color: "#993C1D",
    accent: "blue",
    unlockAfter: "E19",
  },
];

export const courseSessions: CourseSession[] = [
  {
    id: "E01",
    slug: "how-llms-work",
    title: "How LLMs Work",
    module: 1,
    prevRecap:
      "We are opening the course at the source. Before tools, prompts, or agents, we need the machine-room view of what an LLM actually is. This session starts the story by replacing mystery with mechanism.",
    dependsOn: [],
    leadsTo: ["E02"],
    status: "published",
  },
  {
    id: "E02",
    slug: "tokens-context-window",
    title: "Tokens & Context Window",
    module: 1,
    prevRecap:
      "Last time, we established that the model is a prediction system rather than a magic thinker. Now we zoom into the raw material it sees: tokens, ordering, and the finite context window that shapes every response.",
    dependsOn: ["E01"],
    leadsTo: ["E03"],
    status: "published",
  },
  {
    id: "E03",
    slug: "embeddings",
    title: "Embeddings",
    module: 1,
    prevRecap:
      "We just saw that the model works over tokens inside a bounded context. The next question is how those tokens become something the network can compare, cluster, and reason over numerically.",
    dependsOn: ["E01", "E02"],
    leadsTo: ["E04", "E08"],
    status: "published",
  },
  {
    id: "E04",
    slug: "transformer-attention",
    title: "Transformer & Attention",
    module: 1,
    prevRecap:
      "Tokens alone are not enough; the model must relate them to one another. This session moves from representation into architecture and shows how attention turns a sequence into contextual understanding.",
    dependsOn: ["E02", "E03"],
    leadsTo: ["E05"],
    status: "published",
  },
  {
    id: "E05",
    slug: "training-and-fine-tuning",
    title: "Training & Fine-tuning",
    module: 1,
    prevRecap:
      "We have looked inside the network at inference time, but the network did not appear fully formed. Now we follow the story backward into training to see how these behaviors get baked into weights.",
    dependsOn: ["E03", "E04"],
    leadsTo: ["E06", "E07"],
    status: "published",
  },
  {
    id: "E06",
    slug: "prompting-foundations",
    title: "Prompting Foundations",
    module: 1,
    prevRecap:
      "Once you understand how the model was trained, prompting stops feeling like superstition. This session translates the internal mechanics into practical input patterns that make the model easier to steer.",
    dependsOn: ["E01", "E02", "E05"],
    leadsTo: ["E07", "E08"],
    status: "published",
  },
  {
    id: "E07",
    slug: "evals",
    title: "Evals",
    module: 1,
    prevRecap:
      "We now know what the model is and how to talk to it. The last step in Module 1 is learning how to tell whether it is actually doing the job well instead of trusting vibes and demos.",
    dependsOn: ["E05", "E06"],
    leadsTo: ["E08"],
    status: "published",
  },
  {
    id: "E08",
    slug: "rag",
    title: "RAG",
    module: 2,
    prevRecap:
      "Module 1 gave us the model's inner logic and a way to evaluate it. Now we start giving that brain external knowledge so it can answer with fresher, grounded information instead of relying only on training-time memory.",
    dependsOn: ["E03", "E07"],
    leadsTo: ["E09", "E10"],
    status: "upcoming",
  },
  {
    id: "E09",
    slug: "tool-use",
    title: "Tool Use",
    module: 2,
    prevRecap:
      "RAG extends what the model knows. Tool use extends what it can do. This session shifts the story from retrieval to action and shows how the model reaches outside itself to get work done.",
    dependsOn: ["E06", "E08"],
    leadsTo: ["E10", "E11"],
    status: "upcoming",
  },
  {
    id: "E10",
    slug: "agent-memory",
    title: "Agent Memory",
    module: 2,
    prevRecap:
      "With retrieval and tools in place, the next bottleneck is continuity. We now ask how a system remembers enough about the task, the user, and prior actions to behave coherently over time.",
    dependsOn: ["E08", "E09"],
    leadsTo: ["E11", "E12"],
    status: "upcoming",
  },
  {
    id: "E11",
    slug: "mcp",
    title: "MCP",
    module: 2,
    prevRecap:
      "We have been adding capabilities one by one. MCP changes the story by standardizing how those capabilities are exposed so models and agents can connect to tools with less custom glue.",
    dependsOn: ["E09", "E10"],
    leadsTo: ["E12", "E13"],
    status: "upcoming",
  },
  {
    id: "E12",
    slug: "agent-skills",
    title: "Agent Skills",
    module: 2,
    prevRecap:
      "Capabilities are useful, but they become far more powerful when packaged into reusable behaviors. This session turns raw tools and memory into higher-level skills that agents can repeatedly apply.",
    dependsOn: ["E10", "E11"],
    leadsTo: ["E13", "E14"],
    status: "upcoming",
  },
  {
    id: "E13",
    slug: "context-and-context-engineering",
    title: "Context & Context Engineering",
    module: 2,
    prevRecap:
      "By now the agent can retrieve, call tools, remember, and reuse skills. The final lesson in this module is about orchestrating all of that context so the right information is present at the right moment.",
    dependsOn: ["E08", "E11", "E12"],
    leadsTo: ["E14"],
    status: "upcoming",
  },
  {
    id: "E14",
    slug: "ai-agents",
    title: "AI Agents",
    module: 3,
    prevRecap:
      "Module 2 gave the model capabilities. Module 3 asks what happens when those capabilities are coordinated toward goals. This is where the story crosses the line from component design into agency.",
    dependsOn: ["E09", "E10", "E13"],
    leadsTo: ["E15", "E16"],
    status: "upcoming",
  },
  {
    id: "E15",
    slug: "ai-workflows",
    title: "AI Workflows",
    module: 3,
    prevRecap:
      "An agent is more than a chat loop with a tool call. To make behavior reliable, we need structure. This session shows how repeatable workflows turn loose capabilities into systems that can be reasoned about.",
    dependsOn: ["E14"],
    leadsTo: ["E16", "E17"],
    status: "upcoming",
  },
  {
    id: "E16",
    slug: "agent-memory-types",
    title: "Agent Memory Types",
    module: 3,
    prevRecap:
      "We introduced memory earlier as a capability. Now we revisit it from an agent-systems perspective and separate short-term, episodic, semantic, and working memory roles inside longer-running workflows.",
    dependsOn: ["E10", "E14", "E15"],
    leadsTo: ["E17", "E18"],
    status: "upcoming",
  },
  {
    id: "E17",
    slug: "human-in-the-loop",
    title: "Human-in-the-Loop",
    module: 3,
    prevRecap:
      "Agency gets more useful as it gets more autonomous, but also more risky. This session introduces deliberate human checkpoints so real people stay in control when the stakes rise.",
    dependsOn: ["E15", "E16"],
    leadsTo: ["E18", "E19"],
    status: "upcoming",
  },
  {
    id: "E18",
    slug: "guardrails-and-safety",
    title: "Guardrails & Safety",
    module: 3,
    prevRecap:
      "Human review is one layer of control, but not the only one. We now design the boundaries, constraints, and failure responses that keep agent behavior aligned with real-world expectations.",
    dependsOn: ["E07", "E17"],
    leadsTo: ["E19", "E20"],
    status: "upcoming",
  },
  {
    id: "E19",
    slug: "multi-agent-systems",
    title: "Multi-Agent Systems",
    module: 3,
    prevRecap:
      "So far we have treated the agent as a single actor. This session expands the cast and explores what changes when multiple specialized agents coordinate, delegate, and collaborate.",
    dependsOn: ["E14", "E15", "E18"],
    leadsTo: ["E20"],
    status: "upcoming",
  },
  {
    id: "E20",
    slug: "observability",
    title: "Observability",
    module: 4,
    prevRecap:
      "We have reached production territory. Once agents and workflows leave the lab, we need visibility into what happened, why it happened, and where the system is failing.",
    dependsOn: ["E07", "E19"],
    leadsTo: ["E21", "E22"],
    status: "upcoming",
  },
  {
    id: "E21",
    slug: "cost-and-latency-optimization",
    title: "Cost & Latency Optimization",
    module: 4,
    prevRecap:
      "Observability tells us where the pain is. This session turns that visibility into practical tradeoffs around speed, budget, model choice, retrieval size, and system architecture.",
    dependsOn: ["E20"],
    leadsTo: ["E22"],
    status: "upcoming",
  },
  {
    id: "E22",
    slug: "deployment-patterns",
    title: "Deployment Patterns",
    module: 4,
    prevRecap:
      "The course closes by pulling everything together. We look at deployment patterns that make these systems operable, maintainable, and ready for the messy conditions of the real world.",
    dependsOn: ["E19", "E20", "E21"],
    leadsTo: [],
    status: "upcoming",
  },
];
