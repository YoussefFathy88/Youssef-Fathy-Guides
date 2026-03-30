import type { ReactNode } from "react";

import type { AccentTone } from "@/lib/session-types";
import { cn, getAccentClasses } from "@/lib/utils";

type SessionBadgeProps = {
  children: ReactNode;
  tone?: AccentTone;
  className?: string;
};

export function SessionBadge({
  children,
  tone = "blue",
  className,
}: SessionBadgeProps) {
  const accent = getAccentClasses(tone);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.24em]",
        accent.badge,
        className,
      )}
    >
      {children}
    </span>
  );
}
