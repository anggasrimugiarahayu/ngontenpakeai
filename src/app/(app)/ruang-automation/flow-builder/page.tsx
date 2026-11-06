// src/app/(app)/ruang-automation/flow-builder/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Visual Flow Builder | Ruang Automation",
  description: "Susun alur diagram visual automasi Instagram ala ManyChat.",
};

export default async function FlowBuilderPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?redirect=${encodeURIComponent("/ruang-automation/flow-builder")}`);
  }

  const agentId = typeof resolvedParams.agentId === "string" ? resolvedParams.agentId : undefined;
  const ruleId = typeof resolvedParams.ruleId === "string" ? resolvedParams.ruleId : undefined;

  const targetUrl = `/ruang-automation?platform=instagram${
    agentId ? `&agentId=${encodeURIComponent(agentId)}` : ""
  }&mode=flow${ruleId ? `&ruleId=${encodeURIComponent(ruleId)}` : ""}`;
  
  redirect(targetUrl);
}
