import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <Container className="flex flex-col gap-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-white">The Software Architect</p>
          <p className="text-xs text-slate-500">Copyright © Youssef Fathy. All rights reserved.</p>
        </div>
        <p>Built as a persistent course journey from fundamentals to production.</p>
      </Container>
    </footer>
  );
}
