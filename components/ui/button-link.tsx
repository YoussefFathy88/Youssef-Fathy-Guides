import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: Route;
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
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-semibold md:text-lg transition duration-300 hover:-translate-y-0.5",
        variant === "primary"
          ? "bg-brand text-white shadow-sm hover:bg-brand-hover"
          : "border border-border-subtle bg-surface text-foreground hover:border-brand hover:text-brand-text",
        className,
      )}
    >
      {children}
    </Link>
  );
}
