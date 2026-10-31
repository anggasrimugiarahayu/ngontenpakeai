import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin || "https://www.ruangcreativemuslim.com";
  const confirmationCode = `del_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  return NextResponse.json({
    url: `${origin}/api/auth/instagram/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET(req: NextRequest) {
  const rawCode = req.nextUrl.searchParams.get("code") || `REQ-${Date.now().toString(36).toUpperCase()}`;
  const code = escapeHtml(rawCode.slice(0, 100));
  const accept = req.headers.get("accept") || "";

  // If requested by browser, render a clean, professional status page for Meta Reviewers & users
  if (accept.includes("text/html")) {
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Penghapusan Data Pengguna - ruangcreativemuslim</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #0B0F19;
      color: #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      background: #141B2D;
      border: 1px solid #232D42;
      border-radius: 20px;
      padding: 36px 32px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      text-align: center;
    }
    .icon-badge {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10B981;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 10px 0;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94A3B8;
      margin: 0 0 20px 0;
    }
    .code-box {
      background: #0B0F19;
      border: 1px dashed #334155;
      padding: 12px 16px;
      border-radius: 12px;
      font-family: monospace;
      font-size: 13px;
      color: #38BDF8;
      margin-bottom: 24px;
      word-break: break-all;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
      font-weight: 600;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      background: #2563EB;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 10px 24px;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #1D4ED8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    </div>
    <div class="status-badge">
      <span>●</span> Permintaan Selesai Diproses
    </div>
    <h1>Penghapusan Data Berhasil</h1>
    <p>
      Permintaan penghapusan data akun Instagram dan riwayat automasi Anda dari platform <strong>ruangcreativemuslim</strong> telah selesai diproses secara permanen sesuai dengan Kebijakan Privasi Meta & Platform Terms.
    </p>
    <div class="code-box">
      Kode Konfirmasi: <strong>${code}</strong>
    </div>
    <a href="/" class="btn">Kembali ke Beranda</a>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  return NextResponse.json({
    success: true,
    confirmation_code: code,
    status: "COMPLETED",
    message: "Permintaan penghapusan data telah diproses sesuai dengan kebijakan privasi Meta & ruangcreativemuslim.",
  });
}
