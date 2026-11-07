import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getGroqApiKey } from '@/lib/get-api-key';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file media yang dikirim.' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file media maksimal 50 MB.' }, { status: 400 });
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { groqApiKey: true },
    });

    const activeGroqKey = await getGroqApiKey(userRecord?.groqApiKey);
    if (!activeGroqKey) {
      return NextResponse.json(
        { error: 'Groq API Key tidak ditemukan. Pastikan GROQ_API_KEY terpasang di pengaturan atau .env.' },
        { status: 500 }
      );
    }

    // Forward file directly to Groq Whisper via in-memory stream pass-through (0 Byte disk storage)
    const groqFormData = new FormData();
    groqFormData.append('file', file, file.name || 'audio.wav');
    groqFormData.append('model', 'whisper-large-v3-turbo');
    groqFormData.append('response_format', 'json');
    groqFormData.append('temperature', '0');
    groqFormData.append('language', 'id');

    let groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeGroqKey}`,
      },
      body: groqFormData,
    });

    // Auto-retry with whisper-large-v3 if turbo experiences 503 (high demand) or 429
    if (!groqRes.ok && (groqRes.status === 503 || groqRes.status === 429 || groqRes.status === 404)) {
      const fallbackFormData = new FormData();
      fallbackFormData.append('file', file, file.name || 'audio.wav');
      fallbackFormData.append('model', 'whisper-large-v3');
      fallbackFormData.append('response_format', 'json');
      fallbackFormData.append('temperature', '0');
      fallbackFormData.append('language', 'id');

      groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeGroqKey}`,
        },
        body: fallbackFormData,
      });
    }

    if (!groqRes.ok) {
      const errorJson = await groqRes.json().catch(() => ({}));
      const msg = errorJson?.error?.message || `Groq Whisper gagal memproses audio (${groqRes.status})`;
      return NextResponse.json({ error: msg }, { status: groqRes.status });
    }

    const groqData = await groqRes.json();
    const transcript = (groqData?.text || '').trim();

    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('[ATM Transcribe Error]:', error);
    return NextResponse.json(
      { error: 'Gagal mentranskrip media: ' + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
