import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const models = await prisma.aiModel.findMany({
      where: { isActive: true },
      orderBy: { name: 'desc' }
    });
    
    // Fallback if database is empty
    if (models.length === 0) {
      return NextResponse.json([
        { modelId: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', isDefault: true },
        { modelId: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', isDefault: false },
        { modelId: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', isDefault: false }
      ]);
    }
    
    return NextResponse.json(models);
  } catch (error) {
    console.error("Error fetching AI models:", error);
    // Fallback on error
    return NextResponse.json([
      { modelId: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', isDefault: true },
      { modelId: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', isDefault: false }
    ]);
  }
}
