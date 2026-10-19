import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/85 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white">
            SS
          </div>
          <div className="leading-tight">
            <Link href="/" className="text-lg font-bold text-foreground">
              The Software <span className="text-brand-text">Story</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Copyright (c) Youssef Fathy. All rights reserved.
            </p>
          </div>
        </div>
        <ThemeToggle />
      </Container>
    </header>
  );
}
