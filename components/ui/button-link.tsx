import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5",
        variant === "primary"
          ? "border border-sky-400/20 bg-sky-500/15 text-sky-50 shadow-[0_20px_45px_-24px_rgba(96,165,250,0.75)] hover:border-sky-300/35 hover:bg-sky-500/22"
          : "border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10",
        className,
      )}
    >
      {children}
    </Link>
  );
}
