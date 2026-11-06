// src/app/(app)/ruang-automation/flow-builder/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getInstagramAutomationDataAction,
  getInstagramFeedMediaAction,
  getInstagramStoriesAction,
} from "@/app/actions/instagramAutomation";
import { getCachedAppUser, getCachedFeatures, getCachedQuotaConfig } from "@/lib/cache";
import prisma from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { FlowBuilderClient } from "./FlowBuilderClient";

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

  const userId = session.user.id;
  const isAdmin = isAdminEmail(session.user.email);

  const [allFeatures, quotaConfig, dbUser] = await Promise.all([
    getCachedFeatures(),
    getCachedQuotaConfig(),
    getCachedAppUser(userId),
  ]);

  const igFeature = allFeatures.find((f) => f.name === "Instagram Automation");
  const isAutoProOnly = igFeature ? igFeature.isProOnly : true;

  let isPro = isAdmin;
  if (!isAdmin && dbUser) {
    const hasAutomation = !!(
      (dbUser as any)?.proAutomationExpiredAt &&
      new Date((dbUser as any).proAutomationExpiredAt) > new Date()
    );
    isPro = hasAutomation || (dbUser as any)?.role === "ADMIN";
  }

  if (isAutoProOnly && !isPro) {
    redirect("/?pricing=true&cat=automation");
  }

  const agentId = typeof resolvedParams.agentId === "string" ? resolvedParams.agentId : undefined;
  const ruleId = typeof resolvedParams.ruleId === "string" ? resolvedParams.ruleId : undefined;

  // Fetch fresh automation data for this agent
  const autoData = await getInstagramAutomationDataAction(agentId);
  const account = autoData.account;
  const agents = autoData.agents || [];
  const currentAgent = agents.find((a: any) => a.id === agentId) || account;

  // If ruleId is passed, find the targeted rule
  let initialRule = null;
  if (ruleId && Array.isArray(autoData.rules)) {
    initialRule = autoData.rules.find((r: any) => r.id === ruleId) || null;
  }

  // Preload feed posts if account is linked
  let feedPosts: any[] = [];
  if (account?.isLinked || currentAgent?.isLinked) {
    try {
      const feedRes = await getInstagramFeedMediaAction(24, currentAgent?.id || account?.id);
      if (feedRes?.success && Array.isArray(feedRes.posts)) {
        feedPosts = feedRes.posts;
      }
    } catch (e) {
      console.warn("Failed to preload feed media in FlowBuilderPage:", e);
    }
  }

  return (
    <FlowBuilderClient
      initialRule={initialRule}
      account={account}
      currentAgent={currentAgent}
      feedPosts={feedPosts}
    />
  );
}
