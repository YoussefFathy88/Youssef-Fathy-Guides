import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SessionBadge } from "@/components/ui/session-badge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-lg font-semibold text-sky-200">
            SA
          </div>
          <div className="leading-tight">
            <Link href="/" className="text-base font-semibold text-white">
              The Software Architect
            </Link>
            <p className="text-xs text-slate-500">
              Copyright © Youssef Fathy. All rights reserved.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <SessionBadge tone="purple">App Router + Tailwind</SessionBadge>
          <ButtonLink href="/library" variant="secondary">
            Library
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
