import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const styles = await prisma.carouselStyleArt.findMany({ where: { isActive: true } });
    styles.sort((a, b) => a.kode.localeCompare(b.kode, undefined, { numeric: true, sensitivity: 'base' }));
    
    const fonts = await prisma.carouselFont.findMany({ where: { isActive: true } });
    fonts.sort((a, b) => a.kode.localeCompare(b.kode, undefined, { numeric: true, sensitivity: 'base' }));

    return NextResponse.json({ styles, fonts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
