import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <Container className="flex flex-col gap-3 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>Joee's GenAI from the Ground Up.</p>
        <p>Built as a persistent course journey from fundamentals to production.</p>
      </Container>
    </footer>
  );
}
