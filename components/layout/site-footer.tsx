import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-background-elevated">
      <Container className="flex flex-col gap-4 py-6 text-base text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">The Software Story</p>
          <p className="text-sm text-muted-foreground">
            Copyright (c) Youssef Fathy. All rights reserved.
          </p>
        </div>
        <p>
          AI Agent Story, built as a persistent journey from fundamentals to production.
        </p>
      </Container>
    </footer>
  );
}
