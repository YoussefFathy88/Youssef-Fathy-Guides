import Link from "next/link";

import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-lg font-semibold text-sky-200">
            SS
          </div>
          <div className="leading-tight">
            <Link href="/" className="text-base font-semibold text-white">
              The Software Story
            </Link>
            <p className="text-xs text-slate-500">
              Copyright (c) Youssef Fathy. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </header>
  );
}
