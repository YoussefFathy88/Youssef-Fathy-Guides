import type { Route } from "next";
import Link from "next/link";

type LabProject = {
  number: string;
  title: string;
  tags: string[];
  description: string;
  status: string;
  href?: Route;
};

const LAB_PROJECTS: LabProject[] = [
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
    status: "Coming soon",
  },
  {
    number: "03",
    title: "Mini Claude Code",
    tags: ["Code Agents", "CLI", "Agentic Loops"],
    description:
      "Build a minimal coding agent that reads files, writes code, and runs terminal commands.",
    status: "Coming soon",
  },
] as const;

export default function CourseLabSection() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[#0d1117]/90 px-6 py-8 shadow-[0_32px_90px_-52px_rgba(20,184,166,0.75)] sm:px-8 sm:py-10 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(45,212,191,0.16)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-teal-400/8 blur-3xl" />

      <div className="relative z-10 space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            AI Engineering Lab
          </p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Build Real Things
            </h2>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Project-based sessions. Every session ships something.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {LAB_PROJECTS.map((project) => {
            const card = (
              <article className="group relative flex min-h-[23rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_22px_70px_-38px_rgba(34,211,238,0.85)]">
              <div className="absolute inset-y-0 left-0 w-0.5 bg-slate-700/70 transition-colors duration-300 group-hover:bg-cyan-300" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex flex-1 flex-col">
                <span className="font-mono text-6xl font-semibold leading-none text-slate-700/55 transition-colors duration-300 group-hover:text-cyan-200/18">
                  {project.number}
                </span>

                <div className="mt-8 space-y-3">
                  <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                  <p className="text-sm leading-6 text-slate-400">{project.description}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-300/20 bg-cyan-950/30 px-3 py-1 font-mono text-[11px] font-medium text-cyan-100/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <span className={
                    project.href
                      ? "inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100"
                      : "inline-flex rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200"
                  }>
                    {project.status}
                  </span>
                </div>
              </div>
            </article>
            );

            if (project.href) {
              return (
                <Link
                  key={project.title}
                  href={project.href}
                  className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                >
                  {card}
                </Link>
              );
            }

            return <div key={project.title}>{card}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
