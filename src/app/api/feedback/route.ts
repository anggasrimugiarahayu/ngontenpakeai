import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { improveText, featureText } = body;

    const userEmail = session?.user?.email || "Anonymous";
    const userName = session?.user?.name || "Anonymous User";

    // Validate email configuration
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Missing GMAIL_EMAIL or GMAIL_APP_PASSWORD env variables");
      return NextResponse.json(
        { error: "Konfigurasi server email belum diatur." },
        { status: 500 }
      );
    }

    // Setup Nodemailer transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${userName}" <${process.env.GMAIL_EMAIL}>`,
      to: process.env.GMAIL_EMAIL,
      replyTo: userEmail !== "Anonymous" ? userEmail : undefined,
      subject: `[Feedback ruangcreativemuslim] Masukan Baru dari ${userName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #f97316;">Feedback Baru 🚀</h2>
          <p><strong>Dari:</strong> ${userName} (${userEmail})</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3 style="color: #333;">1. Apa yang bisa diimprove?</h3>
          <p style="white-space: pre-wrap; color: #555;">${improveText || "-"}</p>
          <br/>
          <h3 style="color: #333;">2. Fitur yang diharapkan?</h3>
          <p style="white-space: pre-wrap; color: #555;">${featureText || "-"}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending feedback email:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pesan." },
      { status: 500 }
    );
  }
}
