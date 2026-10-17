import { NextRequest, NextResponse } from "next/server";
import { resolveAccountForEntry } from "./handlers/webhookHelpers";
import { processPendingFollowUps } from "./handlers/followUpHandler";
import { handleCommentEvent } from "./handlers/commentHandler";
import { handlePostbackEvent } from "./handlers/postbackHandler";
import { handleStoryEvent } from "./handlers/storyHandler";
import { handleIncomingDmEvent } from "./handlers/dmHandler";

/**
 * 1. GET Handler: Verifikasi Meta Webhook
 * Meta Developer Dashboard memvalidasi endpoint ini menggunakan hub.challenge & hub.verify_token
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const expectedToken =
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN ||
    process.env.META_WEBHOOK_VERIFY_TOKEN ||
    "ruang_creative_muslim_secret_2026";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("✅ [Meta Webhook] Verifikasi Berhasil! Challenge:", challenge);
    return new Response(challenge || "", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  console.warn("⚠️ [Meta Webhook] Verifikasi Gagal! Token tidak cocok.");
  return new Response("Forbidden", { status: 403 });
}

/**
 * 2. POST Handler: Menerima Real-Time Event Komentar, Live, Story, & DM dari Meta Graph API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verifikasi objek webhook berasal dari Instagram
    if (body.object !== "instagram") {
      return new NextResponse("NOT_INSTAGRAM_EVENT", { status: 200 });
    }

    const entries = body.entry || [];
    const origin =
      req.nextUrl.origin && !req.nextUrl.origin.includes("localhost")
        ? req.nextUrl.origin
        : "https://ruangcreativemuslim-seven.vercel.app";

    // Proses setiap entry secara terisolasi per modul
    for (const entry of entries) {
      const igAccountId = String(entry.id || "");
      console.log(`📡 [Meta Webhook] Received entry for account ID: ${igAccountId}`);

      const account = await resolveAccountForEntry(igAccountId);
      if (!account || !account.accessToken) {
        console.warn(`⚠️ [Meta Webhook] No active connected account found for ID: ${igAccountId}`);
        continue;
      }

      // =========================================================================
      // A. EVENT: KOMENTAR MASUK (field === "comments" atau "live_comments")
      // =========================================================================
      const changes = entry.changes || [];
      for (const change of changes) {
        if ((change.field === "comments" || change.field === "live_comments") && change.value) {
          await handleCommentEvent(change, account, origin);
        }
      }

      // =========================================================================
      // B. EVENT: INTERAKSI MESSAGING (Postback, Story Reply/Mention, DM Masuk)
      // =========================================================================
      const messagingList = entry.messaging || [];
      for (const msgEvent of messagingList) {
        const senderId = String(msgEvent.sender?.id || "");
        const msgText = (msgEvent.message?.text || "").trim();
        const postbackPayload =
          msgEvent.postback?.payload || msgEvent.message?.quick_reply?.payload;

        if (!senderId || senderId === account.instagramId || senderId === account.pageId) {
          continue;
        }

        // 1. Postback / Quick Reply (Tombol Pesan Pembuka, Cek Follow, Kirim Teks, Quick Reply)
        if (postbackPayload) {
          await handlePostbackEvent(account, origin, senderId, msgText, postbackPayload);
          continue;
        }

        // 2. Interaksi Story (Story Reply / Reaksi Story / Story Mention)
        const storyHandled = await handleStoryEvent(msgEvent, account, origin, senderId, msgText);
        if (storyHandled) {
          continue;
        }

        // 3. Pesan Teks DM Masuk (Validasi Ask for Contact & Otomasi Pesan DM)
        if (msgText && !msgEvent.message?.is_echo) {
          await handleIncomingDmEvent(msgEvent, account, origin, senderId, msgText);
        }
      }

      // C. Jalankan pemeriksaan pesan Follow Up yang sudah jatuh tempo secara non-blocking
      processPendingFollowUps(account, origin).catch(() => {});
    }

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error: any) {
    console.error("❌ [Meta Webhook Error]:", error);
    // Meta mewajibkan respon HTTP 200 agar webhook tidak di-retry berulang kali jika ada error internal
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  }
}
