import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const session = await auth();
  const origin = request.nextUrl.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!session?.user?.id) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", "/ruang-automation");
    return NextResponse.redirect(loginUrl);
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID || process.env.META_APP_ID || "1136526275791179";
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/ruang-automation?error=missing_instagram_client_id", origin)
    );
  }

  const agentId = request.nextUrl.searchParams.get("agentId");

  // Generate random CSRF state token
  const state = crypto.randomBytes(16).toString("hex");

  // OAuth Redirect URI - must match exactly what's registered in Meta
  let redirectUri = `${origin}/api/auth/instagram/callback`;
  if (process.env.INSTAGRAM_REDIRECT_URI) {
    if (origin.includes("localhost") || !process.env.INSTAGRAM_REDIRECT_URI.includes("localhost")) {
      redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    }
  }

  // Required scopes for Instagram API with Instagram Business Login
  const scopes = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
    "instagram_business_content_publish",
    "instagram_business_manage_insights",
  ].join(",");

  // Official Instagram Business Login OAuth dialog (with native Instagram branding)
  const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;

  const response = NextResponse.redirect(authUrl);

  // Store state in httpOnly cookie for CSRF verification (10 minutes)
  response.cookies.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  if (agentId && agentId !== "[object Object]" && agentId !== "undefined" && agentId !== "null") {
    response.cookies.set("meta_oauth_agent_id", agentId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  } else {
    response.cookies.delete("meta_oauth_agent_id");
  }

  return response;
}
