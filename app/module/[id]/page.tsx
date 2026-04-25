import { redirect } from "next/navigation";

type ModulePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ModulePage({ params, searchParams }: ModulePageProps) {
  await params;
  await searchParams;

  redirect("/");
}
