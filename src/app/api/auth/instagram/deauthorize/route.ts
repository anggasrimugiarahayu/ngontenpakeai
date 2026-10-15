import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("Instagram deauthorize callback received");
  return NextResponse.json({ success: true, message: "Deauthorized successfully" });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true, message: "Deauthorize endpoint active" });
}
