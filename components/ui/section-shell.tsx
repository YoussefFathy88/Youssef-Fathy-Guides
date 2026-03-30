import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export function SectionShell({ id, className, children }: SectionShellProps) {
  return (
    <section id={id} className={cn("surface-card p-6 sm:p-8", className)}>
      {children}
    </section>
  );
}
