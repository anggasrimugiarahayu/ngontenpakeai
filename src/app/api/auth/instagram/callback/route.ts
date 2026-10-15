import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

// Defensive Prisma accessor
let fallbackPrisma: PrismaClient | null = null;
function getDb(): PrismaClient {
  if (prisma && (prisma as any).instagramAccount) {
    return prisma;
  }
  if (!fallbackPrisma) {
    fallbackPrisma = new PrismaClient();
  }
  return fallbackPrisma;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const session = await auth();

  if (!session?.user?.id) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", "/ruang-automation");
    return NextResponse.redirect(loginUrl);
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");

  // If user cancelled on Meta login
  if (error || errorReason) {
    console.warn("Meta OAuth cancelled or error:", error, errorReason, errorDescription);
    const redirectUrl = new URL("/ruang-automation", origin);
    redirectUrl.searchParams.set("error", "cancelled");
    redirectUrl.searchParams.set("platform", "instagram");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL("/ruang-automation", origin);
    redirectUrl.searchParams.set("error", "no_code");
    redirectUrl.searchParams.set("platform", "instagram");
    return NextResponse.redirect(redirectUrl);
  }

  // Verify CSRF state token
  const storedState = request.cookies.get("meta_oauth_state")?.value;
  if (process.env.NODE_ENV === "production" && (!storedState || storedState !== state)) {
    console.error("Meta OAuth state mismatch. Stored:", storedState, "Received:", state);
    const redirectUrl = new URL("/ruang-automation", origin);
    redirectUrl.searchParams.set("error", "invalid_state");
    redirectUrl.searchParams.set("platform", "instagram");
    return NextResponse.redirect(redirectUrl);
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID || process.env.META_APP_ID || "1136526275791179";
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || process.env.META_APP_SECRET || "8f1fd37c9ffb8060320c89f03243fc4c";

  if (!clientId || !clientSecret) {
    console.error("Missing INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET in environment");
    const redirectUrl = new URL("/ruang-automation", origin);
    redirectUrl.searchParams.set("error", "missing_credentials");
    redirectUrl.searchParams.set("platform", "instagram");
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${origin}/api/auth/instagram/callback`;

  const cleanCode = (code || "").replace(/#_$/, "");

  try {
    let shortLivedToken: string | null = null;
    let fallbackIgUserId: string | null = null;

    // 1. Attempt exchange via api.instagram.com (Direct Instagram Business Login)
    try {
      const formData = new URLSearchParams();
      formData.append("client_id", clientId);
      formData.append("client_secret", clientSecret);
      formData.append("grant_type", "authorization_code");
      formData.append("redirect_uri", redirectUri);
      formData.append("code", cleanCode);

      const igRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const igData = await igRes.json();
      console.log("Instagram token exchange response:", {
        has_token: !!igData.access_token,
        user_id: igData.user_id,
        error_message: igData.error_message,
        error_type: igData.error_type,
      });

      if (igData.access_token) {
        shortLivedToken = igData.access_token;
        if (igData.user_id) {
          fallbackIgUserId = String(igData.user_id);
        }
      } else {
        console.warn("api.instagram.com token exchange response:", igData);
      }
    } catch (igErr) {
      console.warn("Error in api.instagram.com exchange:", igErr);
    }

    // Fallback: If api.instagram.com didn't return token, try graph.facebook.com
    if (!shortLivedToken) {
      try {
        const tokenUrl = `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&client_secret=${clientSecret}&code=${cleanCode}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          shortLivedToken = tokenData.access_token;
        }
      } catch (fbErr) {
        console.error("Facebook token exchange fallback error:", fbErr);
      }
    }

    if (!shortLivedToken) {
      const redirectUrl = new URL("/ruang-automation", origin);
      redirectUrl.searchParams.set("error", "Gagal menukarkan kode login Instagram");
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Exchange for Long-Lived Instagram Token (60-day validity)
    let userToken = shortLivedToken;
    try {
      const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`;
      const longLivedRes = await fetch(longLivedUrl);
      const longLivedData = await longLivedRes.json();
      if (longLivedData.access_token) {
        userToken = longLivedData.access_token;
      }
    } catch (llErr) {
      console.warn("Could not exchange for long-lived Instagram token:", llErr);
    }

    // 3. Fetch User Profile from Instagram Graph API
    let targetIgAccount: {
      id: string;
      username: string;
      name?: string;
      profile_picture_url?: string;
    } | null = null;
    let targetAccessToken = userToken;

    try {
      const directIgRes = await fetch(
        `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,account_type&access_token=${userToken}`
      );
      if (directIgRes.ok) {
        const directData = await directIgRes.json();
        if (directData.id || directData.username) {
          targetIgAccount = {
            id: String(directData.id || fallbackIgUserId || Date.now()),
            username: directData.username || "instagram_user",
            name: directData.name || (directData.username ? `@${directData.username}` : "Instagram Creator"),
            profile_picture_url: directData.profile_picture_url || null,
          };
        }
      }
    } catch (directErr) {
      console.warn("Direct Instagram /me fetch failed:", directErr);
    }

    // Fallback: Check by user ID if /me didn't yield full info
    if ((!targetIgAccount || !targetIgAccount.username) && fallbackIgUserId) {
      try {
        const userRes = await fetch(
          `https://graph.instagram.com/v21.0/${fallbackIgUserId}?fields=id,username,name,profile_picture_url&access_token=${userToken}`
        );
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.id || userData.username) {
            targetIgAccount = {
              id: String(userData.id || fallbackIgUserId),
              username: userData.username || targetIgAccount?.username || "instagram_user",
              name: userData.name || userData.username || targetIgAccount?.name || "Instagram Creator",
              profile_picture_url: userData.profile_picture_url || targetIgAccount?.profile_picture_url || null,
            };
          }
        }
      } catch (userErr) {
        console.warn("Fallback Instagram user by ID fetch failed:", userErr);
      }
    }

    // Fallback: If not found in direct /me, check via Facebook Page accounts
    if (!targetIgAccount) {
      try {
        const accountsUrl = `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${userToken}`;
        const accountsRes = await fetch(accountsUrl);
        const accountsData = await accountsRes.json();
        if (Array.isArray(accountsData.data)) {
          for (const page of accountsData.data) {
            if (page.instagram_business_account) {
              targetIgAccount = page.instagram_business_account;
              if (page.access_token) {
                targetAccessToken = page.access_token;
              }
              break;
            }
          }
        }
      } catch (fbPageErr) {
        console.warn("Facebook page fetch failed:", fbPageErr);
      }
    }

    // If still no Instagram account found
    if (!targetIgAccount || !targetIgAccount.id) {
      const redirectUrl = new URL("/ruang-automation", origin);
      redirectUrl.searchParams.set("error", "no_business_account");
      redirectUrl.searchParams.set("platform", "instagram");
      return NextResponse.redirect(redirectUrl);
    }

    const db = getDb();
    const userId = session.user.id;
    const instagramId = targetIgAccount.id;
    const username = targetIgAccount.username;
    const name = targetIgAccount.name || (username ? `@${username}` : "Instagram Creator");
    const profilePicUrl = targetIgAccount.profile_picture_url || null;

    const targetAgentIdCookie = request.cookies.get("meta_oauth_agent_id")?.value;
    const targetAgentId =
      targetAgentIdCookie &&
      targetAgentIdCookie !== "[object Object]" &&
      targetAgentIdCookie !== "undefined" &&
      targetAgentIdCookie !== "null"
        ? targetAgentIdCookie
        : null;

    let boundAgentId = targetAgentId;
    let existingAgent: any = null;

    // 1. Coba cari agen yang ditargetkan secara eksplisit oleh user
    if (targetAgentId) {
      existingAgent = await (db as any).instagramAccount.findFirst({
        where: { id: targetAgentId, userId },
      });
    }

    // 2. Jika tidak ditemukan atau tidak ada cookie, cek apakah ada agen milik user yang cocok dengan instagramId ini
    if (!existingAgent) {
      existingAgent = await (db as any).instagramAccount.findFirst({
        where: {
          userId,
          OR: [
            { instagramId },
            { instagramId: { startsWith: `unlinked_${targetAgentId || ""}` } },
          ],
        },
      });
    }

    // 3. Fallback: jika agen baru saja diputus koneksinya (unlinked_) atau berstatus pending, sambungkan kembali ke agen tersebut
    if (!existingAgent) {
      existingAgent = await (db as any).instagramAccount.findFirst({
        where: {
          userId,
          OR: [
            { instagramId: { startsWith: "unlinked_" } },
            { instagramId: { startsWith: "pending_" } },
          ],
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (existingAgent) {
      // Perbarui agen yang sudah ada: pertahankan nama agen kustom, simpan kredensial Meta baru, aktifkan kembali
      await (db as any).instagramAccount.update({
        where: { id: existingAgent.id },
        data: {
          instagramId,
          username,
          name: existingAgent.name && !existingAgent.name.startsWith("Agen @") ? existingAgent.name : name,
          profilePicUrl,
          accessToken: targetAccessToken,
          isActive: true,
        },
      });
      boundAgentId = existingAgent.id;
    } else {
      // 4. Hanya buat agen baru jika user belum memiliki agen sama sekali
      const created = await (db as any).instagramAccount.create({
        data: {
          userId,
          instagramId,
          username,
          name: name || `Agen @${username}`,
          profilePicUrl,
          accessToken: targetAccessToken,
          isActive: true,
        },
      });
      boundAgentId = created.id;
    }

    // 6. Invalidate caches
    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${userId}`);
    revalidatePath("/ruang-automation");

    // 7. Redirect back to Ruang Automation with success flag
    const redirectUrl = new URL("/ruang-automation", origin);
    redirectUrl.searchParams.set("connected", "true");
    redirectUrl.searchParams.set("username", username);
    redirectUrl.searchParams.set("platform", "instagram");
    if (boundAgentId) {
      redirectUrl.searchParams.set("agentId", boundAgentId);
    }

    const response = NextResponse.redirect(redirectUrl);

    // Clear state cookies
    response.cookies.delete("meta_oauth_state");
    response.cookies.delete("meta_oauth_agent_id");

    return response;
  } catch (err: any) {
    console.error("Meta OAuth callback exception:", err);
    const redirectUrl = new URL("/ruang-automation", origin);
    redirectUrl.searchParams.set("error", encodeURIComponent(err.message || "Terjadi kesalahan server"));
    redirectUrl.searchParams.set("platform", "instagram");
    return NextResponse.redirect(redirectUrl);
  }
}
