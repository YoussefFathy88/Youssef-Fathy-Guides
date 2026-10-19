import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/ui/container";

const NAV_LINK =
  "rounded-full px-3 py-2 text-base font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand-text sm:px-4 md:text-lg";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/85 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-3 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="The Software Story home">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white">
            SS
          </span>
          {/* On phones the logo alone stands for the name, so the nav fits. */}
          <span className="hidden leading-tight sm:block">
            <span className="block text-lg font-bold text-foreground">
              The Software <span className="text-brand-text">Story</span>
            </span>
            <span className="block text-sm text-muted-foreground">
              Copyright (c) Youssef Fathy. All rights reserved.
            </span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-3">
          <Link href="/guides" className={NAV_LINK}>
            Guides
          </Link>
          <Link href="/shorts" className={NAV_LINK}>
            Shorts
          </Link>
          <ThemeToggle />
        </nav>
      </Container>
    </header>
  );
}
