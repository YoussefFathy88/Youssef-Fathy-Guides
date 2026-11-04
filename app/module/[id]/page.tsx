import { redirect } from "next/navigation";

import { getModules } from "@/lib/course";

type ModulePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return getModules().map((module) => ({ id: String(module.id) }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  await params;

  redirect("/");
}
