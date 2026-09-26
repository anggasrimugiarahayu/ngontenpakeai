const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const features = [
    { name: "Ruang Belajar", description: "Akses ke seluruh kelas dan materi." },
    { name: "Ruang Ngonten", description: "Bantuan AI untuk membuat konten." },
    { name: "Ruang Growing", description: "Analisa pertumbuhan akun." },
  ];

  for (const f of features) {
    await prisma.feature.upsert({
      where: { name: f.name },
      update: {},
      create: f,
    });
  }
  console.log("Seeding features done!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
