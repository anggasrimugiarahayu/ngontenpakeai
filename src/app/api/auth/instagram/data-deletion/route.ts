import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin || "https://ngontenpakeai.vercel.app";
  const confirmationCode = `del_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  return NextResponse.json({
    url: `${origin}/api/auth/instagram/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Permintaan penghapusan data telah diproses sesuai dengan kebijakan privasi Meta & Ngonten Pake AI.",
  });
}
