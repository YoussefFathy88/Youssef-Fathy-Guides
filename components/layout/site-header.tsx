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
            JG
          </div>
          <div>
            <Link href="/" className="text-base font-semibold text-white">
              Joee's GenAI from the Ground Up
            </Link>
            <p className="text-sm text-slate-400">
              Story-driven course website
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
