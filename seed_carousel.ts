import { PrismaClient } from '@prisma/client';
import { STYLE_ART_DATA } from './src/lib/constants/carousel-style-arts';
import { FONT_OPTIONS } from './src/lib/constants/carousel-fonts';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Carousel Style Arts...');
  
  for (const [key, description] of Object.entries(STYLE_ART_DATA)) {
    const parts = key.split('/').map(p => p.trim());
    const kode = parts[0]; 
    const rawName = parts.length > 2 ? parts[2] : parts[1]; 
    const namaLabel = `${kode} - ${rawName}`;
    
    await prisma.carouselStyleArt.upsert({
      where: { kode },
      update: { namaLabel, deskripsiPrompt: description },
      create: { kode, namaLabel, deskripsiPrompt: description },
    });
  }

  console.log('Seeding Carousel Fonts...');
  
  for (const font of FONT_OPTIONS) {
    const parts = font.split('/');
    const kode = parts[0].trim(); 
    const rawName = parts[1] ? parts[1].split(':')[0].trim() : kode; 
    const namaLabel = `${kode} - ${rawName}`; 
    
    await prisma.carouselFont.upsert({
      where: { kode },
      update: { namaLabel, deskripsiPrompt: font },
      create: { kode, namaLabel, deskripsiPrompt: font },
    });
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
