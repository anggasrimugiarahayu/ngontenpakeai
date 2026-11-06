// src/app/(app)/ruang-automation/flow-builder/FlowBuilderClient.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { InstagramFlowRuleStudio } from "../instagram/InstagramFlowRuleStudio";
import { saveAutomationRuleAction } from "@/app/actions/instagramAutomation";

interface FlowBuilderClientProps {
  initialRule: any | null;
  account: any;
  currentAgent: any;
  feedPosts: any[];
}

export function FlowBuilderClient({
  initialRule,
  account,
  currentAgent,
  feedPosts,
}: FlowBuilderClientProps) {
  const router = useRouter();

  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const isAccountLinked = Boolean(currentAgent?.isLinked || account?.isLinked);

  const handleSaveRule = async (payload: any, isSetLive: boolean) => {
    try {
      const res = await saveAutomationRuleAction(payload);
      return res as any;
    } catch (err: any) {
      return { success: false, error: err.message || "Gagal menyimpan aturan" };
    }
  };

  const handleBackToAutomation = () => {
    const agentIdParam = currentAgent?.id || account?.id;
    if (agentIdParam) {
      router.push(`/ruang-automation?platform=instagram&agentId=${encodeURIComponent(agentIdParam)}`);
    } else {
      router.push("/ruang-automation?platform=instagram");
    }
  };

  const handleGoToBasicBuilder = (rule?: any) => {
    const agentIdParam = currentAgent?.id || account?.id;
    const ruleId = rule?.id || initialRule?.id;
    if (ruleId && agentIdParam) {
      router.push(
        `/ruang-automation?platform=instagram&agentId=${encodeURIComponent(
          agentIdParam
        )}&editRuleId=${encodeURIComponent(ruleId)}`
      );
    } else if (agentIdParam) {
      router.push(`/ruang-automation?platform=instagram&agentId=${encodeURIComponent(agentIdParam)}&newRule=basic`);
    } else {
      router.push("/ruang-automation?platform=instagram");
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[130] animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold text-white flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-emerald-600"
                : toast.type === "error"
                ? "bg-rose-600"
                : "bg-blue-600"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <InstagramFlowRuleStudio
        initialRule={initialRule}
        agentAccount={account}
        currentAgent={currentAgent}
        feedPosts={feedPosts}
        isAccountLinked={isAccountLinked}
        onSaveRule={handleSaveRule}
        onBackToAutomation={handleBackToAutomation}
        onGoToBasicBuilder={handleGoToBasicBuilder}
        showToast={showToast}
      />
    </div>
  );
}
