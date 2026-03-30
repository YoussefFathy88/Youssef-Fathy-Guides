import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionShell } from "@/components/ui/section-shell";
import { SessionBadge } from "@/components/ui/session-badge";

export default function NotFound() {
  return (
    <main className="pb-20 pt-14">
      <Container className="xl:pr-20">
        <SectionShell className="px-6 py-8 sm:px-10 sm:py-12">
          <SessionBadge tone="amber">Route Not Found</SessionBadge>
          <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">
            This session has not been added to the library yet.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            The route is ready, but there is no matching session configuration in the
            data layer yet.
          </p>
          <div className="mt-8">
            <ButtonLink href="/">Back to home</ButtonLink>
          </div>
        </SectionShell>
      </Container>
    </main>
  );
}
