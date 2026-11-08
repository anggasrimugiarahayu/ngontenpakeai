import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MODEL_CACHE_HEADERS = {
  "Cache-Control": "no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function GET() {
  try {
    const models = await prisma.aiModel.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });
    
    // Fallback if database is empty
    if (models.length === 0) {
      return NextResponse.json([
        { modelId: 'openai/gpt-oss-120b', name: 'Openai120b', isDefault: true, provider: 'groq' },
        { modelId: 'openai/gpt-oss-20b', name: 'Openai 20b', isDefault: false, isFallback: true, provider: 'groq' },
        { modelId: 'qwen/qwen3.8-27b', name: 'Qwen 3.8', isDefault: false, provider: 'groq' },
        { modelId: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', isDefault: false, provider: 'google' },
        { modelId: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', isDefault: false, provider: 'google' },
        { modelId: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', isDefault: false, provider: 'google' }
      ], { headers: MODEL_CACHE_HEADERS });
    }
    
    return NextResponse.json(models, { headers: MODEL_CACHE_HEADERS });
  } catch (error) {
    console.error("Error fetching AI models:", error);
    // Fallback on error
    return NextResponse.json([
      { modelId: 'openai/gpt-oss-120b', name: 'Openai120b', isDefault: true, provider: 'groq' },
      { modelId: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', isDefault: false, provider: 'google' }
    ], { headers: MODEL_CACHE_HEADERS });
  }
}
