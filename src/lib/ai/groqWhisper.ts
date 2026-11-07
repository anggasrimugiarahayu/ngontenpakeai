/**
 * Groq Whisper Transcription Helper
 * Transcribes audio and video files (mp3, mp4, m4a, wav, webm) in sub-second speed.
 */

export interface TranscribeGroqOptions {
  base64Data: string;
  mimeType: string;
  apiKey: string;
  language?: string; // Optional: 'id' for Indonesian, or leave empty for auto-detect
}

export async function transcribeWithGroqWhisper(options: TranscribeGroqOptions): Promise<string> {
  const { base64Data, mimeType, apiKey, language = 'id' } = options;

  if (!apiKey) {
    throw new Error('Groq API Key tidak ditemukan untuk transkripsi audio/video.');
  }

  const buffer = Buffer.from(base64Data, 'base64');
  const ext = mimeType.split('/')[1]?.split(';')[0] || 'mp4';
  const fileName = `media-${Date.now()}.${ext}`;

  const blob = new Blob([buffer], { type: mimeType });
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('response_format', 'json');
  formData.append('temperature', '0');
  if (language) {
    formData.append('language', language);
  }

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || `Groq Whisper API error (${res.status})`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const transcript = data?.text?.trim() || '';
  if (!transcript) {
    throw new Error('Groq Whisper tidak mendeteksi suara atau ucapan di dalam media ini.');
  }

  return transcript;
}
