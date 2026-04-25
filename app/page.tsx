import { HomeCourseGateway } from "@/components/HomeCourseGateway";
import { Container } from "@/components/ui/container";
import { GridBackground } from "@/components/ui/grid-background";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <GridBackground />
      <Container className="relative z-10 space-y-10 pb-20 pt-12 xl:pr-20">
        <HomeCourseGateway />
      </Container>
    </main>
  );
}
