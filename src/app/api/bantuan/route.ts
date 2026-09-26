import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { name, subject, message, replyTo } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subjek dan Pesan harus diisi." },
        { status: 400 }
      );
    }

    const userEmail = session?.user?.email || replyTo || "No Email Provided";
    const userName = session?.user?.name || name || "Anonymous";

    // Validate email configuration
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Missing GMAIL_EMAIL or GMAIL_APP_PASSWORD env variables");
      return NextResponse.json(
        { error: "Konfigurasi server email belum diatur (GMAIL_EMAIL / GMAIL_APP_PASSWORD)." },
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
      from: `"${userName}" <${process.env.GMAIL_EMAIL}>`, // Gunakan email terautentikasi sebagai pengirim
      to: process.env.GMAIL_EMAIL, // Kirim ke inbox admin (Gmail sendiri)
      replyTo: userEmail, // Supaya kalau dibalas langsung masuk ke email user
      subject: `[Bantuan Ngonten Pake AI] ${subject}`,
      text: `Dari: ${userName} (${userEmail})\n\nPesan:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">Pesan Bantuan Baru</h2>
          <p><strong>Dari:</strong> ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>)</p>
          <p><strong>Subjek:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <div style="white-space: pre-wrap; color: #555;">${message}</div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email berhasil dikirim!" }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pesan. Pastikan konfigurasi email sudah benar." },
      { status: 500 }
    );
  }
}
