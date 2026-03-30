import { SessionBadge } from "@/components/ui/session-badge";
import type { AccentTone } from "@/lib/session-types";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  tone?: AccentTone;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  tone = "blue",
}: SectionHeaderProps) {
  return (
    <div className="mb-6 space-y-4 sm:mb-8">
      <SessionBadge tone={tone}>{eyebrow}</SessionBadge>
      <div className="space-y-3">
        <h2 className="max-w-4xl text-balance text-3xl font-semibold sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-3xl text-lg text-slate-300">{description}</p>
      </div>
    </div>
  );
}
