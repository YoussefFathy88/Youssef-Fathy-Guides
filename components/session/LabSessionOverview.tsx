export interface LabSessionMainConcept {
  title: string;
  description: string;
}

export interface LabSessionOverviewProps {
  goal: string;
  technologies?: string[];
  concepts?: string[];
  mainConcepts?: LabSessionMainConcept[];
}

export function LabSessionOverview({
  goal,
  technologies = [],
  concepts = [],
  mainConcepts = [],
}: LabSessionOverviewProps) {
  const safeTechnologies = Array.isArray(technologies) ? technologies : [];
  const safeConcepts = Array.isArray(concepts) ? concepts : [];
  const safeMainConcepts = Array.isArray(mainConcepts) ? mainConcepts : [];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-white dark:bg-[#0d1117] p-7 shadow-[0_28px_90px_-52px_rgba(34,211,238,0.9)] sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(45,212,191,0.14)_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-gray-200 dark:border-white/10 pb-6">
          <div>
            <p className="font-mono text-base font-semibold uppercase tracking-[0.24em] text-cyan-800 dark:text-cyan-200/70">
              AI Engineering Lab
            </p>
            <h3 className="mt-3 text-4xl font-semibold text-gray-950 dark:text-white sm:text-5xl">
              Session Build Spec
            </h3>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-5 py-2.5 font-mono text-base font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-200">
            Project mode
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-cyan-300/15 bg-cyan-950/20 p-6 sm:p-7">
            <div className="flex items-center gap-3 font-mono text-base font-semibold uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-200/80">
              <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.7)]" />
              Goal
            </div>
            <p className="mt-6 text-2xl leading-10 text-slate-900 dark:text-slate-100">{goal}</p>
          </section>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <SpecList
              label="Technologies and concepts covered"
              items={safeTechnologies}
              tone="violet"
            />
            <SpecList label="Main concepts" items={safeConcepts} tone="amber" />
          </div>
        </div>

        {safeMainConcepts.length > 0 ? (
          <section className="rounded-2xl border border-emerald-300/15 bg-white/60 dark:bg-slate-950/60 p-6 sm:p-7">
            <div className="flex items-center gap-3 font-mono text-base font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200/80">
              <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.65)]" />
              Main concept map
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {safeMainConcepts.map((concept, index) => (
                <article
                  key={`${concept.title}-${index}`}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/[0.035] p-6"
                >
                  <span className="font-mono text-lg font-semibold text-emerald-800 dark:text-emerald-200/70">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <h4 className="mt-4 text-3xl font-semibold text-gray-950 dark:text-white">{concept.title}</h4>
                  <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-300">{concept.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

type SpecListTone = "violet" | "amber";

type SpecListProps = {
  label: string;
  items: string[];
  tone: SpecListTone;
};

const specToneClasses: Record<
  SpecListTone,
  {
    panel: string;
    label: string;
    dot: string;
    chip: string;
  }
> = {
  violet: {
    panel: "border-violet-300/15 bg-violet-950/20",
    label: "text-violet-800 dark:text-violet-200/80",
    dot: "bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.65)]",
    chip: "border-violet-300/20 bg-violet-400/10 text-violet-800 dark:text-violet-100",
  },
  amber: {
    panel: "border-amber-300/15 bg-amber-950/10",
    label: "text-amber-800 dark:text-amber-200/80",
    dot: "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.6)]",
    chip: "border-amber-300/20 bg-amber-400/10 text-amber-800 dark:text-amber-100",
  },
};

function SpecList({ label, items, tone }: SpecListProps) {
  const toneClasses = specToneClasses[tone];

  return (
    <section className={`rounded-2xl border p-6 sm:p-7 ${toneClasses.panel}`}>
      <div
        className={`flex items-center gap-3 font-mono text-base font-semibold uppercase tracking-[0.18em] ${toneClasses.label}`}
      >
        <span className={`h-3 w-3 rounded-full ${toneClasses.dot}`} />
        {label}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-5 py-2.5 font-mono text-base font-medium ${toneClasses.chip}`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
