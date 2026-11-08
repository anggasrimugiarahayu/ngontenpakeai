import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MODEL_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
  "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  "Vercel-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
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
        { modelId: 'llama-3.3-70b-versatile', name: 'Llama 3.3', isDefault: true, provider: 'groq' },
        { modelId: 'llama-3.1-8b-instant', name: 'Llama 3.1', isDefault: false, provider: 'groq' },
        { modelId: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', isDefault: false, provider: 'groq' },
        { modelId: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', isDefault: false, provider: 'google' },
        { modelId: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', isDefault: false, isFallback: true, provider: 'google' },
        { modelId: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', isDefault: false, provider: 'google' }
      ], { headers: MODEL_CACHE_HEADERS });
    }
    
    return NextResponse.json(models, { headers: MODEL_CACHE_HEADERS });
  } catch (error) {
    console.error("Error fetching AI models:", error);
    // Fallback on error
    return NextResponse.json([
      { modelId: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', isDefault: true },
      { modelId: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', isDefault: false }
    ], { headers: MODEL_CACHE_HEADERS });
  }
}
