import { PrismaClient } from '@prisma/client';
import { EVERGREEN_NICHES } from '../src/lib/niche-references';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding niche references...");
  
  // Clean up existing
  await prisma.nicheReference.deleteMany();

  for (const niche of EVERGREEN_NICHES) {
    await prisma.nicheReference.create({
      data: {
        nama: niche.niche_topik,
        data: niche
      }
    });
  }
  
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
